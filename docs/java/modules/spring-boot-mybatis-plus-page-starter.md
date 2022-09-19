# mybatis plus 分页排序安全处理



## Page对象

mybatis plus提供了 `com.baomidou.mybatisplus.extension.plugins.pagination.Page` 对象用于分页处理

该对象实现了 `com.baomidou.mybatisplus.core.metadata.IPage` 接口

只要`mapper`接口的方法中含有`IPage`类型的参数就可以自动接入分页，前提是注册上[分页插件](https://baomidou.com/pages/97710a/#paginationinnerinterceptor)

我们也可以在 `controller` 中直接用 `page` 对象当作参数接收对象，接口的返回结果

```java
@GetMapping("/page")
public Page<Goods> page(Page<Goods> page) {
    return goodsService.page(page);
}
```

这样做的好处就是 `spring mvc` 帮我们转换好参数实例化 `page` 对象之后我们直接往`service>mapper` 传递即可，不用再定义自己的Page对象，然后每个分页接口都要自己在代码中再手动转为 `IPage` 类型

更多Page对象的使用细节不是这里需要关注的重点。



## orders属性

page对象有个orders属性，分页插件会按顺序将所有 `OrderItem` 转换为排序sql拼接到查询语句后面

```java
@Setter
protected List<OrderItem> orders = new ArrayList<>();
```

下面是 `OrderItem` 的两个属性

```java
/**
 * 需要进行排序的字段
 */
private String column;
/**
 * 是否正序排列，默认 true
 */
private boolean asc = true;
```

!> column属性值必须和数据库字段一致，分页插件是直接取 `column` 属性的值拼接到 `order by` 后面

一般这种分页接口我们都会采用 `get` 请求格式，对于`List<OrderItem>` 这种参数需要用下面这种格式传参

```http
GET /demo/page?current=1&size=5&orders[0].column=create_time&orders[0].asc=false&orders[1].column=price&orders[1].asc=false
Host: 127.0.0.1:10001
```

前端使用 `Axios` 写法

```javascript
axios.get("http://127.0.0.1:10001/demo/page", {
    params: {
        current: 1,
        size: 5,
        orders: [
            {
                column: 'create_time',
                asc: false
            },
            {
                column: 'price',
                asc: false
            }
        ]
    },
    paramsSerializer: function (params) {
        return Qs.stringify(params, {arrayFormat: 'indices', allowDots: true})
    },
})
```



## orders的问题

1. 一般我们数据库字段多个单词组成的字段名都使用的是下划线分割而非大小写，而在程序中我们习惯用大小写驼峰命名，然后由 `mybatis plus` 自动帮我们根据注解进行转换，前端传递到后端的参数名也一般都是大小写形式。但是分页插件是不会帮我们转换，这就会造成前端传参时的困扰

2. 由于分页插件是直接将排序字段拼接到查询语句的后面，这样就会后sql注入的风险，例如下面这条请求

   ```http
   GET /demo/page?current=1&size=5&orders[0].column=create_time&orders[0].asc=false&orders[1].column=price;SELECT * FROM goods WHERE price=?;DROP TABLE goods; -- &orders[1].asc=false HTTP/1.1
   Host: 127.0.0.1:10001
   ```

3. 可排序字段不好统一控制，只要前端传过来的列名和数据库列名匹配就会执行成功，如果表数据量很多，又恶意请求没有索引的字段排序，数据库压力山大啊，难道要每个接口都要对 `page` 参数进行 `orders` 处理？

4. 请求查询参数略显臃肿

   ```http
   /demo/page?current=1&size=5&orders%5B0%5D.column=create_time&orders%5B0%5D.asc=false&orders%5B1%5D.column=price&orders%5B1%5D.asc=false
   ```

   - **一、如果改成下面这种参数会不会清晰很多(但是这种不好前端自定义排序优先级，可由后端限定死优先级，我采用的就是这种方案)**

     ```http
     /demo/page?current=1&size=5&descending=create_time,price
     ```

     ```http
     /demo/page?current=1&size=5&ascending=create_time&descending=price
     ```

   - **二、** 如果想由前端决定优先级，比如用户最后选择的排序方式优先级最高

     前端按顺序排好后提交给后端

     ```http
     /demo/page?current=1&size=5&orders=price.desc,create_time.asc
     ```

     

## 解决问题

### Sortable注解

首先创建一个注解，该注解的用处是标注在 `page`对象泛型对应的模型类字段上，来告诉程序该注解标注的字段是可以排序的

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Sortable {

    /**
     * @return 排序优先级, 值越小，优先级越高
     */
    int sortPriority() default 0;

    /**
     * @return 查询时对应列名
     */
    String column() default "";
}
```

接口和模型类

```java
@GetMapping("/page")
public Page<Goods> page(Page<Goods> page) {
    return goodsService.page(page);
}
```

```java
@Data
public class Goods {
    @TableId
    private Integer id;
    private String name;

    @Sortable
    private BigDecimal price;

    @Sortable(sortPriority = 1)
    private LocalDateTime createTime;
}
```



### 参数解析器

> 参数解析器是spring mvc提供的，可对controller接口中方法指定类型的参数进行处理，然后返回该类型的实例，最终实例会传递到controller

在 `springboot` 中自定义参数解析器只需要两步

1. 实现 `org.springframework.web.method.support.HandlerMethodArgumentResolver` 接口

2.  定义一个 `@Configuration` 配置类实现 `org.springframework.web.servlet.config.annotation.WebMvcConfigurer`接口重写 `addArgumentResolvers` 方法

   ```java
   default void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
       resolvers.add(你的参数解析器);
   } 
   ```



### Page参数解析器

接下来实现一个针对 `page`参数的解析器

```java
public class MybatisPlusPageArgumentResolver implements HandlerMethodArgumentResolver {

    /**
     * 判断参数是不是Page类型
     *
     * @param parameter 参数
     * @return 是否支持该参数
     */
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().equals(Page.class);
    }

    /**
     * 只支持查询GET请求,POST需要解析请求体
     */
    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {

        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        String current = request.getParameter(CURRENT_PAGE_PARAMETER_NAME);
        String size = request.getParameter(SIZE_PARAMETER_NAME);

        Page page = new Page();
        if (StringUtils.hasText(current)) {
            page.setCurrent(Long.parseLong(current));
            if (page.getCurrent() <= 1) {
                page.setCurrent(1);
            }
        }

        if (StringUtils.hasText(size)) {
            page.setSize(Long.parseLong(size));
            Assert.isTrue(page.getSize() <= ALLOW_MAX_PAGE_SIZE, "page size max value allowed is " + ALLOW_MAX_PAGE_SIZE);
        }
        //TODO 解析排序
        page.setOrders(parseOrder(request, parameter));
        return page;
    }
    
    
    /**
     * 当前页参数名
     */
    private static final String CURRENT_PAGE_PARAMETER_NAME = "current";

    /**
     * 总条数参数名
     */
    private static final String SIZE_PARAMETER_NAME = "size";

    /**
     * 升序字段参数名
     */
    private static final String ASCENDING_PARAMETER_NAME = "ascending";

    /**
     * 降序字段参数名
     */
    private static final String DESCENDING_PARAMETER_NAME = "descending";

    /**
     * 允许最大size
     */
    private static final long ALLOW_MAX_PAGE_SIZE = 1000L;

}
```



### 解析排序

接下来定义一个`SortableFieldInfo` 类，该类目的是对排序自定进行解析包装

```java
@Getter
@AllArgsConstructor
public class SortableFieldInfo {

    /**
     * 原始属性
     */
    private final Field field;

    /**
     * 字段名
     */
    private final String column;

    /**
     * 属性名
     */
    private final String property;

    /**
     * 排序优先级
     */
    private final int sortPriority;
}
```

再定义一个 `PageInfoHelper` 工具类对一个类中的排序字段进行解析并包装成 `SortableFieldInfo` 放入缓存中

```java
public class PageInfoHelper {

    /**
     * 可排序字段缓存
     */
    private static final Map<Class<?>, Map<String, SortableFieldInfo>> SORTABLE_FIELD_INFO_CACHE = new ConcurrentHashMap<>();

    public static Map<String, SortableFieldInfo> getSortableFieldInfo(Class<?> clazz) {
        if (clazz == null || clazz.isPrimitive() || SimpleTypeRegistry.isSimpleType(clazz) || clazz.isInterface()) {
            return Collections.emptyMap();
        }
        return SORTABLE_FIELD_INFO_CACHE.computeIfAbsent(clazz, cz -> ReflectionKit.getFieldList(ClassUtils.getUserClass(clazz)).stream()
                .filter(field -> field.getAnnotation(Sortable.class) != null)
                .map(field -> {
                    Sortable sortable = field.getAnnotation(Sortable.class);
                    String column = StringUtils.isNotBlank(sortable.column()) ? sortable.column() : StringUtils.camelToUnderline(field.getName());
                    return new SortableFieldInfo(field, column, field.getName(), sortable.sortPriority());
                }).flatMap(info -> {
                    //将属性名和column都加入map，这样前端既可以传属性名也可以传列名
                    Map.Entry<String, SortableFieldInfo> propertyEntry = new AbstractMap.SimpleEntry<>(info.getProperty(), info);
                    return info.getColumn().equals(info.getProperty()) ?
                            Stream.of(propertyEntry) :
                            Stream.of(propertyEntry, new AbstractMap.SimpleEntry<>(info.getColumn(), info));
                }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
    }
}
```

接下来回到 `MybatisPlusPageArgumentResolver` 参数解析器实现 `parseOrder`方法

```java
private List<OrderItem> parseOrder(HttpServletRequest request, MethodParameter parameter) {
    //从请求中获取升序和降序两个参数
    String[] ascending = request.getParameterValues(ASCENDING_PARAMETER_NAME);
    String[] descending = request.getParameterValues(DESCENDING_PARAMETER_NAME);
    if (ascending == null && descending == null) {
        return Collections.emptyList();
    }
    //获取page泛型的类型
    Class<?> clazz = ResolvableType.forMethodParameter(parameter).getGeneric(0).resolve();
    //获取泛型类中的可排序字段
    Map<String, SortableFieldInfo> sortableFieldInfo = PageInfoHelper.getSortableFieldInfo(clazz);
    if (CollectionUtils.isEmpty(sortableFieldInfo)) {
        return Collections.emptyList();
    }
    //对两个排序参数处理。1.逗号拆分，2.过滤掉非可排序字段，3.去重，4.转换为OrderItem
    List<OrderItem> orderItemList = new ArrayList<>();
    Optional.ofNullable(ascending).ifPresent(s -> orderItemList.addAll(Arrays.stream(s)
            .flatMap(s1 -> StringUtils.commaDelimitedListToSet(s1).stream())
            .filter(sql -> sortSqlFilter(sql, sortableFieldInfo))
            .distinct()
            .map(sc -> OrderItem.asc(sortableFieldInfo.get(sc).getColumn()))
            .collect(Collectors.toList())));
    Optional.ofNullable(descending).ifPresent(s -> orderItemList.addAll(Arrays.stream(s)
            .flatMap(s1 -> StringUtils.commaDelimitedListToSet(s1).stream())
            .filter(sql -> sortSqlFilter(sql, sortableFieldInfo))
            .distinct()
            .map(sc -> OrderItem.desc(sortableFieldInfo.get(sc).getColumn()))
            .collect(Collectors.toList())));
    //进行优先级排序
    orderItemList.sort(Comparator.comparingInt(o -> sortableFieldInfo.get(o.getColumn()).getSortPriority()));
    return orderItemList;
}

private boolean sortSqlFilter(String sql, Map<String, SortableFieldInfo> sortableFields) {
    return StringUtils.hasText(sql) && sortableFields.containsKey(sql);
}
```

到此后端的逻辑就处理完了，下面的前端代码简单参考：

```html
<body>
<script src="https://unpkg.com/vue@3.2.37/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/axios@0.27.2/dist/axios.min.js"></script>

<div id="app">
    <div>
        <div class="sort-item" :class="{descending:pageSort.createTime==1,ascending:pageSort.createTime==2}"
             @click="swapSort('createTime')">
            <span>创建时间</span>
            <span class="sort-icon">
                    <i class="sort-caret ascending"></i>
                    <i class="sort-caret descending"></i>
                </span>
        </div>
        <div class="sort-item" :class="{descending:pageSort.price==1,ascending:pageSort.price==2}"
             @click="swapSort('price')">
            <span>价格</span>
            <span class="sort-icon">
                    <i class="sort-caret ascending"></i>
                    <i class="sort-caret descending"></i>
                </span>
        </div>
    </div>
    <div style="clear:both"></div>
    <div>
        <ul>
            <li v-for="goods in goodsList" class="line-item">
                <span>标题：{{goods.name}}</span>
                <span>价格：{{goods.price}}</span>
                <span>发布时间： {{goods.createTime}}</span>
            </li>
        </ul>
    </div>

</div>

<script>
    const {createApp} = Vue
    const api = '/demo/page'
    createApp({
        data() {
            return {
                pageSort: {
                    createTime: 0,//0:不排序，1：降序，2：升序
                    price: 0
                },
                goodsList: []
            }
        },
        methods: {
            swapSort(field) {
                if (isNaN(this.pageSort[field]) || this.pageSort[field] < 0 || this.pageSort[field] >= 2) {
                    this.pageSort[field] = 0;
                } else {
                    this.pageSort[field]++;
                }
            }
        },
        watch: {
            pageSort: {
                handler(newValue, oldValue) {
                    let params = {
                        current: 1,
                        size: 10
                    };
                    //所有升序字段
                    let ascending = Object.keys(newValue).filter(f => newValue[f] === 2).join(',');
                    if (ascending) params.ascending = ascending;
                    //所有降序字段
                    let descending = Object.keys(newValue).filter(f => newValue[f] === 1).join(',');
                    if (descending) params.descending = descending;
                    axios.get(api, {params}).then(res => {
                        this.goodsList = res.data.records;
                    });
                },
                deep: true
            }
        },
        mounted() {
            axios.get(api).then(res => {
                this.goodsList = res.data.records;
            });
        }
    }).mount('#app')
</script>
</body>
```



## 源码

[spring-boot-mybatis-plus-page-starter](https://github.com/cloudlandboy/java-utils/tree/master/spring-boot-mybatis-plus-page-starter)
