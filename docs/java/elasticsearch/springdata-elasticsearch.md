# Spring Data Elasticsearch

Elasticsearch提供的Java客户端有一些不太方便的地方：

- 很多地方需要拼接Json字符串，在java中拼接字符串有多恐怖你应该懂的
- 需要自己把对象序列化为json存储
- 查询到结果也需要自己反序列化为对象

因此，直接学习Spring提供的套件：Spring Data Elasticsearch。



## 简介

Spring Data Elasticsearch是Spring Data项目下的一个子模块。

查看 Spring Data的官网：http://projects.spring.io/spring-data/

![1531753066475](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220738.png)

> Spring Data的使命是为数据访问提供熟悉且一致的基于Spring的编程模型，同时仍保留底层数据存储的特殊特性。
>
> 它使得使用数据访问技术，关系数据库和非关系数据库，map-reduce框架和基于云的数据服务变得容易。这是一个总括项目，其中包含许多特定于给定数据库的子项目。这些令人兴奋的技术项目背后，是由许多公司和开发人员合作开发的。

Spring Data 的使命是给各种数据访问提供统一的编程接口，不管是关系型数据库（如MySQL），还是非关系数据库（如Redis），或者类似Elasticsearch这样的索引数据库。从而简化开发人员的代码，提高开发效率。

包含很多不同数据操作的模块：

![1531753715580](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221022.png)



Spring Data Elasticsearch的页面：https://projects.spring.io/spring-data-elasticsearch/

 ![1531754111583](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221298.png)

特征：

- 支持Spring的基于`@Configuration`的java配置方式，或者XML配置方式
- 提供了用于操作ES的便捷工具类**`ElasticsearchTemplate`**。包括实现文档到POJO之间的自动智能映射。
- 利用Spring的数据转换服务实现的功能丰富的对象映射
- 基于注解的元数据映射方式，而且可扩展以支持更多不同的数据格式
- 根据持久层接口自动生成对应实现方法，无需人工编写基本操作代码（类似mybatis，根据接口自动得到实现）。当然，也支持人工定制查询

## springboot对应版本

> springboot与elasticsearch客户端版本对照
>
> https://docs.spring.io/spring-data/elasticsearch/docs/current/reference/html/#preface.versions





## 创建Demo工程

我们使用spring脚手架新建一个demo，学习Elasticsearch

![1575780014488](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232137.png)

<details>
    <summary>pom.xml（2.2.1）</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.1.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>cn.clboy</groupId>
    <artifactId>springboot-elasticsearch</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springboot-elasticsearch</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```



</details>



## 配置文件

application.yml文件配置，使用`RestClient`如下配置

```yaml
spring:
  elasticsearch:
    rest:
      uris:
        - 172.16.145.141:9200
```

使用`ElasticsearchTemplate`如下配置

```yaml
spring:
  data:
    elasticsearch:
      cluster-name: elasticsearch
      cluster-nodes: 172.16.145.141:9300
```



## 实体类及注解

首先我们准备好实体类：

```java
public class Item {
    Long id;
    String title; //标题
    String category;// 分类
    String brand; // 品牌
    Double price; // 价格
    String images; // 图片地址
}
```

> 映射

Spring Data通过注解来声明字段的映射属性，有下面的三个注解：

- `@Document` 作用在类，标记实体类为文档对象，一般有四个属性
  - indexName：对应索引名称
  - type：对应在索引中的类型
  - shards：分片数量，默认5
  - replicas：副本数量，默认1
- `@Id` 作用在成员变量，标记一个字段作为id主键
- `@Field` 作用在成员变量，标记为文档的字段，并指定字段映射属性：
  - type：字段类型，取值是枚举：FieldType
  - index：是否索引，布尔类型，默认是true
  - store：是否存储，布尔类型，默认是false
  - analyzer：分词器名称：ik_max_word

示例：

```java
@Document(indexName = "item", type = "_doc", shards = 1, replicas = 0)
public class Item {

    public Item() {
    }

    public Item(Long id, String title, String category, String brand, Double price, String images) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.brand = brand;
        this.price = price;
        this.images = images;
    }

    @Id
    Long id;

    /**
     * 标题
     */
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    String title;

    /**
     * 分类
     */
    @Field(type = FieldType.Keyword)
    String category;

    /**
     * 品牌
     */
    @Field(type = FieldType.Keyword)
    String brand;

    /**
     * 价格
     */
    @Field(type = FieldType.Double)
    Double price;

    /**
     * 图片地址
     */
    @Field(type = FieldType.Keyword, index = false)
    String images;
	
    //getter、setter、toString略
}
```



## Template索引操作

### 创建索引和映射

> 创建索引



ElasticsearchTemplate中提供了创建索引的API：

![1531984923727](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221584.png)

可以根据类的信息自动生成，也可以手动指定indexName和Settings

> 映射

映射相关的API：

![1531985337698](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221854.png)

可以根据类的字节码信息（注解配置）来生成映射，或者手动编写映射



我们这里采用类的字节码信息创建索引并映射：

```java
@SpringBootTest
class SpringbootElasticsearchApplicationTests {

    @Autowired
    private ElasticsearchRestTemplate elasticsearchRestTemplate;

    @Test
    public void testCreateIndex() throws Exception {
        // 创建索引，会根据Item类的@Document注解信息来创建
        elasticsearchRestTemplate.createIndex(Item.class);

        // 配置映射，会根据Item类中的id、Field等字段来自动完成映射
        elasticsearchRestTemplate.putMapping(Item.class);
    }
}

```

结果：

![1575782741796](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232388.png)



### 删除索引

删除索引的API：

![1526544759120](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222134.png)

可以根据类名或索引名删除。

示例：

```java
    @Test
    public void testDeleteIndex() throws Exception {
        elasticsearchRestTemplate.deleteIndex(Item.class);
    }
```

结果：

![1575782866354](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232637.png)



## Repository文档操作

Spring Data 的强大之处，就在于你不用写任何DAO处理，自动根据方法名或类的信息进行CRUD操作。只要你定义一个接口，然后继承Repository提供的一些子接口，就能具备各种基本的CRUD功能。

我们只需要定义接口，然后继承它就OK了。

 ![1531987244855](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222982.png)

```java
public interface ItemRepository extends ElasticsearchRepository<Item,Long> {
}
```

来看下Repository的继承关系：

 ![1531986965570](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222410.png)

我们看到有一个ElasticsearchRepository接口：

![1531987044693](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222688.png)



### 新增文档

!> 先将索引创建回来

```java
@Autowired
private ItemRepository itemRepository;

@Test
public void testAddDocument() throws Exception {
    Item item = new Item(1L, "小米手机7", "手机",
            "小米", 3499.00, "http://image.leyou.com/13123.jpg");
    itemRepository.save(item);
}
```

去页面查询看看：

``` http
GET /item/_search
```

结果：

![1575783245049](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232887.png)



### 批量新增

代码：

```java
	@Test
    public void testAddDocumentList() throws Exception {
        List<Item> list = new ArrayList<>();
        list.add(new Item(2L, "坚果手机R1", "手机", "锤子", 3699.00, "http://image.leyou.com/123.jpg"));
        list.add(new Item(3L, "华为META10", "手机", "华为", 4499.00, "http://image.leyou.com/3.jpg"));
        // 接收对象集合，实现批量新增
        itemRepository.saveAll(list);
    }
```

再次去页面查询：

``` http
GET item/_search
```

### 修改文档

修改和新增是同一个接口，区分的依据就是id，这一点跟我们在页面发起PUT请求是类似的。

```java
@Test
public void testUpdateDocument() throws Exception {
    //将title：小米手机改为 黑米手机666
    Item item = new Item(1L, "黑米手机666", "手机",
            "小米", 3499.00, "http://image.leyou.com/13123.jpg");
    itemRepository.save(item);
}
```





### 基本查询

ElasticsearchRepository提供了一些基本的查询方法：

我们来试试查询所有：

```
@Test
public void testFindAll() throws Exception {
    Iterable<Item> items = itemRepository.findAll();
    items.forEach(System.out::println);
}
```

结果：

```
Item{id=2, title='坚果手机R1', category='手机', brand='锤子', price=3699.0, images='http://image.leyou.com/123.jpg'}
Item{id=3, title='华为META10', category='手机', brand='华为', price=4499.0, images='http://image.leyou.com/3.jpg'}
Item{id=1, title='黑米手机666', category='手机', brand='小米', price=3499.0, images='http://image.leyou.com/13123.jpg'}
```

测试根据id查询：

```
@Test
public void testFindById() throws Exception {
    Optional<Item> optional = itemRepository.findById(1l);
    System.out.println(optional.get());
}
```



查询全部，并按照价格降序排序

```
@Test
public void testFindAllAndOrderByPrice() throws Exception {
    Iterable<Item> items = itemRepository.findAll(Sort.by("price").descending());
    items.forEach(System.out::println);
}
```

结果：

![1531990510740](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223549.png)

### 自定义方法

Spring Data 的另一个强大功能，是根据方法名称自动实现功能。

比如：你的方法名叫做：findByTitle，那么它就知道你是根据title查询，然后自动帮你完成，无需写实现类。

当然，方法名称要符合一定的约定：

| Keyword               | Sample                                     | Elasticsearch Query String                                   |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `And`                 | `findByNameAndPrice`                       | `{"bool" : {"must" : [ {"field" : {"name" : "?"}}, {"field" : {"price" : "?"}} ]}}` |
| `Or`                  | `findByNameOrPrice`                        | `{"bool" : {"should" : [ {"field" : {"name" : "?"}}, {"field" : {"price" : "?"}} ]}}` |
| `Is`                  | `findByName`                               | `{"bool" : {"must" : {"field" : {"name" : "?"}}}}`           |
| `Not`                 | `findByNameNot`                            | `{"bool" : {"must_not" : {"field" : {"name" : "?"}}}}`       |
| `Between`             | `findByPriceBetween`                       | `{"bool" : {"must" : {"range" : {"price" : {"from" : ?,"to" : ?,"include_lower" : true,"include_upper" : true}}}}}` |
| `LessThanEqual`       | `findByPriceLessThan`                      | `{"bool" : {"must" : {"range" : {"price" : {"from" : null,"to" : ?,"include_lower" : true,"include_upper" : true}}}}}` |
| `GreaterThanEqual`    | `findByPriceGreaterThan`                   | `{"bool" : {"must" : {"range" : {"price" : {"from" : ?,"to" : null,"include_lower" : true,"include_upper" : true}}}}}` |
| `Before`              | `findByPriceBefore`                        | `{"bool" : {"must" : {"range" : {"price" : {"from" : null,"to" : ?,"include_lower" : true,"include_upper" : true}}}}}` |
| `After`               | `findByPriceAfter`                         | `{"bool" : {"must" : {"range" : {"price" : {"from" : ?,"to" : null,"include_lower" : true,"include_upper" : true}}}}}` |
| `Like`                | `findByNameLike`                           | `{"bool" : {"must" : {"field" : {"name" : {"query" : "?*","analyze_wildcard" : true}}}}}` |
| `StartingWith`        | `findByNameStartingWith`                   | `{"bool" : {"must" : {"field" : {"name" : {"query" : "?*","analyze_wildcard" : true}}}}}` |
| `EndingWith`          | `findByNameEndingWith`                     | `{"bool" : {"must" : {"field" : {"name" : {"query" : "*?","analyze_wildcard" : true}}}}}` |
| `Contains/Containing` | `findByNameContaining`                     | `{"bool" : {"must" : {"field" : {"name" : {"query" : "**?**","analyze_wildcard" : true}}}}}` |
| `In`                  | `findByNameIn(Collection<String>names)`    | `{"bool" : {"must" : {"bool" : {"should" : [ {"field" : {"name" : "?"}}, {"field" : {"name" : "?"}} ]}}}}` |
| `NotIn`               | `findByNameNotIn(Collection<String>names)` | `{"bool" : {"must_not" : {"bool" : {"should" : {"field" : {"name" : "?"}}}}}}` |
| `Near`                | `findByStoreNear`                          | `Not Supported Yet !`                                        |
| `True`                | `findByAvailableTrue`                      | `{"bool" : {"must" : {"field" : {"available" : true}}}}`     |
| `False`               | `findByAvailableFalse`                     | `{"bool" : {"must" : {"field" : {"available" : false}}}}`    |
| `OrderBy`             | `findByAvailableTrueOrderByNameDesc`       | `{"sort" : [{ "name" : {"order" : "desc"} }],"bool" : {"must" : {"field" : {"available" : true}}}}` |

例如，我们来按照价格区间查询，定义这样的一个方法：

```java
public interface ItemRepository extends ElasticsearchRepository<Item,Long> {

    /**
     * 根据价格区间查询
     * @param price1
     * @param price2
     * @return
     */
    List<Item> findByPriceBetween(double price1, double price2);
}
```



不需要写实现类，然后我们直接去运行：

```
@Test
public void testQueryByPriceBetween() throws Exception {
    List<Item> items = itemRepository.findByPriceBetween(2000, 4000);
    items.forEach(System.out::println);
}
```

结果：

```
Item{id=2, title='坚果手机R1', category=' 手机', brand='锤子', price=3699.0, images='http://image.leyou.com/123.jpg'}
Item{id=1, title='黑米手机666', category=' 手机', brand='小米', price=3499.0, images='http://image.leyou.com/13123.jpg'}
```



虽然基本查询和自定义方法已经很强大了，但是如果是复杂查询（模糊、通配符、词条查询等）就显得力不从心了。此时，我们只能使用原生查询。

## 高级查询

### 基本查询

先看看基本玩法

```java
@Test
public void testBasicQuery() {
    // 词条查询
    MatchQueryBuilder queryBuilder = QueryBuilders.matchQuery("title", "华为");
    // 执行查询
    Iterable<Item> items = itemRepository.search(queryBuilder);
    items.forEach(System.out::println);
}
```

Repository的search方法需要QueryBuilder参数，elasticSearch为我们提供了一个对象QueryBuilders：

 ![1532008212626](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224139.png)

QueryBuilders提供了大量的静态方法，用于生成各种不同类型的查询对象，例如：词条、模糊、通配符等QueryBuilder对象。



elasticsearch提供很多可用的查询方式，但是不够灵活。如果想玩过滤或者聚合查询等就很难了。



### 自定义查询

先来看最基本的match query：

```java
@Test
public void testNativeQuery(){
    // 构建查询条件
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    // 添加基本的分词查询
    queryBuilder.withQuery(QueryBuilders.matchQuery("title", "手机"));
    // 执行搜索，获取结果
    Page<Item> items = this.itemRepository.search(queryBuilder.build());
    // 打印总条数
    System.out.println(items.getTotalElements());
    // 打印总页数
    System.out.println(items.getTotalPages());
    items.forEach(System.out::println);
}
```

NativeSearchQueryBuilder：Spring提供的一个查询条件构建器，帮助构建json格式的请求体

`Page<item>`：默认是分页查询，因此返回的是一个分页的结果对象，包含属性：

- totalElements：总条数
- totalPages：总页数
- Iterator：迭代器，本身实现了Iterator接口，因此可直接迭代得到当前页的数据
- 其它属性：

![1532009679148](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224688.png)



### 分页查询

利用`NativeSearchQueryBuilder`可以方便的实现分页：

```
@Test
public void testNativeQueryByPage() throws Exception {
    // 构建查询条件
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

    // 添加基本的分词查询
    queryBuilder.withQuery(QueryBuilders.termQuery("category", "手机"));

    //构建分页信息，page：页码(从0开始)，size：每页显示条目数
    int page = 0;
    int size = 2;

    // 设置分页参数
    queryBuilder.withPageable(PageRequest.of(page, size));

    //执行查询
    Page<Item> pageResult = this.itemRepository.search(queryBuilder.build());
    System.out.println("总页数：" + pageResult.getTotalPages());
    System.out.println("总条数：" + pageResult.getTotalElements());
    System.out.println("每页显示条数：" + pageResult.getSize());
    System.out.println("当前页码：" + pageResult.getNumber());

    pageResult.forEach(System.out::println);
}
```



可以发现，**Elasticsearch中的分页是从第0页开始**。



### 排序

排序也通用通过`NativeSearchQueryBuilder`完成：

```
@Test
public void testNativeQueryOrderByPrice() throws Exception {
    // 构建查询条件
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

    // 添加基本的分词查询
    queryBuilder.withQuery(QueryBuilders.termQuery("category", "手机"));

    //添加排序条件，根据价格降序
    queryBuilder.withSort(SortBuilders.fieldSort("price").order(SortOrder.DESC));

    //执行查询
    Page<Item> pageResult = this.itemRepository.search(queryBuilder.build());

    pageResult.forEach(System.out::println);
}
```



## 聚合

### 聚合为桶

桶就是分组，比如这里我们按照品牌brand进行分组：

这里`ElasticsearchTemplate`和`ElasticsearchRestTemplate`有点不一样

使用`ElasticsearchRestTemplate`如下获取

```
/**
 * 测试聚合查询(ElasticsearchRestTemplate)
 *
 * @throws Exception
 */
@Test
public void testNativeQueryAggregation() throws Exception {
    // 构建查询条件
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

    // 不查询任何字段
    queryBuilder.withSourceFilter(new FetchSourceFilter(new String[]{}, null));

    //添加一个新的聚合，聚合类型为terms，聚合名称为brands，聚合字段为brand
    queryBuilder.addAggregation(AggregationBuilders.terms("brandAgg").field("brand"));

    //执行查询
    Page<Item> pageResult = this.itemRepository.search(queryBuilder.build());

    //把结果强转为AggregatedPage类型
    AggregatedPage<Item> aggregatedPageResult = (AggregatedPage<Item>) pageResult;

    //从结果中取出名为brands的那个聚合，因为是利用String类型字段来进行的term聚合，所以结果要强转为StringTerm类型
    ParsedStringTerms parsedStringTerms = (ParsedStringTerms) aggregatedPageResult.getAggregation("brandAgg");
    //获取桶
    List<ParsedStringTerms.ParsedBucket> buckets = (List<ParsedStringTerms.ParsedBucket>) parsedStringTerms.getBuckets();

    for (ParsedStringTerms.ParsedBucket bucket : buckets) {
        //获取桶中的key，即品牌名称
        System.out.println(bucket.getKeyAsString());
        //获取桶中的文档数量
        System.out.println(bucket.getDocCount());
    }
}
```

使用`ElasticsearchTemplate`是如下代码

```
/**
 * 测试聚合查询（ElasticsearchTemplate）
 * (需切换为ElasticsearchTemplate如果使用ElasticsearchRestTemplate会抛出类型转换异常)
 */
@Test
public void testAgg() {
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    // 不查询任何结果
    queryBuilder.withSourceFilter(new FetchSourceFilter(new String[]{""}, null));

    //添加一个新的聚合，聚合类型为terms，聚合名称为brands，聚合字段为brand
    queryBuilder.addAggregation(AggregationBuilders.terms("brands").field("brand"));

    //查询,需要把结果强转为AggregatedPage类型
    AggregatedPage<Item> aggPage = (AggregatedPage<Item>) this.itemRepository.search(queryBuilder.build());
    // 解析
    // 从结果中取出名为brands的那个聚合，
    // 因为是利用String类型字段来进行的term聚合，所以结果要强转为StringTerm类型
    StringTerms agg = (StringTerms) aggPage.getAggregation("brands");
    //获取桶
    List<StringTerms.Bucket> buckets = agg.getBuckets();
    // 遍历
    for (StringTerms.Bucket bucket : buckets) {
        //获取桶中的key，即品牌名称
        System.out.println(bucket.getKeyAsString());
        //获取桶中的文档数量
        System.out.println(bucket.getDocCount());
    }

}
```





关键API：

- `AggregationBuilders`：聚合的构建工厂类。所有聚合都由这个类来构建，看看他的静态方法：

  ![1526567597724](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211683.png)

- `AggregatedPage`：聚合查询的结果类。它是`Page<T>`的子接口：

  ![1526567748355](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211947.png)

  `AggregatedPage`在`Page`功能的基础上，拓展了与聚合相关的功能，它其实就是对聚合结果的一种封装，大家可以对照聚合结果的JSON结构来看。

   ![1526567889455](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212447.png)

  而返回的结果都是Aggregation类型对象，不过根据字段类型不同，又有不同的子类表示

   ![1526568128210](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212912.png)



我们看下页面的查询的JSON结果与Java类的对照关系：

 ![1526571200130](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213341.png)



### 嵌套聚合，求平均值

先使用kibana添加两条数据

``` http
PUT item/_bulk
{"index": {"_id": "4"}}
{"title" : "小米CC9e","category" : "手机","brand" : "小米","price" : 999.00,"images" : "http://image.leyou.com/123.jpg"}
{"index": {"_id": "5"}}
{"title" : "荣耀V20","category" : "手机","brand" : "华为","price" : 1899.00,"images" : "http://image.leyou.com/123.jpg"}
```



代码：

```
/**
 * 测试聚合中嵌套聚合(子聚合)
 * 查询每个平均价格
 * @throws Exception
 */
@Test
public void testSubAggregation() throws Exception {
    // 构建查询条件
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

    // 不查询任何字段
    queryBuilder.withSourceFilter(new FetchSourceFilter(new String[]{}, null));

    //添加一个新的聚合，聚合类型为terms，聚合名称为brands，聚合字段为brand
    queryBuilder.addAggregation(
            AggregationBuilders.terms("brandAgg").field("brand")
            .subAggregation(AggregationBuilders.avg("brandPriceAvg").field("price")));

    //执行查询
    Page<Item> pageResult = this.itemRepository.search(queryBuilder.build());

    //把结果强转为AggregatedPage类型
    AggregatedPage<Item> aggregatedPageResult = (AggregatedPage<Item>) pageResult;

    //从结果中取出名为brands的那个聚合，因为是利用String类型字段来进行的term聚合，所以结果要强转为StringTerm类型
    ParsedStringTerms parsedStringTerms = (ParsedStringTerms) aggregatedPageResult.getAggregation("brandAgg");
    //获取桶
    List<ParsedStringTerms.ParsedBucket> buckets = (List<ParsedStringTerms.ParsedBucket>) parsedStringTerms.getBuckets();

    for (ParsedStringTerms.ParsedBucket bucket : buckets) {
        //获取桶中的key，即品牌名称
        System.out.println(bucket.getKeyAsString());
        //获取桶中的文档数量
        System.out.println(bucket.getDocCount());
        //获取子聚合
        Aggregations aggregations = bucket.getAggregations();
        //非rest是InternalAvg
        ParsedAvg avgAgg = aggregations.get("brandPriceAvg");
        double avg = avgAgg.getValue();
        System.out.println(avg);
    }
}
```

通过kibana工具查询：

``` http
GET item/_search
{
  "size": 0, 
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand"
      },
      "aggs": {
        "brandPriceAvg": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

