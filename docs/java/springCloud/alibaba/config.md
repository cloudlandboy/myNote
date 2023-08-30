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

![image-20230825111722256](https://cdn.tencentfs.clboy.cn/images/image-20230825111722256.png)





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

要想做到在nacos中修改配置后，应用程序在不重启的情况下也能及时更新，应该怎么配置？

对于 `@ConfigurationProperties` 注解标注的配置类，默认会动态刷新

对于通过 `@value` 注解注入的属性，需要在持有类上添加  `@RefreshScope` 注解

```java
@RefreshScope
@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestController {

    @Value("${test.value}")
    private String value;

    @GetMapping("/value")
    private String testValue() {
        return this.value;
    }
    
   //......

}
```

启动后，你会发现获取的值永远为null，原因：

!> 注解的proxyMode默认值是ScopedProxyMode.TARGET_CLASS，也就是说代理模式使用的是CGLIB方式。<br/>如果@RefreshScope使用在 `@Controller` 或其他会被spring使用CGLIB代理的类上就会出问题。<br/>原因是@RefreshScope默认使用CGLIB代理，而目标类又是被CGLIB代理过的，这样就被代理了两次，第二次也就是@RefreshScope代理的时候会出现属性丢失的问题

解决方法：

```java
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
```



## 配置共享



### 不同环境

项目启动时，可以通过启动日志查看nacos加载了哪些配置，在启动日志中搜索 *Located property source*

```
Located property source: [BootstrapPropertySource {name='bootstrapProperties-service-a-dev.yaml,DEFAULT_GROUP'}, BootstrapPropertySource {name='bootstrapProperties-service-a.yaml,DEFAULT_GROUP'}, BootstrapPropertySource {name='bootstrapProperties-service-a,DEFAULT_GROUP'}]
```

可以看出默认情况下加载以下配置：

- `应用名-环境标识.后缀名`
- `应用名.后缀名`
- `应用名`

所以，不同环境的共享配置可以放到 `应用名.后缀名` 的配置中



### 不同应用

nacos提供了 `shared-configs` 和 `extension-configs` 两个配置项来添加额外的配置

```yaml
spring:
  profiles:
    active: dev
  application:
    name: service-a
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
        shared-configs:
          - data-id: love.yaml
            group: DEFAULT_GROUP
            refresh: true
        extension-configs:
          - data-id: test.yaml
            group: DEFAULT_GROUP
            refresh: true
```



### spring.config.import

上文已经说过springboot >= 2.4.0版本，已经不使用bootstrap.yml作为启动配置文件了

使用spring.config.import来共享配置就更简单了

```yaml
# application.yml (不能是bootstrap.yml)
spring:
  cloud:
    nacos:
      config:
        group: DEFAULT_GROUP
        server-addr: localhost:8848
  config:
    import:
      - optional:nacos:test.yml  # 监听 DEFAULT_GROUP:test.yml
      - optional:nacos:test01.yml?group=group_01 # 覆盖默认 group, 监听 group_01:test01.yml
      - optional:nacos:test02.yml?group=group_02&refreshEnabled=false # 不开启动态刷新
      - nacos:test03.yml # 在拉取nacos配置异常时会快速失败, 会导致 spring 容器启动失败
```

参考：[pull#2349](https://github.com/alibaba/spring-cloud-alibaba/pull/2349 ':target=_blank')



## 数据持久化



默认情况下，nacos存储数据的目录如下：

服务发现组件：

- ~/nacos/naming

配置服务器

- 配置数据：nacos安装目录/data/derby-data
- 快照等：~/nacos/config

如何改为mysql数据库：

1. 将 `nacos安装目录/conf/mysql-schema.sql` 导入到数据库中

2. 修改 `conf/application.properties` ，添加如下内容：

   ```properties
   spring.datasource.platform=mysql
   db.num=1
   db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
   db.user.0=数据库用户名
   db.password.0=数据库密码
   ```

   