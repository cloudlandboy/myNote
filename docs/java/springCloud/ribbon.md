# 负载均衡Ribbon

在上节的案例中，我们启动了一个 `spring-cloud-eureka-service-provider` ，然后通过 `DiscoveryClient` 来获取服务实例信息，最后获取ip和端口手动拼接出url来访问。

但是实际环境中，我们往往会开启很多个 `spring-cloud-eureka-service-provider` 来作集群。此时我们获取的服务列表中就会有多个，到底该访问哪一个呢？

一般这种情况下我们就需要编写负载均衡算法，在多个实例列表中进行选择。

```java
List<ServiceInstance> instances = discoveryClient.getInstances("service-provider");
//从实例集合中随机取出一个
ServiceInstance instance = instances.get(ThreadLocalRandom.current().nextInt(instances.size()));
```

不过Eureka中已经帮我们集成了负载均衡组件：Ribbon，简单修改代码即可使用。

什么是Ribbon：

- Ribbon是Netfix发布的负载均衡器，它有助于控制HTTP和TCP客户端的行为
- 为Ribbon配置服务提供者地址列表后，Ribbon就可基于某种负载均衡算法，自动地帮助服务消费者去请求
- Ribbon默认为我们提供了很多的负载均衡算法，例如轮询、随机等。当然，我们也可为Ribbon实现自定义的负载均衡算法

接下来，我们就来使用Ribbon实现负载均衡。

## 启动两个服务实例

首先启动两个 `spring-cloud-eureka-service-provider` 实例，一个8081，一个8084。

![1574740696735](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243000.png)



查看Eureka监控面板：

![1574740920124](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243138.png)



## 开启负载均衡

因为Eureka中已经集成了Ribbon，所以我们无需引入新的依赖

开发者只需要向容器中注册RestTemplate实例，并在 `@Bean` 方法上添加 `@LoadBalanced` 注解：

<small>loadBalanced为负载均衡的意思</small>

```java
@SpringBootApplication
@EnableDiscoveryClient
public class SpringcloudEurekaServiceConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringcloudEurekaServiceConsumerApplication.class, args);
    }

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```



修改调用方式，不再手动获取ip和端口拼接字符串，而是直接通过服务名称调用：

以前的调用方式：

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping("/{id}")
    public TbUser getUserById(@PathVariable Long id) {
        // 根据服务名称，获取服务实例。有可能是集群，所以是service实例集合
        List<ServiceInstance> instances = discoveryClient.getInstances("service-provider");
        // 因为只有一个Service-provider。所以这里直接获取第一个实例
        ServiceInstance serviceInstance = instances.get(0);
        //从实例中获取主机和端口号拼接出接口地址
        return restTemplate.getForObject("http://" + serviceInstance.getHost() + ":" + serviceInstance.getPort() + "/user/" + id, TbUser.class);
    }
}
```

使用负载均衡的调用方式：

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;


    @GetMapping("/{id}")
    public TbUser getUserById(@PathVariable Long id) {
        //直接通过服务名称调用
        String baseUrl = "http://service-provider/user/";
        return restTemplate.getForObject(baseUrl+id, TbUser.class);
    }
}
```

访问：<http://localhost:8083/user/1>，同样能够正常调用并返回结果



## 源码跟踪

为什么我们只输入了service名称就可以访问了呢？之前还要获取ip和端口。

显然有地方根据service名称获取到了服务实例的ip和端口后帮我们替换掉了。

最好的实现方法就是给RestTemplate添加拦截器，下面是伪代码：

```java
@Bean
public RestTemplate restTemplate() {
    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setInterceptors(Collections.singletonList(new ClientHttpRequestInterceptor() {
        @Override
        public ClientHttpResponse intercept(HttpRequest req, byte[] body, ClientHttpRequestExecution chain) throws IOException {
            // 将服务名称替换为ip和端口
            HttpRequest newRequest = changeServiceNameToIpPort(req);
            return chain.execute(newRequest, body);
        }
    }));
    return restTemplate;
}
```

我们查看 `ClientHttpRequestInterceptor` 的实现类，会发现以下两个和负载均衡有关的实现

- `LoadBalancerInterceptor`
- `RetryLoadBalancerInterceptor`

就我们当前的配置， `LoadBalancerInterceptor` 拦截器会被添加到RestTemplate中，具体逻辑可以查看负载均衡自动配置类：

`LoadBalancerAutoConfiguration`

最终在 LoadBalancerInterceptor 拦截器中帮我们实现了负载均衡，如果有兴趣可以自行debug，查看源码。

![1574741717858](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243285.png)



## 负载均衡策略

Ribbon默认的负载均衡策略是简单的 **轮询** ，我们可以测试一下：

编写测试类，在刚才的源码中我们看到拦截中是使用 `RibbonLoadBalancerClient` 来进行负载均衡的，其中有一个 `choose` 方法，找到choose方法的接口方法，是这样介绍的：

```java
public interface ServiceInstanceChooser {

	/**
	 * 根据服务名称从负载均衡器中选择一个服务实例返回
	 */
	ServiceInstance choose(String serviceId);

```

我们注入这个类的对象，然后对其测试：

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringcloudEurekaServiceConsumerApplicationTests {

    @Autowired
    private RibbonLoadBalancerClient loadBalanceClient;

    @Test
    public void contextLoads() {
    }

    @Test
    public void testLoadBalance() {
        for (int i = 0; i < 50; i++) {
            ServiceInstance instance = loadBalanceClient.choose("service-provider");
            System.out.println(instance.getPort());
        }
    }

}

```

Ribbon中有个 `IRule` 接口用来为负载均衡器定义规则，其提供了以下几个实现

| 实现类                      | 特点                                                         |
| --------------------------- | ------------------------------------------------------------ |
| `RetryRule`                 | 对选定的负载均衡策略机上重试机制，在一个配置时间段内当选择Server不成功，则一直尝试使用subRule的方式选择一个可用的server |
| `RandomRule`                | 随机选择一个Server                                           |
| `RoundRobinRule`            | 轮询选择，轮询index，选择index对应位置的Server               |
| `BestAvailableRule`         | 选择一个最小的并发请求的Server，遂个考察Server，如果Server被tripped了，则跳过 |
| `ZoneAvoidanceRule`         | 复合判断Server所在Zone的性能和Server的可用性选择Server，在没有Zone的环境下，类似于轮询 |
| `ResponseTimeWeightedRule`  | 已废弃，作用同WeightedResponseTimeRule                       |
| `WeightedResponseTimeRule`  | 根据响应时间加权，响应时间越长，权重越小，被选中的可能性越低 |
| `AvailabilityFilteringRule` | 过滤掉一直连接失败的被标记为circuit tripped的后端Server，并过滤掉那些高并发的后端Server或者使用一个AvailabilityPredicate来包含过滤server的逻辑，其实就就是检查status里记录的各个Server的运行状态 |



## 修改负载均衡规则



### 修改全局规则

#### 注册Bean

只需要向spring容器中添加 `IRule` 类型的Bean即可

```java
@Bean
public IRule rule(){
    return new RandomRule();
}
```

#### 注解方式

创建配置类，不需要将该配置类注册到容器，否则就直接使用注册bean的方式了，用不到注解

```java
public class GlobalRibbonConfig {

    @Bean
    public IRule rule() {
        return new VersionClusterRandomWeightRule();
    }

}
```

使用  `@RibbonClients` 注解指定默认配置

```java
@SpringBootApplication
@EnableDiscoveryClient
@RibbonClients(defaultConfiguration = GlobalRibbonConfig.class)
public class SpringcloudEurekaServiceConsumerApplication {
}
```



### 每个服务单独设置

假如服务A需要调用B和C两个服务，现在需要在调用A的时候使用轮询的规则，调用B的时候使用随机的规则该如何指定

#### 代码方式

1. 要为这两个服务分别创建 ~~标记 `@Configuration`~~ 配置类，在配置类中注册规则

   ```java
   @Configuration
   public class BServiceRibbonConfig {
   
       @Bean
       public IRule BServiceRibbonRule(){
           return new RoundRobinRule();
       }
   }
   
   
   @Configuration
   public class CServiceRibbonConfig {
   
       @Bean
       public IRule CServiceRibbonRule() {
           return new RandomRule();
       }
   }
   ```

   !> 需要注意的是这些配置类不能够被spring主上下文容器扫描到，否则会因为上下文重叠，第一个被扫描到的会被当成全局配置作用于所有服务，我们都知道springboot默认会扫描启动类所在包及其下所有子包，所以，可以在启动类上一级包下单独创建一个包存放这些配置类

   

   ?> 经过测试不需要添加 `@Configuration` 注解也能正常使用，反而添加了还要注意上下文重叠的坑

   

1. 在启动类上或者其他能被扫描到的配置类中使用注解为这些服务单独设置启用Ribbon的配置

   ```java
   @Configuration
   @RibbonClients({
           @RibbonClient(name = "B-service-name", configuration = BServiceRibbonConfig.class),
           @RibbonClient(name = "C-service-name", configuration = CServiceRibbonConfig.class),
   })
   public class RibbonConfig {
   }
   ```

   

#### 配置文件方式

代码方式是不是特别麻烦，好在可以通过配置文件配置，这样就简单多了

*而且代码配置还有上下文重叠的问题，强烈建议如果没有特殊需求就使用配置文件方式配置*

```yaml
service-provider:
  ribbon:
  	# 修改为随机
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
```

格式是：`<服务名称>.ribbon.NFLoadBalancerRuleClassName`，值就是 `IRule` 的实现类全类名。

## 重点Bean

下表是Spring Cloud Netflix默认为Ribbon提供的bean，如果要对Ribbon进行定制化可以参考这几个类

| Bean类型                   | Bean名称                | 默认实现类名                   | 用途                                     |
| -------------------------- | ----------------------- | ------------------------------ | ---------------------------------------- |
| `IClientConfig`            | ribbonClientConfig      | DefaultClientConfigImpl        | 读取配置                                 |
| `IRule`                    | ribbonRule              | ZoneAvoidanceRule              | 负载均衡规则                             |
| `IPing`                    | ribbonPing              | DummyPing                      | 筛选掉ping不通的实例                     |
| `ServerList<Server>`       | ribbonServerList        | ConfigurationBasedServerList   | 交给Ribbon的实例列表                     |
| `ServerListFilter<Server>` | ribbonServerListFilter  | ZonePreferenceServerListFilter | 过滤掉不符合条件的实例                   |
| `ILoadBalancer`            | ribbonLoadBalancer      | ZoneAwareLoadBalancer          | 负载均衡操作的接口                       |
| `ServerListUpdater`        | ribbonServerListUpdater | PollingServerListUpdater       | 交给Ribbon的实例列表<br />如何更新的策略 |

## 其他配置

- `<服务名称>.ribbon.NFLoadBalancerClassName`: 负载均衡操作的接口 `ILoadBalancer` 实现类
- `<服务名称>.ribbon.NFLoadBalancerRuleClassName`:  负载均衡规则 `IRule` 实现类
- `<服务名称>.ribbon.NFLoadBalancerPingClassName`:  ping规则 `IPing` 实现类
- `<服务名称>.ribbon.NIWSServerListClassName`: 获取服务器列表接口 `ServerList` 实现类
- `<服务名称>.ribbon.NIWSServerListFilterClassName`:  过滤服务实例 `ServerListFilter` 实现类

以上都是配置文件属性，通过代码配置就是在服务的单独配置类中注册相关类型的Bean



## 饥饿加载

有没有发现每次启动服务调用方后第一次访问内部调用其他微服务的接口会非常慢

这是因为Ribbon默认懒加载，意味着只有在发起调用的时候才会去加载服务实例

可以通过配置文件修改为饥饿加载

```yaml
ribbon:
  eager-load:
    # 开启饥饿加载
    enabled: true
    # 开启饥饿加载的服务名称
    clients:
      - 服务名称1
      - 服务名称2
      - 服务名称3
```

## 重试机制

Eureka的服务治理强调了CAP原则中的AP，即可用性和可靠性。它与Zookeeper这一类强调CP（一致性，可靠性）的服务治理框架最大的区别在于：Eureka为了实现更高的服务可用性，牺牲了一定的一致性，极端情况下它宁愿接收故障实例也不愿丢掉健康实例，正如我们上面所说的自我保护机制。

但是，此时如果我们调用了这些不正常的服务，调用就会失败，从而导致其它服务不能正常工作！这显然不是我们愿意看到的。

我们现在关闭一个服务实例，关闭8084端口：

![1574758231721](https://cdn.tencentfs.clboy.cn/images/2021/20210911203244503.png)

此时再次访问你会得到错误提示

![1574758211036](https://cdn.tencentfs.clboy.cn/images/2021/20210911203244346.png)

但是此时，8081服务其实是正常的。

因此Spring Cloud 整合了Spring Retry 来增强RestTemplate的重试能力，当一次服务调用失败后，不会立即抛出一次，而是再次重试另一个服务。

只需要简单配置即可实现Ribbon的重试：

因此Spring Cloud 整合了Spring Retry 来增强RestTemplate的重试能力，当一次服务调用失败后，不会立即抛出一次，而是再次重试另一个服务。

只需要简单配置即可实现Ribbon的重试：

*添加spring-retry依赖* ：

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

当项目中存在 `spring-retry` 类库时，`RetryLoadBalancerInterceptor` 拦截器就会被添加到RestTemplate中

```yaml
server:
  port: 8083
spring:
  application:
    name: service-consumer
  cloud:
    loadbalancer:
      retry:
        enabled: true #开启Spring Cloud的重试功能，默认就是true
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
```

