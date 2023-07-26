# 容器接口



## 启动类

首先看一下SpringBoot 的启动类，调用 `SpringApplication.run`  方法后开始运行springboot程序

run方法会返回 `ConfigurableApplicationContext` 类型的对象

```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);
    }

}
```

在 IDEA 中使用快捷键 `Ctrl + Alt + U`  可以查看 `ConfigurableApplicationContext` 类的继承关系：

![image-20230726091829199](https://cdn.tencentfs.clboy.cn/images/2023/20230726175032167.png)

`ConfigurableApplicationContext` 接口继承了 `ApplicationContext` 接口，而 `ApplicationContext` 接口又间接地继承了 `BeanFactory` 接口，除此之外还继承了其他很多接口，相当于对 `BeanFactory` 进行了拓展



## BeanFactory



- 它是 ApplicationContext 的父接口

- 它才是 Spring 的核心容器, 主要的 ApplicationContext 实现都【组合】了它的功能



### 它能做什么

看一下BeanFactory 接口中都定义了哪些方法 (idea中使用 `Ctrl + F12` 快捷键) 

![image-20230726092805751](https://cdn.tencentfs.clboy.cn/images/2023/20230726175026640.png)



通过这些方法定义可知，`BeanFactory` 表面上只有 `getBean()` 方法，但实际上 Spring 中的控制反转、基本的依赖注入、直至 Bean 的生命周期的各种功能, 都由它的实现类提供

ApplicationContext中的getBean是自己实现了BeanFactory 接口吗？

看一下它的实现类，其实是将 `ConfigurableListableBeanFactory`  作为自己的成员变量，调用 `getBean` 等方法是其实是调用成员变量的方法

```java
// AbstractApplicationContext

@Override
public <T> T getBean(Class<T> requiredType) throws BeansException {
	assertBeanFactoryActive();
	return getBeanFactory().getBean(requiredType);
}

@Override
public abstract ConfigurableListableBeanFactory getBeanFactory() throws IllegalStateException;
```



### DefaultListableBeanFactory

`DefaultListableBeanFactory` 实现了 `BeanFactory` 接口，它能管理 Spring 中所有的 Bean，下面是它的类继承关系图：

![image-20230726095553312](https://cdn.tencentfs.clboy.cn/images/2023/20230726174325965.png)

它继承了 `DefaultSingletonBeanRegistry` 类，从名称就可以看出这个类是用来管理 Spring 容器中的单例对象

`DefaultSingletonBeanRegistry` 中有一个名为 `singletonObjects` 的ConcurrentHashMap类型成员变量，这个map中就是用来存放所有单例对象的

```java
// key为bean的名称，value是bean实例
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);
```

我们知道启动类也会被注册到容器中，通过反射获取singletonObjects，打印是否包含启动类

```java
public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
    ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);
    Field singletonObjects = DefaultSingletonBeanRegistry.class.getDeclaredField("singletonObjects");
    singletonObjects.setAccessible(true);
    Map<String, Object> o = (Map<String, Object>) singletonObjects.get(context.getBeanFactory());
    System.out.println(o.containsKey("springBootDemoApplication"));
}
```



## ApplicationContext

它比BeanFactory多什么？

回顾 `ConfigurableApplicationContext` 类的继承关系，其父接口 `ApplicationContext` 除了继承 `BeanFactory` 外，还继承了：

- `MessageSource` ：使其具备处理国际化资源的能力
- `ResourcePatternResolver` ：使其具备使用通配符进行资源匹配的能力
- `EnvironmentCapable` ：使其具备读取 Spring 环境信息、配置文件信息的能力
- `ApplicationEventPublisher` ：使其具备发布事件的能力



### 国际化

springboot默认会去resource目录下找 `messages.properties` 以及 `messages_语言编码.properties`  的国际化配置文件，首先创建几个

```properties
# messages.properties
login=登录
# messages_en.properties
login=login
# messages_zh_CN.properties
login=登录
# messages_zh_TW.properties
login=登錄
```

```java
public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
    ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);
    // 简体中文：登录
    System.out.println(context.getMessage("login", null, Locale.SIMPLIFIED_CHINESE));
    // 繁体中文：登錄
    System.out.println(context.getMessage("login", null, Locale.TRADITIONAL_CHINESE));
    //英文：login
    System.out.println(context.getMessage("login", null, Locale.ENGLISH));
    //日文，没有messages_ja_JP.properties文件使用默认messages.properties：登录
    System.out.println(context.getMessage("login", null, Locale.JAPANESE));
}
```

国际化的能力实际上是由 ResourceBundleMessageSource 提供的，在springboot中是由 `MessageSourceAutoConfiguration` 自动配置类注册到容器中的

```java
public static void main(String[] args) throws Exception {
    ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasename("messages");
    System.out.println(messageSource.getMessage("login", null, Locale.TRADITIONAL_CHINESE));
}
```



### 获取资源

```java
public static void main(String[] args) throws Exception {
    ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);

    Resource[] resources = context.getResources("classpath:application.yml");
    Assert.notEmpty(resources, "application.yml not found at classpath");

    //使用 classpath* 可以加载 jar 里类路径下的 resource
    resources = context.getResources("classpath*:META-INF/spring.factories");
    for (Resource resource : resources) {
        System.out.println(resource.getDescription());
    }
}
```

### 获取环境信息

```java
public static void main(String[] args) throws Exception {
    ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);
    //java_home 是从环境变量中读取
    System.out.println(context.getEnvironment().getProperty("java_home"));
    //spring.application.name 是从配置文件中读取
    System.out.println(context.getEnvironment().getProperty("spring.application.name"));
}
```

### 事件发布

定义事件类

```java
/**
 * 用户注册事件
 */
public class UserRegisteredEvent extends ApplicationEvent {

    public UserRegisteredEvent(String username) {
        super(username);
    }
}
```

定义两个Bean，事件发送者 ( `UserService.registerUser()` ) 和事件监听器 `IntegralService.issueIntegral()` ，实现组件之间的解耦

```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(SpringBootDemoApplication.class, args);
        UserService userService = context.getBean(UserService.class);
        userService.registerUser("clboy");

    }

    @Component
    @RequiredArgsConstructor
    public static class UserService {

        private final ApplicationEventPublisher eventPublisher;

        public void registerUser(String username) {
            System.out.println(username + "注册成功");
            //发送事件
            eventPublisher.publishEvent(new UserRegisteredEvent(username));
        }
    }

    @Component
    public static class IntegralService {

        @EventListener
        public void issueIntegral(UserRegisteredEvent event) {
            System.out.printf("新用户：%s，发放积分：%d", event.getSource(), new Random().nextInt(500));
        }
    }
}
```



## 实现容器

### BeanFactory实现类

尝试将下方 `Config` 添加到 Bean 工厂中，接下来就创建 BeanFactory 对象，使用到 `DefaultListableBeanFactory` ，然后往Bean工厂中注册Bean定义

```java
public class SpringBootDemoApplication {
    static class Bean2 {
        public Bean2() {
            System.out.println("构造 Bean2()");
        }
    }
    static class Bean1 {
        public Bean1() {
            System.out.println("构造 Bean1()");
        }

        @Autowired
        private Bean2 bean2;

        public Bean2 getBean2() {
            return this.bean2;
        }
    }

    @Configuration
    static class Config {
        @Bean
        public Bean1 bean1() {
            return new Bean1();
        }

        @Bean
        public Bean2 bean2() {
            return new Bean2();
        }
    }

    public static void main(String[] args) {
        DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    }
}
```



### 什么是Bean定义

首先需要明确的是：我们不是往Bean工厂中注册对象，对象是由它帮我们创建的（控制反转）

Bean定义包含的信息有：Bean的Class、scope、初始化方法、销毁方法等

Bean工厂是根据Bean定义来生成对象的

```java
public static void main(String[] args) {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();

    BeanDefinition beanDefinition = BeanDefinitionBuilder.genericBeanDefinition(Config.class)
            .setScope("singleton")
            .getBeanDefinition();
    beanFactory.registerBeanDefinition("config", beanDefinition);

    for (String beanDefinitionName : beanFactory.getBeanDefinitionNames()) {
        log.debug("beanDefinitionName：{}", beanDefinitionName);
    }
}
```

按照spring的思路，它应该会解析 ` @Configuration` 注解，然后创建 `bean1` 和 `bean2` 的定义，但是现在打印结果只有config自己的定义

也就是说现在的 `BeanFactory` 缺少了解析 `@Configuration` 和 `@Bean` 两个注解的能力



### Bean工厂后置处理器

我们需要使用 `AnnotationConfigUtils` 类的一个方法给Bean工厂注册一些 *Bean工厂后置处理器定义*

```java
//注册后置处理器
AnnotationConfigUtils.registerAnnotationConfigProcessors(beanFactory);
```

然后再打印就会发现多出了如下几个Bean定义

- org.springframework.context.annotation.internalConfigurationAnnotationProcessor
- org.springframework.context.annotation.internalAutowiredAnnotationProcessor
- org.springframework.context.annotation.internalCommonAnnotationProcessor
- org.springframework.context.event.internalEventListenerProcessor
- org.springframework.context.event.internalEventListenerFactory



`internalConfigurationAnnotationProcessor` 根据其所含的 `ConfigurationAnnotationProcessor` 字样，可以知道这个 Bean 就是用来处理 `@Configuration` 和 `@Bean` 注解的，将配置类中定义的 Bean 信息补充到 `BeanFactory` 中。

那为什么在 Bean 工厂中依旧没有 `bean1` 和 `bean2` 呢？

现在仅仅是将处理器定义添加到了 Bean 工厂，还没有使用处理器

Bean工厂的后置处理器都实现了 `BeanFactoryPostProcessor` 接口

```java
//从Bean工厂中获取这些后置处理器并执行
beanFactory.getBeansOfType(BeanFactoryPostProcessor.class).forEach((name, processor) -> {
    log.debug("执行Bean工厂后置处理器：{}", name);
    processor.postProcessBeanFactory(beanFactory);
});

//然后再打印就看到添加了Bean1和Bean2的定义
for (String beanDefinitionName : beanFactory.getBeanDefinitionNames()) {
    log.debug("Bean定义名称：{}", beanDefinitionName);
}
```

从执行Bean工厂后置处理器的日志中可以看到只有 `internalConfigurationAnnotationProcessor` 和 `internalEventListenerProcessor` 这两个处理器执行了，其他的处理器没有实现 `BeanFactoryPostProcessor` 接口、那么他们是干什么用的，其中有一个 `internalAutowiredAnnotationProcessor` 处理器，从名称上看就知道是用来处理 `@Autowired` 注解的，我们从工厂中获取Bean1，并获取器持有的 bean2，目前是是null

```java
Bean1 bean1 = beanFactory.getBean(Bean1.class);
log.debug("Bean1中bean2：{}", bean1.getBean2());
```

bean2 没有成功被注入到 bean1 中

### Bean后置处理器

在先前添加到 `BeanFactory` 中的后置处理器里

- `internalAutowiredAnnotationProcessor` ：用于解析 `@Autowired` 注解
-  `internalCommonAnnotationProcessor` ：用于解析 `@Resource` 注解

这两个处理器不是Bean工厂后置处理器，而是Bean后置处理器，它们都实现了 `BeanPostProcessor` 接口

```java
//获取所有的Bean后置处理器并添加到Bean工厂，这样Bean工厂创建Bean的时候就会调用这些处理器
beanFactory.getBeansOfType(BeanPostProcessor.class).forEach((name, processor) -> {
    beanFactory.addBeanPostProcessor(processor);
});

Bean1 bean1 = beanFactory.getBean(Bean1.class);
log.debug("Bean1中bean2：{}", bean1.getBean2());
```

建立 `BeanPostProcessor` 和 `BeanFactory` 的关系后，`bean2` 被成功注入到 `bean1` 中了。



### Bean什么时候被创建

从日志打印中可以看出：当需要使用 Bean 时，Bean 才会被创建，即按需加载。那有没有什么办法预先就初始化好单例对象呢？

![image-20230726145231235](https://cdn.tencentfs.clboy.cn/images/2023/20230726174313395.png)

可以主动调用 DefaultListableBeanFactory 的 `preInstantiateSingletons()` 让其创建Bean



### BeanFactory不会主动做的事

- 不会主动调用 `BeanFactory` 后置处理器；
- 不会主动添加 `Bean` 后置处理器；
- 不会主动初始化单例对象；
- 不会解析 `${}` 和 `#{}`



### Bean后置处理器的排序

现在有一个 `Inter` 接口，`Bean3` 和 `Bean4` 都实现了 `Inter` 接口

```java
interface Inter {

}

static class Bean3 implements Inter {
    public Bean3() {
        System.out.println("构造 Bean3()");
    }
}

static class Bean4 implements Inter {
    public Bean4() {
        System.out.println("构造 Bean4()");
    }
}

@Configuration
static class Config {

    //...
    
    @Bean
    public Bean3 bean3() {
        return new Bean3();
    }

    @Bean
    public Bean4 bean4() {
        return new Bean4();
    }
}
```

然后Bean1成员变量 `bean3` 为 `Inter` 类型，并且同时使用了 ` @Autowired` 和 `@Resource` 注解

`@Autowired` 注解会按照类型匹配，如果同种类型的 Bean 有多个，再按照变量名称注入

`@Resource`  也会采取与 @Autowired 一样的注入策略，只不过它还可以指定需要注入Bean的 id（使用 name 属性进行指定）

```java
@Data
static class Bean1 {
    public Bean1() {
        System.out.println("构造 Bean1()");
    }

    @Autowired
    @Resource(name = "bean4")
    private Inter bean3;

}
```

运行后发现Bean3被注入到了Bean1，也就是 `@Autowired` 注解生效了，我们看一下添加到Bean工厂的Bean处理器顺序

```java
beanFactory.getBeansOfType(BeanPostProcessor.class).forEach((name, processor) -> {
    log.debug("添加Bean处理器：{}", name);
    beanFactory.addBeanPostProcessor(processor);
});
```

结果是 `internalAutowiredAnnotationProcessor` 比 `internalCommonAnnotationProcessor` 先添加到Bean工厂

我们尝试将 `internalCommonAnnotationProcessor` 先添加到Bean工厂

```java
beanFactory.getBeansOfType(BeanPostProcessor.class).values()
    .stream().sorted(Objects.requireNonNull(beanFactory.getDependencyComparator()))
    .forEach(processor -> {
        log.debug("添加Bean处理器：{}", processor.getClass().getName());
        beanFactory.addBeanPostProcessor(processor);
    });
```

运行后发现这次Bean4被注入到了Bean1

`beanFactory.getDependencyComparator()` 返回的比较器是对实现 `Ordered` 接口，或者标注了 `@Order` 注解的类进行排序

这个比较器是在调用的 `AnnotationConfigUtils.registerAnnotationConfigProcessors(beanFactory)` 方法时设置给Bean工厂的

比较器实现是：`AnnotationAwareOrderComparator`

order值越小，优先级越大，就排在更前面

`internalCommonAnnotationProcessor` 的order值更小所以排序后在前面，`@Resource` 注解就先生效



