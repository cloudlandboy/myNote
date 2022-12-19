# 构建基于JWT的认证



## JWT是什么

> JWT是 Json Web Token的缩写，基于 RFC7519 标准定义
>
> 可以简单的理解为是有由json组成的token
>
> 它使用哈希算法进行加密或者RSA的公钥私钥对来进行签名保证安全性

JWT 由下面三个部分构成，中间用 `.` 作为分割符

- *Header（头部）* ：是一个 JSON 对象，描述 JWT 的元数据

  ```json
  {
    "alg": "算法名称",
    "typ": "令牌类型，JWT 令牌统一写为JWT"
  }
  ```

- *Payload（负载）* ：也是一个 JSON 对象，用来存放实际需要传递的数据，一般就是用户信息

  JWT 官方规定了7个应该包含的字段，不是硬性要求

  ```json
  {
      "iss": "签发人",
      "exp": "过期时间",
      "sub": "主题",
      "aud": "受众",
      "nbf": "生效时间",
      "iat": "签发时间",
      "jti": "JWT ID编号"
  }
  ```

  

  !> Payload默认是不加密的，任何人都可以读到，所以不要把秘密信息放在这个部分

  

- *Signature（签名）* ：该部分是由 哈希函数(*Base64URL编码(Header部分)* + *Base64URL编码(Payload部分)* + 密钥)  生成的签名



Base64(Header).Base64(Payload).Base64(Signature)

![20221209104421382](https://cdn.tencentfs.clboy.cn/images/2022/20221209104421382.png)



更加详细的介绍可以前往官网查看 [https://jwt.io/introduction](https://jwt.io/introduction)



## JWT认证流程

![20221209104432072](https://cdn.tencentfs.clboy.cn/images/2022/20221209104432072.jpg)

1. 用户发起认证请求，服务端验证用户名密码的正确性
2. 如果验证通过，服务端生成JWT Token
3. 将生成的Token响应给前端，前端需要保存起来
4. 用户发起其他需要认证通过才能访问的请求，需要在请求中携带服务端颁发的JWT Token
5. 服务端从请求中提取JWT Token，校验token的合法性
6. token合法，继续请求处理最终响应给前端



## Maven依赖

> 在java中使用 JWT Token可以使用 [jjwt](https://github.com/jwtk/jjwt) 库

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```



## JWT工具类

```java
@AllArgsConstructor
public class JwtHelper {

    private final Key accessTokenKey;


    /**
     * 创建访问令牌
     */
    public String createAccessToken(String subject) {
        return createAccessToken(subject, null);
    }

    /**
     * 创建访问令牌，包含过期时间
     */
    public String createAccessToken(String subject, Date expireDate) {
        return Jwts.builder().setSubject(subject).setExpiration(expireDate).signWith(accessTokenKey).compact();
    }

    /**
     * 解析访问令牌
     */
    public Jws<Claims> parseAccessToken(String token) throws JwtException {
        return Jwts.parserBuilder().setSigningKey(accessTokenKey).build().parseClaimsJws(token);
    }
}
```

## 测试工具类

```java
class JwtHelperTest {

    private static JwtHelper jwtHelper;

    @BeforeAll
    public static void beforeAll() {
        //随机生成的密钥
        jwtHelper = new JwtHelper(Keys.secretKeyFor(SignatureAlgorithm.HS256));
    }

    @Test
    void normal_jwt_token_test() {
        String token = jwtHelper.createAccessToken("admin");
        System.out.println("token：" + token);
        Jws<Claims> jws = jwtHelper.parseAccessToken(token);
        System.out.println("header：" + jws.getHeader());
        System.out.println("body：" + jws.getBody());
        System.out.println("signature：" + jws.getSignature());
    }

    @Test
    void illegal_jwt_token_test() {
        String token = jwtHelper.createAccessToken("admin");
        System.out.println("token：" + token);
        String[] tokenParts = token.split("\\.");
        tokenParts[1] = Encoders.BASE64URL.encode("{\"sub\":\"clboy\"}".getBytes(StandardCharsets.UTF_8));
        token = String.join(".", tokenParts);
        jwtHelper.parseAccessToken(token);
        System.out.println("--- SUCCESS ---");
    }

    static void expire_jwt_token_test() throws InterruptedException {
        long millis = TimeUnit.SECONDS.toMillis(5);
        String token = jwtHelper.createAccessToken("admin", new Date(System.currentTimeMillis() + millis));
        System.out.println("token：" + token);
        jwtHelper.parseAccessToken(token);
        System.out.println("--- SUCCESS ---");
        Thread.sleep(millis);
        jwtHelper.parseAccessToken(token);
        System.out.println("--- SUCCESS ---");
    }

    public static void main(String[] args) throws InterruptedException {
        beforeAll();
        expire_jwt_token_test();
    }
}
```



## 访问令牌和刷新令牌

在原始阶段，web网站对下次自动登录的实现是把用户的用户名和密码直接保存的浏览器里，这样很容易受到黑客攻击

还记得我们之前学习的security的 *记住我* 功能吗，security是根据规则生成一个加密的token存放到cookie中

同理，在无状态的认证逻辑中，用户认证成功后服务端会颁发一个token，后续请求都携带token访问。按理来说只要这token时效够长，不就等同于 *记住我* 功能了吗。这样当然没有问题，但是不够安全。如果这个token被黑客劫持，他就可以在这个token失效之前一直操作你的账户。

因此服务端颁发的token时效就会很短，一般在几分钟到几小时之间。但随之而来的问题就是token很快失效，就会造成用户每隔一段时间就要登录一下，体验感很不好。于是就有了新的思路

在认证成功后颁发两个token，一个叫 *访问令牌(accessToken)* ，另一个称为 *刷新令牌(refreshToken)*

- 访问令牌：时效短，几分钟到几小时之间
- 刷新令牌：时效必须比访问令牌长，一般一周到几个月之间

*刷新令牌* 的作用就是在 *访问令牌* 失效后，客户端 **携带刷新令牌请求刷新token的接口** ，服务端验证刷新令牌的正确性，验证通过后服务端会颁发新的 *访问令牌* 给客户端，同时也会生成新的 *刷新令牌* 。就是说这个刷新令牌只能够使用一次

当然你可能疑惑，刷新令牌就安全了吗？黑客同样可以劫持刷新令牌啊！！！

- 首先这个刷新令牌会在服务器存储一份，比如存放到数据库中。假设某用户的刷新令牌为 `qwer`

- 在用户的 *访问令牌* 没有失效之前，请求中是不会携带 *刷新令牌* 的，首先黑客劫持到的概率就小

- 最坏就是在 **颁发token** 或者发送 **刷新令牌请求** 时被黑客劫持，那么就会出现这种情况

  1. 黑客用你的令牌在你之前发送 **刷新请求** 到服务端，服务端颁发新的 *accessToken* 和 *refreshToken*  ，新的

     refreshToken 为 `1234` 。

  2. 这时你的请求到了服务端，但是你携带的还是旧的 *refreshToken* ： `qwer` ，与服务端的不一致，你刷新token失败，退出登录

  3. 你再次登录，登录时就会生成新的 *accessToken* 和  *refreshToken* ：`6666` 。这样就会将黑客那边的refreshToken变为旧的，无效的了。如果服务端只允许一台设备同时在线的话还会将黑客那边踢下线。即使允许多台设备在线， 由于 *accessToken* 的时间很短，也不会造成长期的影响

## 令牌如何存放



1. 放到内存中最安全，例如js中定义一个变量存储。但刷新浏览器就没了，用户还是要重新登录
2. 由服务器直接设置到cookie中，这种方式最方便，因为cookie会在发送请求时自动携带
3. 认证后，前端放到 `localStorage` 或 `sessionStorage` 中，后续发送请求时放到请求头中携带

## JWT工具类改造

我们需要考虑以下几点：

1. 首先我们在颁发token的时候要生成 accessToken 和 refreshToken两个token
2. 由于refreshToken在服务端也要存储的，随机生成UUID的都可以。但是JWT的token自带了过期时间，且可以存放很多信息。验证起来比较方便，存到数据库也不需要过多的字段
3. token的签名密钥、过期时间等设置可能会进行改动，在代码里写死太难维护

综合以上几点，我们需要创建一个配置类，这样就可以在spring配置文件中对其进行配置

### 配置属性类

```java
@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties implements InitializingBean {

    private Jwt jwt = new Jwt();

    @Override
    public void afterPropertiesSet() {
        jwt.check();
    }

    @Getter
    @Setter
    public static class Jwt {

        /**
         * 访问令牌时长，单位毫秒
         */
        private Long accessTokenExpireMillis = TimeUnit.MINUTES.toMillis(30);
        /**
         * 刷新令牌到期，单位毫秒
         */
        private Long refreshTokenExpireMillis = TimeUnit.DAYS.toMillis(7);

        /**
         * 访问令牌密钥
         */
        private Key accessTokenKey;

        /**
         * 刷新令牌密钥
         */
        private Key refreshTokenKey;

        public void setAccessTokenKey(String accessTokenKey) {
            this.accessTokenKey = Keys.hmacShaKeyFor(accessTokenKey.getBytes(StandardCharsets.UTF_8));
        }

        public void setRefreshTokenKey(String refreshTokenKey) {
            this.refreshTokenKey = Keys.hmacShaKeyFor(refreshTokenKey.getBytes(StandardCharsets.UTF_8));
        }

        void check() {
            Assert.notNull(accessTokenKey, "accessTokenKey不能为空");
            Assert.notNull(refreshTokenKey, "refreshTokenKey不能为空");
            Assert.isTrue(accessTokenExpireMillis < refreshTokenExpireMillis,
                    "refreshTokenExpireMillis必须大于accessTokenExpireMillis");
        }
    }
}
```



### yaml配置

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
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: none
    properties:
      hibernate.format_sql: true
app:
  jwt:
    access-token-key: 4cfWsnRgSPLrnOzucYfHO74SCs+qZWTBgF4UGBKwPXE=
    refresh-token-key: qnw4ExyV79t+dPm+SarntH4JisM0zXPQ+TL+MaV+0po=
```



### 改造后的工具类

```java
@AllArgsConstructor
public class JwtHelper {

    private final AppProperties.Jwt jwt;
    private final ObjectMapper objectMapper;

    /**
     * 创建访问令牌
     */
    public String createAccessToken(CustomUser userDetails) {
        return createToken(userDetails, jwt.getAccessTokenKey(), jwt.getAccessTokenExpireMillis());
    }

    /**
     * 创建刷新令牌
     */
    public String createRefreshToken(CustomUser userDetails) {
        return createToken(userDetails, jwt.getRefreshTokenKey(), jwt.getRefreshTokenExpireMillis());
    }

    /**
     * 解析访问令牌
     */
    public Optional<CustomUser> parseAccessToken(String token) {
        return parseToken(token, jwt.getAccessTokenKey());
    }

    /**
     * 解析刷新令牌
     */
    public Optional<CustomUser> parseRefreshToken(String token) {
        return parseToken(token, jwt.getRefreshTokenKey());
    }


    /**
     * 创建令牌
     */
    @SneakyThrows
    private String createToken(CustomUser userDetails, Key key, long expireInMillis) {
        //这里再转为SysUser不直接将userDetails转json是因为CustomUser没有无参构造，从json再转回对象会很麻烦
        SysUser userInfo = new SysUser();
        userInfo.setUserId(userDetails.getUserId());
        userInfo.setUsername(userDetails.getUsername());
        userInfo.setNickname(userDetails.getNickname());
        userInfo.setAvatar(userDetails.getAvatar());
        userInfo.setPassword(userDetails.getPassword());
        userInfo.setEnableStatus(userDetails.isEnabled());
        userInfo.setCreateTime(userDetails.getCreateTime());
        userInfo.setUpdateTime(userDetails.getUpdateTime());
        userInfo.setPermissions(userDetails.getAuthorities().stream().map(authority -> {
            SysPermission permission = new SysPermission();
            permission.setCode(authority.getAuthority());
            return permission;
        }).collect(Collectors.toSet()));
        return Jwts.builder()
                .setSubject(objectMapper.writeValueAsString(userInfo))
                .setExpiration(new Date(System.currentTimeMillis() + expireInMillis))
                .signWith(key)
                .compact();
    }

    /**
     * 解析令牌
     */
    @SneakyThrows
    private Optional<CustomUser> parseToken(String token, Key key) {
        try {
            Jws<Claims> jws = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            SysUser userInfo = objectMapper.readValue(jws.getBody().getSubject(), SysUser.class);
            // User 构造函数中禁止将密码传为null
            userInfo.setPassword("");
            return Optional.of(new CustomUser(userInfo));
        } catch (JwtException ex) {
            return Optional.empty();
        }
    }
}
```

### 工具类注册到容器

```java
@Configuration
@AllArgsConstructor
@EnableConfigurationProperties(AppProperties.class)
public class AppConfiguration {

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;


    @Bean
    public JwtHelper jwtHelper() {
        return new JwtHelper(appProperties.getJwt(), objectMapper);
    }

}
```



### 认证成功响应token

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthToken {
    private String accessToken;
    private String refreshToken;
}
```

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    
    //... 省略其他代码
    
    public static final Set<String> REFRESH_TOKEN_SET = new CopyOnWriteArraySet<>();
    
     /**
     * 修改登录成功处理，响应accessToken和refreshToken
     */
    private AuthenticationSuccessHandler loginSuccessHandler() {
        return (req, res, auth) -> {
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> result = CollectionUtils.newLinkedHashMap(3);
            result.put("code", "0");
            result.put("msg", "登录成功");
            AuthToken authToken = new AuthToken();
            authToken.setAccessToken(jwtHelper.createAccessToken((CustomUser) auth.getPrincipal()));
            //refreshToken应该在服务端也保存一份，在刷新token的时候除了验证token是否合法、过期外
            //  还要验证此token在服务端是否存在(目的是为了保证refreshToken只能使用一次)
            //  不然已颁发的token只要没过期就无法使其失效了
            String refreshToken = jwtHelper.createRefreshToken((CustomUser) auth.getPrincipal());
            //我们这里为了方便直接放到内存中
            REFRESH_TOKEN_SET.add(refreshToken);
            authToken.setRefreshToken(refreshToken);
            result.put("data", authToken);
            res.getWriter().write(objectMapper.writeValueAsString(result));
        };
}
```

### 验证token和刷新token的JwtFilter

> 我这里直接给刷新token的逻辑放到过滤器中处理，我觉得这样写到一起维护比较方便，当然你也可以写个controller去刷新token

```java
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtHelper jwtHelper;
    private final AuthenticationSuccessHandler successHandler;
    private final AuthenticationFailureHandler failureHandler;

    public static final String AUTHENTICATION_SCHEME_JWT = "Jwt";
    private static final AntPathRequestMatcher REFRESH_TOKEN_ANT_PATH_REQUEST_MATCHER = new AntPathRequestMatcher("/refreshToken", "POST");

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        if (REFRESH_TOKEN_ANT_PATH_REQUEST_MATCHER.matches(req)) {
            this.refreshToken(req, res);
            return;
        }

        try {
            extractHeaderToken(req)
                    .flatMap(jwtHelper::parseAccessToken)
                    .ifPresent(customUser -> {
                        Authentication authentication = this.createAuthenticationToken(customUser);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
        } catch (AuthenticationException ex) {
            SecurityContextHolder.clearContext();
        }


        chain.doFilter(req, res);
    }

    /**
     * 从请求头中提取token
     */
    private Optional<String> extractHeaderToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.startsWithIgnoreCase(header, AUTHENTICATION_SCHEME_JWT)) {
            return Optional.of(header.substring(AUTHENTICATION_SCHEME_JWT.length() + 1));
        }
        return Optional.empty();
    }

    /**
     * 刷新令牌
     */
    private void refreshToken(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        Optional<CustomUser> optional = extractHeaderToken(req)
                .filter(SpringSecurityConfig.REFRESH_TOKEN_SET::remove)
                .flatMap(jwtHelper::parseRefreshToken);
        if (optional.isPresent()) {
            successHandler.onAuthenticationSuccess(req, res, this.createAuthenticationToken(optional.get()));
        } else {
            failureHandler.onAuthenticationFailure(req, res, new BadCredentialsException("refresh token illegal"));
        }
    }

    /**
     * 创建用户名密码身份验证令牌
     */
    private UsernamePasswordAuthenticationToken createAuthenticationToken(UserDetails userDetails) {
        return new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(),
                userDetails.getAuthorities());
    }
}
```

### Security中配置JwtFilter

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {

    private final JwtHelper jwtHelper;
    private final ObjectMapper objectMapper;

    public static final Set<String> REFRESH_TOKEN_SET = new CopyOnWriteArraySet<>();
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        // ... 省略其他无改动配置
        
        //添加jwt认证过滤器
        http.addFilterBefore(new JwtFilter(jwtHelper, loginSuccessHandler(), loginFailureHandler()),
                UsernamePasswordAuthenticationFilter.class);
        // 禁用掉session，使用jwt无状态，不再需要用session存储SecurityContext
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }
    
    // ... 省略其他代码
}
```

