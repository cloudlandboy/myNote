# 认证流程和源码解析



## 用户名密码认证流程概述

![20221209104246500](https://cdn.tencentfs.clboy.cn/images/2022/20221209104246500.png)

1. 用户发起认证请求会经过认证过滤器：`UsernamePasswordAuthenticationFilter`

2. 认证过滤器会从请求中提取用户名和密码、请求的其他信息组装成 `UsernamePasswordAuthenticationToken`

3. 调用 `AuthenticationManager` 的 `authenticate(Authentication authenticationToken)` 方法进行认证

   默认的 实现类是：`org.springframework.security.authentication.ProviderManager`

4. `ProviderManager` 类维护了一组 `AuthenticationProvider`

   ```java
   private List<AuthenticationProvider> providers
   ```

   `ProviderManager` 会遍历 `providers` 匹配到合适的认证Provider

   调用其 `authenticate(Authentication authenticationToken)` 方法进行认证

   我们现在使用的都是  `DaoAuthenticationProvider`

5. 之后 就是 `DaoAuthenticationProvider` 调用 `UserDetailsService` 根据用户名查询用户信息，验证用户密码是否匹配，用户状态是否正常的过程。验证通过后就会将 `UserDetails` 包装到 `Authentication` 中返回



## 源码解析

### UsernamePasswordAuthenticationFilter

我们知道 Filter 的主要入口就是 `doFilter` 方法

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
   doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
}

private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    //判断是不是登录(认证)请求，里面的逻辑就是判断请求地址是不是配置的认证处理接口路径
   if (!requiresAuthentication(request, response)) {
      chain.doFilter(request, response);
      return;
   }
   try {
      //调用 attemptAuthentication 方法进行认证
      Authentication authenticationResult = attemptAuthentication(request, response);
      if (authenticationResult == null) {
         return;
      }
      
      //... 省略其他代码
   }
}
```

**attemptAuthentication方法**

```java
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
   if (this.postOnly && !request.getMethod().equals("POST")) {
      throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
   }
   //【我们可以在这里打上断点进行debug调试】从请求中提取用户名
   String username = obtainUsername(request);
   username = (username != null) ? username : "";
   username = username.trim();
   // 从请求从提取密码
   String password = obtainPassword(request);
   password = (password != null) ? password : "";
   
   // 组装成 UsernamePasswordAuthenticationToken 类型的 Authentication
   UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
   setDetails(request, authRequest);
    
   // 调用authenticationManager的authenticate方法进行认证
   return this.getAuthenticationManager().authenticate(authRequest);
}
```

debug可以看到这里的 `AuthenticationManager` 的实现类是

`org.springframework.security.authentication.ProviderManager`

![20221209104253275](https://cdn.tencentfs.clboy.cn/images/2022/20221209104253275.png)



### ProviderManager

```java
// ...
private List<AuthenticationProvider> providers = Collections.emptyList();

private AuthenticationManager parent;

//...

public Authentication authenticate(Authentication authentication) throws AuthenticationException {
   Class<? extends Authentication> toTest = authentication.getClass();
   AuthenticationException lastException = null;
   AuthenticationException parentException = null;
   Authentication result = null;
   Authentication parentResult = null;
   int currentPosition = 0;
   int size = this.providers.size();
    
   //遍历所有provider
   for (AuthenticationProvider provider : getProviders()) {
      //调用provider的supports方法判断是否支持传递过来的authentication类型
      if (!provider.supports(toTest)) {
         continue;
      }
      if (logger.isTraceEnabled()) {
         logger.trace(LogMessage.format("Authenticating request with %s (%d/%d)",
               provider.getClass().getSimpleName(), ++currentPosition, size));
      }
      try {
         //如果provider的supports方法返回true则调用其authenticate方法进行认证
         result = provider.authenticate(authentication);
         if (result != null) {
            copyDetails(authentication, result);
            break;
         }
      } catch (AccountStatusException | InternalAuthenticationServiceException ex) {
         prepareException(ex, authentication);
         throw ex;
      } catch (AuthenticationException ex) {
         lastException = ex;
      }
   }
   
   //如果所有providers都无法处理(循环完毕result值还是null)，则交给parent处理，parent也是ProviderManager类型
   if (result == null && this.parent != null) {
      try {
         parentResult = this.parent.authenticate(authentication);
         result = parentResult;
      } catch (ProviderNotFoundException ex) {
          // ingore
      } catch (AuthenticationException ex) {
         parentException = ex;
         lastException = ex;
      }
   }
    
   if (result != null) {
      
      //认证完成，对实现CredentialsContainer接口的Authentication调用eraseCredentials方法删除敏感信息
      if (this.eraseCredentialsAfterAuthentication && (result instanceof CredentialsContainer)) {
         ((CredentialsContainer) result).eraseCredentials();
      }
      // 发布认证成功事件，这里判断是为了防止重复发送事件 this.parent.authenticate认证成功的就由parent发送事件
      if (parentResult == null) {
         this.eventPublisher.publishAuthenticationSuccess(result);
      }

      return result;
   }

   // 如果走到这里又没有任何AuthenticationException类型异常抛出，说明没有Provider能够处理
   if (lastException == null) {
      lastException = new ProviderNotFoundException(this.messages.getMessage("ProviderManager.providerNotFound",
            new Object[] { toTest.getName() }, "No AuthenticationProvider found for {0}"));
   }

   // 发布认证失败事件，这里判断同样为了防止重复发送事件 this.parent.authenticate认证失败的就由parent发送事件
   if (parentException == null) {
      prepareException(lastException, authentication);
   }
   throw lastException;
}
```

debug可以看到，首先进入的ProviderManager实例中维护了两个Provider

分别是

- `org.springframework.security.authentication.AnonymousAuthenticationProvider`
- `org.springframework.security.authentication.RememberMeAuthenticationProvider`

![20221209104330240](https://cdn.tencentfs.clboy.cn/images/2022/20221209104330240.png)

看一下这两个Provider的 `supports()` 方法实现

```java
/**
 * AnonymousAuthenticationProvider
 */
@Override
public boolean supports(Class<?> authentication) {
   return (AnonymousAuthenticationToken.class.isAssignableFrom(authentication));
}

/**
 * RememberMeAuthenticationProvider
 */
@Override
public boolean supports(Class<?> authentication) {
	return (RememberMeAuthenticationToken.class.isAssignableFrom(authentication));
}
```

 这两个Provider都是判断传递过来的authenticationToken的类型，现在传递过来的token是 `UsernamePasswordAuthenticationToken` 类型

明显这两个Provider都不符合，那么接下来就会调用 `parent` 进行认证

![20221209104348390](https://cdn.tencentfs.clboy.cn/images/2022/20221209104348390.png)

可以看到parent中维护的providers中只有一个 `org.springframework.security.authentication.dao.DaoAuthenticationProvider`

该Provider继承了 `org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider`

```java
@Override
public boolean supports(Class<?> authentication) {
   return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));
}
```

supports方法返回true，接下来就会调用Provider的 `authenticate(Authentication authentication)` 方法认证

### DaoAuthenticationProvider

该Provider的 `supports` 方法和 `authenticate` 方法都继承自 `AbstractUserDetailsAuthenticationProvider`

```java
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
   // 断言authentication必须是UsernamePasswordAuthenticationToken类型
   Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication," ... ");
   // 提取用户名
   String username = determineUsername(authentication);
   boolean cacheWasUsed = true;
   // 尝试从缓存中获取用户信息
   UserDetails user = this.userCache.getUserFromCache(username);
   if (user == null) {
      cacheWasUsed = false;
      try {
         // 缓存中未获取到，调用retrieveUser方法检索用户信息
         user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);
      } catch (UsernameNotFoundException ex) {
         this.logger.debug("Failed to find user '" + username + "'");
         if (!this.hideUserNotFoundExceptions) {
            throw ex;
         }
         // 抛出错误凭证异常
         throw new BadCredentialsException(" ... ");
      }
      
      // 断言retrieveUser方法不能返回null
      Assert.notNull(user, "retrieveUser returned null - a violation of the interface contract");
   }
    
   try {
      
      // 认证前检查，对用户状态进行检查，是否禁用，是否过期，是否被锁定等
      this.preAuthenticationChecks.check(user);
      // 调用passwordEncoder检查密码是否正确
      additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);
       
   } catch (AuthenticationException ex) {
      
      //如果使用的不是缓存则直接抛出异常
      if (!cacheWasUsed) {
         throw ex;
      }
      // 如果使用的是缓存，则调用retrieveUser方法获取最新的用户信息，重试一次
      cacheWasUsed = false;
      user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);
      this.preAuthenticationChecks.check(user);
      additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);
   }
    
   // 认证后检查，检查凭证是否过期等
   this.postAuthenticationChecks.check(user);
    
   // 放入缓存
   if (!cacheWasUsed) {
      this.userCache.putUserInCache(user);
   }
    
   Object principalToReturn = user;
   if (this.forcePrincipalAsString) {
      principalToReturn = user.getUsername();
   }
    
   // 创建认证成功后的Authentication并返回
   return createSuccessAuthentication(principalToReturn, authentication, user);
}
```



我们重点看一下 `retrieveUser(String username, UsernamePasswordAuthenticationToken authentication)` 方法

```java
@Override
protected final UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication)
      throws AuthenticationException {
   prepareTimingAttackProtection();
   try {
      // 这里就是调用UserDetailsService获取用户信息
      UserDetails loadedUser = this.getUserDetailsService().loadUserByUsername(username);
      if (loadedUser == null) {
         throw new InternalAuthenticationServiceException(" ... ");
      }
      return loadedUser;
   } catch (UsernameNotFoundException ex) {
      mitigateAgainstTimingAttack(authentication);
      throw ex;
   } catch (InternalAuthenticationServiceException ex) {
      throw ex;
   } catch (Exception ex) {
      throw new InternalAuthenticationServiceException(ex.getMessage(), ex);
   }
}
```

至此整个基于用户名密码的认证流程完成

最后security 会将认证成功的 `Authentication` 放到session中

后续请求其他接口时security会先从session中获取，然后放到 `SecurityContext` 中

从session中存取的逻辑可以看 `org.springframework.security.web.context.SecurityContextPersistenceFilter` 源码





