# OAuth2



## 什么是OAuth2

> OAuth（Open Authorization，开放授权）是一个 *开放标准的授权协议* ，允许用户授权第三方应用访问他们存储在资源服务上受保护的信息，而不需要将用户名和密码提供给第三方应用，解耦了认证和授权。
>
> oAuth协议是一个授权的开放网络标准，主要是用来解决第三方登录的
>
> OAuth作为一种国际标准 ，目前传播广泛并被持续采用。OAuth2.0是OAuth协议的延续版本，更加安全，更易于实现，但不向后兼容OAuth1.0，即完全废止了OAuth1.0。



以码云平台举例，在登录码云的时候，除了使用在他们自己平台注册的账号密码登录外，还可以使用微博、qq、微信、github等其他登录方式

这些其他登录方式对于码云而言，就是第三方登录

![image-20221230141631223](https://cdn.tencentfs.clboy.cn/images/2023/20230110165345190.png)



## 授权码流程

我们拿微信登录，看一下登录的具体流程

![录屏_google-chrome_20221230142106](https://cdn.tencentfs.clboy.cn/images/2023/20230110165356690.gif)

1. 可以看到，选择了微信登录之后浏览器会跳转到微信登录的界面，从地址栏的域名可以看出是微信的官方网站
2. 这里会让发起登录的用户进行扫码(由于微信不允许用户名密码登录，选择微博或qq等其他第三方登录是有用户名密码登录的选项)
3. 在微信官网完成登录后，又会给我们重定向回码云的网站



在OAuth2协议中有这样几个角色：

- **客户端** (Client)：客户端就是一个要访问用户账户的应用，如web网站，app等。在本例中就是 *码云平台*
- **资源服务器** (Resource Server)：存储受保护资源的服务器，提供Api，根据权限令牌返回第三方应用请求的数据，在本例中就是 *微信平台* 比如我的头像，昵称等都是存储在微信平台，码云都是从微信那边获取过来的
- **授权服务器** (Authorization Server)：授权服务器，一般和资源服务器是同一家公司的应用，主要是用来处理授权，给客户端颁发令牌。本例中就是微信平台用来处理登录请求所在的服务器，授权服务器和资源服务器可以部署在一台服务上
- **资源所有者** (Resource Owner)：也就是触发登录的用户。头像，昵称等信息都属于我的资源
- **用户代理** (User-agent)：一般为web浏览器或手机上的app，本例中就是浏览器



下图是微信官方提供给第三方网站开发者的微信登录授权流程：

![img](https://cdn.tencentfs.clboy.cn/images/2023/20230110165408273.png)



要想使用微信平台提供的OAuth2第三方登录，前提是要在微信平台进行客户端注册申请。

申请通过后会给你颁发 *客户端id(ClientId)* 和 *客户端密钥(ClientSecret)*

之后，在你的网站上当用户点击微信登录时，就需要将浏览器地址重定向到微信官方的登录地址，并携带查询 *客户端Id(ClientId)* 和用户同意授权后的跳转的 *回调地址(redirect_uri)* 等查询参数，微信那边拿到客户端id后根据客户端申请时填写的信息就会知道是哪个网站发起的登录请求 ，用户登录(即同意授权)后，微信就会将浏览器地址重定向到 *回调地址(redirect_uri)* 并且携带颁发的 *授权码(code)* 等查询参数，第三方网站拿到授权码之后就可以通过它来获取 *accessToken和refreshToken*，最后携带token调用微信那边的接口获取用户信息了



## 授权模式

上面我们讲的只是OAuth中最典型的授权码模式，其实它有四种授权模式，分别是：

- **授权码模式(authorization code)** ： 流程最完整和严密的一种授权方式，服务器和客户端配合使用，主要是针对有自己的后端服务器的情况采用
- **简化模式(implicit)** ：主要用于移动应用程序或纯前端的web应用程序，主要是针对没有自己的后端服务器的情况采用。如果网站是纯静态页面，则可以采用这种方式。
- **密码模式(resource owner password credentials)** ：密码模式是把用户名/密码直接告诉客户端，客户端使用这些信息向授权服务器申请令牌（token）。这需要用户对客户端高度信任，例如客户端应用和授权服务器就是同一家公司
- **客户端模式(client credentials)** ：客户端以自己的名义，而不是用户的名义，向服务提供商进行认证，如微信公众号应用拉取所有已关注用户的信息

不管哪一种授权方式，第三方应用申请令牌之前，都必须先到系统备案，说明自己的身份，然后会拿到两个身份识别码：客户端 ID（client ID 用来标识第三方应用）和客户端密钥（client secret 用来进行安全加密）。这是为了防止令牌被滥用，没有备案过的第三方应用，是不会拿到令牌的。



### 授权码模式

| 优点                                           | 缺点           | 备注       |
| ---------------------------------------------- | -------------- | ---------- |
| 通过服务器之间进行access_token的交换，比较安全 | 请求次数比较多 | 推荐该模式 |

授权码模式如下图所示，这种流程是功能最完整，流程也是最严密的授权方式，适用于那些有后端的web应用

![img](https://cdn.tencentfs.clboy.cn/images/2023/20230110165423934.png)



由于微信、qq等平台的客户端申请比较繁琐且验证严谨。接下来我们使用github的OAuth登录作为演示。

首先登录github后，点击个人头像点击 **settings** 进入设置页，在左侧最底部找到 **Developer settings** 点击去之后就可以看到申请创建客户端应用的地方，或者登录后直接访问这个地址：https://github.com/settings/developers

![image-20221230154453239](https://cdn.tencentfs.clboy.cn/images/2023/20230110165414874.png)

注册申请完成之后就会生成 *Client ID* ，自己再点击 **Generate a new client secret** 按钮生成一个 *Client secret*

![image-20221230154642460](https://cdn.tencentfs.clboy.cn/images/2023/20230110165429518.png)

根据上面的授权码流程图可知，标准的获取授权码接口需要以下几个参数

| 参数名        | 类型   | 描述                                                         |
| ------------- | ------ | ------------------------------------------------------------ |
| response_type | string | 必须，在授权码模式中固定为code                               |
| client_id     | string | 必须，唯一标识了客户端，在服务提供商注册时获得的客户端ID     |
| redirect_url  | string | 必须，服务提供商注册时填写的授权回调地址，用户同意或拒绝的时候都会跳转到这个重定向url |
| scope         | string | 可选，请求资源范围(可以理解为授予客户端的权限)，如有多项，使用多个空格隔开 |
| state         | string | 可选，客户端生成的一个随机数，授权服务器会原样返回，防止CSRF的攻击 |

github的授权接口地址为：https://github.com/login/oauth/authorize

我们将写参数拼接到这个地址后面，然后复制到浏览器中访问

```http
https://github.com/login/oauth/authorize?response_type=code&client_id=你的客户端id&redirect_url=http://127.0.0.1:5500/login.html&state=37a3a5688f564f48af188b939606feb
```

不出意外就会看到github登录的页面，如果你已经登录过，就会直接显示确认授权的页面

当你点击确认授权之后就会重定向到注册时填写的回调地址，并附加了授权码(code) 和原样返回的state查询参数

```http
http://127.0.0.1:5500/login.html?code=5b4c0745c449868d0b3a&state=37a3a5688f564f48af188b939606feb
```

接下来前端拿到code之后就可以调用自己家的后端服务器接口获取用户信息。

在后端，拿到code后，用code和客户端id、客户端密钥等参数到github授权服务器获取访问token，以下是用授权码获取token时的标准参数：

| 参数名        | 类型   | 描述                                                         |
| ------------- | ------ | ------------------------------------------------------------ |
| client_id     | string | 必须，唯一标识了客户端，在服务提供商注册时获得的客户端ID     |
| client_secret | string | 必须，客户端密钥，在服务提供商注册时获得的                   |
| grant_type    | string | 必须，授权类型，通过授权码获取token是固定为authorization_code |
| code          | string | 必须，上一步中获取的授权码                                   |
| redirect_uri  | string | 可选，服务提供商注册时填写的授权回调地址                     |

github的使用授权码获取token接口为：https://github.com/login/oauth/access_token

由于github限制该接口需POST格式请求，我们可以使用postman或者在idea中创建 `.http` 文件进行调试

```http
https://github.com/login/oauth/access_token
Accept: application/json
Content-Type: application/x-www-form-urlencoded

client_id=e06639f1f961727ef762&client_secret=你的客户端密钥&grant_type=authorization_code&code=你获取的code
```

响应结果：

```json
{
  "access_token": "gho_H2SPTJ4tcMXP3sRjxyY0wctVxKIlGc0TX6nW",
  "token_type": "bearer",
  "scope": ""
}
```

标准格式应该返回的有 `access_token` 、`refresh_token` 以及两个token的过期时间，它这边只给了 `access_token`

拿到 `access_token`  后就可以调用资源服务的api获取用户信息了

标准的认证方式是和http basic认证类似，将token放到请求头 `Authorization` 中

验证类型为 `Bearer` ，这也是 OAuth 2.0的标准规范

```http
### 获取信息
GET https://api.github.com/user
Authorization: Bearer gho_H2SPTJ4tcMXP3sRjxyY0wctVxKIlGc0TX6nW
```

### 简化模式

简化模式主要针对没有后端的纯前端应用，在这种情况下，因为没有后端，采用授权码流程的话会将 `client_secret` 直接暴露在前端，很不安全，简化模式省略掉了颁发授权码给客户端的过程，直接返回访问令牌和可选的刷新令牌。

| 优点                 | 缺点                                                         | 备注                       |
| -------------------- | ------------------------------------------------------------ | -------------------------- |
| 请求次数比较少，简单 | 为没有获取code的过程， 授权服务器直接返回access_token给客户端，令牌容易因为被拦截窃听而泄露 | 适用于公开的浏览器单页应用 |

![img](https://cdn.tencentfs.clboy.cn/images/2023/20230110165436916.png)

从上面的流程图可以看出获取token的参数和授权码模式中获取code时的参数名完全一致，唯一不同的是 *response_type* 参数的值，在授权码模式中为 `code` ，在简化模式中为 `token`

由于github不支持简化模式，这里我们就不演示了

### 密码模式

该模式是客户端直接通过用户名密码来获取token

| 优点                        | 缺点                                             | 备注                                                         |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| 请求次数比较少，简单 <br /> | 除非是非常信任的应用，否则可能导致登录信息泄露。 | 1.可以用来做遗留项目升级为oauth2的适配方案<br />2.适用于客户端是自家应用的场景 |

![img](https://cdn.tencentfs.clboy.cn/images/2023/20230110165442940.png)

该模式下接口所需要的参数：

| 参数名     | 类型   | 描述                                           |
| ---------- | ------ | ---------------------------------------------- |
| grant_type | string | 必须，在密码模式中固定为password               |
| username   | string | 必须，用户名                                   |
| password   | string | 必须，密码                                     |
| scope      | string | 可选，请求资源范围，如有多项，使用多个空格隔开 |

### 客户端模式

该模式下客户端直接以自己的名义而不是资源所有者(用户)的名义去要求访问资源服务器的一些受保护资源 

- 适用于服务器间通信场景，直接根据client的ID和密钥即可获取token，无需用户参与
- 这种模式比较适合消费api的后端服务，比如拉取一组用户信息等

![image.png](https://cdn.tencentfs.clboy.cn/images/2023/20230110165450334.png)

该模式下接口所需要的参数：

| 参数名     | 类型   | 描述                                           |
| ---------- | ------ | ---------------------------------------------- |
| grant_type | string | 必须，在客户端模式中固定为client_credentials   |
| scope      | string | 可选，请求资源范围，如有多项，使用多个空格隔开 |

## 刷新令牌

如果用户访问的时候，客户端的 *访问令牌(access_token)* 已经过期，则需要使用 *更新令牌(refresh_token)* 申请一个新的访问令牌，而不是让用户再次登录授权。 

![img](https://cdn.tencentfs.clboy.cn/images/2023/20230110165455619.png)

刷新令牌接口所需要的参数：

| 参数名        | 类型   | 描述                                    |
| ------------- | ------ | --------------------------------------- |
| grant_type    | string | 必须，在客户端模式中固定为refresh_token |
| refresh_token | string | 必须，早期授权颁发的refresh_token       |



## Spring Security OAuth2

Spring Security 和  Spring Security OAuth2

| 之前                                                         | 现在                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1.所有OAuth1.0/2.0相关功能集成到Spring Security OAuth2 模块中<br />2.Spring Security OAuth2支持搭建授权服务器和资源服务器 | 1.Spring Security本身提供资源服务和客户端的类库支持：<br />2.新设立一个全新的项目Spring Authorization Server |

由于Spring Authorization Server项目上线的时间比较晚，所以现在基于Spring Security OAuth2搭建授权服务器用的还是比较多，我们先学习

基于Spring Security OAuth2如何搭建

### 授权服务搭建

除了springboot web项目所需要的依赖外，还需要下面两个依赖来创建授权服务，因为spring-security-oauth2依赖了spring security，所以不需要再单独引入

```xml
<dependencies>
    <!-- Spring Security 0Auth2 依赖，Spring开发的Spring Authorization Server已经上线，下面两个依赖以后逐渐会弃用 -->
    <dependency>
        <groupId>org.springframework.security.oauth</groupId>
        <artifactId>spring-security-oauth2</artifactId>
        <version>2.5.2.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.security.oauth.boot</groupId>
        <artifactId>spring-security-oauth2-autoconfigure</artifactId>
        <version>2.6.8</version>
    </dependency>
</dependencies>
```

#### 授权服务配置类

通过之前的学习我们知道配置spring security可以通过继承 `WebSecurityConfigurerAdapter` 类然后重写相应的方法进行配置

在spring security oauth2 中也提供了一个类供开发者去继承配置授权服务

```java
package org.springframework.security.oauth2.config.annotation.web.configuration;

@Deprecated
public class AuthorizationServerConfigurerAdapter implements AuthorizationServerConfigurer {

   /**
    * 配置授权服务器的安全性，就是对token接入点(获取token的相关接口)的访问权限配置
    */
   @Override
   public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
   }

   /**
    * 客户端服务配置
    * 配置ClientDetailsService，ClientDetailsService是一个接口，其中只有loadClientByClientId一个方法
    * 就类似与spring security中配置UserDetailsService,就是配置如果通过clientId获取到clientDetails
    */
   @Override
   public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
   }

   /**
    * 配置授权服务器端点的非安全功能，如token存储、token自定义、用户授权类型等
    */
   @Override
   public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
   }

}
```

可以看到这个类已经被标注了 `@Deprecated` 注解，因为 `spring-authorization-server` 项目已经上线，`spring-security-oauth2` 终将被替代

开发者可以写一个自己的类继承该类来配置授权服务

```java
@Configuration
@EnableAuthorizationServer
public class Oauth2AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter
```

#### EnableAuthorizationServer

另外需要在项目中通过 `@EnableAuthorizationServer` 注解启用授权服务的功能

```java
/**
 * AuthorizationServerEndpointsConfiguration配置授权端点
 * AuthorizationServerSecurityConfiguration配置授权服务的安全
 */
@Import({AuthorizationServerEndpointsConfiguration.class, AuthorizationServerSecurityConfiguration.class})
public @interface EnableAuthorizationServer {
}
```



如果你只是启用了授权服务的功能，并且没有在容器中注册自定义的配置类，那么它内置的默认授权服务配置就会生效

```java
@Configuration
@ConditionalOnMissingBean(AuthorizationServerConfigurer.class)
private static class AuthorizationSecurityConfigurer extends AuthorizationServerConfigurerAdapter
```

也就是说如果我在启动类上加上 `@EnableAuthorizationServer` 注解，和spring security一样即使在什么也不配置的情况下就可以使用了

!> 需要注意的是该配置类上的注解，和spring security默认配置一样，如果你写了自己的配置类并启用，这个默认配置类就会失效 

```java
@SpringBootApplication
@EnableAuthorizationServer
public class Jpp {
    public static void main(String[] args) {
        SpringApplication.run(Jpp.class, args);
    }
}
```

启动项目，可以看到控制台日志输出了：spring security生成的随机用户密码，oauth2生成的随机客户端id和客户端密钥

还有oauth授权的相关接口

![image-20230104155313754](https://cdn.tencentfs.clboy.cn/images/2023/20230110165518596.png)



接下来我们看一下默认的配置类都干了什么

```java
@Configuration
@ConditionalOnMissingBean(AuthorizationServerConfigurer.class)
private static class AuthorizationSecurityConfigurer extends AuthorizationServerConfigurerAdapter {

   private final BaseClientDetails details;

   private final AuthenticationManager authenticationManager;

   private final TokenStore tokenStore;

   private final AccessTokenConverter tokenConverter;

   private final AuthorizationServerProperties properties;
    
   //... 省略构造函数代码，该类的属性都是通过构造函数自动注入的

   /**
    * 配置授权服务器的安全性，就是对token接入点(获取token的相关接口)的访问权限配置
    */
   @Override
   public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
      // 配置客户端密钥的PasswordEncoder，默认不加密
      security.passwordEncoder(NoOpPasswordEncoder.getInstance());
      // 配置检查令牌端点的访问规则（例如像"isAuthenticated()"这样的SpEL表达式）
      // 默认为空，被解释为 "denyAll()" 也就是拒绝所有访问
      if (this.properties.getCheckTokenAccess() != null) {
         security.checkTokenAccess(this.properties.getCheckTokenAccess());
      }
      // 配置令牌密钥端点的访问规则
      if (this.properties.getTokenKeyAccess() != null) {
         security.tokenKeyAccess(this.properties.getTokenKeyAccess());
      }
       
      // 配置没有携带认证信息访问令牌端点时，响应401状态码响应头WWW-Authenticate中realm的值，默认："oauth2/client"
      if (this.properties.getRealm() != null) {
         security.realm(this.properties.getRealm());
      }
   }

   /**
    * 配置ClientDetailsService
    */
   @Override
   public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
      // 配置基于内存的ClientDetailsService，this.details是根据配置文件中的配置生成的clientDetails
      // 如果配置文件中未配置就会使用uuid生成随机的客户端id和密钥来创建
      ClientDetailsServiceBuilder<InMemoryClientDetailsServiceBuilder>.ClientBuilder builder = clients.inMemory()
            .withClient(this.details.getClientId());
      builder.secret(this.details.getClientSecret())
            .resourceIds(this.details.getResourceIds().toArray(new String[0]))
            .authorizedGrantTypes(this.details.getAuthorizedGrantTypes().toArray(new String[0]))
            .authorities(
                  AuthorityUtils.authorityListToSet(this.details.getAuthorities()).toArray(new String[0]))
            .scopes(this.details.getScope().toArray(new String[0]));

      if (this.details.getAutoApproveScopes() != null) {
         builder.autoApprove(this.details.getAutoApproveScopes().toArray(new String[0]));
      }
      if (this.details.getAccessTokenValiditySeconds() != null) {
         builder.accessTokenValiditySeconds(this.details.getAccessTokenValiditySeconds());
      }
      if (this.details.getRefreshTokenValiditySeconds() != null) {
         builder.refreshTokenValiditySeconds(this.details.getRefreshTokenValiditySeconds());
      }
      if (this.details.getRegisteredRedirectUri() != null) {
         builder.redirectUris(this.details.getRegisteredRedirectUri().toArray(new String[0]));
      }
   }

   /**
    * 配置授权服务器端点的非安全功能，如token存储、token自定义、用户授权类型等
    */
   @Override
   public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
      //配置AccessTokenConverter，AccessTokenConverter接口用于token字符串和OAuth2AccessToken对象之间的转换
      if (this.tokenConverter != null) {
         endpoints.accessTokenConverter(this.tokenConverter);
      }
      //配置TokenStore，TokenStore接口用于管理token的持久化存储
      if (this.tokenStore != null) {
         endpoints.tokenStore(this.tokenStore);
      }
      if (this.details.getAuthorizedGrantTypes().contains("password")) {
         endpoints.authenticationManager(this.authenticationManager);
      }
   }
    
   /**
    * 内部配置类，用于读取配置文件创建clientDetails
    */
    @Configuration
    @ConditionalOnMissingBean(BaseClientDetails.class)
    protected static class BaseClientDetailsConfiguration {

       private final ClientProperties client;

       protected BaseClientDetailsConfiguration(ClientProperties client) {
          this.client = client;
       }

       @Bean
       @ConfigurationProperties(prefix = "security.oauth2.client")
       public BaseClientDetails oauth2ClientDetails() {
          BaseClientDetails details = new BaseClientDetails();
          if (this.client.getClientId() == null) {
             this.client.setClientId(UUID.randomUUID().toString());
          }
          details.setClientId(this.client.getClientId());
          details.setClientSecret(this.client.getClientSecret());
          details.setAuthorizedGrantTypes(Arrays.asList("authorization_code", "password", "client_credentials",
                "implicit", "refresh_token"));
          details.setAuthorities(AuthorityUtils.commaSeparatedStringToAuthorityList("ROLE_USER"));
          details.setRegisteredRedirectUri(Collections.<String>emptySet());
          return details;
       }

    }
}
```

从上面的代码中可以看到使用了 `AuthorizationServerProperties` 和 `ClientProperties` 配置属性类

```java
// 基于配置文件的单个客户端配置
@ConfigurationProperties(prefix = "security.oauth2.client")
public class ClientProperties

// 授权服务的相关配置
@ConfigurationProperties(prefix = "security.oauth2.authorization")
public class AuthorizationServerProperties
```

所以我们可以在配置文件中配置相关属性

#### 授权相关接口

我们先在配置文件中配置下单个用户和单个客户端，避免每次重启都随机生成用户名和客户端id及秘钥

```yaml
logging:
  level:
    org.springframework.security: TRACE
    org.springframework.jdbc.core: debug

spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:J-oauth2-authorization-server
    username: root
    password: 123456
  h2:
    console:
      enabled: true
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: none
    properties:
      hibernate.format_sql: true
  security:
    user:
      name: admin
      password: 123456
      roles:
        - ADMIN
        - USER
security:
  oauth2:
    client:
      client-id: oauth2-test
      client-secret: 666888
      registered-redirect-uri: http://127.0.0.1:8081/login.html
```

从启动日志中可以看到oauth2提供了以下一个接口

- `/oauth/authorize` ：该接口用于授权码模式获取code和简化模式直接获取token。由 `AuthorizationEndpoint` 类处理
- `/oauth/token` ：该接口用于密码模式或客户端模式获取token以及刷新token。由 `TokenEndpoint` 类处理
- `/oauth/check_token` ：该接口用于检查token是否合法、是否过期。由 `CheckTokenEndpoint` 类处理
- `/oauth/confirm_access` ：该接口用于显示授权码模式中询问用户是否确认授权的页面。由 `WhitelabelApprovalEndpoint` 类处理
- `/oauth/error` ：顾名思义，该接口用于显示授权错误时的页面。由 `WhitelabelErrorEndpoint` 类处理

这些接口都是由 **xxxEndpoint** 类提供，你可以查看这些类的源码，它们都使用了 `@FrameworkEndpoint` 注解，这个注解的用法可以理解为和 `@Controller` 一样，只不过从单词意思上来说这些接口是框架提供的

废话不多说，启动项目直接开测授权码模式

首先访问获取授权码的断点

http://localhost:8080/oauth/authorize?client_id=oauth2-test&state=randomNumber&redirect_url=http://127.0.0.1:8081/login.html&response_type=code

阿欧，居然报错了

*org.springframework.security.authentication.InsufficientAuthenticationException: User must be authenticated with Spring Security before authorization can be completed.*

抛出了个 `InsufficientAuthenticationException` 类型异常，并且告诉我们再进行授权之前用户必须是已经登录的状态

看一下 `AuthorizationEndpoint` 的源码，其中判断了用户是否已经认证，未认证则抛出异常

```java
@RequestMapping(value = "/oauth/authorize")
public ModelAndView authorize(Map<String, Object> model, @RequestParam Map<String, String> parameters,
      SessionStatus sessionStatus, Principal principal) {

   //从请求从提取授权参数等信息封装到AuthorizationRequest中
   AuthorizationRequest authorizationRequest = getOAuth2RequestFactory().createAuthorizationRequest(parameters);

   Set<String> responseTypes = authorizationRequest.getResponseTypes();

   if (!responseTypes.contains("token") && !responseTypes.contains("code")) {
      throw new UnsupportedResponseTypeException("Unsupported response types");
   }

   if (authorizationRequest.getClientId() == null) {
      throw new InvalidClientException("A client id must be provided");
   }

   try {
       
      // 可以看到这里判断了当前Authentication是否是已认证状态，异常就是这里抛出的
      if (!(principal instanceof Authentication) || !((Authentication) principal).isAuthenticated()) {
         throw new InsufficientAuthenticationException(
               "User must be authenticated with Spring Security before authorization can be completed.");
      }

      ClientDetails client = getClientDetailsService().loadClientByClientId(authorizationRequest.getClientId());
       
       // ... 省略其他代码

   }
   catch (RuntimeException e) {
      sessionStatus.setComplete();
      throw e;
   }

}
```

可是我记得当初学习spring security的时候只要引入了spring security的相关依赖，默认配置下未认证时访问接口都会给重定向到登录页的啊

为什么现在所有接口都可以直接访问了

```java
@SpringBootApplication
@EnableAuthorizationServer
@EnableWebSecurity(debug = true)
public class Jpp {

    public static void main(String[] args) {
         SpringApplication.run(Jpp.class, args);
    }

}
```

给spring security的debug日志打开后随便访问几个接口后发现Security过滤器链都是空的

```
Security filter chain: no match
```

说明spring security压根就没有接管这些请求路径，换句话说就是spring security的默认配置没有生效。



#### Security默认配置失效

那么spring security默认配置是在哪里配置的，又是在什么情况下会使这些配置失效呢

在 `spring-boot-autoconfigure` 包中 `SpringBootWebSecurityConfiguration` 自动配置类中找到了原因

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnDefaultWebSecurity
@ConditionalOnWebApplication(type = Type.SERVLET)
class SpringBootWebSecurityConfiguration {

   @Bean
   @Order(SecurityProperties.BASIC_AUTH_ORDER)
   SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
      http.authorizeRequests().anyRequest().authenticated().and().formLogin().and().httpBasic();
      return http.build();
   }

}
```

这个自动配置类就用于配置默认的spring security过滤器链，重点是这个类上的 `@ConditionalOnDefaultWebSecurity` 注解

这个注解的主要作用就是告诉spring该配置的启用条件

```java
@ConditionalOnMissingBean({ WebSecurityConfigurerAdapter.class, SecurityFilterChain.class })
```

从注解源码中可以看到默认配置的启用条件就是容器中没有 `WebSecurityConfigurerAdapter` 和 `SecurityFilterChain` 这两个类型的对象

也就是说我们写了自己的配置继承 `WebSecurityConfigurerAdapter` 并启用就会使默认配置失效

从上面源码中也看到了默认配置了表单登录和httpBasic认证，以及对所有请求都进行授权管理

我们引用了 spring security oauth2的相关依赖之后并没有配置spring security，这种情况下默认配置失效了肯定是引用的那两个包中带有`WebSecurityConfigurerAdapter` 类型的配置类

我们在idea中查看 `WebSecurityConfigurerAdapter` 的子类，在oauth2相关的包中有下图中这三个子类：

![image-20230105112833526](https://cdn.tencentfs.clboy.cn/images/2023/20230110165540944.png)

我们目前引入oauth2的相关依赖后只是在配置文件中配置了客户端id而已，就目前情况，通过debug来看这三个配置类，就只有

`AuthorizationServerSecurityConfiguration` 配置类生效

```java
@Configuration
@Order(0)
@Import({ ClientDetailsServiceConfiguration.class, AuthorizationServerEndpointsConfiguration.class })
@Deprecated
public class AuthorizationServerSecurityConfiguration extends WebSecurityConfigurerAdapter {

   @Autowired
   private List<AuthorizationServerConfigurer> configurers = Collections.emptyList();

   @Autowired
   private ClientDetailsService clientDetailsService;

   @Autowired
   private AuthorizationServerEndpointsConfiguration endpoints;

   @Autowired
   public void configure(ClientDetailsServiceConfigurer clientDetails) throws Exception {
      for (AuthorizationServerConfigurer configurer : configurers) {
         configurer.configure(clientDetails);
      }
   }

   @Override
   protected void configure(HttpSecurity http) throws Exception {
      AuthorizationServerSecurityConfigurer configurer = new AuthorizationServerSecurityConfigurer();
      FrameworkEndpointHandlerMapping handlerMapping = endpoints.oauth2EndpointHandlerMapping();
      http.setSharedObject(FrameworkEndpointHandlerMapping.class, handlerMapping);
      configure(configurer);
      http.apply(configurer);
      String tokenEndpointPath = handlerMapping.getServletPath("/oauth/token");
      String tokenKeyPath = handlerMapping.getServletPath("/oauth/token_key");
      String checkTokenPath = handlerMapping.getServletPath("/oauth/check_token");
      if (!endpoints.getEndpointsConfigurer().isUserDetailsServiceOverride()) {
         UserDetailsService userDetailsService = http.getSharedObject(UserDetailsService.class);
         endpoints.getEndpointsConfigurer().userDetailsService(userDetailsService);
      }
      http
           .authorizeRequests()
               .antMatchers(tokenEndpointPath).fullyAuthenticated()
               .antMatchers(tokenKeyPath).access(configurer.getTokenKeyAccess())
               .antMatchers(checkTokenPath).access(configurer.getCheckTokenAccess())
        .and()
           .requestMatchers()
               .antMatchers(tokenEndpointPath, tokenKeyPath, checkTokenPath)
        .and()
           .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.NEVER);

      http.setSharedObject(ClientDetailsService.class, clientDetailsService);
   }

   protected void configure(AuthorizationServerSecurityConfigurer oauthServer) throws Exception {
      for (AuthorizationServerConfigurer configurer : configurers) {
         configurer.configure(oauthServer);
      }
   }

}
```

从源码中可以看到它这里除了从容器中获取 `AuthorizationServerConfigurer` 类型配置类并调用配置方法外，就是对它定义的几个授权端点进行访问权限配置，但是其中没有 `/oauth/authorize` 接口，并且对于其他请求它都不管了。也没有启用表单登录

所以需要我们自己再写提个spring security的配置



#### Security配置

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityFormLoginConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.formLogin()
                .and()
                .authorizeRequests().antMatchers("/oauth/**", "/error")
                .permitAll()
                .anyRequest().authenticated();
    }
}
```

你可能会诧异为什么将 `/oauth/**` 路径允许任何人访问，不应该是 **authenticated** 吗

还记得上面 `AuthorizationEndpoint` 的源码中在验证用户是否已经认证，未认证抛出 `InsufficientAuthenticationException` 类型异常之前会检查参数是否正确

```java
if (!responseTypes.contains("token") && !responseTypes.contains("code")) {
   throw new UnsupportedResponseTypeException("Unsupported response types");
}

if (authorizationRequest.getClientId() == null) {
   throw new InvalidClientException("A client id must be provided");
}
```

如果我们配置为 **authenticated** ，就会直接把用户重定向到登录页，在用户登录正常后又重新调用获取授权码口，如果传递的参数有误。在登录之后才显示错误信息是不是很无语，不是浪费我的时间和感情 ~_~ ，直接提示错误信息就免得用户再去登录了。

此时，你可以又迷惑了，代码走到下一步，不是又报错了

```java
if (!(principal instanceof Authentication) || !((Authentication) principal).isAuthenticated()) {
   throw new InsufficientAuthenticationException(
         "User must be authenticated with Spring Security before authorization can be completed.");
}
```

我们看一下 `InsufficientAuthenticationException` 是继承了 `AuthenticationException`

```java
public class InsufficientAuthenticationException extends AuthenticationException
```

再回过头看一下过滤器链

```
Security filter chain: [
  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  CsrfFilter
  LogoutFilter
  UsernamePasswordAuthenticationFilter
  DefaultLoginPageGeneratingFilter
  DefaultLogoutPageGeneratingFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
]
```

其中有 `ExceptionTranslationFilter` 过滤器，这个过滤器会对一些异常特殊处理，对于 `AuthenticationException` 类型异常默认会重定向到登录页

```java
private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
		throws IOException, ServletException {
	try {
		chain.doFilter(request, response);
	}
	catch (IOException ex) {
		throw ex;
	}
	catch (Exception ex) {
		Throwable[] causeChain = this.throwableAnalyzer.determineCauseChain(ex);
		RuntimeException securityException = (AuthenticationException) this.throwableAnalyzer
				.getFirstThrowableOfType(AuthenticationException.class, causeChain);
		if (securityException == null) {
			securityException = (AccessDeniedException) this.throwableAnalyzer
					.getFirstThrowableOfType(AccessDeniedException.class, causeChain);
		}
		if (securityException == null) {
			rethrow(ex);
		}
		if (response.isCommitted()) {
			throw new ServletException("Unable to handle the Spring Security Exception "
					+ "because the response is already committed.", ex);
		}
        // 1.
		handleSpringSecurityException(request, response, chain, securityException);
	}
}

private void handleSpringSecurityException(HttpServletRequest request, HttpServletResponse response,
		FilterChain chain, RuntimeException exception) throws IOException, ServletException {
	if (exception instanceof AuthenticationException) {
        // 2.
		handleAuthenticationException(request, response, chain, (AuthenticationException) exception);
	}
	else if (exception instanceof AccessDeniedException) {
		handleAccessDeniedException(request, response, chain, (AccessDeniedException) exception);
	}
}

private void handleAuthenticationException(HttpServletRequest request, HttpServletResponse response,
		FilterChain chain, AuthenticationException exception) throws ServletException, IOException {
    // 3.
	sendStartAuthentication(request, response, chain, exception);
}

protected void sendStartAuthentication(HttpServletRequest request, HttpServletResponse response,
                                       FilterChain chain,AuthenticationException reason)
    throws ServletException, IOException {
	SecurityContext context = SecurityContextHolder.createEmptyContext();
	SecurityContextHolder.setContext(context);
    //记住当前的请求，登录完后会重定向回来
	this.requestCache.saveRequest(request, response);
    // 4.调用AuthenticationEntryPoint处理
	this.authenticationEntryPoint.commence(request, response, reason);
}
```



#### 测试授权码模式

配置好 `SpringSecurityFormLoginConfig` 后重启测试授权码模式

http://localhost:8080/oauth/authorize?client_id=oauth2-test&state=randomNumber&redirect_url=http://127.0.0.1:8081/login.html&response_type=code

这次又返回了 `Empty scope (either the client or the user is not allowed the requested scopes)` 异常信息，说明配置的客户端的scope不能是空的，我们就给它配置上

```java
security:
  oauth2:
    client:
      client-id: oauth2-test
      client-secret: 666888
      registered-redirect-uri: http://127.0.0.1:8081/login.html
      scope:
        - read_user_info
        - read_user_order_info
      authorized-grant-types:
        - authorization_code
        - password
        - client_credentials
        - implicit
        - refresh_token
```

之后都可以看到了中间的确认授权页面

![image-20230105161636989](https://cdn.tencentfs.clboy.cn/images/2023/20230110165553013.png)

如果在url请求参数中没有包含scope字段，则会将客户端配置中的所有权限列出来询问用户。如果在url指明了需要申请的scope权限就只会列出url参数中申请的

![image-20230105162532942](https://cdn.tencentfs.clboy.cn/images/2023/20230110165559316.png)

前提是服务端保存的客户端scope中包含url参数中的，否则就会返回给客户端返回 `invalid_scope` 错误，并且在url追加客户端在服务上配置的可申请的scope

```http
http://127.0.0.1:8081/login.html?error=invalid_scope&error_description=Invalid scope&state=randomNumber&scope=read_user_info read_user_order_info
```

当用户确认授权后就会重定向到配置的 *redirect_uri* 并携带code参数

```http
http://127.0.0.1:8081/login.html?code=FdKcD2&state=randomNumber
```

最后再访问 `/oauth/token` 接口通过code换取token

```java
### 授权码换取token
POST http://localhost:8080/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=oauth2-test&client_secret=666888&grant_type=authorization_code&code=FdKcD2
```

测试之后发现响应的 `401` 状态码，并且返回了 `WWW-Authenticate: Basic realm="oauth2/client"` 响应头

这是因为对于客户端的认证默认只支持basic形式，所以需要将客户端id和客户端秘钥采用basic认证方式携带过去

```http
### basic认证授权码换取token
POST http://localhost:8080/oauth/token
Authorization: Basic oauth2-test 666888
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=FdKcD2
```

成功响应token

```json
{
  "access_token": "AmzP-t6UEyGoD0OV96JWJlOY25Q",
  "token_type": "bearer",
  "refresh_token": "05uepHnNNRbneePtjw2FnSubqls",
  "expires_in": 43199,
  "scope": "read_user_order_info read_user_info"
}
```



如果想要开启将客户端id及秘钥放到表单参数中也能进行认证，需要自己写配置，上面我们提到了：

如果启用自定义配置默认配置就会失效，所以默认配置中对客户端的配置需要自己去定义了

```java
@Configuration
public class Oauth2AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

    @Bean
    @ConfigurationProperties(prefix = "security.oauth2.client")
    public BaseClientDetails baseClientDetails() {
        return new BaseClientDetails();
    }

    /**
     * 配置授权服务器的安全性，就是对token接入点(获取token的相关接口)的访问权限配置
     */
    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        //开启客户端表单格式认证
        security.allowFormAuthenticationForClients();
        security.passwordEncoder(NoOpPasswordEncoder.getInstance());
    }

    /**
     * 客户端服务配置
     */
    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        BaseClientDetails clientDetails = baseClientDetails();
        clients.inMemory()
                .withClient(clientDetails.getClientId())
                .secret(clientDetails.getClientSecret())
                .redirectUris(clientDetails.getRegisteredRedirectUri().toArray(new String[0]))
                .scopes(clientDetails.getScope().toArray(new String[0]))
                .authorizedGrantTypes(clientDetails.getAuthorizedGrantTypes().toArray(new String[0]));
    }

    /**
     * 配置授权服务器端点的非安全功能，如token存储、token自定义、用户授权类型等
     */
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
    }

}
```

#### 测试密码模式

接来下我们测一下密码模式是否能够走通

!> 在spring security oauth2中密码模式下，客户端id和秘钥也是必选参数，因为 `/oauth/token` 接口一进来就先检查客户端

```http
### 密码模式
POST http://localhost:8080/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=oauth2-test&client_secret=666888&grant_type=password&username=admin&password=123456
```

响应：不支持的授权类型

```json
{
  "error": "unsupported_grant_type",
  "error_description": "Unsupported grant type"
}
```

难道给客户端的 `authorized-grant-types` 中没有给 `password` 吗？，检查一下是给了呀，迷惑？？？

看一下 `TokenEndpoint` 的源码

```java
@RequestMapping(value = "/oauth/token", method=RequestMethod.POST)
public ResponseEntity<OAuth2AccessToken> postAccessToken(
      Principal principal, @RequestParam Map<String, String> parameters)
      throws HttpRequestMethodNotSupportedException {

    // ... 

   OAuth2AccessToken token = getTokenGranter().grant(tokenRequest.getGrantType(), tokenRequest);
   if (token == null) {
      // 只有这一个地方抛出响应的错误信息
      throw new UnsupportedGrantTypeException("Unsupported grant type");
   }

   return getResponse(token);
} 
```

#### TokenGranter

可以看到获取token接口是 TokenGranter接口的grant方法来获取token的

```java
public interface TokenGranter {
   OAuth2AccessToken grant(String grantType, TokenRequest tokenRequest);
}
```

其主要实现类如下图：

![image-20230106151903217](https://cdn.tencentfs.clboy.cn/images/2023/20230110165608087.png)

- RefreshTokenGranter：用于刷新token

- AuthorizationCodeTokenGranter：用于授权码模式中，code换取token

- ImplicitTokenGranter：简化模式获取token

- ResourceOwnerPasswordTokenGranter：密码模式获取token

- ClientCredentialsTokenGranter：客户端模式获取token

- CompositeTokenGranter：组合式TokenGrante。默认都会使用这个，tokenGranters持有上面那些实例

  ```java
  public class CompositeTokenGranter implements TokenGranter {
  
     private final List<TokenGranter> tokenGranters;
  
     public OAuth2AccessToken grant(String grantType, TokenRequest tokenRequest) {
        for (TokenGranter granter : tokenGranters) {
           OAuth2AccessToken grant = granter.grant(grantType, tokenRequest);
           if (grant!=null) {
              return grant;
           }
        }
        return null;
     }
  }
  ```

我们debug看一下，当前tokenGranters中没有 `ResourceOwnerPasswordTokenGranter`

![image-20230106153548845](https://cdn.tencentfs.clboy.cn/images/2023/20230110165615147.png)

要想知道为什么没有  `ResourceOwnerPasswordTokenGranter` 之前，我们应该找到，存在的这些它是在什么时候设置进去的

看一下AuthorizationServerEndpointsConfiguration端点配置类

```java
@Configuration
public class AuthorizationServerEndpointsConfiguration {

   private AuthorizationServerEndpointsConfigurer endpoints = new AuthorizationServerEndpointsConfigurer();
    
   @Autowired
   private ClientDetailsService clientDetailsService;
    
   	@PostConstruct
	public void init() {
        // 获取容器中的AuthorizationServerConfigurer(AuthorizationServerConfigurerAdapter)
        // 自定义的配置中configure(AuthorizationServerEndpointsConfigurer endpoints)方法就是这里被调用的
		for (AuthorizationServerConfigurer configurer : configurers) {
			try {
				configurer.configure(endpoints);
			} catch (Exception e) {
				throw new IllegalStateException("Cannot configure endpoints", e);
			}
		}
		endpoints.setClientDetailsService(clientDetailsService);
	}

   @Bean
   public TokenEndpoint tokenEndpoint() throws Exception {
      TokenEndpoint tokenEndpoint = new TokenEndpoint();
      tokenEndpoint.setClientDetailsService(clientDetailsService);
      tokenEndpoint.setProviderExceptionHandler(exceptionTranslator());
      // 获取并设置TokenGranter，最终就是调用 endpoints 的tokenGranter()方法来获取
      tokenEndpoint.setTokenGranter(tokenGranter());
      tokenEndpoint.setOAuth2RequestFactory(oauth2RequestFactory());
      tokenEndpoint.setOAuth2RequestValidator(oauth2RequestValidator());
      tokenEndpoint.setAllowedRequestMethods(allowedTokenEndpointRequestMethods());
      return tokenEndpoint;
   }
}
```

如果开发者没有自己配置TokenGranter，就会使用 CompositeTokenGranter，并设置一组默认的TokenGranter

```java
private TokenGranter tokenGranter() {
   if (tokenGranter == null) {
      tokenGranter = new TokenGranter() {
         private CompositeTokenGranter delegate;

         @Override
         public OAuth2AccessToken grant(String grantType, TokenRequest tokenRequest) {
            if (delegate == null) {
               delegate = new CompositeTokenGranter(getDefaultTokenGranters());
            }
            return delegate.grant(grantType, tokenRequest);
         }
      };
   }
   return tokenGranter;
}
```

从下面的源码中看到要想使ResourceOwnerPasswordTokenGranter生效需要给 `endpoints` 设置authenticationManager

```java
private List<TokenGranter> getDefaultTokenGranters() {
   ClientDetailsService clientDetails = clientDetailsService();
   AuthorizationServerTokenServices tokenServices = tokenServices();
   AuthorizationCodeServices authorizationCodeServices = authorizationCodeServices();
   OAuth2RequestFactory requestFactory = requestFactory();

   List<TokenGranter> tokenGranters = new ArrayList<TokenGranter>();
   tokenGranters.add(new AuthorizationCodeTokenGranter(tokenServices, authorizationCodeServices, clientDetails,
         requestFactory));
   
   // 这里添加了那四个TokenGranters
   tokenGranters.add(new RefreshTokenGranter(tokenServices, clientDetails, requestFactory));
   ImplicitTokenGranter implicit = new ImplicitTokenGranter(tokenServices, clientDetails, requestFactory);
   tokenGranters.add(implicit);
   tokenGranters.add(new ClientCredentialsTokenGranter(tokenServices, clientDetails, requestFactory));
    
   // 如果authenticationManager不会空，才会设置ResourceOwnerPasswordTokenGranter(密码模式)
   if (authenticationManager != null) {
      tokenGranters.add(new ResourceOwnerPasswordTokenGranter(authenticationManager, tokenServices,
            clientDetails, requestFactory));
   }
   return tokenGranters;
}
```

这里的authenticationManager是用于认证用户的(资源拥有者)，该authenticationManager在配置表单登录的配置类中可以获取到，我们将其注册到容器中，再设置给  `endpoints` 

#### 暴露AuthenticationManager

`WebSecurityConfigurerAdapter` 提供了 `authenticationManagerBean` 方法供开发者重写然后暴露 `AuthenticationManager` 到容器中

```java
/**
 * 覆盖此方法以将configure(AuthenticationManagerBuilder)中的AuthenticationManager公开为 Bean。
 * 例如：
 *	@Bean(name name="myAuthenticationManager")
 *	@Override
 *	public AuthenticationManager authenticationManagerBean() throws Exception {
 *		return super.authenticationManagerBean();
 *	}
 */
public AuthenticationManager authenticationManagerBean() throws Exception {
   return new AuthenticationManagerDelegator(this.authenticationBuilder, this.context);
}
```

按照注释的说明进行重写

```java
@EnableWebSecurity(debug = true)
public class SpringSecurityFormLoginConfig extends WebSecurityConfigurerAdapter {
    
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
    
    // ......
}
```

```java
@Configuration
@AllArgsConstructor
public class Oauth2AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

    // 注入AuthenticationManager
    private final AuthenticationManager authenticationManager;

    /**
     * 配置授权服务器端点的非安全功能，如token存储、token自定义、用户授权类型等
     */
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        // 设置密码模式用于认证资源拥有者的authenticationManager
        endpoints.authenticationManager(authenticationManager);
    }

}
```

重启项目重新测试密码模式接口 ...

我丢，`500` 状态码，服务器错误，返回控制台查看日志，抛出了 `StackOverflowError` 异常，应该是循环调用引起的，重日志堆栈信息来看好像是配置的 `AuthenticationManager` 有问题

回过头再看起来我们重写的 `authenticationManagerBean` 方法上的注释

?> 覆盖此方法以将configure(AuthenticationManagerBuilder)中的AuthenticationManager公开为 Bean

通过前面的学习知道这个方法就是用来配置AuthenticationManager的，再看一下 `WebSecurityConfigurerAdapter` 中的这个方法及注释

```java
/**
 * 由authenticationManager()的默认实现使用以尝试获取AuthenticationManager。
 * 如果这个方法被子类覆盖，则应使用AuthenticationManagerBuilder来指定AuthenticationManager 。
 * authenticationManagerBean()方法可用于将生成的AuthenticationManager公开为 Bean
 */
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
   this.disableLocalConfigureAuthenticationBldr = true;
}

public AuthenticationManager authenticationManagerBean() throws Exception {
   return new AuthenticationManagerDelegator(this.authenticationBuilder, this.context);
}
```

也就是说开发者还需要重写 `configure(AuthenticationManagerBuilder auth)` 方法配置 `AuthenticationManagerBuilder` 之后再通过

`authenticationManagerBean()` 方法注册到容器中的 `AuthenticationManager` 才能正常使用

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityFormLoginConfig extends WebSecurityConfigurerAdapter {


    private final SecurityProperties securityProperties;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        SecurityProperties.User user = securityProperties.getUser();
        auth.inMemoryAuthentication()
                .withUser(user.getName())
                .password(user.getPassword())
                .roles(user.getRoles().toArray(new String[0]))
                .and()
                .passwordEncoder(NoOpPasswordEncoder.getInstance());
    }


    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
```

这次再测试密码模式就ok了

#### token的生成和保存

获取token的主要逻辑都继承自抽象类 `AbstractTokenGranter`

```java
public abstract class AbstractTokenGranter implements TokenGranter {

   private final AuthorizationServerTokenServices tokenServices;

   private final ClientDetailsService clientDetailsService;
   
   private final OAuth2RequestFactory requestFactory;
   
   private final String grantType;

   public OAuth2AccessToken grant(String grantType, TokenRequest tokenRequest) {

      if (!this.grantType.equals(grantType)) {
         return null;
      }
      
      String clientId = tokenRequest.getClientId();
      ClientDetails client = clientDetailsService.loadClientByClientId(clientId);
      validateGrantType(grantType, client);
       
      // 获取token方法
      return getAccessToken(client, tokenRequest);

   }
    
   protected OAuth2AccessToken getAccessToken(ClientDetails client, TokenRequest tokenRequest) {
   	// 调用tokenServices创建token
   	return tokenServices.createAccessToken(getOAuth2Authentication(client, tokenRequest));
   }
    
   /**
    * 将获取token的请求封装成OAuth2Authentication
    */
   protected OAuth2Authentication getOAuth2Authentication(ClientDetails client, TokenRequest tokenRequest) {
   	OAuth2Request storedOAuth2Request = requestFactory.createOAuth2Request(client, tokenRequest);
   	return new OAuth2Authentication(storedOAuth2Request, null);
   }
  
}
```



从中可以看到是调用 `AuthorizationServerTokenServices` 来创建token的

```java
public interface AuthorizationServerTokenServices {

   /**
    * 创建token
    */
   OAuth2AccessToken createAccessToken(OAuth2Authentication authentication) throws AuthenticationException;

   /**
    * 刷新token
    */
   OAuth2AccessToken refreshAccessToken(String refreshToken, TokenRequest tokenRequest)
         throws AuthenticationException;

   /**
    * 根据获取token请求获取已经存在的token(如果存在，不存在返回null)
    */
   OAuth2AccessToken getAccessToken(OAuth2Authentication authentication);

}
```

 提供的唯一实现类是：`DefaultTokenServices`

```java
public class DefaultTokenServices implements AuthorizationServerTokenServices, ResourceServerTokenServices,
      ConsumerTokenServices, InitializingBean {

   private static final BytesKeyGenerator DEFAULT_TOKEN_GENERATOR = KeyGenerators.secureRandom(20);

   private static final Charset US_ASCII = Charset.forName("US-ASCII");

   private int refreshTokenValiditySeconds = 60 * 60 * 24 * 30; // 刷新token时效，默认30天

   private int accessTokenValiditySeconds = 60 * 60 * 12; // 访问token时效，默认12小时

   private boolean supportRefreshToken = false;

   private boolean reuseRefreshToken = true;

   private TokenStore tokenStore;

   private ClientDetailsService clientDetailsService;

   private TokenEnhancer accessTokenEnhancer;

   private AuthenticationManager authenticationManager;

   @Transactional
   public OAuth2AccessToken createAccessToken(OAuth2Authentication authentication) throws AuthenticationException {

      OAuth2AccessToken existingAccessToken = tokenStore.getAccessToken(authentication);
      OAuth2RefreshToken refreshToken = null;
      if (existingAccessToken != null) {
          // ... 检查accessToken是否过期，过期则调用tokenStore删除accessToken和refreshToken，否则直接返回
          return existingAccessToken;
      }

      if (refreshToken == null) {
         refreshToken = createRefreshToken(authentication);
      } else if (refreshToken instanceof ExpiringOAuth2RefreshToken) {
         // ... 检查refreshToken是否过期，过期就重新生成
      }
       
      // 创建accessToken和refreshToken，然后调用 tokenStore 存储
      OAuth2AccessToken accessToken = createAccessToken(authentication, refreshToken);
      tokenStore.storeAccessToken(accessToken, authentication);
       
      refreshToken = accessToken.getRefreshToken();
      if (refreshToken != null) {
         tokenStore.storeRefreshToken(refreshToken, authentication);
      }
      return accessToken;

   }

   @Transactional(noRollbackFor={InvalidTokenException.class, InvalidGrantException.class})
   public OAuth2AccessToken refreshAccessToken(String refreshTokenValue, TokenRequest tokenRequest)
         throws AuthenticationException {

      if (!supportRefreshToken) {
         throw new InvalidGrantException("Invalid refresh token");
      }

      OAuth2RefreshToken refreshToken = tokenStore.readRefreshToken(refreshTokenValue);
      if (refreshToken == null) {
         throw new InvalidGrantException("Invalid refresh token");
      }

      OAuth2Authentication authentication = tokenStore.readAuthenticationForRefreshToken(refreshToken);
     
      // ...
       
      String clientId = authentication.getOAuth2Request().getClientId();
      if (clientId == null || !clientId.equals(tokenRequest.getClientId())) {
         throw new InvalidGrantException("Wrong client for this refresh token");
      }

      tokenStore.removeAccessTokenUsingRefreshToken(refreshToken);

      if (isExpired(refreshToken)) {
         tokenStore.removeRefreshToken(refreshToken);
         throw new InvalidTokenException("Invalid refresh token (expired)");
      }

      authentication = createRefreshedAuthentication(authentication, tokenRequest);

      if (!reuseRefreshToken) {
         tokenStore.removeRefreshToken(refreshToken);
         refreshToken = createRefreshToken(authentication);
      }

      OAuth2AccessToken accessToken = createAccessToken(authentication, refreshToken);
      tokenStore.storeAccessToken(accessToken, authentication);
      if (!reuseRefreshToken) {
         tokenStore.storeRefreshToken(accessToken.getRefreshToken(), authentication);
      }
      return accessToken;
   }


   /**
    * 生成随机刷新token
    */
   private OAuth2RefreshToken createRefreshToken(OAuth2Authentication authentication) {
     if (!isSupportRefreshToken(authentication.getOAuth2Request())) {
       return null;
     }
     int validitySeconds = getRefreshTokenValiditySeconds(authentication.getOAuth2Request());
     String tokenValue = new String(Base64.encodeBase64URLSafe(DEFAULT_TOKEN_GENERATOR.generateKey()), US_ASCII);
     if (validitySeconds > 0) {
       return new DefaultExpiringOAuth2RefreshToken(tokenValue, new Date(System.currentTimeMillis()
           + (validitySeconds * 1000L)));
     }
     return new DefaultOAuth2RefreshToken(tokenValue);
   }
          
    /**
     * 生成随机访问token
     */
 	private OAuth2AccessToken createAccessToken(OAuth2Authentication authentication, OAuth2RefreshToken refreshToken) {
 	  String tokenValue = new String(Base64.encodeBase64URLSafe(DEFAULT_TOKEN_GENERATOR.generateKey()),  US_ASCII);
 	  DefaultOAuth2AccessToken token = new DefaultOAuth2AccessToken(tokenValue);
 	  int validitySeconds = getAccessTokenValiditySeconds(authentication.getOAuth2Request());
 	  if (validitySeconds > 0) {
 	    token.setExpiration(new Date(System.currentTimeMillis() + (validitySeconds * 1000L)));
 	  }
 	  token.setRefreshToken(refreshToken);
 	  token.setScope(authentication.getOAuth2Request().getScope());
 	
      // 使用 TokenEnhancer 接口对token增强(可以对token二次包装)
 	  return accessTokenEnhancer != null ? accessTokenEnhancer.enhance(token, authentication) : token;
 	}
}
```

从 `DefaultTokenServices` 的源码中可以看到，产生随机token之后会尝试调用 `TokenEnhancer` 接口的enhance方法将token传递过去并接收一个新的token， 最终是通过 `tokenStore` 来存储管理token的生命周期的

`TokenEnhancer` 接口：

```java
/**
 * 在AuthorizationServerTokenServices实现存储访问令牌之前增强访问令牌的策略
 */
public interface TokenEnhancer {

   /**
    * 在创建供客户端使用的新令牌的过程中，提供自定义访问令牌的机会
    */
   OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication);

}
```

`TokenStore` 接口：

```java
public interface TokenStore {

   /**
    * 存储token
    */
   void storeAccessToken(OAuth2AccessToken token, OAuth2Authentication authentication);

   /**
    * 删除token
    */
   void removeAccessToken(OAuth2AccessToken token);

   /**
    * 存储刷新token
    */
   void storeRefreshToken(OAuth2RefreshToken refreshToken, OAuth2Authentication authentication);

   /**
    * 删除刷新token
    */
   void removeRefreshToken(OAuth2RefreshToken token);
    
   // ......
}
```

其内部提供了以下几个实现类：

- `InMemoryTokenStore` ：使用内存存储token，默认使用
- `JdbcTokenStore` ：使用数据库存储token
- `JwtTokenStore` ：使用jwt格式token
- `RedisTokenStore` ：使用redis存储token

### 资源服务搭建

由于上面学习的授权服务搭建使用的都是默认配置，token存储使用的是 `InMemoryTokenStore` ，如果新创建一个服务用来当资源服务，那验证token就很麻烦了d。所以我们直接让授权服务同时提供资源服务，之前我们也说过授权服务和资源服务可以是由同一台服务提供的

资源服务所需要的依赖，由于授权服务也是需要这个，之前就添加过了：

```xml
<dependency>
    <groupId>org.springframework.security.oauth</groupId>
    <artifactId>spring-security-oauth2</artifactId>
    <version>2.5.2.RELEASE</version>
</dependency>
```

当前，我们并没有开启服务作为资源服务的功能，所以现在按照oauth2标准格式携带token访问是没有用的

```java
@Controller
@RequestMapping("/user")
public class SysUserController {

    @ResponseBody
    @GetMapping(value = "/test")
    public String test(Principal principal) {
        return principal.getName() + "，鸡你太美";
    }

}
```

```http
### oath2认证
GET http://localhost:8080/user/test
Authorization: Bearer L5j6h-nMJy-ZTXk1JiNYvJ7G1gE
```

通过oauth2认证流程获取到token之后，即使token正确，spring security也无法识别这个token格式

#### EnableResourceServer

要想开启资源服务的功能，只需要在启动了或者配置类上添加 `@EnableResourceServer` 即可

```java
@SpringBootApplication
@EnableResourceServer
@EnableAuthorizationServer
@EnableMethodSecurity
public class Jpp {
    public static void main(String[] args) {
         SpringApplication.run(Jpp.class, args);
    }
}
```

该注解导入 `ResourceServerConfiguration` 配置类

```java
@Import(ResourceServerConfiguration.class)
public @interface EnableResourceServer {
}
```



`ResourceServerConfiguration` 资源服务主要配置

```java
@Configuration
public class ResourceServerConfiguration extends WebSecurityConfigurerAdapter implements Ordered {

   private int order = 3;

   @Autowired(required = false)
   private TokenStore tokenStore;

   @Autowired(required = false)
   private AuthenticationEventPublisher eventPublisher;

   @Autowired(required = false)
   private Map<String, ResourceServerTokenServices> tokenServices;

   @Autowired
   private ApplicationContext context;

   private List<ResourceServerConfigurer> configurers = Collections.emptyList();

   @Autowired(required = false)
   private AuthorizationServerEndpointsConfiguration endpoints;

   @Override
   public int getOrder() {
      return order;
   }

   public void setOrder(int order) {
      this.order = order;
   }
    
   @Autowired(required = false)
   public void setConfigurers(List<ResourceServerConfigurer> configurers) {
      this.configurers = configurers;
   }

   @Override
   protected void configure(HttpSecurity http) throws Exception {
      // 创建资源服务 Security 配置类并应用到 HttpSecurity
      ResourceServerSecurityConfigurer resources = new ResourceServerSecurityConfigurer();
      // 从容器中获取ResourceServerTokenServices
      // 上面创建授权服务的时候是AuthorizationServerTokenServices.且默认使用DefaultTokenServices
      // DefaultTokenServices即实现了ResourceServerTokenServices也实现了AuthorizationServerTokenServices
      ResourceServerTokenServices services = resolveTokenServices();
      if (services != null) {
         resources.tokenServices(services);
      }
      else {
         // 未从容器中获取到ResourceServerTokenServices则从容器中获取TokenStore
         if (tokenStore != null) {
            resources.tokenStore(tokenStore);
         } else if (endpoints != null) {
         	// 容器中也没有注册TokenStore，则从容器中获取AuthorizationServerEndpointsConfiguration配置类
         	// 如果授权服务和资源服务是同一个服务，当然可以获取到
            resources.tokenStore(endpoints.getEndpointsConfigurer().getTokenStore());
         }
      }
      if (eventPublisher != null) {
         resources.eventPublisher(eventPublisher);
      }
       
      // 从容器中获取ResourceServerConfigurer配置类，所以要想自定义配置，可以实现该接口
      for (ResourceServerConfigurer configurer : configurers) {
         configurer.configure(resources);
      }

      http.authenticationProvider(new AnonymousAuthenticationProvider("default"))
      .exceptionHandling()
            .accessDeniedHandler(resources.getAccessDeniedHandler()).and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .csrf().disable();
      http.apply(resources);
      if (endpoints != null) {
         // 如果当前服务也是授权服务，配置该HttpSecurity的过滤器链匹配的地址
         // NotOAuthRequestMatcher匹配器匹配除授权服务定义的那些/oauth/开头的几个端点外所有请求地址
         // 而且该WebSecurityConfigurerAdapter配置类的排序值为3，我们的配置排序值大于它
         // 也就是说该HttpSecurity的过滤器链永远会比我们自己配置的过滤器链先匹配，也就是我们配置的过滤器链如果排序值大于3就没有执行			  的机会了
         // 但是我们可以在自定义ResourceServerConfigurer中重新设置匹配器去覆盖掉它默认的
         http.requestMatcher(new NotOAuthRequestMatcher(endpoints.oauth2EndpointHandlerMapping()));
      }
      for (ResourceServerConfigurer configurer : configurers) {
         // 这里调用自定义的ResourceServerConfigurer，给开发者修改HttpSecurity
         configurer.configure(http);
      }
      if (configurers.isEmpty()) {
         // 如果容器中没有任何自定义配置，将该过滤器链匹配的所有请求设置为已认证状态下才能访问
         http.authorizeRequests().anyRequest().authenticated();
      }
   }
}
```

资源服务配置又创建了 `ResourceServerSecurityConfigurer` 应用到 HttpSecurity(过滤器链)

```java
@Override
public void configure(HttpSecurity http) throws Exception {

   AuthenticationManager oauthAuthenticationManager = oauthAuthenticationManager(http);
   resourcesServerFilter = new OAuth2AuthenticationProcessingFilter();
   resourcesServerFilter.setAuthenticationEntryPoint(authenticationEntryPoint);
   resourcesServerFilter.setAuthenticationManager(oauthAuthenticationManager);
   if (eventPublisher != null) {
      resourcesServerFilter.setAuthenticationEventPublisher(eventPublisher);
   }
   if (tokenExtractor != null) {
      resourcesServerFilter.setTokenExtractor(tokenExtractor);
   }
   if (authenticationDetailsSource != null) {
      resourcesServerFilter.setAuthenticationDetailsSource(authenticationDetailsSource);
   }
   resourcesServerFilter = postProcess(resourcesServerFilter);
   resourcesServerFilter.setStateless(stateless);

   http
      .authorizeRequests().expressionHandler(expressionHandler)
   .and()
      .addFilterBefore(resourcesServerFilter, AbstractPreAuthenticatedProcessingFilter.class)
      .exceptionHandling()
         .accessDeniedHandler(accessDeniedHandler)
         .authenticationEntryPoint(authenticationEntryPoint);
}
```

ResourceServerSecurityConfigurer给过滤器链中添加了 `OAuth2AuthenticationProcessingFilter` ，这个过滤器就是用来处理oauth格式的携带token请求认证。还设置了异常处理器



#### 资源服务配置类

从上面的ResourceServerConfiguration配置类中知道，开发者可以自己创建 `ResourceServerConfigurer` 类型的配置注册到容器对资源服务进行定制化配置，同spring security配置和授权服务配置，资源服务也提供了一个抽象类可以继承 `ResourceServerConfigurerAdapter`

如果容器中没有  `ResourceServerConfigurer` 类型的配置，则会注册一个默认的

```java
@Configuration
@Conditional(ResourceServerCondition.class)
@ConditionalOnClass({ EnableResourceServer.class, SecurityProperties.class })
@ConditionalOnWebApplication
@ConditionalOnBean(ResourceServerConfiguration.class)
@Import(ResourceServerTokenServicesConfiguration.class)
public class OAuth2ResourceServerConfiguration {

   private final ResourceServerProperties resource;

   public OAuth2ResourceServerConfiguration(ResourceServerProperties resource) {
      this.resource = resource;
   }

   @Bean
   @ConditionalOnMissingBean(ResourceServerConfigurer.class)
   public ResourceServerConfigurer resourceServer() {
      return new ResourceSecurityConfigurer(this.resource);
   }

   protected static class ResourceSecurityConfigurer extends ResourceServerConfigurerAdapter {

      private ResourceServerProperties resource;

      public ResourceSecurityConfigurer(ResourceServerProperties resource) {
         this.resource = resource;
      }

      @Override
      public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
         // 配置资源服务的id
         resources.resourceId(this.resource.getResourceId());
      }

      @Override
      public void configure(HttpSecurity http) throws Exception {
         // 授权配置所有请求必须已认证才能访问
         http.authorizeRequests().anyRequest().authenticated();
      }

   }
}
```
