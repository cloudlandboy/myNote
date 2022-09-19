# 商品搜索过滤

## 过滤功能分析

首先看下页面要实现的效果：

![1526725119663](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240009.png)

整个过滤部分有3块：

- 顶部的导航，已经选择的过滤条件展示：
  - 商品分类面包屑，根据用户选择的商品分类变化
  - 其它已选择过滤参数
- 过滤条件展示，又包含3部分
  - 商品分类展示
  - 品牌展示
  - 其它规格参数
- 展开或收起的过滤条件的按钮



顶部导航要展示的内容跟用户选择的过滤条件有关。

- 比如用户选择了某个商品分类，则面包屑中才会展示具体的分类
- 比如用户选择了某个品牌，列表中才会有品牌信息。

所以，这部分需要依赖第二部分：过滤条件的展示和选择。因此我们先不着急去做。



展开或收起的按钮是否显示，取决于过滤条件有多少，如果很少，那么就没必要展示。所以也是跟第二部分的过滤条件有关。

这样分析来看，我们必须先做第二部分：过滤条件展示。



## 生成分类和品牌过滤

先来看分类和品牌。在我们的数据库中已经有所有的分类和品牌信息。在这个位置，是不是把所有的分类和品牌信息都展示出来呢？

显然不是，用户搜索的条件会对商品进行过滤，而在搜索结果中，不一定包含所有的分类和品牌，直接展示出所有商品分类，让用户选择显然是不合适的。

无论是分类信息，还是品牌信息，都应该从搜索的结果商品中进行聚合得到。

## 扩展返回的结果

原来，我们返回的结果是PageResult对象，里面只有total、totalPage、items 3个属性。但是现在要对商品分类和品牌进行聚合，数据显然不够用，我们需要对返回的结果进行扩展，添加分类和品牌的数据。

那么问题来了：以什么格式返回呢？

看页面：

 ![1526738120021](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240163.png)



分类：页面显示了分类名称，但背后肯定要保存id信息。所以至少要有id和name

品牌：页面展示的有logo，有文字，当然肯定有id，基本上是品牌的完整数据

我们新建一个类，继承PageResult，然后扩展两个新的属性：分类集合和品牌集合：

 ![1543671901773](https://cdn.tencentfs.clboy.cn/images/2021/20210911203316730.png)

```java
package com.leyou.search.pojo;

import com.leyou.common.pojo.PageResult;
import com.leyou.item.pojo.Brand;

import java.util.List;
import java.util.Map;

/**
 * @Author cloudlandboy
 * @Date 2019/12/11 下午12:46
 * @Since 1.0.0
 */

public class SearchResult extends PageResult<Goods> {

    /**
     * 搜索结果聚合出的分类信息
     */
    private List<Map<String, Object>> categories;

    /**
     * 搜索结果聚合出的品牌信息
     */
    private List<Brand> brands;

    public SearchResult() {
    }

    public SearchResult(List<Map<String, Object>> categories, List<Brand> brands) {
        this.categories = categories;
        this.brands = brands;
    }

    public SearchResult(Long total, Integer totalPage, List<Goods> items, List<Map<String, Object>> categories, List<Brand> brands) {
        super(total, totalPage, items);
        this.categories = categories;
        this.brands = brands;
    }
    
    //getter,setter略
}
```



## 聚合商品分类和品牌

我们修改搜索的业务逻辑，对分类和品牌聚合。

因为索引库中只有id，所以我们根据id聚合，然后再根据id去查询完整数据。

所以，商品微服务需要提供一个接口：根据品牌id集合，批量查询品牌。



修改SearchService：

```java
@Override
public SearchResult searchGoods(SearchRequest searchRequest) {
    String key = searchRequest.getKey();
    // 判断是否有搜索条件，如果没有，直接返回null。不允许搜索全部商品
    if (StringUtils.isBlank(key)) {
        return null;
    }
    //构建查询条件
    NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder();
    builder.withQuery(QueryBuilders.matchQuery("all", key).operator(Operator.AND));

    //添加对分类的聚合
    builder.addAggregation(AggregationBuilders.terms("categoryAgg").field("cid3"));
    //添加对品牌的聚合
    builder.addAggregation(AggregationBuilders.terms("brandAgg").field("brandId"));

    //通过sourceFilter设置返回的结果字段,我们只需要spu的id、skus、subTitle
    builder.withSourceFilter(new FetchSourceFilter(
            new String[]{"id", "skus", "subTitle"}, null));

    //添加排序
    if (StringUtils.isNotBlank(searchRequest.getSortBy())) {
        builder.withSort(SortBuilders.fieldSort(searchRequest.getSortBy()).order(searchRequest.getDescending() ? SortOrder.DESC : SortOrder.ASC));
    }

    //分页,页码从0开始
    builder.withPageable(PageRequest.of(searchRequest.getPage() - 1, searchRequest.getSize()));

    //执行查询
    AggregatedPage<Goods> searchResult = (AggregatedPage<Goods>) goodsRepository.search(builder.build());

    //获取聚合结果
    List<Map<String, Object>> categoryDatas = this.getCategoryAggregation(searchResult.getAggregation("categoryAgg"));
    List<Brand> brands = this.getBrandAggregation(searchResult.getAggregation("brandAgg"));

    //封装分页数据
    SearchResult searchPageResult = new SearchResult(searchResult.getTotalElements(), searchResult.getTotalPages(), searchResult.getContent(), categoryDatas, brands);

    return searchPageResult;
}
```



测试：

![1532259453938](https://cdn.tencentfs.clboy.cn/images/2021/20210911203302743.png)



## 页面渲染数据

### 过滤参数数据结构

来看下页面的展示效果：

 ![1526742664217](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240301.png)

虽然分类、品牌内容都不太一样，但是结构相似，都是key和value的结构。

而且页面结构也极为类似：

 ![1526742817804](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240438.png)



所以，我们可以把所有的过滤条件放入一个`数组`中，然后在页面利用`v-for`遍历一次生成。

其基本结构是这样的：

```js
[
    {
        k:"过滤字段名",
        options:[{/*过滤字段值对象*/},{/*过滤字段值对象*/}]
    }
]
```

我们先在data中定义数组：filters，等待组装过滤参数：

```js
data: {
    ly,
    search:{
        key: "",
        page: 1
    },
    goodsList:[], // 接收搜索得到的结果
    total: 0, // 总条数
    totalPage: 0, // 总页数
    filters:[] // 过滤参数集合
},
```

然后在查询搜索结果的回调函数中，对过滤参数进行封装：

![1532261937404](https://cdn.tencentfs.clboy.cn/images/2021/20210911203302851.png)

然后刷新页面，通过浏览器工具，查看封装的结果：

![1576048958372](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320357.png)



### 页面渲染数据

首先看页面原来的代码：

 ![1526803362517](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240575.png)

我们注意到，虽然页面元素是一样的，但是品牌会比其它搜索条件多出一些样式，因为品牌是以图片展示。需要进行特殊处理。数据展示是一致的，我们采用v-for处理：

```html
<!--品牌筛选-->
<div class="type-wrap logo" v-else>
    <div class="fl key brand">品牌</div>
    <div class="value logos">
        <ul class="logo-list">
            <li v-for="(option, index2) in filter.options" v-if="option.image"
                style="height: 46px;line-height:46px;text-align: center">
                <img :src="option.image" height="36" width="102"/>
            </li>
            <li style="text-align: center" v-else>
                <a style="line-height: 30px; font-size: 12px" href="#">{{option.name}}</a>
            </li>
        </ul>
    </div>
    <div class="fl ext">
        <a href="javascript:void(0);" class="sui-btn">多选</a>
    </div>
</div>
```

将头部样式表59-64行注释的css样式打开

结果：

![1532264524663](https://cdn.tencentfs.clboy.cn/images/2021/20210911203302910.png)



## 生成规格参数过滤

### 谋而后动

有四个问题需要先思考清楚：

- 什么时候显示规格参数过滤？ （分类有多个的时候怎么办）
- 如何知道哪些规格需要过滤？ 
- 要过滤的参数，其可选值是如何获取的？ 
- 规格过滤的可选值，其数据格式怎样的？



> 什么情况下显示有关规格参数的过滤？

如果用户尚未选择商品分类，或者聚合得到的分类数大于1，那么就没必要进行规格参数的聚合。因为不同分类的商品，其规格是不同的。

因此，我们在后台**需要对聚合得到的商品分类数量进行判断，如果等于1，我们才继续进行规格参数的聚合**。



> 如何知道哪些规格需要过滤？

我们不能把数据库中的所有规格参数都拿来过滤。因为并不是所有的规格参数都可以用来过滤，参数的值是不确定的。

值的庆幸的是，我们在设计规格参数时，已经标记了某些规格可搜索，某些不可搜索。

因此，一旦商品分类确定，我们就可以根据商品分类查询到其对应的规格，从而知道哪些规格要进行搜索。



> 要过滤的参数，其可选值是如何获取的？

虽然数据库中有所有的规格参数，但是不能把一切数据都用来供用户选择。

与商品分类和品牌一样，应该是从用户搜索得到的结果中聚合，得到与结果品牌的规格参数可选值。



> 规格过滤的可选值，其数据格式怎样的？

我们直接看页面效果：

![1526805322441](https://cdn.tencentfs.clboy.cn/images/2021/20210911203240718.png)

我们之前存储时已经将数据分段，恰好符合这里的需求



### 实战

接下来，我们就用代码实现刚才的思路。

总结一下，应该是以下几步：

1. 用户搜索得到商品，并聚合出商品分类
2. 判断分类数量是否等于1，如果是则进行规格参数聚合
3. 先根据分类，查找可以用来搜索的规格
4. 对规格参数进行聚合
5. 将规格参数聚合结果整理后返回



### 扩展返回结果

返回结果中需要增加新数据，用来保存规格参数过滤条件。这里与前面的品牌和分类过滤的json结构类似：

```json
[
    {
        "k":"规格参数名",
        "options":["规格参数值","规格参数值"]
    }
]
```

因此，在java中我们用List<Map<String, Object>>来表示。

```java
public class SearchResult extends PageResult<Goods> {
    private List<Map<String, Object>> specs;
}
```



### 判断是否需要聚合

首先，在聚合得到商品分类后，判断分类的个数，如果是1个则进行规格聚合：

```java
//获取聚合结果
List<Map<String, Object>> categoryDatas = this.getCategoryAggregation(searchResult.getAggregation("categoryAgg"));
List<Brand> brands = this.getBrandAggregation(searchResult.getAggregation("brandAgg"));

//判断聚合出的分类是否是1个，如果是1个则进行该分类的规格参数聚合
if (!CollectionUtils.isEmpty(categoryDatas) && categoryDatas.size() == 1) {
    List<Map<String, Object>> specs = this.getSpecAggregation();
}
```

然后想一想要想聚合出规格参数需要哪些参数

- `分类id`，需要根据分类id查询出所有的可搜索规格参数
- `查询条件`

将开始的查询条件抽取出来

![1576057575306](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320410.png)



修改`getSpecAggregation`方法添加`分类id`和查询条件两个参数

```java
//判断聚合出的分类是否是1个，如果是1个则进行该分类的规格参数聚合
if (!CollectionUtils.isEmpty(categoryDatas) && categoryDatas.size() == 1) {
    List<Map<String, Object>> specs = this.getSpecAggregation((Long) categoryDatas.get(0).get("id"), basicQuery);
}
```

```
private List<Map<String, Object>> getSpecAggregation(Long cid, QueryBuilder basicQuery) {
    return null;
}
```



### 获取需要聚合的规格参数

然后，我们需要根据商品分类，查询所有可用于搜索的规格参数：

![1543674113503](https://cdn.tencentfs.clboy.cn/images/2021/20210911203316883.png)

要注意的是，这里我们需要根据分类id查询规格，而规格参数接口需要从商品微服务提供



### 聚合规格参数

因为规格参数保存时不做分词，因此其名称要带上一个.keyword后缀：

![1576058250407](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320461.png)

```java
private List<Map<String, Object>> getSpecAggregation(Long cid, QueryBuilder basicQuery) {
    //构建自定义查询条件
    NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder();
    //基于基本的查询条件聚合规格参数
    builder.withQuery(basicQuery);
    //根据分类id查询所有的可用于搜索的规格参数用于聚合
    List<SpecParam> specParams = this.specificationClient.querySpecParams(null, cid, null, true);

    //遍历规格参数添加聚合
    specParams.forEach(specParam -> {
        builder.addAggregation(AggregationBuilders.terms(specParam.getName()).field("spec." + specParam.getName() + ".keyword"));
    });

    //添加结果集过滤，只需要聚合的结果集
    builder.withSourceFilter(new FetchSourceFilter(new String[]{}, null));

    //执行查询
    AggregatedPage<Goods> searchResult = (AggregatedPage<Goods>) this.goodsRepository.search(builder.build());
    
}
```



### 解析聚合结果

![1543674250920](https://cdn.tencentfs.clboy.cn/images/2021/20210911203316988.png)

### 最终的完整代码

```java
public SearchResult search(SearchRequest request) {

    // 判断查询条件
    if (StringUtils.isBlank(request.getKey())) {
        // 返回默认结果集
        return null;
    }

    // 初始化自定义查询构建器
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    // 添加查询条件
    MatchQueryBuilder basicQuery = QueryBuilders.matchQuery("all", request.getKey()).operator(Operator.AND);
    queryBuilder.withQuery(basicQuery);
    // 添加结果集过滤，只需要：id,subTitle, skus
    queryBuilder.withSourceFilter(new FetchSourceFilter(new String[]{"id", "subTitle", "skus"}, null));

    // 获取分页参数
    Integer page = request.getPage();
    Integer size = request.getSize();
    // 添加分页
    queryBuilder.withPageable(PageRequest.of(page - 1, size));

    String categoryAggName = "categories";
    String brandAggName = "brands";
    queryBuilder.addAggregation(AggregationBuilders.terms(categoryAggName).field("cid3"));
    queryBuilder.addAggregation(AggregationBuilders.terms(brandAggName).field("brandId"));

    // 执行搜索，获取搜索的结果集
    AggregatedPage<Goods> goodsPage = (AggregatedPage<Goods>)this.goodsReponsitory.search(queryBuilder.build());

    // 解析聚合结果集
    List<Map<String, Object>> categories = getCategoryAggResult(goodsPage.getAggregation(categoryAggName));
    List<Brand> brands = getBrandAggResult(goodsPage.getAggregation(brandAggName));

    // 判断分类聚合的结果集大小，等于1则聚合
    List<Map<String, Object>> specs = null;
    if (categories.size() == 1) {
        specs = getParamAggResult((Long)categories.get(0).get("id"), basicQuery);
    }

    // 封装成需要的返回结果集
    return new SearchResult(goodsPage.getContent(), goodsPage.getTotalElements(), goodsPage.getTotalPages(), categories, brands, specs);
}

/**
     * 聚合出规格参数过滤条件
     * @param id
     * @param basicQuery
     * @return
     */
private List<Map<String,Object>> getParamAggResult(Long id, QueryBuilder basicQuery) {

    // 创建自定义查询构建器
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    // 基于基本的查询条件，聚合规格参数
    queryBuilder.withQuery(basicQuery);
    // 查询要聚合的规格参数
    List<SpecParam> params = this.specificationClient.queryParams(null, id, null, true);
    // 添加聚合
    params.forEach(param -> {
        queryBuilder.addAggregation(AggregationBuilders.terms(param.getName()).field("specs." + param.getName() + ".keyword"));
    });
    // 只需要聚合结果集，不需要查询结果集
    queryBuilder.withSourceFilter(new FetchSourceFilter(new String[]{}, null));

    // 执行聚合查询
    AggregatedPage<Goods> goodsPage = (AggregatedPage<Goods>)this.goodsReponsitory.search(queryBuilder.build());

    // 定义一个集合，收集聚合结果集
    List<Map<String, Object>> paramMapList = new ArrayList<>();
    // 解析聚合查询的结果集
    Map<String, Aggregation> aggregationMap = goodsPage.getAggregations().asMap();
    for (Map.Entry<String, Aggregation> entry : aggregationMap.entrySet()) {
        Map<String, Object> map = new HashMap<>();
        // 放入规格参数名
        map.put("k", entry.getKey());
        // 收集规格参数值
        List<Object> options = new ArrayList<>();
        // 解析每个聚合
        StringTerms terms = (StringTerms)entry.getValue();
        // 遍历每个聚合中桶，把桶中key放入收集规格参数的集合中
        terms.getBuckets().forEach(bucket -> options.add(bucket.getKeyAsString()));
        map.put("options", options);
        paramMapList.add(map);
    }

    return paramMapList;
}

```

由于这里需要处理的代码较多，可能耗时较长导致网关超时，在leyou-gateway配置超时时间

```
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 5000 # 设置hystrix的超时时间5秒
```

### 测试结果

![1532270167684](https://cdn.tencentfs.clboy.cn/images/2021/20210911203302964.png)



## 页面渲染

### 渲染规格过滤条件

首先把后台传递过来的specs添加到filters数组：

要注意：分类、品牌的option选项是对象，里面有name属性，而specs中的option是简单的字符串，所以需要进行封装，变为相同的结构：

```javascript
//遍历规格参数添加到过滤参数中
data.specs.forEach(item => {
    let other = -1;
    item.options = item.options.map(function (item, index) {
        if (item == '其它' || item == '其他') {
            other = index;
        }
        return {name: item};
    });
    //将'其他'放到最后
    other != -1 && item.options.push(item.options.splice(other, 1)[0]);
    //添加
    this.filters.push(item);
});
```



### 展示或收起过滤条件

是不是感觉显示的太多了，我们可以通过按钮点击来展开和隐藏部分内容：

![1532271362148](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303270.png)

我们在data中定义变量，记录展开或隐藏的状态：

![1532271577293](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303325.png)

然后在按钮绑定点击事件，以改变show的取值：

```html
<div class="type-wrap" style="text-align: center">
    <v-btn small flat @click="show=true" v-show="!show">
        更多
        <v-icon>arrow_drop_down</v-icon>
    </v-btn>
    <v-btn small="" flat @click="show=false" v-show="show">
        收起
        <v-icon>arrow_drop_up</v-icon>
    </v-btn>
</div>
```



在展示规格时，对show进行判断：

![1532272262743](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303383.png)

OK！



## 过滤条件的筛选

当我们点击页面的过滤项，要做哪些事情？

- 把过滤条件保存在search对象中（watch监控到search变化后就会发送到后台）
- 在页面顶部展示已选择的过滤项
- 把商品分类展示到顶部面包屑



## 保存过滤项

### 定义属性

我们把已选择的过滤项保存在search中：

![1532273487583](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303595.png)

要注意，在created构造函数中会对search进行初始化，所以要在构造函数中对filter进行初始化：

![1533566768364](https://cdn.tencentfs.clboy.cn/images/2021/20210911203310229.png)

search.filter是一个对象，结构：

```js
{
    "过滤项名":"过滤项值"
}
```



### 绑定点击事件

给所有的过滤项绑定点击事件：

![1532272879418](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303485.png)

要注意，点击事件传2个参数：

- k：过滤项的key
- option：当前过滤项对象

在点击事件中，保存过滤项到`selectedFilter`：

```javascript
selectFilter(k, option) {
    //由于新增加的元素不会被vue监测到，所以采用对filters进行重新赋值的方法
    const temp = {};
    Object.assign(temp, this.search.filters);
    if (k === '分类' || k === '品牌') {
        temp[k] = option.id;
    } else {
        temp[k] = option.name;
    }
    //再赋值给search的filters
    this.search.filters = temp;
}
```

另外，这里search对象中嵌套了filters对象，请求参数格式化时需要进行特殊处理，修改common.js中的一段代码：

![1576072508268](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320512.png)

![1532273144046](https://cdn.tencentfs.clboy.cn/images/2021/20210911203303538.png)



我们刷新页面，点击后通过浏览器功能查看`search.filters`的属性变化：

并且，此时浏览器地址也发生了变化：

```
http://www.leyou.com/search.html?key=手机&page=1&filters.后置摄像头=1000-1500万&filters.CPU品牌=海思（Hisilicon）&filters.CPU核数=十核&filters.品牌=18374
```

网络请求也正常发出：



## 后台添加过滤条件

既然请求已经发送到了后台，那接下来我们就在后台去添加这些条件：

### 拓展请求对象

我们需要在请求类：`SearchRequest`中添加属性，接收过滤属性。过滤属性都是键值对格式，但是key不确定而且还是中文，所以用一个map来接收即可。

 ```java
private Map<String, String> filters = new HashMap<>();
 ```



### 添加过滤条件

目前，我们的基本查询是这样的：

![1533567897849](https://cdn.tencentfs.clboy.cn/images/2021/20210911203310280.png)

现在，我们要把页面传递的过滤条件也加入进去。

因此不能在使用普通的查询，而是要用到BooleanQuery，基本结构是这样的：

```json
GET goods/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "all": {
              "query": "手机",
              "operator": "and"
            }
          }
        }
      ],
      "filter": {
        "term": {
          "brandId": "18374"
        }
      }
    }
  }
}
```

所以，我们对原来的基本查询进行改造：（SearchService中的search方法）

![1543674461682](https://cdn.tencentfs.clboy.cn/images/2021/20210911203317039.png)

![1543674644998](https://cdn.tencentfs.clboy.cn/images/2021/20210911203317091.png)

因为比较复杂，我们将其封装到一个方法中了

```
@Override
public SearchResult searchGoods(SearchRequest searchRequest) {
    String key = searchRequest.getKey();
    // 判断是否有搜索条件，如果没有，直接返回null。不允许搜索全部商品
    if (StringUtils.isBlank(key)) {
        return null;
    }
    //构建查询条件
    NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder();
    QueryBuilder boolQueryBuilder = this.buildBooleanQueryBuilder(searchRequest);
    builder.withQuery(boolQueryBuilder);

    //添加对分类的聚合
    builder.addAggregation(AggregationBuilders.terms("categoryAgg").field("cid3"));
    //添加对品牌的聚合
    builder.addAggregation(AggregationBuilders.terms("brandAgg").field("brandId"));

    //通过sourceFilter设置返回的结果字段,我们只需要spu的id、skus、subTitle
    builder.withSourceFilter(new FetchSourceFilter(
            new String[]{"id", "skus", "subTitle"}, null));

    //添加排序
    if (StringUtils.isNotBlank(searchRequest.getSortBy())) {
        builder.withSort(SortBuilders.fieldSort(searchRequest.getSortBy()).order(searchRequest.getDescending() ? SortOrder.DESC : SortOrder.ASC));
    }

    //分页,页码从0开始
    builder.withPageable(PageRequest.of(searchRequest.getPage() - 1, searchRequest.getSize()));

    //执行查询
    AggregatedPage<Goods> searchResult = (AggregatedPage<Goods>) goodsRepository.search(builder.build());

    //获取聚合结果
    List<Map<String, Object>> categoryDatas = this.getCategoryAggregation(searchResult.getAggregation("categoryAgg"));
    List<Brand> brands = this.getBrandAggregation(searchResult.getAggregation("brandAgg"));

    //判断聚合出的分类是否是1个，如果是1个则进行该分类的规格参数聚合
    List<Map<String, Object>> specs = null;
    if (!CollectionUtils.isEmpty(categoryDatas) && categoryDatas.size() == 1) {
        specs = this.getSpecAggregation((Long) categoryDatas.get(0).get("id"), boolQueryBuilder);
    }

    //封装分页数据
    SearchResult searchPageResult = new SearchResult(searchResult.getTotalElements(), searchResult.getTotalPages(), searchResult.getContent(), categoryDatas, brands);
    //添加聚合出的规格参数到搜索结果中，没有查询就是null
    searchPageResult.setSpecs(specs);
    return searchPageResult;
}

/**
 * 构建布尔查询对象
 *
 * @param searchRequest
 * @return
 */
private QueryBuilder buildBooleanQueryBuilder(SearchRequest searchRequest) {
    BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
    // 添加基本查询条件
    boolQueryBuilder.must(QueryBuilders.matchQuery("all", searchRequest.getKey()).operator(Operator.AND));

    // 添加过滤条件
    if (CollectionUtils.isEmpty(searchRequest.getFilters())) {
        return boolQueryBuilder;
    }

    searchRequest.getFilters().forEach((key, val) -> {
        if ("品牌".equals(key)) {
            //品牌过滤brandId
            key = "brandId";
        } else if ("分类".equals(key)) {
            //分类过滤cid3
            key = "cid3";
        } else {
            // 如果是规格参数名，过滤字段名：specs.key.keyword
            key = "specs." + key + ".keyword";
        }

        //添加到过滤中
        boolQueryBuilder.filter(QueryBuilders.termQuery(key, val));
    });

    return boolQueryBuilder;
}
```

其它不变。



## 页面展示选择的过滤项

### 商品分类面包屑

当用户选择一个商品分类以后，我们应该在过滤模块的上方展示一个面包屑，把三级商品分类都显示出来。

 ![1526912181355](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242256.png)

用户选择的商品分类就存放在`search.filters`中，但是里面只有第三级分类的id：cid3

我们需要根据它查询出1-3级分类的id及名称

### 提供查询分类接口

我们在商品微服务中提供一个根据三级分类id查询1~3级分类集合的方法：

> Controller

```java
@GetMapping("all/level")
public ResponseEntity<List<Category>> queryAllByCid3(@RequestParam("id") Long id) {
    List<Category> list = this.categoryService.queryAllByCid3(id);
    if (CollectionUtils.isEmpty(list)) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(list);
}
```

> Service

```java
    @Override
    public List<Category> queryAllByCid3(Long id) {
        Category c3 = this.categoryMapper.selectByPrimaryKey(id);
        Category c2 = this.categoryMapper.selectByPrimaryKey(c3.getParentId());
        Category c1 = this.categoryMapper.selectByPrimaryKey(c2.getParentId());
        return Arrays.asList(c1, c2, c3);
    }
}
```

测试：

![1576121418140](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320563.png)



### 页面展示面包屑

后台提供了接口，下面的问题是，我们在哪里去查询接口？

大家首先想到的肯定是当用户点击以后。

但是我们思考一下：用户点击以后，就会重新发起请求，页面刷新，那么你渲染的结果就没了。

因此，应该是在页面重新加载完毕后，此时因为过滤条件中加入了商品分类的条件，所以查询的结果中只有1个分类。

我们判断商品分类是否只有1个，如果是，则查询三级商品分类，添加到面包屑即可。

![1526914910479](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242532.png)

渲染：

 ```
<!--面包屑-->
<ul class="fl sui-breadcrumb">
    <li><span>全部结果:</span></li>
    <li v-for="(category,index) in breads" :key="index">
        <a href="#" v-if="index!=breads.length-1">{{category.name}}</a>
        <span v-else>{{category.name}}</span>
    </li>
</ul>
 ```

```javascript
//判断分类是否只有一个，一个的情况下查询分类面包屑
if (data.categories.length == 1) {
    ly.http.get("/item/category/all/level", {params: {id: data.categories[0].id}}).then(resp => {
        this.breads = resp.data;
    });
}
```

刷新页面：

 ![1526914954839](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242679.png)



## 其它过滤项

接下来，我们需要在页面展示用户已选择的过滤项，如图：

![1526911364625](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241961.png)

我们知道，所有已选择过滤项都保存在`search.filters`中，因此在页面遍历并展示即可。

但这里有个问题，filters中数据的格式：

![1576123329282](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320613.png)

基本有四类数据：

- 商品分类：这个不需要展示，分类展示在面包屑位置
- 品牌：这个要展示，但是其值不合适，我们不能显示一个id在页面。需要找到其name值
- 数值类型规格：这个展示的时候，需要把单位查询出来
- 非数值类型规格：这个直接展示其值即可

因此，我们在页面上这样处理：

```html
<!--已选择过滤项-->
<ul class="tags-choose">
    <li class="tag" v-for="(value,key) in search.filters" v-if="key!=='分类'">
        {{key}}:<span style="color: red">{{getFilterValue(key,value)}}</span>
        <i class="sui-icon icon-tb-close"></i>
    </li>
</ul>
```

- 判断如果 `k === '分类'`说明是商品分类，直接忽略
- 判断`k === '品牌'`说明是品牌，但是值只有品牌id需要的是品牌名称
- 值的处理比较复杂，我们用一个方法`getFilterValue(k,v)`来处理，调用时把`k`和`v`都传递

方法内部：

```javascript
getFilterValue(k, v) {
    // 如果没有过滤参数，我们跳过展示
    if (!this.filters || this.filters.length === 0) {
        return null;
    }
    // 判断是否是品牌
    if (k === '品牌') {
        // 返回品牌名称
        return this.filters.find(f => f.k === '品牌').options[0].name;
    }
    return v;
}
```

然后刷新页面，即可看到效果：

 ![1526911811998](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242108.png)



## 隐藏已经选择的过滤项

现在，我们已经实现了已选择过滤项的展示，但是你会发现一个问题：

已经选择的过滤项，在过滤列表中依然存在：

![1526915075037](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242815.png)



这些已经选择的过滤项，应该从列表中移除。

怎么做呢？

你必须先知道用户选择了什么。用户选择的项保存在`search.filters`中：

 ![1526915191753](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242952.png)

我们可以编写一个计算属性，把filters中的 已经被选择的key过滤掉：

```javascript
computed: {
    remainFilters() {
        const keys = Object.keys(this.search.filters);
        //过滤掉在当前搜索筛选条件中的筛选条件组，比如选择了一个品牌，查询后就不应该再有关于品牌的筛选
        return this.filters.filter(f => !keys.includes(f.k));
    }
}
```

然后页面不再直接遍历`filters`，而是遍历`remainFilters`

![1526916315470](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243092.png)

刷新页面：

![1526916538925](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243232.png)



最后发现，还剩下一堆没选过的。但是都只有一个可选项，此时再过滤没有任何意义，应该隐藏，所以，在刚才的过滤条件中，还应该添加一条：如果只剩下一个可选项，不显示

![1526916815264](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243381.png)



![1526916838222](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243536.png)





## 取消过滤项

我们能够看到，每个过滤项后面都有一个小叉，当点击后，应该取消对应条件的过滤。

思路非常简单：

- 给小叉绑定点击事件
- 点击后把过滤项从`search.filters`中移除，页面会自动刷新，OK



> 绑定点击事件：

![1526955150293](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243695.png)

绑定点击事件时，把k传递过去，方便删除

> 删除过滤项

```javascript
removeFilter(k){
    this.search.filters[k] = null;
}
```





## 可优化项

搜索系统需要优化的点：

- 查询规格参数部分可以添加缓存 
- 聚合计算interval变化频率极低，所以可以设计为定时任务计算（周期为天），然后缓存起来。
- elasticsearch本身有查询缓存，可以不进行优化
- 商品图片应该采用缩略图，减少流量，提高页面加载速度
- 图片采用延迟加载
- 图片还可以采用CDN服务器
- sku信息应该在页面异步加载，而不是放到索引库





