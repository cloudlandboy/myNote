# HTTP基础认证



## HTTP 请求及响应结构

> 客户端发送到服务端的请求由以下四个部分组成
>
> 1. 请求行/起始行
> 2. 请求头
> 3. 一个空行
> 4. 请求数据



![img](https://cdn.tencentfs.clboy.cn/images/2022/20221103113314092.png)





HTTP响应也由四个部分组成，分别是：状态行、消息报头、空行和响应正文





## IDEA请求测试工具

> 在idea中创建以 `rest` 或 `http` 为后缀的文件可以很方便的进行http请求测试



### 创建项目

```B-test
B-test
├─ src
│  └─ main
│     ├─ java
│     │  └─ cn.clboy.spring.security.started.b
│     │  ├─ controller
│     │  │  └─ UserResourceController.java
│     │  ├─ entity
│     │  │  └─ SysUser.java
│     │  └─ Bpp.java
│     └─ resources
│        └─ b-test.http
└─ pom.xml
```

添加web和security的依赖

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

```java
/**
 * SysUser
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SysUser {
    private String username;
    private Integer age;
    private String gender;
    private LocalDateTime createTime;
}

/**
 * UserResourceController
 */
@RestController
@RequestMapping("/users")
public class UserResourceController {

    @GetMapping("/{username}")
    public SysUser get(@PathVariable("username") String username, @RequestParam("age") Integer age) {
        return new SysUser(username, age, null, LocalDateTime.now());
    }
}


/**
 * 启动类
 */
@SpringBootApplication
public class Bpp {
    public static void main(String[] args) {
        SpringApplication.run(Bpp.class, args);
    }
}
```

### 测试get请求

> 接下来创建 `b-test.http` 文件用于请求测试，在测试之前需要启动项目

```http
### get请求
GET http://localhost:8080/users/xiaoMing?age=18
```

运行后控制台输出了服务端接口的响应，状态码为 `401` ，这是因为我们引入了 `spring security` 在没有额外配置的情况下所有接口都要认证之后才能调用，我们在请求头中加入用户名密码即可

```http
### get请求
GET http://localhost:8080/users/xiaoMing?age=18
Authorization: Basic user 21cbbe35-1b79-44f1-8318-aedd8832dbf9
```



![image-20221102114312275](https://cdn.tencentfs.clboy.cn/images/2022/20221103113321442.png)



## HTTP Basic认证

> HTTP 提供一个用于权限控制和认证的通用框架。最常用的 HTTP 认证方案是 HTTP Basic authentication

HTTP Basic的认证流程是这样的：

1. 客户端向服务端发送请求，服务端发现客户端没有进行认证，于是向客户端返回 [`401`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/401)（Unauthorized，未被授权的）状态码，并在响应头 [`WWW-Authenticate`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/WWW-Authenticate) 提供如何进行验证的信息
2. 客户端在收到服务端响应的 `401` 状态码后可以在新的请求中添加 [Authorization](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Authorization) 请求头进行验证，字段值为身份验证凭证信息

![mpv-shot0001](https://cdn.tencentfs.clboy.cn/images/2022/20221103113333594.jpg)



如果是在浏览器中直接访问，浏览器默认会弹出一个密码框让用户填写，然后发送包含有 `Authorization` 请求头的请求，由于本例创建的项目使用的spring security默认配置，在浏览器直接访问，如果未经过认证，会被重定向到认证页面，我们可以创建自己的配置覆盖掉默认的

```java
@EnableWebSecurity
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //复制父类WebSecurityConfigurerAdapter的方法体，保留默认配置
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        //http.formLogin();
        http.httpBasic();
    }
}
```

![image-20221102143822320](https://cdn.tencentfs.clboy.cn/images/2022/20221103113337810.png)

![image-20221102144023121](https://cdn.tencentfs.clboy.cn/images/2022/20221103113342303.png)



!> 注意：在浏览器里测试的时候最好开一个无痕窗口去测，避免因cookie、localstorage等缓存问题造成干扰，平时开发时debug的时候也应该注意这一点



## Authorization语法

```http
Authorization: <type> <credentials>
```

- type：验证类型，常见的就是 `Basic`

- credentials：凭证

  如果使用 **基本验证** 方案（type为Basic），凭证通过如下步骤生成：

  1. 用冒号将用户名和密码进行拼接，如：`user:5a178c31-a497-4b13-a626-14255936fce5`
  2. 将第一步生成的结果用 base64 方式编码：`dXNlcjo1YTE3OGMzMS1hNDk3LTRiMTMtYTYyNi0xNDI1NTkzNmZjZTU=`