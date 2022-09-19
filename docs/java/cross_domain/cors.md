# Cors解决跨域

> 参考：http://www.ruanyifeng.com/blog/2016/04/cors.html



## 什么是cors

CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。

它允许浏览器向跨源服务器，发出[`XMLHttpRequest`](http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html)请求，从而克服了AJAX只能[同源](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)使用的限制。

CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。

- 浏览器端：

  目前，所有浏览器都支持该功能（IE10以下不行）。整个CORS通信过程，都是浏览器自动完成，不需要用户参与。

- 服务端：

  CORS通信与AJAX没有任何差别，因此你不需要改变以前的业务逻辑。只不过，浏览器会在请求中携带一些头信息，我们需要以此判断是否允许其跨域，然后在响应头中加入一些信息即可。这一般通过过滤器完成即可。



## 原理

浏览器会将ajax请求分为两类，其处理方案略有差异：简单请求、特殊请求。

## 简单请求

只要同时满足以下两大条件，就属于简单请求。：

（1) 请求方法是以下三种方法之一：

- HEAD
- GET
- POST

（2）HTTP的头信息不超出以下几种字段：

- Accept
- Accept-Language
- Content-Language
- Last-Event-ID
- Content-Type：只限于三个值`application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`



当浏览器发现发起的ajax请求是简单请求时，会在请求头中携带一个字段：`Origin`.

![1530460311064](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257696.png)

Origin中会指出当前请求属于哪个域（协议+域名+端口）。服务会根据这个值决定是否允许其跨域。

如果服务器允许跨域，需要在返回的响应头中携带下面信息：

```http
Access-Control-Allow-Origin: http://www.clboy.cn
Access-Control-Allow-Credentials: true
Content-Type: text/html; charset=utf-8
```

- `Access-Control-Allow-Origin`：可接受的域，是一个具体域名或者*（代表任意域名）
- `Access-Control-Allow-Credentials`：是否允许携带cookie，默认情况下，cors不会携带cookie，除非前端设置携带cookie

> 有关cookie：

要想操作cookie，需要满足3个条件：

- 服务的响应头中需要携带Access-Control-Allow-Credentials并且为true。
- 浏览器发起ajax需要指定withCredentials 为true
- 响应头中的Access-Control-Allow-Origin一定不能为*，必须是指定的域名
-  如果withCredentials为true，Access-Control-Allow-Origin为*，前端还是会报跨域错误

!> 但是，如果后端AllowCredentials为true，配置的`Access-Control-Allow-Origin`为`*`，springboot会把响应头中的`Access-Control-Allow-Origin`改为实际请求的Origin，所以在spring中无需担心这个问题



## 特殊请求

不符合简单请求的条件，会被浏览器判定为特殊请。

比如请求方法是`PUT`或`DELETE`，或者`Content-Type`字段的类型是`application/json`



### 预检请求

特殊请求会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求（preflight）。

浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。只有得到肯定答复，浏览器才会发出正式的`XMLHttpRequest`请求，否则就报错。

一个“预检”请求的样板：

```http
OPTIONS /cors HTTP/1.1
Origin: http://www.clboy.cn
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.leyou.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

与简单请求相比，除了Origin以外，多了两个头：

- Access-Control-Request-Method：接下来会用到的请求方式，比如PUT
- Access-Control-Request-Headers：会额外用到的头信息

> 预检请求的响应

服务的收到预检请求，如果许可跨域，会发出响应：

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://www.clboy.cn
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Max-Age: 1728000
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

除了`Access-Control-Allow-Origin`和`Access-Control-Allow-Credentials`以外，这里又额外多出3个头：

- Access-Control-Allow-Methods：允许访问的方式
- Access-Control-Allow-Headers：允许携带的头
- Access-Control-Max-Age：本次许可的有效时长，单位是秒，**过期之前的ajax请求就无需再次进行预检了**



如果浏览器得到上述响应，则认定为可以跨域，后续就跟简单请求的处理是一样的了。



## 实现

虽然原理比较复杂，但是前面说过：

- 浏览器端都有浏览器自动完成，我们无需操心
- 服务端可以通过拦截器统一实现，不必每次都去进行跨域判定的编写。



### SpringBoot

> https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-cors

从4.2版本开始，Spring MVC支持CORS，SpringMVC已经帮我们写好了CORS的跨域过滤器：CorsFilter ,内部已经实现了刚才所讲的判定逻辑，我们直接用就好了。



#### 使用@CrossOrigin注解

```java
/**
 * 使用注解的方式
 * CrossOrigin注解写在类上，作用于类中所有方法
 */
@Controller
@RequestMapping("/anno")
public class AnnoCorsController {


    /**
     * 默认Origin为 *
     * 默认受支持的方法与控制器方法所映射的方法相同
     */
    @CrossOrigin(allowCredentials = "true")
    @GetMapping("/m1")
    public ResponseEntity<String> m1() {
        return ResponseEntity.ok("finish");
    }

    @CrossOrigin
    @PutMapping("/m2")
    public ResponseEntity<String> m2() {
        return ResponseEntity.ok("finish");
    }
}
```



#### 使用WebMvcConfigurer

```java
@Configuration
public class CorsConfig {


    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                //默认只支持get，head，post请求,默认Origins为*
                CorsRegistration corsRegistration = registry.addMapping("/registry/**");
                corsRegistration.allowCredentials(true);
                //corsRegistration.allowedMethods("*");
            }
        };
    }

```



#### 使用全局配置CorsFilter

```java
@Configuration
public class CorsConfig {


    @Bean
    public CorsFilter corsFilter() {

        //添加CORS配置信息
        CorsConfiguration config = new CorsConfiguration();
        //config.applyPermitDefaultValues();

        //允许的域，如果要发送Cookie，就不能设为星号，必须指定明确的允许Origin（这里配置为*可以，spring会帮我们解决）
        config.addAllowedOrigin("http://test.com:5500");
        //是否允许携带Cookie信息（allowedOrigin为*，allowCredentials为true，spring会把响应中的Access-Control-Allow-Origin改为实际请求的origin）
        config.setAllowCredentials(true);
        //允许的请求方式
        config.addAllowedMethod("*");
        //允许的头信息
        config.addAllowedHeader("*");

        //添加映射路径
        UrlBasedCorsConfigurationSource configSource = new UrlBasedCorsConfigurationSource();
        configSource.registerCorsConfiguration("/filter/**", config);
        //返回新的CorsFilter.
        return new CorsFilter(configSource);
    }
    
}
```



!> 如果配置了CorsFilter，访问的请求被程序判断是cors请求，而没有使用registerCorsConfiguration注册配置路径映射，请求会直接被拦截，拒绝请求。例如本例中`/registry/**`，`/anno/m1`,`/anno/m2`即使配置了跨域，但是请求在CorsFilter这里(servlet的Filter阶段)就被拒绝了，后面的没有执行到。因此上面的配置也就失效了。所以使用了上面的方式就不要再使用CorsFilter了;但是registerCorsConfiguration方法可以针对不同的url添加不同的配置（config）