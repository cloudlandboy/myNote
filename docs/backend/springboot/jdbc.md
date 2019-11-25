# SpringBoot与数据库连接

## 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.1.1</version>
    </dependency>

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

## 配置数据库连接信息

```yaml
spring:
  datasource:
    username: root
    password: root
    url: jdbc:mysql://172.16.145.137:3306/springboot
    driver-class-name: com.mysql.cj.jdbc.Driver
```

测试能否连接上数据库

```hava
@SpringBootTest
class SpringbootJdbcApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Test
    void contextLoads() throws SQLException {
        System.out.println(dataSource.getClass());
        System.out.println(dataSource.getConnection());
    }

}
```

springboot默认是使用`com.zaxxer.hikari.HikariDataSource`作为数据源，2.0以下是用`org.apache.tomcat.jdbc.pool.DataSource`作为数据源；

数据源的相关配置都在DataSourceProperties里面；

## 自动配置原理

?> *TODO*

jdbc的相关配置都在`org.springframework.boot.autoconfigure.jdbc`包下

参考`DataSourceConfiguration`，根据配置创建数据源，默认使用Hikari连接池；可以使用spring.datasource.type指定自定义的数据源类型；

springboot默认支持的连池：

- org.apache.commons.dbcp2.BasicDataSource
- com.zaxxer.hikari.HikariDataSource
- org.apache.tomcat.jdbc.pool.DataSource



自定义数据源类型：

```java
    @Configuration(
        proxyBeanMethods = false
    )
    @ConditionalOnMissingBean({DataSource.class})
    @ConditionalOnProperty(
        name = {"spring.datasource.type"}
    )
    static class Generic {
        Generic() {
        }

        @Bean
        DataSource dataSource(DataSourceProperties properties) {
             //使用DataSourceBuilder创建数据源，利用反射创建响应type的数据源，并且绑定相关属性
            return properties.initializeDataSourceBuilder().build();
        }
    }
```



## 启动应用执行sql

SpringBoot在创建连接池后还会运行预定义的SQL脚本文件，具体参考`org.springframework.boot.autoconfigure.jdbc.DataSourceInitializationConfiguration`配置类，

在该类中注册了`dataSourceInitializerPostProcessor`

下面是获取schema脚本文件的方法

```java
List<Resource> scripts = this.getScripts("spring.datasource.schema", this.properties.getSchema(), "schema");
```

![1574409852703](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574409852703.png)

可以看出，如果我们没有在配置文件中配置脚本的具体位置，就会在classpath下找`schema-all.sql`和`schema.sql`  <small>platform获取的是all，platform可以在配置文件中修改</small>

具体查看`createSchema()方法`和`initSchema()方法`

initSchema()方法获取的是`data-all.sql`，`data.sql`

我们也可以在配置文件中配置sql文件的位置

```yaml
spring:
  datasource:
	schema:
      - classpath:department.sql
      - 指定位置
```



**测试：**

在类路径下创建`schema.sql`，运行程序查看数据库是否存在该表

```sql
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```

程序启动后发现表并没有被创建，DEBUG查看以下，发现在运行之前会有一个判断

![1574411869052](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574411869052.png)

![1574412098885](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574412098885.png)

上面方法也不知道在干什么，反正就是只要是`NEVER`和`EMBEDDED`就为true，而DataSourceInitializationMode枚举类中除了这两个就剩下`ALWAYS`了，可以在配置文件中配置为ALWAYS

![1574412237660](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574412237660.png)

```yaml
spring:
  datasource:
    username: root
    password: root
    url: jdbc:mysql://172.16.145.137:3306/springboot
    driver-class-name: com.mysql.cj.jdbc.Driver
    initialization-mode: always
```



`schema.sql`：建表语句

`data.sql`：插入数据

当然混合使用也可以，愿意咋来咋来

!> **注意：**项目每次启动都会执行一次sql

## 整合Druid数据源

> 选择哪个数据库连接池
>
> - DBCP2 是 Appache 基金会下的项目，是最早出现的数据库连接池 DBCP 的第二个版本。
> - C3P0 最早出现时是作为 Hibernate 框架的默认数据库连接池而进入市场。
> - Druid 是阿里巴巴公司开源的一款数据库连接池，其特点在于有丰富的附加功能。
> - HikariCP 相较而言比较新，它最近两年才出现，据称是速度最快的数据库连接池。最近更是被 Spring 设置为默认数据库连接池。
>
> 不选择 C3P0 的原因：
>
> - C3P0 的 Connection 是异步释放。这个特性会导致释放的在某些情况下 Connection 实际上 **still in use** ，并未真正释放掉，从而导致连接池中的 Connection 耗完，等待状况。
> - Hibernate 现在对所有数据库连接池一视同仁，官方不再指定『默认』数据库连接池。因此 C3P0 就失去了『官方』光环。
>
> 不选择 DBCP2 的原因：
>
> - 相较于 Druid 和 HikariCP，DBCP2 没有什么特色功能/卖点。基本上属于 `能用，没毛病` 的情况，地位显得略有尴尬。

1. 在 Spring Boot 项目中加入`druid-spring-boot-starter`依赖 ([点击查询最新版本](https://mvnrepository.com/artifact/com.alibaba/druid-spring-boot-starter))

   ```xml
   <dependency>
       <groupId>com.alibaba</groupId>
       <artifactId>druid-spring-boot-starter</artifactId>
       <version>1.1.20</version>
   </dependency>
   ```

2. 在配置文件中指定数据源类型

   ```yaml
   spring:
     datasource:
       username: root
       password: root
       url: jdbc:mysql://172.16.145.137:3306/springboot
       driver-class-name: com.mysql.cj.jdbc.Driver
       initialization-mode: always
       type: com.alibaba.druid.pool.DruidDataSource
   ```

3. 测试类查看使用的数据源

   ```java
   @SpringBootTest
   class SpringbootJdbcApplicationTests {
   
       @Autowired
       private DataSource dataSource;
   
       @Test
       void contextLoads() throws SQLException {
           System.out.println(dataSource.getClass());
           System.out.println(dataSource.getConnection());
       }
   
   }
   ```

### 配置参数

```yaml
spring:
  datasource:
    username: root
    password: root
    url: jdbc:mysql://172.16.145.137:3306/springboot
    driver-class-name: com.mysql.cj.jdbc.Driver
    initialization-mode: always
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      # 连接池配置
      # 配置初始化大小、最小、最大
      initial-size: 1
      min-idle: 1
      max-active: 20
      # 配置获取连接等待超时的时间
      max-wait: 3000
      validation-query: SELECT 1 FROM DUAL
      test-on-borrow: false
      test-on-return: false
      test-while-idle: true
      pool-prepared-statements: true
      time-between-eviction-runs-millis: 60000
      min-evictable-idle-time-millis: 300000
      filters: stat,wall,slf4j
      # 配置web监控,默认配置也和下面相同(除用户名密码，enabled默认false外)，其他可以不配
      web-stat-filter:
        enabled: true
        url-pattern: /*
        exclusions: "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*"
      stat-view-servlet:
        enabled: true
        url-pattern: /druid/*
        login-username: admin
        login-password: root
        allow: 127.0.0.1
```

后台页面，访问<http://localhost:8080/druid/login.html>