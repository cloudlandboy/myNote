# Spring Cloud Gateway

> spring cloud gatewa 是spring cloud 的第二代网关(第一代是zull)
>
> 基于Netty、reactor及Webflux构建，由于它不是Servlet编程模型，所以不能在Servlet容器下工作，也不能构建成war包



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

