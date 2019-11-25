# 自定义Starter

- 启动器只用来做依赖导入

- 专门来写一个自动配置模块；

- 启动器依赖自动配置模块，项目中引入相应的starter就会引入启动器的所有传递依赖

  ![1574561125363](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574561125363.png)

## 启动器

启动器模块是一个空 JAR 文件，仅提供辅助性依赖管理，这些依赖可能用于自动
装配或者其他类库

### 命名规约

- 官方命名

  `spring-boot-starter-模块名`

  *eg*：`spring-boot-starter-web`、`spring-boot-starter-jdbc`、`spring-boot-starter-thymeleaf`

- 自定义命名

  `模块名-spring-boot-starter`

  *eg*：`mybatis-spring-boot-start`

## 如何编写自动配置

```java
@Configuration //指定这个类是一个配置类
@ConditionalOnXXX //在指定条件成立的情况下自动配置类生效
@AutoConfigureAfter //指定自动配置类的顺序
@Bean //给容器中添加组件
@ConfigurationPropertie结合相关xxxProperties类来绑定相关的配置
@EnableConfigurationProperties //让xxxProperties生效加入到容器中
public class XxxxAutoConfiguration {
```

!> 自动配置类要能加载,需要将启动就加载的自动配置类配置在`META-INF/spring.factories`中

*eg：*

```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.mybatis.spring.boot.autoconfigure.MybatisLanguageDriverAutoConfiguration,\
org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration
```



## 案例

1. 创建一个自动配置模块，和创建普通springboot项目一样，不需要引入其他starter

2. 删除掉多余的文件和依赖

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
       <groupId>cn.clboy.spring.boot</groupId>
       <artifactId>clboy-spring-boot-autoconfigure</artifactId>
       <version>0.0.1-SNAPSHOT</version>
       <name>clboy-spring-boot-autoconfigure</name>
   
       <properties>
           <java.version>1.8</java.version>
       </properties>
   
       <dependencies>
           <!--引入spring‐boot‐starter；所有starter的基本配置-->
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter</artifactId>
           </dependency>
           <!--可以生成配置类提示文件-->
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-configuration-processor</artifactId>
               <optional>true</optional>
           </dependency>
       </dependencies>
   
   </project>
   ```

   ![1574563050873](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574563050873.png)

3. 创建配置类和自动配置类

   ```java
   package cn.clboy.spring.boot.autoconfigure;
   
   import org.springframework.boot.context.properties.ConfigurationProperties;
   
   @ConfigurationProperties(prefix = "clboy")
   public class ClboyProperties {
   
       private String prefix;
       private String suffix;
   
       public ClboyProperties() {
           this.prefix = "";
           this.suffix = "";
       }
   
       public String getPrefix() {
           return prefix;
       }
   
       public void setPrefix(String prefix) {
           this.prefix = prefix;
       }
   
       public String getSuffix() {
           return suffix;
       }
   
       public void setSuffix(String suffix) {
           this.suffix = suffix;
       }
   }
   ```

   ``` java
   package cn.clboy.spring.boot.autoconfigure;
   
   import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
   import org.springframework.boot.context.properties.EnableConfigurationProperties;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   
   /**
    * @Author cloudlandboy
    * @Date 2019/11/24 上午10:40
    * @Since 1.0.0
    */
   
   @Configuration
   @ConditionalOnWebApplication //web应用才生效
   @EnableConfigurationProperties(ClboyProperties.class) //让配置类生效，(注入到容器中)
   public class ClboyAutoConfiguration {
       
       private final ClboyProperties clboyProperties;
       
       /**
        * 构造器注入clboyProperties
        *
        * @param clboyProperties
        */
       public ClboyAutoConfiguration(ClboyProperties clboyProperties) {
           this.clboyProperties = clboyProperties;
       }
   
       @Bean
       public HelloService helloService() {
           return new HelloService();
       }
       
       public class HelloService {
           
           public String sayHello(String name) {
               return clboyProperties.getPrefix() + name + clboyProperties.getSuffix();
           }
       }
   }
   ```

   

4. 在resources文件夹下创建META-INF/spring.factories

   ![1574568406300](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574568406300.png)

   ```properties
   org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
   cn.clboy.spring.boot.autoconfigure.ClboyAutoConfiguration
   ```

5. 安装到本地仓库

6. 创建starter，选择maven工程即可，只是用于管理依赖，添加对AutoConfiguration模块的依赖

   ![1574565106397](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574565106397.png)

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
   
       <groupId>cn.clboy.spring.boot</groupId>
       <artifactId>clboy-spring-boot-starter</artifactId>
       <version>1.0-SNAPSHOT</version>
   
       <dependencies>
           <dependency>
               <groupId>cn.clboy.spring.boot</groupId>
               <artifactId>clboy-spring-boot-autoconfigure</artifactId>
               <version>0.0.1-SNAPSHOT</version>
           </dependency>
       </dependencies>
   
   </project>
   ```

7. 安装到本地仓库

8. 创建项目测试，选择添加web场景，因为设置是web场景才生效

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>2.2.1.RELEASE</version>
           <relativePath/> <!-- lookup parent from repository -->
       </parent>
       <groupId>cn.clboy</groupId>
       <artifactId>starter-test</artifactId>
       <version>0.0.1-SNAPSHOT</version>
       <name>starter-test</name>
       <description>Demo project for Spring Boot</description>
   
       <properties>
           <java.version>1.8</java.version>
       </properties>
   
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
           <dependency>
               <groupId>cn.clboy.spring.boot</groupId>
               <artifactId>clboy-spring-boot-starter</artifactId>
               <version>1.0-SNAPSHOT</version>
           </dependency>
       </dependencies>
   
   </project>
   ```

   

9. 创建Controller

   ```java
   @RestController
   public class HelloController {
   
       @Autowired
       private HelloService helloService;
   
       @RequestMapping("/hello")
       public String sayHello() {
           String hello = helloService.sayHello("Peppa Pig");
           return hello;
       }
   }
   ```

   

10. 在配置文件中配置

    ```properties
    clboy.prefix=hello！
    clboy.suffix=，你好啊...
    ```

11. 启动项目访问：<http://localhost:8080/hello>



!> 注意查看文件夹的命名是否正确，最好是从别的包中复制过去，正确的情况下spring.factories是有小绿叶图标的

![1574567314385](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574567314385.png)