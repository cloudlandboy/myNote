# 认证与授权基础知识



## 什么是认证

> 认证主要是解决 `我是谁` 的问题

通俗点解释：比如你去敲你朋友家的门，你朋友在开门让你进入房子之前肯定会问 "谁在敲门！"，这里你会回答 "我" ，如果你的声音他非常熟悉，他就会之前给你开门，否则就会询问你的姓名等。这就是认证的过程，为了保证安全性，在你进入我的屋子之前必须保证我们是认识的，当你给我一个标识，不管是声音、指纹、还是约定好的口令，我只要能判断你是一个可信任的就行了

![image-20221031112557853](https://cdn.tencentfs.clboy.cn/images/2022/20221103113227266.png)

## 什么是授权

> 授权主要解决 `我能干什么` 的问题

公司里每个部门岗位的权限都不同，就比如你和你的主管，你也认识他他也认识你，但是他有权决定你和你的同事每个月的绩效工资，而你就没有这个权限。权限也就相当现实中的权利，权利越大，越多，能干的事情也就越多

![image-20221031113713800](https://cdn.tencentfs.clboy.cn/images/2022/20221103113230823.png)



## 代码演示

### 创建项目

> 创建springboot项目，版本 `2.6.13`

```
A-test
├─ src
│  └─ main
│     └─ java
│        └─ cn.clboy.spring.security.started.a
│        ├─ controller
│        │  └─ UserResourceController.java
│        └─ App.java
└─ pom.xml
```

```java
//App.java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

//UserResourceController.java
@RestController
@RequestMapping("/users")
public class UserResourceController {
    @GetMapping("/hello")
    public String hello() {
        return "hello world!";
    }
}
```



启动项目访问 [http://localhost:8080/users/hello](http://localhost:8080/users/hello) 

这个时候项目还是完全开放的，任何人都可以访问，不出意外页面应该显示的是 **hello world!**



### 引入spring security认证

> 在项目pom文件中引入 `spring-boot-starter-security`

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

接下来什么也不需要改动，重启项目后再次访问：[http://localhost:8080/users/hello](http://localhost:8080/users/hello)

不出意外的你会看到 **Please sign in** 标题的表单，也就是说此时你需要登录后才能继续操作

默认用户名是：`user` ，密码在项目启动时控制台有输出，登录后就再次看到了 **hello world!** 

![image-20221031150426598](https://cdn.tencentfs.clboy.cn/images/2022/20221103113236089.png)



### 测试授权

> 授权需要写一个配置类进行配置，配置类继承 `org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter` 重写 `configure(HttpSecurity http)` 方法
>
> 给配置类添加 `@EnableWebSecurity` 注解

```java
@EnableWebSecurity
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //复制父类WebSecurityConfigurerAdapter的方法体，保留默认配置
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        http.formLogin();
        http.httpBasic();
        //配置/users/hello这个接口需要拥有 ADMIN 的角色才能访问
        http.authorizeRequests(req -> req.mvcMatchers("/users/hello").hasRole("ADMIN"));
    }
}
```

重启项目后再次访问：[http://localhost:8080/users/hello](http://localhost:8080/users/hello)

可以看到这次即使登录后也没有显示 **hello world!** ，而是错误状态码 `403` （该状态码表示未授权禁止访问）

```
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Mon Oct 31 16:19:45 CST 2022
There was an unexpected error (type=Forbidden, status=403).
Forbidden
```

