# SpringMVC自动配置

Spring Boot为Spring MVC提供了自动配置，可与大多数应用程序完美配合。

以下是SpringBoot对SpringMVC的默认配置

**`org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration`**

自动配置在Spring的默认值之上添加了以下功能：

- 包含`ContentNegotiatingViewResolver`和`BeanNameViewResolver`。--> 视图解析器
- 支持服务静态资源，包括对WebJars的支持（[官方文档中有介绍](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-static-content)）。--> 静态资源文件夹路径
- 自动注册`Converter`，`GenericConverter`和`Formatter `beans。--> 转换器，格式化器
- 支持`HttpMessageConverters`（[官方文档中有介绍](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-message-converters)）。--> SpringMVC用来转换Http请求和响应的；User---Json；
- 自动注册`MessageCodesResolver`（[官方文档中有介绍](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-message-codes)）。--> 定义错误代码生成规则
- 静态`index.html`支持。--> 静态首页访问
- 定制`Favicon`支持（[官方文档中有介绍](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-favicon)）。--> 网站图标
- 自动使用`ConfigurableWebBindingInitializer`bean（[官方文档中有介绍](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-web-binding-initializer)）。

如果您想保留 Spring Boot MVC 的功能，并且需要添加其他 [MVC 配置](https://docs.spring.io/spring/docs/5.1.3.RELEASE/spring-framework-reference/web.html#mvc)（拦截器，格式化程序和视图控制器等），可以添加自己的 `WebMvcConfigurer` 类型的 `@Configuration` 类，但**不能**带 `@EnableWebMvc` 注解。如果您想自定义 `RequestMappingHandlerMapping`、`RequestMappingHandlerAdapter` 或者 `ExceptionHandlerExceptionResolver` 实例，可以声明一个 `WebMvcRegistrationsAdapter` 实例来提供这些组件。

如果您想完全掌控 Spring MVC，可以添加自定义注解了 `@EnableWebMvc` 的 @Configuration 配置类。

## 视图解析器

视图解析器：根据方法的返回值得到视图对象（View），视图对象决定如何渲染（转发？重定向？）

- 自动配置了ViewResolver
- ContentNegotiatingViewResolver：组合所有的视图解析器的；

![1573873741438](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224506.png)

视图解析器从哪里来的？

![1573874365778](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224779.png)

<mark>**所以我们可以自己给容器中添加一个视图解析器；自动的将其组合进来**`

```java
@Component
public class MyViewResolver implements ViewResolver {

    @Override
    public View resolveViewName(String s, Locale locale) throws Exception {
        return null;
    }
}
```



![1573875409759](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225059.png)



## 转换器、格式化器

- `Converter`：转换器；  public String hello(User user)：类型转换使用Converter（表单数据转为user）
- `Formatter`  格式化器；  2017.12.17===Date；

```java
		@Bean
		//在配置文件中配置日期格式化的规则
		@ConditionalOnProperty(prefix = "spring.mvc", name = "date-format")
		public Formatter<Date> dateFormatter() {
			return new DateFormatter(this.mvcProperties.getDateFormat());//日期格式化组件
		}
```

<mark>**自己添加的格式化器转换器，我们只需要放在容器中即可**`



## HttpMessageConverters

- `HttpMessageConverter`：SpringMVC用来转换Http请求和响应的；User---Json；
- `HttpMessageConverters` 是从容器中确定；获取所有的HttpMessageConverter；

<mark>**自己给容器中添加HttpMessageConverter，只需要将自己的组件注册容器中（@Bean,@Component）**`



## MessageCodesResolver

<mark>**我们可以配置一个ConfigurableWebBindingInitializer来替换默认的；（添加到容器）**`



## 扩展SpringMVC

以前的配置文件中的配置

```xml
<mvc:view-controller path="/hello" view-name="success"/>
```

<mark>**现在，编写一个配置类（@Configuration），是WebMvcConfigurer类型；不能标注@EnableWebMvc**`

```java
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/hi").setViewName("success");
    }
}
```

访问：[http://localhost:8080/hi](http://localhost:8080/hi)



**原理：**

我们知道`WebMvcAutoConfiguration`是SpringMVC的自动配置类

下面这个类是`WebMvcAutoConfiguration`中的一个内部类

![1573891167026](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225310.png)

看一下`@Import({WebMvcAutoConfiguration.EnableWebMvcConfiguration.class})`中的这个类，

这个类依旧是`WebMvcAutoConfiguration`中的一个内部类

![1573891478014](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225539.png)

重点看一下这个类继承的父类`DelegatingWebMvcConfiguration`

```java
public class DelegatingWebMvcConfiguration extends WebMvcConfigurationSupport {
    private final WebMvcConfigurerComposite configurers = new WebMvcConfigurerComposite();

    public DelegatingWebMvcConfiguration() {
    }

    //自动注入，从容器中获取所有的WebMvcConfigurer
    @Autowired(
        required = false
    )
    public void setConfigurers(List<WebMvcConfigurer> configurers) {
        if (!CollectionUtils.isEmpty(configurers)) {
            this.configurers.addWebMvcConfigurers(configurers);
        }

    }
    
    ......
     
    /**
     * 查看其中一个方法
 	 * this.configurers：也是WebMvcConfigurer接口的一个实现类
 	 * 看一下调用的configureViewResolvers方法 ↓
 	 */
    protected void configureViewResolvers(ViewResolverRegistry registry) {
        this.configurers.configureViewResolvers(registry);
    }
```

```java
    public void configureViewResolvers(ViewResolverRegistry registry) {
        Iterator var2 = this.delegates.iterator();

        while(var2.hasNext()) {
            WebMvcConfigurer delegate = (WebMvcConfigurer)var2.next();
            //将所有的WebMvcConfigurer相关配置都来一起调用；  
            delegate.configureViewResolvers(registry);
        }

    }
```

容器中所有的WebMvcConfigurer都会一起起作用；

我们的配置类也会被调用；

效果：SpringMVC的自动配置和我们的扩展配置都会起作用；

![1573892805539](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225775.png)

## 全面接管SpringMVC

SpringBoot对SpringMVC的自动配置不需要了，所有都是由我们自己来配置；所有的SpringMVC的自动配置都失效了

**我们只需要在配置类中添加`@EnableWebMvc`即可；**

```java
@Configuration
@EnableWebMvc
public class MyMvcConfig implements WebMvcConfigurer
```

![1573892899452](https://cdn.tencentfs.clboy.cn/images/2021/20210911203226010.png)

原理：

为什么@EnableWebMvc自动配置就失效了；

我们看一下EnableWebMvc注解类

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Documented
@Import({DelegatingWebMvcConfiguration.class})
public @interface EnableWebMvc {
}
```

重点在于`@Import({DelegatingWebMvcConfiguration.class})`

`DelegatingWebMvcConfiguration`是`WebMvcConfigurationSupport`的子类

我们再来看一下springmvc的自动配置类`WebMvcAutoConfiguration`

```java
@Configuration(
    proxyBeanMethods = false
)
@ConditionalOnWebApplication(
    type = Type.SERVLET
)
@ConditionalOnClass({Servlet.class, DispatcherServlet.class, WebMvcConfigurer.class})

//重点是这个注解，只有当容器中没有这个类型组件的时候该配置类才会生效
@ConditionalOnMissingBean({WebMvcConfigurationSupport.class})

@AutoConfigureOrder(-2147483638)
@AutoConfigureAfter({DispatcherServletAutoConfiguration.class, TaskExecutionAutoConfiguration.class, ValidationAutoConfiguration.class})
public class WebMvcAutoConfiguration 
```

1. @EnableWebMvc将WebMvcConfigurationSupport组件导入进来；
2. 导入的WebMvcConfigurationSupport只是SpringMVC最基本的功能；



## 如何修改SpringBoot的默认配置

SpringBoot在自动配置很多组件的时候，先看容器中有没有用户自己配置的（@Bean、@Component）如果有就用用户配置的，如果没有，才自动配置；如果有些组件可以有多个（ViewResolver）将用户配置的和自己默认的组合起来；

- 在SpringBoot中会有非常多的xxxConfigurer帮助我们进行扩展配置
- 在SpringBoot中会有很多的xxxCustomizer帮助我们进行定制配置

