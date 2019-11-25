# restful风格的增删改查

静态资源文件：https://www.lanzous.com/i7eenib

1. 将静态资源(css,img,js)添加到项目中，放到springboot[默认的静态资源文件夹下](backend/springboot/helloweb?id=非webjars，自己的静态资源怎么访问)
2. 将模板文件(html)放到[template文件夹下](backend/springboot/templateengine?id=thymeleaf%e4%bd%bf%e7%94%a8)

![1573896827010](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573896827010.png)

!> 如果你的静态资源明明放到了静态资源文件夹下却无法访问，请检查一下是不是在自定义的配置类上加了**@EnableWebMvc注解**

## 默认访问首页

template文件加不是静态资源文件夹，默认是无法直接访问的，所以要添加视图映射

```java
package cn.clboy.hellospringbootweb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @Author cloudlandboy
 * @Date 2019/11/16 下午3:32
 * @Since 1.0.0
 */

@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("login");
        registry.addViewController("/index").setViewName("login");
        registry.addViewController("/index.html").setViewName("login");
    }
}
```

访问：<http://localhost:8080/>

## i18n国际化

1. 编写国际化配置文件，抽取页面需要显示的国际化消息

   SpringBoot自动配置好了管理国际化资源文件的组件

   ```java
   @Configuration(
       proxyBeanMethods = false
   )
   @ConditionalOnMissingBean(
       name = {"messageSource"},
       search = SearchStrategy.CURRENT
   )
   @AutoConfigureOrder(-2147483648)
   @Conditional({MessageSourceAutoConfiguration.ResourceBundleCondition.class})
   @EnableConfigurationProperties
   public class MessageSourceAutoConfiguration {
       private static final Resource[] NO_RESOURCES = new Resource[0];
   
       public MessageSourceAutoConfiguration() {
       }
   
       @Bean
       @ConfigurationProperties(
           prefix = "spring.messages"
       )
       public MessageSourceProperties messageSourceProperties() {
           return new MessageSourceProperties();
       }
   
       @Bean
       public MessageSource messageSource(MessageSourceProperties properties) {
           ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
           if (StringUtils.hasText(properties.getBasename())) {
               messageSource.setBasenames(StringUtils.commaDelimitedListToStringArray(StringUtils.trimAllWhitespace(properties.getBasename())));
           }
   
           if (properties.getEncoding() != null) {
               messageSource.setDefaultEncoding(properties.getEncoding().name());
           }
   
           messageSource.setFallbackToSystemLocale(properties.isFallbackToSystemLocale());
           Duration cacheDuration = properties.getCacheDuration();
           if (cacheDuration != null) {
               messageSource.setCacheMillis(cacheDuration.toMillis());
           }
   
           messageSource.setAlwaysUseMessageFormat(properties.isAlwaysUseMessageFormat());
           messageSource.setUseCodeAsDefaultMessage(properties.isUseCodeAsDefaultMessage());
           return messageSource;
       }
   ```

   创建i18n文件夹存放配置文件，文件名格式为`基础名(login)`+`语言代码(zh)`+`国家代码(CN)`

   ![1573900332686](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573900332686.png)

2. 在配置文件中添加国际化文件的位置和基础名

   ```properties
   spring.messages.basename=i18n.login
   ```

   如果配置文件中没有配置基础名，就在类路径下找基础名为`message`的配置文件

3. 将页面文字改为获取国际化配置，格式`#{key}`

   ```html
   	<body class="text-center">
   		<form class="form-signin" action="dashboard.html">
   			<img class="mb-4" src="asserts/img/bootstrap-solid.svg" alt="" width="72" height="72">
   			<h1 class="h3 mb-3 font-weight-normal" th:text="#{login.tip}">Please sign in</h1>
   			<label class="sr-only">Username</label>
   			<input type="text" class="form-control" th:placeholder="#{login.username}" placeholder="Username" required="" autofocus="">
   			<label class="sr-only">Password</label>
   			<input type="password" class="form-control" th:placeholder="#{login.password}" placeholder="Password" required="">
   			<div class="checkbox mb-3">
   				<label>
             <input type="checkbox" value="remember-me"> [[#{login.remember}]]
           </label>
   			</div>
   			<button class="btn btn-lg btn-primary btn-block" type="submit" th:text="#{login.btn}">Sign in</button>
   			<p class="mt-5 mb-3 text-muted">© 2017-2018</p>
   			<a class="btn btn-sm">中文</a>
   			<a class="btn btn-sm">English</a>
   		</form>
   
   	</body>
   ```

4. 然后就可以更改浏览器语言，页面就会使用对应的国际化配置文件

      ![1573900071209](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573900071209.png)

5. 原理

   国际化Locale（区域信息对象）；

   LocaleResolver（获取区域信息对象的组件）；

   在springmvc配置类`WebMvcAutoConfiguration`中注册了该组件

   ```java
           @Bean
   		/**
   		  *前提是容器中不存在这个组件，
   　　　　　　*所以使用自己的对象就要配置@Bean让这个条件不成立（实现LocaleResolver 即可）
   　　　　　　*/
           @ConditionalOnMissingBean
   		
   		/**
             * 如果在application.properties中有配置国际化就用配置文件的
             * 没有配置就用AcceptHeaderLocaleResolver 默认request中获取
             */
           @ConditionalOnProperty(
               prefix = "spring.mvc",
               name = {"locale"}
           )
           public LocaleResolver localeResolver() {
               if (this.mvcProperties.getLocaleResolver() == org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties.LocaleResolver.FIXED) {
                   return new FixedLocaleResolver(this.mvcProperties.getLocale());
               } else {
                   AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
                   localeResolver.setDefaultLocale(this.mvcProperties.getLocale());
                   return localeResolver;
               }
           }
   ```

   默认的就是根据请求头带来的区域信息获取Locale进行国际化

   ```java
       public Locale resolveLocale(HttpServletRequest request) {
           Locale defaultLocale = this.getDefaultLocale();
           if (defaultLocale != null && request.getHeader("Accept-Language") == null) {
               return defaultLocale;
           } else {
               Locale requestLocale = request.getLocale();
               List<Locale> supportedLocales = this.getSupportedLocales();
               if (!supportedLocales.isEmpty() && !supportedLocales.contains(requestLocale)) {
                   Locale supportedLocale = this.findSupportedLocale(request, supportedLocales);
                   if (supportedLocale != null) {
                       return supportedLocale;
                   } else {
                       return defaultLocale != null ? defaultLocale : requestLocale;
                   }
               } else {
                   return requestLocale;
               }
           }
       }
   ```




## 点击连接切换语言


6. 实现点击连接切换语言，而不是更改浏览器

   - 修改页面，点击连接携带语言参数

     ```html
     			<a class="btn btn-sm" href="?l=zh_CN">中文</a>
     			<a class="btn btn-sm" href="?l=en_US">English</a>
     ```

   - 自己实现区域信息解析器

     ```java
     public class MyLocaleResolver implements LocaleResolver {
     
         @Override
         public Locale resolveLocale(HttpServletRequest httpServletRequest) {
             //获取请求参数中的语言
             String language = httpServletRequest.getParameter("l");
             //没带区域信息参数就用系统默认的
             Locale locale = Locale.getDefault();
             if (!StringUtils.isEmpty(language)) {
                 //提交的参数是zh_CN （语言代码_国家代码）
                 String[] s = language.split("_");
     
                 locale = new Locale(s[0], s[1]);
     
             }
     
             return locale;
         }
     
         @Override
         public void setLocale(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Locale locale) {
     
         }
     }
     ```

   - 在配置类中将其注册到容器中

     ```java
     @Configuration
     public class MyMvcConfig implements WebMvcConfigurer {
     
         @Override
         public void addViewControllers(ViewControllerRegistry registry) {
             registry.addViewController("/").setViewName("login");
             registry.addViewController("/index").setViewName("login");
             registry.addViewController("/index.html").setViewName("login");
         }
     
         @Bean
         public LocaleResolver localeResolver() {
             return new MyLocaleResolver();
         }
     
     }
     ```



!> 如果没有生效，请检查`@Bean`的那个方法的名称是否为`localeResolver`



## 实现登录功能

1. 提供登录的controller

   ```java
   @Controller
   public class UserController {
   
       @PostMapping("/user/login")
       public String login(@RequestParam String username, @RequestParam String password, HttpSession session, Model model) {
           if (!StringUtils.isEmpty(username) && "123456".equals(password)) {
   
               //登录成功，把用户信息方法哦session中，防止表单重复提交，重定向到后台页面
               session.setAttribute("loginUser", username);
               return "redirect:/main.html";
           }
           //登录失败,返回到登录页面
           model.addAttribute("msg", "用户名或密码错误！");
           return "login";
       }
   }
   ```

   

2. 修改表单提交地址，输入框添加name值与参数名称对应

   ```html
   		<form class="form-signin" action="dashboard.html" th:action="@{/user/login}" method="post">
   			<img class="mb-4" src="asserts/img/bootstrap-solid.svg" alt="" width="72" height="72">
   			<h1 class="h3 mb-3 font-weight-normal" th:text="#{login.tip}">Please sign in</h1>
   			<label class="sr-only">Username</label>
   			<input type="text" name="username" class="form-control" th:placeholder="#{login.username}" placeholder="Username" autofocus="">
   			<label class="sr-only">Password</label>
   			<input type="password" name="password" class="form-control" th:placeholder="#{login.password}" placeholder="Password" required="">
   			<div class="checkbox mb-3">
   				<label>
             <input type="checkbox" value="remember-me"> [[#{login.remember}]]
           </label>
   			</div>
   			<button class="btn btn-lg btn-primary btn-block" type="submit" th:text="#{login.btn}">Sign in</button>
   			<p class="mt-5 mb-3 text-muted">© 2017-2018</p>
   			<a class="btn btn-sm" href="?l=zh_CN">中文</a>
   			<a class="btn btn-sm" href="?l=en_US">English</a>
   		</form>
   ```

2. 由于登录失败是转发，所以页面的静态资源请求路径会不正确，使用模板引擎语法替换

   ```java
   <link  href="asserts/css/bootstrap.min.css" th:href="@{/asserts/css/bootstrap.min.css}" rel="stylesheet">
   <!-- Custom styles for this template -->
   <link href="asserts/css/signin.css" th:href="@{/asserts/css/signin.css}" rel="stylesheet">
   ```

2. 添加登录失败页面显示

   ```html
   <h1 class="h3 mb-3 font-weight-normal" th:text="#{login.tip}">Please sign in</h1>
   <!--msg存在才显示该p标签-->
   <p th:text="${msg}" th:if="${not #strings.isEmpty(msg)}" style="color: red"></p>
   ```

   



## 修改页面立即生效

```properties
# 禁用缓存
spring.thymeleaf.cache=false
```

在页面修改完成以后按快捷键`ctrl+f9`，重新编译；

## 拦截器进行登陆检查

1. 实现拦截器

   ```java
   package cn.clboy.hellospringbootweb.interceptor;
   
   import org.springframework.web.servlet.HandlerInterceptor;
   import org.springframework.web.servlet.ModelAndView;
   
   import javax.servlet.http.HttpServletRequest;
   import javax.servlet.http.HttpServletResponse;
   
   /**
    * @Author cloudlandboy
    * @Date 2019/11/17 上午11:44
    * @Since 1.0.0
    */
   
   public class LoginHandlerInterceptor implements HandlerInterceptor {
       @Override
       public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
   
           Object loginUser = request.getSession().getAttribute("loginUser");
           if (loginUser == null) {
               //未登录，拦截，并转发到登录页面
               request.setAttribute("msg", "您还没有登录，请先登录！");
               request.getRequestDispatcher("/index").forward(request, response);
               return false;
           }
           return true;
       }
   
       @Override
       public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
   
       }
   
       @Override
       public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
   
       }
   }
   ```

2. 注册拦截器

   ```java
   package cn.clboy.hellospringbootweb.config;
   
   import cn.clboy.hellospringbootweb.interceptor.LoginHandlerInterceptor;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   import org.springframework.web.servlet.LocaleResolver;
   import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
   import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
   import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
   
   /**
    * @Author cloudlandboy
    * @Date 2019/11/16 下午3:32
    * @Since 1.0.0
    */
   
   @Configuration
   public class MyMvcConfig implements WebMvcConfigurer {
   	//定义不拦截路径
       private static final String[] excludePaths = {"/", "/index", "/index.html", "/user/login", "/asserts/**"};
   
       @Override
       public void addViewControllers(ViewControllerRegistry registry) {
           registry.addViewController("/").setViewName("login");
           registry.addViewController("/index").setViewName("login");
           registry.addViewController("/index.html").setViewName("login");
           registry.addViewController("/main.html").setViewName("dashboard");
       }
   
       @Bean
       public LocaleResolver localeResolver() {
           return new MyLocaleResolver();
       }
   
       @Override
       public void addInterceptors(InterceptorRegistry registry) {
           //添加不拦截的路径，SpringBoot已经做好了静态资源映射，所以我们不用管
           registry.addInterceptor(new LoginHandlerInterceptor())
                   .excludePathPatterns(excludePaths);
       }
   }
   ```

   !> 在spring2.0+的版本中，只要用户自定义了拦截器，则静态资源会被拦截。但是在spring1.0+的版本中，是不会拦截静态资源的。

   因此，在使用spring2.0+时，配置拦截器之后，我们要把静态资源的路径加入到不拦截的路径之中。



## CRUD-员工列表

使用rest风格

| 实验功能                             | 请求URI | 请求方式 |
| ------------------------------------ | ------- | -------- |
| 查询所有员工                         | emps    | GET      |
| 查询某个员工(来到修改页面)           | emp/1   | GET      |
| 来到添加页面                         | emp     | GET      |
| 添加员工                             | emp     | POST     |
| 来到修改页面（查出员工进行信息回显） | emp/1   | GET      |
| 修改员工                             | emp     | PUT      |
| 删除员工                             | emp/1   | DELETE   |

1. 为了页面结构清晰，在template文件夹下新建emp文件夹，将list.html移动到emp文件夹下

2. 将dao层和实体层[java代码](https://www.lanzous.com/i7eenib)复制到项目中`dao`，`entities`

3. 添加员工controller，实现查询员工列表的方法

   ```java
   @Controller
   public class EmpController {
   
       @Autowired
       private EmployeeDao employeeDao;
   
       @GetMapping("/emps")
       public String emps(Model model) {
           Collection<Employee> empList = employeeDao.getAll();
           model.addAttribute("emps", empList);
           return "emp/list";
       }
       
   }
   ```

4. 修改后台页面，更改左侧侧边栏，将`customer`改为`员工列表`，并修改请求路径

   ```html
   <li class="nav-item">
   	<a class="nav-link" th:href="@{/emps}">
   		<svg .....>
   			......
   		</svg>
   		员工列表
   	</a>
   </li>
   ```

5. 同样emp/list页面的左边侧边栏是和后台页面一模一样的，每个都要修改很麻烦，接下来，抽取公共片段



## thymeleaf公共页面元素抽取

### 语法

~{templatename::selector}：模板名::选择器

~{templatename::fragmentname}:模板名::片段名

```html
/*公共代码片段*/
<footer th:fragment="copy">
	&copy; 2011 The Good Thymes Virtual Grocery
</footer>

/*引用代码片段*/
<div th:insert="~{footer :: copy}"></di
    
/*（〜{...}包围是完全可选的，所以上⾯的代码 将等价于：*/
<div th:insert="footer :: copy"></di
```

具体参考官方文档：<https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#including-template-fragments>

三种引入公共片段的th属性：

- `th:insert`：将公共片段整个插入到声明引入的元素中
- `th:replace`：将声明引入的元素替换为公共片段
- `th:include`：将被引入的片段的内容包含进这个标签中

```html
/*公共片段*/
<footer th:fragment="copy">
&copy; 2011 The Good Thymes Virtual Grocery
</footer>

/*引入方式*/
<div th:insert="footer :: copy"></div>
<div th:replace="footer :: copy"></div>
<div th:include="footer :: copy"></div>


/*效果*/
<div>
    <footer>
    &copy; 2011 The Good Thymes Virtual Grocery
    </footer>
</div>

<footer>
&copy; 2011 The Good Thymes Virtual Grocery
</footer>

<div>
&copy; 2011 The Good Thymes Virtual Grocery
</div>
```



### 后台页面抽取

1. 将后台主页中的顶部导航栏作为片段，在list页面引入

   **dashboard.html：**

   ```html
   		<nav th:fragment="topbar" class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
   			<a class="navbar-brand col-sm-3 col-md-2 mr-0" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">Company name</a>
   			<input class="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search">
   			<ul class="navbar-nav px-3">
   				<li class="nav-item text-nowrap">
   					<a class="nav-link" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">Sign out</a>
   				</li>
   			</ul>
   		</nav>
   ```

   **list.html：**

   ```html
   <body>
   
   <div th:replace="dashboard::topbar"></div>
    
   ......
   ```

2. 使用选择器的方式 抽取左侧边栏代码

   **dashboard.html：**

   ```html
   <div class="container-fluid">
   	<div class="row">
   		<nav id="sidebar" class="col-md-2 d-none d-md-block bg-light sidebar" ......
   ```

   **list.html：**

   ```html
   <div class="container-fluid">
       <div class="row">
   		<div th:replace="dashboard::#sidebar"></div>
           ......
   ```

   
### 引入片段传递参数

实现点击当前项高亮

将`dashboard.html`中的公共代码块抽出为单独的html文件，放到commos文件夹下

在引入代码片段的时候可以传递参数，然后在sidebar代码片段模板中判断当前点击的链接

语法：

```
~{templatename::selector(变量名=值)}

/*或者在定义代码片段时，定义参数*/
<nav th:fragment="topbar(A,B)"
/*引入时直接传递参数*/
~{templatename::fragmentname(A值,B值)}
```



**topbar.html**

```html
<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<body>
<nav th:fragment="topbar" class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
    <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">Company
        name</a>
    <input class="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search">
    <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap">
            <a class="nav-link" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">Sign out</a>
        </li>
    </ul>
</nav>
</body>
</html>
```

**sidebar.html**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<nav id="sidebar" class="col-md-2 d-none d-md-block bg-light sidebar">
    <div class="sidebar-sticky">
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" th:class="${currentURI}=='main.html'?'nav-link active':'nav-link'" th:href="@{/main.html}">
  	.....
</body>
</html>
```

然后在`dashboard.html`和`list.html`中引入

```html
<body>
<div th:replace="commons/topbar::topbar"></div>
<div class="container-fluid">
    <div class="row">
        <div th:replace="commons/sidebar::#sidebar(currentURI='main.html')"></div>
		......
```

```html
<body>
<div th:replace="commons/topbar::topbar"></div>

<div class="container-fluid">
    <div class="row">
        <div th:replace="commons/sidebar::#sidebar(currentURI='emps')"></div>
        ......
```

1. 显示员工数据，添加增删改按钮

   ```html
           <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
               <h2>
                   <button class="btn btn-sm btn-success">添加员工</button>
               </h2>
               <div class="table-responsive">
                   <table class="table table-striped table-sm">
                       <thead>
                       <tr>
                           <th>员工号</th>
                           <th>姓名</th>
                           <th>邮箱</th>
                           <th>性别</th>
                           <th>部门</th>
                           <th>生日</th>
                           <th>操作</th>
                       </tr>
                       </thead>
                       <tbody>
                       <tr th:each="emp:${emps}">
                           <td th:text="${emp.id}"></td>
                           <td th:text="${emp.lastName}"></td>
                           <td th:text="${emp.email}"></td>
                           <td th:text="${emp.gender}==1?'男':'女'"></td>
                           <td th:text="${emp.department.departmentName}"></td>
                           <td th:text="${#dates.format(emp.birth,'yyyy-MM-dd')}"></td>
                           <td>
                               <button class="btn btn-sm btn-primary">修改</button>
                               <button class="btn btn-sm btn-danger">删除</button>
                           </td>
                       </tr>
                       </tbody>
                   </table>
               </div>
           </main>
   ```

   

### 员工添加

1. 创建员工添加页面`add.html`

   ```html
   ......
   <body>
   <div th:replace="commons/topbar::topbar"></div>
   
   <div class="container-fluid">
       <div class="row">
           <div th:replace="commons/sidebar::#sidebar(currentURI='emps')"></div>
           <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
               <form>
                   <div class="form-group">
                       <label>LastName</label>
                       <input name="lastName" type="text" class="form-control" placeholder="zhangsan">
                   </div>
                   <div class="form-group">
                       <label>Email</label>
                       <input  name="email" type="email" class="form-control" placeholder="zhangsan@atguigu.com">
                   </div>
                   <div class="form-group">
                       <label>Gender</label><br/>
                       <div class="form-check form-check-inline">
                           <input class="form-check-input" type="radio" name="gender" value="1">
                           <label class="form-check-label">男</label>
                       </div>
                       <div class="form-check form-check-inline">
                           <input class="form-check-input" type="radio" name="gender" value="0">
                           <label class="form-check-label">女</label>
                       </div>
                   </div>
                   <div class="form-group">
                       <label>department</label>
                       <select name="department.id" class="form-control">
                           <option th:each="dept:${departments}" th:text="${dept.departmentName}" th:value="${dept.id}"></option>
                       </select>
                   </div>
                   <div class="form-group">
                       <label>Birth</label>
                       <input name="birth" type="text" class="form-control" placeholder="zhangsan">
                   </div>
                   <button type="submit" class="btn btn-primary">添加</button>
               </form>
           </main>
       </div>
   </div>
   ......
   ```

2. 点击链接跳转到添加页面

   ```html
   <a href="/emp" th:href="@{/emp}" class="btn btn-sm btn-success">添加员工</a>
   ```

3. `EmpController`添加映射方法

   ```java
       @Autowired
       private DepartmentDao departmentDao;
   
       @GetMapping("/emp")
       public String toAddPage(Model model) {
           //准备部门下拉框数据
           Collection<Department> departments = departmentDao.getDepartments();
           model.addAttribute("departments",departments);
           return "emp/add";
       }
   ```

   

4. 修改页面遍历添加下拉选项

   ```html
   <select class="form-control">
       <option th:each="dept:${departments}" th:text="${dept.departmentName}"></option>
   </select>
   ```

5. 表单提交，添加员工

   ```html
   <form th:action="@{/emp}" method="post">
   ```

   ```java
       @PostMapping("/emp")
       public String add(Employee employee) {
           System.out.println(employee);
           //模拟添加到数据库
           employeeDao.save(employee);
           //添加成功重定向到列表页面
           return "redirect:/emps";
       }
   ```



### 日期格式修改

!> 表单提交的日期格式必须是`yyyy/MM/dd`的格式，可以在配置文件中修改格式

```properties
spring.mvc.date-format=yyyy-MM-dd
```





### 员工修改

1. 点击按钮跳转到编辑页面

   ```html
    <a th:href="@{/emp/}+${emp.id}" class="btn btn-sm btn-primary">修改</a>
   ```

2. 添加编辑页面，表单的提交要为post方式，提供`_method`参数

   ```html
   <body>
   <div th:replace="commons/topbar::topbar"></div>
   
   <div class="container-fluid">
       <div class="row">
           <div th:replace="commons/sidebar::#sidebar(currentURI='emps')"></div>
           <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
               <form th:action="@{/emp}" method="post">
                   <!--员工id-->
                   <input type="hidden" name="id" th:value="${emp.id}">
                   <!--http请求方式-->
                   <input type="hidden" name="_method" value="put">
                   <div class="form-group">
                       <label>LastName</label>
                       <input name="lastName" th:value="${emp.lastName}" type="text" class="form-control" placeholder="zhangsan">
                   </div>
                   <div class="form-group">
                       <label>Email</label>
                       <input  name="email" th:value="${emp.email}" type="email" class="form-control" placeholder="zhangsan@atguigu.com">
                   </div>
                   <div class="form-group">
                       <label>Gender</label><br/>
                       <div class="form-check form-check-inline">
                           <input class="form-check-input" type="radio" name="gender" value="1" th:checked="${emp.gender==1}">
                           <label class="form-check-label">男</label>
                       </div>
                       <div class="form-check form-check-inline">
                           <input class="form-check-input" type="radio" name="gender" value="0" th:checked="${emp.gender==0}">
                           <label class="form-check-label">女</label>
                       </div>
                   </div>
                   <div class="form-group">
                       <label>department</label>
                       <select name="department.id" class="form-control">
                           <option th:each="dept:${departments}" th:value="${dept.id}" th:selected="${dept.id}==${emp.department.id}" th:text="${dept.departmentName}"></option>
                       </select>
                   </div>
                   <div class="form-group">
                       <label>Birth</label>
                       <input name="birth" type="text" class="form-control" placeholder="zhangsan" th:value="${#dates.format(emp.birth,'yyyy-MM-dd')}">
                   </div>
                   <button type="submit" class="btn btn-primary">添加</button>
               </form>
           </main>
       </div>
   </div>
   
   ......
   ```

3. Controller转发到编辑页面，回显员工信息

   ```java
       @GetMapping("/emp/{id}")
       public String toEditPage(@PathVariable Integer id, Model model) {
           Employee employee = employeeDao.get(id);
           //准备部门下拉框数据
           Collection<Department> departments = departmentDao.getDepartments();
           model.addAttribute("emp", employee).addAttribute("departments", departments);
           return "emp/edit";
       }
   ```

4. 提交表单修改员工信息

   ```java
       @PutMapping("/emp")
       public String update(Employee employee) {
           employeeDao.save(employee);
           return "redirect:/emps";
       }
   ```





### 员工删除

1. 点击删除提交发出delete请求

   ```html
       @DeleteMapping("/emp/{id}")
       public String delete(@PathVariable String id){
           employeeDao.delete(id);
           return "redirect:/emps";
       }
   ```

   !> 如果提示不支持POST请求，在确保代码无误的情况下查看是否配置启动`HiddenHttpMethodFilter`

   ```properties
   spring.mvc.hiddenmethod.filter.enabled=true
   ```

   ![1573987255217](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573987255217.png)

   这个好像是2.0版本以后修改的

   ![1573988088629](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573988088629.png)

   !> 如果删除不掉，请修改`EmployeeDao`，把String转为Integer类型

   ```java
       public void delete(String id) {
           employees.remove(Integer.parseInt(id));
       }
   ```

   





