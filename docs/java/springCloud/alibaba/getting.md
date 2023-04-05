# Spring Cloud Alibaba

> Spring Cloud Alibaba 为分布式应用开发提供一站式解决方案。它包含开发分布式应用程序所需的所有组件，使您可以轻松使用 Spring Cloud 开发应用程序

## Nacos

nacos是alibaba开源的服务发现组件和配置管理服务，它的服务发现就是和之前学习的Eureka一样充当注册中心的功能

官网：https://nacos.io/zh-cn/index.html

默认情况下nacos使用嵌入式数据库Derby，所以不需要任何配置，从官网下载压缩包直接启动即可

如何启动官网文档写的很明白，直接参考官方文档启动单机实例

https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html

这里我安装的是 `2.1.2` 版本

https://github.com/alibaba/nacos/releases/download/2.1.2/nacos-server-2.1.2.zip

默认端口：8848

控制台页面：http://127.0.0.1:8848/nacos/index.html

默认用户名和密码都是 `nacos`



## 版本选择

spring could alibaba与spring cloud 的版本对照

https://github.com/alibaba/spring-cloud-alibaba/blob/2022.x/README-zh.md#%E5%A6%82%E4%BD%95%E6%9E%84%E5%BB%BA



## 依赖统一管理

和spring could一样，导入spring-cloud-alibaba-dependencies的pom后

使用spring cloud alibaba生态下的模块后都不用再写版本号了

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.6.14</version>
    <relativePath/>
</parent>

<!--  ......  -->

<properties>
    <spring.cloud.version>2021.0.5</spring.cloud.version>
    <spring.cloud.alibaba.version>2021.0.4.0</spring.cloud.alibaba.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring.cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>${spring.cloud.alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```



## 服务注册

首先要添加 `spring-cloud-starter-alibaba-nacos-discovery` 的依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

然后在配置文件中配置应用名称(服务名称)及nacos连接信息

```yaml
spring:
  application:
    name: @project.artifactId@
  cloud:
    nacos:
      discovery:
        # nacos服务的地址+端口号
        server-addr: 127.0.0.1:8848
server:
  port: 10002
```

启动后就可以在nacos控制台看到服务已经注册上了



## 服务发现的领域模型

在nacos中有这样几个比较重要的概念

![mpv-shot0009](https://cdn.tencentfs.clboy.cn/images/2023/20230215201943349.jpg)

- **命名空间(Namespace)** ：用于进行租户粒度的配置隔离，常用场景之一是不同环境的配置的区分隔离，例如开发、测试、生成环境，不同命名空间下的服务和配置都是完全隔离的，不能相互访问。默认为 `public`
- **分组(Group)** ：不同的服务和配置可以归类到同一分组，不同组之间的配置和服务不能相互访问。默认为 `DEFAULT_GROUP`
- **虚拟集群(Cluster)** ：对指定微服务进行的虚拟划分，同一个服务下的所有实例可以组成一个集群，比如我们可以按地域进行集群划分

```yaml
spring:
  cloud:
    nacos:
      discovery:
        # nacos服务的地址+端口号
        server-addr: 127.0.0.1:8848
        # 命名空间id,需要提前在控制台创建好
        namespace: dev
        # 服务分组名
        group: cloud_starter
        # 集群名称
        cluster-name: HZ
```



## 元数据

> Nacos数据（如配置和服务）描述信息，如服务版本、权重、容灾策略、负载均衡策略、鉴权配置、各种自定义标签 (label)，从作用范围来看，分为服务级别的元信息、集群的元信息及实例的元信息。

通过元数据可以实现对服务的版本控制，例如相同版本的微服务才能相互调用，这样就可以进行灰度发布。这个后面我们再讲

在配置文件中可以通过 `metadata` 属性设置服务的自定义元信息

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        metadata:
          author: clboy
          email: syl@clboy.cn
          version: v1
```
