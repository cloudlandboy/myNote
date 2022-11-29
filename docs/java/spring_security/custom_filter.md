# 自定义Filter

> 上节最后我们讲到可以通过设置 `successHandler` 和 `failureHandler` 将登录成功或失败的返回结果改为json格式，那么如何将登录请求参数也改为json格式呢，现在是只能使用表单格式

下面是表单格式请求的http文件，可以登录成功

```http
### post表单格式请求
POST  http://localhost:8080/auth
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456
```

改为json格式，结果返回 `401` 。用户名密码是正确的，那么只有一种情况就是它没有获取到传递过去的参数

```http
### post json格式请求
POST http://localhost:8080/auth
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

spring security 默认处理登录请求的过滤器是 `UsernamePasswordAuthenticationFilter` ，这个过滤器只能够处理表单格式的请求，下面是它处理登录认证的方法

```java
@Override
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
   if (this.postOnly && !request.getMethod().equals("POST")) {
      throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
   }
   
   //从请求重获取username
   String username = obtainUsername(request);
   username = (username != null) ? username : "";
   username = username.trim();
    
   //从请求重获取password
   String password = obtainPassword(request);
   password = (password != null) ? password : "";
    
   //这个类暂时理解为对用户名密码还有request请求的包装
   UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
   // Allow subclasses to set the "details" property
   setDetails(request, authRequest);
   //调用认证管理器进行认证
   return this.getAuthenticationManager().authenticate(authRequest);
}
```

重点关注获取用户名密码的 `obtainUsername` 和 `obtainPassword` 方法，可以看到就是调用request的getParameter方法来获取参数，`getParameter` 方法只能获取查询参数和form表单里参数

```java
protected String obtainUsername(HttpServletRequest request) {
   return request.getParameter(this.usernameParameter);
}

protected String obtainPassword(HttpServletRequest request) {
   return request.getParameter(this.passwordParameter);
}
```

我们可以实现自己的 `UsernamePasswordAuthenticationFilter` 替换掉默认的

```java
@RequiredArgsConstructor
public class UsernamePasswordAuthenticationEnhanceFilter extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper objectMapper;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        if (!request.getMethod().equals(HttpMethod.POST.name())) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }

        String username;
        String password;
        try {
            JsonNode jsonNode = objectMapper.readTree(request.getInputStream());
            username = jsonNode.get(getUsernameParameter()).asText();
            password = jsonNode.get(getPasswordParameter()).asText();
        } catch (Exception ex) {
            throw new AuthenticationServiceException("解析参数错误");
        }

        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
        setDetails(request, authRequest);
        return this.getAuthenticationManager().authenticate(authRequest);
    }
}
```

配置类只是把之前对 `formLogin` 的配置删掉。增加替换 `UsernamePasswordAuthenticationFilter` 为自定义的逻辑

`http.addFilterAt(usernamePasswordAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)`

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
     * 自定义用户名密码身份验证过滤器
     */
    private UsernamePasswordAuthenticationEnhanceFilter usernamePasswordAuthenticationFilter() throws Exception {
        UsernamePasswordAuthenticationEnhanceFilter filter = new UsernamePasswordAuthenticationEnhanceFilter(objectMapper);
        //authenticationManager方法是从父类继承来的
        filter.setAuthenticationManager(this.authenticationManager());
        filter.setFilterProcessesUrl("/auth");
        filter.setAuthenticationSuccessHandler(loginSuccessHandler());
        filter.setAuthenticationFailureHandler(loginFailureHandler());
        return filter;
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
        //http.formLogin(form -> {
        //    form.loginPage("/login.html");
        //    form.loginProcessingUrl("/auth");
        //    form.successHandler(loginSuccessHandler());
        //    form.failureHandler(loginFailureHandler());
        //});

        //替换默认的UsernamePasswordAuthenticationFilter
        http.addFilterAt(usernamePasswordAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        //设置退出登录处理接口
        http.logout(logout -> logout.logoutUrl("/logout").logoutSuccessHandler(logoutSuccessHandler()));
        http.httpBasic();
        http.csrf().disable();
        http.rememberMe(rememberMe -> rememberMe.rememberMeParameter("auto-login"));

    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置不需要spring security处理的请求路径，注意这里是请求路径而不是你静态资源目录路径，例如写 "/public/**" 是错误的,只会对PublicResourceController生效
        web.ignoring().antMatchers("/login.html", "/css/**");
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