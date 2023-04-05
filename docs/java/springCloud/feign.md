# Feign

在前面的学习中，我们使用了Ribbon的负载均衡功能，大大简化了远程调用时的代码：

```java
@Autowired
private RestTemplate restTemplate;

@GetMapping("/{id}")
@HystrixCommand
public String getUserById(@PathVariable Long id) {
    if (id == 1) {
        throw new RuntimeException("忙碌中......");
    }
    //直接通过服务名称调用
    String baseUrl = "http://service-provider/user/";
    return restTemplate.getForObject(baseUrl + id, String.class);
}
```

如果远程调用就使用这种方法，你可能以后需要编写类似的大量重复代码，格式基本相同，无非参数不一样。有没有更优雅的方式，来对这些代码再次优化呢？

这就是我们接下来要学的Feign的功能了。



## 简介

![1528855057359](https://cdn.tencentfs.clboy.cn/images/2021/20210911203234370.png)

为什么叫伪装？

Feign可以把Rest的请求进行隐藏，伪装成类似SpringMVC的Controller一样。你不用再自己拼接url，拼接参数等等操作，一切都交给Feign去做。

Feign是Netflix开发的声明式、模板化的HTTP客户端，其灵感来自Retroft、JAXRS-2.0以及WebSocket。

Feign可帮助我们更加便捷、优雅地调用HTTP API。

在Spring Cloud中，使用Feign非常简单，只需创建一个接口，并在接口上添加一些注解，代码就完成了。

Feign 支持多种注解，例如Feign自带的注解或者JAX-RS注解等。

Spring Cloud对Feign进行了增强，使Feign支持了Spring MVC注解，并整合了Ribbon和Eureka，从而让Feign的使用更加方便。



## maven依赖

改造 `spring-cloud-eureka-service-consumer` 工程

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```



## 开启Feign功能

我们在启动类上，添加 `@EnableFeignClients` 注解，开启Feign功能，也不需要我们向容器中注入 `RestTemplate` 了

feign已经自动集成了Ribbon负载均衡的RestTemplate。所以，不需要开发者自己再注册启用负载均衡的RestTemplate。

```java
@SpringCloudApplication
@EnableFeignClients
public class SpringcloudEurekaServiceConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringcloudEurekaServiceConsumerApplication.class, args);
    }

//    @Bean
//    @LoadBalanced
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }

}

```



## Feign客户端接口

创建 `UserClient` 接口，一般这种接口都放在client包下

```java
package cn.clboy.springcloud.eureka.service.consumer.client;

@FeignClient(value = "service-provider")
@RequestMapping("user")
public interface UserClient {

    @GetMapping("/{id}")
    TbUser getUserById(@PathVariable Long id);
}
```

- 首先这是一个接口，Feign会通过动态代理，帮我们生成实现类。这点跟mybatis的mapper很像
- `@FeignClient`，声明这是一个Feign客户端，类似 `@Mapper` 注解。同时通过 `value` 属性指定服务名称
- 接口中的定义方法，完全采用SpringMVC的注解，Feign会根据注解帮我们生成URL，并访问获取结果
- 接口的方法名随意，但是注解上的请求路径，方法参数要和服务方的相同，返回值可以换成String，但一般会保持一致



改造原来的调用逻辑，直接注入UserClient，然后像调用本地方法一样调用：

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private UserClient userClient;

    @GetMapping("/{id}")
    public TbUser getUserById(@PathVariable Long id) {
        return userClient.getUserById(id);
    }
}
```

重启 `spring-cloud-eureka-service-consumer` 报错了

![1574772714973](https://cdn.tencentfs.clboy.cn/images/2021/20210911203245362.png)

!> 这是由于我们在UserClient类上使用了@RequestMapping 注解，这是一个坑需要留意

修改UserClient，在方法上的注解中写上完整路径，Feign貌似不支持类上的 `@RequestMapping`

```java
@FeignClient(value = "service-provider")
public interface UserClient {

    @GetMapping("/user/{id}")
    TbUser getUserById(@PathVariable Long id);
}
```





## 日志级别配置

SpringBoot可以通过 `logging.level.<包名> = 日志级别` 来设置日志级别。然而这个对Fegin客户端而言不会产生效果。

因为 `@FeignClient` 注解的客户端在被代理时，都会创建一个新的Fegin.Logger实例。我们需要额外指定这个日志的级别才可以。



设置包下的日志级别都为debug。**fegin的日志是以debug日志为前提，所以要将FeignClient所在包的日志级别设置为debug**

```yaml
logging:
  level:
    cn.clboy.springcloud.eureka.service.consumer: debug
```



### 全局配置



#### 注册Bean

只需要想容器中注入 `Logger.Level` 类型的Bean即可

```java
import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignLogConfiguration {

        @Bean
        Logger.Level feignLoggerLevel(){
            return Logger.Level.FULL;
        }
}
```

这里指定的Level级别是FULL，Feign支持4种日志级别：

- `NONE`：不记录任何日志信息，这是默认值。
- `BASIC`：仅记录请求的方法，URL以及响应状态码和执行时间
- `HEADERS`：在BASIC的基础上，额外记录了请求和响应的头信息
- `FULL`：记录所有请求和响应的明细，包括头信息、请求体、元数据。



#### 注解方式

和Ribbon类似，需要写一个配置类，但是不要把配置类注册到容器中

```java
public class GlobalFeignConfig {

    @Bean
    Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
}
```

然后在 `@EnableFeignClients` 中指定全局默认配置

```java
@EnableFeignClients(defaultConfiguration = GlobalFeignConfig.class)
```



#### 配置文件

```yaml
feign:
  client:
    config:
      # 全局配置
      default:
        logger-level: full
```



### 每个Client单独配置



#### 注解方式

和全局配置中注解配置类似，需要先创建配置类，然后在 `@FeignClient` 注解中指定配置

```java
@FeignClient(value = "服务名称", configuration = XxxClientConfig.class)
```



#### 配置文件

在配置文件中，key为 `default` 表示全局默认配置，其他key代表服务名称，也就是对应 `@FeignClient` 注解中的value

```yaml
feign:
  client:
    config:
      service-name:
        logger-level: full
```



## 其他配置

```yaml
feign:
  client:
    config:
      default:
        connect-timeout: 5000 # 连接超时时间
        read-timeout: 5000 # 读取超时时间
        logger-level: full # 日志级别
        error-decoder: feign.codec.ErrorDecoder.Default #错误解码器
        retryer: feign.Retryer.Default # 重试策略
        decode404: false # 是否对404错误码进行响应体解码
        encoder: org.springframework.cloud.openfeign.support.SpringEncoder # 请求体编码器
        decoder: org.springframework.cloud.openfeign.support.ResponseEntityDecoder # 响应体解码器
        contract: org.springframework.cloud.openfeign.support.SpringMvcContract # 如何解析Feign接口上的注解
        # 请求拦截器
        request-interceptors:
          - feign.auth.BasicAuthRequestInterceptor
```

## 重点Bean

| 类名               | 作用                                   | 默认值                                                       |
| ------------------ | -------------------------------------- | ------------------------------------------------------------ |
| Feign.Builder      | 用于构建Feign                          | Feign.Builder                                                |
| CLient             | Feign的底层用什么去请求                | 和Ribbon配合时：LoadBalancerFeignClient<br />为整合Ribbon时：Client.Default |
| Contract           | 契约，支持定义哪些注解在接口上有效     | SpringMvcContract                                            |
| Encoder            | 编码器，用于将对象转换成HTTP请求消息体 | SpringEncoder                                                |
| Decoder            | 解码器，将响应消息体转换成对象         | ResponseEntityDecoder                                        |
| Logger             | 日志管理器                             | Slf4jLogger                                                  |
| RequestInterceptor | 请求拦截器                             | 无                                                           |



## 多参数请求



### GET

在spring mvc中请求中如果有多个参数，不管是get方式的查询参数，还是post方式的表单参数，都可以直接在方法参数中定义与请求参数相同名称的参数来接收

```java
 @GetMapping("/share/get_multi_params/v1")
public ResponseEntity<List<String>> query(Integer page, Integer size, String keyword) {
    log.info("page:{},size:{},keyword:{}", page, size, keyword);
    return ResponseEntity.ok(Collections.singletonList("get_multi_params/v1"));
}
```

但是对于这种方法中有多个参数，如果Feign接口中这样写，在启动的时候就会抛出异常

```java
 @GetMapping("/share/get_multi_params/v1")
ResponseEntity<List<String>> query(Integer page, Integer size,String keyword)
```

一个参数没有任何问题，多个参数的时候就要为每个参数标注 `@RequestParam` 注解，如果是路径参数要用 `@PathVariable` 标注

```java
@GetMapping("/share/get_multi_params/v1")
ResponseEntity<List<String>> query(@RequestParam("page") Integer page, 
                                   @RequestParam("size") Integer size, @RequestParam("keyword") String keyword);
```

当然，在spring mvc中也可以直接将多个参数封装到对象中，用对象来接收

```java
@Data
public class ShareQuery {

    private Integer page;
    private Integer size;
    private String keyword;
}


@GetMapping("get_multi_params/v2")
public ResponseEntity<List<String>> query(ShareQuery query) {
    log.info("page:{},size:{},keyword:{}", query.getPage(), query.getSize(), query.getKeyword());
    return ResponseEntity.ok(Collections.singletonList("get_multi_params/v2"));
}
```

但是在Feign中这样写，如果是get请求，在调用的时候就会报错

```java
@GetMapping("/share/get_multi_params/v2")
ResponseEntity<List<String>> query(ShareQuery query);
```

我们必须用 `@SpringQueryMap` 注解进行标注

```java
@GetMapping("/share/get_multi_params/v2")
ResponseEntity<List<String>> query(@SpringQueryMap ShareQuery query);
```



### POST

对于post请求，如果参数是对象类型，不管有没有 `@RequestBody` 注解，Feign都会发送json格式的请求。如果服务提供方的接口接收的是表单类型参数，这样就会导致参数接收失败。对于标注  `@RequestParam` 注解的参数是放在查询参数中的，没有影响

```java
@PostMapping("/share/post_multi_params/form/v2")
ResponseEntity<List<String>> queryByPost(ShareQuery query);
```

我们需要在 `@PostMapping` 指明使用表单类型

```java
@PostMapping(value = "/share/post_multi_params/form/v2", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
ResponseEntity<List<String>> queryByPost(ShareQuery query);
```



## 负载均衡

Feign中本身已经集成了Ribbon依赖和自动配置：

因此我们不需要额外引入依赖，也不需要再注册标注 `@LoadBalanced` 注解的 `RestTemplate` 对象。



*Feign、Hystrix、Eureka都集成了Ribbon，版本由SpringCloud管理，所以不用我们去管理依赖*







## Hystrix支持

Feign默认也有对Hystrix的集成：

只不过，默认情况下是关闭的。我们需要通过下面的参数来开启：(在配置添加如下内容)

```yaml
feign:
  hystrix:
    enabled: true # 开启Feign的熔断功能
```

但是，Feign中的Fallback配置不像hystrix中那样简单了。

首先，我们要定义一个类去实现刚才编写的 `UserClient` 接口，作为fallback的处理类。并将该类 *添加到容器中*

```java
package cn.clboy.springcloud.eureka.service.consumer.client;

import cn.clboy.springcloud.eureka.service.consumer.pojo.TbUser;
import org.springframework.stereotype.Component;

@Component
public class UserClientFallback implements UserClient {

    @Override
    public TbUser getUserById(Long id) {
        TbUser tbUser=new TbUser();
        tbUser.setUsername("服务器繁忙，请稍后再试！");
        return tbUser;
    }
}
```



然后在 `UserClient` 接口的 `@FeignClient` 注解中，指定刚才编写的实现类

```java
@FeignClient(value = "service-provider", fallback = UserClientFallback.class)
public interface UserClient {

    @GetMapping("/user/{id}")
    TbUser getUserById(@PathVariable Long id);
}
```

重启访问之后将服务提供方关闭测试服务降级：<http://localhost:8083/user/1>



## 请求压缩

Spring Cloud Feign 支持对请求和响应进行GZIP压缩，以减少通信过程中的性能损耗。通过下面的参数即可开启请求与响应的压缩功能：

```yaml
feign:
  compression:
    request:
      enabled: true # 开启请求压缩
    response:
      enabled: true # 开启响应压缩
```

同时，我们也可以对请求的数据类型，以及触发压缩的大小下限进行设置：

```yaml
feign:
  compression:
    request:
      enabled: true # 开启请求压缩
      mime-types: text/html,application/xml,application/json # 设置压缩的数据类型
      min-request-size: 2048 # 设置触发压缩的大小下限
```

注：上面的数据类型、压缩大小下限均为默认值。



## 脱离Ribbon使用

意思就是说不调用注册中心中的微服务，而是和普通http请求工具一样调用任一网络接口

比如我们调用百度搜索的接口

`@FeignClient` 注解中的服务名称可以随便写，然后通过 `url` 属性指定接口的网络地址前缀

这样Feign就知道这个客户端请求的不是注册中心上的服务

```java
@FeignClient(value = "baidu-search", url = "http://www.baidu.com")
public interface BaiduFeignClient {

    @GetMapping("/s")
    ResponseEntity<String> search(@RequestParam("word") String word);

}
```



运行代码测试，正常响应百度搜索结果页的源码

```java
@AllArgsConstructor
@RequestMapping("/test")
public class TestController {
    
    private final BaiduFeignClient baiduFeignClient;


    @GetMapping
    public void test() {
        ResponseEntity<String> page = baiduFeignClient.search("clboy");
        System.out.println(page);
    }
}
```



## 性能优化



### 日志设置

线上环境应将日志级别设为 `BASIC` ，尽可能输出更少的日志



### 使用连接池

默认Feign底层用的是 `URLConnection` 进行请求，每一次请求都要创建连接，关闭连接，我们可以替换为 `httpclient`

或者 `okhttp` 然后使用连接池管理连接



#### httpclient

使用 `httpclient`，首先要引入下面的依赖，不需要写版本号，openfeign已经帮我们管理了

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-httpclient</artifactId>
</dependency>
```

然后在配置中启用httpclient

```yaml
feign:
  httpclient:
    # 告诉feign使用httpclient,只要引入了依赖默认就是true
    enabled: true
    # 连接池配置：feign的最大连接数
    max-connections: 200
    # 连接池配置：feign对单个路径的最大连接数
    max-connections-per-route: 50
```



#### okhttp

使用okhttp只需要将httpclient的依赖替换为okhttp

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

然后在配置文件中设置启用，**默认不启用**(feign是不是在暗示我们httpclient更适合一些)，其他配置依旧是在httpclient下设置

```yaml
feign:
  okhttp:
    enabled: true
  httpclient:
    max-connections: 200
    max-connections-per-route: 50
```





