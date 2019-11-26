# Eureka高可用和详解

## 基础架构

Eureka架构中的三个核心角色：

- 服务注册中心

  Eureka的服务端应用，提供服务注册和发现功能，就是刚刚我们建立的`springcloud-eureka-server`。

- 服务提供者

  提供服务的应用，可以是SpringBoot应用，也可以是其它任意技术实现，只要对外提供的是Rest风格服务即可。上节案例中就是我们实现的`springcloud-eureka-service-provider`。

- 服务消费者

  消费应用从注册中心获取服务列表，从而得知每个服务方的信息，知道去哪里调用服务方。上节案例中就是我们实现的`springcloud-eureka-service-consumer`。



## 高可用的Eureka Server

Eureka Server即服务的注册中心，在上节的案例中，我们只有一个EurekaServer，事实上EurekaServer也可以是一个集群，形成高可用的Eureka中心。

> 服务同步

多个Eureka Server之间也会互相注册为服务，当服务提供者注册到Eureka Server集群中的某个节点时，该节点会把服务的信息同步给集群中的每个节点，从而实现**数据同步**。因此，无论客户端访问到Eureka Server集群中的任意一个节点，都可以获取到完整的服务列表信息。

> 动手搭建高可用的EurekaServer

我们假设要运行两个EurekaServer的集群，端口分别为：10001和10002。只需要把`springcloud-eureka-server`启动两次即可。



```yaml
server:
  port: 10001
spring:
  application:
    name: eureka-server
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10002/eureka
```



所谓的高可用注册中心，其实就是把EurekaServer自己也作为一个服务进行注册，这样多个EurekaServer之间就能互相发现对方，从而形成集群。因此我们做了以下修改：

- 把service-url的值改成了另外一台EurekaServer的地址，而不是自己

启动报错，很正常。因为10002服务没有启动：

![1574732128406](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574732128406.png)

再次修改springcloud-eureka-server的配置(将10002注册给10001)：

```yaml
server:
  port: 10002
spring:
  application:
    name: eureka-server
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka

```

将应用复制一份，换个名字，点击应用然后启动，如果没有services这个窗口，参考这里：[RunDashboard如何显示出来](<https://jingyan.baidu.com/article/ce4366495a1df73773afd3d3.html>)，也可以使用[第二种方式](#second-way)

![1574732908137](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574732908137.png)

![1574732983985](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574732983985.png)

![1574733028306](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574733028306.png)

![1574733235604](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574733235604.png)

<details id="second-way">

​    <summary>第二种方式</summary>

![1574733492084](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574733492084.png)

![1574733572547](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574733572547.png)

![1574733661113](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574733661113.png)

</details>

启动后访问集群，测试

分别访问：<http://localhost:10001/>和<http://localhost:10002/>

![1574734126761](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1574734126761.png)

> 多个如何注册？

例如有3个，地址分别为：

1. 127.0.0.1:10001
2. 127.0.0.1:10002
3. 127.0.0.1:10003

注册时就把1注册给2,2注册给3,3注册给1



## 服务提供者

启动`springcloud-eureka-service-provider`

服务提供者要向EurekaServer注册服务，并且完成服务续约等工作。

> 服务注册

服务提供者在启动时，会检测配置属性中的：`eureka.client.register-with-eureka=true`参数是否正确，事实上默认就是true。如果值确实为true，则会向EurekaServer发起一个Rest请求，并携带自己的元数据信息，Eureka Server会把这些信息保存到一个双层Map结构中。

- 第一层Map的Key就是服务id，一般是配置中的`spring.application.name`属性
- 第二层Map的key是服务的实例id。一般host+ serviceId + port，例如：`locahost:service-provider:8081`
- 值则是服务的实例对象，也就是说一个服务，可以同时启动多个不同实例，形成集群。

> 服务续约

在注册服务完成以后，服务提供者会维持一个心跳（定时向EurekaServer发起Rest请求），告诉EurekaServer：“我还活着”。这个我们称为服务的续约（renew）；

有两个重要参数可以修改服务续约的行为：

```yaml
eureka:
  instance:
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
```

- `lease-renewal-interval-in-seconds`：服务续约(renew)的间隔，默认为30秒
- `lease-expiration-duration-in-seconds`：服务失效时间，默认值90秒

也就是说，默认情况下每隔30秒服务会向注册中心发送一次心跳，证明自己还活着。如果超过90秒没有发送心跳，EurekaServer就会认为该服务宕机，会从服务列表中移除，这两个值在生产环境不要修改，默认即可。

但是在开发时，这个值有点太长了，经常我们关掉一个服务，会发现Eureka依然认为服务在活着。所以我们在开发阶段可以适当调小。

```yaml
eureka:
  instance:
    lease-expiration-duration-in-seconds: 10 # 10秒即过期
    lease-renewal-interval-in-seconds: 5 # 5秒一次心跳
```



## 服务消费者

启动`springcloud-eureka-service-customer`

> 获取服务列表

当服务消费者启动时，会检测`eureka.client.fetch-registry=true`参数的值，如果为true，则会拉取Eureka Server服务的列表只读备份，然后缓存在本地(默认为true)。并且`每隔30秒`会重新获取并更新数据。我们可以通过下面的参数来修改：

```yaml
eureka:
  client:
    registry-fetch-interval-seconds: 5
```

生产环境中，我们不需要修改这个值。

但是为了开发环境下，能够快速得到服务的最新状态，我们可以将其设置小一点。



## 失效剔除和自我保护

> 服务下线

当服务进行正常关闭操作时，它会触发一个服务下线的REST请求给Eureka Server，告诉服务注册中心：“我要下线了”。服务中心接受到请求之后，将该服务置为下线状态。

> 失效剔除

有些时候，我们的服务提供方并不一定会正常下线，可能因为内存溢出、网络故障等原因导致服务无法正常工作。Eureka Server需要将这样的服务剔除出服务列表。因此它会开启一个定时任务，每隔60秒对所有失效的服务（超过90秒未响应的服务）进行剔除。

可以通过`eureka.server.eviction-interval-timer-in-ms`参数对其进行修改，单位是毫秒，生产环境不要修改。

这个会对我们开发带来极大的不变，你对服务重启，隔了60秒Eureka才反应过来。开发阶段可以适当调整，比如：10秒

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
  server:
    eviction-interval-timer-in-ms: 10000
```



> 自我保护

我们关停一个服务，就会在Eureka面板看到一条警告：

![1525618396076](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1525618396076.png)

这是触发了Eureka的自我保护机制。当一个服务未按时进行心跳续约时，Eureka会统计最近15分钟心跳失败的服务实例的比例是否超过了85%。在生产环境下，因为网络延迟等原因，心跳失败实例的比例很有可能超标，但是此时就把服务剔除列表并不妥当，因为服务可能没有宕机。Eureka就会把当前实例的注册信息保护起来，不予剔除。生产环境下这很有效，保证了大多数服务依然可用。

但是这给我们的开发带来了麻烦， 因此开发阶段我们都会关闭自我保护模式：（springcloud-eureka-server）

```yaml
eureka:
  server:
    enable-self-preservation: false # 关闭自我保护模式（缺省为打开）
    eviction-interval-timer-in-ms: 1000 # 扫描失效服务的间隔时间（缺省为60*1000ms）
```