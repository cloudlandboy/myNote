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

首先，在调用 `refresh` 方法之前像容器中添加 `AutowiredAnnotationBeanPostProcessor` 使 `@Autowired` 注解生效

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

