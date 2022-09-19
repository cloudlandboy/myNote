# 负载均衡Ribbon

在上节的案例中，我们启动了一个`springcloud-eureka-service-provider`，然后通过DiscoveryClient来获取服务实例信息，然后获取ip和端口来访问。

但是实际环境中，我们往往会开启很多个`springcloud-eureka-service-provider`的集群。此时我们获取的服务列表中就会有多个，到底该访问哪一个呢？

一般这种情况下我们就需要编写负载均衡算法，在多个实例列表中进行选择。

不过Eureka中已经帮我们集成了负载均衡组件：Ribbon，简单修改代码即可使用。

什么是Ribbon：

![1525619257397](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225821.png)



接下来，我们就来使用Ribbon实现负载均衡。



## 启动两个服务实例

首先参照`springcloud-eureka-server`启动两个`springcloud-eureka-service-provider`实例，一个8081，一个8084。

![1574740696735](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243000.png)



查看Eureka监控面板：

![1574740920124](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243138.png)



## 开启负载均衡

因为Eureka中已经集成了Ribbon，所以我们无需引入新的依赖，直接修改代码。

修改`springcloud-eureka-service-consumer`的引导类，在注册RestTemplate的配置方法上添加`@LoadBalanced`注解：

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

<details>

​    <summary>以前的调用方式</summary>

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    /**
     * eureka客户端，可以获取到eureka中服务的信息
     */
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

</details>

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

显然有地方帮我们根据service名称，获取到了服务实例的ip和端口。

我们在调用接口的地方打上端点，一探究竟

![1574741717858](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243285.png)

以DEBUG的方法重新启动`springcloud-eureka-service-consumer`，然后访问<http://localhost:8083/user/1>

1. 调用execute方法

   ```java
       @Nullable
       public <T> T getForObject(String url, Class<T> responseType, Object... uriVariables) throws RestClientException {
           RequestCallback requestCallback = this.acceptHeaderRequestCallback(responseType);
           HttpMessageConverterExtractor<T> responseExtractor = new HttpMessageConverterExtractor(responseType, this.getMessageConverters(), this.logger);
           //调用execute方法,f7继续跟踪
           return this.execute(url, HttpMethod.GET, requestCallback, responseExtractor, (Object[])uriVariables);
       }
   ```

2. 调用doExecute

   ```java
       @Nullable
       public <T> T execute(String url, HttpMethod method, @Nullable RequestCallback requestCallback, @Nullable ResponseExtractor<T> responseExtractor, Object... uriVariables) throws RestClientException {
           //将请求封装为URI
           URI expanded = this.getUriTemplateHandler().expand(url, uriVariables);
           //调用doExecute方法,f7继续跟踪
           return this.doExecute(expanded, method, requestCallback, responseExtractor);
       }
   ```

3. request.execute，调用`AbstractClientHttpRequest`的execute方法

   ![1574742576423](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243589.png)

4. 又调用`AbstractBufferingClientHttpRequest`的executeInternal方法

   ```java
       public final ClientHttpResponse execute() throws IOException {
           this.assertNotExecuted();
           //f7进入
           ClientHttpResponse result = this.executeInternal(this.headers);
           this.executed = true;
           return result;
       }
   ```

5. 调用`InterceptingClientHttpRequest`重写的executeInternal方法

   ```java
       protected ClientHttpResponse executeInternal(HttpHeaders headers) throws IOException {
           byte[] bytes = this.bufferedOutput.toByteArray();
           if (headers.getContentLength() < 0L) {
               headers.setContentLength((long)bytes.length);
           }
           //f7进入
           ClientHttpResponse result = this.executeInternal(headers, bytes);
           this.bufferedOutput = new ByteArrayOutputStream(0);
           return result;
       }
   ```

6. 创建请求拦截器执行对象

   ```java
       protected final ClientHttpResponse executeInternal(HttpHeaders headers, byte[] bufferedOutput) throws IOException {
           //创建请求拦截器执行对象
           InterceptingClientHttpRequest.InterceptingRequestExecution requestExecution = new InterceptingClientHttpRequest.InterceptingRequestExecution();
           //调用执行方法
           return requestExecution.execute(this, bufferedOutput);
       }
   
   ```

7. 调用请求拦截器的执行方法

   ![1574743938108](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243748.png)

   在执行方法中获取拦截器，调用其intercept方法

8. 负载均衡的执行方法，`RibbonLoadBalancerClient.execute`

   ```java
       public ClientHttpResponse intercept(final HttpRequest request, final byte[] body, final ClientHttpRequestExecution execution) throws IOException {
           URI originalUri = request.getURI();
           //获取服务名称
           String serviceName = originalUri.getHost();
           Assert.state(serviceName != null, "Request URI does not contain a valid hostname: " + originalUri);
           //调用负载均衡的执行方法
           return (ClientHttpResponse)this.loadBalancer.execute(serviceName, this.requestFactory.createRequest(request, body, execution));
       }
   ```

9. 在其中又调用`RibbonLoadBalancerClient`重载的execute方法

   ```java
       public <T> T execute(String serviceId, LoadBalancerRequest<T> request) throws IOException {
           return this.execute(serviceId, (LoadBalancerRequest)request, (Object)null);
       }
   
       public <T> T execute(String serviceId, LoadBalancerRequest<T> request, Object hint) throws IOException {
           //获取负载均衡器实例，其中有当前请求服务的地址列表等服务信息
           ILoadBalancer loadBalancer = this.getLoadBalancer(serviceId);
           //根据负载均衡算法从服务列表中获取一个服务
           Server server = this.getServer(loadBalancer, hint);
           if (server == null) {
               throw new IllegalStateException("No instances available for " + serviceId);
           } else {
               RibbonLoadBalancerClient.RibbonServer ribbonServer = new RibbonLoadBalancerClient.RibbonServer(serviceId, server, this.isSecure(server, serviceId), this.serverIntrospector(serviceId).getMetadata(server));
               return this.execute(serviceId, (ServiceInstance)ribbonServer, (LoadBalancerRequest)request);
           }
       }
   
   ```

10. 获取服务

    ```java
        protected Server getServer(ILoadBalancer loadBalancer, Object hint) {
            //调用负载均衡实例的chooseServer方法，选择服务
            return loadBalancer == null ? null : loadBalancer.chooseServer(hint != null ? hint : "default");
        }
    ```

11. 选择服务中，又调用了父类的chooseServer方法，看下父类方法

    ```java
        public Server chooseServer(Object key) {
            if (this.counter == null) {
                this.counter = this.createCounter();
            }
    
            this.counter.increment();
            if (this.rule == null) {
                return null;
            } else {
                try {
                    //根据当前的负载均衡规则选择，默认是RoundRobinRule(轮循)，是IRule接口的实现
                    return this.rule.choose(key);
                } catch (Exception var3) {
                    logger.warn("LoadBalancer [{}]:  Error choosing server for key {}", new Object[]{this.name, key, var3});
                    return null;
                }
            }
        }
    ```

    ![1574751683467](https://cdn.tencentfs.clboy.cn/images/2021/20210911203243906.png)



## 负载均衡策略

Ribbon默认的负载均衡策略是简单的轮询，我们可以测试一下：

编写测试类，在刚才的源码中我们看到拦截中是使用`RibbonLoadBalancerClient`来进行负载均衡的，其中有一个`choose`方法，找到choose方法的接口方法，是这样介绍的：

```java
public interface ServiceInstanceChooser {

	/**
	 * 根据服务名称从负载均衡器中选择一个服务实例返回
	 * Chooses a ServiceInstance from the LoadBalancer for the specified service.
	 * @param serviceId The service ID to look up the LoadBalancer.
	 * @return A ServiceInstance that matches the serviceId.
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

SpringBoot也帮我们提供了修改负载均衡规则的配置入口，在`springcloud-eureka-service-consumer`的application.yaml中添加如下配置：

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

但是此时，8081服务其实是正常的。

因此Spring Cloud 整合了Spring Retry 来增强RestTemplate的重试能力，当一次服务调用失败后，不会立即抛出一次，而是再次重试另一个服务。

只需要简单配置即可实现Ribbon的重试：

> 添加spring-retry依赖

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```



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

