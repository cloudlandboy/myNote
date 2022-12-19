# 多因子认证

> 多重要素验证（英语：Multi-factor authentication，缩写为 MFA），又译多因子认证、多因素验证、多因素认证
>
> 多因子认证是用两种及两种以上的条件对用户进行认证的方法。通常将口令和实物（如U盾、密码器、手机短消息、指纹等）结合起来，以有效提升安全性

单纯的用户名/密码登录在某些时候还是不够安全，因为大部分用户会在各种平台采用同样的密码

只要有一个平台发生泄漏，那么很可能会影响其他平台。

所以增加一步或多步验证成了目前较流行的方案

双因子验证（Two-Factor Authentication）是多因子验证（Multi-Factor Authentication）的一种形式



## 基于时间的一次性密码(TOTP)

> Time-Based One-Time Password
>
> 基于时间的一次性密码( TOTP ) 是一种计算机算法，可生成使用当前时间作为唯一性来源的一次性密码(OTP)。作为[基于 HMAC 的一次性密码算法](https://en.wikipedia.org/wiki/HMAC-based_one-time_password_algorithm)(HOTP) 的扩展
>
> TOTP被用于许多双因素身份验证(2FA) 系统

TOTP两个重要的点就是 *一次性* 和 *时间性*

### 一次性

在多步验证中，通常在第二步会采用随机密码，这个密码一般情况下是一个一次性密码，也就是验证成功后就抛弃掉了，不允许进行多次使用同一个密码进行验证。但这存在一个问题，如果一直输入错误的验证码，服务端的随机密码一直存在。这等于给了恶意用户一个不断尝试的机会。

### 时间性

这个一次性验证码是有时效期的。而且在有效期内，这个密码的生成应该一致的。这就是基于于时间的一次性密码。它是用一种以当前时间作为输入的算法生成的。



## maven依赖

> java-otp 是一个用于生成 HOTP 或 TOTP 一次性密码的java库
>
> 开源地址：https://github.com/jchambers/java-otp

```xml
<dependency>
    <groupId>com.eatthepath</groupId>
    <artifactId>java-otp</artifactId>
    <version>0.4.0</version>
</dependency>
```



## 工具类

```java
public class TotpHelper {

    private final TimeBasedOneTimePasswordGenerator totpGenerator;

    /**
     * 默认使用sha1格式密钥，30秒有效期，6位长度密码
     */
    public TotpHelper() {
        this(new TimeBasedOneTimePasswordGenerator());
    }


    /**
     * 默认使用sha1格式密钥
     *
     * @param timeStep       一次性密码的时长
     * @param passwordLength 一次性密码的长度
     */
    public TotpHelper(Duration timeStep, int passwordLength) {
        this(new TimeBasedOneTimePasswordGenerator(timeStep, passwordLength));
    }

    /**
     * 使用传入的TimeBasedOneTimePasswordGenerator
     *
     * @param generator TimeBasedOneTimePasswordGenerator
     */
    public TotpHelper(TimeBasedOneTimePasswordGenerator generator) {
        this.totpGenerator = generator;
    }


    /**
     * 创建TOTP，使用当前时间戳
     *
     * @param base64Key base64格式密钥
     * @return {@code String }
     */
    public String createTotp(String base64Key) {
        return createTotp(decodeBase64ToKey(base64Key));
    }

    /**
     * 创建TOTP，使用当前时间戳
     *
     * @param key 密钥
     * @return {@code String }
     */
    public String createTotp(Key key) {
        return createTotp(key, Instant.now());
    }

    /**
     * 创建TOTP，使用指定时间戳
     *
     * @param key     关键
     * @param instant 即时
     * @return {@code String }
     */
    public String createTotp(Key key, Instant instant) {
        try {
            return totpGenerator.generateOneTimePasswordString(key, instant);
        } catch (InvalidKeyException e) {
            throw new RuntimeException("生成验证码的密钥不合法");
        }
    }

    /**
     * 验证密码是否匹配
     *
     * @param base64Key base64格式密钥
     * @param input     输入密码
     * @return boolean 是否匹配
     */
    public boolean matchPassword(String base64Key, String input) {
        return matchPassword(decodeBase64ToKey(base64Key), input);
    }


    /**
     * 验证密码是否匹配
     *
     * @param key   密钥
     * @param input 输入密码
     * @return boolean 是否匹配
     */
    public boolean matchPassword(Key key, String input) {
        return matchPassword(key, input, Instant.now());
    }

    /**
     * 验证密码是否匹配
     *
     * @param key     密钥
     * @param input   输入密码
     * @param instant 时间戳
     * @return boolean 是否匹配
     */
    public boolean matchPassword(Key key, String input, Instant instant) {
        return Objects.equals(input, createTotp(key, instant));
    }

    /**
     * 生成随机密钥
     *
     * @return {@code Key }
     */
    public Key generatorKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(totpGenerator.getAlgorithm());
            int macLengthInBytes = Mac.getInstance(totpGenerator.getAlgorithm()).getMacLength();
            keyGenerator.init(macLengthInBytes * 8);
            return keyGenerator.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * 生成随机密钥使用base64编码为字符串
     *
     * @return {@code String }
     */
    public String generatorKeyToString() {
        return Base64.getEncoder().encodeToString(this.generatorKey().getEncoded());
    }

    /**
     * 解码base64字符串为key
     *
     * @param base64 base64
     * @return {@code Key }
     */
    public Key decodeBase64ToKey(String base64) {
        return new SecretKeySpec(Base64.getDecoder().decode(base64), totpGenerator.getAlgorithm());
    }
}
```



## 生成和验证密码测试

```java
class TotpHelperTest {

    @Test
    void createTOTP_Test() throws Exception {
        TotpHelper totpHelper = new TotpHelper();
        Key secretKey = totpHelper.generatorKey();
        Instant now = Instant.now();
        System.out.println("当前时间戳：" + now.toEpochMilli());
        String password = totpHelper.createTotp(secretKey);
        System.out.println("生成的验证码：" + password);
        System.out.println("匹配结果：" + totpHelper.matchPassword(secretKey, password));

        //等待5秒验证
        TimeUnit.SECONDS.sleep(5);
        now = Instant.now();
        System.out.println("当前时间戳：" + now.toEpochMilli());
        System.out.println("生成的验证码：" + totpHelper.createTotp(secretKey));
        System.out.println("匹配结果：" + totpHelper.matchPassword(secretKey, password));

        //等待25秒再验证(30秒后过期)
        TimeUnit.SECONDS.sleep(25);
        now = Instant.now();
        System.out.println("当前时间戳：" + now.toEpochMilli());
        System.out.println("生成的验证码：" + totpHelper.createTotp(secretKey));
        System.out.println("匹配结果：" + totpHelper.matchPassword(secretKey, password));
    }

    /**
     * 在时效内生成的密码都相同，大概是怎么实现的
     * 就是拿当前时间戳和时效的毫秒数进行相除取商
     * 看一下在时效内相除后的商前8位是不是相同的(有概率不一样)，然后使用前8位加上密钥进行hash运算
     * 时长作为余数，因此也不能设置过大，通常都是30秒或者60秒
     */
    @Test
    public void timeStep_same_pwd_impl_test() throws Exception {
        Instant now = Instant.now();
        long timeStamp = now.toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));

        //等待5秒再生成
        TimeUnit.SECONDS.sleep(5);
        timeStamp = Instant.now().toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));
        //等待25秒再生成(30秒后过期)
        TimeUnit.SECONDS.sleep(25);
        timeStamp = Instant.now().toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));
    }
}
```



## 生成密码的基本原理

```java
    /**
     * 在时效内生成的密码都相同，大概是怎么实现的
     * 就是拿当前时间戳和时效的毫秒数进行相除取商
     * 看一下在时效内相除后的商前8位是不是相同的(有概率不一样)，然后使用前8位加上密钥进行hash运算
     * 时长作为余数，因此也不能设置过大，通常都是30秒或者60秒
     */
    @Test
    public void timeStep_same_pwd_impl_test() throws Exception {
        Instant now = Instant.now();
        long timeStamp = now.toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));

        //等待5秒再生成
        TimeUnit.SECONDS.sleep(5);
        timeStamp = Instant.now().toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));
        //等待25秒再生成(30秒后过期)
        TimeUnit.SECONDS.sleep(25);
        timeStamp = Instant.now().toEpochMilli();
        System.out.println("当前时间戳：" + timeStamp);
        System.out.println("除去时长的余数：" + timeStamp / TimeUnit.SECONDS.toMillis(30));
    }
}
```



## 用户登录二次认证流程

### 系统设计准备

1. 首先，我们需要在用户的表中存放一个密钥(生成totp时的key，每个用户应该有单独的密钥)：`mfa_key`
2. 我们可以将是否需要进行二次验证的主动权放到用户手中，在用户表中再添加 `using_mfa` 字段来标识。或者在用户异地登录的时候要求二次登录（这个可以根据ip去判断）。

### 认证流程

1. 用户发送登录请求到服务端，服务端查询出用户的基本信息，判断是否需要二次验证，不需要二次验证执行正常的认证流程即可

2. 拿到用户的 `mfa_key` 生成TOTP

3. 通过短信或邮件的方式将TOTP密码发送到用户手上。*ps：这里只是为了演示*

   

   ?> 理论上来说TOTP的时效只有几十秒的时长，如果通过通讯的方式将TOTP密码发送到用户手机上，大多数情况下都是还没来得及输入就已经失效了。像QQ令牌那种，都是要求用户在手机上安装QQ安全中心app，当用户在app端登录成功后，服务器会将 `mfa_key` 颁发到app端。然后在本地实时创建和更新TOTP密码，提交的时候服务端再使用相同的 `mfa_key` 创建TOTP密码验证和客户端的是否一致(客户端和服务端的时间都应该是正确的网络时间)。像短信验证码那种有好几分钟的时长，直接生成一个随机数放到redis中就行了，不需要用TOTP，其他逻辑和接下来讲的相同(好像可以说接下来要讲的和TOTP并没什么太大的关系)。这两种实际使用场景是不一样的，不要搞混了

   

4. 登录接口响应给前端，告诉它需要进行二次验证
   - 返回的状态码和认证失败一样是 `401`
   - 为了和普通认证失败区分开来，可以学习Basic认证在响应中加上一个自定义响应头 `X-Authenticate:mfa,realm=<请求Id>` 。当然你也可以在响应中通过响应体数据去告诉前端。
   - 请求Id：在第一步用户名密码验证时，服务端已经查询到了用户信息，这时就可以生成一个请求id放到redis中，值为用户信息。这样二次验证就不需要再次传入用户名密码了，而且更加安全

5. 前端让用户填写TOTP密码后，携带密码和请求id再次进行认证。可以学习Basic认证

   将这个参数放到请求头中 `Authorization: Mfa Base64(请求id:TOTP密码)`

**SysUser实体类**

```java
@Data
@Entity
public class SysUser {

    @Id
    private Integer userId;
    private String username;
    private String nickname;
    private String avatar;
    private String password;
    
    // ... 添加以下字段，需要在data.sql初始化数据时初始化这些字段
    private String mobile;
    private String email;
    private String mfaKey;
    private Boolean usingMfa;
    
    //... 省略其他
    
}
```

`data.sql`

```sql
CREATE TABLE sys_user
(
    `user_id`       int          NOT NULL AUTO_INCREMENT COMMENT '用户id',
    `username`      varchar(30)  NOT NULL COMMENT '用户名',
    `nickname`      varchar(50)  NOT NULL COMMENT '昵称',
    `avatar`        varchar(300) NULL COMMENT '头像地址',
    `password`      varchar(100) NOT NULL COMMENT '密码',
    `mobile`        varchar(20)  NOT NULL COMMENT '手机号',
    `email`         varchar(80)  NOT NULL COMMENT '邮箱',
    `mfa_key`       varchar(80) COMMENT '生成totp的密钥',
    `using_mfa`     tinyint(1) COMMENT '是否使用二次验证',
    `enable_status` tinyint(1)   NOT NULL COMMENT '0：禁用，1：启用',
    `create_time`   datetime     NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   datetime     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `sys_user_username_unique` UNIQUE (`username`)
);
```

`schema.sql` 邮箱可以在网站找临时邮箱网站进行测试：https://www.linshiyouxiang.net/change

```sql
-- 用户数据
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`,`mobile`,`email`,`using_mfa`) VALUES (1, 'admin', '管理员', 'https://api.multiavatar.com/admin.png', '$2a$10$qWs6sNQqEbmh4vW6S2qq7eZEGtoSF2DUn4GKHTEt7vFdtu7yIAj4C', 1, '2022-11-28 03:28:36', '2022-11-28 03:28:36','12345678911','kgdmw7us@idrrate.com',1);
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`,`mobile`,`email`,`using_mfa`) VALUES (2, 'clboy', '云梦', 'https://api.multiavatar.com/clboy.png', '$2a$10$TTixpKcF/KAf9raq7UH7ZutVxQQONs9lZtHKaebDyhIcNsf4KSXum', 1, '2022-11-28 03:29:54', '2022-11-28 03:29:54','12345678912','g7312ed@idrrate.com',1);
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`,`mobile`,`email`,`using_mfa`) VALUES (3, 'guest', '游客', 'https://api.multiavatar.com/guest.png', '$2a$10$NqCXJfIfuMcqCoqwiedd.uZnk.JNSvPTRyzIusD/S1kEtuXoR84vy', 0, '2022-11-28 03:30:36', '2022-11-28 03:30:36','12345678913','yfcass42@idrrate.com',0);
```

### 发送短信和邮件封装

> 这里我没有实现真实的发送短信场景，而是直接在控制台打印。可以参考华为云、阿里云、腾讯云等平台的文档和SDK自己实现
>
> 我们主要使用邮件作通知方式

#### 短信

```java
/**
 * 短信客户端
 */
public interface SmsClient {

    /**
     * 发送消息
     *
     * @param smsMessage 短信消息
     */
    void sendMessage(SmsMessageDTO smsMessage);
}

@Data
public class SmsMessageDTO {

    /**
     * 消息接收者手机号
     */
    private String receiverMobile;

    /**
     * 消息内容
     */
    private String messageContent;
}

/**
 * 控制台日志短信客户端
 */
@Slf4j
@Component
public class ConsoleLogSmsClientImpl implements SmsClient {

    @Override
    public void sendMessage(SmsMessageDTO smsMessage) {
        log.info("发送短信给【{}】，短信内容：{}", smsMessage.getReceiverMobile(), smsMessage.getMessageContent());
    }
}
```



#### 邮件

**maven依赖** 

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

```java
/**
 * 电子邮件客户端
 */
public interface EmailClient {

    /**
     * 发送消息
     *
     * @param emailMessage 电子邮件消息
     */
    void sendMessage(EmailMessageDTO emailMessage);
}


@Data
public class EmailMessageDTO {

    /**
     * 消息接收者邮箱
     */
    private String receiverEmail;

    /**
     * 主题
     */
    private String subject;

    /**
     * 消息内容
     */
    private String messageContent;
}

/**
 * spring电子邮件客户端
 */
@Component
@AllArgsConstructor
public class SpringEmailClientImpl implements EmailClient {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    @Override
    public void sendMessage(EmailMessageDTO emailMessage) {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        simpleMailMessage.setFrom(mailProperties.getUsername());
        simpleMailMessage.setTo(emailMessage.getReceiverEmail());
        simpleMailMessage.setSubject(emailMessage.getSubject());
        simpleMailMessage.setText(emailMessage.getMessageContent());
        mailSender.send(simpleMailMessage);
    }
}
```



#### 测试

```java
@SpringBootTest
class TotpHelperTest {

    @Autowired
    private SmsClient smsClient;
    @Autowired
    private EmailClient emailClient;

    @Test
    public void email_send_test() throws Exception {
        EmailMessageDTO emailMessage = new EmailMessageDTO();
        emailMessage.setReceiverEmail("kgdmw7us@justdefinition.com");
        emailMessage.setSubject("二次验证密码");
        TotpHelper totpHelper = new TotpHelper();
        String password = totpHelper.createTotp(totpHelper.generatorKey());
        emailMessage.setMessageContent("您的二次验证密码为：<b>" + password + "</b>");
        emailClient.sendMessage(emailMessage);
    }

    @Test
    public void sms_send_test() throws Exception {
        SmsMessageDTO smsMessage = new SmsMessageDTO();
        smsMessage.setReceiverMobile("12345678999");
        TotpHelper totpHelper = new TotpHelper();
        String password = totpHelper.createTotp(totpHelper.generatorKey());
        smsMessage.setMessageContent("您的二次验证密码为：" + password);
        smsClient.sendMessage(smsMessage);
    }
}
```



## 认证流程代码实现

通过上面的认证流程，我们知道第一步认证是验证用户名密码及账户状态等是否正确，只有这些都通过的情况下才有必要进行下一步是否需要二次验证的判断。

第一步这些验证就交给spring security去做，我们只需要在它验证完成之后判断用户是不是需要二次认证

如果需要二次验证就先不返回token，而是创建请求id，然后将请求id和用户信息放到redis缓存中，同时创建TOTP密码发送给用户。最后响应     *401* 状态码，和 *自定义响应头* 给客户端

那么，该如何在spring security的用户名密码验证通过后插入这些逻辑呢？

在 `UserDetailsService` 中判断。这样不太可行，这里仅仅是从数据库查出来用户，还没有进行密码，状态等验证。在这里就去判断是否需要二次验证的话，很明显步骤不符合逻辑

```java
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //1.查询用户
        //2.if(用户.usingMfa){throw RequireMfaException("需要进行二次认证")}
        return new CustomUser(null);
    }
}
```



那么就应该找到spring security验证完密码及状态的那一段逻辑代码，然后在那之后插入这段逻辑。还记得在之前的章节中又学习过security的 [认证流程和源码解析](http://note.clboy.cn:3000/#/java/spring_security/authentication_process?id=认证流程和源码解析) 。在学习这章的时候有讲到security调用  `UserDetailsService.loadUserByUsername` 方法和验证密码及用户状态的逻辑都是在 `DaoAuthenticationProvider` 中完成的。而且它这里提供了，密码及基本状态检查完之后的后置检查接口

 ![image-20221218183846658](https://cdn.tencentfs.clboy.cn/images/2022/20221219171647202.png)



### PostAuthenticationChecks

他这里默认是去检查凭证是否过期，对外提供了 `setPostAuthenticationChecks` 的方法。那么我们就可以改为是否需要二次验证的逻辑

```java
public abstract class AbstractUserDetailsAuthenticationProvider {
    
    private UserDetailsChecker postAuthenticationChecks = new DefaultPostAuthenticationChecks();
    
    private class DefaultPostAuthenticationChecks implements UserDetailsChecker {
        @Override
        public void check(UserDetails user) {
            if (!user.isCredentialsNonExpired()) {
                //如果凭证过期，打印日志，并抛出异常
            }
        }
    }
}
```

```java
public class UsingMfaUserDetailsChecker implements UserDetailsChecker {

    @Override
    public void check(UserDetails userDetails) {
        if (!(userDetails instanceof CustomUser)) {
            return;
        }
        CustomUser user = (CustomUser) userDetails;
        if (Boolean.TRUE.equals(user.getUsingMfa())) {
            //抛出自定义的异常
            throw new RequireMfaException("需要进行二次认证", userDetails);
        }
    }
}
```



### 自定义异常

在spring security中，认证相关的异常都应该是 `AuthenticationException` 的子类型，不然不会被security捕获

```java
/**
 * 该异常用于标识需要进行二次认证
 */
public class RequireMfaException extends AuthenticationException {

    @Getter
    private final UserDetails userDetails;

    public RequireMfaException(String msg, UserDetails userDetails) {
        super(msg, null);
        this.userDetails = userDetails;
    }
}
```



### UserDetails改造

在认证的时候我们是从数据库查询到用户信息，封装为 `UserDetails` 类型返回给security的，后续的整个认证过程中都是对 `UserDetails` 进行认证。所以，需要将mfa相关的字段值也设置到其中，不然后续获取不到，总不能再去数据库查询吧

```java
public class CustomUser extends User {

    @Getter
    private final Integer userId;
    
    // ... 省略其他字段
    
    @Getter
    private final Boolean usingMfa;
    
    @Getter
    private final String mobile;

    @Getter
    private final String email;

    @Getter
    private final String mfaKey;


    public CustomUser(SysUser user) {
        
        // ... 省略其他代码
        
        this.usingMfa = user.getUsingMfa();
        this.mobile = user.getMobile();
        this.email = user.getEmail();
        this.mfaKey = user.getMfaKey();
    }
}
```



### security配置认证Provider

之前我们是配置的 `userDetailsService`，由spring security内部给创建的 `DaoAuthenticationProvider`。这种配置没有提供设置

 `PostAuthenticationChecks` 的方法，我们改为自己直接设置 **DaoAuthenticationProvider**

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {

    // ... 省略其他代码

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //auth.userDetailsService(userDetailsService)
        //        .passwordEncoder(passwordEncoder())
        //        .userDetailsPasswordManager(userDetailsPasswordService);

        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        authenticationProvider.setUserDetailsPasswordService(userDetailsPasswordService);
        authenticationProvider.setPostAuthenticationChecks(new UsingMfaUserDetailsChecker());
        auth.authenticationProvider(authenticationProvider);
    }
}
```



### 异常处理并响应



1. 添加整合redis的maven依赖

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   ```

2. 配置TotpHelper和RedisTemplate，将key改为string序列化，默认key和value都是 jdk序列化

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
   
       @Bean
       public TotpHelper totpHelper() {
           return new TotpHelper(Duration.ofSeconds(60), 6);
       }
   
       @Bean
       public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
           RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
           redisTemplate.setConnectionFactory(redisConnectionFactory);
           redisTemplate.setKeySerializer(RedisSerializer.string());
           redisTemplate.setHashKeySerializer(RedisSerializer.string());
           return redisTemplate;
       }
   
   }
   ```

3. 修改security配置类中登录失败处理器逻辑

   ```java
   @AllArgsConstructor
   @EnableWebSecurity(debug = true)
   public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
   
       private final RedisTemplate<String, Object> redisTemplate;
       
       // ... 省略其他代码
   
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
   
               //对RequireMfaException类型异常特殊处理
               if (ex instanceof RequireMfaException) {
                   RequireMfaException exception = (RequireMfaException) ex;
                   CustomUser user = (CustomUser) exception.getUserDetails();
                   //1. 生成请求id
                   String requestId = UUID.randomUUID().toString().replace("-", "");
   
                   //2. 将请求id和用户信息放入redis缓存，并设置过期时间。
                   redisTemplate.opsForValue()
                       .set("user_mfa_request:" + requestId, user,Duration.ofMinutes(15));
   
                   //3. 添加标识二次认证的请求头
                   res.addHeader("X-Authenticate", "mfa,realm=" + requestId);
               }
   
               res.getWriter().write(objectMapper.writeValueAsString(result));
           };
       }
   }
   ```



### 发送密码接口

前端在收到上一步认证接口的响应后，根据错误码和是否包含响应头来判断需不需要二次验证。如果需要，应该引导用户进行密码的发送，页面应该有发送方式的选项和按钮，用户选择完成，提交到后端进行TOTP密码的创建和发送。后端接口：

```java
/**
 * 发送方式枚举
 */
@Getter
public enum SendWayEnum {

    /**
     * 短信
     */
    SMS,

    /**
     * 电子邮件
     */
    EMAIL;
}


/**
 * 发送TOTP密码dto
 */
@Data
public class SendTotpPasswordDTO {

    /**
     * 请求id
     */
    @NotBlank(message = "requestId不能为空")
    private String requestId;

    /**
     * 发送方式
     */
    @NotNull(message = "发送方式不能为空")
    private SendWayEnum sendWay;
}

/**
 * 授权控制器
 * 我这里为了方便演示，所有代码都写在了controller里
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/authorize")
public class AuthorizeController {

    private final SmsClient smsClient;
    private final EmailClient emailClient;

    private final SysUserRepo userRepo;
    private final TotpHelper totpHelper;
    private final RedisTemplate<String, Object> redisTemplate;


    @PostMapping("/sendTotp")
    public void sendTotpPassword(@Valid @RequestBody SendTotpPasswordDTO param) {
        String requestId = param.getRequestId();
        Object value = redisTemplate.opsForValue().get("user_mfa_request:" + requestId);
        //可以使用全局异常处理，我这里就不演示了
        Assert.notNull(value, "请求超时");
        CustomUser customUser = (CustomUser) value;
        String mfaKey = customUser.getMfaKey();
        //不存在密钥时，给用户生成并更新到数据库
        if (!StringUtils.hasText(mfaKey)) {
            SysUser user = userRepo.getById(customUser.getUserId());
            if (!StringUtils.hasText(user.getMfaKey())) {
                user.setMfaKey(totpHelper.generatorKeyToString());
                userRepo.save(user);
            }
            mfaKey = user.getMfaKey();
        }
        String password = totpHelper.createTotp(mfaKey);
        //应该采用异步的方式发送，这里就简单为了演示
        switch (param.getSendWay()) {
            case SMS:
                SmsMessageDTO smsMessage = new SmsMessageDTO();
                smsMessage.setReceiverMobile(customUser.getMobile());
                smsMessage.setMessageContent("您的二次验证密码为：" + password);
                smsClient.sendMessage(smsMessage);
                break;
            case EMAIL:
                EmailMessageDTO emailMessage = new EmailMessageDTO();
                emailMessage.setReceiverEmail(customUser.getMobile());
                emailMessage.setSubject("二次验证密码");
                emailMessage.setMessageContent("您的二次验证密码为：<b>" + password + "</b>");
                emailClient.sendMessage(emailMessage);
                break;
            default:
                throw new IllegalArgumentException("不支持的发送方式");
        }
    }
}
```

接下来别忘了将发送TOTP的接口设置到security忽略列表中

```java
@Override
public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/authorize/sendTotp", "/login.html", "/css/**", "/h2-console/**");
}
```

至此，第一步用户名密码验证、是否需要二次认证、TOTP密码的发送逻辑已经完成了，接下来就是如何进行二次认证下发token。

### 二次认证过滤器

我们可以模仿 `UsernamePasswordAuthenticationFilter` 去创建二次认证的filter，在filter里进行认证后的token颁发。当然你也可以单独写一个接口去做，并不一定要用过滤器。*ps：我选择使用过滤器的原因是想让所有登录接口的地址都统一使用一个*

对于客户端访问的是不是登录接口的判断是由其继承的抽象类 `AbstractAuthenticationProcessingFilter` 中 [doFilter](http://note.clboy.cn:3000/#/java/spring_security/authentication_process?id=usernamepasswordauthenticationfilter) 方法完成的

可以选择继承然后重写 `attemptAuthentication` 方法。主要逻辑就是判断 `Authorization` 请求头是不是 `Mfa` 认证格式，如果不是就走用户名密码验证的流程，是的话就通过 `requestId` 从缓存中获取用户信息，然后创建TOTP密码进行比对

```java
@Slf4j
@RequiredArgsConstructor
public class MfaAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final TotpHelper totpHelper;
    private final RedisTemplate<String, Object> redisTemplate;
    public static final String AUTHENTICATION_SCHEME_MFA = "Mfa";

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        if (!HttpMethod.POST.toString().equals(request.getMethod())) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }

        Optional<UsernamePasswordAuthenticationToken> optional = extractHeaderToken(request);
        if (!optional.isPresent()) {
            //没有提取到requestId和TOTP密码，交给原始父级用户名密码过滤器进行验证
            return super.attemptAuthentication(request, response);
        }
        UsernamePasswordAuthenticationToken mfaToken = optional.get();
        String cacheKey = "user_mfa_request:" + mfaToken.getPrincipal();
        Object value = redisTemplate.opsForValue().get(cacheKey);

        if (value == null) {
            throw new BadCredentialsException("凭证错误");
        }
        
        CustomUser customUser = (CustomUser) value;
        String mfaKey = customUser.getMfaKey();
        String password = totpHelper.createTotp(mfaKey);
        if (!StringUtils.hasText(mfaKey) || !Objects.equals(mfaToken.getCredentials(), password)) {
            throw new BadCredentialsException("验证码错误");
        }
        //删除请求id
        redisTemplate.delete(cacheKey);
        return new UsernamePasswordAuthenticationToken(customUser, customUser.getPassword(), customUser.getAuthorities());
    }


    /**
     * 从请求头中提取token
     *
     * @param request 请求
     * @return {@code Optional<String> }
     */
    private Optional<UsernamePasswordAuthenticationToken> extractHeaderToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.startsWithIgnoreCase(header, AUTHENTICATION_SCHEME_MFA)) {
            String base64Token = header.substring(AUTHENTICATION_SCHEME_MFA.length() + 1);
            String delimToken = new String(Base64.getDecoder().decode(base64Token));
            int delim = delimToken.indexOf(":");
            if (delim == -1) {
                return Optional.empty();
            }
            UsernamePasswordAuthenticationToken result = new UsernamePasswordAuthenticationToken(
                    delimToken.substring(0, delim), delimToken.substring(delim + 1));
            return Optional.of(result);
        }
        return Optional.empty();
    }
}
```



### 测试

```http
### 登录-获取token
POST  http://localhost:8080/auth
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456

### 发送TOTP
POST http://localhost:8080/authorize/sendTotp
Content-Type: application/json

{
  "requestId": "请求id",
  "sendWay": "SMS"
}

### 二次认证
POST  http://localhost:8080/auth
Authorization: Mfa base64编码(requestId:TOTP密码)


### 携带token访问
GET http://localhost:8080/users/principal
Authorization: Jwt 颁发的jwtToken

### 刷新token
POST http://localhost:8080/refreshToken
Authorization: Jwt 颁发的jwtRefreshToken
```



## 删除不需要的过滤器

在控制台日志中可以看到请求经过的一系列过滤器。我们使用了自定义的 `JwtFilter` 和 `MfaAuthenticationFilter`

其中 `UsernamePasswordAuthenticationFilter` 和 `RememberMeAuthenticationFilter` 其实是不需要的

用户名密码认证和二次认证都是由 `MfaAuthenticationFilter` 处理，由于使用了JWT，也不再需要记住我的功能了

```
Security filter chain: [
  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  LogoutFilter
  JwtFilter
  MfaAuthenticationFilter
  UsernamePasswordAuthenticationFilter
  BasicAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  RememberMeAuthenticationFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
]
```

在security中下面这些就不要再配置了，这样就不会生成这些filter

```java
//设置登录页路径和登录处理的接口路径
http.formLogin(form -> {
    form.loginPage("/login.html");
    form.loginProcessingUrl("/auth");
    form.successHandler(loginSuccessHandler());
    form.failureHandler(loginFailureHandler());
});

//记过我功能配置
http.rememberMe(rememberMe -> rememberMe.rememberMeParameter("auto-login"));
```