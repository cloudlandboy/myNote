# 初识SpringCloud

微服务是一种架构方式，最终肯定需要技术架构去实施。

微服务的实现方式很多，但是最火的莫过于Spring Cloud了。为什么？

- 后台硬：作为Spring家族的一员，有整个Spring全家桶靠山，背景十分强大。
- 技术强：Spring作为Java领域的前辈，可以说是功力深厚。有强力的技术团队支撑，一般人还真比不了
- 群众基础好：可以说大多数程序员的成长都伴随着Spring框架，试问：现在有几家公司开发不用Spring？SpringCloud与Spring的各个框架无缝整合，对大家来说一切都是熟悉的配方，熟悉的味道。
- 使用方便：相信大家都体会到了SpringBoot给我们开发带来的便利，而SpringCloud完全支持SpringBoot的开发，用很少的配置就能完成微服务框架的搭建



## 简介

SpringCloud是Spring旗下的项目之一，官网：<https://spring.io/projects/spring-cloud>

Spring最擅长的就是集成，把世界上最好的框架拿过来，集成到自己的项目中。

SpringCloud也是一样，它将现在非常流行的一些技术整合到一起，实现了诸如：配置管理，服务发现，智能路由，负载均衡，熔断器，控制总线，集群状态等等功能。其主要涉及的组件包括：

- Eureka：注册中心
- Zuul：服务网关
- Ribbon：负载均衡
- Feign：服务调用
- Hystix：熔断器

以上只是其中一部分，架构图：

![1525575656796](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216967.png)



## SpringCloud的版本

因为Spring Cloud不同其他独立项目，它是拥有很多子项目的大项目。所以它的版本是版本名+版本号 （如Angel.SR6）。  

版本名：是伦敦的地铁名  

版本号：SR（Service Releases）是固定的 ,大概意思是稳定版本。后面会有一个递增的数字。 

所以 Edgware.SR3就是Edgware的第3个Release版本。  

如果现有一个 Spring Boot 应用程序，你想将 Spring Cloud 添加到该应用程序，第一步是确定你应该使用的 Spring Cloud 版本。您在应用程序中使用的 Spring Cloud 版本将取决于您使用的 Spring Boot 版本

[SpringCloud的版本和SpringBoot版本对照表](https://spring.io/projects/spring-cloud#adding-spring-cloud-to-an-existing-spring-boot-application)

## 微服务场景模拟

首先，我们需要模拟一个服务调用的场景，搭建两个工程：

- spring-cloud-service-provider（服务提供方）
- spring-cloud-service-consumer（服务调用方）

服务提供方：使用mybatis操作数据库，实现对数据的增删改查；并对外提供rest接口服务。

服务消费方：使用restTemplate远程调用服务提供方的rest接口服务，获取数据。

步骤几乎和[HttpClient](http://localhost:3000/#/java/springCloud/rpc?id=httpclient)调一致



### 服务提供方

1. 创建命名为 `spring-cloud-service-provider` 的项目，选择web场景和嵌入式数据库h2，添加通用mapper依赖

   <details>

   <summary>pom.xml</summary>

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>2.2.1.RELEASE</version>
           <relativePath/>
       </parent>
       <groupId>cn.clboy</groupId>
       <artifactId>spring-cloud-service-provider</artifactId>
       <version>1.0.0</version>
       <name>spring-cloud-service-provider</name>
   
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
   
           <dependency>
               <groupId>mysql</groupId>
               <artifactId>mysql-connector-java</artifactId>
               <scope>runtime</scope>
           </dependency>
           <dependency>
               <groupId>tk.mybatis</groupId>
               <artifactId>mapper-spring-boot-starter</artifactId>
               <version>2.1.5</version>
           </dependency>
           <dependency>
               <groupId>com.h2database</groupId>
               <artifactId>h2</artifactId>
           </dependency>
       </dependencies>
   
       <build>
           <plugins>
               <plugin>
                   <groupId>org.springframework.boot</groupId>
                   <artifactId>spring-boot-maven-plugin</artifactId>
               </plugin>
           </plugins>
       </build>
   
   </project>
   ```
   
   </details>

2. 配置数据库连接

   ```yaml
   spring:
     datasource:
       url: jdbc:h2:mem:spring-cloud-started
       username: root
       password: root
       driver-class-name: org.h2.Driver
     h2:
       console:
         enabled: true
   ```

3. 将用户实体类添加到项目中

   <details>

   ​    <summary>User.java</summary>

   ```java
   @Table(name = "tb_user")
   public class TbUser {
   
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private String username;
       private String password;
       private String phone;
       private Date created;
       
       //... 省略 get set方法
   }
   ```
   
   
   
   </details>
   
4. 添加 `UserMapper`

   ```java
   public interface UserMapper extends Mapper<TbUser> {
   
   }
   ```
   
5. UserService

   <details>

   ​    <summary>service接口和实现</summary>

   ```java
   public interface IUserService {
   
       /**
        * 根据ID查询
        * @param id
        * @return
        */
       public TbUser queryById(Long id);
   }
   ```

   ```java
   @Service
   public class UserServiceImpl implements IUserService {
   
       @Autowired
       private UserMapper userMapper;
   
       @Override
       public TbUser queryById(Long id) {
           return userMapper.selectByPrimaryKey(id);
       }
   }
   ```

   </details>

6. UserController

   ```java
   @RestController
   @RequestMapping("user")
   public class UserController {
   
       @Autowired
       private IUserService userService;
   
       @GetMapping("/{id}")
       public TbUser queryUserById(@PathVariable Long id) {
           return userService.queryById(id);
       }
   }
   ```

7. 在启动类上添加mapper扫描注解

   <details>

   ​    <summary>启动类</summary>

   ```java
   @MapperScan("cn.clboy.service.provider.mapper")
   @SpringBootApplication
   public class SpringcloudServiceProviderApplication {
   
       public static void main(String[] args) {
           SpringApplication.run(SpringcloudServiceProviderApplication.class, args);
       }
   
   }
   ```
   
   </details>

8. 访问：<http://localhost:8080/user/1>，一切正常接下来写服务消费方



### 服务消费方

1. 创建名为 `spring-cloud-service-consumer` 的项目，只需要选择web场景即可

2. 把实体类复制一份过来，把不需要的注解删除掉。只要用于远程调用结果反序列化接收

3. 在启动类中向容器注入RestTemplate

   ```java
   @SpringBootApplication
   public class SpringcloudServiceConsumerApplication {
   
       public static void main(String[] args) {
           SpringApplication.run(SpringcloudServiceConsumerApplication.class, args);
       }
   
       @Bean
       public RestTemplate restTemplate() {
           return new RestTemplate();
       }
   }
   ```

   

4. 创建Controlelr使用restTemplate调用服务

   ```java
   @RestController
   @RequestMapping("user")
   public class UserController {
   
       @Autowired
       private RestTemplate restTemplate;
   
       @GetMapping("/{id}")
       public TbUser getUserById(@PathVariable Long id) {
           return restTemplate.getForObject("http://localhost:8080/user/" + id, TbUser.class);
       }
   }
   ```

5. 修改端口号为81，然后启动测试

   ```yaml
   server:
     port: 8081
   ```



## 存在的问题？

简单回顾一下，刚才我们写了什么：

- spring-cloud-service-provider：该微服务提供一个提供根据id查询用户的api。
- spring-cloud-service-consumer：一个服务调用者，通过RestTemplate远程调用springcloud-service-provider。

存在什么问题？

- 在consumer中，我们把url地址硬编码到了代码中，不方便后期维护
- consumer需要记忆provider的地址，如果出现变更，可能得不到通知，地址将失效
- consumer不清楚provider的状态，服务宕机也不知道
- provider只有1台服务，不具备高可用性
- 即便provider形成集群，consumer还需自己实现负载均衡

其实上面说的问题，概括一下就是分布式服务必然要面临的问题：

- 服务管理
  - 如何自动注册和发现
  - 如何实现状态监管
  - 如何实现动态路由
- 服务如何实现负载均衡
- 服务如何解决容灾问题
- 服务如何实现统一配置

以上的问题，我们都将在SpringCloud中得到答案。



## Eureka注册中心



首先我们来解决第一个问题，服务的管理。

*问题分析* ：

在刚才的案例中，spring-cloud-service-provider对外提供服务，需要对外暴露自己的地址。而consumer（调用者）需要记录服务提供者的地址。将来地址出现变更，还需要及时更新。这在服务较少的时候并不觉得有什么，但是在现在日益复杂的互联网环境，一个项目肯定会拆分出十几，甚至数十个微服务。此时如果还人为的管理地址，不仅开发困难，将来测试、发布上线都会非常麻烦，这与DevOps的思想是背道而驰的。

*网约车* ：

这就好比是 网约车出现以前，人们出门叫车只能叫出租车。一些私家车想跑出租却没有资格，被称为黑车。而很多人想要约车，但是无奈出租车太少，不方便。私家车很多却不敢拦，而且满大街的车，谁知道哪个才是愿意载人的。一个想要，一个愿意给，就是缺少引子，缺乏管理啊。

此时滴滴这样的网约车平台出现了，所有想载客的私家车全部到滴滴注册，记录你的车型（服务类型），身份信息（联系方式）。这样，有哪些提供服务的私家车，在滴滴平台都能找到，一目了然。

此时要叫车的人，只需要打开APP，输入你的目的地，选择车型（服务类型），滴滴自动安排一个符合需求的车到你面前，为你服务，完美！

*Eureka能做什么？*

Eureka就好比是滴滴，负责管理、记录服务提供者的信息。服务调用者无需自己寻找服务，而是把自己的需求告诉Eureka，然后Eureka会把符合你需求的服务告诉你。

同时，服务提供方与Eureka之间通过 `心跳` 机制进行监控，当某个服务提供方出现问题，Eureka自然会把它从服务列表中剔除。

这就实现了服务的自动注册、发现、状态监控。

原理图：

 ![1525597885059](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221162.png)



### 搭建EurekaServer

创建一个名为 `spring-cloud-eureka-server` 的项目，启动一个`EurekaServer`：

#### 选择依赖

*Eureka Server* 是服务注册中心所需要的依赖，*Eureka Discovery Client* 是服务提供方和服务消费方所需要的依赖。

对于注册中心来说：服务提供方和服务消费方都属于客户端

而且 *Eureka Server* 依赖中也包含了client的相关依赖，它本身也可以视为一个client

注意选择SpringBoot的版本，可以查看SpringCloud官网当前稳定版本兼容的SpringBoot版本

![1574680199268](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241039.png)

![1574680309713](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241176.png)

![1574680364490](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241314.png)



<details>

​    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.10.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>cn.clboy</groupId>
    <artifactId>spring-cloud-eureka-server</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-cloud-eureka-server</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>Greenwich.SR4</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

</details>

#### 配置文件

```yaml
server:
  port: 10001
spring:
  application:
    # 应用名称，会在Eureka中显示
    name: eureka-server
eureka:
  client:
    # 指示此实例是否应将其信息注册到 eureka 服务器以供其他人发现。在某些情况下，您不希望发现您的实例，而只想发现其他实例
    # 此应用为注册中心，false：不向注册中心注册自己。不配置false启动会抛出一堆错误，不过不影响启动，就是看着闹心
    register-with-eureka: false
    # 指示此客户端是否应从 eureka 服务器获取 eureka 注册信息
    # (因为这是一个单点的EurekaServer，不需要同步其它EurekaServer节点的数据，故设为false)
    fetch-registry: false
    service-url:
      # EurekaServer的地址，现在是自己的地址，如果是集群，需要加上其它Server的地址。
      # key的意思为区域(默认有个defaultZone)，值为该区域下的eureka服务器通信url，多个url用逗号分割
      defaultZone: http://127.0.0.1:${server.port}/eureka

```

- `register-with-eureka`：当自身提供给给其它服务调用时需向Eureka注册

- `fetch-registry`：需要从Eureka中查找要调用的目标服务时需要设置为true

- `service-url.defaultZone` 配置上报Eureka服务地址高可用状态配置对方的地址，单机状态配置自己



#### @EnableEurekaServer

需要在启动类上用 `@EnableEurekaServer` 注解

声明当前SpringBoot应用是一个eureka服务中心

```java
@SpringBootApplication
@EnableEurekaServer
public class SpringcloudEurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringcloudEurekaServerApplication.class, args);
    }

}
```

启动服务，访问：http://127.0.0.1:10001



### 注册服务到Eureka

在服务中添加Eureka的客户端依赖，客户端代码会自动把服务注册到EurekaServer中。

创建项目，项目名为 `spring-cloud-eureka-service-provider`，选择web场景和eureka客户端场景

![1574683898661](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241453.png)

添加嵌入式数据库h2和通用mapper依赖

<details>

​    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.10.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>cn.clboy</groupId>
    <artifactId>spring-cloud-eureka-service-provider</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-cloud-eureka-service-provider</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>Greenwich.SR4</spring-cloud.version>
    </properties>

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
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
        </dependency>
        <dependency>
            <groupId>tk.mybatis</groupId>
            <artifactId>mapper-spring-boot-starter</artifactId>
            <version>2.1.5</version>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```



</details>

把之前 `spring-cloud-service-provider` 中的TbUser实体类、Mapper接口、service、controller都复制到该项目中，将包名都修改正确

#### 配置文件

```yaml
server:
  port: 8084
spring:
  datasource:
    url: jdbc:h2:mem:spring-cloud-started
    username: root
    password: root
    driver-class-name: org.h2.Driver
  application:
    name: service-provider
  h2:
      console:
        enabled: true
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
  instance:
    # 设置服务实例的id，相同的spring.application.name代表提供相同的服务，服务id应该在这组服务中唯一
    instance-id: ${spring.application.name}:${server.port}
```



!> 这里我们添加了spring.application.name属性来指定应用名称，如果未指定注册到eureka的服务名称，默认会取该值

> 默认instance-id获取规则：`ip地址:服务名称:启动端口`

![image-20210304000950711](https://cdn.tencentfs.clboy.cn/images/2021/20210911203246402.png)



#### @EnableDiscoveryClient

通过添加 `@EnableDiscoveryClient` 注解来开启Eureka客户端功能

```java
@MapperScan(basePackages = "cn.clboy.springcloud.eureka.service.provider.mapper")
@EnableDiscoveryClient
@SpringBootApplication
public class SpringcloudEurekaServiceProviderApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringcloudEurekaServiceProviderApplication.class, args);
	}

}
```



启动项目，访问 [Eureka监控页面：http://127.0.0.1:10001](http://127.0.0.1:10001) 查看是否已经注册过去



### 从Eureka获取服务

创建名为 `spring-cloud-eureka-service-consumer` 的项目，选择web场景和eureka客户端场景

将之前`spring-cloud-service-consumer`中的实体类、controller复制过来

<details>

​    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.10.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>cn.clboy</groupId>
    <artifactId>spring-cloud-eureka-service-consumer</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-cloud-eureka-service-consumer</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>Greenwich.SR4</spring-cloud.version>
    </properties>

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
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```



</details>

#### 配置文件

```yaml
server:
  port: 8083
spring:
  application:
    name: service-consumer
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
```



#### 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class SpringcloudEurekaServiceConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringcloudEurekaServiceConsumerApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```



#### 修改Controller

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    /**
     * 服务发现客户端，可以获取到eureka中服务的信息
     */
    private DiscoveryClient discoveryClient;

    @GetMapping("/{id}")
    public TbUser getUserById(@PathVariable Long id) {
        // 根据服务名称，获取服务实例。有可能是集群，所以是service实例集合
        List<ServiceInstance> instances = discoveryClient.getInstances("service-provider");
        // 因为只有一个Service-provider。所以这里直接获取第一个实例
        ServiceInstance serviceInstance = instances.get(0);
        //从实例中获取主机和端口号拼接出接口地址
        return restTemplate.getForObject("http://" + serviceInstance.getHost() + ":" + serviceInstance.getPort() + "/user/" + id, TbUser.class);
    }
}
```

