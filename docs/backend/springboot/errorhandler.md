# SpringBoot默认的错误处理机制

当访问一个不存在的页面，或者程序抛出异常时

**默认效果：**

- 浏览器返回一个默认的错误页面，  注意看浏览器发送请求的`请求头`：

  ![1573993746920](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573993746920.png)

- 其他客户端返回json数据，注意看`请求头`

  ![1573996455049](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573996455049.png)



查看`org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration`源码，

这里是springboot错误处理的自动配置信息

**主要给日容器中注册了以下组件：**

- ErrorPageCustomizer 系统出现错误以后来到error请求进行处理；相当于（web.xml注册的错误页面规则）
- BasicErrorController 处理/error请求
- DefaultErrorViewResolver 默认的错误视图解析器
- DefaultErrorAttributes 错误信息
- defaultErrorView 默认错误视图



## ErrorPageCustomizer

```java
    @Bean
    public ErrorMvcAutoConfiguration.ErrorPageCustomizer errorPageCustomizer(DispatcherServletPath dispatcherServletPath) {
        return new ErrorMvcAutoConfiguration.ErrorPageCustomizer(this.serverProperties, dispatcherServletPath);
    }
```

```java
    private static class ErrorPageCustomizer implements ErrorPageRegistrar, Ordered {
        private final ServerProperties properties;
        private final DispatcherServletPath dispatcherServletPath;

        protected ErrorPageCustomizer(ServerProperties properties, DispatcherServletPath dispatcherServletPath) {
            this.properties = properties;
            this.dispatcherServletPath = dispatcherServletPath;
        }

        //注册错误页面
        public void registerErrorPages(ErrorPageRegistry errorPageRegistry) {
            //getPath()获取到的是"/error"，见下图
            ErrorPage errorPage = new ErrorPage(this.dispatcherServletPath.getRelativePath(this.properties.getError().getPath()));
            errorPageRegistry.addErrorPages(new ErrorPage[]{errorPage});
        }

        public int getOrder() {
            return 0;
        }
    }
```

![1573994730632](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573994730632.png)



当请求出现错误后就会转发到`/error`



然后这个error请求就会被BasicErrorController处理；

## BasicErrorController

```java
    @Bean
    @ConditionalOnMissingBean(
        value = {ErrorController.class},
        search = SearchStrategy.CURRENT
    )
    public BasicErrorController basicErrorController(ErrorAttributes errorAttributes, ObjectProvider<ErrorViewResolver> errorViewResolvers) {
        return new BasicErrorController(errorAttributes, this.serverProperties.getError(), (List)errorViewResolvers.orderedStream().collect(Collectors.toList()));
    }
```

处理`/error`请求

```java
@Controller
/**
  * 使用配置文件中server.error.path配置
  * 如果server.error.path没有配置使用error.path
  * 如果error.path也没有配置就使用/error
  */
@RequestMapping({"${server.error.path:${error.path:/error}}"})
public class BasicErrorController extends AbstractErrorController
```

![1573996271708](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573996271708.png)

这两个方法一个用于浏览器请求响应html页面，一个用于其他客户端请求响应json数据

处理浏览器请求的方法 中，modelAndView存储到哪个页面的页面地址和页面内容数据

看一下调用的resolveErrorView方法

```java
    protected ModelAndView resolveErrorView(HttpServletRequest request, HttpServletResponse response, HttpStatus status, Map<String, Object> model) {
        Iterator var5 = this.errorViewResolvers.iterator();

        ModelAndView modelAndView;
        do {
            if (!var5.hasNext()) {
                return null;
            }

            ErrorViewResolver resolver = (ErrorViewResolver)var5.next();
            //从所有的ErrorViewResolver得到ModelAndView
            modelAndView = resolver.resolveErrorView(request, status, model);
        } while(modelAndView == null);

        return modelAndView;
    }
```

ErrorViewResolver从哪里来的呢？

已经在容器中注册了一个DefaultErrorViewResolver

## DefaultErrorViewResolver


```java
    @Configuration(
        proxyBeanMethods = false
    )
    static class DefaultErrorViewResolverConfiguration {
        private final ApplicationContext applicationContext;
        private final ResourceProperties resourceProperties;

        DefaultErrorViewResolverConfiguration(ApplicationContext applicationContext, ResourceProperties resourceProperties) {
            this.applicationContext = applicationContext;
            this.resourceProperties = resourceProperties;
        }

        //注册默认错误视图解析器
        @Bean
        @ConditionalOnBean({DispatcherServlet.class})
        @ConditionalOnMissingBean({ErrorViewResolver.class})
        DefaultErrorViewResolver conventionErrorViewResolver() {
            return new DefaultErrorViewResolver(this.applicationContext, this.resourceProperties);
        }
    }
```

然后调用ErrorViewResolver的`resolveErrorView()`方法

```java
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        //把状态码和model传过去获取视图
        ModelAndView modelAndView = this.resolve(String.valueOf(status.value()), model);
        
        //上面没有获取到视图就使用把状态吗替换再再找，以4开头的替换为4xx，5开头替换为5xx，见下文（如果定制错误响应）
        if (modelAndView == null && SERIES_VIEWS.containsKey(status.series())) {
            modelAndView = this.resolve((String)SERIES_VIEWS.get(status.series()), model);
        }

        return modelAndView;
    }

    private ModelAndView resolve(String viewName, Map<String, Object> model) {
        //viewName传过来的是状态码，例：/error/404
        String errorViewName = "error/" + viewName;
        TemplateAvailabilityProvider provider = this.templateAvailabilityProviders.getProvider(errorViewName, this.applicationContext);
        //模板引擎可以解析这个页面地址就用模板引擎解析
        return provider != null ? new ModelAndView(errorViewName, model) : this.resolveResource(errorViewName, model);
    }
```

如果模板引擎不可用，就调用resolveResource方法获取视图

```java
    private ModelAndView resolveResource(String viewName, Map<String, Object> model) {
        //获取的是静态资源文件夹
        String[] var3 = this.resourceProperties.getStaticLocations();
        int var4 = var3.length;

        for(int var5 = 0; var5 < var4; ++var5) {
            String location = var3[var5];

            try {
                Resource resource = this.applicationContext.getResource(location);
                //例：static/error.html
                resource = resource.createRelative(viewName + ".html");
                //存在则返回视图
                if (resource.exists()) {
                    return new ModelAndView(new DefaultErrorViewResolver.HtmlResourceView(resource), model);
                }
            } catch (Exception var8) {
            }
        }

        return null;
    }
```




**所以：**

## 如何定制错误响应页面

- 有模板引擎的情况下；将错误页面命名为  `错误状态码.html` 放在模板引擎文件夹里面的 error文件夹下发生此状态码的错误就会来到这里找对应的页面；

  比如我们在template文件夹下创建error/404.html当浏览器请求是404错误，就会使用我们创建的404.html页面响应，如果是其他状态码错误，还是使用默认的视图，但是如果404.html没有找到就会替换成4XX.html再查找一次，看`DefaultErrorViewResolver`中的静态代码块

  ```java
      static {
          Map<Series, String> views = new EnumMap(Series.class);
          views.put(Series.CLIENT_ERROR, "4xx");
          views.put(Series.SERVER_ERROR, "5xx");
          SERIES_VIEWS = Collections.unmodifiableMap(views);
      }
  
  .....
   //再看解析方法
              //把状态码和model传过去过去视图
          ModelAndView modelAndView = this.resolve(String.valueOf(status.value()), model);
          
          //上面没有获取到视图就把状态吗替换再找，以4开头的替换为4xx，5开头替换为5xx，见下文（如果定制错误响应）
          if (modelAndView == null && SERIES_VIEWS.containsKey(status.series())) {
              modelAndView = this.resolve((String)SERIES_VIEWS.get(status.series()), model);
          }
  ```

  **页面可以获取哪些数据**

## DefaultErrorAttributes

再看一下BasicErrorController的errorHtml方法

```java
    public ModelAndView errorHtml(HttpServletRequest request, HttpServletResponse response) {
        HttpStatus status = this.getStatus(request);
        
        //model的数据
        Map<String, Object> model = Collections.unmodifiableMap(this.getErrorAttributes(request, this.isIncludeStackTrace(request, MediaType.TEXT_HTML)));
        response.setStatus(status.value());
        ModelAndView modelAndView = this.resolveErrorView(request, response, status, model);
        return modelAndView != null ? modelAndView : new ModelAndView("error", model);
    }
```

看一下调用的this.getErrorAttributes()方法

```java
    protected Map<String, Object> getErrorAttributes(HttpServletRequest request, boolean includeStackTrace) {
        WebRequest webRequest = new ServletWebRequest(request);
        return this.errorAttributes.getErrorAttributes(webRequest, includeStackTrace);
    }
```

再看 this.errorAttributes.getErrorAttributes()方法， this.errorAttributes是接口类型ErrorAttributes，实现类就一个`DefaultErrorAttributes`，看一下`DefaultErrorAttributes`的 getErrorAttributes()方法

```java
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, boolean includeStackTrace) {
        Map<String, Object> errorAttributes = new LinkedHashMap();
        errorAttributes.put("timestamp", new Date());
        this.addStatus(errorAttributes, webRequest);
        this.addErrorDetails(errorAttributes, webRequest, includeStackTrace);
        this.addPath(errorAttributes, webRequest);
        return errorAttributes;
    }
```

- timestamp：时间戳
- status：状态码
- error：错误提示
- exception：异常对象
- message：异常消息
- errors：JSR303数据校验的错误都在这里

2.0以后默认是不显示exception的，需要在配置文件中开启

```java
server.error.include-exception=true
```

原因：

![1574001983704](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574001983704.png)

在注册时

![1574002101183](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574002101183.png)

- 没有模板引擎（模板引擎找不到这个错误页面），就会在静态资源文件夹下找；
- 如果以上都没有找到错误页面，就是默认来到SpringBoot默认的错误提示页面；

## defaultErrorView

![1574146899180](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574146899180.png)

![1574146843810](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574146843810.png)





## 如何定制JSON数据

springboot做了自适应效果，浏览器访问响应错误页面。客户端访问响应错误信息的json数据

1. 第一种方法，定义全局异常处理器类注入到容器中，捕获到异常返回json格式的数据

   ```java
   @ControllerAdvice
   public class MyExceptionHandler {
   
       @ResponseBody
       @ExceptionHandler(Exception.class)
       public Map<String, Object> handleException(Exception e) {
           Map<String, Object> map = new HashMap(2);
           map.put("code", "100011");
           map.put("msg", e.getMessage());
           return map;
       }
   }
   ```

   访问[localhost:8080/hello?str=hi](http://localhost:8080/hello?str=hi)

   ```java
   @RestController
   public class Hello {
   
       @RequestMapping("/hello")
       public String hello(String str) {
           if ("hi".equals(str)) {
               int i = 10 / 0;
           }
           return "hello world";
       }
   }
   ```

   这样的话，不管是浏览器访问还是客户端访问都是响应json数据，就没有了自适应效果

   2. 第二种方法，捕获到异常后转发到/error

      ```java
      @ControllerAdvice
      public class MyExceptionHandler {
      
          @ExceptionHandler(Exception.class)
          public String handleException(Exception e) {
              Map<String, Object> map = new HashMap(2);
              map.put("code", "100011");
              map.put("msg", e.getMessage());
              return "forward:/error";
          }
      }
      ```

      访问[localhost:8080/hello?str=hi](http://localhost:8080/hello?str=hi)，但这样异常被我们捕获然后转发，显示的状态码就是200，所以在转发之前还要设置一下状态码

      ```java
          @ExceptionHandler(Exception.class)
          public String handleException(Exception e, HttpServletRequest request) {
              Map<String, Object> map = new HashMap(2);
              map.put("code", "100011");
              map.put("msg", e.getMessage());
      
              //设置状态码
              request.setAttribute("javax.servlet.error.status_code", 500);
              return "forward:/error";
          }
      ```

      但是设置的数据就没有用了，只能使用默认的 

      由上面我们已经知道数据的来源是调用DefaultErrorAttributes的getErrorAttributes方法得到的，而这个DefaultErrorAttributes是在ErrorMvcAutoConfiguration配置类中注册的，并且注册之前会检查容器中是否已经拥有

      ```java
          @Bean
          @ConditionalOnMissingBean(
              value = {ErrorAttributes.class},
              search = SearchStrategy.CURRENT
          )
          public DefaultErrorAttributes errorAttributes() {
              return new DefaultErrorAttributes(this.serverProperties.getError().isIncludeException());
          }
      ```

      所以我们可以只要实现ErrorAttributes接口或者继承DefaultErrorAttributes类，然后注册到容器中就行了

      ```java
      @ControllerAdvice
      public class MyExceptionHandler {
      
          @ExceptionHandler(Exception.class)
          public String handleException(Exception e, HttpServletRequest request) {
              Map<String, Object> map = new HashMap(2);
              map.put("name", "hello");
              map.put("password", "123456");
      
              //设置状态码
              request.setAttribute("javax.servlet.error.status_code", 500);
      
              //把数据放到request域中
              request.setAttribute("ext", map);
              return "forward:/error";
          }
      }
      ```

      ```java
      @Configuration
      public class MyMvcConfig implements WebMvcConfigurer {
          
          @Bean
          public DefaultErrorAttributes errorAttributes() {
              return new MyErrorAttributes();
          }
      
          class MyErrorAttributes extends DefaultErrorAttributes {
              @Override
              public Map<String, Object> getErrorAttributes(WebRequest webRequest, boolean includeStackTrace) {
                  //调用父类的方法获取默认的数据
                  Map<String, Object> map = new HashMap<>(super.getErrorAttributes(webRequest, includeStackTrace));
                  //从request域从获取到自定义数据
                  Map<String, Object> ext = (Map<String, Object>) webRequest.getAttribute("ext", RequestAttributes.SCOPE_REQUEST);
                  map.putAll(ext);
                  return map;
              }
          }
          
          ......
      ```

      

      