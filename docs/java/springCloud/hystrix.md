# Hystrix



Hystrix,英文意思是豪猪，全身是刺，看起来就不好惹，是一种保护机制。

Hystrix也是Netflix公司的一款组件。

![1525658740266](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230555.png)

那么Hystix的作用是什么呢？具体要保护什么呢？

Hystix是Netflix开源的一个延迟和容错库，用于隔离访问远程服务、第三方库，防止出现级联失败。

Hystrix包含常用的容错方法：线程隔离、信号量隔离、降级策略、熔断技术



## 雪崩问题

微服务中，服务间调用关系错综复杂，一个请求，可能需要调用多个微服务接口才能实现，会形成非常复杂的调用链路，例如一个微服务系统中存在 A、B、C、D、E、F 等多个服务，它们的依赖关系如下图：

 ![img](https://cdn.tencentfs.clboy.cn/images/2023/20230112110758364.png)

通常情况下，一个用户请求往往需要多个服务配合才能完成。

如图，在所有服务都处于可用状态时，请求 1 需要调用 A、D、E、F 四个服务才能完成，请求 2 需要调用 B、E、D 三个服务才能完成，请求 3 需要调用服务 C、F、E、D 四个服务才能完成。

如果此时服务 E 发生故障或网络延迟时，会出现以下情况：

1. 即使其他所有服务都可用，由于服务 E 的不可用，那么用户请求 1、2、3 都会处于阻塞状态，等待服务 E 的响应。在高并发的场景下，会导致整个服务器的线程资源在短时间内迅速消耗殆尽。
2. 所有依赖于服务 E 的其他服务，例如服务 B、D 以及 F 也都会处于线程阻塞状态，等待服务 E 的响应，导致这些服务的不可用。
3. 所有依赖服务B、D 和 F 的服务，例如服务 A 和服务 C 也会处于线程阻塞状态，以等待服务 D 和服务 F 的响应，导致服务 A 和服务 C 也不可用。

从以上过程可以看出，*当微服务系统的一个服务出现故障时，故障会沿着服务的调用链路在系统中疯狂蔓延，最终导致整个微服务系统的瘫痪，这就是雪崩效应*

这就好比，一个汽车生产线，生产不同的汽车，需要使用不同的零件，如果某个零件因为种种原因无法使用，那么就会造成整台车无法装配，陷入等待零件的状态，直到零件到位，才能继续组装。  此时如果有很多个车型都需要这个零件，那么整个工厂都将陷入等待的状态，导致所有生产都陷入瘫痪。一个零件的波及范围不断扩大。 

Hystix解决雪崩问题的手段有两个：

- 线程隔离
- 服务熔断



## 服务降级

*优先保证核心服务，而非核心服务不可用或弱可用。*

如上雪崩效应中，服务E出现故障时，调用服务E的其他服务不应该长时间的等待，而是快速的做出错误响应或应急备选处理

服务降级后用户的请求故障时，不会被阻塞，更不会无休止的等待或者看到系统崩溃，至少可以看到一个执行结果（例如返回友好的提示信息） 

Hystrix 提供了服务降级功能，能够保证当前服务不受其他服务故障的影响，提高服务的健壮性。

服务降级的使用场景有以下 2 种：

- 在服务器压力剧增时，根据实际业务情况及流量，对一些不重要、不紧急的服务进行有策略地不处理或简单处理，从而释放服务器资源以保证核心服务正常运作。
- 当某些服务不可用时，为了避免长时间等待造成服务卡顿或雪崩效应，而主动执行备用的降级逻辑立刻返回一个友好的提示，以保障主体业务不受影响。

Hystrix 服务降级既可以放在服务端(服务提供方)进行，也可以放在客户端(调用服务方)进行。

Hystrix 会在以下场景下进行服务降级处理：

- 程序运行异常
- 服务超时
- 熔断器处于打开状态
- 线程池资源耗尽

## 线程隔离



线程隔离示意图：

 ![1533829598310](https://cdn.tencentfs.clboy.cn/images/2021/20210911203238566.png)

解读：

Hystrix为每个依赖服务调用分配一个小的线程池，如果线程池已满调用将被立即拒绝，默认不采用排队，加速失败判定时间。

用户的请求将不再使用主线程直接访问服务，而是通过线程池中的空闲线程来访问服务，如果 **线程池已满**，或者 **请求超时** ，则会进行降级处理，服务降级虽然会导致请求失败，但是不会导致阻塞，而且最多会影响这个依赖服务对应的线程池中的资源，对其它服务没有响应。





## maven依赖

!> 虽然Eureka已经集成了`Hystrix`，但是还缺少一些依赖，还是要手动添加hystrix的场景依赖

首先在 `spring-cloud-eureka-service-consumer` 的pom.xml中引入 `Hystrix` 依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

## 开启熔断

在启动类上添加 `@EnableCircuitBreaker` 注解，表示开启熔断

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableCircuitBreaker
public class SpringcloudEurekaServiceConsumerApplication 
```



##  @SpringCloudApplication

可以看到，我们类上的注解越来越多，在微服务中，经常会引入上面的三个注解，于是Spring就提供了一个组合注解：

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableCircuitBreaker
public @interface SpringCloudApplication {

}
```

```java
@SpringCloudApplication
public class SpringcloudEurekaServiceConsumerApplication {
    
}
```



## 编写降级逻辑

我们改造 `spring-cloud-eureka-service-consumer` ，当目标服务的调用出现故障，我们希望快速失败，给用户一个友好提示。因此需要提前编写好失败时的降级处理逻辑，要使用HystixCommond来完成：

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/{id}")
    @HystrixCommand(fallbackMethod = "getUserByIDFallback")
    public String getUserById(@PathVariable Long id) {
        //直接通过服务名称调用
        String baseUrl = "http://service-provider/user/";
        return restTemplate.getForObject(baseUrl+id, String.class);
    }

    public String getUserByIDFallback(Long id){
        return id+"查询失败，原因：请求繁忙！";
    }
}
```

`@HystrixCommand(fallbackMethod = "getUserByIDFallback")`：用来声明一个降级逻辑的方法

!> 要注意，因为熔断的降级逻辑方法必须跟正常逻辑方法签名一致：**相同的参数列表和返回值声明**。失败逻辑中返回实体类对象没有太大意义，一般会返回友好提示。所以我们把getUserById的方法改造为返回String，反正也是Json数据。这样失败逻辑中返回一个错误说明，会比较方便。

然后重启，访问 <http://localhost:8083/user/1>

这是正常情况所以和以前一样返回请求的数据

接下来把两个服务提供应用 `spring-cloud-eureka-service-provider` 都关闭掉，再重新访问就会调用 `getUserByIDFallback` 方法进行降级处理，并响应降级方法的返回结果



## 默认FallBack

我们刚才把fallback写在了某个业务方法上，如果这样的方法很多，那岂不是要写很多。所以我们可以把Fallback配置加在类上，实现默认fallback

```java
@RestController
@RequestMapping("user")
@DefaultProperties(defaultFallback = "defaultFallback")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/{id}")
    @HystrixCommand
    public String getUserById(@PathVariable Long id) {
        //直接通过服务名称调用
        String baseUrl = "http://service-provider/user/";
        return restTemplate.getForObject(baseUrl+id, String.class);
    }

    public String defaultFallback(){
        return "请求繁忙，请稍后再试！";
    }
}
```

- `@DefaultProperties(defaultFallback = "defaultFallBack")`：在类上指明统一的失败降级方法
- `@HystrixCommand`：在方法上直接使用该注解，使用默认的降级方法。
- `defaultFallback()`：默认降级方法，<span style="color:red">不能有任何参数，且返回值一定要一致</span>，以匹配更多方法

## 设置超时

在上面的案例中，你可以测试一下请求在超过1秒后未响应，就会会返回错误信息

这是因为Hystix的默认超时时长为1秒，我们可以通过配置修改这个值：

```yaml
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 6000 # 设置hystrix的超时时间为6000ms(6秒)
```

这里我们修改服务提供方，模拟网络延迟，在服务提供方睡眠8秒，启动

```java
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private IUserService userService;

    @GetMapping("/{id}")
    public TbUser queryUserById(@PathVariable Long id) {
        try {
            Thread.sleep(8000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return userService.queryById(id);
    }
}
```

重启 `spring-cloud-eureka-service-consumer`

这次就不是立马返回结果了，而是6秒之后

![1574764520930](https://cdn.tencentfs.clboy.cn/images/2021/20210911203244806.png)



## 服务熔断

​	

熔断器，也叫断路器，其英文单词为：Circuit Breaker 

熔断机制的原理很简单，像家里的电路熔断器，如果电路发生短路能立刻熔断电路，避免发生灾难。

在分布式系统中，服务调用方可以自已进行判断某些服务反应慢或者存在大量超时的情况时，能够主动熔断，防止整个系统被拖跨。

不同于电路熔断只能断不能自动重连，Hystrix可以实现弹性容错，当情况好转之后，可以自动重连。这就好比魔术师把鸽子变没了容易，但是真正考验技术的是如何把消失的鸽子再变回来。

通过断路的方式，可以将后续请求直接拒绝掉，一段时间之后允许部分请求通过，如果调用成功则回到电路闭合状态，否则继续断开。

熔断状态机3个状态：

- `Closed` ：关闭状态，所有请求都正常访问。
- `Open` ：打开状态，所有请求都会被降级。Hystix会对请求情况计数，当一定时间内失败请求比例达到阈值，则触发熔断，断路器会完全打开。默认失败比例的阈值是50%，请求次数最少不低于20次。
- `Half Open` ：半开状态，open状态不是永久的，打开后会进入休眠时间（默认是5S）。随后断路器会自动进入半开状态。此时会释放部分请求通过，若这些请求都是健康的，则会完全关闭断路器，否则继续保持打开，再次进行休眠计时

为了能够精确控制请求的成功或失败，我们在consumer的调用业务中加入一段逻辑：

```java
@RestController
@RequestMapping("user")
@DefaultProperties(defaultFallback = "defaultFallback")
public class UserController {

    @Autowired
    private RestTemplate restTemplate;


    @GetMapping("/{id}")
    @HystrixCommand
    public String getUserById(@PathVariable Long id) {
        if (id==1){
            throw new RuntimeException("忙碌中......");
        }
        //直接通过服务名称调用
        String baseUrl = "http://service-provider/user/";
        return restTemplate.getForObject(baseUrl+id, String.class);
    }

    public String defaultFallback(){
        return "请求繁忙，请稍后再试！";
    }
}
```

这样如果参数是id为1，一定失败，其它情况都成功。

!> 不要忘了删掉service-provider中的休眠逻辑

接下来

1. 请求<http://localhost:8083/user/2>，一切正常
2. 然后慢悠悠的请求，<http://localhost:8083/user/1>，20次，慢一点
3. 然后再访问2，还是正常
4. 接下来，疯狂请求<http://localhost:8083/user/1>，20次，快，一定要快
5. 接着再访问2，咦！发现2也无法访问，也被降级了
6. 然后，数5秒后再访问1后再访问2，依旧无法访问
7. 最后再数5秒后访问2，就可以访问了，结合熔断状态机3个状态想想，应该知道是怎么回事了吧



我们可以注解修改熔断策略：

```java
@RestController
@RequestMapping("user")
@DefaultProperties(
        defaultFallback = "defaultFallback",
        commandProperties = {
                @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "5"),
                @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "10000"),
                @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
        })
public class UserController {

    @Autowired
    private RestTemplate restTemplate;


    @GetMapping("/{id}")
    @HystrixCommand
    public String getUserById(@PathVariable Long id) {
        if (id == 1) {
            throw new RuntimeException("忙碌中......");
        }
        //直接通过服务名称调用
        String baseUrl = "http://service-provider/user/";
        return restTemplate.getForObject(baseUrl + id, String.class);
    }

    public String defaultFallback() {
        return "请求繁忙，请稍后再试！";
    }
}
```



- `requestVolumeThreshold` ：触发熔断的最小请求次数，默认20
- `sleepWindowInMilliseconds` ：休眠时长，默认是5000毫秒
- `errorThresholdPercentage` ：触发熔断的失败请求最小占比，默认50%

