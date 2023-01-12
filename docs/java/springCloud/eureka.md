# Eureka高可用

> [官方文档](https://docs.spring.io/spring-cloud-netflix/docs/current/reference/html/index.html)

## 基础架构

Eureka架构中的三个核心角色：

- 服务注册中心

  Eureka的服务端应用，提供服务注册和发现功能，就是刚刚我们建立的 `spring-cloud-eureka-server`。

- 服务提供者

  提供服务的应用，可以是SpringBoot应用，也可以是其它任意技术实现，只要对外提供的是Rest风格服务即可。

  上节案例中就是我们实现的 `spring-cloud-eureka-service-provider`。

- 服务消费者

  消费应用从注册中心获取服务列表，从而得知每个服务方的信息，知道去哪里调用服务方。
  
  上节案例中就是我们实现的 `spring-cloud-eureka-service-consumer`。



## 高可用的Eureka Server

Eureka Server即服务的注册中心，在上节的案例中，我们只有一个EurekaServer，事实上EurekaServer也可以是一个集群，形成高可用的Eureka中心。

> 服务同步

多个Eureka Server之间也会互相注册为服务，当服务提供者注册到Eureka Server集群中的某个节点时，该节点会把服务的信息同步给集群中的每个节点，从而实现**数据同步**。因此，客户端访问到Eureka Server集群中的任意一个节点，都可以获取到完整的服务列表信息。

> 动手搭建高可用的EurekaServer

我们假设要运行两个EurekaServer的集群，端口分别为：10001和10002。只需要把 `spring-cloud-eureka-server` 启动两次即可。



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

- 把service-url中 `defaultZone` 的值改成了另外一台EurekaServer的地址，而不是自己

启动报错，很正常。因为10002服务没有启动：

![1574732128406](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241592.png)

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

将应用复制一份，换个名字，点击应用然后启动

![1574732908137](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241731.png)

![1574732983985](https://cdn.tencentfs.clboy.cn/images/2021/20210911203241870.png)

![1574733028306](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242008.png)

![1574733235604](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242161.png)

ps：还有更加方便的是，不去修改 `application.yaml` ，而是在启动命令参数里指定端口后注册地址

```
-Dserver.port=10002 -Deureka.client.service-url.defaultZone=http://127.0.0.1:10001/eureka
```

启动后访问集群，测试

分别访问：<http://localhost:10001/> 和 <http://localhost:10002/>

![1574734126761](https://cdn.tencentfs.clboy.cn/images/2021/20210911203242724.png)

> 多个如何注册？

例如有3个，地址分别为：

1. 127.0.0.1:10001
2. 127.0.0.1:10002
3. 127.0.0.1:10003

注册时就把1注册给2,2注册给3,3注册给1

## 测试高可用简单方式

> 修改配置，在启动时指定参数

```yaml
server:
  # 为了方便启动时设置虚拟机参数
  port: ${SPORT:10001}
spring:
  application:
    name: demo-springcloud-helloworld-eureka-server
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:${NEXTPORT:${server.port}}/eureka
    register-with-eureka: true
    fetch-registry: true
```

![image-20210304115157183](https://cdn.tencentfs.clboy.cn/images/2021/20210911203246547.png)

> 然后再复制一份

![image-20210304115303050](https://cdn.tencentfs.clboy.cn/images/2021/20210911203246687.png)



## 服务注册

服务在启动时，会检测配置属性中的：`eureka.client.register-with-eureka` 的值是否为true，事实上默认就是true。如果为true，则会向EurekaServer发起一个Rest请求，并携带自己的元数据信息，Eureka Server会把这些信息保存到一个双层Map结构中。

- 第一层Map的Key就是服务id，一般是配置中的`spring.application.name`属性
- 第二层Map的key是服务的实例id(instance-id)，默认 `host:serviceId:port`，例如：`locahost:service-provider:8081`
- 值则是服务的实例对象，也就是说一个服务，可以同时启动多个不同实例，形成集群。



## 服务续约

服务注册到注册中心后，会维持一个心跳（定时向EurekaServer发起Rest请求），告诉EurekaServer：*我还活着* 。这个我们称为服务的续约（renew）；

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



## 拉去服务列表

当服务启动时，会检测 `eureka.client.fetch-registry` 属性的值(默认为true)，如果为true，则会向Eureka Server拉取已注册的服务列

然后缓存在本地。并且 *每隔30秒* 会重新获取并更新数据。我们可以通过下面的参数来修改：

```yaml
eureka:
  client:
    registry-fetch-interval-seconds: 5
```

生产环境中，我们不需要修改这个值。

但是为了开发环境下，能够快速得到服务的最新状态，我们可以将其设置小一点。



## 失效剔除和自我保护

> 服务下线

当服务进行正常关闭操作时，它会触发一个服务下线的REST请求给Eureka Server，告诉服务注册中心：我要下线了。服务中心接受到请求之后，将该服务置为下线状态。

> 失效剔除

有些时候，我们的服务提供方并不一定会正常下线，可能因为内存溢出、网络故障等原因导致服务无法正常工作。Eureka Server需要将这样的服务剔除出服务列表。因此它会开启一个定时任务，每隔60秒对所有失效的服务（超过90秒未响应的服务）进行剔除。

可以通过 `eureka.server.eviction-interval-timer-in-ms` 参数对其进行修改，单位是毫秒，生产环境不要修改。

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

![1525618396076](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225587.png)

这是触发了Eureka的自我保护机制。当一个服务未按时进行心跳续约时，Eureka会统计最近15分钟心跳失败的服务实例的比例是否超过了85%

如果低于 85%，Eureka Server 会将这些实例保护起来，让这些服务实例不会被剔除(依然可用)

在生产环境下，因为网络延迟等原因，心跳失败实例的比例很有可能超标，但是此时就把服务剔除列表并不妥当，因为服务可能没有宕机。Eureka就会把当前实例的注册信息保护起来，不予剔除。生产环境下这很有效，保证了大多数服务依然可用。

但是这给我们的开发带来了麻烦， 因此开发阶段我们都会关闭自我保护模式：

```yaml
eureka:
  server:
    enable-self-preservation: false # 关闭自我保护模式（默认为true）
    eviction-interval-timer-in-ms: 1000 # 扫描失效服务的间隔时间（默认60*1000ms）
```



## Eureka配置大全



###  instance 配置项

```properties
#服务注册中心实例的主机名
eureka.instance.hostname=localhost
#注册在Eureka服务中的应用组名
eureka.instance.app-group-name=
#注册在的Eureka服务中的应用名称
eureka.instance.appname=
#该实例注册到服务中心的唯一ID
eureka.instance.instance-id=
#该实例的IP地址
eureka.instance.ip-address=
#该实例，相较于hostname是否优先使用IP
eureka.instance.prefer-ip-address=false
 
#用于AWS平台自动扩展的与此实例关联的组名，
eureka.instance.a-s-g-name=
#部署此实例的数据中心
eureka.instance.data-center-info=
#默认的地址解析顺序
eureka.instance.default-address-resolution-order=
#该实例的环境配置
eureka.instance.environment=
#初始化该实例，注册到服务中心的初始状态
eureka.instance.initial-status=up
#表明是否只要此实例注册到服务中心，立马就进行通信
eureka.instance.instance-enabled-onit=false
#该服务实例的命名空间,用于查找属性
eureka.instance.namespace=eureka
#该服务实例的子定义元数据，可以被服务中心接受到
eureka.instance.metadata-map.test = test
 
#服务中心删除此服务实例的等待时间(秒为单位),时间间隔为最后一次服务中心接受到的心跳时间
eureka.instance.lease-expiration-duration-in-seconds=90
#该实例给服务中心发送心跳的间隔时间，用于表明该服务实例可用
eureka.instance.lease-renewal-interval-in-seconds=30
#该实例，注册服务中心，默认打开的通信数量
eureka.instance.registry.default-open-for-traffic-count=1
#每分钟续约次数
eureka.instance.registry.expected-number-of-renews-per-min=1
 
#该实例健康检查url,绝对路径
eureka.instance.health-check-url=
#该实例健康检查url,相对路径
eureka.instance.health-check-url-path=/health
#该实例的主页url,绝对路径
eureka.instance.home-page-url=
#该实例的主页url,相对路径
eureka.instance.home-page-url-path=/
#该实例的安全健康检查url,绝对路径
eureka.instance.secure-health-check-url=
#https通信端口
eureka.instance.secure-port=443
#https通信端口是否启用
eureka.instance.secure-port-enabled=false
#http通信端口
eureka.instance.non-secure-port=80
#http通信端口是否启用
eureka.instance.non-secure-port-enabled=true
#该实例的安全虚拟主机名称(https)
eureka.instance.secure-virtual-host-name=unknown
#该实例的虚拟主机名称(http)
eureka.instance.virtual-host-name=unknown
#该实例的状态呈现url,绝对路径
eureka.instance.status-page-url=
#该实例的状态呈现url,相对路径
eureka.instance.status-page-url-path=/status
```



### Client 配置项

```properties

#该客户端是否可用
eureka.client.enabled=true
#实例是否在eureka服务器上注册自己的信息以供其他服务发现，默认为true
eureka.client.register-with-eureka=false
#此客户端是否获取eureka服务器注册表上的注册信息，默认为true
eureka.client.fetch-registry=false
#是否过滤掉，非UP的实例。默认为true
eureka.client.filter-only-up-instances=true
#与Eureka注册服务中心的通信zone和url地址
eureka.client.serviceUrl.defaultZone=http://${eureka.instance.hostname}:${server.port}/eureka/
 
#client连接Eureka服务端后的空闲等待时间，默认为30 秒
eureka.client.eureka-connection-idle-timeout-seconds=30
#client连接eureka服务端的连接超时时间，默认为5秒
eureka.client.eureka-server-connect-timeout-seconds=5
#client对服务端的读超时时长
eureka.client.eureka-server-read-timeout-seconds=8
#client连接all eureka服务端的总连接数，默认200
eureka.client.eureka-server-total-connections=200
#client连接eureka服务端的单机连接数量，默认50
eureka.client.eureka-server-total-connections-per-host=50
#执行程序指数回退刷新的相关属性，是重试延迟的最大倍数值，默认为10
eureka.client.cache-refresh-executor-exponential-back-off-bound=10
#执行程序缓存刷新线程池的大小，默认为5
eureka.client.cache-refresh-executor-thread-pool-size=2
#心跳执行程序回退相关的属性，是重试延迟的最大倍数值，默认为10
eureka.client.heartbeat-executor-exponential-back-off-bound=10
#心跳执行程序线程池的大小,默认为5
eureka.client.heartbeat-executor-thread-pool-size=5
# 询问Eureka服务url信息变化的频率（s），默认为300秒
eureka.client.eureka-service-url-poll-interval-seconds=300
#最初复制实例信息到eureka服务器所需的时间（s），默认为40秒
eureka.client.initial-instance-info-replication-interval-seconds=40
#间隔多长时间再次复制实例信息到eureka服务器，默认为30秒
eureka.client.instance-info-replication-interval-seconds=30
#从eureka服务器注册表中获取注册信息的时间间隔（s），默认为30秒
eureka.client.registry-fetch-interval-seconds=30
 
# 获取实例所在的地区。默认为us-east-1
eureka.client.region=us-east-1
#实例是否使用同一zone里的eureka服务器，默认为true，理想状态下，eureka客户端与服务端是在同一zone下
eureka.client.prefer-same-zone-eureka=true
# 获取实例所在的地区下可用性的区域列表，用逗号隔开。（AWS）
eureka.client.availability-zones.china=defaultZone,defaultZone1,defaultZone2
#eureka服务注册表信息里的以逗号隔开的地区名单，如果不这样返回这些地区名单，则客户端启动将会出错。默认为null
eureka.client.fetch-remote-regions-registry=
#服务器是否能够重定向客户端请求到备份服务器。 如果设置为false，服务器将直接处理请求，如果设置为true，它可能发送HTTP重定向到客户端。默认为false
eureka.client.allow-redirects=false
#客户端数据接收
eureka.client.client-data-accept=
#增量信息是否可以提供给客户端看，默认为false
eureka.client.disable-delta=false
#eureka服务器序列化/反序列化的信息中获取“_”符号的的替换字符串。默认为“__“
eureka.client.escape-char-replacement=__
#eureka服务器序列化/反序列化的信息中获取“$”符号的替换字符串。默认为“_-”
eureka.client.dollar-replacement="_-"
#当服务端支持压缩的情况下，是否支持从服务端获取的信息进行压缩。默认为true
eureka.client.g-zip-content=true
#是否记录eureka服务器和客户端之间在注册表的信息方面的差异，默认为false
eureka.client.log-delta-diff=false
# 如果设置为true,客户端的状态更新将会点播更新到远程服务器上，默认为true
eureka.client.on-demand-update-status-change=true
#此客户端只对一个单一的VIP注册表的信息感兴趣。默认为null
eureka.client.registry-refresh-single-vip-address=
#client是否在初始化阶段强行注册到服务中心，默认为false
eureka.client.should-enforce-registration-at-init=false
#client在shutdown的时候是否显示的注销服务从服务中心，默认为true
eureka.client.should-unregister-on-shutdown=true
 
# 获取eureka服务的代理主机，默认为null
eureka.client.proxy-host=
#获取eureka服务的代理密码，默认为null
eureka.client.proxy-password=
# 获取eureka服务的代理端口, 默认为null
eureka.client.proxy-port=
# 获取eureka服务的代理用户名，默认为null
eureka.client.proxy-user-name=
 
#属性解释器
eureka.client.property-resolver=
#获取实现了eureka客户端在第一次启动时读取注册表的信息作为回退选项的实现名称
eureka.client.backup-registry-impl=
#这是一个短暂的×××的配置，如果最新的×××是稳定的，则可以去除，默认为null
eureka.client.decoder-name=
#这是一个短暂的编码器的配置，如果最新的编码器是稳定的，则可以去除，默认为null
eureka.client.encoder-name=
 
#是否使用DNS机制去获取服务列表，然后进行通信。默认为false
eureka.client.use-dns-for-fetching-service-urls=false
#获取要查询的DNS名称来获得eureka服务器，此配置只有在eureka服务器ip地址列表是在DNS中才会用到。默认为null
eureka.client.eureka-server-d-n-s-name=
#获取eureka服务器的端口，此配置只有在eureka服务器ip地址列表是在DNS中才会用到。默认为null
eureka.client.eureka-server-port=
#表示eureka注册中心的路径，如果配置为eureka，则为http://x.x.x.x:x/eureka/，在eureka的配置文件中加入此配置表示eureka作为客户端向注册中心注册，从而构成eureka集群。此配置只有在eureka服务器ip地址列表是在DNS中才会用到，默认为null
eureka.client.eureka-server-u-r-l-context=
```

### Dashboard仪表板配置项

```properties

#是否启用Eureka的仪表板。默认为true.
eureka.dashboard.enabled=true
#到Eureka仪表板的服务路径（相对于servlet路径）。默认为“/”
eureka.dashboard.path=/
```



### server与client 关联配置项

```properties
#服务端开启自我保护模式。无论什么情况，服务端都会保持一定数量的服务。避免client与server的网络问题，而出现大量的服务被清除。
eureka.server.enable-self-preservation=true
#开启清除无效服务的定时任务，时间间隔。默认1分钟
eureka.server.eviction-interval-timer-in-ms= 60000
#间隔多长时间，清除过期的delta数据
eureka.server.delta-retention-timer-interval-in-ms=0
#过期数据，是否也提供给client
eureka.server.disable-delta=false
#eureka服务端是否记录client的身份header
eureka.server.log-identity-headers=true
#请求频率限制器
eureka.server.rate-limiter-burst-size=10
#是否开启请求频率限制器
eureka.server.rate-limiter-enabled=false
#请求频率的平均值
eureka.server.rate-limiter-full-fetch-average-rate=100
#是否对标准的client进行频率请求限制。如果是false，则只对非标准client进行限制
eureka.server.rate-limiter-throttle-standard-clients=false
#注册服务、拉去服务列表数据的请求频率的平均值
eureka.server.rate-limiter-registry-fetch-average-rate=500
#设置信任的client list
eureka.server.rate-limiter-privileged-clients=
#在设置的时间范围类，期望与client续约的百分比。
eureka.server.renewal-percent-threshold=0.85
#多长时间更新续约的阈值
eureka.server.renewal-threshold-update-interval-ms=0
#对于缓存的注册数据，多长时间过期
eureka.server.response-cache-auto-expiration-in-seconds=180
#多长时间更新一次缓存中的服务注册数据
eureka.server.response-cache-update-interval-ms=0
#缓存增量数据的时间，以便在检索的时候不丢失信息
eureka.server.retention-time-in-m-s-in-delta-queue=0
#当时间戳不一致的时候，是否进行同步
eureka.server.sync-when-timestamp-differs=true
#是否采用只读缓存策略，只读策略对于缓存的数据不会过期。
eureka.server.use-read-only-response-cache=true
```

