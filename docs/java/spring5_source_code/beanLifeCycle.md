# Bean生命周期

一个受 Spring 管理的 bean，生命周期主要阶段有

1. 创建：根据 bean 的构造方法或者工厂方法来创建 bean 实例对象
2. 依赖注入：根据 `@Autowired` ，`@Value` 或其它一些手段，为 bean 的成员变量填充值、建立关系
3. 初始化：回调各种 Aware 接口，调用对象的各种初始化方法
4. 销毁：在容器关闭时，会销毁所有单例对象（即调用它们的销毁方法）



![image-20230810110638147](https://cdn.tencentfs.clboy.cn/images/image-20230810110638147.png)



```java
@SpringBootApplication
public class BeanLifeCycleDemoApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(BeanLifeCycleDemoApplication.class, args);
        //调用close方法，显示生命周期的销毁阶段
        context.close();
    }

    @Slf4j
    @Component
    public static class LifeCycleBean {

        public LifeCycleBean() {
            log.debug("构造");
        }

        @Autowired
        public void autowire(@Value("${JAVA_HOME}") String home) {
            log.debug("依赖注入: {}", home);
        }

        @PostConstruct
        public void init() {
            log.debug("初始化");
        }

        @PreDestroy
        public void destroy() {
            log.debug("销毁");
        }
    }
}
```



## Bean后置处理器

现有如下三个类

```java
@Slf4j
@ToString
public class Bean1 {

    private Bean2 bean2;
    private Bean3 bean3;
    private String home;

    @Autowired
    public void setBean2(Bean2 bean2) {
        log.debug("@Autowired 生效: {}", bean2);
        this.bean2 = bean2;
    }


    @Resource
    public void setBean3(Bean3 bean3) {
        log.debug("@Resource 生效: {}", bean3);
        this.bean3 = bean3;
    }

    @Autowired
    public void setHome(@Value("${JAVA_HOME}") String home) {
        log.debug("@Value 生效: {}", home);
        this.home = home;
    }

    @PostConstruct
    public void init() {
        log.debug("@PostConstruct 生效");
    }

    @PreDestroy
    public void destroy() {
        log.debug("@PreDestroy 生效");
    }
}

public class Bean2 {
}

public class Bean3 {
}
```

上面 `Bean1` 中使用了多个注解以实现 Bean 注入和值注入，现在手动创建一个容器，将三个Bean都注册到容器中

```java
public class BeanPostProcessApplication {
    public static void main(String[] args) {
        // GenericApplicationContext 是一个干净的容器
        GenericApplicationContext context = new GenericApplicationContext();
        // 用原始方式注册三个 bean
        context.registerBean("bean1", Bean1.class);
        context.registerBean("bean2", Bean2.class);
        context.registerBean("bean3", Bean3.class);

        // 初始化容器。执行 beanFactory 后置处理器，添加 bean 后置处理器，初始化所有单例
        context.refresh();

        // 销毁容器
        context.close();
    }
}
```

运行测试代码后，控制台并没有输出Bean1各个生命周期阶段的日志打印，也就是说 `Bean1` 中使用的注解并没有生效

首先，在调用 `refresh` 方法之前向容器中添加 `AutowiredAnnotationBeanPostProcessor` 使 `@Autowired` 注解生效

```java
context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
```

但是启动后发现报错了，报错信息如下：

!> No qualifying bean of type 'java.lang.String' available: expected at least 1 bean which qualifies as autowire candidate

这是因为 `@Autowire` 现在还不能解析 `@Value` 注解

```java
@Autowired
public void setHome(@Value("${JAVA_HOME}") String home) {
    log.debug("@Value 生效: {}", home);
    this.home = home;
}
```

我们需要修改Bean工厂的 `autowireCandidateResolver` 为 `ContextAnnotationAutowireCandidateResolver` 类型

```java
context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
context.getDefaultListableBeanFactory().setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
```

这次运行，@Autowired和@Value注解生效了，但 `@Resource`、`@PostConstruct` 和 `@PreDestroy` 依旧没有生效，因此还需要添加解析它们的 Bean 后置处理器

```java
context.registerBean(CommonAnnotationBeanPostProcessor.class);
```

在springboot中还有一个 `@ConfigurationProperties` 注解用于标注配置属性类

```java
@Data
@ConfigurationProperties(prefix = "java")
public class Bean4 {
    private String home;
    private String version;
}
```

现在把Bean4注册到容器中，测试发现这些处理器是不能处理 `@ConfigurationProperties` 注解的

![image-20230810134455372](https://cdn.tencentfs.clboy.cn/images/image-20230810134455372.png)

我们需要调用 `ConfigurationPropertiesBindingPostProcessor` 的 `register(registry)` 方法

给 `DefaultListableBeanFactory` 注册一些Bean后置处理器

```java
ConfigurationPropertiesBindingPostProcessor.register(context);
```



### Autowired后置处理器

接下来，我们自己创建Bean工厂和Autowired后置处理器，看其是怎么进行自动注入的

```java
public static void main(String[] args) {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    //解析@Value注解
    beanFactory.setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
    //解析@Value中的表达式，#{}
    beanFactory.addEmbeddedValueResolver(new StandardEnvironment()::resolvePlaceholders);
    
    //直接注册创建好的单例Bean
    beanFactory.registerSingleton("Bean2", new Bean2());
    beanFactory.registerSingleton("Bean3", new Bean3());
    
    //创建Bean1
    Bean1 bean1 = new Bean1();
    
    //创建处理器实例
    AutowiredAnnotationBeanPostProcessor processor = new AutowiredAnnotationBeanPostProcessor();
    //给处理器实例设置Bean工厂，Autowired在处理依赖注入时需要找到依赖对象，依赖对象的定义都放在Bean工厂中
    //如本例中bean1依赖了Bean2和Bean3
    processor.setBeanFactory(beanFactory);
    
    processor.postProcessProperties(null, bean1, "bean1");
    System.out.println(bean1);
}
```

看一下postProcessProperties的源码

```java
public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
	InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);
	try {
		metadata.inject(bean, beanName, pvs);
	}
	catch (BeanCreationException ex) {
		throw ex;
	}
	catch (Throwable ex) {
		throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);
	}
	return pvs;
}
```

用方法名称上看，主要是两个步骤

1. 查找标注了 `@Autowired` 注解和 `Value` 注解的元素，将解析结果封装为 `InjectionMetadata` 对象
2. 调用 `inject` 方法进行自动注入

我们Debug看一下 `InjectionMetadata` 中都封装了哪些信息

![image-20230810141916226](https://cdn.tencentfs.clboy.cn/images/image-20230810141916226.png)

可以看出就是标注了 `@Autowired` 注解的两个方法

如果直接将注解标注在属性上呢

```java
public class Bean1 {

    @Value("${user.home}")
    private String userHome;

    @Autowired
    private Bean2 byType;

    /*...*/
    
}
```

![image-20230810143102196](https://cdn.tencentfs.clboy.cn/images/image-20230810143102196.png)

可以看到，元素类型就是Field属性

至于后置处理的注入流程，我们自己写代码模拟实现如下：

```java
public static void main(String[] args) throws Exception {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    //解析@Value注解
    beanFactory.setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
    //解析@Value中的表达式，#{}
    beanFactory.addEmbeddedValueResolver(new StandardEnvironment()::resolvePlaceholders);

    //直接注册创建好的单例Bean
    beanFactory.registerSingleton("Bean2", new Bean2());
    beanFactory.registerSingleton("Bean3", new Bean3());
    
    //创建Bean1
    Bean1 bean1 = new Bean1();

    for (Field field : bean1.getClass().getDeclaredFields()) {
        Autowired annotation = field.getAnnotation(Autowired.class);
        Value value = field.getAnnotation(Value.class);
        if (annotation == null && value == null) {
            continue;
        }
        boolean required = annotation == null || annotation.required();
        DependencyDescriptor dependencyDescriptor = new DependencyDescriptor(field, required);
        Object dependencyRef = beanFactory.doResolveDependency(dependencyDescriptor, null, null, null);
        field.setAccessible(true);
        field.set(bean1, dependencyRef);
    }

    for (Method method : bean1.getClass().getMethods()) {
        Autowired annotation = method.getAnnotation(Autowired.class);
        Value value = method.getAnnotation(Value.class);
        if (annotation == null && value == null) {
            continue;
        }
        boolean required = annotation == null || annotation.required();
        Parameter[] parameters = method.getParameters();
        Object[] parameterRefs = new Object[parameters.length];
        for (int i = 0; i < parameters.length; i++) {
            DependencyDescriptor dependencyDescriptor = new DependencyDescriptor(new MethodParameter(method, i), required);
            Object dependencyRef = beanFactory.doResolveDependency(dependencyDescriptor, null, null, null);
            parameterRefs[i] = dependencyRef;
        }
        method.invoke(bean1, parameterRefs);
    }

    System.out.println(bean1);

}
```



## Bean工厂后置处理器

首先，我们给项目添加如下依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.3.1</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.18</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.32</version>
</dependency>
```

然后有如下几个包和类

```java
@Slf4j
public class Bean1 {
    public Bean1() {
        log.debug("我被 Spring 管理啦");
    }
}
```

```java
@Configuration
@ComponentScan("cn.clboy.springboot.starter.demo.e.component")
public class Config {

    @Bean
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean(initMethod = "init")
    public DruidDataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        return dataSource;
    }

    @Bean
    public SqlSessionFactoryBean sqlSessionFactoryBean(DataSource dataSource) {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        return sqlSessionFactoryBean;
    }
}
```

**component包** 下的类：

```java
@Slf4j
@Component
public class Bean2 {
    public Bean2() {
        log.debug("我被 Spring 管理啦");
    }
}

@Slf4j
@Controller
public class Bean3 {
    public Bean3() {
        log.debug("我被 Spring 管理啦");
    }
}

@Slf4j
public class Bean4 {
    public Bean4() {
        log.debug("我被 Spring 管理啦");
    }
}
```

**mapper包** 下的类：

```java
@Mapper
public interface Mapper1 {
}

@Mapper
public interface Mapper2 {
}

public class Mapper3 {
}
```





测试程序

```java
public class BeanFactoryPostProcessApp {

    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean("config", Config.class);

        context.refresh();

        for (String beanDefinitionName : context.getBeanDefinitionNames()) {
            System.out.println(beanDefinitionName);
        }
        context.close();
    }
}
```

运行测试程序后只输出了config，也就是容器中除了config没有其他的bean，所以config类中的注解都没有生效

我们需要先刷新之前给容器中添加 `ConfigurationClassPostProcessor` 类型后置处理器

```java
context.registerBean(ConfigurationClassPostProcessor.class);
```

然后要将 mapper 包下标注了 `@mapper` 注解的类型也注册到容器中。需要添加mapper提供的后置处理器

```java
context.registerBean(MapperScannerConfigurer.class, bd -> {
	bd.getPropertyValues().add("basePackage", "cn.clboy.springboot.starter.demo.e.mapper");
});
```



### 模拟实现@ComponentScan

实现思路：

1. 从容器中获取标有 `Configuration` 的类定义，判断类上是否有 `@ComponentScan` 注解
2. 解析 `@ComponentScan` 注解获取包名，将包名下及其子包下的类信息封装成 `BeanDefinition` 注册到Bean工厂中

Bean后置处理器一般会实现 `BeanDefinitionRegistryPostProcessor` 接口

```java
void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException;
```

然后封装一个方法判断BeanDefinition是不是一个Configuration类

```java
// 用于读取类资源元数据
public static final CachingMetadataReaderFactory METADATA_READER_FACTORY = new CachingMetadataReaderFactory();
// 资源路径解析器
public static final PathMatchingResourcePatternResolver RESOLVER = new PathMatchingResourcePatternResolver();

public static AnnotationMetadata parseConfigurationAnnoMetadata(BeanDefinition beanDefinition) throws IOException {
    String beanClassName = beanDefinition.getBeanClassName();
    assert beanClassName != null;
    //拼接class路径
    String classPath = "classpath:" + beanClassName.replace(".", "/") + ".class";
    Resource beanResource = RESOLVER.getResource(classPath);
    MetadataReader metadataReader = METADATA_READER_FACTORY.getMetadataReader(beanResource);
    AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();

    //类本身上有指定注解
    boolean hasConfiguration = annotationMetadata.hasAnnotation(Configuration.class.getName());
    //类上有注解中标注了指定注解，元注解使用
    boolean hasMetaConfiguration = annotationMetadata.hasMetaAnnotation(Configuration.class.getName());

    if (hasConfiguration || hasMetaConfiguration) {
        return annotationMetadata;
    }
    return null;
}
```

然后再解析Configuration类上的 `@ComponentScan` 注解

```java
@Override
@SneakyThrows
public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
    for (String name : registry.getBeanDefinitionNames()) {
        BeanDefinition beanDefinition = registry.getBeanDefinition(name);
        //不是@Configuration标注的类不处理
        AnnotationMetadata configAnnoMetadata = parseConfigurationAnnoMetadata(beanDefinition);
        if (configAnnoMetadata == null) {
            continue;
        }

        //类上没有
        if (!configAnnoMetadata.hasAnnotation(ComponentScan.class.getName())) {
            continue;
        }
        Map<String, Object> attrs = configAnnoMetadata.getAnnotationAttributes(ComponentScan.class.getName());
        if (CollectionUtils.isEmpty(attrs)) {
            return;
        }
        String[] basePackages = (String[]) attrs.get("basePackages");

        for (String pkg : basePackages) {
            if (!StringUtils.hasText(pkg)) {
                continue;
            }
            String pkgPath = "classpath*:" + pkg.replace(".", "/") + "/**/**.class";
            Resource[] resources = RESOLVER.getResources(pkgPath);

            for (Resource resource : resources) {
                MetadataReader metadataReader = METADATA_READER_FACTORY.getMetadataReader(resource);
                ClassMetadata classMetadata = metadataReader.getClassMetadata();
                AnnotationMetadata annoMetadata = metadataReader.getAnnotationMetadata();
                boolean hasComponent = annoMetadata.hasAnnotation(Component.class.getName());
                boolean hasMetaComponent = annoMetadata.hasMetaAnnotation(Component.class.getName());
                log.info("{} hasComponent {}", classMetadata.getClassName(), hasComponent);
                log.info("{} hasMetaComponent {}", classMetadata.getClassName(), hasMetaComponent);
                if (!hasComponent && !hasMetaComponent) {
                    continue;
                }

                BeanDefinition df = BeanDefinitionBuilder.genericBeanDefinition(classMetadata.getClassName())
                        .getBeanDefinition();
                //根据Component注解生成bean名称
                String beanName = AnnotationBeanNameGenerator.INSTANCE.generateBeanName(df, registry);
                //将Bean定义注册到Beanfactory中
                registry.registerBeanDefinition(beanName, df);
            }

        }
    }

}
```



### 模拟实现@Bean

思路和上面基本一致

```java
@Slf4j
public class BeanPostProcessor implements BeanDefinitionRegistryPostProcessor {

    // ......

    @Override
    @SneakyThrows
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        for (String name : registry.getBeanDefinitionNames()) {
            BeanDefinition beanDefinition = registry.getBeanDefinition(name);
            //不是@Configuration标注的类不处理
            AnnotationMetadata configAnnoMetadata = parseConfigurationAnnoMetadata(beanDefinition);
            if (configAnnoMetadata == null) {
                continue;
            }
            
            //获取所有标注了@Bean注解的方法
            Set<MethodMetadata> methods = configAnnoMetadata.getAnnotatedMethods(Bean.class.getName());
            
            for (MethodMetadata methodMetadata : methods) {
                String methodName = methodMetadata.getMethodName();
                BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition()
                        .setFactoryMethodOnBean(methodName, name)
                        // 工厂方法、构造方法的注入模式使用构造器模式
                        .setAutowireMode(AbstractBeanDefinition.AUTOWIRE_CONSTRUCTOR);

                Map<String, Object> attrs = methodMetadata.getAnnotationAttributes(Bean.class.getName());

                String toUseBeanName = methodName;
                if (!CollectionUtils.isEmpty(attrs)) {
                    String initMethod = (String) attrs.get("initMethod");
                    if (StringUtils.hasText(initMethod)) {
                        builder.setInitMethodName(initMethod);
                    }
                    String[] beanNames = (String[]) attrs.get("value");
                    if (beanNames.length > 0 && StringUtils.hasText(beanNames[0])) {
                        toUseBeanName = beanNames[0];
                    }
                }
                registry.registerBeanDefinition(toUseBeanName, builder.getBeanDefinition());
            }
        }
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
    }

}
```



### 模拟@Mapper

`@Mapper` 注解是在接口上使用的，spring是怎么将接口实例化为对象放到容器中的呢

mabatis和spring整合时提供了 `MapperFactoryBean` 类来将接口转换为对象

我们在 `Config` 类使用 `MapperFactoryBean` 将 `Mapper1` 和 `Mapper2` 注册到容器中

```java
@Configuration
public class Config {

    // ......
    
    @Bean
    public MapperFactoryBean<Mapper1> mapper1(SqlSessionFactory sqlSessionFactory) {
        MapperFactoryBean<Mapper1> factoryBean = new MapperFactoryBean<>(Mapper1.class);
        factoryBean.setSqlSessionFactory(sqlSessionFactory);
        return factoryBean;
    }

    @Bean
    public MapperFactoryBean<Mapper2> mapper2(SqlSessionFactory sqlSessionFactory) {
        MapperFactoryBean<Mapper2> factoryBean = new MapperFactoryBean<>(Mapper2.class);
        factoryBean.setSqlSessionFactory(sqlSessionFactory);
        return factoryBean;
    }
}
```

测试

```java
public static void mockBean() {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("config", Config.class);
    context.registerBean(BeanPostProcessor.class);
    context.refresh();
    for (String beanDefinitionName : context.getBeanDefinitionNames()) {
        System.out.println(beanDefinitionName);
    }
}
```

这种方式虽然可以完成 Mapper 接口的注册，但每次只能单个注册，不能批量注册。

安装前面的思路我们写一个mapper注解的扫描Beanfactory后置处理器

```java
public class MapperPostProcessor implements BeanDefinitionRegistryPostProcessor {
    
    // ......

    @Override
    @SneakyThrows
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        String basePackage = "cn.clboy.springboot.starter.demo.e.mapper";
        String pkgPath = "classpath*:" + basePackage.replace(".", "/") + "/**/**.class";

        for (Resource resource : RESOLVER.getResources(pkgPath)) {
            MetadataReader metadataReader = METADATA_READER_FACTORY.getMetadataReader(resource);
            ClassMetadata classMetadata = metadataReader.getClassMetadata();
            if (!classMetadata.isInterface()) {
                //不是接口，不处理
                continue;
            }
            AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
            boolean hasAnnotation = annotationMetadata.hasAnnotation(Mapper.class.getName());
            boolean hasMetaAnnotation = annotationMetadata.hasMetaAnnotation(Mapper.class.getName());
            if (!hasAnnotation && !hasMetaAnnotation) {
                //没有@Mapper注解不处理
                continue;
            }
            BeanDefinitionBuilder builder = BeanDefinitionBuilder
                    .genericBeanDefinition(MapperFactoryBean.class)
                    .setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE)
                    .addConstructorArgValue(classMetadata.getClassName());

            //生成mapper接口的bean名称
            String beanName = AnnotationBeanNameGenerator.INSTANCE.generateBeanName(
                    BeanDefinitionBuilder.genericBeanDefinition(classMetadata.getClassName())
                            .getBeanDefinition(), registry);

            registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
        }
    }

}
```

测试

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("config", Config.class);
    context.registerBean(ComponentScanPostProcessor.class);
    context.registerBean(BeanPostProcessor.class);
    context.registerBean(MapperPostProcessor.class);
    context.refresh();
    for (String beanDefinitionName : context.getBeanDefinitionNames()) {
        System.out.println(beanDefinitionName);
    }
    context.close();
}
```



## Aware接口

spring内置了一些  `Aware ` 类型的接口，这些接口用于在对象创建和初始化过程中注入额外信息，常见的如：

- `BeanNameAware` ：实现这个接口可以让一个 bean 获取到它在 Spring 容器中定义的名字
- `BeanFactoryAware` ：实现这个接口可以获取到当前Bean所在的 BeanFactory 的引用
- `ApplicationContextAware` ：实现这个接口可以获取到ApplicationContext 容器
- `EmbeddedValueResolverAware` ：可以获取到一个 EmbeddedValueResolver 对象的引用，用于解析 `${}` 占位符
- `MessageSourceAware` ：实现这个接口可以获取到 MessageSource 对象的引用，从而可以方便地获取国际化消息



```java
public class AwareTestApp {

    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean(AwareTestBean.class);
        context.refresh();
        context.close();
    }

    @Slf4j
    static class AwareTestBean implements BeanNameAware, BeanFactoryAware,
            ApplicationContextAware, EmbeddedValueResolverAware, MessageSourceAware {
                
        private final AtomicInteger step = new AtomicInteger(0);

        @Override
        public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
            log.info("{}. beanFactory：{}", step.incrementAndGet(), beanFactory);
        }

        @Override
        public void setBeanName(String name) {
            log.info("{}. beanName：{}", step.incrementAndGet(), name);
        }

        @Override
        public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
            log.info("{}. applicationContext：{}", step.incrementAndGet(), applicationContext);
        }

        @Override
        public void setEmbeddedValueResolver(StringValueResolver resolver) {
            log.info("{}. embeddedValueResolver java.home：{}", step.incrementAndGet(),
                    resolver.resolveStringValue("${java.home}"));
        }

        @Override
        public void setMessageSource(MessageSource messageSource) {
            log.info("{}. messageSource：{}", step.incrementAndGet(), messageSource);
        }
    }
}
```





## InitializingBean接口

接口是 Spring 框架中的一个回调接口，用于在 bean 实例创建并且属性设置完成后执行一些自定义的初始化逻辑。

通过实现 `InitializingBean` 接口，你可以确保在 bean 的属性都被设置好后，执行一些初始化操作

```java
static class AwareTestBean implements BeanNameAware, BeanFactoryAware,
        ApplicationContextAware, EmbeddedValueResolverAware, 
        MessageSourceAware, InitializingBean {
   
	//......

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("{}. InitializingBean.afterPropertiesSet", step.incrementAndGet());
    }
}
```

通过日志输出也可以看到：*当同时实现 `Aware` 接口和 `InitializingBean` 接口时，会先执行 `Aware` 类型接口*



## DisposableBean接口

 与 `InitializingBean` 相对应，`DisposableBean` 接口定义了一个方法 `destroy()`，在 bean 销毁之前会被 Spring 容器调用。

你可以在这个方法中执行资源释放、关闭连接等操作

```java
@Override
public void destroy() throws Exception {
	log.info("{}. DisposableBean.destroy", step.incrementAndGet());
}
```



## 接口VS注解

上面所讲的 `Aware` 类型接口的功能可以使用 `@Autowired` 注解实现

`InitializingBean` 和 `DisposableBean` 接口的功能也可以使用 `@PostConstruct` 和 `@PreDestroy` 注解实现

为什么还要使用接口呢？

综合前文所知注解的解析需要使用 Bean 后置处理器，属于拓展功能，而这些接口属于内置功能，不加任何拓展 Spring 就能识别。

在某些情况下，拓展功能会失效，而内置的接口功能不会失效，因此 Spring 框架内部的类常用内置注入和初始化



### 配置类@Autowired失效

在某些情况下，尽管容器中存在必要的后置处理器，但 @Autowired 和 @PostConstruct 等注解也会失效。

下面这段代码演示的是正常没有失效的情况

```java
@SpringBootApplication
public class AutowiredInvalidTestApp {

    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        AnnotationConfigUtils.registerAnnotationConfigProcessors(context);
        context.registerBean(Config.class);
        context.refresh();
        context.close();
    }

    @Slf4j
    @Configuration
    static class Config {
        private final AtomicInteger step = new AtomicInteger(0);

        @Autowired
        public void autowiredMessageSource(MessageSource messageSource) {
            log.info("{}. Autowired messageSource：{}", step.incrementAndGet(), messageSource);
        }

        @PostConstruct
        public void postConstruct() {
            log.info("{}. postConstruct", step.incrementAndGet());
        }

        @PreDestroy
        public void preDestroy() {
            log.info("{}. preDestroy", step.incrementAndGet());
        }
    }
}
```

上面代码运行后三个方法都执行了，接下来，我们给配置类添加一个 @Bean方法向容器中注入 `BeanFactoryPostProcessor` 类型实例

```java
@Bean
public BeanFactoryPostProcessor bfPostProcessor() {
    return beanFactory -> {
        for (String name : beanFactory.getBeanDefinitionNames()) {
            log.info("=====> {}", name);
        }
    };
}
```

再运行代码，你会发现之前那三个方法一个都没有执行。

对于 `context.refresh()` 方法来说，它主要按照以下顺序干了三件事：

1. 执行 BeanFactory 后置处理器；
2. 添加 Bean 后置处理器；
3. 创建和初始化单例对象。



当配置类不包含 BeanFactoryPostProcessor 时，初始化流程如下图：

![image-20230818134759124](https://cdn.tencentfs.clboy.cn/images/image-20230818134759124.png)

`BeanFactoryPostProcessor` 会在类创建和初始化之前执行

但配置类中定义了返回值类型为 `BeanFactoryPostProcessor` 的 `@Bean` 方法

要想调用这个方法获取 `BeanFactoryPostProcessor` 就必须先创建配置类对象

这就会导致该配置类在 `BeanPostProcessor` 还没有准备好之前就被初始化了，自然无法解析配置类中的 `@Autowired` 等注解

初始化流程就变成了下图所示：

![image-20230818135942824](https://cdn.tencentfs.clboy.cn/images/image-20230818135942824.png)

但是由上面的两个流程图可以看出，不管什么时候 `Aware` 、`InitializingBean` 这些接口都会被调用

```java
@Slf4j
@Configuration
static class Config implements MessageSourceAware, InitializingBean, DisposableBean {

    //......

    @Override
    public void setMessageSource(MessageSource messageSource) {
        log.info("{}. MessageSourceAware {}", step.incrementAndGet(), messageSource);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("{}. InitializingBean", step.incrementAndGet());
    }

    @Override
    public void destroy() throws Exception {
        log.info("{}. DisposableBean", step.incrementAndGet());
    }

}
```



### 初始化销毁执行顺序

初始化和销毁 Bean 的实现有三种：

1. 依赖于后置处理器提供的拓展功能：`@PostConstruct` 、`@PreDestroy` 注解
2. 相关接口的功能：`InitializingBean` 、`DisposableBean`
3. 使用 `@Bean` 注解中的属性进行指定

当同时存在以上三种方式时，它们的执行顺序也将按照上述顺序进行执行。

```java
@Configuration
public class InitDestroyOrderApp {

    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        AnnotationConfigUtils.registerAnnotationConfigProcessors(context);
        context.registerBean(InitDestroyOrderApp.class);
        context.refresh();
        context.close();
    }

    @Bean(initMethod = "initMethod", destroyMethod = "destroyMethod")
    public TestBean testBean() {
        return new TestBean();
    }

    @Slf4j
    static class TestBean implements InitializingBean, DisposableBean {
        private final AtomicInteger step = new AtomicInteger(0);

        @PostConstruct
        public void postConstruct() {
            log.info("{}. postConstruct", step.incrementAndGet());
        }

        @Override
        public void afterPropertiesSet() throws Exception {
            log.info("{}. InitializingBean", step.incrementAndGet());
        }

        public void initMethod() {
            log.info("{}. initMethod", step.incrementAndGet());
        }

        @PreDestroy
        public void preDestroy() {
            log.info("{}. preDestroy", step.incrementAndGet());
        }

        @Override
        public void destroy() throws Exception {
            log.info("{}. DisposableBean", step.incrementAndGet());
        }

        public void destroyMethod() {
            log.info("{}. destroyMethod", step.incrementAndGet());
        }

    }
}

```

