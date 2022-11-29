# Spring Security定制化



## 定制化数据库

上节在学习使用 `jdbcAuthentication` 的时候，我们使用的是security默认表结构，它这个表结构很简单，通常不满足开发时的需求。

```java
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
```

默认的会生成 `users` 和 `authorities` 两张表，结构如下图所示：

![截图_选择区域_20221128093322](https://cdn.tencentfs.clboy.cn/images/2022/20221129135200108.png)



`jdbcAuthentication` 有这样两个方法供我们自定义 **根据用户名查询用户信息** ，**根据用户名查询用户权限** 的sql语句

```java
auth.jdbcAuthentication()
        //设置用于通过用户名查找用户权限的查询。例如：select username,authority from authorities where username = ?
        .authoritiesByUsernameQuery("sql")
        //设置用于通过用户名查找用户的查询。例如：select username,password,enabled from users where username = ?
        .usersByUsernameQuery("sql")
```

那么我们就可以自定义自己的表结构，然后配置sql查询语句即可

在 resources 目录下创建 *schema.sql* 和 *data.sql* 让springboot启动时为我们自动执行创建表结构和初始数据

`schema.sql`

```sql
CREATE TABLE sys_user
(
    `user_id`       int         NOT NULL AUTO_INCREMENT COMMENT '用户id',
    `username`      varchar(30) NOT NULL COMMENT '用户名',
    `nickname`      varchar(50) NOT NULL COMMENT '昵称',
    `avatar`        varchar(300) NULL COMMENT '头像地址',
    `password`      varchar(100) NOT NULL COMMENT '密码',
    `enable_status` tinyint(1) NOT NULL COMMENT '0：禁用，1：启用',
    `create_time`   datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `sys_user_username_unique` UNIQUE (`username`)
);
CREATE TABLE `sys_permission`
(
    `permission_id` int         NOT NULL AUTO_INCREMENT COMMENT '权限id',
    `code`          varchar(30) NOT NULL COMMENT '权限代码',
    `name`          varchar(80) NULL COMMENT '权限名称',
    PRIMARY KEY (`permission_id`),
    CONSTRAINT `sys_permission_code_unique` UNIQUE (`code`)
);
CREATE TABLE `sys_user_permission`
(
    `user_id`       int NOT NULL COMMENT '用户id',
    `permission_id` int NOT NULL COMMENT '权限id',
    PRIMARY KEY (`user_id`, `permission_id`)
);
```

`data.sql`

```sql
-- 用户数据
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`) VALUES (1, 'admin', '管理员', 'https://api.multiavatar.com/admin.png', '$2a$10$qWs6sNQqEbmh4vW6S2qq7eZEGtoSF2DUn4GKHTEt7vFdtu7yIAj4C', 1, '2022-11-28 03:28:36', '2022-11-28 03:28:36');
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`) VALUES (2, 'clboy', '云梦', 'https://api.multiavatar.com/clboy.png', '$2a$10$TTixpKcF/KAf9raq7UH7ZutVxQQONs9lZtHKaebDyhIcNsf4KSXum', 1, '2022-11-28 03:29:54', '2022-11-28 03:29:54');
INSERT INTO `sys_user` (`user_id`, `username`, `nickname`, `avatar`, `password`, `enable_status`, `create_time`, `update_time`) VALUES (3, 'guest', '游客', 'https://api.multiavatar.com/guest.png', '$2a$10$NqCXJfIfuMcqCoqwiedd.uZnk.JNSvPTRyzIusD/S1kEtuXoR84vy', 0, '2022-11-28 03:30:36', '2022-11-28 03:30:36');
-- 权限数据
INSERT INTO `sys_permission` (`permission_id`, `code`, `name`) VALUES (1, 'DELETE_USER', '删除用户');
INSERT INTO `sys_permission` (`permission_id`, `code`, `name`) VALUES (2, 'ADD_USER', '新增用户');
INSERT INTO `sys_permission` (`permission_id`, `code`, `name`) VALUES (3, 'UPDATE_USER', '更新用户');
INSERT INTO `sys_permission` (`permission_id`, `code`, `name`) VALUES (4, 'VIEW_USER', '查询用户');
-- 用户权限数据
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (1, 1);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (1, 2);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (1, 3);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (1, 4);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (2, 2);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (2, 3);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (2, 4);
INSERT INTO `sys_user_permission` (`user_id`, `permission_id`) VALUES (3, 4);
```

然后在配置 `jdbcAuthentication` 时自定义sql

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.jdbcAuthentication()
            .usersByUsernameQuery("SELECT username,password,enable_status AS enabled FROM sys_user WHERE username = ?")
            .authoritiesByUsernameQuery("SELECT su.username,sp.`code` FROM sys_user_permission sup INNER JOIN sys_permission sp ON sup.permission_id=sp.permission_id INNER JOIN sys_user su ON sup.user_id=su.user_id WHERE su.username = ?")
            //设置数据连接池
            .dataSource(dataSource)
            //设置密码编码器
            .passwordEncoder(passwordEncoder());
}
```

一切准备就绪，重启程序后测试

```http
### 登录-json响应格式
POST  http://localhost:8080/auth
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456
```

响应中 `principal` 字段部分

```json
"principal": {
  "password": null,
  "username": "admin",
  "authorities": [
    {
      "authority": "ADD_USER"
    },
    {
      "authority": "DELETE_USER"
    },
    {
      "authority": "UPDATE_USER"
    },
    {
      "authority": "VIEW_USER"
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

测试被禁用的用户

```http
### 登录-json响应格式
POST  http://localhost:8080/auth
Content-Type: application/x-www-form-urlencoded

username=guest&password=123456
```

```json
{
  "code": "0",
  "msg": "User is disabled"
}
```

## 定制化UserDetailsService

使用自带的 `jdbcAuthentication` 还是有一定的局限性，比如我想认证成功之后响应更多的信息，对权限查询sql进行优化，使用mybatis或jpa操作数据库等等

### 依赖和配置

接下来我们将 `spring-boot-starter-jdbc` 的maven依赖更换为jpa

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
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>
</dependencies>
```

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
```

### Entity和Dao

```java
/**
 * 系统用户
 */
@Data
@Entity
public class SysUser {

    @Id
    private Integer userId;
    private String username;
    private String nickname;
    private String avatar;
    private String password;
    private Boolean enableStatus;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "sys_user_permission",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<SysPermission> permissions = new HashSet<>();
}


/**
 * 系统权限
 */
@Data
@Entity
public class SysPermission {

    @Id
    private Integer permissionId;
    private String code;
    private String name;
}


/**
 * 用户dao
 */
@Repository
public interface SysUserRepo extends JpaRepository<SysUser, Integer> {

    /**
     * 根据用户名查找
     */
    Optional<SysUser> findByUsername(String username);
}
```



### 自定义UserDetails

```java
public class CustomUser extends User {

    @Getter
    private final Integer userId;
    @Getter
    private final String nickname;
    @Getter
    private final String avatar;
    @Getter
    private final LocalDateTime createTime;
    @Getter
    private final LocalDateTime updateTime;

    public CustomUser(SysUser user) {
        super(user.getUsername(), user.getPassword(), user.getEnableStatus(), true, true, true,
                user.getPermissions().stream().map(perm -> new SimpleGrantedAuthority(perm.getCode())).collect(Collectors.toSet()));
        this.userId = user.getUserId();
        this.nickname = user.getNickname();
        this.avatar = user.getAvatar();
        this.createTime = user.getCreateTime();
        this.updateTime = user.getUpdateTime();
    }
}
```



### 自定义UserDetailsService

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final SysUserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<SysUser> optional = userRepo.findByUsername(username);
        return optional.map(CustomUser::new)
                .orElseThrow(() -> new UsernameNotFoundException("未查找到用户名为 " + username + " 的用户"));
    }
}
```



### Security配置

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    private final ObjectMapper objectMapper;
    
    /**
     * 注入自定义的userDetailsService
     */
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }
    
    //... 其他配置无变动
}
```

到这里定制化UserDetailsService的配置都完成了，启动项目测试

```http
### 登录-json响应格式
POST  http://localhost:8080/auth
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456
```

可以看到响应中 *principal* 字段已经有了我们扩展的 字段

```json
"principal": {
      "password": null,
      "username": "admin",
      "authorities": [
        {
          "authority": "ADD_USER"
        },
        {
          "authority": "DELETE_USER"
        },
        {
          "authority": "UPDATE_USER"
        },
        {
          "authority": "VIEW_USER"
        }
      ],
      "accountNonExpired": true,
      "accountNonLocked": true,
      "credentialsNonExpired": true,
      "enabled": true,
      "userId": 1,
      "nickname": "管理员",
      "avatar": "https://api.multiavatar.com/admin.png",
      "createTime": "2022-11-28T03:28:36",
      "updateTime": "2022-11-28T03:28:36"
}
```

这里 `password` 字段返回 null 是因为我们继承的spring security提供的User类实现了 `CredentialsContainer` 接口

```java
package org.springframework.security.core;

/**
 * 指示实现对象包含敏感数据，可以使用eraseCredentials方法擦除这些数据。
 * 如果实现类中的某些属性也实现该接口，实现类应该在eraseCredentials方法中也调用这些属性的eraseCredentials方法
 * 仅供内部框架使用。
 * 如果你使用自己的AuthenticationProvider，你应该返回一个已经除去敏感数据的Authentication，而不是使用此接口
 */
public interface CredentialsContainer {
   void eraseCredentials();
}

/**
 * User类中的实现
 */
@Override
public void eraseCredentials() {
	this.password = null;
}
```

也就是说spring security在认证完成之后会调用该方法将 `password` 置位 null

### UserDetailsPasswordService

在 **密码和编码器** 章节有提到过密码升级，当时使用的是 `inMemoryAuthentication` 

接下来，看一下换成数据库后的逻辑

现在数据库中的三条数据密码都是使用 *BCrypt* 加密的，我们再插入一条md5加密的用户

```sql
INSERT INTO `sys_user` (`username`, `nickname`, `avatar`, `password`, `enable_status`) VALUES ('early', '早期用户', 'https://api.multiavatar.com/early.png',
'{md5}{IzI/WXZfdzgh9RYkAFXD8U3M6Hou32u2Kb0woXqksBc=}e2b5816dc4fa17a92c8efe07e98c988f', 1);
```

现在数据库中的数据

![image-20221129105221269](https://cdn.tencentfs.clboy.cn/images/2022/20221129135148480.png)

首先需要给密码编码器配置为 `DelegatingPasswordEncoder`

```java
@Bean
public PasswordEncoder passwordEncoder() {
    Map<String, PasswordEncoder> passwordEncoderMap = CollectionUtils.newHashMap(2);
    String idForEncode = "bcrypt";
    BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    passwordEncoderMap.put(idForEncode, bCryptPasswordEncoder);
    passwordEncoderMap.put("md5", new MessageDigestPasswordEncoder("MD5"));
    DelegatingPasswordEncoder passwordEncoder = new DelegatingPasswordEncoder(idForEncode, passwordEncoderMap);
    passwordEncoder.setDefaultPasswordEncoderForMatches(bCryptPasswordEncoder);
    return passwordEncoder;
}
```

自定义的 `UserDetailsPasswordService`

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsPasswordService implements UserDetailsPasswordService {

    private final SysUserRepo userRepo;

    @Override
    public UserDetails updatePassword(UserDetails user, String newPassword) {
        Optional<SysUser> optional = userRepo.findByUsername(user.getUsername());
        return optional.map(u -> {
            u.setPassword(newPassword);
            userRepo.save(u);
            UserDetails userDetails = new CustomUser(u);
            return userDetails;
        }).orElse(user);
    }
}
```

配置 userDetailsPasswordService

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
    private final ObjectMapper objectMapper;

    /**
     * 注入自定义的userDetailsService
     */
    private final CustomUserDetailsService userDetailsService;
    private final CustomUserDetailsPasswordService userDetailsPasswordService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder())
                .userDetailsPasswordManager(userDetailsPasswordService);
    }
    
    //...
}
```

在下一次登录成功后，security就会自动将密码升级为 *BCrypt* 。对用户来说是无感的

![image-20221129110545666](https://cdn.tencentfs.clboy.cn/images/2022/20221129135137750.png)
