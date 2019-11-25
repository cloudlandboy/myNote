# 配置嵌入式Servlet容器

## 如何定制和修改Servlet容器的相关配置

1. 修改和server有关的配置

   ```properties
   server.port=8081
   server.context-path=/crud
   
   server.tomcat.uri-encoding=UTF-8
   
   //通用的Servlet容器设置
   server.xxx
   //Tomcat的设置
   server.tomcat.xxx
   ```

2. 编写一个~~EmbeddedServletContainerCustomizer~~，2.0以后改为`WebServerFactoryCustomizer`：嵌入式的Servlet容器的定制器；来修改Servlet容器的配置

   ```java
   @Configuration
   public class MyMvcConfig implements WebMvcConfigurer {
   	@Bean
       public WebServerFactoryCustomizer webServerFactoryCustomizer() {
           return new WebServerFactoryCustomizer<ConfigurableWebServerFactory>() {
               @Override
               public void customize(ConfigurableWebServerFactory factory) {
                   factory.setPort(8088);
               }
           };
       }
   ......
   ```

   

!> 代码方式的配置会覆盖配置文件的配置

?> *小Tips：*  如果使用的是360极速浏览器就不要用8082端口了



## 注册Servlet三大组件

由于SpringBoot默认是以jar包的方式启动嵌入式的Servlet容器来启动SpringBoot的web应用，没有web.xml文件。

### Servlet

向容器中添加ServletRegistrationBean

```java
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Bean
    public ServletRegistrationBean myServlet() {
        ServletRegistrationBean register = new ServletRegistrationBean(new MyServlet(), "/myServlet");
        register.setLoadOnStartup(1);
        return register;
    }
    ......
```

<details>
<summary>MyServlet</summary>

```java
public class MyServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("servlet初始化");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        this.doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("this is MyServlet");
    }

}
```

</details>





### Filter

向容器中添加FilterRegistrationBean

```java
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {


    @Bean
    public FilterRegistrationBean myFilter() {
        FilterRegistrationBean register = new FilterRegistrationBean(new MyFilter());
        register.setUrlPatterns(Arrays.asList("/myServlet","/"));
        return register;
    }
    
    ......
```



<details>
<summary>MyFilter</summary>

```java
public class MyFilter extends HttpFilter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        response.getWriter().write("请求被拦截......");
    }
}
```

</details>



### Listener

向容器中注入ServletListenerRegistrationBean

```java
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Bean
    public ServletListenerRegistrationBean myServletContextListener(){
        return new ServletListenerRegistrationBean(new MyServletContextListener());
    }
    
    ......

```

<details>
<summary>MyListener</summary>

```java
public class MyServletContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("web容器   启动......");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("web容器   销毁......");
    }
}
```

</details>



## 替换为其他嵌入式web服务器

SpringBoot默认使用的是Tomcat

![1574170320042](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574170320042.png)

如果要换成其他的就把Tomcat的依赖排除掉，然后引入其他嵌入式Servlet容器的以来，如`Jetty`，`Undertow`

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <exclusions>
                <exclusion>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                    <groupId>org.springframework.boot</groupId>
                </exclusion>
            </exclusions>
        </dependency>

        <dependency>
            <artifactId>spring-boot-starter-jetty</artifactId>
            <groupId>org.springframework.boot</groupId>
        </dependency>
```

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <exclusions>
                <exclusion>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                    <groupId>org.springframework.boot</groupId>
                </exclusion>
            </exclusions>
        </dependency>

        <dependency>
            <artifactId>spring-boot-starter-undertow</artifactId>
            <groupId>org.springframework.boot</groupId>
        </dependency>
```

### 原理

**查看web容器自动配置类**

2.0以下是：~~*EmbeddedServletContainerAutoConfiguration*~~

`ServletWebServerFactoryAutoConfiguration`：嵌入式的web服务器自动配置

```java
@Configuration(
    proxyBeanMethods = false
)
@AutoConfigureOrder(-2147483648)
@ConditionalOnClass({ServletRequest.class})
@ConditionalOnWebApplication(
    type = Type.SERVLET
)
@EnableConfigurationProperties({ServerProperties.class})

//---看这里---
@Import({ServletWebServerFactoryAutoConfiguration.BeanPostProcessorsRegistrar.class, EmbeddedTomcat.class, EmbeddedJetty.class, EmbeddedUndertow.class})
public class ServletWebServerFactoryAutoConfiguration {
```

`EmbeddedTomcat.class`：

```java
    @Configuration(
        proxyBeanMethods = false
    )
	//判断当前是否引入了Tomcat依赖；
    @ConditionalOnClass({Servlet.class, Tomcat.class, UpgradeProtocol.class})
	/**
	  *判断当前容器没有用户自己定义ServletWebServerFactory：嵌入式的web服务器工厂；
	  *作用：创建嵌入式的web服务器
	  */
    @ConditionalOnMissingBean(
        value = {ServletWebServerFactory.class},
        search = SearchStrategy.CURRENT
    )
    public static class EmbeddedTomcat {
```

`ServletWebServerFactory`：嵌入式的web服务器工厂

```java
@FunctionalInterface
public interface ServletWebServerFactory {
    //获取嵌入式的Servlet容器
    WebServer getWebServer(ServletContextInitializer... initializers);
}
```

工厂实现类

![1574172121748](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574172121748.png)

`WebServer`：嵌入式的web服务器实现

![1574172310812](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574172310812.png)

以`TomcatServletWebServerFactory`为例，下面是TomcatServletWebServerFactory类

```java
    public WebServer getWebServer(ServletContextInitializer... initializers) {
        if (this.disableMBeanRegistry) {
            Registry.disableRegistry();
        }

        //创建一个Tomcat
        Tomcat tomcat = new Tomcat();
        
        //配置Tomcat的基本环境，（tomcat的配置都是从本类获取的，tomcat.setXXX）
        File baseDir = this.baseDirectory != null ? this.baseDirectory : this.createTempDir("tomcat");
        tomcat.setBaseDir(baseDir.getAbsolutePath());
        Connector connector = new Connector(this.protocol);
        connector.setThrowOnFailure(true);
        tomcat.getService().addConnector(connector);
        this.customizeConnector(connector);
        tomcat.setConnector(connector);
        tomcat.getHost().setAutoDeploy(false);
        this.configureEngine(tomcat.getEngine());
        Iterator var5 = this.additionalTomcatConnectors.iterator();

        while(var5.hasNext()) {
            Connector additionalConnector = (Connector)var5.next();
            tomcat.getService().addConnector(additionalConnector);
        }

        this.prepareContext(tomcat.getHost(), initializers);
        
        //将配置好的Tomcat传入进去，返回一个WebServer；并且启动Tomcat服务器
        return this.getTomcatWebServer(tomcat);
    }
```



我们对嵌入式容器的配置修改是怎么生效的？

### 配置修改原理

`ServletWebServerFactoryAutoConfiguration`在向容器中添加web容器时还添加了一个组件

![1574235580031](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574235580031.png)

`BeanPostProcessorsRegistrar`：后置处理器注册器(也是给容器注入一些组件)

```java
    public static class BeanPostProcessorsRegistrar implements ImportBeanDefinitionRegistrar, BeanFactoryAware {
        private ConfigurableListableBeanFactory beanFactory;

        public BeanPostProcessorsRegistrar() {...}

        public void setBeanFactory(BeanFactory beanFactory) throws BeansException {...}

        public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
            if (this.beanFactory != null) {
                //注册了下面两个组件
                this.registerSyntheticBeanIfMissing(registry, "webServerFactoryCustomizerBeanPostProcessor", WebServerFactoryCustomizerBeanPostProcessor.class);
                this.registerSyntheticBeanIfMissing(registry, "errorPageRegistrarBeanPostProcessor", ErrorPageRegistrarBeanPostProcessor.class);
            }
        }

        private void registerSyntheticBeanIfMissing(BeanDefinitionRegistry registry, String name, Class<?> beanClass) {...}
    }
```

`webServerFactoryCustomizerBeanPostProcessor`

```java
public class WebServerFactoryCustomizerBeanPostProcessor implements BeanPostProcessor, BeanFactoryAware {
    
    ......
        
    //在Bean初始化之前
	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        //判断添加的Bean是不是WebServerFactory类型的
        if (bean instanceof WebServerFactory) {
            this.postProcessBeforeInitialization((WebServerFactory)bean);
        }

        return bean;
    }

    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }

    private void postProcessBeforeInitialization(WebServerFactory webServerFactory) {
        //获取所有的定制器，调用每一个定制器的customize方法来给Servlet容器进行属性赋值；
        ((Callbacks)LambdaSafe.callbacks(WebServerFactoryCustomizer.class, this.getCustomizers(), webServerFactory, new Object[0]).withLogger(WebServerFactoryCustomizerBeanPostProcessor.class)).invoke((customizer) -> {
            customizer.customize(webServerFactory);
        });
    }
```

关于配置文件是如何设置的，参考`EmbeddedWebServerFactoryCustomizerAutoConfiguration`类，最后还是使用上面的方便



总结：

1. SpringBoot根据导入的依赖情况，给容器中添加相应的`XXX`ServletWebServerFactory

2. 容器中某个组件要创建对象就会惊动后置处理器 `webServerFactoryCustomizerBeanPostProcessor`

   只要是嵌入式的是Servlet容器工厂，后置处理器就会工作；

3. 后置处理器，从容器中获取所有的`WebServerFactoryCustomizer`，调用定制器的定制方法给工厂添加配置



## 嵌入式Servlet容器启动原理

1. SpringBoot应用启动运行run方法

   ![1574242390909](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574242390909.png)

2. 153行，创建IOC容器对象，根据当前环境创建

   ![1574242209298](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574242209298.png)

3. 156行，刷新IOC容器

4. 刷新IOC容器中272行，onRefresh()；web的ioc容器重写了onRefresh方法，查看`ServletWebServerApplicationContext`类的onRefresh方法，在方法中调用了this.createWebServer();方法创建web容器

   ```java
       protected void onRefresh() {
           super.onRefresh();
   
           try {
               this.createWebServer();
           } catch (Throwable var2) {
               throw new ApplicationContextException("Unable to start web server", var2);
           }
       }
   ```

   98行获取嵌入式的web容器工厂

   ![1574243084120](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574243084120.png)

5. 接下来就是上面的上面的相关配置流程，在创建web容器工厂时会触发`webServerFactoryCustomizerBeanPostProcessor`

6. 然后99行**使用容器工厂获取嵌入式的Servlet容器**

7. 嵌入式的Servlet容器创建对象并启动Servlet容器；

8. 嵌入式的Servlet容器启动后，再将ioc容器中剩下没有创建出的对象获取出来(Controller,Service等)；



## 使用外置的Servlet容器

1. 将项目的打包方式改为war

2. 编写一个类继承`SpringBootServletInitializer`，并重写configure方法，调用参数的sources方法springboot启动类传过去然后返回

   ```java
   public class ServletInitializer extends SpringBootServletInitializer {
       @Override
       protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
           return application.sources(HelloSpringBootWebApplication.class);
       }
   }
   ```

3. 然后把tomcat的依赖范围改为provided

   ```xml
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-tomcat</artifactId>
               <version>2.2.1.RELEASE</version>
               <scope>provided</scope>
           </dependency>
           
           ......
           
   	</dependencies>
   ```

   

4. 最后就可以把项目打包成war放到tomcat中了

5. 在IDEA中可以这样配置

   ![1574247311250](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574247311250.png)

6. 在创建项目时使用Spring Initializr创建选择打包方式为war，1，2，3步骤会自动配置

!> 如果启动tomcat，报了一大堆错误，不妨把Tomcat改为更高的版本试试，如果你项目中的Filter是继承了HttpFilter，请使用tomcat9版本，9以下好像没有HttpFilter



### 原理

?> *TODO* 2019-11-20

1. Servlet3.0标准ServletContainerInitializer扫描所有jar包中METAINF/services/javax.servlet.ServletContainerInitializer文件指定的类并加载

2. 还可以使用@HandlesTypes，在应用启动的时候加载我们感兴趣的类；

3. 在spring-web-xxx.jar包中的METAINF/services下有javax.servlet.ServletContainerInitializer这个文件

   文件中的类是：

   ```
   org.springframework.web.SpringServletContainerInitializer
   ```

   对应的类：

   ```java
   @HandlesTypes({WebApplicationInitializer.class})
   public class SpringServletContainerInitializer implements ServletContainerInitializer {
       public SpringServletContainerInitializer() {
       }
   
       public void onStartup(@Nullable Set<Class<?>> webAppInitializerClasses, ServletContext servletContext) throws ServletException {
           
           ......
   ```

4. SpringServletContainerInitializer将@HandlesTypes(WebApplicationInitializer.class)标注的所有这个类型的类都传入到onStartup方法的`Set<Class<?>>`；为这些WebApplicationInitializer类型的类创建实例；

5. 每一个WebApplicationInitializer都调用自己的onStartup方法；

6. WebApplicationInitializer的实现类

   ![1574256076145](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574256076145.png)

7. 相当于我们的SpringBootServletInitializer的类会被创建对象，并执行onStartup方法

8. SpringBootServletInitializer实例执行onStartup的时候会createRootApplicationContext；创建容器

   ```java
   protected WebApplicationContext createRootApplicationContext(
         ServletContext servletContext) {
       //1、创建SpringApplicationBuilder
      SpringApplicationBuilder builder = createSpringApplicationBuilder();
      StandardServletEnvironment environment = new StandardServletEnvironment();
      environment.initPropertySources(servletContext, null);
      builder.environment(environment);
      builder.main(getClass());
      ApplicationContext parent = getExistingRootWebApplicationContext(servletContext);
      if (parent != null) {
         this.logger.info("Root context already created (using as parent).");
         servletContext.setAttribute(
               WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, null);
         builder.initializers(new ParentContextApplicationContextInitializer(parent));
      }
      builder.initializers(
            new ServletContextApplicationContextInitializer(servletContext));
      builder.contextClass(AnnotationConfigEmbeddedWebApplicationContext.class);
       
       //调用configure方法，子类重写了这个方法，将SpringBoot的主程序类传入了进来
      builder = configure(builder);
       
       //使用builder创建一个Spring应用
      SpringApplication application = builder.build();
      if (application.getSources().isEmpty() && AnnotationUtils
            .findAnnotation(getClass(), Configuration.class) != null) {
         application.getSources().add(getClass());
      }
      Assert.state(!application.getSources().isEmpty(),
            "No SpringApplication sources have been defined. Either override the "
                  + "configure method or add an @Configuration annotation");
      // Ensure error pages are registered
      if (this.registerErrorPageFilter) {
         application.getSources().add(ErrorPageFilterConfiguration.class);
      }
       //启动Spring应用
      return run(application);
   }
   ```

9. Spring的应用就启动并且创建IOC容器

   ```java
   public ConfigurableApplicationContext run(String... args) {
      StopWatch stopWatch = new StopWatch();
      stopWatch.start();
      ConfigurableApplicationContext context = null;
      FailureAnalyzers analyzers = null;
      configureHeadlessProperty();
      SpringApplicationRunListeners listeners = getRunListeners(args);
      listeners.starting();
      try {
         ApplicationArguments applicationArguments = new DefaultApplicationArguments(
               args);
         ConfigurableEnvironment environment = prepareEnvironment(listeners,
               applicationArguments);
         Banner printedBanner = printBanner(environment);
         context = createApplicationContext();
         analyzers = new FailureAnalyzers(context);
         prepareContext(context, environment, listeners, applicationArguments,
               printedBanner);
          
          //刷新IOC容器
         refreshContext(context);
         afterRefresh(context, applicationArguments);
         listeners.finished(context, null);
         stopWatch.stop();
         if (this.logStartupInfo) {
            new StartupInfoLogger(this.mainApplicationClass)
                  .logStarted(getApplicationLog(), stopWatch);
         }
         return context;
      }
      catch (Throwable ex) {
         handleRunFailure(context, listeners, analyzers, ex);
         throw new IllegalStateException(ex);
      }
   }
   ```

   

