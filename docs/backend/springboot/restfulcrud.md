## restful风格的增删改查

静态资源文件：https://www.lanzous.com/i7eenib

1. 将静态资源(css,img,js)添加到项目中，放到springboot[默认的静态资源文件夹下](backend/springboot/helloweb?id=非webjars，自己的静态资源怎么访问)
2. 将模板文件(html)放到[template文件夹下](backend/springboot/templateengine?id=thymeleaf%e4%bd%bf%e7%94%a8)

![1573896827010](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573896827010.png)

!> 如果你的静态资源明明放到了静态资源文件夹下却无法访问，请检查一下是不是在自定义的配置类上加了**@EnableWebMvc注解**

### 默认访问首页

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

### i18n国际化

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




### 点击连接切换语言


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