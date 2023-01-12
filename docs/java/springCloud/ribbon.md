# 负载均衡Ribbon

在上节的案例中，我们启动了一个 `spring-cloud-eureka-service-provider` ，然后通过 `DiscoveryClient` 来获取服务实例信息，最后获取ip和端口手动拼接出url来访问。

但是实际环境中，我们往往会开启很多个 `spring-cloud-eureka-service-provider` 来作集群。此时我们获取的服务列表中就会有多个，到底该访问哪一个呢？

一般这种情况下我们就需要编写负载均衡算法，在多个实例列表中进行选择。

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

Ribbon默认的负载均衡策略是简单的轮询，我们可以测试一下：

编写测试类，在刚才的源码中我们看到拦截中是使用 `RibbonLoadBalancerClient` 来进行负载均衡的，其中有一个 `choose` 方法，找到choose方法的接口方法，是这样介绍的：

```java
public interface ServiceInstanceChooser {

	/**
	 * 根据服务名称从负载均衡器中选择一个服务实例返回
	 */
	ServiceInstance choose(String serviceId);

```

我们注入这个类的对象，然后对其测试：

创建测试方法

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

运行后明显可以看出，就是轮询



## 修改负载均衡规则

SpringBoot也帮我们提供了修改负载均衡规则的配置入口，在 `spring-cloud-eureka-service-consumer` 的配置文件中添加如下配置：

```yaml
service-provider:
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
```

格式是：`{服务名称}.ribbon.NFLoadBalancerRuleClassName`，值就是IRule的实现类。

负载均衡规则(IRule)有图中几个实现

![1574754059660](https://cdn.tencentfs.clboy.cn/images/2021/20210911203244205.png)

再次测试，就变成随机的了



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

