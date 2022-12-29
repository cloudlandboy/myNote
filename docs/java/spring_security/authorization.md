# 授权

> 认证是确认身份的过程，而授权是授予使用权限的过程。认证是为了确保只有授权的用户才能访问系统或资源，而授权是为了确定用户可以使用哪些资源或执行哪些操作。在进行授权之前，需要先进行认证
>
> 在 Spring Security 中，授权是指控制用户是否具有执行特定操作或访问特定资源的过程。这通常是通过设置角色或权限来实现的，并且在用户尝试访问受保护的资源时检查用户是否具有相应的角色或权限。如果用户没有足够的权限，则会显示授权错误消息或拒绝访问。



## 基于角色的权限访问控制(RBAC)

> RBAC（Role-Based Access Control，基于角色的访问控制）是一种访问控制模型，它根据用户的角色和权限来决定用户可以访问哪些系统资源和执行哪些操作。
>
> 在 RBAC 中，角色是指一组权限的集合，用户可以拥有多个角色。当用户被授予角色时，用户就拥有了该角色所拥有的权限。

简单来说，一个用户拥有多个角色，每个角色拥有若干权限。这样就构成了“用户-角色-权限”的授权模型。在这个模型中，用户与角色、角色与权限之间是多对多的关系。

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163709911.jpg)



## 角色和用户组

### 角色

> 一定数量的权限的集合，权限的载体

为什么要使用角色，直接分配权限不行吗？

当然可以，但是不方便管理。比如开发部有 【 **拉取代码、上传代码、删除代码** 】的权限，这个部门下有 【 **张三、李四、王五** 】三个程序员。

这样在给他们创建账户的时候，每个人都要分配一次【 **拉取代码、上传代码、删除代码** 】的权限，假如我要给他们取消 【 **删除代码** 】的权限的话，他们每个人的账户权限都要去改一次

现在我创建一个 【 **开发者** 】的角色并且赋予该角色这三个权限。这样我只需要给 【 **张三、李四、王五** 】分别赋予【 **开发者** 】的角色就可以了，要取消他们 【 **删除代码** 】的权限，也只需要取消 【 **开发者** 】角色中的相应权限就OK了

### 用户组

> 一定数量的用户的集合，用户的载体

 为什么要使用用户组，不是已经有了角色吗？

当用户的数量非常大时，要给系统每个用户逐一分配角色，也是件非常烦琐的事情。这时，就需要给用户分组，每个用户组内有多个用户。除了可给用户授权外，还可以给用户组授权。

这样一来，用户拥有的所有权限，就是 **用户个人拥有的权限与该用户所在用户组拥有的权限之和** 

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163704745.jpg)

这样可以再搞个 【 **开发组** 】，【 **张三、李四、王五** 】都是组内的成员，直接给 【 **开发组** 】赋予 【 **开发者** 】的角色，然后我再给 **张三** 单独赋予 【 **数据库管理员** 】的角色，该角色拥有 【 **创建数据库、删除数据库** 】等权限，这样的话同样为开发者成员但是就只有 **张三** 可以删库跑路了

## 权限

> 权限 表现在对功能模块的操作，例如对上传文件的删除和修改，对菜单的访问，甚至是对页面上某个按钮或图片可见性的控制，都是属于权限的范畴。

可见权限分为：

- 页面权限：Web系统由一个一个页面组成，页面构成了模块，用户能够看到这个页面的菜单，是能进入某个页面就成为页面权限

- 操作权限：用户在系统中交互动作都是操作权限，典型的例如增删改查操作

- 数据权限：业务管理系统中对数据私密性有要求时，哪些人可以看到哪些数据，看不到哪些数据

  也就是说你可以看到指定部门下的所有人创建的数据，还是说只能看到自己创建的数据，或者说某些人创建的数据

  数据权限无法使用spring security帮我们管理，需要自己去实现

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163659482.jpg)



在有些情况下我们可以将菜单表、页面元素、权限表精简为一张表：菜单权限表

| 名称        | 数据类型     | 备注                                                    |
| ----------- | ------------ | ------------------------------------------------------- |
| menu_id     | bigint       | 菜单ID                                                  |
| name        | varchar(32)  | 菜单名称                                                |
| permission  | varchar(32)  | 权限唯一标识，menu_type为2时不能为空                    |
| path        | varchar(128) | 前端路径，menu_type为0或1时不能为空，表示页面路由路径   |
| parent_id   | bigint       | 父菜单ID                                                |
| icon        | varchar(32)  | 菜单图标                                                |
| sort_order  | int          | 排序值                                                  |
| menu_type   | char(1)      | 菜单类型，可有以下几种：(0：顶菜单，1：左菜单，2：按钮) |
| create_by   | varchar(64)  | 创建人                                                  |
| create_time | datetime     | 创建时间                                                |
| update_by   | varchar(64)  | 修改人                                                  |
| update_time | datetime     | 更新时间                                                |
| del_flag    | char(1)      | 删除标记                                                |

menu_type：顶菜单或左菜单就不用多说了，按钮就是页面元素，通常情况就是指具体权限【 **新增，查询，修改，删除** 】等



## RBAC模型

RBAC 认为授权实际上是 `Who` 、`What` 、`How` 三元组之间的关系，也就是 `Who` 对 `What` 进行 `How` 的操作

- Who：是权限的拥有者或主体（如：User，Role）。
- What：是操作或对象（operation，object）。
- How：具体的权限（Privilege,正向授权与负向授权）。

然后 **RBAC**  又分为 **RBAC0** 、**RBAC1** 、**RBAC2** 、**RBAC3**

- RBAC0：是RBAC的核心思想。
- RBAC1：是把RBAC的角色分层模型。
- RBAC2：增加了RBAC的约束模型。
- RBAC3：其实是RBAC2 + RBAC1。



### RBAC0

> RBAC0定义了能构成RBAC控制系统的最小的元素集合，RBAC0由四部分构成：
>
> - 用户
> - 角色
> - 会话 (Session)
> - 许可 (权限)
>
> 其中 **用户和角色** 、**角色和权限** 对应关系都可以是多对多的关系

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163652546.png)



### RBAC1(角色继承)

> RBAC1，它是RBAC角色的分层模型，RBAC1建立在RBAC0基础之上，在角色中引入了继承的概念，有了继承那么角色就有了上下级或者等级关系，角色间的继承关系可分为一般继承关系和受限继承关系。
>
> 一般继承关系仅要求角色继承关系是一个绝对偏序关系，允许角色间的多继承。
>
> 受限继承关系则进一步要求角色继承关系是一个树结构，实现角色间的单继承。

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163648172.png)



### RBAC2(用户角色约束)

> RBAC2也是建立的RBAC0的基础之上的，在RBAC0基础上加入了约束的概念，主要引入了
>
> 静态职责分离SSD(Static Separation of Duty)
>
> 动态职责分离DSD(Dynamic Separation of Duty)

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163643570.png)



静态职责分离 SSD

- 互斥角色限制：如果两个角色间存在互斥关系，只能选择给用户分配其中的一个角色
- 基数限制：一个角色被分配的用户数量受限，一个用户可拥有的角色数目受；一个角色对应的权限数量也是有上限的；以控制高级权限在系统中的分配。如：一个部门的主管人是有限的。
- 先决条件限制：角色之间存在前置依赖关系，用户必须先获得低级角色才能拥有高级角色。如：国家主席是从副主席中选举的。

动态职责分离 DSD

- 如果用户拥有两个及以上角色，则同一时间段内有且只能有一个角色可以生效



### RBAC3(RBAC1+RBAC2)

> 它是RBAC1与RBAC2合集，所以RBAC3是既有角色继承又有约束的一种模型





## 代码方式配置授权

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests((requests) -> {
        // 该url：任何人都能访问
        requests.mvcMatchers("/error").permitAll();
        // GET请求方式的该url：任何人都能访问(不管了有没有登录，已认证的情况下可以获取到Authentication，未登录获取为null)
        requests.mvcMatchers(HttpMethod.GET, "/users/principal").permitAll();
        // POST请求方式的该url：必须未认证的情况下才可以访问，已认证用户将会被拒绝并返回403状态码
        requests.mvcMatchers(HttpMethod.POST, "/authorize/sendTotp").anonymous();
        // POST请求方式的该url：需已认证过且拥有 ADD_USER 权限的用户才能访问
        requests.mvcMatchers(HttpMethod.POST, "/users/save").hasAuthority("ADD_USER");
        // PUT请求方式的该url：需已认证过且拥有 UPDATE_USER 权限的用户才能访问
        requests.mvcMatchers(HttpMethod.PUT, "/users/update").hasAuthority("UPDATE_USER");
        // 已/users开头的其他请求：需已认证过且拥有 USER_MANAGER 角色的用户才能访问
        requests.antMatchers("/users/**").hasRole("USER_MANAGER");
        // 其他任何请求：必须已认证才能访问
        requests.anyRequest().authenticated();
    });
}
```



!> 规则的顺序很重要，越广泛适用的规则要放到最后，以免其他规则失效



### permitAll()

> 指定任何人都允许使用 URL

不管有没有登录，已认证的情况下通过 `SecurityContextHolder.getContext().getAuthentication()` 可以获取到Authentication，未登录的情况下获取为null

### anonymous()

> 指定匿名用户允许使用 URL

必须未认证的情况下才可以访问，已认证用户将会被拒绝并返回403状态码

### hasRole(String role)

> 具有指定角色的用户允许使用 URL，会给role拼接上前缀，默认为 `ROLE_` 即：`String roleCode = "ROLE_"+role`

 需已认证过且拥有指定角色的用户才能访问

### hasAnyRole(String... roles)

> 同 hasRole(String role)。但是可以指定多个，只要用户拥有其中的任意一个角色即代表可以访问

### hasAuthority(String authority)

> 具有指定权限的用户允许使用 URL

### hasAnyAuthority(String... authorities)

> 同 hasAuthority(String authority)。但是可以指定多个，只要用户拥有其中的任意一个权限即代表可以访问

### rememberMe()

> 表示只有启用记住我功能的用户才能访问

### authenticated()

> 表示已认证的用户才能访问

### fullyAuthenticated()

> 表示只有已认证但是未启用记住我功能的用户才能访问

### hasIpAddress(String ip)

> 表示指定的ip或子网才能访问
>
>  IP 地址（即 192.168.1.79）或本地子网（即 192.168.0/24）

### denyAll()

> 表示不允许所有访问

### access(String expression)

> 表示表达式结果返回true的情况下可以访问
>
> Spring Security 使用 SpEL 来支持表达式
>
> expression：表达式，如：
>
> `"hasRole('ROLE_USER') and hasRole('ROLE_SUPER')"`

**常见的内置表达式：**

| 表达式                                                       | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| hasRole(String role)                                         | 如果当前主体拥有指定的角色，则返回true<br />如：`hasRole('admin')` <br />默认情况下，如果提供的角色不以  `ROLE_` 开头，则会自动添加。 |
| hasAnyRole(String… roles)                                    | 如果当前主体拥有其中任一角色，则返回true<br />如：`hasAnyRole('admin', 'user')` |
| hasAuthority(String authority)                               | 如果当前主体拥有指定的权限，则返回true<br />如：`hasAuthority('read')` |
| hasAnyAuthority(String… authorities)                         | 如果当前主体拥有其中任一权限，则返回true<br />如：`hasAnyAuthority('read', 'write')` |
| principal                                                    | 代表当前用户主体，可以在表达式中直接使用                     |
| authentication                                               | 代表当前认证的authentication，可以在表达式中直接使用         |
| permitAll()                                                  | 始终返回true                                                 |
| denyAll()                                                    | 始终返回false                                                |
| isAnonymous()                                                | 如果当前主体是匿名用户则返回true                             |
| isRememberMe()                                               | 如果当前主体是记住我的用户，则返回true                       |
| isAuthenticated()                                            | 如果用户不是匿名用户则返回true                               |
| isFullyAuthenticated()                                       | 如果用户不是匿名用户且不是记住我的用户，则返回true           |
| hasPermission(Object target, Object permission)              | 如果用户有权访问给定权限的提供目标，则返回true<br />如：`hasPermission(domainObject, 'read')`。 |
| hasPermission(Object targetId, String targetType, Object permission) | 如果用户有权访问给定权限的提供目标，则返回true<br />如，`hasPermission(1, 'com.example.domain.Message', 'read')`。 |
| *hasIpAddress(String ip)*                                    | 特定于 Web 安全的附加内置表达式<br />如：`hasIpAddress('192.168.1.0/24')` |

#### 引用spring bean

除了使用内置表达式外，还可以引用注册到spring容器中的bean

```java
@Component
public class WebSecurity {
		public boolean check(Authentication authentication, HttpServletRequest request) {
				...
		}
}
```

```java
requests.mvcMatchers("/users/**").access("@webSecurity.check(authentication,request)");
```



#### 引用路径变量

```java
requests.mvcMatchers("/users/{userId}").access("T(Integer).parseInt(#userId)<5");
```



## 注解方式配置授权

> Spring Security 3.0 引入了一些新的注解来全面支持表达式的使用
>
> 注解方式和access(String attribute)表达式差不多，只不过是给授权配置提升到了方法级别

spring security中提供了以下四个注解：

| 注解                     | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| @PreAuthorize("表达式")  | 在 **方法执行前** 对表达式进行判断，以确定是否允许方法调用   |
| @PostAuthorize("表达式") | 在 **方法执行后** 对表达式进行判断，以确定是否将方法返回值响应给客户端<br />在表达式中 `returnObject`  表示方法的返回值 |
| @PreFilter               | 对集合类型的参数进行过滤，Spring Security将移除使对应表达式的结果为false的元素 |
| @PostFilter              | 对集合类型的返回值进行过滤，Spring Security将移除使对应表达式的结果为false的元素 |

`@PreFilter` 和 `@PreAuthorize` 都是可以在 Spring Security 框架中使用的注释，用于指定在调用某些方法之前应该执行的安全检查。

`@PreFilter` 用于在将对象传递给方法之前过滤对象列表。它可用于从列表中删除不符合特定条件（例如具有特定属性或权限）的元素。

`@PreAuthorize` 用于在调用方法之前执行授权检查。它可用于确保当前用户具有执行该方法所需的权限。

`@PreFilter` 和之间的主要区别在于 `@PreAuthorize`，`@PreFilter` 用于过滤对象列表，而 `@PreAuthorize` 用于对当前用户执行授权检查。

默认情况下这些注解都是被禁用的，我们需要在配置类中使用 `@EnableMethodSecurity` 或者 `@EnableGlobalMethodSecurity` 注解显示的开启注解授权

```java
@AllArgsConstructor
@EnableMethodSecurity
@EnableWebSecurity(debug = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter{
    
}
```

或者

```java
@AllArgsConstructor
@EnableWebSecurity(debug = true)
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
}
```



测试：

```java
@GetMapping("/{userId}")
@PreAuthorize("#userId<5")
public ResponseEntity<SysUser> getUserInfo(@PathVariable Integer userId) {
    return ResponseEntity.ok(userRepo.findById(userId).orElseGet(SysUser::new));
}
```



### 元注解

在注解表达式比较复杂且复用率比较高的情况下，我们可以自定义自定的注解，将spring security注解作为元注解使用

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("principal.username=='admin' and hasAuthority('DELETE_USER')")
public @interface AdminAccess {
}
```

```java
@AdminAccess
@GetMapping("/{userId}")
public ResponseEntity<SysUser> getUserInfo(@PathVariable Integer userId) {
    return ResponseEntity.ok(userRepo.findById(userId).orElseGet(SysUser::new));
}
```



## 角色层级(RoleHierarchy)

> 上面讲到 RBAC1 模型，角色具有继承的关系，spring security中支持角色拥有层次结构

假设有以下三个角色和权限：

![role3131233341](https://cdn.tencentfs.clboy.cn/images/2022/20221229163633427.jpg)

现在要给一个用户分配所有的权限，就要把所有的角色分配给他，当系统角色变得越来越多，维护起来很麻烦，用户与角色关系也会变得非常复杂

![role313123ds1](https://cdn.tencentfs.clboy.cn/images/2022/20221229163628988.jpg)



角色有了继承关系之后，关系看起来就简明多了，分配角色时也不需要那么麻烦



![role-h](https://cdn.tencentfs.clboy.cn/images/2022/20221229163623798.jpg)



那么在spring security中基于角色进行授权控制，比如使用 `hasRole` 表达式时，如何让spring security知道该继承关系。

在spring security中提供了这样一个接口

```java
public interface RoleHierarchy {

    /**
     * 返回所有可达权限的数组。
     * 可达权限是直接分配的权限加上在角色层次结构中可以（传递地）从它们到达的所有权限。
     * 例子： 角色层次结构：ROLE_A > ROLE_B > ROLE_C。 直接分配的权限：ROLE_A。 可达权限：ROLE_A、ROLE_B、ROLE_C。
     * 参数：
     * authorities —— 直接指定的权限列表。
     */
   Collection<? extends GrantedAuthority> getReachableGrantedAuthorities(
         Collection<? extends GrantedAuthority> authorities);

}
```

内置的实现类：`org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl`

我们可以创建该类实例，通过setHierarchy方法，将角色层级关系用字符串表示的形式设置进去，并将该实例注册到spring容器即可完成角色层级的定义

在字符串层级表示中，每一行代表单级或多级角色链，所以要使用 `\n` 进行分隔

```java
@Bean
public RoleHierarchy roleHierarchy() {
    RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
    String hierarchy = "ROLE_ADMIN > ROLE_STAFF \n ROLE_STAFF > ROLE_USER";
    roleHierarchy.setHierarchy(hierarchy);
    return roleHierarchy;
}
```



ps：其实我觉得在项目中完全没必要使用RoleHierarchy，就像角色和权限是多对的的关系，但是在程序中，程序是感知不到的，我们一般都是根据多对多的关系查询到用户所拥有的所有权限扔到其权限集合中去，对于程序而言并不需要指定哪些权限属于哪些角色。同样，对于角色继承关系，也是可以在用户认证完之后根据继承关系查询出其拥有的所有角色扔到角色集合中即可。这种继承关系只需要在数据库中维护即可，程序中大可不必知道的那么详细。**这是我的个人理解！！！**



## 授权流程

接下来让我们看一下spring security是怎样完成授权控制的

```
Security filter chain: [
  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  LogoutFilter
  JwtFilter
  MfaAuthenticationFilter
  BasicAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
]
```

在spring security的过滤器链中最后一个就是用于授权的，该过滤器中有一个 `attemptAuthorization` 方法用于授权

```java

//......

private AccessDecisionManager accessDecisionManager;

private void attemptAuthorization(Object object, Collection<ConfigAttribute> attributes,
      Authentication authenticated) {
   try {
      this.accessDecisionManager.decide(authenticated, object, attributes);
   }
   catch (AccessDeniedException ex) {
      if (this.logger.isTraceEnabled()) {
         this.logger.trace("......");
      }
      else if (this.logger.isDebugEnabled()) {
         this.logger.debug("......");
      }
      publishEvent(new AuthorizationFailureEvent(object, attributes, authenticated, ex));
      throw ex;
   }
}
```

最终授权是调用 `org.springframework.security.access.AccessDecisionManager` 进行的

### AccessDecisionManager

AccessDecisionManager 是一个接口，它主要用于在 Spring Security 中进行权限决策。

Spring Security 提供了几个实现类，它们分别是：

1. `AffirmativeBased` ：这是默认的决策管理器，它使用 `AccessDecisionVoter` 的决策结果来决定是否授权。任一AccessDecisionVoter拒绝授权，则拒绝。有 Voter投同意授权票后，后续 Voter将被忽略
2. `ConsensusBased` ：这个决策管理器根据 `AccessDecisionVoter` 的决策结果来决定是否授权。如果有一半以上的 AccessDecisionVoter 支持授权，则授权；否则，拒绝授权。
3. `UnanimousBased` ：这个决策管理器要求所有的 AccessDecisionVoter 都支持授权，否则拒绝授权。



![img](https://cdn.tencentfs.clboy.cn/images/2022/20221229163725219.png)



`org.springframework.security.access.vote.AffirmativeBased`

```java
public void decide(Authentication authentication, Object object, Collection<ConfigAttribute> configAttributes)
      throws AccessDeniedException {
   int deny = 0;
   for (AccessDecisionVoter voter : getDecisionVoters()) {
      int result = voter.vote(authentication, object, configAttributes);
      switch (result) {
      case AccessDecisionVoter.ACCESS_GRANTED:
         return;
      case AccessDecisionVoter.ACCESS_DENIED:
         deny++;
         break;
      default:
         break;
      }
   }
   if (deny > 0) {
      throw new AccessDeniedException(
            this.messages.getMessage("AbstractAccessDecisionManager.accessDenied", "Access is denied"));
   }
   // To get this far, every AccessDecisionVoter abstained
   checkAllowIfAllAbstainDecisions();
}
```



### AccessDecisionVoter

AccessDecisionManager的授权逻辑实际上是遍历所有的 `AccessDecisionVoter` 来进行投票授权

