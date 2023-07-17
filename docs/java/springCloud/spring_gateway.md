# Spring Cloud Gateway

> spring cloud gatewa 是spring cloud 的第二代网关(第一代是zull)
>
> 基于Netty、reactor及Webflux构建，由于它不是Servlet编程模型，所以不能在Servlet容器下工作，也不能构建成war包



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

3. 

   







## 过滤器工厂



### 自定义



## 全局过滤器



## 过滤器执行顺序

