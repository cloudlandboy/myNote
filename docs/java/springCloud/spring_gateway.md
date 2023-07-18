# Spring Cloud Gateway

> spring cloud gatewa 是spring cloud 的第二代网关(第一代是zull)
>
> 基于Netty、reactor及Webflux构建，由于它不是Servlet编程模型，所以不能在Servlet容器下工作，也不能构建成war包
>
> 参考：https://www.itmuch.com/spring-cloud-gateway/route-predicate-factory/



## 核心概念

### 路由(Route)

 spring Cloud Gateway的基础元素，可简单理解成一条转发的规则。

路由的属性：ID、目标URL、Predicate集合以及Filter集合。



### 谓词(Predicate)

即 `java.util.function.Predicate` 接口, Spring Cloud Gateway 使用它实现路由的匹配条件



### 过滤器(Filter)

修改请求以及响应



## 创建项目

在微服务项目中一般项目结构都是一个父工程下有多个子模块，如下：

```
spring-cloud-gateway-demo
├─ gateway
│  ├─ pom.xml
│  └─ src
│     └─ main
│        ├─ java
│        │  └─ cn.clboy.scg.gateway
│        │		└─ GatewayApplication.java
│        └─ resources
│           └─ application.yml
└─pom.xml
```

在父工程中管理依赖版本，由于之后需要使用spring cloud alibaba生态下的组件，所以这里提前将其引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.15</version>
        <relativePath/>
    </parent>
    <groupId>cn.clboy</groupId>
    <artifactId>spring-cloud-gateway-demo</artifactId>
    <name>spring-cloud-gateway-demo</name>
    
    <!-- ... -->

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>2021.0.8</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>2021.0.5.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <!-- ... -->
    
</project>
```



## 网关依赖

gateway模块添加 `spring-cloud-starter-gateway` 的依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
</dependencies>
```



## 配置路由

```yaml
server:
  port: 12004
spring:
  cloud:
    gateway:
      routes:
        - id: baidu
          uri: https://www.baidu.com
          predicates:
            - Path=/**
```

这个id为baidu的路由会匹配所有路由，接着启动访问 `http://localhost:12004/s?wd=cloudlandboy`

就会返回百度的搜索页结果



## 路由谓词工厂

Route Predicate Factories

Spring Cloud Gateway 中内置了以下谓词工厂：



### 时间相关

- AfterRoutePredicateFactory

  当且仅当请求时的时间在配置的时间之后时，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - After=2023-07-16T17:50:00.000+08:00[GMT+08:00]
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/**
  ```

  上面配置了两个路由，其中sougou使用的Path谓词且匹配所有路由也就是说任何情况它都匹配，而baidu使用的是After路由，只有当前时间是2023年7月16日17:50之后才会匹配，假设当前时间是17:49，启动网关访问会看到搜狗的界面，等到50之后再访问就会返回百度的界面。

  从中也可以看到网关是按照配置的顺序进行匹配的

- BeforeRoutePredicateFactory

  当且仅当请求时的时间在配置的时间之前时，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Before=2023-07-16T17:50:00.000+08:00[GMT+08:00]
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/**
  ```

- BetweenRoutePredicateFactory

  当且仅当请求时的时间在配置的时间之间时，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Between=2023-07-16T17:55:00.000+08:00[GMT+08:00],2023-07-16T17:58:00.000+08:00[GMT+08:00]
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/**
  ```

  

?> 时间可使用 `System.out.println(ZonedDateTime.now());` 打印，然后即可看到时区

时间格式的相关逻辑：

- 默认时间格式：`org.springframework.format.support.DefaultFormattingConversionService#addDefaultFormatters`
- 时间格式注册：`org.springframework.format.datetime.standard.DateTimeFormatterRegistrar#registerFormatters`



### 请求头相关

- HeaderRoutePredicateFactory

  当且仅当请求带有指定的请求头，并且值符合配置的正则表达式时，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Header=Referer,.*clboy\.cn.*
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/**
  ```

  

  点击访问携带Referer请求头 http://127.0.0.1:12004

  直接在浏览器地址栏输入访问不带请求头

- HostRoutePredicateFactory

  当且仅当名为 [Host](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Host) 的请求头符合配置的任一pattern时，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Host=127.0.0.1:*,192.168.0.154:*
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/**
  ```

  baidu：http://127.0.0.1:12004

  sougou：http://localhost:12004

  



### 请求相关

- PathRoutePredicateFactory

  当且仅当访问路径匹配配置的任一路径，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Path=/s,
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Path=/web,/sogou
  ```

  

  baidu：http://127.0.0.1:12004/s?wd=bilibili

  sougou：http://127.0.0.1:12004/web?query=bilibili

- QueryRoutePredicateFactory

  当且仅当访问请求携带指定查询参数(如果配置了值[且该查询参数任意值匹配配置的值正则表达式])，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Query=wd
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - Query=query,.*[\u4e00-\u9fa5].*
  ```

  

  baidu：http://127.0.0.1:12004/s?wd=bilibili

  sougou：http://127.0.0.1:12004/web?query=b站

  sougou(有参数但是值不匹配)：http://127.0.0.1:12004/web?query=bilibili

- MethodRoutePredicateFactory

  当且仅当访问请求方式匹配任一配置的方式，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Method=POST,HEAD,DELETE
  ```

  

- RemoteAddrRoutePredicateFactory

  当且仅当请求ip匹配配置任一规则，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
            	# 请求IP是192.168.1.1/24网段
              - RemoteAddr=192.168.1.1/24
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - RemoteAddr=127.0.0.1
  ```

  

### cookie相关

- CookieRoutePredicateFactory

  当且仅当访问请求携带指定cookie(如果配置了值[且值匹配配置的正则表达式])，才会走该路由

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: baidu
            uri: https://www.baidu.com
            predicates:
              - Cookie=chocolate, ch.p
          - id: sougou
            uri: https://www.sogou.com/
            predicates:
              - RemoteAddr=127.0.0.1
  ```

  



### 其他

- ReadBodyRoutePredicateFactory

- CloudFoundryRouteServiceRoutePredicateFactory

- WeightRoutePredicateFactory

- XForwardedRemoteAddrRoutePredicateFactory



### 自定义

由上面的内置谓词工厂可以看出，它们的类名都是以 `RoutePredicateFactory` 结尾，而且在配置文件中配置时都是写前半部分

这是因为它们都实现了 `org.springframework.cloud.gateway.handler.predicate.RoutePredicateFactory` 接口

```java
public interface RoutePredicateFactory<C> extends ShortcutConfigurable, Configurable<C> {

	Predicate<ServerWebExchange> apply(C config);

}
```

接口的泛型表示配置类，可以是任意类型

假设现在有这样一个需求：某个路由限制只有6:00~23:00这段时间内可以访问

也就是说要实现一个类似BetweenRoutePredicateFactory的谓词工厂

1. 首先创建一个类实现 `RoutePredicateFactory` 接口，由于spring cloud gateway提供了一个抽象类，我们可以继承它

   ```java
   package cn.clboy.scg.gateway.predicate;
   
   import lombok.Data;
   import org.springframework.cloud.gateway.handler.predicate.AbstractRoutePredicateFactory;
   import org.springframework.web.server.ServerWebExchange;
   
   import java.time.LocalTime;
   import java.util.function.Predicate;
   
   public class TimeBetweenRoutePredicateFactory extends AbstractRoutePredicateFactory<TimeBetweenRoutePredicateFactory.Config> {
   
   
       public TimeBetweenRoutePredicateFactory() {
           super(Config.class);
       }
   
       @Override
       public Predicate<ServerWebExchange> apply(Config config) {
           return () -> {
               LocalTime now = LocalTime.now();
               return now.isAfter(config.getStart()) && now.isBefore(config.getEnd());
           };
       }
   
       @Data
       public static class Config {
           private LocalTime start;
           private LocalTime end;
       }
   }
   
   ```

2. 然后将实例对象注入的spring容器中，可以使用 `@Component` 、 `@Bean` 等注解方式

3. 配置文件

   ```yaml
   spring:
     cloud:
       gateway:
         routes:
           - id: baidu
             uri: https://www.baidu.com
             predicates:
               - name: TimeBetween
                 args:
                   start: "06:00"
                   end: "23:00"
   ```

   这样配置后会发现启动报错，报错内容是无法将字符串转换为 `LocalTime`

   因为默认的格式不是 `HH:mm:ss` ，我们可以使用注解指定格式

   ```java
   @Data
   public static class Config {
   
       @DateTimeFormat(pattern = "HH:mm")
       private LocalTime start;
   
       @DateTimeFormat(pattern = "HH:mm")
       private LocalTime end;
   }
   ```

   也可以配置全局日期和时间格式 ，参考：

   https://docs.spring.io/spring-framework/docs/5.3.27/reference/html/core.html#format-configuring-formatting-globaldatetimeformat

   

4. 要像其他谓词工厂一样配置在一行，需要实现接口的 `shortcutFieldOrder` 方法指定参数顺序

   ```yaml
   spring:
     cloud:
       gateway:
         routes:
           - id: baidu
             uri: https://www.baidu.com
             predicates:
               - TimeBetween=22:00,23:00
   ```

   

   ```java
   @Component
   public class TimeBetweenRoutePredicateFactory extends AbstractRoutePredicateFactory<TimeBetweenRoutePredicateFactory.Config> {
   
       //...
       
       @Override
       public List<String> shortcutFieldOrder() {
           return Arrays.asList("start", "end");
       }
       
       //...
   }
   ```

   



## 路由到微服务

前面我们都是路由到第三方网站作测试，如果要路由到微服务，则uri写成这个格式：`lb://服务id`

引入注册中心 `nacos` 和负载均衡 `loadbalancer` 组件

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:12008
    gateway:
      routes:
        - id: serviceA
          uri: lb://service-a
          predicates:
            - Path=/**
  application:
    name: gateway
```





## 路由过滤器工厂

路由过滤器中可以对请求和响应作一些修改，spring cloud gateway的路由过滤器工厂需要实现 `GatewayFilterFactory<C> ` 接口，和谓词工厂类似，泛型是配置类，其还提供了 `AbstractGatewayFilterFactory` 、`AbstractNameValueGatewayFilterFactory` 抽象类供使用

spring cloud gateway内置了很多路由过滤器工厂，具体可参考 [官方文档](https://docs.spring.io/spring-cloud-gateway/docs/3.1.8/reference/html/#gatewayfilter-factories) ，这里只拿几个举例



### AddRequestHeaderGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        filters:
        - AddRequestHeader=X-Request-Foo, Bar
```

为原始请求添加名为 `X-Request-Foo` ，值为 `Bar` 的请求头。

### AddRequestParameterGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_parameter_route
        uri: https://example.org
        filters:
        - AddRequestParameter=foo, bar
```

为原始请求添加请求参数 `foo=bar`



### AddResponseHeaderGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: add_response_header_route
        uri: https://example.org
        filters:
        - AddResponseHeader=X-Response-Foo, Bar
```

添加名为 `X-Request-Foo` ，值为 `Bar` 的响应头。





### PrefixPathGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: prefixpath_route
        uri: https://example.org
        filters:
        - PrefixPath=/mypath
```

为匹配的路由添加前缀。例如：访问`${GATEWAY_URL}/hello` 会转发到`https://example.org/mypath/hello` 。





### StripPrefixGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: nameRoot
        uri: http://nameservice
        predicates:
        - Path=/name/**
        filters:
        - StripPrefix=2
```

数字表示要截断的路径的数量。如上配置，如果请求的路径为 `/name/bar/foo` ，则路径会修改为`/foo` ，也就是会截断2个路径。



### RequestSizeGatewayFilterFactory

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: request_size_route
      uri: http://localhost:8080/upload
      predicates:
      - Path=/upload
      filters:
      - name: RequestSize
        args:
          # 单位字节
          maxSize: 5000000
```

为后端服务设置收到的最大请求包大小。如果请求大小超过设置的值，则返回 `413 Payload Too Large` 。默认值是5M



### Default Filters

```yaml
spring:
  cloud:
    gateway:
      default-filters:
      - AddResponseHeader=X-Response-Default-Foo, Default-Bar
      - PrefixPath=/httpbin
```

如果你想为所有路由添加过滤器，可使用该属性。





### 过滤器生命周期

pre：Gateway转发请求之前

post：Gateway转发请求之后



### 核心API

- 修改request：exchange.getRequest().mutate().xxx
- 修改exchange：exchange.mutate().xxx
- 传递给下一个过滤器处理：chain.filter(exchange)
- 拿到响应：exchange.getResponse()



### 自定义过滤器工厂

实现一个打印请求及响应的一些信息

```java
@Slf4j
@Component
public class PrintLogGatewayFilterFactory extends AbstractNameValueGatewayFilterFactory {

    @Override
    public GatewayFilter apply(NameValueConfig config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            log.info("请求路径：{}，查询参数：{}", request.getPath(), request.getQueryParams());

            //等待请求完成再打印响应信息
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                log.info("响应contentType，{}", exchange.getResponse().getHeaders().getContentType());
            }));
        };
    }
}
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: baidu
          uri: https://www.baidu.com
          predicates:
            - Path=/**
          filters:
            - PrintLog=a,b
```





## 全局过滤器

全局过滤器需要实现 `org.springframework.cloud.gateway.filter.GlobalFilter` 接口

`GlobalFilter` 会作用于所有路由

当请求到来时，`Filtering Web Handler` 处理器会添加所有 `GlobalFilter` 实例和匹配的 `GatewayFilter` 实例到过滤器链中。

过滤器链会使用 `org.springframework.core.Ordered` 注解所指定的顺序，进行排序。Spring Cloud Gateway区分了过滤器逻辑执行的 `pre` 和 `post` 阶段，所以优先级高的过滤器将会在pre阶段最先执行，优先级最低的过滤器则在post阶段最后执行。

?-> 数值越小越靠前执行

示例代码：

```
@Bean
@Order(-1)
public GlobalFilter a() {
    return (exchange, chain) -> {
        log.info("first pre filter");
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            log.info("third post filter");
        }));
    };
}

@Bean
@Order(0)
public GlobalFilter b() {
    return (exchange, chain) -> {
        log.info("second pre filter");
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            log.info("second post filter");
        }));
    };
}

@Bean
@Order(1)
public GlobalFilter c() {
    return (exchange, chain) -> {
        log.info("third pre filter");
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            log.info("first post filter");
        }));
    };
}
```

执行结果：

```
first pre filter
second pre filter
third pre filter
first post filter
second post filter
third post filter
```

### ForwardRoutingFilter

`ForwardRoutingFilter` 会查看exchange的属性 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 的值（一个URI），如果该值l的scheme是 `forward`，比如：`forward://localendpoint`，则它会使用Spirng的`DispatcherHandler` 处理该请求。请求URL的路径部分，会被forward URL中的路径覆盖。未修改的原始URL，会被追加到 `ServerWebExchangeUtils.GATEWAY_ORIGINAL_REQUEST_URL_ATTR` 属性中。

?-> 这段文档太学术了，讲解了`ForwardRoutingFilter` 的实现原理，对使用者来说，意义不大；对使用者来说，只要知道这个Filter是用来做本地forward就OK了。如对原理感兴趣的，建议直接研究源码，源码比官方文档好理解。



### ReactiveLoadBalancerClientFilter

`ReactiveLoadBalancerClientFilter` 会查看exchange的属性 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 的值（一个URI），如果该值的scheme是 `lb`，比如：`lb://myservice` ，它将会使用Spring Cloud的`LoadBalancerClient` 来将 `myservice` 解析成实际的host和port，并替换掉 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 的内容。原始地址会追加到 `ServerWebExchangeUtils.GATEWAY_ORIGINAL_REQUEST_URL_ATTR` 中。该过滤器还会查看 `ServerWebExchangeUtils.GATEWAY_SCHEME_PREFIX_ATTR` 属性，如果发现该属性的值是 `lb` ，也会执行相同逻辑。

示例：

```
spring:
  cloud:
    gateway:
      routes:
      - id: myRoute
        uri: lb://service
        predicates:
        - Path=/service/**
```

> 默认情况下，如果无法在 `LoadBalancer` 找到指定服务的实例，那么会返回503（对应如上的例子，找不到service实例，就返回503）；可使用 `spring.cloud.gateway.loadbalancer.use404=true` 让其返回404。

> `LoadBalancer` 返回的 `ServiceInstance` 的 `isSecure` 的值，会覆盖请求的scheme。举个例子，如果请求打到Gateway上使用的是 `HTTPS` ，但 `ServiceInstance` 的 `isSecure` 是false，那么下游收到的则是HTTP请求，反之亦然。然而，如果该路由指定了 `GATEWAY_SCHEME_PREFIX_ATTR` 属性，那么前缀将会被剥离，并且路由URL中的scheme会覆盖 `ServiceInstance` 的配置



### NettyRoutingFilter

如果 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 的值的scheme是 `http` 或 `https` ，则运行Netty Routing Filter 。它使用Netty `HttpClient` 向下游发送代理请求。获得的响应将放在exchange的 `ServerWebExchangeUtils.CLIENT_RESPONSE_ATTR` 属性中，以便在后面的filter中使用。（有一个实验性的过滤器： `WebClientHttpRoutingFilter` 可实现相同功能，但无需Netty）

### NettyWriteResponseFilter

如果exchange中的 `ServerWebExchangeUtils.CLIENT_RESPONSE_ATTR` 属性中有 `HttpClientResponse` ，则运行 `NettyWriteResponseFilter` 。该过滤器在所有其他过滤器执行完成后执行，并将代理响应协会网关的客户端侧。（有一个实验性的过滤器： `WebClientWriteResponseFilter` 可实现相同功能，但无需Netty）

### RouteToRequestUrl Filter

如果exchange中的 `ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR` 属性中有一个 `Route` 对象，则运行 `RouteToRequestUrlFilter` 。它根据请求URI创建一个新URI，但会使用该 `Route` 对象的URI属性进行更新。新URI放到exchange的 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 属性中。

如果URI具有scheme前缀，例如 `lb:ws://serviceid` ，该 `lb` scheme将从URI中剥离，并放到 `ServerWebExchangeUtils.GATEWAY_SCHEME_PREFIX_ATTR` 中，方便后面的过滤器使用。

### WebsocketRoutingFilter

如果exchange中的 `ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR` 属性的值的scheme是 `ws`或者 `wss` ，则运行Websocket Routing Filter。它底层使用Spring Web Socket将Websocket请求转发到下游。

可为URI添加 `lb` 前缀实现负载均衡，例如 `lb:ws://serviceid` 。

> 如果你使用 [SockJS](https://github.com/sockjs) 所谓普通http的后备，则应配置正常的HTTP路由以及Websocket路由。

```
spring:
  cloud:
    gateway:
      routes:
      # SockJS route
      - id: websocket_sockjs_route
        uri: http://localhost:3001
        predicates:
        - Path=/websocket/info/**
      # Normwal Websocket route
      - id: websocket_route
        uri: ws://localhost:3001
        predicates:
        - Path=/websocket/**
```

### GatewayMetricsFilter

要启用Gateway Metrics，需添加 `spring-boot-starter-actuator` 依赖。然后，只要`spring.cloud.gateway.metrics.enabled` 的值不是false，就会运行Gateway Metrics Filter。此过滤器添加名为 `gateway.requests` 的时序度量（timer metric），其中包含以下标记：

- `routeId`：路由ID
- `routeUri`：API将路由到的URI
- `outcome`：由 [HttpStatus.Series](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/HttpStatus.Series.html) 分类
- `status`：返回给客户端的Http Status
- `httpStatusCode`：返回给客户端的请求的Http Status
- `httpMethod`：请求所使用的Http方法

这些指标暴露在 `/actuator/metrics/gateway.requests` 端点中，并且可以轻松与Prometheus整合，从而创建一个 [Grafana](https://cloud.spring.io/spring-cloud-gateway/reference/html/images/gateway-grafana-dashboard.jpeg) [dashboard](https://cloud.spring.io/spring-cloud-gateway/reference/html/gateway-grafana-dashboard.json) 。

### Marking An Exchange As Routed

在网关路由 `ServerWebExchange` 后，它将通过在exchange添加一个 `gatewayAlreadyRouted` 属性，从而将exchange标记为 `routed` 。一旦请求被标记为 `routed` ，其他路由过滤器将不会再次路由请求，而是直接跳过。您可以使用便捷方法将exchange标记为 `routed` ，或检查exchange是否是 `routed` 。

- `ServerWebExchangeUtils.isAlreadyRouted` 检查是否已被路由
- `ServerWebExchangeUtils.setAlreadyRouted` 设置routed状态

?-> 简单来说，就是网关通过 `gatewayAlreadyRouted` 属性表示这个请求已经转发过了，而无需其他过滤器重复路由。从而防止重复的路由操作。



## 过滤器执行顺序

全局过滤器根据order排序，值越小越先执行

路由过滤器也有order，默认order值为配置的顺序从1开始递增

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: baidu
          uri: https://www.baidu.com
          predicates:
            - Path=/**
          filters:
            - AddRequestParameter=a,b # 1
            - PrintLog=a,b # 2
            - AddRequestHeader=a,b # 3
```

也可以创建过滤器时使用 `OrderedGatewayFilter` 包装

```java
@Slf4j
@Component
public class PrintLogGatewayFilterFactory extends AbstractNameValueGatewayFilterFactory {

    @Override
    public GatewayFilter apply(NameValueConfig config) {
        return new OrderedGatewayFilter((exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            log.info("请求路径：{}，查询参数：{}", request.getPath(), request.getQueryParams());

            //等待请求完成再打印响应信息
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                log.info("响应contentType，{}", exchange.getResponse().getHeaders().getContentType());
            }));
        }, 1);
    }
}
```

当配置了 default filters 时拥有相同排序值的default-filters会先执行

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: server-addr:127.0.0.1:12008
        username: nacos
        password: nacos
    gateway:
      routes:
        - id: baidu
          uri: https://www.baidu.com
          predicates:
            - Path=/**
          filters:
            - AddRequestParameter=a,b # 1
            - PrintLog=a,b # 2
            - AddRequestHeader=a,b # 3
      default-filters:
        - SetRequestHeader=x,y # 1
        - AddResponseHeader=x,y # 2
```

以上的执行顺序：SetRequestHeader>AddRequestParameter>AddResponseHeader>>PrintLog>AddRequestHeader
