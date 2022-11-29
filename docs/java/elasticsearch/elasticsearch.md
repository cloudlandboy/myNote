# Elasticsearch介绍和安装

用户访问我们的首页，一般都会直接搜索来寻找自己想要购买的商品。

而商品的数量非常多，而且分类繁杂。如何能正确的显示出用户想要的商品，并进行合理的过滤，尽快促成交易，是搜索系统要研究的核心。

面对这样复杂的搜索业务和数据量，使用传统数据库搜索就显得力不从心，一般我们都会使用全文检索技术，比如之前大家学习过的Solr。

不过今天，我们要讲的是另一个全文检索技术：Elasticsearch。



## 简介

Elastic官网：https://www.elastic.co/cn/

Elastic有一条完整的产品线及解决方案：Elasticsearch、Kibana、Logstash等，前面说的三个就是大家常说的ELK技术栈。

![1528546493105](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213774.png)



Elasticsearch官网：https://www.elastic.co/cn/products/elasticsearch

![1528547087016](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214214.png)

如上所述，Elasticsearch具备以下特点：

- 分布式，无需人工搭建集群（solr就需要人为配置，使用Zookeeper作为注册中心）
- Restful风格，一切API都遵循Rest原则，容易上手
- 近实时搜索，数据更新在Elasticsearch中几乎是完全同步的。



## 安装和配置

为了模拟真实场景，我们将在linux下安装Elasticsearch。

需要虚拟机JDK1.8及以上，为了方便直接安装openjdk

``` shell
yum install java-1.8.0-openjdk -y
```



### 新建一个用户leyou

出于安全考虑，elasticsearch默认不允许以root账号运行。

创建用户：

``` shell
useradd leyou
```

设置密码：

``` shell
passwd leyou
```

切换用户：

``` shell
su leyou
```



### 上传安装包,并解压

安装包下载：<https://www.elastic.co/cn/downloads/elasticsearch>

本例安装版本：[7.5.0](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.5.0-linux-x86_64.tar.gz)

我们将安装包上传到：/home/leyou目录

![1575688892599](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225913.png)

解压缩：

``` shell
tar -xvf elasticsearch-7.5.0-linux-x86_64.tar.gz
```



我们把目录重命名：

``` shell
mv elasticsearch-7.5.0 elasticsearch
```

进入，查看目录结构：

![1575689517800](https://cdn.tencentfs.clboy.cn/images/2021/20210911203226153.png)



### 修改配置

我们进入config目录：`cd config`

需要修改的配置文件有两个：

![1575689599055](https://cdn.tencentfs.clboy.cn/images/2021/20210911203226606.png)

1. **jvm.options**

   Elasticsearch基于Lucene的，而Lucene底层是java实现，因此我们需要配置jvm参数。

   编辑jvm.options：

   ```
   vim jvm.options
   ```

   默认配置如下：

   ```
   -Xms1g
   -Xmx1g
   ```

   内存占用太多了，我们调小一些：

   ```
   -Xms512m
   -Xmx512m
   ```

   

2. **elasticsearch.yml**

   ```shell
   vim elasticsearch.yml
   ```

   修改数据和日志目录：

   ```
   path.data: /home/leyou/elasticsearch/data # 数据目录位置
   path.logs: /home/leyou/elasticsearch/logs # 日志目录位置
   ```

   

我们把data和logs目录修改指向了elasticsearch的安装目录。但是data目录并不存在，因此我们需要创建出来。

进入elasticsearch的根目录，然后创建：

``` shell
mkdir data
```



修改绑定的ip：

```shell
vim config/elasticsearch.yml
```

``` shell
network.host: 0.0.0.0 # 绑定到0.0.0.0，允许任何ip来访问
```

默认只允许本机访问，修改为0.0.0.0后则可以远程访问



目前我们是做的单机安装，如果要做集群，只需要在这个配置文件中添加其它节点信息即可。

> elasticsearch.yml的其它可配置信息：

| 属性名                             | 说明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| cluster.name                       | 配置elasticsearch的集群名称，默认是elasticsearch。建议修改成一个有意义的名称。 |
| node.name                          | 节点名，es会默认随机指定一个名字，建议指定一个有意义的名称，方便管理 |
| path.conf                          | 设置配置文件的存储路径，tar或zip包安装默认在es根目录下的config文件夹，rpm安装默认在/etc/ elasticsearch |
| path.data                          | 设置索引数据的存储路径，默认是es根目录下的data文件夹，可以设置多个存储路径，用逗号隔开 |
| path.logs                          | 设置日志文件的存储路径，默认是es根目录下的logs文件夹         |
| path.plugins                       | 设置插件的存放路径，默认是es根目录下的plugins文件夹          |
| bootstrap.memory_lock              | 设置为true可以锁住ES使用的内存，避免内存进行swap             |
| network.host                       | 设置bind_host和publish_host，设置为0.0.0.0允许外网访问       |
| http.port                          | 设置对外服务的http端口，默认为9200。                         |
| transport.tcp.port                 | 集群结点之间通信端口                                         |
| discovery.zen.ping.timeout         | 设置ES自动发现节点连接超时的时间，默认为3秒，如果网络延迟高可设置大些 |
| discovery.zen.minimum_master_nodes | 主结点数量的最少值 ,此值的公式为：(master_eligible_nodes / 2) + 1 ，比如：有3个符合要求的主结点，那么这里要设置为2 |
|                                    |                                                              |



## 运行

进入elasticsearch/bin目录，可以看到下面的执行文件：

![1528553103468](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214630.png)

然后输入命令：

```
./elasticsearch
```



## 错误解决

我这里是报了两个错误

![1575691696557](https://cdn.tencentfs.clboy.cn/images/2021/20210911203227064.png)

### 错误1：内核过低

![1528598315714](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215050.png)

如果使用的是centos6，其linux内核版本为2.6。而Elasticsearch的插件要求至少3.5以上版本。不过没关系，我们禁用这个插件即可。

修改elasticsearch.yml文件，在最下面添加如下配置：

``` shell
bootstrap.system_call_filter: false
```

然后重启



### 错误2：文件权限不足

再次启动，又出错了：

![1528599116836](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215465.png)

```
[1]: max file descriptors [4096] for elasticsearch process likely too low, increase to at least [65536]
```

我们用的是leyou用户，而不是root，所以文件权限不足。

**首先用root用户登录。**

然后修改配置文件:

``` shell
vim /etc/security/limits.conf
```

添加下面的内容：

```
* soft nofile 65536

* hard nofile 131072

* soft nproc 4096

* hard nproc 4096
```

![1575691013330](https://cdn.tencentfs.clboy.cn/images/2021/20210911203226834.png)



### 错误3：线程数不够

```
[1]: max number of threads [1024] for user [leyou] is too low, increase to at least [4096]
```

这是线程数不够。

继续修改配置：

``` shell
vim /etc/security/limits.d/90-nproc.conf 
```

修改下面的内容：

```
* soft nproc 1024
```

改为：

```
* soft nproc 4096
```



### 错误4：进程虚拟内存

```
[3]: max virtual memory areas vm.max_map_count [65530] likely too low, increase to at least [262144]
```

vm.max_map_count：限制一个进程可以拥有的VMA(虚拟内存区域)的数量，继续修改配置文件， ：

``` shell
vim /etc/sysctl.conf 
```

添加下面内容：

```
vm.max_map_count=655360
```

然后执行命令：

``` shell
sysctl -p
```



### 错误5：默认设置

```
the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
```

修改 elasticsearch.yml 

取消注释保留一个节点 

```
cluster.initial_master_nodes: ["node-1"]
```

并将`node.name: "node-1"`的注释打开

![1575691909846](https://cdn.tencentfs.clboy.cn/images/2021/20210911203227322.png)



### 重启终端窗口

所有错误修改完毕，一定要重启你的连接终端，否则配置无效(我这里没有重启完全ok)。



### 启动

> 运行 `bin/elasticsearch`
>
> 后台运行加上-d参数 `./bin/elasticsearch -d`
>
> 参考：https://www.elastic.co/guide/en/elasticsearch/reference/{版本号}/starting-elasticsearch.html
>
> https://www.elastic.co/guide/en/elasticsearch/reference/current/starting-elasticsearch.html



可以看到绑定了两个端口:

- 9300：集群节点间通讯接口
- 9200：客户端访问接口

在浏览器中访问：http://172.16.145.141:9200

![1575692385353](https://cdn.tencentfs.clboy.cn/images/2021/20210911203227563.png)



## 安装kibana

### 什么是Kibana？

![1528603530298](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216323.png)

Kibana是一个基于Node.js的Elasticsearch索引数据统计工具，可以利用Elasticsearch的聚合功能，生成各种图表，如柱形图，线状图，饼图等。

而且还提供了操作Elasticsearch索引数据的控制台，并且提供了一定的API提示，非常有利于我们学习Elasticsearch的语法。



### 安装

因为Kibana依赖于node，我们的虚拟机没有安装node，而开发系统中安装过。所以我们选择在开发系统下使用kibana。

与elasticsearch保持一致，也是7.5.0

下载地址：<https://www.elastic.co/cn/downloads/kibana>

[7.5.0(windows)](https://artifacts.elastic.co/downloads/kibana/kibana-7.5.0-windows-x86_64.zip)

[7.5.0(linux)](https://artifacts.elastic.co/downloads/kibana/kibana-7.5.0-linux-x86_64.tar.gz)

解压到特定目录即可



### 配置运行

> 配置

进入安装目录下的config目录，修改kibana.yml文件：

修改elasticsearch服务器的地址：

```
elasticsearch.hosts: ["http://172.16.145.141:9200"]
```

![1575694106458](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228027.png)

> 运行

进入安装目录下的bin目录：

双击运行：

发现kibana的监听端口是5601

我们访问：http://127.0.0.1:5601



### 控制台

选择左侧的DevTools菜单，即可进入控制台页面：

![1575699703179](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228260.png)



在页面右侧，我们就可以输入请求，访问Elasticsearch了。

![1528612514556](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218365.png)



## 安装ik分词器

Lucene的IK分词器早在2012年已经没有维护了，现在我们要使用的是在其基础上维护升级的版本，并且开发为ElasticSearch的集成插件了，与Elasticsearch一起维护升级，版本也保持一致

下载地址：<https://github.com/medcl/elasticsearch-analysis-ik/releases>

[v7.5.0](https://github.com/medcl/elasticsearch-analysis-ik/releases/tag/v7.5.0)

### 安装

将下载后的压缩包上传的elasticsearch目录的plugins目录下

![1575693444894](https://cdn.tencentfs.clboy.cn/images/2021/20210911203227794.png)

使用unzip命令解压：

```shell
unzip elasticsearch-analysis-ik-7.5.0.zip -d ik-analyzer
```

将压缩包删除

```shell
rm -rf elasticsearch-analysis-ik-7.5.0.zip
```

然后重启elasticsearch：



### 两种分词模式

> ik分词器有两种分词模式：`ik_max_word`和 `ik_smart`模式。

- `ik_max_word`

  会将文本做最细粒度的拆分，比如会将“中华人民共和国人民大会堂”拆分为“中华人民共和国、中华人民、中华、华人、人民共和国、人民、共和国、大会堂、大会、会堂等词语。

- `ik_smart`

  会做最粗粒度的拆分，比如会将“中华人民共和国人民大会堂”拆分为中华人民共和国、人民大会堂。

### 测试

大家先不管语法，我们先测试一波。

在kibana控制台输入下面的请求：

``` http
POST _analyze
{
  "analyzer": "ik_max_word",
  "text":     "我是中国人"
}
```

运行得到结果：

```
{
  "tokens": [
    {
      "token": "我",
      "start_offset": 0,
      "end_offset": 1,
      "type": "CN_CHAR",
      "position": 0
    },
    {
      "token": "是",
      "start_offset": 1,
      "end_offset": 2,
      "type": "CN_CHAR",
      "position": 1
    },
    {
      "token": "中国人",
      "start_offset": 2,
      "end_offset": 5,
      "type": "CN_WORD",
      "position": 2
    },
    {
      "token": "中国",
      "start_offset": 2,
      "end_offset": 4,
      "type": "CN_WORD",
      "position": 3
    },
    {
      "token": "国人",
      "start_offset": 3,
      "end_offset": 5,
      "type": "CN_WORD",
      "position": 4
    }
  ]
}
```

### 自定义词库

如果要让分词器支持一些专有词语，可以自定义词库。

iK分词器自带一个main.dic的文件，此文件为词库文件。在 `ik-analyzer/config` 文件夹下

1. 新建一个文件为`xxx.dic`，注意文件格式为utf-8 无BOM格式
2. 可以在其中自定义词汇
3. 然后在配置文件(`IKAnalyzer.cfg.xml`)中配上`xxx.dic`



## API

Elasticsearch提供了Rest风格的API，即http请求接口，而且也提供了各种语言的客户端API

### Rest风格API

文档地址：https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html

![1526518410240](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228489.png)



### 客户端API

Elasticsearch支持的客户端非常多：https://www.elastic.co/guide/en/elasticsearch/client/index.html

![1575799485401](https://cdn.tencentfs.clboy.cn/images/2021/20210911203233126.png)

点击Java Rest Client后，你会发现又有两个：

![1575700319129](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228723.png)



Low Level Rest Client是低级别封装，提供一些基础功能，但更灵活

High Level Rest Client，是在Low  Level Rest Client基础上进行的高级别封装，功能更丰富和完善，而且API会变的简单



### 如何学习

建议先学习Rest风格API，了解发起请求的底层实现，请求体格式等。



## 操作索引

### 基本概念

Elasticsearch也是基于Lucene的全文检索库，本质也是存储数据，很多概念与MySQL类似的。

对比关系：

```
索引（indices）--------------------------------Databases 数据库

  类型（type）-----------------------------Table 数据表

     文档（Document）----------------Row 行

	   字段（Field）-------------------Columns 列 
```



详细说明：

| 概念                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| 索引（indices)       | indices是index的复数，代表许多的索引，                       |
| 类型（type）         | 类型是模拟mysql中的table概念，一个索引下可以有不同类型的索引，比如商品索引，订单索引，其数据格式不同。不过这会导致索引混乱，因此未来版本中会移除这个概念 |
| 文档（document）     | 存入索引原始的数据。比如每一条商品信息，就是一个文档         |
| 字段（field）        | 文档中的属性                                                 |
| 映射配置（mappings） | 字段的数据类型、属性、是否索引、是否存储等特性               |



是不是与Lucene和solr中的概念类似。

另外，在SolrCloud中，有一些集群相关的概念，在Elasticsearch也有类似的：

- 索引集（Indices，index的复数）：逻辑上的完整索引 collection1 
- 分片（shard）：数据拆分后的各个部分
- 副本（replica）：每个分片的复制



要注意的是：Elasticsearch本身就是分布式的，因此即便你只有一个节点，Elasticsearch默认也会对你的数据进行分片和副本操作，当你向集群添加新数据时，数据也会在新加入的节点中进行平衡。



### 创建索引

#### 语法

Elasticsearch采用Rest风格API，因此其API就是一次http请求，你可以用任何工具发起http请求

创建索引的请求格式：

- 请求方式：PUT

- 请求路径：/索引名

- 请求参数：json格式：

  ```json
  {
      "settings": {
          "number_of_shards": 3,
          "number_of_replicas": 2
        }
  }
  ```

  - settings：索引的设置
    - number_of_shards：分片数量
    - number_of_replicas：副本数量



#### 测试

我们先用postman来试试

![1575701088205](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228957.png)

可以看到索引创建成功了。

#### 使用kibana创建

kibana的控制台，可以对http请求进行简化，示例：

![1575701204108](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229196.png)

相当于是省去了elasticsearch的服务器地址

而且还有语法提示，非常舒服。



#### 查看索引设置

> 语法

Get请求可以帮我们查看索引信息，格式：

``` http
GET /索引名
```

![1575701240770](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229430.png)



或者，我们可以使用*来查询所有索引配置：

![1575701380020](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229698.png)



#### 删除索引

删除索引使用DELETE请求

> 语法

``` http
DELETE /索引名
```

> 示例

![1575701496926](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229928.png)

再次查看test_store2：

![1575701520758](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230161.png)

当然，我们也可以用HEAD请求，查看索引是否存在：

![1575701568204](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230398.png)



## 映射配置

索引有了，接下来肯定是添加数据。但是，在添加数据之前必须定义映射。

什么是映射？

> 映射是定义文档的过程，文档包含哪些字段，这些字段是否保存，是否索引，是否分词等

只有配置清楚，Elasticsearch才会帮我们进行索引的创建（不一定）



### 创建映射字段

> 语法

请求方式依然是PUT 

``` http
PUT /索引库名/_mapping/类型名称
{
  "properties": {
    "字段名": {
      "type": "类型",
      "index": true，
      "store": true，
      "analyzer": "分词器"
    }
  }
}
```

- 类型名称：就是前面讲的type的概念，类似于数据库中的不同表（已经不建议使用，7.x版本中需要配置，8.x后就会被删除）![1575713163395](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230917.png)

   字段名：任意填写	，可以指定许多属性，例如：

- type：类型，可以是text、long、short、date、integer、object等

- index：是否索引，默认为true

- store：是否存储，默认为false

- analyzer：分词器，这里的`ik_max_word`即使用ik分词器

> 示例

发起请求：

``` http
PUT test_store/_mapping/goods
{
  "properties": {
    "title": {
      "type": "text",
      "analyzer": "ik_max_word"
    },
    "images": {
      "type": "keyword",
      "index": "false"
    },
    "price": {
      "type": "float"
    }
  }
}
```

响应结果：

![1575716451704](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231153.png)

原因：

![1575712906329](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230664.png)

解决

``` http
PUT test_store/_mapping/goods?include_type_name=true
{
  "properties": {
    "title": {
      "type": "text",
      "analyzer": "ik_max_word"
    },
    "images": {
      "type": "keyword",
      "index": "false"
    },
    "price": {
      "type": "float"
    }
  }
}
```

![1575716526696](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231384.png)

可以用下面的方式替代（后面都不再使用7以前的语法）

``` http
PUT test_store/_mapping
{
  "properties": {
    "goods": {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "ik_max_word"
        },
        "images": {
          "type": "keyword",
          "index": "false"
        },
        "price": {
          "type": "float"
        }
      }
    }
  }
}
```



### 查看映射关系

> 语法：

``` http
GET /索引名/_mapping
```

> 示例：

``` http
GET /test_store/_mapping
```

> 响应：

```json
{
  "test_store": {
    "mappings": {
      "goods": {
        "properties": {
          "images": {
            "type": "keyword",
            "index": false
          },
          "price": {
            "type": "float"
          },
          "title": {
            "type": "text",
            "analyzer": "ik_max_word"
          }
        }
      }
    }
  }
}
```



### 字段属性详解

#### type

Elasticsearch中支持的数据类型非常丰富：

![1531712631982](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219539.png)

我们说几个关键的：

- String类型，又分两种：

  - text：可分词，不可参与聚合
  - keyword：不可分词，数据会作为完整字段进行匹配，可以参与聚合

- Numerical：数值类型，分两类

  - 基本数据类型：long、interger、short、byte、double、float、half_float
  - 浮点数的高精度类型：scaled_float
    - 需要指定一个精度因子，比如10或100。elasticsearch会把真实值乘以这个因子后存储，取出时再还原。

- Date：日期类型

  elasticsearch可以对日期格式化为字符串存储，但是建议我们存储为毫秒值，存储为long，节省空间。



#### index

index影响字段的索引情况。

- true：字段会被索引，则可以用来进行搜索。默认值就是true
- false：字段不会被索引，不能用来搜索

index的默认值就是true，也就是说你不进行任何配置，所有字段都会被索引。

但是有些字段是我们不希望被索引的，比如商品的图片信息，就需要手动设置index为false。

#### store

是否将数据进行额外存储。

在学习lucene和solr时，我们知道如果一个字段的store设置为false，那么在文档列表中就不会有这个字段的值，用户的搜索结果中不会显示出来。

但是在Elasticsearch中，即便store设置为false，也可以搜索到结果。

原因是Elasticsearch在创建文档索引时，会将文档中的原始数据备份，保存到一个叫做`_source`的属性中。而且我们可以通过过滤`_source`来选择哪些要显示，哪些不显示。

而如果设置store为true，就会在`_source`以外额外存储一份数据，多余，因此一般我们都会将store设置为false，事实上，**store的默认值就是false。**



#### boost

激励因子，这个与lucene中一样

其它的不再一一讲解，用的不多，参考官方文档：

![1531713176079](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219823.png)



## 新增数据

### 随机生成id

通过POST请求，可以向一个已经存在的索引中添加数据。

> 语法：

``` http
POST /索引库名/_doc
{
    "key":"value"
}
```

> 示例：

``` http
POST test_store/_doc
{
  "goods": {
    "title":"小米手机",
    "images":"http://image.leyou.com/12479122.jpg",
    "price":2699.00
  }
}
```

响应：

```json
{
  "_index" : "test_store",
  "_type" : "_doc",
  "_id" : "wa923W4BPaxfFKWjLa43",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 3,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}

```

![1575719394535](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231620.png)

通过kibana查看数据：

``` http
GET test_store/_search
{
  "query": {
    "match_all": {}
  }
}
```



```json
{
  "_index" : "test_store",
  "_type" : "_doc",
  "_id" : "wK9p3W4BPaxfFKWjSK7K",
  "_score" : 1.0,
  "_source" : {
    "goods" : {
      "title" : "小米手机",
      "images" : "http://image.leyou.com/12479122.jpg",
      "price" : 2699.0
    }
  }
}
```

- `_source`：源文档信息，所有的数据都在里面。
- `_id`：这条文档的唯一标示，与文档自己的id字段没有关联



### 自定义id

如果我们想要自己新增的时候指定id，可以这么做：

``` http
PUT /索引名/_doc/id值
{
    ...
}

```

示例：

``` http
PUT test_store/_doc/123
{
  "goods": {
    "title":"红米手机",
    "images":"http://image.leyou.com/12479122.jpg",
    "price":999.00
  }
}
```

得到的数据：

```json
{
  "_index" : "test_store",
  "_type" : "_doc",
  "_id" : "123",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 3,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 2,
  "_primary_term" : 1
}

```



### 智能判断

在学习Solr时我们发现，我们在新增数据时，只能使用提前配置好映射属性的字段，否则就会报错。

不过在Elasticsearch中并没有这样的规定。

事实上Elasticsearch非常智能，你不需要给索引设置任何mapping映射，它也可以根据你输入的数据来判断类型，动态添加数据映射。

测试一下：

``` http
put /test_store/_doc/3
{
    "goods": {
        "title":"超米手机",
        "images":"http://image.leyou.com/12479122.jpg",
        "price":2899.00,
        "stock": 200,
        "saleable":true
    }
}
```

我们额外添加了stock库存，和saleable是否上架两个字段。

来看结果：

```json
{
  "_index": "test_store",
  "_type": "goods",
  "_id": "3",
  "_version": 1,
  "_score": 1,
  "_source": {
    "title": "超米手机",
    "images": "http://image.leyou.com/12479122.jpg",
    "price": 2899,
    "stock": 200,
    "saleable": true
  }
}
```

在看下索引的映射关系:

```json
{
  "test_store" : {
    "mappings" : {
      "properties" : {
        "goods" : {
          "properties" : {
            "images" : {
              "type" : "keyword",
              "index" : false
            },
            "price" : {
              "type" : "float"
            },
            "saleable" : {
              "type" : "boolean"
            },
            "stock" : {
              "type" : "long"
            },
            "title" : {
              "type" : "text",
              "analyzer" : "ik_max_word"
            }
          }
        }
      }
    }
  }
}
```

stock和saleable都被成功映射了。

## 修改数据

请求方式为PUT，指定id

- id对应文档存在，则修改
- id对应文档不存在，则新增

比如，我们把id为3的数据进行修改：

``` http
put /test_store/_doc/3
{
    "goods": {
        "title":"超大米手机",
        "images":"http://image.leyou.com/12479122.jpg",
        "price":9999.00,
        "stock": 2,
        "saleable":true
    }
}
```

结果：

```json
{
  "_index" : "test_store",
  "_type" : "_doc",
  "_id" : "3",
  "_version" : 2,
  "result" : "updated",	//新增这里是created
  "_shards" : {
    "total" : 3,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 13,
  "_primary_term" : 1
}

```



## 删除数据

删除使用DELETE请求，同样，需要根据id进行删除：

> 语法

``` http
DELETE /索引名/_doc/id值
```

> 示例：

``` http
DELETE /test_store/_doc/3
```

![1575724835670](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231874.png)



## 查询

我们从4块来讲查询：

- 基本查询
- `_source`过滤
- 结果过滤
- 高级查询
- 排序



### 基本查询

> 基本语法

``` http
GET /索引名/_search
{
    "query":{
        "查询类型":{
            "查询条件":"查询条件值"
        }
    }
}
```

这里的query代表一个查询对象，里面可以有不同的查询属性

- 查询类型：
  - 例如：`match_all`， `match`，`term` ， `range` 等等
- 查询条件：查询条件会根据类型的不同，写法也有差异，后面详细讲解



### 查询所有（match_all)

> 示例：

``` http
GET /test_store/_search
{
    "query":{
        "match_all": {}
    }
}
```

- `query`：代表查询对象
- `match_all`：代表查询所有

> 结果：

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 3,
    "successful": 3,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1,
    "hits": [
      {
        "_index": "test_store",
        "_type": "goods",
        "_id": "2",
        "_score": 1,
        "_source": {
          "title": "大米手机",
          "images": "http://image.leyou.com/12479122.jpg",
          "price": 2899
        }
      },
      {
        "_index": "test_store",
        "_type": "goods",
        "_id": "r9c1KGMBIhaxtY5rlRKv",
        "_score": 1,
        "_source": {
          "title": "小米手机",
          "images": "http://image.leyou.com/12479122.jpg",
          "price": 2699
        }
      }
    ]
  }
}
```

- `took`：查询花费时间，单位是毫秒
- `time_out`：是否超时
- `_shards`：分片信息
- `hits`：搜索结果总览对象
  - `total`：搜索到的总条数
  - `max_score`：所有结果中文档得分的最高分
  - `hits`：搜索结果的文档对象数组，每个元素是一条搜索到的文档信息
    - `_index`：索引
    - `_type`：文档类型
    - `_id`：文档id
    - `_score`：文档得分
    - `_source`：文档的源数据



### 匹配查询（match）

我们先加入一条数据，便于测试：

``` http
PUT /test_store/_doc/3
{
    "goods": {
        "title":"小米电视4A",
        "images":"http://image.leyou.com/12479122.jpg",
        "price":3899.00
    }
}
```

现在，索引中有2部手机，1台电视：

 ![1531728628406](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220113.png)

- or关系

`match`类型查询，会把查询条件进行分词，然后进行查询,多个词条之间是or的关系

``` http
GET /test_store/_search
{
  "query": {
    "match": {
      "goods.title": "小米电视"
    }
  }
}
```

结果：

```json
"hits": {
    "total": 2,
    "max_score": 0.6931472,
    "hits": [
        {
            "_index": "test_store",
            "_type": "goods",
            "_id": "tmUBomQB_mwm6wH_EC1-",
            "_score": 0.6931472,
            "_source": {
                "title": "小米手机",
                "images": "http://image.leyou.com/12479122.jpg",
                "price": 2699
            }
        },
        {
            "_index": "test_store",
            "_type": "goods",
            "_id": "3",
            "_score": 0.5753642,
            "_source": {
                "title": "小米电视4A",
                "images": "http://image.leyou.com/12479122.jpg",
                "price": 3899
            }
        }
    ]
}
```



在上面的案例中，不仅会查询到电视，而且与小米相关的都会查询到，多个词之间是`or`的关系。



- and关系

某些情况下，我们需要更精确查找，我们希望这个关系变成`and`，可以这样做：

``` http
GET /test_store/_search
{
  "query": {
    "match": {
      "goods.title": {
        "query": "小米电视",
        "operator": "and"
      }
    }
  }
}
```

结果：

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 3,
    "successful": 3,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.5753642,
    "hits": [
      {
        "_index": "test_store",
        "_type": "goods",
        "_id": "3",
        "_score": 0.5753642,
        "_source": {
          "title": "小米电视4A",
          "images": "http://image.leyou.com/12479122.jpg",
          "price": 3899
        }
      }
    ]
  }
}
```

本例中，只有同时包含`小米`和`电视`的词条才会被搜索到。



- or和and之间？

在 `or` 与 `and` 间二选一有点过于非黑即白。 如果用户给定的条件分词后有 5 个查询词项，想查找只包含其中 4 个词的文档，该如何处理？将 operator 操作符参数设置成 `and` 只会将此文档排除。

有时候这正是我们期望的，但在全文搜索的大多数应用场景下，我们既想包含那些可能相关的文档，同时又排除那些不太相关的。换句话说，我们想要处于中间某种结果。

`match` 查询支持 `minimum_should_match` 最小匹配参数， 这让我们可以指定必须匹配的词项数用来表示一个文档是否相关。我们可以将其设置为某个具体数字，更常用的做法是将其设置为一个`百分数`，因为我们无法控制用户搜索时输入的单词数量：

``` http
GET /test_store/_search
{
  "query": {
    "match": {
      "goods.title": {
        "query": "小米曲面电视",
        "minimum_should_match": "75%"
      }
    }
  }
}
```

本例中，搜索语句可以分为3个词，如果使用and关系，需要同时满足3个词才会被搜索到。这里我们采用最小品牌数：75%，那么也就是说只要匹配到总词条数量的75%即可，这里3*75% 约等于2。所以只要包含2个词条就算满足条件了。

结果：

![1531730367614](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220426.png)



### 多字段查询（multi_match）

`multi_match`与`match`类似，不同的是它可以在多个字段中查询

``` http
GET /test_store/_search
{
  "query": {
    "multi_match": {
      "query": "小米",
      "fields": [ "goods.subTitle", "goods.title"]
    }
  }
}
```

新增一条记录

``` http
POST test_store/_doc
{
  "goods": {
    "title":"华为手机",
    "subTitle":"小米是小虾米",
    "images":"http://image.leyou.com/12479122.jpg",
    "price":2699.00
  }
}
```



本例中，我们会在title字段和subtitle字段中查询`小米`这个词



### 词条匹配(term)

`term` 查询被用于精确值 匹配，这些精确值可能是数字、时间、布尔或者那些**未分词**的字符串

``` http
GET /test_store/_search
{
    "query":{
        "term":{
            "goods.price":2699.00
        }
    }
}
```

结果：

```json
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 3,
    "successful" : 3,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0h_L3W4B8wuQh_T7P7Ij",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "title" : "小米手机",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 2699.0
          }
        }
      },
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0x_m3W4B8wuQh_T7UbLu",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "title" : "华为手机",
            "subTitle" : "小米是小虾米",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 2699.0
          }
        }
      }
    ]
  }
}

```



###  多词条精确匹配(terms)

`terms` 查询和 term 查询一样，但它允许你指定多值进行匹配。如果这个字段包含了指定值中的任何一个值，那么这个文档满足条件：

``` http
GET /test_store/_search
{
    "query":{
        "terms":{
            "goods.price":[2699.00,2899.00,3899.00]
        }
    }
}
```

结果：

```json
{
  "took" : 6,
  "timed_out" : false,
  "_shards" : {
    "total" : 3,
    "successful" : 3,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0h_L3W4B8wuQh_T7P7Ij",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "title" : "小米手机",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 2699.0
          }
        }
      },
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "title" : "小米电视4A",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 3899.0
          }
        }
      },
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0x_m3W4B8wuQh_T7UbLu",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "title" : "华为手机",
            "subTitle" : "小米是小虾米",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 2699.0
          }
        }
      }
    ]
  }
}

```



## 结果过滤

默认情况下，elasticsearch在搜索的结果中，会把文档中保存在`_source`的所有字段都返回。

如果我们只想获取其中的部分字段，我们可以添加`_source`的过滤

### 直接指定字段

示例：

``` http
GET /test_store/_search
{
  "_source": ["goods.title","goods.price"], 
  "query": {
    "term": {
      "goods.price": 2699
    }
  }
}
```

返回的结果：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 3,
    "successful" : 3,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0h_L3W4B8wuQh_T7P7Ij",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "price" : 2699.0,
            "title" : "小米手机"
          }
        }
      },
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0x_m3W4B8wuQh_T7UbLu",
        "_score" : 1.0,
        "_source" : {
          "goods" : {
            "price" : 2699.0,
            "title" : "华为手机"
          }
        }
      }
    ]
  }
}

```



### 指定includes和excludes

我们也可以通过：

- includes：来指定想要显示的字段
- excludes：来指定不想要显示的字段

二者都是可选的。

示例：

``` http
GET /test_store/_search
{
  "_source": {
    "includes": ["goods.title","goods.price"]
  }, 
  "query": {
    "term": {
      "goods.price": 2699
    }
  }
}
```

与下面的结果将是一样的：

``` http
GET /test_store/_search
{
  "_source": {
     "excludes": ["goods.images"]
  },
  "query": {
    "term": {
      "goods.price": 2699
    }
  }
}
```



## 高级查询

### 布尔组合（bool)

`bool`把各种其它查询通过`must`（与）、`must_not`（非）、`should`（或）的方式进行组合

``` http
GET /test_store/_search
{
    "query":{
        "bool":{
        	"must":     { "match": { "goods.title": "小米" }},
        	"must_not": { "match": { "goods.title":  "电视" }},
        	"should":   { "match": { "goods.title": "手机" }}
        }
    }
}

```

结果：

```json
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 3,
    "successful" : 3,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.2458471,
    "hits" : [
      {
        "_index" : "test_store",
        "_type" : "_doc",
        "_id" : "0h_L3W4B8wuQh_T7P7Ij",
        "_score" : 1.2458471,
        "_source" : {
          "goods" : {
            "title" : "小米手机",
            "images" : "http://image.leyou.com/12479122.jpg",
            "price" : 2699.0
          }
        }
      }
    ]
  }
}

```



### 范围查询(range)

`range` 查询找出那些落在指定区间内的数字或者时间

``` http
GET /test_store/_search
{
    "query":{
        "range": {
            "goods.price": {
                "gte":  1000.0,
                "lt":   2800.00
            }
    	}
    }
}
```

`range`查询允许以下字符：

| 操作符 |   说明   |
| :----: | :------: |
|   gt   |   大于   |
|  gte   | 大于等于 |
|   lt   |   小于   |
|  lte   | 小于等于 |



### 模糊查询(fuzzy)

我们新增一个商品：

``` http
PUT /test_store/_doc/4
{
  "goods": {
    "title":"apple手机",
    "images":"http://image.leyou.com/12479122.jpg",
    "price":2800
  }
}
```



`fuzzy` 查询是 `term` 查询的模糊等价。它允许用户搜索词条与实际词条的拼写出现偏差，但是偏差的编辑距离不得超过2：

``` http
GET /test_store/_search
{
  "query": {
    "fuzzy": {
      "goods.title": "appla"
    }
  }
}
```

上面的查询，也能查询到apple手机

我们可以通过`fuzziness`来指定允许的编辑距离：

``` http
GET /test_store/_search
{
  "query": {
    "fuzzy": {
        "goods.title": {
            "value":"apkla",
            "fuzziness":2
        }
    }
  }
}
```

apple和apkla有两个单词不一样，但是依然能够查询到



## 过滤(filter)

> **条件查询中进行过滤**

所有的查询都会影响到文档的评分及排名。如果我们需要在查询结果中进行过滤，并且不希望过滤条件影响评分，那么就不要把过滤条件作为查询条件来用。而是使用`filter`方式：

``` http
GET /test_store/_search
{
    "query":{
        "bool":{
        	"must":{ "match": { "goods.title": "小米手机" }},
        	"filter":{
                "range":{"goods.price":{"gt":2700.00,"lt":3800.00}}
        	}
        }
    }
}
```

注意：`filter`中还可以再次进行`bool`组合条件过滤。



> **无查询条件，直接过滤**

如果一次查询只有过滤，没有查询条件，不希望进行评分，我们可以使用`constant_score`取代只有 filter 语句的 bool 查询。在性能上是完全相同的，但对于提高查询简洁性和清晰度有很大帮助。

``` http
GET /test_store/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "goods.price": {
            "gt": 2700.00,
            "lt": 3000.00
          }
        }
      }
    }
  }
}
```

## 排序

### 单字段排序

`sort` 可以让我们按照不同的字段进行排序，并且通过`order`指定排序的方式

``` http
GET /test_store/_search
{
  "query": {
    "match": {
      "goods.title": "小米手机"
    }
  },
  "sort": [
    {
      "goods.price": {
        "order": "desc"
      }
    }
  ]
}
```



### 多字段排序

假定我们想要结合使用 price和 _score（得分） 进行查询，并且匹配的结果首先按照价格排序，然后按照相关性得分排序：

``` http
GET /test_store/_search
{
    "query":{
        "bool":{
        	"must":{ "match": { "goods.title": "小米手机" }},
        	"filter":{
                "range":{"goods.price":{"gt":2000.00,"lt":3000.00}}
        	}
        }
    },
    "sort": [
      { "goods.price": { "order": "desc" }},
      { "_score": { "order": "desc" }}
    ]
}
```



## 聚合aggregations

聚合可以让我们极其方便的实现对数据的统计、分析。例如：

- 什么品牌的手机最受欢迎？
- 这些手机的平均价格、最高价格、最低价格？
- 这些手机每月的销售情况如何？

实现这些统计功能的比数据库的sql要方便的多，而且查询速度非常快，可以实现实时搜索效果。



### 基本概念

Elasticsearch中的聚合，包含多种类型，最常用的两种，一个叫`桶`，一个叫`度量`：

> **桶（bucket）**

桶的作用，是按照某种方式对数据进行分组，每一组数据在ES中称为一个`桶`，例如我们根据国籍对人划分，可以得到`中国桶`、`英国桶`，`日本桶`……或者我们按照年龄段对人进行划分：0-10,10-20,20-30,30-40等。

Elasticsearch中提供的划分桶的方式有很多：

- Date Histogram Aggregation：根据日期阶梯分组，例如给定阶梯为周，会自动每周分为一组
- Histogram Aggregation：根据数值阶梯分组，与日期类似
- Terms Aggregation：根据词条内容分组，词条内容完全匹配的为一组
- Range Aggregation：数值和日期的范围分组，指定开始和结束，然后按段分组
- ……



bucket aggregations 只负责对数据进行分组，并不进行计算，因此往往bucket中往往会嵌套另一种聚合：metrics aggregations即度量



> **度量（metrics）**

分组完成以后，我们一般会对组中的数据进行聚合运算，例如求平均值、最大、最小、求和等，这些在ES中称为`度量`

比较常用的一些度量聚合方式：

- Avg Aggregation：求平均值
- Max Aggregation：求最大值
- Min Aggregation：求最小值
- Percentiles Aggregation：求百分比
- Stats Aggregation：同时返回avg、max、min、sum、count等
- Sum Aggregation：求和
- Top hits Aggregation：求前几
- Value Count Aggregation：求总数
- ……



为了测试聚合，我们先批量导入一些数据

创建索引：

``` http
PUT /cars
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "transactions": {
        "properties": {
          "color": {
            "type": "keyword"
          },
          "make": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

**注意**：在ES中，需要进行聚合、排序、过滤的字段其处理方式比较特殊，因此不能被分词。这里我们将color和make这两个文字类型的字段设置为keyword类型，这个类型不会被分词，将来就可以参与聚合



导入数据

``` http
POST /cars/_bulk
{ "index": {}}
{ "transactions":{"price" : 10000, "color" : "red", "make" : "honda", "sold" : "2014-10-28" }}
{ "index": {}}
{ "transactions":{"price" : 20000, "color" : "red", "make" : "honda", "sold" : "2014-11-05" }}
{ "index": {}}
{ "transactions":{"price" : 30000, "color" : "green", "make" : "ford", "sold" : "2014-05-18" }}
{ "index": {}}
{ "transactions":{"price" : 15000, "color" : "blue", "make" : "toyota", "sold" : "2014-07-02" }}
{ "index": {}}
{ "transactions":{"price" : 12000, "color" : "green", "make" : "toyota", "sold" : "2014-08-19" }}
{ "index": {}}
{ "transactions":{"price" : 20000, "color" : "red", "make" : "honda", "sold" : "2014-11-05" }}
{ "index": {}}
{ "transactions":{"price" : 80000, "color" : "red", "make" : "bmw", "sold" : "2014-01-01" }}
{ "index": {}}
{ "transactions":{"price" : 25000, "color" : "blue", "make" : "ford", "sold" : "2014-02-12" }}
```



### 聚合为桶

首先，我们按照 汽车的颜色`color`来划分`桶`

``` http
GET /cars/_search
{
    "size" : 0,
    "aggs" : { 
        "popular_colors" : { 
            "terms" : { 
              "field" : "transactions.color"
            }
        }
    }
}
```

- size： 查询条数，这里设置为0，因为我们不关心搜索到的数据，只关心聚合结果，提高效率
- aggs：声明这是一个聚合查询，是aggregations的缩写
  - popular_colors：给这次聚合起一个名字，任意。
    - terms：划分桶的方式，这里是根据词条划分
      - field：划分桶的字段

结果：

```json
{
  "took" : 0,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 8,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "popular_colors" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "red",
          "doc_count" : 4
        },
        {
          "key" : "blue",
          "doc_count" : 2
        },
        {
          "key" : "green",
          "doc_count" : 2
        }
      ]
    }
  }
}

```

- hits：查询结果为空，因为我们设置了size为0
- aggregations：聚合的结果
- popular_colors：我们定义的聚合名称
- buckets：查找到的桶，每个不同的color字段值都会形成一个桶
  - key：这个桶对应的color字段的值
  - doc_count：这个桶中的文档数量

通过聚合的结果我们发现，目前红色的小车比较畅销！



### 桶内度量

前面的例子告诉我们每个桶里面的文档数量，这很有用。 但通常，我们的应用需要提供更复杂的文档度量。 例如，每种颜色汽车的平均价格是多少？

因此，我们需要告诉Elasticsearch`使用哪个字段`，`使用何种度量方式`进行运算，这些信息要嵌套在`桶`内，`度量`的运算会基于`桶`内的文档进行

现在，我们为刚刚的聚合结果添加 求价格平均值的度量：

``` http
GET /cars/_search
{
    "size" : 0,
    "aggs" : { 
        "popular_colors" : { 
            "terms" : { 
              "field" : "transactions.color"
            },
            "aggs":{
                "avg_price": { 
                   "avg": {
                      "field": "transactions.price" 
                   }
                }
            }
        }
    }
}
```

- aggs：我们在上一个aggs(popular_colors)中添加新的aggs。可见`度量`也是一个聚合
- avg_price：聚合的名称
- avg：度量的类型，这里是求平均值
- field：度量运算的字段



结果：

```json
{
  "took" : 6,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 8,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "popular_colors" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "red",
          "doc_count" : 4,
          "avg_price" : {
            "value" : 32500.0
          }
        },
        {
          "key" : "blue",
          "doc_count" : 2,
          "avg_price" : {
            "value" : 20000.0
          }
        },
        {
          "key" : "green",
          "doc_count" : 2,
          "avg_price" : {
            "value" : 21000.0
          }
        }
      ]
    }
  }
}

```

可以看到每个桶中都有自己的`avg_price`字段，这是度量聚合的结果



### 桶内嵌套桶

刚刚的案例中，我们在桶内嵌套度量运算。事实上桶不仅可以嵌套运算， 还可以再嵌套其它桶。也就是说在每个分组中，再分更多组。

比如：我们想统计每种颜色的汽车中，分别属于哪个制造商，按照`make`字段再进行分桶

``` http
GET /cars/_search
{
    "size" : 0,
    "aggs" : { 
        "popular_colors" : { 
            "terms" : { 
              "field" : "transactions.color"
            },
            "aggs":{
                "avg_price": { 
                   "avg": {
                      "field": "transactions.price" 
                   }
                },
                "maker":{
                    "terms":{
                        "field":"transactions.make"
                    }
                }
            }
        }
    }
}
```

- 原来的color桶和avg计算我们不变
- maker：在嵌套的aggs下新添一个桶，叫做maker
- terms：桶的划分类型依然是词条
- filed：这里根据make字段进行划分



部分结果：

```json
  "aggregations" : {
    "popular_colors" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "red",
          "doc_count" : 4,
          "maker" : {
            "doc_count_error_upper_bound" : 0,
            "sum_other_doc_count" : 0,
            "buckets" : [
              {
                "key" : "honda",
                "doc_count" : 3
              },
              {
                "key" : "bmw",
                "doc_count" : 1
              }
            ]
          },
          "avg_price" : {
            "value" : 32500.0
          }
        },
        {
          "key" : "blue",
          "doc_count" : 2,
          "maker" : {
            "doc_count_error_upper_bound" : 0,
            "sum_other_doc_count" : 0,
            "buckets" : [
              {
                "key" : "ford",
                "doc_count" : 1
              },
              {
                "key" : "toyota",
                "doc_count" : 1
              }
            ]
          },
          "avg_price" : {
            "value" : 20000.0
          }
        },
        {
          "key" : "green",
          "doc_count" : 2,
          "maker" : {
            "doc_count_error_upper_bound" : 0,
            "sum_other_doc_count" : 0,
            "buckets" : [
              {
                "key" : "ford",
                "doc_count" : 1
              },
              {
                "key" : "toyota",
                "doc_count" : 1
              }
            ]
          },
          "avg_price" : {
            "value" : 21000.0
          }
        }
      ]
    }
  }
```

- 我们可以看到，新的聚合`maker`被嵌套在原来每一个`color`的桶中。
- 每个颜色下面都根据 `make`字段进行了分组
- 我们能读取到的信息：
  - 红色车共有4辆
  - 红色车的平均售价是 $32，500 美元。
  - 其中3辆是 Honda 本田制造，1辆是 BMW 宝马制造。



### 划分桶的其它方式

前面讲了，划分桶的方式有很多，例如：

- Date Histogram Aggregation：根据日期阶梯分组，例如给定阶梯为周，会自动每周分为一组
- Histogram Aggregation：根据数值阶梯分组，与日期类似
- Terms Aggregation：根据词条内容分组，词条内容完全匹配的为一组
- Range Aggregation：数值和日期的范围分组，指定开始和结束，然后按段分组

刚刚的案例中，我们采用的是Terms Aggregation，即根据词条划分桶。

接下来，我们再学习几个比较实用的：

### 阶梯分桶Histogram

> 原理：

histogram是把数值类型的字段，按照一定的阶梯大小进行分组。你需要指定一个阶梯值（interval）来划分阶梯大小。

举例：

比如你有价格字段，如果你设定interval的值为200，那么阶梯就会是这样的：

0，200，400，600，...

上面列出的是每个阶梯的key，也是区间的启点。

如果一件商品的价格是450，会落入哪个阶梯区间呢？计算公式如下：

```
bucket_key = Math.floor((value - offset) / interval) * interval + offset
```

value：就是当前数据的值，本例中是450

offset：起始偏移量，默认为0

interval：阶梯间隔，比如200

因此你得到的key = Math.floor((450 - 0) / 200) * 200 + 0 = 400

> 操作一下：

比如，我们对汽车的价格进行分组，指定间隔interval为5000：

``` http
GET /cars/_search
{
  "size":0,
  "aggs":{
    "price":{
      "histogram": {
        "field": "transactions.price",
        "interval": 5000
      }
    }
  }
}
```

结果：

```json
  "aggregations" : {
    "price" : {
      "buckets" : [
        {
          "key" : 10000.0,
          "doc_count" : 2
        },
        {
          "key" : 15000.0,
          "doc_count" : 1
        },
        {
          "key" : 20000.0,
          "doc_count" : 2
        },
        {
          "key" : 25000.0,
          "doc_count" : 1
        },
        {
          "key" : 30000.0,
          "doc_count" : 1
        },
        {
          "key" : 35000.0,
          "doc_count" : 0
        },
        {
          "key" : 40000.0,
          "doc_count" : 0
        },
        {
          "key" : 45000.0,
          "doc_count" : 0
        },
        {
          "key" : 50000.0,
          "doc_count" : 0
        },
        {
          "key" : 55000.0,
          "doc_count" : 0
        },
        {
          "key" : 60000.0,
          "doc_count" : 0
        },
        {
          "key" : 65000.0,
          "doc_count" : 0
        },
        {
          "key" : 70000.0,
          "doc_count" : 0
        },
        {
          "key" : 75000.0,
          "doc_count" : 0
        },
        {
          "key" : 80000.0,
          "doc_count" : 1
        }
      ]
    }
  }
```

你会发现，中间有大量的文档数量为0 的桶，看起来很丑。

我们可以增加一个参数min_doc_count为1，来约束最少文档数量为1，这样文档数量为0的桶会被过滤

示例：

``` http
GET /cars/_search
{
  "size":0,
  "aggs":{
    "price":{
      "histogram": {
        "field": "transactions.price",
        "interval": 5000,
        "min_doc_count": 1
      }
    }
  }
}
```

结果：

```json
  "aggregations" : {
    "price" : {
      "buckets" : [
        {
          "key" : 10000.0,
          "doc_count" : 2
        },
        {
          "key" : 15000.0,
          "doc_count" : 1
        },
        {
          "key" : 20000.0,
          "doc_count" : 2
        },
        {
          "key" : 25000.0,
          "doc_count" : 1
        },
        {
          "key" : 30000.0,
          "doc_count" : 1
        },
        {
          "key" : 80000.0,
          "doc_count" : 1
        }
      ]
    }
  }
```

完美，！



### 范围分桶range

范围分桶与阶梯分桶类似，也是把数字按照阶段进行分组，只不过range方式需要你自己指定每一组的起始和结束大小。

包含`from`，不包含`to`

``` http
GET /test_high_client/_search
{
  "aggs": {
    "ageAgg": {
      "range": {
        "field": "age",
        "ranges": [
          {
            "from": 15,
            "to": 20,
            "key": "15-19岁"
          },
          {
            "from": 20,
            "to": 25,
            "key": "20-24岁"
          },
          {
            "from": 25,
            "to": 30,
            "key": "25-29岁"
          },
          {
            "from": 30,
            "key": "30岁以上"
          }
        ]
      }
    }
  },
  "size": 0
}

```

