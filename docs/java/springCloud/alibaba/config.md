# 配置管理

为什么要实现配置管理？

在实际项目开发中，往往会有多个环境：dev、test、prod

- 不同的环境需要不同的配置
- 配置属性动态刷新，要求在运行时修改配置后在不重启的情况下就能生效
- 服务多的情况下，由服务自己管理配置就会很混乱，往往它们有些配置都是一样的，怎么让它们共享相同的配置

目前我们的配置都是放在在 `application.yml` 文件中，对用不同环境的配置也可以使用 `application-环境标识.yml` 文件来区分

然后在 `application.yml` 文件中设置当前的环境，从而激活不同的环境配置

```yaml
spring:
  profiles:
    active: 环境标识
```

当服务越来越多时，每个服务都要管理自己的一堆  `application.yml` ，相当难维护

这个时候就需要一个配置管理中心去统一管理配置，所有微服务都是从这个配置中心拉取配置，架构图就演变成了这样：

![image-20230825111722256](assets/image-20230825111722256.png)





## 使用Nacos管理配置

现在有如下配置类：

```java
@Data
@Component
@ConfigurationProperties(prefix = "test")
public class TestConfigProperties {

    private String username;
    private String password;

}
```

现在将 application.yml 中的配置放到nacos中

```yaml
test:
  username: clboy
  password: 123456
```

在nacos控制台左侧菜单中第一个就是配置管理

新增配置时的主要关注点是 

- **Data ID** ：配置id，需要遵循 `${prefix}-${spring.profiles.active}.${file-extension}` 的格式

  `prefix` 默认为 `spring.application.name` 的值，也可以通过配置项 `spring.cloud.nacos.config.prefix` 来配置

  `file-extension` 为配置内容的数据格式，可以通过配置项 `spring.cloud.nacos.config.file-extension` 来配置

  假设我们的服务名 `spring.application.name=service-a` 

  环境标识 `spring.profiles.active=dev`

  文件后缀为 `yaml`

  那么配置id就要命名为 `service-a-dev.yaml`

  !> 注意，当 active profile 为空时，对应的连接符 `-` 也将不存在 <br/>拼接格式变成 `${prefix}`.`${file-extension}`

- **Group** ：配置组名，默认为 `DEFAULT_GROUP`，可以通过 `spring.cloud.nacos.config.group` 配置

- **配置格式** ：一般都使用 `YAML`



然后程序中怎么配置才能正确连接到配置中心并拉取配置呢？

首先要添加配置中心的依赖：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```



然后你第一时间想到的可能是在 `application.yml` 中配置连接地址，就像连接注册中心一样。

在spring中nacos配置中心的配置前缀是 `spring.cloud.nacos.config`

```
spring:
  profiles:
    active: dev
  application:
    name: @project.artifactId@
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
```

但是你会发现启动报错：

```
No spring.config.import property has been defined

Action:

Add a spring.config.import=nacos: property to your configuration.
	If configuration is not required add spring.config.import=optional:nacos: instead.
	To disable this check, set spring.cloud.nacos.config.import-check.enabled=false.
```

从给出信息中分析，它的意思是让我们添加配置 `spring.config.import=nacos:配置文件` 

如果配置文件不是必须的就这样配置：`spring.config.import=optional:nacos:配置文件`

如果只是禁用检查就配置：`spring.cloud.nacos.config.import-check.enabled=false`

所以我们需要这样配置：

```yaml
spring:
  profiles:
    active: dev
  application:
    name: @project.artifactId@
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
  config:
    import: nacos:${spring.application.name}-${spring.profiles.active}.yaml
```

这种配置适用于springboot `2.4.0` 之后的版本

还有一种配置方法是使用 `bootstrap.yml` 配置文件，但是spring cloud从2021.0.5版本起，Spring Cloud将不再默认启用bootstrap

需要手动添加依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

将刚刚的 `application.yml` 重命名为 `bootstrap.yml` ，配置内容：

```yaml
spring:
  profiles:
    active: dev
  application:
    name: @project.artifactId@
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
```













## 配置属性动态刷新

## 应用的配置共享

## 引导上下文

## 数据持久化



