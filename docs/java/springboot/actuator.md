# Actuator监控

Actuator 是SpringBoot 提供的监控功能

当系统运行时，我们想要了解系统运行的情况，比如程序是否存活、jvm状态怎么样。这时就需要有相应的对外接口，来让我们能方便的、自动的获取这些信息，这就是Actuator提供的功能



## maven依赖

要启用 Spring Boot Actuator，我们需要添加 `spring-boot-starter-actuator` 依赖项

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```



## 端点

添加actuator的依赖后，现在什么也不配置，直接启动程序，不出意外你会在控制台看到这样一条启动日志：

*Exposing 2 endpoint(s) beneath base path '/actuator'*

意思就是说 在基础路径 */actuator* 下暴露了两个端点

?> 端点：可以理解为就是一个接口，大部分文档中会称之为端点

访问这个接口 http://localhost:8080/actuator ，会看到响应以下json信息：

```json
{
  "_links": {
    "self": {
      "href": "http://localhost:8080/actuator",
      "templated": false
    },
    "health": {
      "href": "http://localhost:8080/actuator/health",
      "templated": false
    },
    "health-path": {
      "href": "http://localhost:8080/actuator/health/{*path}",
      "templated": true
    },
    "info": {
      "href": "http://localhost:8080/actuator/info",
      "templated": false
    }
  }
}
```



只要加上了actuator的依赖，SpringBoot 在运行时就会自动开启 `/actuator/health` 和 `/actuator/info` 这两个端点，我们就可以通过这两个端点查看当前SpringBoot运行的情况

Spring Boot 包含许多内置端点，但是因为安全因素，默认只会打开上面这两个端点，其他的需要另外设置才能使用

端点的路径前缀为 `/actuator` ，接着下一级就是端点id，如 `health` 、`info`

Spring Boot 内置的端点可以在官网查看：

https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints

### health端点

health端点提供基本的应用程序健康信息

现在直接访问 http://localhost:8080/actuator/health 

该端点只会响应一个状态信息

```json
{
  "status": "UP"
}
```

如果想要获取到更详细的信息，需要在配置文件中对health端点进行配置

```yaml
management:
  endpoint:
    health:
      # 有NEVER、WHEN_AUTHORIZED、ALWAYS三种选项，默认NEVER
      show-details: always
```

响应中的 **status** 字段表示监控的组件或子系统的状态，取值有以下几种：

- UP：正常状态
- DOWN：存在故障状态
- UNKNOWN：未知状态
- OUT_OF_SERVICE：表示该组件或子系统已停止使用，不应再使用

### info端点

info端点提供应用程序的信息

现在直接访问 http://localhost:8080/actuator/info

该端点只响应了一个空json对象，没有什么信息

内置会显示当前环境下所有 `info` 开头的键配置属性，如果 `git.properties` 文件可用，则公开 git 信息

`META-INF/build-info.properties` 文件如果可用，则公开构建信息

修改配置文件，添加info配置

```yaml
management:
  endpoint:
    health:
      # 有NEVER、WHEN_AUTHORIZED、ALWAYS三种选项，默认NEVER
      show-details: always
info:
  author: clboy
  app-name: spring-boot-actuator
  email: guest@clboy.cn
```

这次再访问info端点就可以看到配置的信息



## 端点配置

spring boot对于端点的配置都是以 `management` 开头，通过上面对health端点的配置也能看出来

开发者可以配置 `management.endpoints.web.exposure.include` 来指定需要暴露的端点

暴露所有端点可以指定为 `*` ，否则就写需要暴露的端点id，`include` 属性是集合类型

当配置为 `*` 时，也可以和 `management.endpoints.web.exposure.exclude` 配合，指明少量不需要暴露的端点

```yaml
management:
  endpoint:
    health:
      # 有NEVER、WHEN_AUTHORIZED、ALWAYS三种选项，默认NEVER
      show-details: always
  endpoints:
    web:
      exposure:
        include: "*"
```

这次再访问端点列表 http://localhost:8080/actuator 就可以看到很多的内置端点

但还有一些额外的端点需要单独配置启用，比如 `shutdown` 端点，这类端点往往比较危险，访问 `shutdown` 端点会直接将项目停止

```yaml
management:
  endpoint:
    health:
      # 有NEVER、WHEN_AUTHORIZED、ALWAYS三种选项，默认NEVER
      show-details: always
    shutdown:
      enabled: true
```
