# Elasticsearch客户端

> ES提供多种不同的客户端：

1. TransportClient (废弃)

   ES提供的传统客户端，官方计划8.0版本删除此客户端。

2. RestClient

   RestClient是官方推荐使用的，它包括两种：Java Low Level REST Client和  Java High Level REST Client。

   ES在6.0之后提供  Java High Level REST Client， 两种客户端官方更推荐使用 Java High Level REST Client，不过当前它还处于完善中，有些功能还没有。

## 添加依赖

```xml
<properties>
    <elasticsearch.version>7.11.2</elasticsearch.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>${elasticsearch.version}</version>
    </dependency>
</dependencies>
```

## 创建client工具类

```java
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;

public class ElasticSearchUtil {
    public static final String[] ADDRESS_ARRAY = {"192.168.46.88:9200"};
    public static HttpHost[] HttpHosts;


    static {
        //创建HttpHost数组，其中存放es主机和端口的配置信息
        HttpHosts = new HttpHost[ADDRESS_ARRAY.length];
        for (int i = 0; i < ADDRESS_ARRAY.length; i++) {
            String[] ipAndPort = ADDRESS_ARRAY[i].split(":");
            HttpHosts[i] = new HttpHost(ipAndPort[0], Integer.parseInt(ipAndPort[1]), "http");
        }
    }


    /**
     * 创建RestHighLevelClient客户端
     */
    public static RestHighLevelClient getRestHighLevelClient() {
        return new RestHighLevelClient(RestClient.builder(HttpHosts));
    }


    /**
     * 创建RestClient 低级客户端
     */
    public static RestClient getRestClient() {
        return RestClient.builder(HttpHosts).build();
    }

}
```



## 索引管理

### 创建索引库

```java
/**
 * 创建索引
 */
@Test
public void CreateIndexTest() throws Exception {
    //创建索引请求对象，并设置索引名称
    CreateIndexRequest createIndexRequest = new CreateIndexRequest(INDEX_NAME);

    //设置索引参数
    Settings settings = Settings.builder().put("number_of_shards", 1)
            .put("number_of_replicas", 0)
            .build();
    createIndexRequest.settings(settings);

    //设置映射
    String json = "{\n" +
            "  \"properties\": {\n" +
            "    \"name\": {\n" +
            "      \"type\": \"keyword\",\n" +
            "      \"index\": true\n" +
            "    },\n" +
            "    \"info\": {\n" +
            "      \"type\": \"text\",\n" +
            "      \"index\": true,\n" +
            "      \"analyzer\": \"ik_smart\"\n" +
            "    }\n" +
            "  }\n" +
            "}";
    createIndexRequest.mapping(json, XContentType.JSON);

    //创建索引操作客户端
    IndicesClient indexClient = restHighLevelClient.indices();

    //创建，获取响应
    CreateIndexResponse createIndexResponse = indexClient.create(createIndexRequest, RequestOptions.DEFAULT);

    boolean acknowledged = createIndexResponse.isAcknowledged();

    System.out.println(acknowledged);
}
```

### 添加文档

```java
/**
 * 添加文档
 */
@Test
public void addDocTest() throws Exception {
    HashMap<String, Object> document = new HashMap<>(4);
    document.put("name", "张三");
    document.put("info", "22岁，男，未婚，长的很帅");

    IndexRequest indexRequest = new IndexRequest(INDEX_NAME);
    indexRequest.source(document);

    IndexResponse response = restHighLevelClient.index(indexRequest, RequestOptions.DEFAULT);

    System.out.println(response);
}
```

### 获取文档

```java
/**
 * 根据id获取文档
 */
@Test
public void getDocByIdTest() throws Exception {
    GetRequest getRequest = new GetRequest(INDEX_NAME, "h40P3HgBcWSISYUq4Xp0");

    GetResponse response = restHighLevelClient.get(getRequest, RequestOptions.DEFAULT);

    if (response.isExists()) {
        System.out.println(response);
    } else {
        System.out.println("不存在！");
    }
}
```

### 更新文档

```java
/**
 * 更新文档,只会更新设置的字段
 */
@Test
public void updateTest() throws Exception {
    UpdateRequest request = new UpdateRequest(INDEX_NAME, "h40P3HgBcWSISYUq4Xp0");
    HashMap<String, Object> document = new HashMap<>(2);
    document.put("name", "李四");
    request.doc(document);

    UpdateResponse response = restHighLevelClient.update(request, RequestOptions.DEFAULT);
    System.out.println(response);
}
```

### 删除文档

```java
/**
 * 删除文档
 */
@Test
public void delDocTest() throws Exception {
    DeleteRequest request = new DeleteRequest(INDEX_NAME, "h40P3HgBcWSISYUq4Xp0");
    DeleteResponse response = restHighLevelClient.delete(request, RequestOptions.DEFAULT);
    System.out.println(response);
}
```



## 搜索管理

### 查询全部(match_all)

```http
GET /索引库名/_search
{
 "query": {
   "match_all": {}
 }
}

```

```java
@Test
public void matchAllQueryTest() throws Exception {
    //搜索源构建对象
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchAllQuery());

    SearchHits hits = this.search(searchSourceBuilder).getHits();
    this.printHits(hits);
}
```

### 分页查询(from,size)

```http
GET /索引库名/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 3
}
```



```java
/**
 * 分页查询
 */
@Test
public void pageQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchAllQuery());

    int page = 1;
    int size = 3;
    int from = (page - 1) * size;
    
    // 起始记录下标
    searchSourceBuilder.from(from);

    //每页显示个数
    searchSourceBuilder.size(size);
}
```

### 词条匹配查询(term)

```http
GET /test_high_client/_search
{
  "query": {
    "term": {
      "name": "王二麻子"
    }
  }
}
```



```java
/**
 * 词条匹配查询
 */
@Test
public void termQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.termQuery("name", "王二麻子"));
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 分词匹配查询(match)

```http
GET /test_high_client/_search
{
  "query": {
    "match": {
      "info": "油性头发"
    }
  }
}
```

```java
/**
 * match匹配查询
 */
@Test
public void matchQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchQuery("info","油性头发"));
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 多字段分词匹配查询(multi_match)

```http
GET /test_high_client/_search
{
  "query": {
    "multi_match": {
      "query": "沐朗然",
      "fields": ["name","info"]
    }
  }
}
```

```java
/**
 * multi match匹配查询
 * 多字段匹配
 */
@Test
public void multiMatchQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.multiMatchQuery("沐朗然", "name", "info"));
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 布尔组合查询(bool)

```http
GET /test_high_client/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "info": "油性头发"
          }
        }
      ],
      "must_not": [
        {
          "term": {
            "name": "王二麻子"
          }
        }
      ]
    }
  }
}
```

```java
/**
 * 布尔查询
 * <p>
 * 组合查询
 */
@Test
public void booleanQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

    //构建布尔查询
    BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
    boolQueryBuilder.must(QueryBuilders.matchQuery("info", "油性头发"));
    boolQueryBuilder.mustNot(QueryBuilders.termQuery("name", "王二麻子"));

    searchSourceBuilder.query(boolQueryBuilder);
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 范围查询(range)

```http
GET /test_high_client/_search
{
  "query": {
    "range": {
      "age": {
        "gte": 30
      }
    }
  }
}

```

```java
/**
 * range范围查询
 */
@Test
public void rangeQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.rangeQuery("age").gte(30));
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 模糊查询(fuzzy)

```http
GET /test_high_client/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "冷星月"
      }
    }
  }
}

```

```java
/**
 * fuzzy 模糊查询
 */
@Test
public void fuzzyQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder=new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.fuzzyQuery("name","冷星月"));
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 查询过滤(filter)

```http
GET /test_high_client/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "info": "油性头发"
          }
        }
      ],
      "filter": [
        {
          "range": {
            "age": {
              "lte": 28
            }
          }
        }
      ]
    }
  }
}

```

```java
/**
 * filter 查询过滤
 */
@Test
public void filterQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

    BoolQueryBuilder bool = new BoolQueryBuilder()
            .must(QueryBuilders.matchQuery("info", "油性头发"))
            .filter(QueryBuilders.rangeQuery("age").lte(28));
    searchSourceBuilder.query(bool);
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 查询排序(sort)

```http
GET /test_high_client/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "age": {
        "order": "desc"
      }
    }
  ]
}

```

```java
/**
 * sort 查询排序
 */
@Test
public void sortQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchAllQuery());
    searchSourceBuilder.sort("age", SortOrder.ASC);
    this.printHits(this.search(searchSourceBuilder).getHits());
}
```

### 高亮显示(highlight)

```http
GET /test_high_client/_search
{
  "query": {
    "match": {
      "info": "油性头发"
    }
  },
  "highlight": {
    "fields": {
      "info": {}
    },
    "pre_tags": "===>",
    "post_tags":"<==="
  }
}
```



```java
/**
 * 高亮显示
 */
@Test
public void highlightQueryTest() throws Exception {
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchQuery("info", "油性头发"));

    //构建高亮显示
    HighlightBuilder highlightBuilder = new HighlightBuilder();
    highlightBuilder.field("info");
    highlightBuilder.preTags("===>").postTags("<===");
    searchSourceBuilder.highlighter(highlightBuilder);

    SearchResponse response = this.search(searchSourceBuilder);
    this.printHits(response.getHits(), true);
}
```



### 聚合查询

```http
GET /test_high_client/_search
{
  "aggs": {
    "ageRangeAgg": {
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
      },
      "aggs": {
        "maxAgeAgg": {
          "max": {
            "field": "age"
          }
        }
      }
    }
  },
  "size": 0
}

```

```java
/**
 * 聚合查询
 */
@Test
public void aggQueryTest() throws Exception {

    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

    RangeAggregationBuilder ageRangeAgg = AggregationBuilders.range("ageRangeAgg")
            .field("age")
            .addRange("15-19岁", 15, 20)
            .addRange("20-24岁", 20, 25)
            .addRange("25-29岁", 25, 30)
            .addUnboundedFrom("30岁以上", 30);

    MaxAggregationBuilder subMaxAgeAgg = AggregationBuilders.max("maxAgeAgg").field("age");
    ageRangeAgg.subAggregation(subMaxAgeAgg);

    searchSourceBuilder.aggregation(ageRangeAgg);

    searchSourceBuilder.size(0);
    Aggregations aggregations = this.search(searchSourceBuilder).getAggregations();

    ParsedRange ageRange = aggregations.get("ageRangeAgg");

    List<? extends Range.Bucket> buckets = ageRange.getBuckets();

    buckets.forEach(bucket -> {
        ParsedMax maxAgeAgg = bucket.getAggregations().get("maxAgeAgg");
        int maxAge = (int) maxAgeAgg.getValue();

        System.out.println(maxAgeAgg.getType());
        System.out.format("%s：%d人，最大年龄：%d%n", bucket.getKey(), bucket.getDocCount(), maxAge);
    });
}
```

### this.printHits方法

```java
public void printHits(SearchHits hits) {
    this.printHits(hits, false);
}

public void printHits(SearchHits hits, boolean highlight) {
    System.out.println("总记录数：" + hits.getTotalHits());

    //匹配到的文档
    SearchHit[] searchHits = hits.getHits();

    for (SearchHit searchHit : searchHits) {
        //源文档内容
        Map<String, Object> sourceAsMap = searchHit.getSourceAsMap();
        System.out.println(sourceAsMap);

        if (highlight) {
            Map<String, HighlightField> highlightFields = searchHit.getHighlightFields();
            System.out.println(highlightFields);
            System.out.println();
        }
    }

}
```

### this.search方法

```java
public SearchResponse search(SearchSourceBuilder searchSourceBuilder) throws IOException {
    SearchRequest searchRequest = new SearchRequest(INDEX_NAME);
    searchRequest.source(searchSourceBuilder);
    return restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
}
```