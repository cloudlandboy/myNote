# Scope

Scope 用于指定 Bean 的作用范围，有如下五个取值：

- `singleton`（单例）：这是默认的作用域。在这种作用域下，Spring容器中只会创建一个Bean实例，并且所有对该Bean的请求都会返回同一个实例。
- `prototype`（原型）：在原型作用域下，每次请求Bean时，Spring容器都会创建一个新的Bean实例。
- `request`（请求）：这个作用域将每个HTTP请求映射到一个Bean实例。在同一次HTTP请求内，对同一个Bean的多次获取操作都会返回同一个实例。但是不同的请求将会获取到不同的实例。
- `session`（会话）：与请求作用域类似，不过是针对Web应用中的会话（Session）级别。同一个会话内，对同一个Bean的多次获取操作都会返回同一个实例。不同会话之间的Bean实例是独立的。
- `application`（Web应用程序）：在整个Web应用中，只会创建一个Bean实例，类似于单例作用域。但是与单例不同的是，应用程序作用域的Bean生命周期与Web应用的生命周期相同。



## 创建与销毁

除了单例，现在我们创建其余几个作用域的案例Bean

```java
public class Beans {

    @Slf4j
    @Component
    @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public static class PrototypeBean {
        @PostConstruct
        public void postConstruct() {
            log.info("postConstruct");
        }

        @PreDestroy
        public void preDestroy() {
            log.info("preDestroy");
        }
    }

    @Slf4j
    @Component
    @Scope(WebApplicationContext.SCOPE_REQUEST)
    public static class RequestBean {
        @PostConstruct
        public void postConstruct() {
            log.info("postConstruct");
        }

        @PreDestroy
        public void preDestroy() {
            log.info("preDestroy");
        }
    }

    @Slf4j
    @Component
    @Scope(WebApplicationContext.SCOPE_SESSION)
    public static class SessionBean {
        @PostConstruct
        public void postConstruct() {
            log.info("postConstruct");
        }

        @PreDestroy
        public void preDestroy() {
            log.info("preDestroy");
        }
    }

    @Slf4j
    @Component
    @Scope(WebApplicationContext.SCOPE_APPLICATION)
    public static class ApplicationBean {
        @PostConstruct
        public void postConstruct() {
            log.info("postConstruct");
        }

        @PreDestroy
        public void preDestroy() {
            log.info("preDestroy");
        }
    }
    
}

```

再创建Controller用于测试

```java
@Controller
@RestController
@RequiredArgsConstructor
public class TestController {

    private final ApplicationContext context;

    @GetMapping(value = "/test", produces = MediaType.TEXT_HTML_VALUE)
    public String test(HttpSession session) {
        // 设置session过期时间为10秒,实际上要等待1分钟左右
        session.setMaxInactiveInterval(10);
        StringJoiner joiner = new StringJoiner("<br>");
        joiner.add(context.getBean(Beans.PrototypeBean.class).toString());
        joiner.add(context.getBean(Beans.RequestBean.class).toString());
        joiner.add(context.getBean(Beans.SessionBean.class).toString());
        joiner.add(context.getBean(Beans.ApplicationBean.class).toString());
        return joiner.toString();
    }

}
```

启动类

```java
@SpringBootApplication(exclude = {
        DataSourceAutoConfiguration.class,
        DruidDataSourceAutoConfigure.class
})
public class ScopeApp {

    public static void main(String[] args) {
        SpringApplication.run(ScopeApp.class, args);
    }
}
```

为了让日志更简洁清晰，再在 `application.yml` 中配置下日志级别

```yaml
logging:
  level:
    root: error
    cn.clboy.springboot.starter.demo.g: debug
```

假设端口是8080，启动后访问 http://127.0.0.1:8080/test

然后每次刷新页面，就会看到 `prototype` 和 `request` 作用域的地址都会改变，session域的等待过期后才会改变

通过控制台打印的日志也可以看到各个类型作用域的Bean的创建与销毁时机

![20230818161117](https://cdn.tencentfs.clboy.cn/images/20230818161117.gif)

## 失效分析

上述案例中，我们是通过注入 `ApplicationContext` ,然后每次调用其 getBean 方法来获取Bean实例的，这样没什么问题

如果我们直接注入Bean呢？

```java
public class TestController {

    // ......

    @Autowired
    private Beans.PrototypeBean prototypeBean;
    @Autowired
    private Beans.RequestBean requestBean;
    @Autowired
    private Beans.SessionBean sessionBean;
    @Autowired
    private Beans.ApplicationBean applicationBean;

    @GetMapping(value = "/test2", produces = MediaType.TEXT_HTML_VALUE)
    public String test2(HttpSession session) {
        // 设置session过期时间为10秒,实际上要等待1分钟左右
        session.setMaxInactiveInterval(10);
        StringJoiner joiner = new StringJoiner("<br>");
        joiner.add(prototypeBean.toString());
        joiner.add(requestBean.toString());
        joiner.add(sessionBean.toString());
        joiner.add(applicationBean.toString());
        joiner.add("==> prototypeBean class：" + prototypeBean.getClass());
        joiner.add("==> requestBean class：" + requestBean.getClass());
        joiner.add("==> sessionBean class：" + sessionBean.getClass());
        joiner.add("==> applicationBean class：" + applicationBean.getClass());
        return joiner.toString();
    }

}
```

这样，你会发现启动时会报错，因为 `requestBean`  、`sessionBean` 与请求有关，启动的时候没有请求，无法创建Bean并注入



## @Lazy



为了能正常启动，我们需要给在其加上 `@Lazy` 注解

```java
@Lazy
@Autowired
private Beans.RequestBean requestBean;

@Lazy
@Autowired
private Beans.SessionBean sessionBean;
```

然后访问：http://127.0.0.1:8080/test2

![20230818165530](https://cdn.tencentfs.clboy.cn/images/20230818165530.gif)

你会发现这次 `prototype` 域的对象始终获取的是同一个

再观察对象的Class，使用了 `@Lazy` 注解注入的对象其实是spring增强的代理对象，每次调用对象的方法时，是由代理对象负责创建对象并调用

而 `prototypeBean` 未使用 `@Lazy` 注解，在注入的时候就把对象实例确定死了

对于单例对象来说，依赖注入仅发生了一次，因此 `prototypeBean` 始终使用的是第一次注入的：

![image-20230818170658481](https://cdn.tencentfs.clboy.cn/images/image-20230818170658481.png)

代理对象虽然还是同一个，但当每次 **使用代理对象的任意方法** 时，由代理创建被代理的对象

![image-20230818171010203](https://cdn.tencentfs.clboy.cn/images/image-20230818171010203.png)



## @Scope-proxyMode



除了使用 `@Lazy` 注解外，还可以使用 `@Scope` 注解的 `proxyMode` 属性指定代理模式：

```java
@Slf4j
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public static class RequestBean
```

然后给 `requestBean` 的 `@Lazy` 注解去掉，效果和使用  `@Lazy`  一致

```java
@Autowired
private Beans.RequestBean requestBean;
```



## ObjectFactory



第三中方法是使用 `ObjectFactory`

```java
@Autowired
private ObjectFactory<Beans.PrototypeBean> prototypeBeanFactory;

@GetMapping(value = "/test2", produces = MediaType.TEXT_HTML_VALUE)
public String test2(HttpSession session) {
   
    Beans.PrototypeBean prototypeBean = prototypeBeanFactory.getObject();
    joiner.add(prototypeBean.toString());
    //...... 
    joiner.add("==> prototypeBean class：" + prototypeBean.getClass());
    return joiner.toString();
}
```



## 总结

对于多例Bean的注入主要由4中方法

1. 使用 `@Lazy` 注解
2. 使用 `@Scope` 的 proxyMode 属性
3. 使用  `ObjectFactory` 
4. 就是注入 `ApplicationContext` ，通过其 `getBean` 方法获取

?> 推荐使用方式3和4

