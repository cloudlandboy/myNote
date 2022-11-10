# spring security配置

> 由前面的教程中，我们知道创建一个类继承 `org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter` 抽象类，重写该类的一些方法，即可对spring security进行定制化配置。最后在配置类添加上 `@EnableWebSecurity` 注解使其生效



## 链式与函数式配置

> `configure(HttpSecurity http)` 方法有两种配置方式



### 链式

```java
@EnableWebSecurity
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests().anyRequest().authenticated()
                .and()
                .formLogin().usernameParameter("username").passwordParameter("password")
                .and()
                .httpBasic().disable();
    }
}
```

这里都使用的HttpSecurity实例的 `authorizeRequests` 、`formLogin` 、`httpBasic` 的无参方法，方法会返回具体的配置实例，具体的配置完成后可以调用 `and` 方法再次返回HttpSecurity实例对其他具体配置进行设置

### 函数式

```java
@EnableWebSecurity
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //配置请求接口访问限制(是否需要认证，需要哪些权限等等)，这里配置所有请求都需要认证过才能访问
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        //配置登录页：登录页路径、用户名参数名，密码参数名等
        http.formLogin(form -> form.loginPage("/login").usernameParameter("username").passwordParameter("password"));
        //配置Basic认证，这里直接禁用掉
        http.httpBasic(AbstractHttpConfigurer::disable);
    }
}
```

这里HttpSecurity实例的 `authorizeRequests` 、`formLogin` 、`httpBasic` 等方法都接收一个函数式接口 `Customizer` ，然后在函数式消费体内可以接着使用链式调用。

相比之下函数式的配置方式看起来更整洁明了



## debug模式

> spring security可以开启 `debug` 模式，这样就可以看到更多的日志输出



1. 配置日志级别为 `debug`

   ```yaml
   logging:
     level:
       org.springframework.security: debug
   ```

2. 配置类 `@EnableWebSecurity` 注解开启 debug

   ```java
   @EnableWebSecurity(debug = true)
   ```

3. 重启项目，可以看到控制台输出以下日志，告诉我们不要用于生产环境

   ```
   ********************************************************************
   **********        Security debugging is enabled.       *************
   **********    This may include sensitive information.  *************
   **********      Do not use in a production system!     *************
   ********************************************************************
   ```

   

## WebSecurity配置

> 前面的配置都是对 `HttpSecurity` 进行配置，WebSecurityConfigurerAdapter还提供了 `configure(WebSecurity web)` 方法可以对 `WebSecurity` 进行配置
>
> `WebSecurity` 是对请求的过滤器链进行配置，如果只对 `HttpSecurity` 进行配置，即使有些请求不需要认证登录就可以访问，也会经过一系列过滤器。这样在访问一个静态资源的时候或公开的接口时性能是不是有所影响



创建controller，该controller的所有接口都不需要登录即可访问

```java
@RestController
@RequestMapping("/public")
public class PublicResourceController {

    @GetMapping("/my_ip")
    public String getClientIp(HttpServletRequest request) {
        return request.getRemoteHost();
    }
}
```

按照默认配置启动项目的情况下访问 [http://127.0.0.1:8080/public/my_ip](http://127.0.0.1:8080/public/my_ip) 会被重定向到登录页

添加配置任何人都可以访问 `/public/` 下的所有接口，不需要登录 

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.mvcMatchers("/public/**").permitAll().anyRequest().authenticated());
        http.formLogin();
        http.httpBasic();
    }
}
```

启动项目并开启debug模式，访问这个接口，不需要登录就可以调用成功，回到控制台查看日志输出，搜索 `Spring Security Debugger` ，包含该字眼的行都是spring security打印的日志

```
Request received for GET '/public/my_ip':

org.apache.catalina.connector.RequestFacade@7248de2

servletPath:/public/my_ip
pathInfo:null
headers: 
host: 127.0.0.1:8080
connection: keep-alive

......

Security filter chain: [
  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  CsrfFilter
  LogoutFilter
  UsernamePasswordAuthenticationFilter
  DefaultLoginPageGeneratingFilter
  DefaultLogoutPageGeneratingFilter
  BasicAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
]
```

可以看出日志中输出了请求的相关信息和经过的一系列过滤器，上面有些认证相关的过滤器其实完全没必要处理该请求

我们可以在 `configure(WebSecurity web)` 方法中配置忽略某些请求路径

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        http.formLogin();
        http.httpBasic();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().mvcMatchers("/public/**", "static/**", "/favicon.ico");
    }
}
```

重启项目访问查看日志

```
Request received for GET '/public/my_ip':

org.apache.catalina.connector.RequestFacade@2135ebb9

servletPath:/public/my_ip
pathInfo:null
headers: 
host: 127.0.0.1:8080

......

Security filter chain: [] empty (bypassed by security='none') 
```



## 用户名密码配置

默认情况下spring security的用户名为 `user` 密码为每次启动时随机生成的然后打印在控制台当中，当然我们也可以自己配置

```yaml
logging:
  level:
    org.springframework.security: debug
spring:
  security:
    user:
      name: admin
      password: 123456
      roles: ADMIN
```

访问 [http://127.0.0.1:8080/users/xiaoMing?age=18](http://127.0.0.1:8080/users/xiaoMing?age=18)



## 自定义登录页

> spring security有默认的登录页，如果想实现自己的登录页，就需要在 `configure(HttpSecurity http)` 方法中配置



### 项目结构

```B-test
B-test
├─ src
│  └─ main
│     ├─ java
│     │  └─ cn.clboy.spring.security.started.b
│     │  ├─ config
│     │  │  └─ SpringSecurityConfig.java
│     │  ├─ controller
│     │  │  ├─ PublicResourceController.java
│     │  │  └─ UserResourceController.java
│     │  ├─ entity
│     │  │  └─ SysUser.java
│     │  └─ Bpp.java
│     └─ resources
│        ├─ public
│        │  ├─ css
│        │  │  └─ login.css
│        │  ├─ index.html
│        │  └─ login.html
│        ├─ application.yml
│        └─ b-test.http
└─ pom.xml
```

### 静态资源

**主页和登录页**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>主页</title>
</head>
<body>
<h1>欢迎您进入主页</h1>
</body>
</html>

<!-- login.html -->
<!DOCTYPE>
<html>
<html lang="ch">
<head>
    <meta charset="utf-8">
    <title>College Live</title>
    <link rel="stylesheet" href="/css/login.css">
</head>
<body class="login-box">
<div id="content">
    <h1>登录</h1><br/>
    <form action="/auth" method="post">
        <div id="error" style="display: none">用户名或密码错误</div>
        <input type="text" name="username" id="userid"/><br/><br/>
        <input type="password" name="password" id="password"/><br/><br/>
        <input type="submit" id="login-button" value="登录"/>
    </form>
</div>
<script>
    /*如果登录处理接口处理错误会重定向到登录页并且会携带error查询参数*/
    document.querySelector("#error").style.display = location.search.includes('error') ? 'block' : 'none';
</script>
</body>
</html>
```

**login.css**

```css
#title {
    font-family: "新宋体";
    position: absolute;
    color: brown;
    font-size: 60px;
    text-align-last: center;
    left: 40%;
    top: 10%;
}
#content {
    position: absolute;
    top: 50%;
    /*顶部到元素*/
    left: 30%;
    width: 40%;
    height: 400px;
    margin-top: -200px;
    /*边缘到底部*/
    background-color: #34495e;
    text-align-last: center;
    /*这里做一个半透明效果*/
    filter: alpha(Opacity=60);
    -moz-opacity: 0.8;
    opacity: 0.8;
}
#userid {
    color: #3498db;
    font-size: 30px;
    text-align: center;
    border-radius: 25px;
    /*边框圆角*/
}
#password {
    color: #3498db;
    font-size: 30px;
    text-align: center;
    border-radius: 25px;
}
#login-button {
    background-color: pink;
    border-radius: 10px;
    border: 0;
    /*边框宽度0*/
    height: 50px;
    width: 90px;
    padding: 5px 10px;
    /*上下填充10 左右5*/
    font-size: 20px;
}
#content h1 {
    color: white;
    font-size: 50px;
}
.login-box {
    background-image: linear-gradient(135deg, #81FFEF 10%, #F067B4 100%);
}
#error {
    margin: 8px 0;
    color: red;
}
```



### Spring Security 配置

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        //设置登录页路径和登录处理的接口路径
        http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
        http.httpBasic();
    }
}
```



### 登录测试

配置完成之后访问 [http://127.0.0.1:8080/login.html](http://127.0.0.1:8080/login.html)

会显示该网页无法正常运作， 重定向的次数过多的错误，这是由于上面配置了所有请求都需要登录后才能访问，当然也包括 `/login.html`  。这时候访问 `/login.html` 由于没有登录就会被重定向登录页，而登录页就是 `/login.html` 造成死循环。

修改配置允许所有人访问 `/login.html` 和 **CSS文件**

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
        //设置登录页路径和登录处理的接口路径
        http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
        http.httpBasic();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置不需要spring security处理的请求路径，注意这里是请求路径而不是你静态资源目录路径，例如写 "/public/**" 是错误的,只会对PublicResourceController生效
        web.ignoring().mvcMatchers("/login.html", "/css/**");
    }
}
```

一切配置完毕我们访问 [http://127.0.0.1:8080/](http://127.0.0.1:8080/) ，理论上来说由于我们没有登录会被重定向到登录页，在输入正确用户名密码后就会被重定向会主页，页面应该显示 **欢迎您进入主页**

!> 可现实是在登录页不管输入用户名密码是否正确都会被一直重定向到登录页。

### 一直被重定向到登录页

我们再次输入正确用户名密码，然后返回控制台查看日志输出

![image-20221103110740502](https://cdn.tencentfs.clboy.cn/images/2022/20221103113211354.png)

这里可以看到我们，接着又请求了 `/error` 路径。这里好像明白了，为什么又到了登录页。因为 `/error` 也是需要登录才能访问的，我们允许所有人访问 `/error` 试一试

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests((requests) -> requests.mvcMatchers("/error").permitAll().anyRequest().authenticated());
    //设置登录页路径和登录处理的接口路径
    http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
    http.httpBasic();
}
```

重启后发现登录后页面显示了错误信息，终于没有在登录页反复横跳了

```
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Thu Nov 03 11:11:11 CST 2022
There was an unexpected error (type=Forbidden, status=403).
Forbidden
```

在刚才控制台日志看出，服务端给我们返回了 `403` 状态码，好像是因为什么 `CSRF` 问题，这次我们直接给它禁用掉试试

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests((requests) -> requests.mvcMatchers("/error").permitAll().anyRequest().authenticated());
    //设置登录页路径和登录处理的接口路径
    http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
    http.httpBasic();
    http.csrf().disable();
}
```

重启登录，嘿，成功了。接下来了解下 `csrf` 是什么东西



## CSRF 攻击(可跳过)

> 参考：https://tech.meituan.com/2018/10/11/fe-security-csrf.html



### 什么是CSRF

> CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

一个典型的CSRF攻击有着如下的流程：

1. 受害者登录a.com，并保留了登录凭证（Cookie）。
2. 攻击者引诱受害者访问了b.com。
3. b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带a.com的Cookie。
4. a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
5. a.com以受害者的名义执行了act=xx。
6. 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作。



### 攻击示例

> 假设某网站 `http://xxx.com`  有这样一个接口：`/account/transfer` 该接口接收两个参数 `accountNo` 和 `amount`
>
> 该接口的作用是将指定的金额转账给指定的账户



#### GET请求

如果该接口的请求方式为 `get` ，那么攻击者就有以下两种方式

- **链接** ：攻击者可以说服受害者点击这个链接

  ```html
  <a href="http://xxx.com/account/transfer?accountNo=2022&amount=1000">1分钱抢苹果14</a>
  ```

- **图片** ：攻击者可能使用带有目标 URL 的 `<img/>` 标签作为图片源。这种方法甚至不需要点击。该请求将在页面加载时自动执行

  ```html
  <img src="http://xxx.com/account/transfer?accountNo=2022&amount=1000"/>
  ```

  

#### POST请求

> 学过一点前端的都知道可以使用js脚本主动触发表单提交，那么攻击者就是利用这一机制

```html
 <form action="http://xxx.com/account/transfer" method=POST>
    <input type="hidden" name="accountNo" value="2022"/>
    <input type="hidden" name="amount" value="10000"/>
</form>
<script> document.forms[0].submit(); </script>
```



### CSRF的特点

- 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。
- 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据。
- 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是 “冒用”。
- 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪。

!> CSRF通常是跨域的，因为外域通常更容易被攻击者掌控。但是如果本域下有容易被利用的功能，比如可以发图和链接的论坛和评论区，攻击可以直接在本域下进行，而且这种攻击更加危险。

### 防护策略

> CSRF通常从第三方网站发起，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对CSRF的防护能力来提升安全性。



上文中讲了CSRF的两个特点：

- CSRF **通常** 发生在第三方域名。
- CSRF攻击者不能获取到Cookie等信息，只是使用。

针对这两点，我们可以专门制定防护策略，如下：

- 阻止不明外域的访问
  - 同源检测
  - Samesite Cookie
- 提交时要求附加本域才能获取的信息
  - CSRF Token
  - 双重Cookie验证



既然CSRF大多来自第三方网站，那么我们就直接禁止外域（或者不受信任的域名）对我们发起请求。

那么问题来了，我们如何判断请求是否来自外域呢？

在HTTP协议中，每一个异步请求都会携带两个请求头，用于标记来源域名：

- Origin Header
- Referer Header

这两个请求头在浏览器发起请求时，大多数情况会自动带上，并且不能由前端自定义内容。 服务器可以通过解析这两个Header中的域名，确定请求的来源域。



#### Origin Header

在部分与CSRF有关的请求中，请求的Header中会携带Origin字段。字段内包含请求的域名（不包含请求路径和查询参数）。

如果Origin存在，那么直接使用Origin中的字段确认来源域名就可以。

但是Origin在以下两种情况下并不存在：

- **IE11同源策略** ： IE11不会在跨站CORS请求上携带Origin标头，Referer头将仍然是唯一的标识。最根本原因是因为IE 11对同源的定义和其他浏览器有不同，有两个主要的区别，可以参考[MDN Same-origin_policy#IE_Exceptions](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#IE_Exceptions)
- **302重定向** ： 在302重定向之后Origin不包含在重定向的请求中，因为Origin可能会被认为是其他来源的敏感信息。对于302重定向的情况来说都是定向到新的服务器上的URL，因此浏览器不想将Origin泄漏到新的服务器上。



#### Referer Header

根据HTTP协议，在HTTP头中有一个字段叫 [Referer](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referer) ，记录了该HTTP请求的来源地址（包含请求路径和查询参数）。即表示当前页面是通过此来源页面里的链接进入的。 对于Ajax请求，图片和script等资源请求，Referer为发起请求的页面地址。对于页面跳转，Referer为打开页面历史记录的前一个页面地址。因此我们在Referer中得知请求的来源域名。

这种方法并非万无一失，Referer的值是由浏览器提供的，虽然HTTP协议上有明确的要求，但是每个浏览器对于Referer的具体实现可能有差别，并不能保证浏览器自身没有安全漏洞。使用验证 Referer 值的方法，就是把安全性都依赖于第三方（即浏览器）来保障，从理论上来讲，这样并不是很安全。在部分情况下，攻击者可以隐藏，甚至修改自己请求的Referer。



**Referrer Policy** ：一组规范，对浏览器该如何发送Referer做了详细的规定，在发送请求时会携带在请求头中，值如下：

| 值                                   | 说明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| no-referrer                          | 整个 Referer 首部会被移除。访问来源信息不随着请求一起发送    |
| no-referrer-when-downgrade（默认值） | 在没有指定任何策略的情况下用户代理的默认行为。在同等安全级别的情况下，引用页面的地址会被发送 (HTTPS->HTTPS)，但是在降级的情况下不会被发送 (HTTPS->HTTP) |
| origin                               | 在任何情况下，仅发送文件的源作为引用地址。例如 `https://example.com/page.html` 会将 `https://example.com/ 作为引用地址` |
| origin-when-cross-origin             | 对于同源的请求，会发送完整的 URL 作为引用地址，但是对于非同源请求仅发送文件的源 |
| same-origin                          | 对于同源的请求会发送引用地址，但是对于非同源请求则不发送引用地址信息 |
| strict-origin                        | 在同等安全级别的情况下，发送文件的源作为引用地址 (HTTPS->HTTPS)，但是在降级的情况下不会发送 (HTTPS->HTTP) |
| strict-origin-when-cross-origin      | 对于同源的请求，会发送完整的 URL 作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址 (HTTPS->HTTPS)；在降级的情况下不发送此首部 (HTTPS->HTTP) |
| unsafe-url                           | 无论是同源请求还是非同源请求，都发送完整的 URL（移除参数信息之后）作为引用地址 |

示例：

| 策略                                                 | 当前地址                      | 即将访问的地址                     | 携带的Referrer值              |
| :--------------------------------------------------- | :---------------------------- | :--------------------------------- | :---------------------------- |
| `no-referrer`                                        | https://example.com/page.html | 任何地址                           | 无                            |
| `no-referrer-when-downgrade` (同源同安全等级)        | https://example.com/page.html | https://example.com/otherpage.html | https://example.com/page.html |
| `no-referrer-when-downgrade` (不同源同安全等级)      | https://example.com/page.html | https://mozilla.org                | https://example.com/page.html |
| `no-referrer-when-downgrade` (降低安全等级)          | https://example.com/page.html | http://example.org                 | 无                            |
| `origin`                                             | https://example.com/page.html | 任何地址                           | https://example.com/          |
| `origin-when-cross-origin`  (同源同安全等级)         | https://example.com/page.html | https://example.com/otherpage.html | https://example.com/page.html |
| `origin-when-cross-origin` (不同源同安全等级)        | https://example.com/page.html | https://mozilla.org                | https://example.com/          |
| `origin-when-cross-origin` (降低安全等级)            | https://example.com/page.html | http://example.com/page.html       | https://example.com/          |
| `same-origin` (同源)                                 | https://example.com/page.html | https://example.com/otherpage.html | https://example.com/page.html |
| `same-origin` (不同源)                               | https://example.com/page.html | https://mozilla.org                | 无                            |
| `strict-origin` (同安全等级)                         | https://example.com/page.html | https://mozilla.org                | https://example.com/          |
| `strict-origin` (降低安全等级)                       | https://example.com/page.html | http://example.org                 | 无                            |
| `strict-origin` (http)                               | http://example.com/page.html  | 任何地址                           | http://example.com/           |
| `strict-origin-when-cross-origin`  (同源同安全等级)  | https://example.com/page.html | https://example.com/otherpage.html | https://example.com/page.html |
| `strict-origin-when-cross-origin` (不同源同安全等级) | https://example.com/page.html | https://mozilla.org                | https://example.com/          |
| `strict-origin-when-cross-origin` (降低安全等级)     | https://example.com/page.html | http://example.org                 | 无                            |
| `unsafe-url`                                         | https://example.com/page.html | 任何地址                           | https://example.com/page.html |



根据上面的表格因此需要把Referrer Policy的策略设置成 `same-origin` ，对于同源的链接和引用，会发送Referer，且Referer值只要域名没有路径和查询参数；跨域访问则不携带Referer。例如：`aaa.com`引用`bbb.com`的资源，不会发送Referer。

设置Referrer Policy的方法有三种：

1. 页面头部增加meta标签
2. `<a>` 、`<area>` 、`<img>` 、`<iframe>` 、`<link>`标签的 `referrerpolicy` 属性



!> 上面说的这些比较多，但我们可以知道一个问题：攻击者可以在自己的请求中隐藏Referer

另外在以下情况下Referer没有或者不可信：

1. IE6、7下使用window.location.href=url进行界面的跳转，会丢失Referer。
2. IE6、7下使用window.open，也会缺失Referer。
3. HTTPS页面跳转到HTTP页面，所有浏览器Referer都丢失。
4. 点击Flash上到达另外一个网站的时候，Referer的情况就比较杂乱，不太可信。

当Origin和Referer头文件不存在时该怎么办？如果Origin和Referer都不存在，建议直接进行阻止

上面说了那么多，Referer Header 在某些情况下还是不可信，那么有没有其他解决方案呢

#### CSRF Token

> 前面讲到CSRF的另一个特征是，攻击者无法直接窃取到用户的信息（Cookie，Header，网站内容等），仅仅是冒用Cookie中的信息。
>
> 而CSRF攻击之所以能够成功，是因为服务器误把攻击者发送的请求当成了用户自己的请求。那么我们可以要求所有的用户请求都携带一个CSRF攻击者无法获取到的Token。服务器通过校验请求是否携带正确的Token，来把正常的请求和攻击的请求区分开，也可以防范CSRF的攻击。



CSRF Token的防护策略分为三个步骤：

1. 将CSRF Token下发给客户端页面

   首先，用户打开页面的时候，服务器需要给这个用户生成一个随机Token，显然在提交时Token不能再放在Cookie中了，否则又会被攻击者冒用。之后在每次页面加载时，使用JS遍历整个DOM树，对于DOM中所有的a和form标签后加入Token。这样可以解决大部分的请求，但是对于在页面加载之后动态生成的HTML代码，这种方法就没有作用，还需要程序员在编码时手动添加Token。

2. 页面提交的请求携带这个Token

3. 服务器验证Token是否正确

由于使用服务端存储token，读取和验证CSRF Token会引起比较大的复杂度和性能问题，目前很多网站采用Encrypted Token Pattern方式。这种方法的Token是一个计算出来的结果，而非随机生成的字符串。这样在校验时无需再去读取存储的Token，只用再次计算一次即可。

这种Token的值通常是使用UserID、时间戳和随机数，通过加密的方法生成。这样既可以保证分布式服务的Token一致，又能保证Token不容易被破解。

在token解密成功之后，服务器可以访问解析值，Token中包含的UserID和时间戳将会被拿来被验证有效性，将UserID与当前登录的UserID进行比较，并将时间戳与当前时间进行比较。

Token是一个比较有效的CSRF防护方法，只要页面没有其他漏洞泄露Token，那么接口的CSRF攻击就无法成功。

但是此方法的实现比较复杂，需要给每一个页面都写入Token（前端无法使用纯静态页面），每一个Form及Ajax请求都携带这个Token，后端对每一个接口都进行校验，并保证页面Token及请求Token一致。这就使得这个防护策略不能在通用的拦截上统一拦截处理，而需要每一个页面和接口都添加对应的输出和校验。这种方法工作量巨大，且有可能遗漏。

?> 验证码和密码其实也可以起到CSRF Token的作用哦，而且更安全。为什么很多银行等网站会要求已经登录的用户在转账时再次输入密码，现在是不是有一定道理了？



#### 双重Cookie验证

在会话中存储CSRF Token比较繁琐，而且不能在通用的拦截上统一处理所有的接口。

那么另一种防御措施是使用双重提交Cookie。利用CSRF攻击不能获取到用户Cookie的特点，我们可以要求Ajax和表单请求携带一个Cookie中的值。

双重Cookie采用以下流程：

- 在用户访问网站页面时，向请求域名注入一个Cookie，内容为随机字符串（例如`csrfcookie=v8g9e4ksfhw`）。
- 在前端向后端发起请求时，取出Cookie，并添加到URL的参数中（接上例`POST https://www.a.com/comment?csrfcookie=v8g9e4ksfhw`）。
- 后端接口验证Cookie中的字段与URL参数中的字段是否一致，不一致则拒绝。

此方法相对于CSRF Token就简单了许多。可以直接通过前后端拦截的的方法自动化实现。后端校验也更加方便，只需进行请求中字段的对比，而不需要再进行查询和存储Token。

当然，此方法并没有大规模应用，其在大型网站上的安全性还是没有CSRF Token高，原因我们举例进行说明。

由于任何跨域都会导致前端无法获取Cookie中的字段（包括子域名之间），于是发生了如下情况：

- 如果用户访问的网站为`www.a.com`，而后端的api域名为`api.a.com`。那么在`www.a.com`下，前端拿不到`api.a.com`的Cookie，也就无法完成双重Cookie认证。
- 于是这个认证Cookie必须被种在`a.com`下，这样每个子域都可以访问。
- 任何一个子域都可以修改`a.com`下的Cookie。
- 某个子域名存在漏洞被XSS攻击（例如`upload.a.com`）。虽然这个子域下并没有什么值得窃取的信息。但攻击者修改了`a.com`下的Cookie。
- 攻击者可以直接使用自己配置的Cookie，对XSS中招的用户再向`www.a.com`下，发起CSRF攻击。

**用双重Cookie防御CSRF的优点：**

- 无需使用服务端存储，适用面更广，易于实施。
- Token储存于客户端中，不会给服务器带来压力。
- 相对于Token，实施成本更低，可以在前后端统一拦截校验，而不需要一个个接口和页面添加。

**缺点：**

- Cookie中增加了额外的字段。
- 如果有其他漏洞（例如XSS），攻击者可以注入Cookie，那么该防御方式失效。
- 难以做到子域名的隔离。
- 为了确保Cookie传输安全，采用这种防御方式的最好确保用整站HTTPS的方式，如果还没切HTTPS的使用这种方式也会有风险。



#### Samesite Cookie属性

防止CSRF攻击的办法已经有上面的预防措施。为了从源头上解决这个问题，Google起草了一份草案来改进HTTP协议，那就是为Set-Cookie响应头新增Samesite属性，它用来标明这个 Cookie是个“同站 Cookie”，同站Cookie只能作为第一方Cookie，不能作为第三方Cookie，Samesite 有两个属性值，分别是 Strict 和 Lax，下面分别讲解：

**Samesite=Strict**

这种称为严格模式，表明这个 Cookie 在任何情况下都不可能作为第三方 Cookie，绝无例外。比如说 b.com 设置了如下 Cookie：

```html
Set-Cookie: foo=1; Samesite=Strict
Set-Cookie: bar=2; Samesite=Lax
Set-Cookie: baz=3
```

我们在 a.com 下发起对 b.com 的任意请求，foo 这个 Cookie 都不会被包含在 Cookie 请求头中，但 bar 会。举个实际的例子就是，假如淘宝网站用来识别用户登录与否的 Cookie 被设置成了 Samesite=Strict，那么用户从百度搜索页面甚至天猫页面的链接点击进入淘宝后，淘宝都不会是登录状态，因为淘宝的服务器不会接受到那个 Cookie，其它网站发起的对淘宝的任意请求都不会带上那个 Cookie。

**Samesite=Lax**

这种称为宽松模式，比 Strict 放宽了点限制：假如这个请求是这种请求（改变了当前页面或者打开了新页面）且同时是个GET请求，则这个Cookie可以作为第三方Cookie。比如说 b.com设置了如下Cookie：

```html
Set-Cookie: foo=1; Samesite=Strict
Set-Cookie: bar=2; Samesite=Lax
Set-Cookie: baz=3
```

当用户从 a.com 点击链接进入 b.com 时，foo 这个 Cookie 不会被包含在 Cookie 请求头中，但 bar 和 baz 会，也就是说用户在不同网站之间通过链接跳转是不受影响了。但假如这个请求是从 a.com 发起的对 b.com 的异步请求，或者页面跳转是通过表单的 post 提交触发的，则bar也不会发送。

生成Token放到Cookie中并且设置Cookie的Samesite，Java代码如下：

```java
 private void addTokenCookieAndHeader(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        //生成token
        String sToken = this.generateToken();
        //手动添加Cookie实现支持“Samesite=strict”
        //Cookie添加双重验证
        String CookieSpec = String.format("%s=%s; Path=%s; HttpOnly; Samesite=Strict", this.determineCookieName(httpRequest), sToken, httpRequest.getRequestURI());
        httpResponse.addHeader("Set-Cookie", CookieSpec);
        httpResponse.setHeader(CSRF_TOKEN_NAME, token);
    }
```

如果SamesiteCookie被设置为Strict，浏览器在任何跨域请求中都不会携带Cookie，新标签重新打开也不携带，所以说CSRF攻击基本没有机会。

但是跳转子域名或者是新标签重新打开刚登陆的网站，之前的Cookie都不会存在。尤其是有登录的网站，那么我们新打开一个标签进入，或者跳转到子域名的网站，都需要重新登录。对于用户来讲，可能体验不会很好。

如果SamesiteCookie被设置为Lax，那么其他网站通过页面跳转过来的时候可以使用Cookie，可以保障外域连接打开页面时用户的登录状态。但相应的，其安全性也比较低。

另外一个问题是Samesite的兼容性不是很好，现阶段除了从新版Chrome和Firefox支持以外，Safari以及iOS Safari都还不支持，现阶段看来暂时还不能普及。

而且，SamesiteCookie目前有一个致命的缺陷：不支持子域。例如，种在topic.a.com下的Cookie，并不能使用a.com下种植的SamesiteCookie。这就导致了当我们网站有多个子域名时，不能使用SamesiteCookie在主域名存储用户登录信息。每个子域名都需要用户重新登录一次。

总之，SamesiteCookie是一个可能替代同源验证的方案，但目前还并不成熟，其应用场景有待观望。



### 无状态登录

由于现在我们大部分项目都是前后端分离的，登录都是使用 `token` 的方式，每次请求都是携带在请求头里携带这个 `token` 后台验证token转换登录用户信息的。 

由前面知识知道CSRF 攻击是无法拿到被攻击网站信息的，自然不知道我们的 `token` 。这种架构下就很难存在CSRF 攻击方式





## rememberMe记住我

我们在登录大部分网站的时候都会看到，页面上都会有一个 `记住我` 或者 `下次自动登录的复选框` 。勾选上之后即使session过期也能够不需要再次输入用户名密码直接登录，当然它这个可不是把你的用户名密码保存到浏览器缓存里那么简单，那样也不安全

![image-20221104160456325](https://cdn.tencentfs.clboy.cn/images/2022/20221107143613465.png)



spring security 默认的记住我实现方式是在用户登录成功之后根据特定规则生成一个Base-64 编码的 cookie ，该cookie有较长的时效，所以在session失效后，如果该cookie存在并有效则可以直接登录

默认实现编码的cookie采用如下形式

```java
 username + ":" + expiryTime + ":" + Md5Hex(username + ":" + expiryTime + ":" + password + ":" + key)
```

- `username` ：用户登录名
- `expiryTime` ：过期时间(根据设置的token有效时长和当前时间生成的时间戳)
- `password` ：用户登录密码
- `key` ：服务端设置的秘钥

由上token的生成规则可以看出，一旦用户修改了用户名或者密码都会使记住我的cookie失效

同理如果服务端修改了秘钥 `key` 也会使所有客户端的记住我cookie失效

我们先看一下，没有开启记住我功能时登录成功后客户端会多出哪些cookie

![image-20221107110309092](https://cdn.tencentfs.clboy.cn/images/2022/20221107143608714.png)



可以看出只设置了一个sessionId的cookie，并且有效期就是当前浏览器session，所以只要浏览器关闭之后重新打开登录也就失效了

接下来我们配置security，开启记住我的功能

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.mvcMatchers("/error").permitAll().anyRequest().authenticated());
        //设置登录页路径和登录处理的接口路径
        http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
        http.httpBasic();
        http.csrf().disable();
        http.rememberMe();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置不需要spring security处理的请求路径，注意这里是请求路径而不是你静态资源目录路径，例如写 "/public/**" 是错误的,只会对PublicResourceController生效
        web.ignoring().mvcMatchers("/login.html", "/css/**");
    }
}
```

默认情况下，security会验证客户端登录请求中是否包含有 `remember-me` 参数，如果有就说明客户端勾选上了记住我，当然该参数名也可以自定义

```java
http.rememberMe(rememberMe->rememberMe.rememberMeParameter("auto-login"));
```

修改下登录页代码，增加下次自动登录复选框

```html
<div id="content">
    <h1>登录</h1><br/>
    <form action="/auth" method="post">
        <div id="error" style="display: none">用户名或密码错误</div>
        <div><input type="text" name="username" id="userid"/></div>
        <div style="margin: 10px auto"><input type="password" name="password" id="password"/></div>
        <div style="margin: 10px auto"><label><input type="checkbox" name="auto-login"/>下次自动登录</label></div>
        <input type="submit" id="login-button" value="登录"/>
    </form>
</div>
```

重启项目，登录。发现报错了

```
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Mon Nov 07 11:20:00 CST 2022
There was an unexpected error (type=Internal Server Error, status=500).
UserDetailsService is required.
java.lang.IllegalStateException: UserDetailsService is required.
```

这个 `UserDetailsService`  是一个接口，目的是根据用户名获取用户详细信息。一般会配合数据库使用

```java
public interface UserDetailsService {

   UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

}
```

我们暂时不使用数据库，由于我们用户名密码是通过配置文件设置的，这种不会生成 `UserDetailsService` ，我们改用代码的方式配置

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.mvcMatchers("/error").permitAll().anyRequest().authenticated());
        //设置登录页路径和登录处理的接口路径
        http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth"));
        http.httpBasic();
        http.csrf().disable();
        http.rememberMe(rememberMe -> rememberMe.rememberMeParameter("auto-login"));
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置不需要spring security处理的请求路径，注意这里是请求路径而不是你静态资源目录路径，例如写 "/public/**" 是错误的,只会对PublicResourceController生效
        web.ignoring().mvcMatchers("/login.html", "/css/**");
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
        auth.inMemoryAuthentication().withUser("admin").password(passwordEncoder().encode("123456")).roles("ADMIN");
    }

    /**
     * 密码编码器
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

```

重启登录

这次登录成功后会设置一个名为 `remember-me` 的cookie，并且有效期是两个星期

![image-20221107113553865](https://cdn.tencentfs.clboy.cn/images/2022/20221110153846294.png)

这次我们关闭浏览器后，重新打开后访问 http://127.0.0.1:8080/ ，发现不需要登录就进入了，如果你的还是需要登录，请检查是不是使用的 **无痕窗口** 或者浏览器设置了 **退出时自动清理浏览数据**

![image-20221107114313167](https://cdn.tencentfs.clboy.cn/images/2022/20221107143558469.png)

其他一些配置

```java
http.rememberMe(rememberMe -> {
    //设置客户端选择记住我参数名
    rememberMe.rememberMeParameter("auto-login");
    //设置记住我token的有效时长，默认两周，单位秒
    rememberMe.tokenValiditySeconds(AbstractRememberMeServices.TWO_WEEKS_S);
    //是否忽略客户端选择，都视为选中
    rememberMe.alwaysRemember(false);
    //设置记住我cookie所属域
    rememberMe.rememberMeCookieDomain(null);
    //设置记住我cookie名称
    rememberMe.rememberMeCookieName("remember-me");
    //设置创建记住我token所使用的秘钥，为空则会在启动时随机UUID生成，也就是所每次重启都会使所有客户端token失效
    rememberMe.key("7654321");
});
```

!> 这里我们设置的key之后每次重启还是会导致token失效，是因为密码是在启动时进行加密设置的，该加密算法每次加密生成的结果都不一样，根据前面所讲密码变更也会导致token失效，改为写死的即可

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
    //System.out.println(passwordEncoder().encode("123456"));
    auth.inMemoryAuthentication().withUser("admin").password("$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS").roles("ADMIN");
}
```



## 退出登录

在设置开启记住我功能之前，我们每次登录后，等到seesion过期或者关闭浏览器再次打开，对于客户端而言相当于退出登录了，开启了记住我之后，如果客户端不清理cookie的话默认两周之内都会自动登录。现在考虑如何主动退出登录

spring security已经内置了退出登录的功能，默认退出登录接口路径是 `/logout` ，默认支持 `POST` 请求，如果  **CSRF 保护** 没有开启的情况下还支持 `GET` 、`PUT` 、 `DELETE` 请求

我们登录后测试，在浏览器访问 http://127.0.0.1:8080/logout 可以看出跳转到了登录页，并且删除了记住我的cookie。而且在跳转到登录页时还携带了 `logout` 参数 ：`http://127.0.0.1:8080/login.html?logout`

退出登录自定义配置

```java
http.logout(logout -> logout.logoutUrl("/logout").logoutSuccessHandler((req, res, auth) -> {
    if (auth == null) {
        res.setContentType(MediaType.TEXT_HTML_VALUE);
        res.getWriter().write("<h1>Are you sure you are logged?</h1>");
        return;
    }

    if (auth.getPrincipal() instanceof User) {
        User user = (User) auth.getPrincipal();
        System.out.println(user.getUsername() + " 退出登录");
    }
    //退出成功后重定向到登录页, 设置了logoutSuccessHandler会使logout.logoutSuccessUrl()失效，需要手动重定向
    res.sendRedirect("/login.html");
}));
```



## 登录成功或失败处理

由前面的学习我们知道，spring security默认在登录成功后会给重定向到首页或者登录之前访问的页面，登录失败会重定向回登录页

退出登录默认会重定向到登录页，上面退出登录成功后处理在上面已经讲过了 `logoutSuccessHandler` 方法

下面来看登录成功或失败的处理

```java
//设置登录页路径和登录处理的接口路径
http.formLogin(form -> form.loginPage("/login.html").loginProcessingUrl("/auth")
        .successHandler((req, res, auth) -> {
            //登录成功处理逻辑，与successForwardUrl(String v) 和 defaultSuccessUrl(String v) 不可同时设置,后设置覆盖之前的
        })
        .failureHandler((req, res, ex) -> {
            //登录失败处理逻辑,与failureUrl(String v) 和 failureForwardUrl(String v) 不可同时设置,后设置覆盖之前的
        }));
```

现在一般的项目都是前后端分离的方式开发，后端返回json格式数据给前端，现在我们改造以下

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    private final ObjectMapper objectMapper;

    /**
     * 登录成功处理
     */
    private AuthenticationSuccessHandler loginSuccessHandler() {
        return (req, res, auth) -> {
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> result = CollectionUtils.newLinkedHashMap(3);
            result.put("code", "0");
            result.put("msg", "登录成功");
            result.put("data", auth);
            res.getWriter().write(objectMapper.writeValueAsString(result));
        };
    }

    /**
     * 登录失败处理程序
     */
    private AuthenticationFailureHandler loginFailureHandler() {
        return (req, res, ex) -> {
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.setStatus(HttpStatus.UNAUTHORIZED.value());
            Map<String, String> result = CollectionUtils.newLinkedHashMap(2);
            result.put("code", "0");
            result.put("msg", ex.getMessage());
            res.getWriter().write(objectMapper.writeValueAsString(result));
        };
    }

    /**
     * 注销成功处理程序
     */
    private LogoutSuccessHandler logoutSuccessHandler() {
        return (req, res, auth) -> {
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, String> result = CollectionUtils.newLinkedHashMap(2);
            if (auth == null) {
                result.put("code", "1");
                result.put("msg", "非法请求");
                res.setStatus(HttpStatus.FORBIDDEN.value());
            } else {
                result.put("code", "0");
                result.put("msg", "退出登录成功");
            }
            res.getWriter().write(objectMapper.writeValueAsString(result));
        };
    }


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests((requests) -> requests.mvcMatchers("/error").permitAll().anyRequest().authenticated());

        //设置登录页路径和登录处理的接口路径
        http.formLogin(form -> {
            form.loginPage("/login.html");
            form.loginProcessingUrl("/auth");
            form.successHandler(loginSuccessHandler());
            form.failureHandler(loginFailureHandler());
        });
        //设置退出登录处理接口
        http.logout(logout -> logout.logoutUrl("/logout").logoutSuccessHandler(logoutSuccessHandler()));


        http.httpBasic();
        http.csrf().disable();
        http.rememberMe(rememberMe -> rememberMe.rememberMeParameter("auto-login"));

    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置不需要spring security处理的请求路径，注意这里是请求路径而不是你静态资源目录路径，例如写 "/public/**" 是错误的,只会对PublicResourceController生效
        web.ignoring().mvcMatchers("/login.html", "/css/**");
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
        //System.out.println(passwordEncoder().encode("123456"));
        auth.inMemoryAuthentication().withUser("admin").password("$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS").roles("ADMIN");
    }

    /**
     * 密码编码器
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```



![image-20221108173006871](https://cdn.tencentfs.clboy.cn/images/2022/20221110153835332.png)
