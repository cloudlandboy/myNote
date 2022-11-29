# Spring Security核心组件



![image-20221125151117002](https://cdn.tencentfs.clboy.cn/images/2022/20221129135223985.png)

## SecurityContext

> `org.springframework.security.core.context.SecurityContext`
>
> `org.springframework.security.core.context.SecurityContextImpl`
>
> 是用来存储当前认证的用户的详细信息

```java
/**
 * 定义与当前执行线程关联的最小安全信息的接口,安全上下文存储在SecurityContextHolder中。
 */
public interface SecurityContext extends Serializable {

   /**
    * 获取当前经过身份验证的主体，或身份验证请求令牌，如果没有认证信息可用则返回null
    */
   Authentication getAuthentication();

   /**
    * 更改当前经过身份验证的主体，或删除身份验证信息(设置为null)
    */
   void setAuthentication(Authentication authentication);

}
```



## SecurityContextHolder

> `org.springframework.security.core.context.SecurityContextHolder`
>
> 将给定的SecurityContext与当前执行线程相关联，此类中的所有内容都是static的
>
> 总的来说它就是一个工具类，它提供了对安全上下文的访问。默认情况下，它使用一个ThreadLocal对象来存储安全上下文，这意味着它是线程安全的。

```java
/**
 * 将给定的SecurityContext与当前执行线程相关联。
 * 此类提供了一系列委托给SecurityContextHolderStrategy实例的静态方法。
 * 该类的目的是提供一种方便的方法来指定应该用于给定 JVM 的策略。这是 JVM 范围内的设置，因为此类中的所有内容都是static的，以便于调用代码时的易用性。
 * 要指定应使用哪种策略，您必须提供模式设置。模式设置是定义为static final字段的三个有效MODE_设置之一
 * 或者是提供公共无参数构造函数的SecurityContextHolderStrategy的具体实现的完全限定类名。
 * 有两种方法可以指定所需的策略模式String 。第一种是通过键入SYSTEM_PROPERTY的系统属性来指定它。
 * 第二种是在使用类之前调用setStrategyName(String) 。
 * 如果这两种方法都不使用，该类将默认使用MODE_THREADLOCAL ，它向后兼容，具有较少的 JVM 不兼容性并且适用于服务器（而MODE_GLOBAL绝对不适合服务器使用）。
 */
public class SecurityContextHolder {

   public static final String MODE_THREADLOCAL = "MODE_THREADLOCAL";

   public static final String MODE_INHERITABLETHREADLOCAL = "MODE_INHERITABLETHREADLOCAL";

   public static final String MODE_GLOBAL = "MODE_GLOBAL";

   private static final String MODE_PRE_INITIALIZED = "MODE_PRE_INITIALIZED";

   public static final String SYSTEM_PROPERTY = "spring.security.strategy";

   private static String strategyName = System.getProperty(SYSTEM_PROPERTY);

   private static SecurityContextHolderStrategy strategy;
    
   //... 省略其他代码
}
```



## Authentication

> `org.springframework.security.core.Authentication`
>
> - 存储了当前用户（与应用程序交互的主体）的详细信息
> - `Principal` 可以理解为用户的信息（比较简单的情况下，有可能是用户名）
> - `Credentials` 可以理解为密码
> - `Authorities` 可以理解为权限

```java
/**
 * 一旦AuthenticationManager.authenticate(Authentication)方法处理了请求，就表示身份验证请求或经过身份验证的主体的令牌。
 * 一旦请求通过身份验证，身份验证通常将存储在由正在使用的身份验证机制的SecurityContextHolder管理的线程本地SecurityContext中。
 * 通过创建一个Authentication实例并使用代码，可以在不使用 Spring Security 的身份验证机制的情况下实现显式身份验证：
 *   SecurityContext context = SecurityContextHolder.createEmptyContext();
 *   context.setAuthentication(anAuthentication);
 *   SecurityContextHolder.setContext(context);
 * 请注意，除非Authentication将authenticated属性设置为true ，否则它仍将由遇到它的任何安全拦截器（用于方法或 web 调用）进行身份验证。
 * 在大多数情况下，框架会透明地为您管理安全上下文和身份验证对象。
 */
public interface Authentication extends Principal, Serializable {

    /**
 	 * 由AuthenticationManager设置以指示主体已被授予的权限
 	 * 实现应确保对返回的集合数组的修改不会影响 Authentication 对象的状态，或使用不可修改的实例。
 	 * 返回值： 授予主体的权限，如果令牌尚未经过身份验证，则为空集合。永远不会是null。
 	 */
   Collection<? extends GrantedAuthority> getAuthorities();

    /**
 	 * 证明认证主题的凭据。这通常是密码
 	 */
   Object getCredentials();

    /**
 	 * 存储有关身份验证请求的其他详细信息。这些可能是 IP 地址、证书序列号等
 	 */
   Object getDetails();

    /**
     * 被认证的主体的身份。在使用用户名和密码的身份验证请求的情况下，这将是用户名。调用者应填充身份验证请求的主体。
     * AuthenticationManager实现通常会返回一个包含更丰富信息的Authentication作为应用程序使用的主体。
     * 许多身份验证提供程序将创建一个UserDetails对象作为主体。
     */
   Object getPrincipal();

    /**
     * 如果请求的令牌被信任则为true，如果令牌不被信任则为false
     */
   boolean isAuthenticated();

    /**
     * 如果请求的令牌被信任则为true，如果令牌不被信任则为false
     */
   void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;

}
```

它的实现类，目前我们大部分情况下使用的都是 `UsernamePasswordAuthenticationToken`

![image-20221125154844991](https://cdn.tencentfs.clboy.cn/images/2022/20221129135239195.png)

在前面学习security配置的时候，我们自定义登录成功处理就看过这个类的结构

```java
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
```



## 应用中获取Authentication

在web应用中，认证成功之后，程序可以在任意地方通过 `SecurityContextHolder` 获取到绑定到当前线程的 `Authentication`

```java
@RestController
@RequestMapping("/users")
public class UserResourceController {
    
    @GetMapping("/principal")
    public Principal authentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
    
    //... 省略其他代码
}
```

```http
### basic认证获取主体信息
GET http://localhost:8080/users/principal
Authorization: Basic admin 123456
```

```json
{
  "authorities": [
    {
      "authority": "ROLE_ADMIN"
    }
  ],
  "details": {
    "remoteAddress": "127.0.0.1",
    "sessionId": null
  },
  "authenticated": true,
  "principal": {
    "password": null,
    "username": "admin",
    "authorities": [
      {
        "authority": "ROLE_ADMIN"
      }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true,
    "enabled": true
  },
  "credentials": null,
  "name": "admin"
}
```

另外在spring web应用中，我们可以直接在cotroller方法中接收  `Authentication` 类型参数，因为  `Authentication` 实现了 

`java.security.Principal` 接口。spring web在进行controller方法参数注入时会从 `HttpServletRequest` 请求从获取。

spring security 包装的请求会提供给它

```java
public interface HttpServletRequest extends ServletRequest{
    
    //...
    
    public java.security.Principal getUserPrincipal();
    
    //...
}
```

```java
@GetMapping("/principal")
public Principal authentication(Principal principal) {
    return principal;
}
```



## UserDetails

> `org.springframework.security.core.userdetails.UserDetails`
>
> 认证主体的信息

在 `Authentication` 类中的 `getPrincipal()` 方法用户获取认证的主体信息。

```java
 /**
  * 被认证的主体的身份。在使用用户名和密码的身份验证请求的情况下，这将是用户名。调用者应填充身份验证请求的主体。
  * AuthenticationManager实现通常会返回一个包含更丰富信息的Authentication作为应用程序使用的主体。
  * 许多身份验证提供程序将创建一个UserDetails对象作为主体。
  */
Object getPrincipal();
```

它源码中的注释也提到一般情况下都会使用 `UserDetails` 对象作为主体。

`UserDetails` 是security提供的一个接口，里面定义了主体应该有的一些信息

```java
public interface UserDetails extends Serializable {

   /**
    * 用户拥有的权限集合，不能返回null
    */
   Collection<? extends GrantedAuthority> getAuthorities();

   /**
    * 密码
    */
   String getPassword();

   /**
    * 用户名，不能返回null
    */
   String getUsername();

   /**
    * 用户的帐户是否已过期，未过期：true
    */
   boolean isAccountNonExpired();

   /**
    * 用户的帐户是否已锁定，未锁定：true
    */
   boolean isAccountNonLocked();

   /**
    * 用户的凭据（密码）是否已过期，未过期：true
    */
   boolean isCredentialsNonExpired();

   /**
    * 该账户是否可用，true：可用
    */
   boolean isEnabled();

}
```

security提供的实现是 `org.springframework.security.core.userdetails.User`

我们可以根据业务需求定义自己的用户类继承它提供的 `User` 类

## UserDetailsService

> `org.springframework.security.core.userdetails.UserDetailsService`
>
> 获取认证主体信息的服务，该接口只定义了一个方法

```java
public interface UserDetailsService {

   /**
    * 根据用户名获取用户信息，不能返回null。
    * 如果未根据用户名查到用户，应直接抛出 UsernameNotFoundException 类型异常
    */
   UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

}
```

这里security提供的一些实现

![image-20221125162250661](https://cdn.tencentfs.clboy.cn/images/2022/20221129135254153.png)

在前面的学习中我们使用的都是基于内存的 `InMemoryUserDetailsManager`

```java
@Bean
public UserDetailsService userDetailsService() {
    //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
    //System.out.println(passwordEncoder().encode("123456"));
    UserDetails userDetails = User.withUsername("admin").roles("ADMIN")
            .password("$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS")
            .build();
    return new InMemoryUserDetailsManager(userDetails);
}
```

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
    //System.out.println(passwordEncoder().encode("123456"));
    auth.inMemoryAuthentication().withUser("admin")
            .password("$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS")
            .roles("ADMIN");
}
```

接下来我们体验性基于数据库的实现类 `org.springframework.security.provisioning.JdbcUserDetailsManager`

## jdbcAuthentication

`JdbcUserDetailsManager` 使用的是 `jdbcTemplate` 来操作数据库的，另外为了方便我们使用 [H2](http://www.h2database.com/html/features.html#database_url) 数据库

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```

`application.yml` 配置

```yaml
logging:
  level:
    org.springframework.security: debug
    org.springframework.jdbc.core: debug

spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:f-core-test
    username: root
    password: 123456
  h2:
    console:
      enabled: true
```

`SpringSecurityConfig` 

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    private final ObjectMapper objectMapper;
    private final DataSource dataSource;

    @Override
    public void configure(WebSecurity web) throws Exception {
        //不拦截h2控制台界面
        web.ignoring().antMatchers("/login.html", "/css/**","/h2-console/**");
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.jdbcAuthentication()
                //使用默认的表结构
                .withDefaultSchema()
                //设置数据连接池
                .dataSource(dataSource)
                //设置密码编码器
                .passwordEncoder(passwordEncoder())
                .withUser("admin")
                .password(passwordEncoder().encode("123456"))
                .roles("ADMIN");
    }

    //... 其余代码和之前一样
}
```