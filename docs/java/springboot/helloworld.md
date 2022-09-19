# Spring Boot 入门

## 简介

[百度百科](http://t.cn/AirXJZuO)

**优点**

> - 快速创建独立运行的Spring项目以及与主流框架集成
> - 使用嵌入式的Servlet容器，应用无需打成WAR包
> - starters自动依赖与版本控制
> - 大量的自动配置，简化开发，也可修改默认值
> - 无需配置XML，无代码生成，开箱即用
> - 准生产环境的运行时应用监控
> - 与云计算的天然集成



## 微服务

> 2014，martin fowler
>
> 微服务：架构风格（服务微化）
>
> 一个应用应该是一组小型服务；可以通过HTTP的方式进行互通；
>
> 单体应用：ALL IN ONE
>
> 微服务：每一个功能元素最终都是一个可独立替换和独立升级的软件单元；
>
> [详细参照微服务文档](https://martinfowler.com/articles/microservices.html#MicroservicesAndSoa)
>
> [集群、分布式、微服务概念和区别](https://blog.csdn.net/qq_37788067/article/details/79250623)



## 环境约束

–jdk1.8：Spring Boot 推荐jdk1.7及以上；

–maven3.x：maven 3.3以上版本；



## Maven设置

给maven 的settings.xml配置文件的profiles标签添加：（设置使用的jdk版本）

开发工具中的maven设置为自己配置的maven

```xml
<profile>
  <id>jdk-1.8</id>
  <activation>
    <activeByDefault>true</activeByDefault>
    <jdk>1.8</jdk>
  </activation>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
  </properties>
</profile>
```



## 创建一个maven工程

1. 导入spring boot相关的依赖

   ```xml
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>2.2.1.RELEASE</version>
           <relativePath/>
       </parent>
   
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
       </dependencies>
   ```

2. 编写一个主程序；启动Spring Boot应用

   ```java
   package cn.clboy.springboot;
   
   import org.springframework.boot.SpringApplication;
   import org.springframework.boot.autoconfigure.SpringBootApplication;
   
   /**
    * @Author cloudlandboy
    * @Date 2019/11/13 下午2:58
    * @Since 1.0.0
    * springBootApplication：标注一个主程序类，表示这个是一个Springboot应用
    */
   
   @SpringBootApplication
   public class HelloWorldMainApplication {
   
       public static void main(String[] args) {
           //启动
           SpringApplication.run(HelloWorldMainApplication.class, args);
       }
   }
   ```

   

3. 编写一个Controller

   ```java
   package cn.clboy.springboot.controller;
   
   import org.springframework.web.bind.annotation.RequestMapping;
   import org.springframework.web.bind.annotation.RestController;
   
   /**
    * @Author cloudlandboy
    * @Date 2019/11/13 下午3:05
    * @Since 1.0.0
    * RestController：是spring4里的新注解，是@ResponseBody和@Controller的缩写。
    */
   
   @RestController
   public class HelloController {
   
       @RequestMapping("/hello")
       public String hello(){
           return "hello SpringBoot,this is my first Application";
       }
   }
   ```

4. 运行主程序Main方法测试

5. 访问 [localhost:8080/hello](http://localhost:8080/hello)



## 简化部署

1. 添加maven插件

   ```xml
    <!-- 这个插件，可以将应用打包成一个可执行的jar包；-->
       <build>
           <plugins>
               <plugin>
                   <groupId>org.springframework.boot</groupId>
                   <artifactId>spring-boot-maven-plugin</artifactId>
               </plugin>
           </plugins>
       </build>
   ```

2. 使用mvn package进行打包

3. 进入打包好的jar包所在目录

4. 使用 `java -jar jar包名称` 运行



## Hello World探究

### 依赖

```
	<!--Hello World项目的父工程是org.springframework.boot-->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.1.RELEASE</version>
        <relativePath/>
    </parent>

    <!--
        org.springframework.boot他的父项目是spring-boot-dependencies
        他来真正管理Spring Boot应用里面的所有依赖版本；
        Spring Boot的版本仲裁中心；
        以后我们导入依赖默认是不需要写版本；（没有在dependencies里面管理的依赖自然需要声明版本号）
    -->
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies</artifactId>
    <version>2.2.1.RELEASE</version>
    <relativePath>../../spring-boot-dependencies</relativePath>
  </parent>
```

### 启动器

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

**spring-boot-starter**-`web`：

​	spring-boot-starter：spring-boot场景启动器；帮我们导入了web模块正常运行所依赖的组件；

Spring Boot将所有的功能场景都抽取出来，做成一个个的starters（启动器），只需要在项目里面引入这些starter相关场景的所有依赖都会导入进来。要用什么功能就导入什么场景的启动器



### 主程序类，主入口类

```java
@SpringBootApplication
public class HelloWorldMainApplication {

    public static void main(String[] args) {
        //启动
        SpringApplication.run(HelloWorldMainApplication.class, args);
    }
}
```

`@SpringBootApplication`:    Spring Boot应用标注在某个类上说明这个类是SpringBoot的主配置类，SpringBoot就应该运行这个类的main方法来启动SpringBoot应用；

看一下`@SpringBootApplication`这个注解类的源码

```java
@Target({ElementType.TYPE})	//可以给一个类型进行注解，比如类、接口、枚举
@Retention(RetentionPolicy.RUNTIME)	//可以保留到程序运行的时候，它会被加载进入到 JVM 中
@Documented	//将注解中的元素包含到 Javadoc 中去。
@Inherited	//继承，比如A类上有该注解，B类继承A类，B类就也拥有该注解

@SpringBootConfiguration

@EnableAutoConfiguration

/*
*创建一个配置类，在配置类上添加 @ComponentScan 注解。
*该注解默认会扫描该类所在的包下所有的配置类，相当于之前的 <context:component-scan>。
*/
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication
```

- `@SpringBootConfiguration`：Spring Boot的配置类；标注在某个类上，表示这是一个Spring Boot的配置类；

   ```java
   @Target({ElementType.TYPE})
   @Retention(RetentionPolicy.RUNTIME)
   @Documented
   @Configuration
   public @interface SpringBootConfiguration
   ```

   - `@Configuration`：配置类上来标注这个注解；

     配置类 -----  配置文件；配置类也是容器中的一个组件；@Component

     ```java
     @Target({ElementType.TYPE})
     @Retention(RetentionPolicy.RUNTIME)
     @Documented
     @Component
     public @interface Configuration 
     ```

- `@EnableAutoConfiguration`：开启自动配置功能；

   以前我们需要配置的东西，Spring Boot帮我们自动配置；@**EnableAutoConfiguration**告诉SpringBoot开启自动配置功能；这样自动配置才能生效；

   ```
   @Target({ElementType.TYPE})
   @Retention(RetentionPolicy.RUNTIME)
   @Documented
   @Inherited
   @AutoConfigurationPackage
   @Import({AutoConfigurationImportSelector.class})
   public @interface EnableAutoConfiguration
   ```

   - `@AutoConfigurationPackage`：自动配置包

     ```java
     @Target({ElementType.TYPE})
     @Retention(RetentionPolicy.RUNTIME)
     @Documented
     @Inherited
     @Import({Registrar.class})
     public @interface AutoConfigurationPackage
     ```

     - `@Import`：Spring的底层注解@Import，给容器中导入一个组件

       导入的组件由`org.springframework.boot.autoconfigure.AutoConfigurationPackages.Registrar`将主配置类（<mark>@SpringBootApplication标注的类`）的所在包及下面所有子包里面的所有组件扫描到Spring容器；

       ![DEBUG](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212200.png)

       这里controller包是在主程序所在的包下，所以会被扫描到，我们在springboot包下创建一个test包，把主程序放在test包下，这样启动就只会去扫描test包下的内容而controller包就不会被扫描到，再访问开始的hello就是404

       ![DEBUG](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212683.png)

   - `@Import({AutoConfigurationImportSelector.class})`

     `AutoConfigurationImportSelector.class`将所有需要导入的组件以全类名的方式返回；这些组件就会被添加到容器中；会给容器中导入非常多的自动配置类（xxxAutoConfiguration）；就是给容器中导入这个场景需要的所有组件，并配置好这些组件；

     有了自动配置类，免去了我们手动编写配置注入功能组件等的工作；

     ![Configuration](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213102.png)



Spring Boot在启动的时候从类路径下的META-INF/spring.factories中获取EnableAutoConfiguration指定的值，将这些值作为自动配置类导入到容器中，自动配置类就生效，帮我们进行自动配置工作；以前我们需要自己配置的东西，自动配置类都帮我们完成了；