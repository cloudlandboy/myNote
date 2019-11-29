# 项目搭建

## 技术选型

前端技术：

- 基础的HTML、CSS、JavaScript（基于ES6标准）
- JQuery
- Vue.js 2.0以及基于Vue的框架：Vuetify（UI框架）
- 前端构建工具：WebPack
- 前端安装包工具：NPM
- Vue脚手架：Vue-cli
- Vue路由：vue-router
- ajax框架：axios
- 基于Vue的富文本框架：quill-editor 

后端技术：

- 基础的SpringMVC、Spring 5.x和MyBatis3
- Spring Boot 2.1.10版本
- Spring Cloud  Greenwich.SR4
- Redis
- RabbitMQ
- Elasticsearch
- nginx
- FastDFS 
- MyCat
- Thymeleaf
- mysql 5.7



## 开发环境

为了保证开发环境的统一，希望每个人都按照我的环境来配置：

- IDEA
- JDK：JDK1.8
- 项目构建：maven 3.6.2 
- 版本控制工具：git



## 域名

我们在开发的过程中，为了保证以后的生产、测试环境统一。尽量都采用域名来访问项目。

一级域名：www.leyou.com，leyou.com

二级域名：manage.leyou.com/item , api.leyou.com

我们可以通过switchhost工具来修改自己的host对应的地址，只要把这些域名指向127.0.0.1，那么跟你用localhost的效果是完全一样的。

switchhost下载连接：<https://github.com/oldj/SwitchHosts/releases>



## 创建父工程

创建Maven工程，打包方式为`pom`，项目名为`leyou-parent`

![1529224631578](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1529224631578.png)

![1575013405726](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1575013405726.png)



![1575013466149](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1575013466149.png)

添加依赖

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.leyou</groupId>
    <artifactId>leyou-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>leyou</name>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.10.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>


    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>Greenwich.SR4</spring-cloud.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <mybatis.starter.version>2.1.1</mybatis.starter.version>
        <mapper.starter.version>2.1.5</mapper.starter.version>
        <druid.starter.version>1.1.10</druid.starter.version>
        <mysql.version>5.1.38</mysql.version>
        <pageHelper.starter.version>1.2.12</pageHelper.starter.version>
        <fastDFS.client.version>1.26.1-RELEASE</fastDFS.client.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- springCloud -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- mybatis启动器 -->
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>${mybatis.starter.version}</version>
            </dependency>
            <!-- 通用Mapper启动器 -->
            <dependency>
                <groupId>tk.mybatis</groupId>
                <artifactId>mapper-spring-boot-starter</artifactId>
                <version>${mapper.starter.version}</version>
            </dependency>
            <!-- 分页助手启动器 -->
            <dependency>
                <groupId>com.github.pagehelper</groupId>
                <artifactId>pagehelper-spring-boot-starter</artifactId>
                <version>${pageHelper.starter.version}</version>
            </dependency>
            <!-- mysql驱动 -->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${mysql.version}</version>
            </dependency>
            <!--FastDFS客户端-->
            <dependency>
                <groupId>com.github.tobato</groupId>
                <artifactId>fastdfs-client</artifactId>
                <version>${fastDFS.client.version}</version>
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

?> 删除src目录，父工程是用来管理依赖，不需要写代码



## 创建EurekaServer

创建Eureka注册中心模块

![1529225751893](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1529225751893.png)

选择创建maven模块，项目名为`leyou-registry`

### 依赖

<details>
    <summary>pom.xml</summary>

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
    <groupId>com.leyou.registry</groupId>
    <artifactId>leyou-registry</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>

</project>
```

</details>

### 配置文件

```yaml
server:
  port: 10001
spring:
  application:
    name: leyou-registry
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:${server.port}/eureka
    register-with-eureka: false # 把自己注册到eureka服务列表
    fetch-registry: false # 拉取eureka服务信息
  server:
    enable-self-preservation: false # 关闭自我保护
    eviction-interval-timer-in-ms: 5000 # 每隔5秒钟，进行一次服务列表的清理
```

### 启动类

```java
package com.leyou.registry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class LeyouRegistryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeyouRegistryApplication.class, args);
    }
}
```

启动访问：<http://127.0.0.1:10001/>



## 创建Zuul网关

依旧是选择创建maven模块，项目名为`leyou-gateway`

### 依赖

<details>
    <summary>pom.xml</summary>

这里我们需要添加Zuul和EurekaClient的依赖：

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

    <groupId>com.leyou.gateway</groupId>
    <artifactId>leyou-gateway</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-zuul</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>
</project>
```

</details>

### 配置文件

```yaml
server:
  port: 20001
spring:
  application:
    name: leyou-gateway
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
    registry-fetch-interval-seconds: 5
zuul:
  prefix: /api # 路由路径前缀
```

### 启动类

```java
package com.leyou.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;

@SpringBootApplication
@EnableDiscoveryClient
@EnableZuulProxy
public class LeyouGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeyouGatewayApplication.class, args);
    }
}
```



启动访问：<http://127.0.0.1:10001/>



## 创建商品微服务

既然是一个全品类的电商购物平台，那么核心自然就是商品。因此我们要搭建的第一个服务，就是商品微服务。其中会包含对于商品相关的一系列内容的管理，包括：

- 商品分类管理
- 品牌管理
- 商品规格参数管理
- 商品管理
- 库存管理

### 微服务的结构

因为与商品的品类相关，我们的工程命名为`leyou-item`.

需要注意的是，我们的leyou-item是一个微服务，那么将来肯定会有其它系统需要来调用服务中提供的接口，获取的接口数据，也需要对应的实体类来封装，因此肯定也会使用到接口中关联的实体类。

因此这里我们需要使用`聚合工程`，将要提供的接口及相关实体类放到独立子工程中，以后别人引用的时候，只需要知道坐标即可。

**我们会在leyou-item中创建两个子工程：**

- `leyou-item-interface`：主要是对外暴露的接口及相关实体类
- `leyou-item-service`：所有业务逻辑及内部使用接口

调用关系如图所示：

![1525744281610](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1525744281610.png)

## leyou-item

因为是聚合工程，所以把项目打包方式设置为pom，创建完成后把src目录删除

<details>
    <summary>pom.xml</summary>

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
    <groupId>com.leyou.item</groupId>
    <artifactId>leyou-item</artifactId>
    <packaging>pom</packaging>

</project>
```



</details>



### leyou-item-interface

在`leyou-item`下创建`leyou-item-interface`模块

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-item</artifactId>
        <groupId>com.leyou.item</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.leyou.item</groupId>
    <artifactId>leyou-item-interface</artifactId>

</project>
```



</details>



### leyou-item-service

在`leyou-item`下创建`leyou-item-service`模块



#### 依赖

思考一下我们需要什么？

- Eureka客户端
- web启动器
- mybatis启动器
- 通用mapper启动器
- 分页助手启动器
- 连接池，我们用默认的Hykira
- mysql驱动
- 千万不能忘了，我们自己也需要`ly-item-interface`中的实体类

这些依赖，我们在顶级父工程：leyou中已经添加好了。所以直接引入即可：

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-item</artifactId>
        <groupId>com.leyou.item</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.leyou.item</groupId>
    <artifactId>leyou-item-service</artifactId>
    <dependencies>
        <!-- web启动器 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- eureka客户端 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <!-- mybatis的启动器 -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
        </dependency>
        <!-- 通用mapper启动器 -->
        <dependency>
            <groupId>tk.mybatis</groupId>
            <artifactId>mapper-spring-boot-starter</artifactId>
        </dependency>
        <!-- 分页助手启动器 -->
        <dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper-spring-boot-starter</artifactId>
        </dependency>
        <!-- jdbc启动器 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <!-- mysql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>com.leyou.item</groupId>
            <artifactId>leyou-item-interface</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>

</project>
```



</details>

#### 配置文件

```yaml
server:
  port: 9001
spring:
  application:
    name: item-service
  datasource:
    url: jdbc:mysql:///leyoumall
    username: root
    password: root
    driver-class-name: com.mysql.jdbc.Driver
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
  instance:
    lease-renewal-interval-in-seconds: 5 # 5秒钟发送一次心跳
    lease-expiration-duration-in-seconds: 10 # 10秒不发送就过期
```



#### 启动类

```java
package com.leyou.item;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class LeyouItemServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeyouItemServiceApplication.class, args);
    }
}
```



## 添加商品微服务的路由规则

既然商品微服务已经创建，接下来肯定要添加路由规则到Zuul中，我们不使用默认的路由规则。

修改`leyou-gateway`工程的application.yaml配置文件：

```yaml
zuul:
  prefix: /api # 路由路径前缀
  routes:
    item-service: /item/** # 商品微服务的映射路径
```



## 启动测试

我们分别启动：`leyou-registry`，`leyou-gateway`，`leyou-item-service`



为了测试路由规则是否畅通，我们是不是需要在`item-service`中编写一个controller接口呢？

其实不需要，SpringBoot提供了一个依赖：`actuator`

只要我们添加了actuator的依赖，它就会为我们生成一系列的访问接口：

- /info
- /health
- /refresh
- ...

在`item-service`中添加依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```



启动访问：<http://192.168.0.101:9001/actuator/info>

因为我们没有添加信息，所以是一个空的json，但是可以肯定的是：我们能够访问到item-service了。

接下来我们通过路由访问试试，根据路由规则，我们需要访问的地址是：<http://192.168.0.101:20001/api/item/actuator/info>

!> 访问不到重启网关后再试



## 通用工具模块

有些工具或通用的约定内容，我们希望各个服务共享，因此需要创建一个工具模块：`leyou-common`

在`leyou-parent`创建leyou-common模块

![1575026025232](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1575026025232.png)



## 项目结构

![1575026161952](https://cdn.static.note.zzrfdsn.cn/images/project/leyoumall/1575026161952.png)



- `leyou-parent`：父工程，管理版本号

  - `leyou-common`：通用工程(存放工具类类等)

  - `leyou-gateway`：网关工程，拦截并分发请求
  - `leyou-item`：商品聚合工程
    - `leyou-item-interface`：存放pojo对象
    - `leyou-item-service`：对外提供rest接口的具体实现

- `leyou-registry`：eureka注册中心