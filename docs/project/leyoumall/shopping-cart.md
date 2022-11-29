# 购物车服务



## 搭建购物车服务

> `leyou-cart`



## pom依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-parent</artifactId>
        <groupId>com.leyou</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.leyou.cart</groupId>
    <artifactId>leyou-cart</artifactId>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
    </dependencies>

</project>
```



## 配置文件

```yaml
server:
  port: 7008
spring:
  application:
    name: cart-service
  redis:
    host: 172.16.145.141
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
    registry-fetch-interval-seconds: 10
  instance:
    lease-renewal-interval-in-seconds: 5
    lease-expiration-duration-in-seconds: 15
```



## 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class LeyouCartServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeyouCartServiceApplication.class, args);
    }
}
```



## 购物车功能分析

### 需求

需求描述：

- 用户可以在登录状态下将商品添加到购物车
  - 放入数据库
  - mongodb（推荐）
  - 放入redis（采用）
- 用户可以在未登录状态下将商品添加到购物车
  - 放入localstorage
  - cookie
  - webSQL
- 用户可以使用购物车一起结算下单
- 用户可以查询自己的购物车
- 用户可以在购物车中修改购买商品的数量。
- 用户可以在购物车中删除商品。
- 在购物车中展示商品优惠信息
- 提示购物车商品价格变化



### 流程图

![1527585343248](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248838.png)



这幅图主要描述了两个功能：新增商品到购物车、查询购物车。

新增商品：

- 判断是否登录
  - 是：则添加商品到后台Redis中
  - 否：则添加商品到本地的Localstorage

无论哪种新增，完成后都需要查询购物车列表：

- 判断是否登录
  - 否：直接查询localstorage中数据并展示
  - 是：已登录，则需要先看本地是否有数据，
    - 有：需要提交到后台添加到redis，合并数据，而后查询
    - 否：直接去后台查询redis，而后返回



## 未登录时购物车实现

### 准备

### 购物车的数据结构

首先分析一下未登录购物车的数据结构。

我们看下页面展示需要什么数据：

![1527737419294](https://cdn.tencentfs.clboy.cn/images/2021/20210911203249043.png)

因此每一个购物车信息，都是一个对象，包含：

```js
{
    skuId:2131241,
    title:"小米6",
    image:"",
    price:190000,
    num:1,
    ownSpec:"{"机身颜色":"陶瓷黑尊享版","内存":"6GB","机身存储":"128GB"}"
}
```

另外，购物车中不止一条数据，因此最终会是对象的数组。即：

```js
[
    {...},{...},{...}
]
```



### web本地存储

知道了数据结构，下一个问题，就是如何保存购物车数据。前面我们分析过，可以使用Localstorage来实现。Localstorage是web本地存储的一种，那么，什么是web本地存储呢？

#### 什么是web本地存储？

![1527587496457](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248941.png)



web本地存储主要有两种方式：

- LocalStorage：localStorage 方法存储的数据没有时间限制。第二天、第二周或下一年之后，数据依然可用。 
- SessionStorage：sessionStorage 方法针对一个 session 进行数据存储。当用户关闭浏览器窗口后，数据会被删除。 



#### LocalStorage的用法

语法非常简单：

![1533739711101](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311478.png)

```js
localStorage.setItem("key","value"); // 存储数据
localStorage.getItem("key"); // 获取数据
localStorage.removeItem("key"); // 删除数据
```

注意：**localStorage和SessionStorage都只能保存字符串**。

不过，在我们的common.js中，已经对localStorage进行了简单的封装：

![1533739810927](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311535.png)



示例：

![1533739929733](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311594.png)



### 获取num

添加购物车需要知道购物的数量，所以我们需要获取数量大小。我们在Vue中定义num，保存数量：

![1533740236299](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311653.png)

然后将num与页面的input框绑定，同时给`+`和`-`的按钮绑定事件：

![1533742284781](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311711.png)

编写方法：

![1533742493645](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311770.png)



### 添加购物车

#### 点击事件

我们看下商品详情页：

![1527585864482](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248889.png)

现在点击加入购物车会跳转到购物车成功页面。

不过我们不这么做，我们绑定点击事件，然后实现添加购物车功能。

![1533745246878](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311831.png)

addCart方法中判断用户的登录状态：

```js
addCart(){
   ly.http.get("/auth/verify").then(res=>{
       // 已登录发送信息到后台，保存到redis中
   }).catch(()=>{
       // 未登录保存在浏览器本地的localStorage中
   })
}
```



#### 获取数量，添加购物车

``` js
addCart() {
    ly.verifyUser().then(res => {
        // 已登录发送信息到后台，保存到redis中
    }).catch(() => {
        // 未登录保存在浏览器本地的localStorage中
        //1. 获取localStorage中的购物车
        let carts = ly.store.get("carts") || [];
        //2. 查看当前商品在购物车中是否已经存在
        let cart = carts.find(c => c.skuId === this.sku.id);
        if (cart) {
            // 3、存在更新数量
            cart.num += this.num;
        } else {
            // 4、不存在，新增

            //将规格参数专为k，v
            let ownSpec = JSON.parse(this.sku.ownSpec);
            let temp = {};
            for (let k in paramMap) {
                temp[paramMap[k]] = ownSpec[k];
            }
            cart = {
                skuId: this.sku.id,
                title: this.sku.title,
                price: this.sku.price,
                image: this.images[0],
                num: this.num,
                ownSpec: temp
            };
            //添加到购物车中
            carts.push(cart);
        }

        // 把carts写回localstorage
        ly.store.set("carts", carts);
        // 跳转到购物车页面
        location.href = "http://www.leyou.com/cart.html";
    })
}
```

!> 将nginx中详情页静态化的配置暂时注释掉，否则每次修改页面都要先手动删除生成静态的静态页面，需要改

结果：

![1533785968759](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311882.png)

添加完成后，页面会跳转到购物车结算页面：cart.html



### 查询购物车

#### 校验用户登录

因为会多次校验用户登录状态，因此我们封装一个校验的方法：

在common.js中：

![1533788637942](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311934.png)

```javascript
verifyUser() {
    return this.http.get("/auth/verify");
},
```

在页面item.html中使用该方法：

![1533788722957](https://cdn.tencentfs.clboy.cn/images/2021/20210911203311987.png)



#### 查询购物车

页面加载时，就应该去查询购物车。

```java
var cartVm = new Vue({
    el: "#cartApp",
    data: {
        ly,
        carts: [],// 购物车数据
        selected: [], //勾选的商品
    },
    created() {
        this.loadCarts();
    },
    methods: {
        loadCarts() {
            // 先判断登录状态
            ly.verifyUser().then(() => {
                    // 已登录

                }).catch(() => {
                    // 未登录
                    this.carts = ly.store.get("carts") || [];
                    this.selected = this.carts;
                })
           }
    }
    components: {
        shortcut: () => import("/js/pages/shortcut.js")
    }
})
```

刷新页面，查看控制台Vue实例：

![1533806610234](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321551.png)



#### 渲染到页面

接下来，我们在页面中展示carts的数据：

![1576560430847](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321603.png)

```html
<ul class="goods-list yui3-g" v-for="(cart,index) in carts" :key="index">
    <li class="yui3-u-1-24">
        <input type="checkbox" v-model="selected" name="selected" />
    </li>
    <li class="yui3-u-11-24">
        <div class="good-item">
            <div class="item-img"><img :src="cart.image" width="80px" height="80px" />
            </div>
            <div class="item-msg">
                <span style="line-height:70px ">{{cart.title}}</span>
                <br>
                <span style="padding: 0 10px" v-for="(v,k) in cart.ownSpec" :key="k">{{k}}：{{v}}</span>
            </div>
        </div>
    </li>

    <li class="yui3-u-1-8"><span style="line-height:70px " class="price">{{ly.formatPrice(cart.price)}}</span>
    </li>
    <li class="yui3-u-1-8" style="padding-top: 20px">
        <a href="javascript:void(0)" class="increment mins">-</a>
        <input autocomplete="off" type="text" disabled v-model="cart.num" minnum="1" class="itxt" />
        <a href="javascript:void(0)" class="increment plus">+</a>
    </li>
    <li class="yui3-u-1-8"><span style="line-height:70px " class="sum">{{ly.formatPrice(cart.price*cart.num)}}</span>
    </li>
    <li class="yui3-u-1-8">
        <a href="#none">删除</a><br />
        <a href="#none">移到我的关注</a>
    </li>
</ul>
```



要注意，价格的展示需要进行格式化，这里使用的是我们在common.js中定义的formatPrice方法

效果：

![1576560499097](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321656.png)



### 修改数量

我们给页面的 `+` 和 `-`绑定点击事件，修改num 的值：

![1533806715698](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312263.png)

两个事件：

```js
    increment(c) {
        c.num++;
        ly.verifyUser().then(() => {
            // TODO 已登录，向后台发起请求
        }).catch(() => {
            // 未登录，直接操作本地数据
            ly.store.set("carts", this.carts);
        })
    },
    decrement(c) {
        if (c.num <= 1) {
            return;
        }
        c.num--;
        ly.verifyUser().then(() => {
            // TODO 已登录，向后台发起请求
        }).catch(() => {
            // 未登录，直接操作本地数据
            ly.store.set("carts", this.carts);
        })
    }
```



### 删除商品

给删除按钮绑定事件：

```html
<li class="yui3-u-1-8">
    <a href="javascript:;" @click="deleteCart(index)">删除</a><br/>
    <a href="javascript:;">移到我的关注</a>
</li>
```

点击事件中删除商品：

```js
deleteCart(index){
    ly.verifyUser().then(res=>{
        // TODO，已登录购物车
    }).catch(()=>{
        // 未登录购物车
        this.carts.splice(index, 1);
        ly.store.set("carts", this.carts);
    })
}
```



### 选中商品

在页面中，每个购物车商品左侧，都有一个复选框，用户可以选择部分商品进行下单，而不一定是全部：

![1533808731995](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312366.png)

我们定义一个变量，记录所有被选中的商品：

![1533816012100](https://cdn.tencentfs.clboy.cn/images/2021/20210911203313109.png)



#### 选中一个

我们给商品前面的复选框与selected绑定，并且指定其值为当前购物车商品：

```html
<li class="yui3-u-1-24">
    <input type="checkbox" v-model="selected" name="selected" value="cart"/>
</li>
```



#### 初始化全选

我们在加载完成购物车查询后，初始化全选：

![1533809253022](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312469.png)

#### 全选与取消全选

定义变量，并监听

``` js
data: {
    ly: ly,
    carts: [],// 购物车数据
    selected: [], //勾选的商品
    checkedAll: true //是否全选
},
watch: {
    checkedAll(nv) {
        if (nv) {
            this.selected = this.carts;
        } else {
            this.selected.length == this.carts.length ? this.selected = [] : null;
        }
    },
    selected(v) {
        //监听选择，长度相等即全选
        this.checkedAll = (v.length == this.carts.length);
    }
},
```

页面有两个全选

```
<input type="checkbox" v-model="checkedAll"/>
```

#### 总价格

然后编写一个计算属性，计算出选中商品总价格：

```js
computed: {
    totalPrice() {
        return ly.formatPrice(this.selected.reduce((c1, c2) => c1 + c2.num * c2.price, 0));
    }
}
```

在页面中展示总价格：

![1533810788247](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312622.png)

效果：

![1533810760802](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312570.png)



#### 删除选中商品

```html
<a href="javascript:;" @click="deleteSelected()">删除选中的商品</a>
```

```javascript
deleteSelected() {
    this.selected.forEach(value => {
        this.deleteCart(this.carts.indexOf(value));
    })
}
```



## 已登录购物车

接下来，我们完成已登录购物车。

在刚才的未登录购物车编写时，我们已经预留好了编写代码的位置，逻辑也基本一致。

### 添加登录校验

购物车系统只负责登录状态的购物车处理，因此需要添加登录校验，我们通过JWT鉴权即可实现。

### 引入JWT相关依赖

我们引入之前写的鉴权工具：`leyou-auth-common`

```xml
<dependency>
    <groupId>com.leyou.auth</groupId>
    <artifactId>leyou-auth-common</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

### 配置公钥

```yaml
leyou:
  jwt:
    pubKeyPath: /home/cloudlandboy/Project/leyou/rsa/rsa.pub # 公钥地址
    cookieName: LEYOU_TOKEN # cookie的名称
```

### 加载公钥

 ![1533811142851](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312673.png)



**配置类代码可从网关模块中copy**



### 编写拦截器

因为很多接口都需要进行登录，我们直接编写SpringMVC拦截器，进行统一登录校验。同时，我们还要把解析得到的用户信息保存起来，以便后续的接口可以使用。

 ![1533811351500](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312723.png)

代码：

```java
public class LoginInterceptor extends HandlerInterceptorAdapter {

    private JwtProperties jwtProperties;

    // 定义一个线程域，存放登录用户
    private static final ThreadLocal<UserInfo> tl = new ThreadLocal<>();

    public LoginInterceptor(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 查询token
        String token = CookieUtils.getCookieValue(request, "LY_TOKEN");
        if (StringUtils.isBlank(token)) {
            // 未登录,返回401
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
        // 有token，查询用户信息
        try {
            // 解析成功，证明已经登录
            UserInfo user = JwtUtils.getInfoFromToken(token, jwtProperties.getPublicKey());
            // 放入线程域
            tl.set(user);
            return true;
        } catch (Exception e){
            // 抛出异常，证明未登录,返回401
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        //请求返回后，需要手动清处threadlocal中的数据，因为使用的线程是连接池中的只会归还不会被清理
        tl.remove();
    }

    public static UserInfo getLoginUser() {
        return tl.get();
    }
}
```

注意：

- 这里我们使用了`ThreadLocal`来存储查询到的用户信息，线程内共享，因此请求到达`Controller`后可以共享User
- 并且对外提供了静态的方法：`getLoginUser()`来获取User信息





### 配置拦截器

配置SpringMVC，使过滤器生效：

 ![1533811609498](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312775.png)

```java
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class MvcConfig implements WebMvcConfigurer {

    @Autowired
    private JwtProperties jwtProperties;

    @Bean
    public LoginInterceptor loginInterceptor() {
        return new LoginInterceptor(jwtProperties);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor()).addPathPatterns("/**");
    }
}
```



## 后台购物车设计

当用户登录时，我们需要把购物车数据保存到后台，可以选择保存在数据库。但是购物车是一个读写频率很高的数据。因此我们这里选择读写效率比较高的Redis作为购物车存储。

Redis有5种不同数据结构，这里选择哪一种比较合适呢？Map<String, List<String>>

- 首先不同用户应该有独立的购物车，因此购物车应该以用户的作为key来存储，Value是用户的所有购物车信息。这样看来基本的`k-v`结构就可以了。
- 但是，我们对购物车中的商品进行增、删、改操作，基本都需要根据商品id进行判断，为了方便后期处理，我们的购物车也应该是`k-v`结构，key是商品id，value才是这个商品的购物车信息。

综上所述，我们的购物车结构是一个双层Map：Map<String,Map<String,String>> 

- 第一层Map，Key是用户id
- 第二层Map，Key是购物车中商品id（skuId），值是购物车数据



实体类：

```java
public class Cart {
    private Long userId;// 用户id
    private Long skuId;// 商品id
    private String title;// 标题
    private String image;// 图片
    private Long price;// 加入购物车时的价格
    private Integer num;// 购买数量
    private Map<String, String> ownSpec;// 商品规格参数
    
    //getter,setter略
}
```



## 添加商品到购物车

### 页面发起请求

已登录情况下，向后台添加购物车：

```
// 已登录发送信息到后台，保存到redis中
ly.http.post("/cart", {skuId: this.sku.id, num: this.num}).then(res => {
    location.href = "http://www.leyou.com/cart.html";
})
```

这里发起的是Json请求。那么我们后台也要以json接收。

这里只需要向后台提交商品的id和商品的数量，商品的具体信息后台需要调用商品服务的接口根据skuId查询sku。

> 为什么不不直接从页面传递？

1. 网络传输携带太多数据占用带宽
2. 不安全，通过页面可以修改商品的价格

### 编写controller

先分析一下：

- 请求方式：新增，肯定是Post
- 请求路径：/cart ，这个其实是Zuul路由的路径，我们可以不管（**别忘了在网关中配置**）
- 请求参数：Json对象，包含skuId和num属性
- 返回结果：无

```java
@Controller
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * 添加购物车
     *
     * @return
     */
    @PostMapping
    public ResponseEntity<Void> addCart(@RequestBody Cart cart) {
        this.cartService.addCart(cart);
        return ResponseEntity.ok().build();
    }
}
```

在leyou-gateway中添加路由配置：

![1533814103369](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312943.png)



### CartService

这里我们不访问数据库，而是直接操作Redis。基本思路：

- 先查询之前的购物车数据
- 判断要添加的商品是否存在
  - 存在：则直接修改数量后写回Redis
  - 不存在：新建一条数据，然后写入Redis

代码：

```java
@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private GoodsClient goodsClient;

    @Autowired
    private SpecificationClient specificationClient;

    @Autowired
    private StringRedisTemplate redisTemplate;

    public static final String KEY_PREFIX = "leyou:cart:uid:";

    @Override
    public void addCart(Cart cart) {

        //获取商品数量
        Integer num = cart.getNum();
        //获取用户信息
        UserInfo loginUser = LoginInterceptor.getLoginUser();
        //获取redis，hash类型的操作对象
        BoundHashOperations<String, Object, Object> hashOps = redisTemplate.boundHashOps(KEY_PREFIX + loginUser.getId());
        //查看用户购物车中是否已经存在该商品
        if (hashOps.hasKey(cart.getSkuId().toString())) {
            //存在更新数量
            String cartJson = hashOps.get(cart.getSkuId().toString()).toString();
            cart = JsonUtils.parse(cartJson, Cart.class);
            //修改数量
            cart.setNum(cart.getNum() + num);
        } else {
            //不存在添加
            //先根据skuId查询sku
            Sku sku = goodsClient.querySkuById(cart.getSkuId());
            String[] images = StringUtils.split(sku.getImages(), ",");
            cart.setImage(ArrayUtils.isEmpty(images) ? "" : images[0]);
            //查询特殊的规格参数，目的是在页面能够显示名称
            Map<Long, String> temp = JsonUtils.parseMap(sku.getOwnSpec(), Long.class, String.class);
            List<SpecParam> params = specificationClient.querySpecsByIds(new ArrayList<>(temp.keySet()));
            Map<String, String> paramsMapping = new HashMap<>();
            params.forEach(param -> {
                paramsMapping.put(param.getName(), temp.get(param.getId()));
            });
            cart.setOwnSpec(paramsMapping);
            cart.setPrice(sku.getPrice());
            cart.setTitle(sku.getTitle());
            cart.setUserId(loginUser.getId());
        }

        // 将购物车数据写入redis
        hashOps.put(cart.getSkuId().toString(), JsonUtils.serialize(cart));
    }
}
```

需要引入leyou-item-interface依赖：

```xml
<dependency>
    <groupId>com.leyou.item</groupId>
    <artifactId>leyou-item-interface</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```



### GoodClient

参照搜索工程，添加GoodClient，提供根据id查询sku的接口：

 ![1533813101222](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312884.png)

```java
@FeignClient("item-service")
public interface GoodsClient extends GoodsApi {
}
```

在leyou-item-service中的GoodsController添加根据sku的id查询sku的方法：

```java
@GetMapping("sku/{id}")
public ResponseEntity<Sku> querySkuById(@PathVariable("id")Long id){
    Sku sku = this.goodsService.querySkuById(id);
    if (sku == null){
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    return ResponseEntity.ok(sku);
}
```

在leyou-item-service中的GoodsService添加方法：

```java
public Sku querySkuById(Long id) {
    return this.skuMapper.selectByPrimaryKey(id);
}
```



### SpecificationClient

添加SpecificationClient，查询特殊的规格参数，目的是在页面能够显示名称

```
@FeignClient(value = "item-service")
public interface SpecificationClient extends SpecificationApi {
}
```

SpecificationApi添加根据规格参数id查询规格参数的方法

```java
@GetMapping("/params/query")
public List<SpecParam> querySpecsByIds(@RequestParam("ids") List<Long> ids);
```

> SpecificationController

```java
@GetMapping("/params/query")
public ResponseEntity<List<SpecParam>> querySpecsByIds(@RequestParam("ids") List<Long> ids) {
    List<SpecParam> specParams = this.specificationService.querySpecsByIds(ids);
    if (CollectionUtils.isEmpty(specParams)) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(specParams);
}
```

> SpecificationService

```
@Override
public List<SpecParam> querySpecsByIds(List<Long> ids) {
    return this.specParamMapper.selectByIdList(ids);
}
```

> SpecParamMapper

``` java
public interface SpecParamMapper extends Mapper<SpecParam>, SelectByIdListMapper<SpecParam, Long> {

}
```

### 结果

![1533815211788](https://cdn.tencentfs.clboy.cn/images/2021/20210911203312998.png)



## 查询购物车

### 页面发起请求

购物车页面：cart.html

![1533816059966](https://cdn.tencentfs.clboy.cn/images/2021/20210911203313163.png)

### 后台实现

> Controller

```java
@GetMapping
public ResponseEntity<List<Cart>> queryCart() {
    List<Cart> cart = this.cartService.queryCart();
    if (CollectionUtils.isEmpty(cart)) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(cart);
}
```

> Service

```
@Override
public List<Cart> queryCart() {
    // 判断是否存在购物车
    String key = KEY_PREFIX + LoginInterceptor.getLoginUser().getId();
    if (!this.redisTemplate.hasKey(key)) {
        // 不存在，直接返回
        return null;
    }
    //获取购物车数据
    BoundHashOperations<String, Object, Object> boundHashOps = redisTemplate.boundHashOps(key);
    List<Object> carts = boundHashOps.values();
    // 判断是否有数据
    if (CollectionUtils.isEmpty(carts)) {
        return null;
    }
    //将json转为对象
    return carts.stream().map(cartJson -> {
        return JsonUtils.parse(cartJson.toString(), Cart.class);
    }).collect(Collectors.toList());
}
```



### 测试

![1533815725920](https://cdn.tencentfs.clboy.cn/images/2021/20210911203313056.png)



## 修改商品数量

### 页面发起请求

![1534304010551](https://cdn.tencentfs.clboy.cn/images/2021/20210911203315401.png)

```java
increment(c) {
    c.num++;
    ly.verifyUser().then(() => {
        //已登录，向后台发起请求
        ly.http.put("/cart", {skuId: c.skuId, num: c.num});
    }).catch(() => {
        // 未登录，直接操作本地数据
        ly.store.set("carts", this.carts);
    })
}
```

### 后台实现

> Controller

```java
@PutMapping
public ResponseEntity<Void> updateCart(@RequestBody Cart cart) {
    this.cartService.updateCart(cart);
    return ResponseEntity.ok().build();
}
```

> Service

```java
@Override
public void updateCart(Cart cart) {
    //获取商品数量
    Integer num = cart.getNum();
    //获取用户信息
    UserInfo loginUser = LoginInterceptor.getLoginUser();
    //获取redis，hash类型的操作对象
    BoundHashOperations<String, Object, Object> hashOps = redisTemplate.boundHashOps(KEY_PREFIX + loginUser.getId());
    //查看用户购物车中是否已经存在该商品
    if (hashOps.hasKey(cart.getSkuId().toString())) {
        //存在更新数量
        String cartJson = hashOps.get(cart.getSkuId().toString()).toString();
        cart = JsonUtils.parse(cartJson, Cart.class);
        //修改数量
        cart.setNum(num);
        // 将购物车数据写入redis
        hashOps.put(cart.getSkuId().toString(), JsonUtils.serialize(cart));
    }
}
```



## 删除购物车商品

```javascript
clearCart(index) {
    // 删除选中的
    if (index.length == 1) {
        //只删除一件，可能点击的不是删除选中的商品按钮,由于是地址引用需要copy
        //防止-1，删除的不是选中的那个
        let index2 = this.selected.indexOf(this.carts[index[0]]);
        if (index2 >= 0) {
            let temp = [];
            Object.assign(temp, this.selected);
            temp.splice(index2, 1);
            this.selected = temp;
        }
    } else {
        //点击的是删除选中的商品按钮，选中的已经被删除，直接清空
        this.selected = [];
    }
    //删除购物车
    index.forEach((item, i) => {
        //每次删除一个后下标会往前移一位,前面删除了几个就往前几位，已经排过序
        item -= i;
        this.carts.splice(item, 1);
    });
},
deleteCart(index) {
    index = Array.isArray(index) ? index.sort() : [index];
    ly.verifyUser().then(res => {
        // 已登录购物车,根据选择的下标获取选择的sku的id集合
        let skuIds = index.map(i => this.carts[i].skuId);
        ly.http.delete("/cart/" + skuIds.join(',')).then(() => {
            this.clearCart(index);
        });
    }).catch(() => {
        this.clearCart(index);
        ly.store.set("carts", this.carts);
    })
},
deleteSelected() {
    if (this.selected.length == 0) {
        //没有选择不处理
        return;
    }
    let indexs = [];
    this.selected.forEach(item => {
        indexs.push(this.carts.indexOf(item));
    });
    this.deleteCart(indexs);
}
```

注意：后台成功响应后，要把页面的购物车中数据也删除

### 后台实现

> Controller

```
@DeleteMapping("/{skuId}")
public ResponseEntity<Void> deleteCart(@PathVariable("skuId") String... skuId) {
    this.cartService.deleteCart(skuId);
    return ResponseEntity.ok().build();
}
```



> Service

```
@Override
public void deleteCart(String... skuId) {
    // 判断是否存在购物车
    String key = KEY_PREFIX + LoginInterceptor.getLoginUser().getId();
    if (redisTemplate.hasKey(key)) {
        BoundHashOperations<String, Object, Object> boundHashOps = redisTemplate.boundHashOps(key);
        boundHashOps.delete(skuId);
    }
}
```



## 登录后购物车合并

当跳转到购物车页面，查询购物车列表前，需要判断用户登录状态，

- 如果登录：
  - 首先检查用户的LocalStorage中是否有购物车信息，
  - 如果有，则提交到后台保存，
  - 清空LocalStorage
- 如果未登录，直接查询即可



```javascript
loadCarts() {
    ly.verifyUser().then((res) => {
        //已经登录
        //先判断localStorange中有没有数据，有的话先进行合并
        let temp = ly.store.get("carts");
        if (temp && temp.length) {
            temp = temp.map(({skuId, num}) => {
                return {skuId: skuId, num: num}
            });
            ly.http.post("/cart/merge", temp).then(() => {
                ly.http.get("/cart").then(({data}) => {
                    this.carts = data;
                    //默认全部选中
                    this.selected = this.carts;
                });
                //将本地的购物车干掉
                ly.store.del("carts");
            }).catch(() => {
                alert('出错了');
            });
        } else {
            //没有直接请求
            ly.http.get("/cart").then(({data}) => {
                this.carts = data;
                //默认全部选中
                this.selected = this.carts;
            })
        }
    }).catch(() => {
        //未登录
        this.carts = ly.store.get("carts") || [];
        //默认全部选中
        this.selected = this.carts;
    })
}
```

> controller

```java
@PostMapping("/merge")
public ResponseEntity<Void> mergeCart(@RequestBody List<Cart> carts) {
    this.cartService.mergeCart(carts);
    return ResponseEntity.ok().build();
}
```

> service

```java
@Override
public void mergeCart(List<Cart> carts) {
    for (Cart cart : carts) {
        this.addCart(cart);
    }
}
```



> 效果

![1576659903466](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321709.png)