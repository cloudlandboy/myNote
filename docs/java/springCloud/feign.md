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



## 日志级别

SpringBoot可以通过 `logging.level.xx=debug` 来设置日志级别。然而这个对Fegin客户端而言不会产生效果。因为 `@FeignClient` 注解修改的客户端在被代理时，都会创建一个新的Fegin.Logger实例。我们需要额外指定这个日志的级别才可以。

1. 设置包下的日志级别都为debug

   ```yaml
   logging:
     level:
       cn.clboy.springcloud.eureka.service.consumer: debug
   ```

2. 编写配置类，定义日志级别

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



3. 在FeignClient中指定配置类：

   ```java
   @FeignClient(
       value = "service-provider", 
       fallback = UserClientFallback.class,
       configuration = FeignLogConfiguration.class)
   public interface UserClient {
   
       @GetMapping("/user/{id}")
       TbUser getUserById(@PathVariable Long id);
   }
   ```

   

4. 重启项目，即可看到每次访问的日志：

   ![1574775914183](https://cdn.tencentfs.clboy.cn/images/2021/20210911203245500.png)

   



