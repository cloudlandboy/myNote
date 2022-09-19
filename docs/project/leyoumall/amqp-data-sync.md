# 基于AMQP对项目改造

接下来，我们就改造项目，实现搜索服务、商品静态页的数据同步。

### 思路分析

> 发送方：商品微服务

- 什么时候发？

  当商品服务对商品进行写操作：增、删、改的时候，需要发送一条消息，通知其它服务。

- 发送什么内容？

  对商品的增删改时其它服务可能需要新的商品数据，但是如果消息内容中包含全部商品信息，数据量太大，而且并不是每个服务都需要全部的信息。因此我们**只发送商品id**，其它服务可以根据id查询自己需要的信息。

> 接收方：搜索微服务、静态页微服务

接收消息后如何处理？

- 搜索微服务：
  - 增/改：添加新的数据到索引库 
  - 删：删除索引库数据
- 静态页微服务：
  - 增/改：创建新的静态页
  - 删：删除原来的静态页



### 商品服务发送消息

我们先在商品微服务`leyou-item-service`中实现发送消息。

#### 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### 配置文件

我们在application.yml中添加一些有关RabbitMQ的配置：

```yaml
spring:
  rabbitmq:
    host: 172.16.145.141
    username: leyou
    password: 123456
    virtual-host: /leyou
    template:
      exchange: leyou.item.exchange
    publisher-confirms: true
```

- template：有关`AmqpTemplate`的配置
  - exchange：缺省的交换机名称，此处配置后，发送消息如果不指定交换机就会使用这个
- publisher-confirms：生产者确认机制，确保消息会正确发送，如果发送失败会有错误回执，从而触发重试



#### 改造GoodsService

在GoodsService中封装一个发送消息到mq的方法：**（需要注入AmqpTemplate模板）**

```java
private void sendMessage(Long id, String type) {
    try {
        amqpTemplate.convertAndSend("item." + type, id);
    } catch (AmqpException e) {
        LOGGER.error("发送消息失败，消息类型：{}，商品id：{}", "item." + type, id);
    }
}
```

这里没有指定交换机，因此默认发送到了配置中的：`leyou.item.exchange`

**注意：这里要把所有异常都try起来，不能让消息的发送影响到正常的业务逻辑**



然后在新增的时候调用：

![1532768930797](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307197.png)

修改的时候调用：

![1532769005960](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307248.png)



### 搜索服务接收消息

搜索服务接收到消息后要做的事情：

- 增：添加新的数据到索引库
- 删：删除索引库数据
- 改：修改索引库数据

因为索引库的新增和修改方法是合二为一的，因此我们可以将这两类消息一同处理，删除另外处理。

#### 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### 添加配置

```yaml
spring:
  rabbitmq:
    host: 172.16.145.141
    virtual-host: /leyou
    username: leyou
    password: 123456
```

这里只是接收消息而不发送，所以不用配置template相关内容。

#### 编写监听器

 ![1532769181819](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307299.png)

代码：

```java
@Component
public class GoodsListener {

    @Autowired
    private SearchService searchService;

    /**
     * 处理insert和update消息
     *
     * @param id
     */
    @RabbitListener(
            bindings = @QueueBinding(
                    value = @Queue(value = "LEYOU.CREATE.INDEX.QUEUE", durable = "true"),
                    exchange = @Exchange(value = "LEYOU.ITEM.EXCHANGE", ignoreDeclarationExceptions = "true", type = ExchangeTypes.TOPIC),
                    key = {"item.insert", "item.update"}
            )
    )
    public void listenCreate(Long id) throws IOException {
        if (id == null) {
            return;
        }
        // 创建或更新索引
        this.searchService.createIndex(id);
    }

    /**
     * 处理delete消息
     *
     * @param id
     * @throws IOException
     */
    @RabbitListener(
            bindings = @QueueBinding(
                    value = @Queue(value = "LEYOU.DELETE.INDEX.QUEUE", durable = "true"),
                    exchange = @Exchange(value = "LEYOU.ITEM.EXCHANGE", ignoreDeclarationExceptions = "true", type = ExchangeTypes.TOPIC),
                    key = {"item.delete"}
            )
    )
    public void listenDelete(Long id) throws IOException {
        if (id == null) {
            return;
        }
        // 创建或更新索引
        this.searchService.deleteIndex(id);
    }
}
```



#### 编写创建和删除索引方法

这里因为要创建和删除索引，我们需要在SearchService中拓展两个方法，创建和删除索引：

```java
@Override
public void createIndex(Long id) throws IOException {
    //查询spu
    Spu spu = this.goodsClient.querySpuById(id);
    Goods goods = this.buildGoods(spu);
    //保存
    this.goodsRepository.save(goods);
}

@Override
public void deleteIndex(Long id) {
    this.goodsRepository.deleteById(id);
}
```

创建索引的方法可以从之前导入数据的测试类中拷贝和改造。



### 静态页服务接收消息

商品静态页服务接收到消息后的处理：

- 增：创建新的静态页
- 删：删除原来的静态页
- 改：创建新的静态页并覆盖原来的

不过，我们编写的创建静态页的方法也具备覆盖以前页面的功能，因此：增和改的消息可以放在一个方法中处理，删除消息放在另一个方法处理。

#### 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### 添加配置

```yaml
spring:
  rabbitmq:
    host: 172.16.145.141
    username: leyou
    password: 123456
    virtual-host: /leyou
```

这里只是接收消息而不发送，所以不用配置template相关内容。



#### 编写监听器

 ![1532769581964](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307352.png)

代码：

```java
@Component
public class GoodsListener {

    @Autowired
    private GoodsHtmlService goodsHtmlService;

    @Autowired
    private GoodsService goodsService;

    @RabbitListener(
            bindings = @QueueBinding(
                    value = @Queue(value = "LEYOU.CREATE.WEB.QUEUE", durable = "true"),
                    exchange = @Exchange(value = "LEYOU.ITEM.EXCHANGE", ignoreDeclarationExceptions = "true", type = ExchangeTypes.TOPIC),
                    key = {"item.insert", "item.update"}
            )
    )
    public void listenCreate(Long id) throws Exception {
        if (id == null) {
            return;
        }

        //获取数据
        Map<String, Object> data = goodsService.loadData(id);
        // 创建页面
        goodsHtmlService.createHtml(data);
    }

    @RabbitListener(
            bindings = @QueueBinding(
                    value = @Queue(value = "LEYOU.DELETE.WEB.QUEUE", durable = "true"),
                    exchange = @Exchange(value = "LEYOU.ITEM.EXCHANGE", ignoreDeclarationExceptions = "true", type = ExchangeTypes.TOPIC),
                    key = {"item.delete"}
            )
    )
    public void listenDelete(Long id) {
        if (id == null) {
            return;
        }
        // 删除页面
        goodsHtmlService.deleteHtml(id);
    }
}
```

#### 添加删除页面方法

```java
@Override
public void deleteHtml(Long id) {
    File file = new File("/home/cloudlandboy/Project/leyou/html/item/", id + ".html");
    file.deleteOnExit();
}
```



### 测试



重新启动项目，并且登录RabbitMQ管理界面

可以看到，交换机已经创建出来了：

![1576379783664](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320715.png)

队列也已经创建完毕：

![1576379822464](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320766.png)

并且队列都已经绑定到交换机：

![1576379878542](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320819.png)

在后台修改商品数据的价格，分别在搜索及商品详情页查看是否统一。