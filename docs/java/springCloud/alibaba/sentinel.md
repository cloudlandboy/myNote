# Sentinel

> Sentinel 是面向分布式、多语言异构化服务架构的流量治理组件，主要以流量为切入点，从流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护等多个维度来帮助开发者保障微服务的稳定性。

官网：https://sentinelguard.io/zh-cn/docs/introduction.html

Sentinel提供和Hystrix类似的功能，这里就不再过多的介绍它了，但是它的功能要比Hystrix丰富



## 依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

添加完依赖项目就启用了sentinel，引入 `spring-boot-starter-actuator` 的依赖并暴露出所有端点，然后就可以在端点列表中 `/actuator` 看到 `sentinel` 端点：`/actuator/sentinel`



## 控制台

我们可以从 https://github.com/alibaba/Sentinel/releases 下载与依赖中 `sentienl-core` 相同版本号的控制台jar包

我这里使用的是 *1.8.5* 版本，下载下来后直接运行

```shell
java -jar sentinel-dashboard-1.8.5.jar
```

默认会在 **8080** 端口启动

访问 http://127.0.0.1:8080 ，默认用户名和密码都是 `sentinel`

## 服务连接控制台

在服务的配置文件中配置sentienl控制台的连接地址

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: 127.0.0.1:8080
```

默认是懒加载，重启后随便访问服务中的一个接口，然后在控制台页面就可以看到服务了



## 流控规则

​	启动服务后，我们成功 *访问过的 api路径(资源)* 在sentinel控制台中点击 **簇点链路** 菜单就可以看到，然后可以在点击资源后面的流控按钮为其增加流控规则

- **资源名** ：唯一名称，一般来说就是api路径

- **针对来源**：Sentinel可以针对调用者进行限流，填写微服务名，指定对哪个微服务进行限流 ，默认default(不区分来源，全部限制)；

  对调用同一个资源时，Sentinel是能够区分不同调用者，为不同的调用者设置不一样的流控规则；

- **阈值类型** ：触发流量控制的条件类型

  - **QPS** ：每秒钟的请求数量，当调用接口的QPS达到阈值的时候，进行限流；
  - **并发线程数** ：当调用接口的线程数达到阈值的时候，进行限流；

- **单机阈值** ：触发流量控制的条件值

- **是否集群** ：服务实例是否为集群，如果为集群，单机阈值就变成了均摊阈值

- **流控模式** ：

  - **直接** ：接口达到限流条件时，直接限流；
  - **关联** ：设置 **关联的资源** ，当关联的资源达到阈值时，就限流自己。A资源关联B资源，B资源达到阈值时就限制对A资源的访问。比如新增和查询接口相关联，当查询接口并发量比较高时就限制新增
  - **链路** ：只记录指定链路上的流量 ，设置从 **入口资源** 进来的流量，如果达到阈值，就进行限流。A、B都调用了C，A调用C的频率达到了阈值就限制A对C的调用，如果B调用C没有达到阈值，B仍然可以调用C

- **流控效果** ：

  - **快速失败** ：直接失败，抛异常
  - **Warm Up** ：根据codeFactor（冷加载因子，默认为3）的值，即 阈值/codeFactor，经过设置的 **预热时长** ，逐渐升至设定的QPS阈值；
  - **排队等待** ：匀速排队，让请求以匀速的速度通过，*阈值类型必须设置为QPS*，否则无效；



## 熔断降级规则

### 慢调用比例

选择以慢调用比例作为阈值，需要设置允许的慢调用 RT（即最大的响应时间）。请求的响应时间大于该值则统计为慢调用，当单位统计时长内请求数目大于设置的最小请求数目，并且慢调用的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入半开状态，若接下来的一个请求响应时间小于设置的慢调用 RT 则结束熔断，若大于设置的慢调用 RT 则会再次被熔断。

![image-20230221181530632](https://cdn.tencentfs.clboy.cn/images/2023/20230222100403246.png)

如上设置就解释为1秒内8个请求中如果4个请求的响应时间超过了200毫秒，就会打开断路器，等待5秒后再进入半开状态

!> 其中RT(最大响应时长)最多只能设置为 4900

如果要设置更大的值需要在启动sentinel控制台的时候使用 ` csp.sentinel.statistic.max.rt` 参数指定



### 异常比例

单位统计时长内请求数目大于设置的最小请求数目，并且异常的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入半开状态，若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断

![image-20230221182515210](https://cdn.tencentfs.clboy.cn/images/2023/20230222100408763.png)

如上设置就解释为3秒内8个请求中如果有一半请求抛出异常就会打开断路器，等待4秒后再进入半开状态

### 异常数

当单位统计时长内的异常数目超过阈值之后会自动进行熔断，就是把异常比例换成确切的数值，这个就不过多介绍了



!> 测试的时候应该把之前的规则删除掉再测试，避免多个规则造成干扰，另外，你会发现触发流量控制和熔断降级时sentinel抛出的异常信息和状态码都是一样的，状态码为 `429` 





## 热点规则

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

假设有如下Controller接口

```java
@RestController
@RequestMapping("/user")
public class UserController {

    @GetMapping("/search")
    public ResponseEntity<String> search(Integer page, Integer size, String keyword) {
        return ResponseEntity.ok("" + page + size + keyword);
    }

}
```

![image-20230221191051348](https://cdn.tencentfs.clboy.cn/images/2023/20230222100414093.png)

其中参数索引对应Controller方法中参数的位置，下标从0开始，并且 *只支持基本类型和String类型参数*

上图中的配置就应该解释为下标为2的参数(keyword)，5秒内同样的值只能够调用一次

但当时你添加热点规则后测试发现并没有达到预期的效果，好像没什么卵用

我们需要给方法上标注 `@SentinelResource` 注解，然后重启后访问一次接口，再在控制台查看 ` /user/search` 资源名下就会多出一个以方法签名为资源名的资源，然后对这个资源进行热点设置

![image-20230221200026128](https://cdn.tencentfs.clboy.cn/images/2023/20230222100418757.png)

另外，在控制台中的热点规则中对刚在的规则进行编辑，还会有高级选项可以对特殊参数值进行单独设置

![image-20230221200551243](https://cdn.tencentfs.clboy.cn/images/2023/20230222100424570.png)

如上图配置，表示keyword的值为李四时，5秒能只能有10个QPS，为其他值时可以有1000个QPS



## 系统规则

系统保护规则是从应用级别的入口流量进行控制，从单台机器的总体 Load、RT、入口 QPS 和线程数四个维度监控应用数据，让系统尽可能跑在最大吞吐量的同时保证系统整体的稳定性。

系统保护规则是应用整体维度的，而不是资源维度的，并且 **仅对入口流量生效** 。

入口流量指的是进入应用的流量（`EntryType.IN`），比如 Web 服务或 Dubbo 服务端接收的请求，都属于入口流量。

系统规则支持以下的阈值类型：

- **Load**（仅对 Linux/Unix-like 机器生效）：当系统 load1 超过阈值，且系统当前的并发线程数超过系统容量时才会触发系统保护。系统容量由系统的 `maxQps * minRt` 计算得出。设定参考值一般是 `CPU核心数 * 2.5`。
- **CPU usage**（1.5.0+ 版本）：当系统 CPU 使用率超过阈值即触发系统保护（取值范围 0.0-1.0）。
- **RT(响应时间)** ：当单台机器上所有入口流量的平均 RT 达到阈值即触发系统保护，单位是毫秒。
- **线程数**：当单台机器上所有入口流量的并发线程数达到阈值即触发系统保护。
- **入口 QPS**：当单台机器上所有入口流量的 QPS 达到阈值即触发系统保护。



## 授权规则

授权规则是用来配置允许哪些微服务访问该资源，或者禁止哪些微服务访问该资源





## 服务如何与控制台通信的



服务需要集成 `sentinel-transport-simple-http` 模块 (引入的 `spring-cloud-starter-alibaba-sentinel` 中包含)，引入这个模块并在配置文件中配置控制台地址后，服务就会把自己注册到控制台上，然后会定时给控制台发送心跳。也就是说sentinel实现了服务发现机制，充当注册中心的角色

![mpv-shot0010](https://cdn.tencentfs.clboy.cn/images/2023/20230222100430507.jpg)

可以在控制台服务名称下的机器列表中看到注册的服务实例，其中端口号为服务与控制台通信的端口，而不是 `server.port` 配置的WEB端口

ip就是服务注册到控制台时使用的ip，这些都可以在配置文件中修改

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: 127.0.0.1:8080
        client-ip: 127.0.0.1
        port: 6666
```

访问与控制台通信端口下的 `/api` 端点即可看到服务暴露出来与控制台通信的端点

http://127.0.0.1:8719/api

其中 `/metric` 是获取监控信息，`/setRules` 用来配置规则

另外在Actuator下的 `/sentinel` 端点中也能看到服务当前关与sentinel的一些配置

http://127.0.0.1:10002/actuator/sentinel



## 代码方式配置



之前我们都是在控制台配置的规则，接下来看一下在代码中该如何配置



### 流控

流控规则（FlowRule）包含下面几个重要的属性：

| 属性名          | 说明                         | 默认值             |
| --------------- | ---------------------------- | ------------------ |
| resource        | 资源名，限流规则下的唯一名称 |                    |
| count           | 限流阀值                     |                    |
| grade           | 限流阀值类型，QPS或线程数    | QPS                |
| limitApp        | 针对来源                     | default,不区分来源 |
| strategy        | 流控模式                     | 直接               |
| controlBehavior | 流控效果                     | 快速失败           |

如下代码所示：

```java
@RestController
@RequestMapping("/rule")
public class RuleTestController {

    /**
     * 流控规则
     *
     * @return {@code String }
     * @author clboy
     * @date 2023/02/22 10:57:04
     * @since 1.0.0
     */
    @GetMapping("/flow")
    public String flowRule() {
        //==========> 定义规则开始
        // 资源名称
        String resourceName = "rule-flow";
        FlowRule rule = new FlowRule(resourceName);
        //限流阈值
        rule.setCount(2);
        //阀值类型
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        //针对来源
        rule.setLimitApp(RuleConstant.LIMIT_APP_DEFAULT);
        //流控模式[直接、关联、链路]
        rule.setStrategy(RuleConstant.STRATEGY_DIRECT);
        //流控效果
        rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);
        FlowRuleManager.loadRules(Collections.singletonList(rule));
        //==========> 定义规则结束

        //SphU：用于记录统计信息和对资源执行规则检查的基本 Sentinel API。
        //从概念上讲，需要保护的物理或逻辑资源应由条目包围。如果满足任何条件，则对此资源的请求将被阻止
        //例如。当超过任何 Rule的阈值时。一旦被阻止，就会被抛出。BlockException
        try (Entry entry = SphU.entry(resourceName)) {
            // 被保护的逻辑
            System.out.println("rule-flow");
            return "rule-flow";
        } catch (BlockException e) {
            // 处理被流控的逻辑
            System.out.println("blocked!");
            throw new RuntimeException("访问太频繁啦，请稍后再试", e);
        }


    }
}
```



### 熔断降级

熔断降级规则（DegradeRule）包含下面几个重要的属性：

|       属性名       | 说明                                                         | 默认值     |
| :----------------: | :----------------------------------------------------------- | :--------- |
|      resource      | 资源名，即规则的作用对象                                     |            |
|       grade        | 熔断策略，支持慢调用比例/异常比例/异常数策略                 | 慢调用比例 |
|       count        | 慢调用比例模式下为慢调用临界 RT（超出该值计为慢调用）；异常比例/异常数模式下为对应的阈值 |            |
|     timeWindow     | 熔断时长，单位为秒                                           |            |
|  minRequestAmount  | 熔断触发的最小请求数，请求数小于该值时即使异常比率超出阈值也不会熔断（1.7.0 引入） | 5          |
|   statIntervalMs   | 统计时长（单位为毫秒），如 60*1000 代表分钟级（1.8.0 引入）  | 1000 ms    |
| slowRatioThreshold | 慢调用比例阈值，仅慢调用比例模式有效（1.8.0 引入）           |            |

```java
@RestController
@RequestMapping("/rule")
public class RuleTestController {

    private static final String RULE_DEGRADE_RESOURCE_NAME = "rule-degrade";

    /**
     * 降级规则
     *
     * @return {@code String }
     * @author clboy
     * @date 2023/02/22 13:46:29
     * @since 1.0.0
     */
    @GetMapping("/degrade")
    public String degradeRule() {
        initDegradeRule();
        Entry entry = null;
        try {
            entry = SphU.entry(RULE_DEGRADE_RESOURCE_NAME);
            // 被保护的逻辑
            System.out.println(RULE_DEGRADE_RESOURCE_NAME);
            if (true) {
                throw new IllegalArgumentException("参数非法");
            }
            return RULE_DEGRADE_RESOURCE_NAME;
        } catch (BlockException e) {
            // 处理被流控的逻辑
            System.out.println("blocked!");
            throw new RuntimeException("服务器当前压力太大，请稍后再试", e);
        } catch (Exception e) {
            //如果不是已经被降级的异常：BlockException，而是程序中抛出的普通异常交给记录器记录
            Tracer.trace(e);
            return "服务器出错了！！！";
        } finally {
            if (entry != null) {
                entry.close();
            }
        }
    }

    private void initDegradeRule() {
        DegradeRule rule = new DegradeRule(RULE_DEGRADE_RESOURCE_NAME);
        //异常比例模式
        rule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
        rule.setCount(0.5);
        //熔断触发的最小请求数，请求数小于该值时即使异常比率超出阈值也不会熔断
        rule.setMinRequestAmount(4);
        //统计时长（单位为毫秒）
        rule.setStatIntervalMs(5000);
        //熔断时长，单位为秒
        rule.setTimeWindow(10);
        DegradeRuleManager.loadRules(Collections.singletonList(rule));
    }
}
```



!> 需要重点注意的是：由于需要在catch语句块中进行业务异常记录，此时不能使用 **try-with-resources** 那种语法糖，因为它会在catch语句块之前调用close方法，从而导致降级失效



### 热点参数



热点参数规则（ParamFlowRule）包含下面几个重要的属性：

|       属性        | 说明                                                         | 默认值   |
| :---------------: | :----------------------------------------------------------- | :------- |
|     resource      | 资源名，必填                                                 |          |
|       count       | 限流阈值，必填                                               |          |
|       grade       | 限流模式                                                     | QPS 模式 |
|   durationInSec   | 统计窗口时间长度（单位为秒），1.6.0 版本开始支持             | 1s       |
|  controlBehavior  | 流控效果（支持快速失败和匀速排队模式），1.6.0 版本开始支持   | 快速失败 |
| maxQueueingTimeMs | 最大排队等待时长（仅在匀速排队模式生效），1.6.0 版本开始支持 | 0ms      |
|     paramIdx      | 热点参数的索引，必填，对应 `SphU.entry(xxx, args)` 中的参数索引位置 |          |
| paramFlowItemList | 参数例外项，可以针对指定的参数值单独设置限流阈值，不受前面 `count` 阈值的限制。**仅支持基本类型和字符串类型** |          |
|    clusterMode    | 是否是集群参数流控规则                                       | `false`  |
|   clusterConfig   | 集群流控相关配置                                             |          |

```java
private static final String RULE_PARAM_FLOW_RESOURCE_NAME = "rule-param-flow";

@GetMapping("/param_flow")
public String paramFlowRule(Integer page, Integer size, String keyword) {
    initParamFlowRule();
    Entry entry = null;
    try {
        entry = SphU.entry(RULE_PARAM_FLOW_RESOURCE_NAME, EntryType.IN, 1, keyword);
        // 被保护的逻辑
        System.out.println("==============================================");
        System.out.println("page：" + page);
        System.out.println("size：" + size);
        System.out.println("keyword：" + keyword);
        return RULE_PARAM_FLOW_RESOURCE_NAME;
    } catch (BlockException e) {
        // 处理被流控的逻辑
        System.out.println("blocked!");
        throw new RuntimeException("当前搜索关键词太火爆了！！！，请稍后再试", e);
    } finally {
        if (entry != null) {
            //若entry的时候传入了热点参数，那么 exit 的时候也一定要带上对应的参数,否则可能会有统计错误
            entry.exit(1, keyword);
        }
    }
}

private void initParamFlowRule() {
    ParamFlowRule rule = new ParamFlowRule(RULE_PARAM_FLOW_RESOURCE_NAME);
    //限流阈值
    rule.setCount(5);
    //热点参数的索引(从0开始)，必填，对应 SphU.entry(xxx, args) 中的参数索引位置
    rule.setParamIdx(0);
    //统计窗口时间长度（单位为秒）
    rule.setDurationInSec(5);
    ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

### 系统规则

```java
@GetMapping("/system")
public String systemRule() {
    initSystemRule();
    System.out.println(RULE_SYSTEM_RESOURCE_NAME);
    //每次开一个死循环，都访问几次就会让cpu飙升
    new Thread(() -> {
        while (true) {
        }
    }).start();
    return RULE_SYSTEM_RESOURCE_NAME;

}

private void initSystemRule() {
    SystemRule rule = new SystemRule();
    rule.setResource(RULE_SYSTEM_RESOURCE_NAME);
    rule.setHighestCpuUsage(0.5);
    SystemRuleManager.loadRules(Collections.singletonList(rule));
}
```

### 授权

黑白名单规则（AuthorityRule）非常简单，主要有以下配置项：

| 属性名   | 说明                                                         | 默认值          |
| -------- | ------------------------------------------------------------ | --------------- |
| resource | 资源名，限流规则下的唯一名称                                 |                 |
| limitApp | 对应的黑名单/白名单，不同 origin 用 , 分隔，如 appA,appB     |                 |
| strategy | 限制模式，`AUTHORITY_WHITE` 为白名单模式，`AUTHORITY_BLACK` 为黑名单模式 | AUTHORITY_WHITE |

首先，在web环境中需要向spring容器中注册一个 `RequestOriginParser` 类型的实现，告诉sentinel拦截器如何从请求中提取调用来源名称

```java
@Configuration
public class SentinelConfig {

    @Bean
    public RequestOriginParser originParser() {
        return request -> request.getParameter("appName");
    }
}
```

```java
@GetMapping("/authority")
public String authorityRule(@RequestParam("appName") String appName) {
    // 设置调用者名称，该方法一个线程中只有第一次调用生效
    // web环境中这里设置无效，已经由拦截器处理，源码查看：AbstractSentinelInterceptor#preHandle
    //ContextUtil.enter(RULE_AUTHORITY_RESOURCE_NAME, appName);

    Entry entry = null;
    try {
        entry = SphU.entry(RULE_AUTHORITY_RESOURCE_NAME);
        // 被保护的逻辑
        System.out.println(RULE_AUTHORITY_RESOURCE_NAME + ": " + appName);
        return RULE_AUTHORITY_RESOURCE_NAME;
    } catch (BlockException e) {
        // 处理被流控的逻辑
        System.out.println("blocked!");
        throw new RuntimeException("没有权限访问", e);
    } finally {
        if (entry != null) {
            entry.exit();
        }
        //ContextUtil.exit();
    }


}

@PostConstruct
private void initAuthorityRule() {
    AuthorityRule rule = new AuthorityRule();
    rule.setResource(RULE_AUTHORITY_RESOURCE_NAME);
    rule.setStrategy(RuleConstant.AUTHORITY_BLACK);
    rule.setLimitApp("appB,appD");
    AuthorityRuleManager.loadRules(Collections.singletonList(rule));
}
```



## 注解方式配置

Sentinel 提供了 `@SentinelResource` 注解用于定义资源，并提供了 AspectJ 的扩展用于自动定义资源、处理 `BlockException` 等

| 属性名             | 说明                                                         | 必填 | 默认            |
| ------------------ | ------------------------------------------------------------ | ---- | --------------- |
| value              | 资源名称                                                     | 是   |                 |
| entryType          | entry 类型                                                   | 否   | `EntryType.OUT` |
| *resourceType*     | （1.7.0及之后版本支持）资源的分类（类型）                    | 否   | 0               |
| blockHandler       | 处理 `BlockException` 的函数名称，函数要求：<br />1. 访问范围修饰符必须为 `public`<br />2. 返回类型需要与原方法相匹配<br />3. 参数类型需要和原方法相匹配并且最后加一个 `BlockException` 类型的参数<br />4. 需要和原方法在同一个类中。若希望使用其他类的函数，则可以用 `blockHandlerClass` 指定 | 否   |                 |
| blockHandlerClass  | 存放blockHandler的类。对应的处理函数必须static修饰，否则无法解析，其他要求：同blockHandler。 | 否   |                 |
| fallback           | 用于在抛出异常的时候提供fallback处理逻辑。fallback函数可以针对所有类型的异常（除了exceptionsToIgnore里面排除掉的异常类型）进行处理。函数要求：<br />1. 返回值类型必须与原函数返回值类型一致<br />2. 方法参数列表需要和原函数一致，或者可以额外多一个 `Throwable` 类型的参数用于接收对应的异常。<br />3. 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 `fallbackClass` | 否   |                 |
| fallbackClass      | 存放fallback的类。对应的处理函数必须static修饰，否则无法解析，其他要求：同fallback。 | 否   |                 |
| defaultFallback    | 默认的 fallback 函数名称，可选项，通常用于通用的 fallback 逻辑（即可以用于很多服务或方法）。默认 fallback 函数可以针对所有类型的异常（除了 `exceptionsToIgnore` 里面排除掉的异常类型）进行处理。若同时配置了 fallback 和 defaultFallback，则只有 fallback 会生效。defaultFallback 函数签名要求：<br />1. 返回值类型必须与原函数返回值类型一致；<br />2. 方法参数列表需要为空，或者可以额外多一个 `Throwable` 类型的参数用于接收对应的异常。<br />3. 需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 fallbackClass | 否   |                 |
| exceptionsToTrace  | 要跟踪的异常类列表<br />请注意， exceptionsToTrace不应与exceptionsToIgnore同时出现，否则exceptionsToIgnore将具有更高的优先级。 | 否   | Throwable.class |
| exceptionsToIgnore | 用于指定哪些异常被排除掉，不会计入异常统计中，也不会进入 fallback 逻辑中，而是会原样抛出。 | 否   |                 |

?> 若 blockHandler 和 fallback 都进行了配置，则被限流降级而抛出 `BlockException` 时只会进入 `blockHandler` 处理逻辑。若未配置 `blockHandler`、`fallback` 和 `defaultFallback`，则被限流降级时会将 `BlockException` **直接抛出**。

```java
@GetMapping("/annotation")
@SentinelResource(value = "annotation", blockHandler = "blockHandler", fallback = "fallbackHandle")
public String annotation(String name, Integer age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("are you a ghost?");
    }
    return "hello," + name + ". you are " + age + " years old";
}

public String blockHandler(String name, Integer age, BlockException ex) {
    System.out.println("blockHandler");
    return ex instanceof AuthorityException ? "没有权限调用" : "限流或者被降级啦！！！";
}

public String fallbackHandle(String name, Integer age, Throwable ex) {
    System.out.println("fallbackHandle");
    System.out.println(ex);
    return "出错啦：" + ex.getMessage();
}
```

http://127.0.0.1:10001/rule/annotation?name=xiaohua&age=25

然后可以在控制台配置相关规则进行测试



## 整合RestTemplate

还记的RestTemplate整合Ribbon吗，只需要在注册RestTemplate的方法上加上 `@LoadBalanced` 注解就行了

sentinel也提供了 `@SentinelRestTemplate` 注解用来整合RestTemplate

```java
@Bean
@LoadBalanced
@SentinelRestTemplate
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

如下代码：A服务有个接口中使用restTemplate调用B服务，启动后访问A服务的这个接口就可以在控制台看到簇点链路中看到微服务调用链路

```java
@GetMapping("/{id}")
public String getById(@PathVariable("id") Integer id) {
    String url = "http://" + ServiceNameConstants.CONTENT_CENTER + "/share/{id}";
    String res = restTemplate.getForObject(url, String.class, id);
    System.out.println(res);
    return res;
}
```

![image-20230223113356851](./assets/image-20230223113356851.png)

然后就可以在控制台对这个微服务调用设置相关规则

而且可以在 `@SentinelRestTemplate` 注解中指定降级和fallback处理函数

```java
@Configuration
public class SentinelConfig {


    @Bean
    @LoadBalanced
    @SentinelRestTemplate(blockHandler = "blockHandler", blockHandlerClass = SentinelConfig.class,
            fallback = "fallbackHandler", fallbackClass = SentinelConfig.class)
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }


    public static ClientHttpResponse blockHandler(HttpRequest request, byte[] body, ClientHttpRequestExecution requestExecution, BlockException exception) {
        return new SentinelClientHttpResponse(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
    }

    public static ClientHttpResponse fallbackHandler(HttpRequest request, byte[] body, ClientHttpRequestExecution requestExecution, BlockException exception) {
        return new SentinelClientHttpResponse(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
    }

    @Bean
    public RequestOriginParser originParser() {
        return request -> request.getParameter("appName");
    }
}
```



## 整合Feign

sentinel整合feign和hystrix一样很简单，只需要在配置文件中设值 `feign.sentinel.enabled` 为启用状态即可

```yaml
feign:
  sentinel:
    enabled: true
```

fallback处理，只需要写一个类去实现feign客户端接口并注册到容器中，这个和学习hystrix时的处理逻辑一样。然后在客户端注解中指定fallback类

```java
@FeignClient(value = ServiceNameConstants.CONTENT_CENTER, fallback = ShareFeignClientFallback.class)
public interface ShareFeignClient {

    @GetMapping("/share/{id}")
    ResponseEntity<String> getById(@PathVariable("id") Integer id);

    @GetMapping("/share/get_multi_params/v2")
    ResponseEntity<List<String>> query(@SpringQueryMap ShareQuery query);
}
```

```java
@Component
public class ShareFeignClientFallback implements ShareFeignClient {

    private <T> ResponseEntity<T> res(T t) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS.value()).body(t);
    }


    @Override
    public ResponseEntity<String> getById(Integer id) {
        return res("出错啦");
    }


    @Override
    public ResponseEntity<List<String>> query(ShareQuery query) {
        return res(Collections.singletonList(""));
    }
}
```

这样就拿不到具体的异常信息，我们在注解中可以换成fallbackFactory指定fallback处理工厂类

对之前的fallback类改造

```java
@NoArgsConstructor
public class ShareFeignClientFallback implements ShareFeignClient {

    private Throwable throwable = null;

    ShareFeignClientFallback(Throwable throwable) {
        this.throwable = throwable;
    }

    private <T> ResponseEntity<T> res(T t) {
        if (this.throwable instanceof DegradeException) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE.value()).body(t);
        }
        if (this.throwable instanceof BlockException) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS.value()).body(t);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).body(t);
    }

    @Override
    public ResponseEntity<String> getById(Integer id) {
        return res("出错啦");
    }

    @Override
    public ResponseEntity<List<String>> query(ShareQuery query) {
        return res(Collections.singletonList("出错啦"));
    }
}
```

工厂类要实现FallbackFactory接口，注意是 `feign.hystrix.FallbackFactory`;

```java
@Component
public class ShareFeignClientFallbackFactory implements FallbackFactory<ShareFeignClient> {

    @Override
    public ShareFeignClient create(Throwable cause) {
        return new ShareFeignClientFallback(cause);
    }
}
```

微服务正常调用

```java
@GetMapping("/{id}")
public ResponseEntity<String> getById(@PathVariable("id") Integer id) {
    ResponseEntity<String> res = shareFeignClient.getById(id);
    return res;
}
```





## 使用姿势总结

| 方式         | 使用                       | 实现方法                                       |
| ------------ | -------------------------- | ---------------------------------------------- |
| 代码方式     | API                        | try...catch...finally...                       |
| 注解方式     | @SentinelResource          | 注解属性：blockHandler/fallback                |
| RestTemplate | @SentinelRestTemplate      | 注解属性：blockHandler/fallback                |
| Feign        | feien.sentinel.enable=true | @FeignClient注解属性：fallback/fallbackFactory |



## 规则持久化

目前为止我们所有的规则配置，都是存在微服务应用内存中的。即如果微服务重启之后，这写规则就全都没了。sentinel提供了开放的接口，可以让开发者来自定义存储规则的数据源。

### 规则管理及推送

一般来说，规则的推送有下面三种模式：

| 推送模式  | 说明                                                         | 优点                         | 缺点                                                         |
| --------- | ------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------ |
| 原始模式  | API 将规则推送至客户端并直接更新到内存中，扩展写数据源 `WritableDataSource` 接口 | 简单，无任何依赖             | 不保证一致性；规则保存在内存中，重启即消失。严重不建议用于生产环境 |
| Pull 模式 | 扩展写数据源：`WritableDataSource` 接口。客户端主动向某个规则管理中心定期轮询拉取规则，这个规则中心可以是 RDBMS、文件 等 | 简单，无任何依赖；规则持久化 | 不保证一致性；实时性不保证，拉取过于频繁也可能会有性能问题。 |
| Push 模式 | 扩展读数据源 `ReadableDataSource` 接口。规则中心统一推送，客户端通过注册监听器的方式时刻监听变化，比如使用 Nacos、Zookeeper 等配置中心。这种方式有更好的实时性和一致性保证。**生产环境下一般采用 push 模式的数据源。** | 规则持久化；一致性；快速     | 引入第三方依赖                                               |

### 原始模式

默认情况下的推送规则方式是控制台通过 API 将规则推送至客户端并直接更新到内存中，如下图所示：

![Original push rules from Sentinel Dashboard](./assets/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f6c61726b2f302f323031382f706e672f34373638382f313533363636303239363237332d34663434306262612d356239652d343230352d393430322d6662363038336236363931322e706e67.png)

这种做法的好处是简单，无依赖；坏处是应用重启规则就会消失，仅用于简单测试，**不能用于生产环境**。



### 拉模式

pull 模式的数据源（如本地文件、RDBMS 等）一般是可写入的

实现拉模式的数据源最简单的方式是继承 [`AutoRefreshDataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AutoRefreshDataSource.java) 抽象类，然后实现 `readSource()` 方法，在该方法里从指定数据源读取字符串格式的配置数据。比如 [基于文件的数据源](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-dynamic-file-rule/src/main/java/com/alibaba/csp/sentinel/demo/file/rule/FileDataSourceDemo.java)。

使用时需要在客户端注册数据源：将对应的读数据源注册至对应的 RuleManager

将写数据源注册至 transport 的 `WritableDataSourceRegistry` 中

以本地文件数据源为例，首先创建一个初始化类，这个类要实现Sentinel的 `InitFunc` SPI 扩展接口：

> 参考：https://www.imooc.com/article/289402

```java
public class FileDataSourceInit implements InitFunc {

    @Override
    public void init() throws Exception {
        // 将规则文件存放到用户目录下
        String ruleDir = System.getProperty("user.home") + "/sentinel/rules";
        String flowRulePath = ruleDir + "/flow-rule.json";
        String degradeRulePath = ruleDir + "/degrade-rule.json";
        String systemRulePath = ruleDir + "/system-rule.json";
        String authorityRulePath = ruleDir + "/authority-rule.json";
        String paramFlowRulePath = ruleDir + "/param-flow-rule.json";

        this.mkdirIfNotExits(ruleDir);
        this.createFileIfNotExits(flowRulePath);
        this.createFileIfNotExits(degradeRulePath);
        this.createFileIfNotExits(systemRulePath);
        this.createFileIfNotExits(authorityRulePath);
        this.createFileIfNotExits(paramFlowRulePath);

        //====> 流控规则
        // 将可读数据源注册至FlowRuleManager
        // 这样当规则文件发生变化时，就会更新规则到内存
        ReadableDataSource<String, List<FlowRule>> flowRuleRDS = new FileRefreshableDataSource<>(
                flowRulePath, flowRuleListParser);
        FlowRuleManager.register2Property(flowRuleRDS.getProperty());

        // 将可写数据源注册至transport模块的WritableDataSourceRegistry中
        // 这样收到控制台推送的规则时，Sentinel会先更新到内存，然后将规则写入到文件中
        WritableDataSource<List<FlowRule>> flowRuleWDS = new FileWritableDataSource<>(
                flowRulePath, this::encodeJson);
        WritableDataSourceRegistry.registerFlowDataSource(flowRuleWDS);

        //====> 降级规则
        ReadableDataSource<String, List<DegradeRule>> degradeRuleRDS = new FileRefreshableDataSource<>(
                degradeRulePath, degradeRuleListParser);
        DegradeRuleManager.register2Property(degradeRuleRDS.getProperty());
        WritableDataSource<List<DegradeRule>> degradeRuleWDS = new FileWritableDataSource<>(
                degradeRulePath, this::encodeJson);
        WritableDataSourceRegistry.registerDegradeDataSource(degradeRuleWDS);

        //====> 系统规则
        ReadableDataSource<String, List<SystemRule>> systemRuleRDS = new FileRefreshableDataSource<>(
                systemRulePath, systemRuleListParser);
        SystemRuleManager.register2Property(systemRuleRDS.getProperty());
        WritableDataSource<List<SystemRule>> systemRuleWDS = new FileWritableDataSource<>(
                systemRulePath, this::encodeJson);
        WritableDataSourceRegistry.registerSystemDataSource(systemRuleWDS);

        //====> 授权规则
        ReadableDataSource<String, List<AuthorityRule>> authorityRuleRDS = new FileRefreshableDataSource<>(
                authorityRulePath, authorityRuleListParser);
        AuthorityRuleManager.register2Property(authorityRuleRDS.getProperty());
        WritableDataSource<List<AuthorityRule>> authorityRuleWDS = new FileWritableDataSource<>(
                authorityRulePath, this::encodeJson);
        WritableDataSourceRegistry.registerAuthorityDataSource(authorityRuleWDS);

        //====> 热点参数规则
        ReadableDataSource<String, List<ParamFlowRule>> paramFlowRuleRDS = new FileRefreshableDataSource<>(
                paramFlowRulePath, paramFlowRuleListParser);
        ParamFlowRuleManager.register2Property(paramFlowRuleRDS.getProperty());
        WritableDataSource<List<ParamFlowRule>> paramFlowRuleWDS = new FileWritableDataSource<>(
                paramFlowRulePath, this::encodeJson);
        ModifyParamFlowRulesCommandHandler.setWritableDataSource(paramFlowRuleWDS);
    }

    private Converter<String, List<FlowRule>> flowRuleListParser = source -> JSON.parseObject(
            source, new TypeReference<List<FlowRule>>() {
            }
    );
    private Converter<String, List<DegradeRule>> degradeRuleListParser = source -> JSON.parseObject(
            source, new TypeReference<List<DegradeRule>>() {
            }
    );
    private Converter<String, List<SystemRule>> systemRuleListParser = source -> JSON.parseObject(
            source, new TypeReference<List<SystemRule>>() {
            }
    );

    private Converter<String, List<AuthorityRule>> authorityRuleListParser = source -> JSON.parseObject(
            source, new TypeReference<List<AuthorityRule>>() {
            }
    );

    private Converter<String, List<ParamFlowRule>> paramFlowRuleListParser = source -> JSON.parseObject(
            source, new TypeReference<List<ParamFlowRule>>() {
            }
    );

    private void mkdirIfNotExits(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            file.mkdirs();
        }
    }

    private void createFileIfNotExits(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            file.createNewFile();
        }
    }

    private <T> String encodeJson(T t) {
        return JSON.toJSONString(t);
    }
}
```

然后在项目的 `resources/META-INF/services` 目录下创建名为 `com.alibaba.csp.sentinel.init.InitFunc` 的文件，内容就是这个初始化类的类名全路径

```
cn.clboy.xxx.config.FileDataSourceInit
```

优点：简单易懂，没有多余依赖（比如配置中心、缓存等）
缺点

1. 由于规则是用 FileRefreshableDataSource 定时更新的，所以规则更新会有延迟，如果定时时间过大，可能长时间延迟；如果过小，又会影响性能
2. 规则存储在本地文件，如果有一天需要迁移微服务，那么需要把规则文件一起迁移，否则规则会丢失。

### 推模式

实现推模式的数据源最简单的方式是继承 [`AbstractDataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AbstractDataSource.java) 抽象类，在其构造方法中添加监听器，并实现 `readSource()` 从指定数据源读取字符串格式的配置数据。比如 [基于 Nacos 的数据源](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-nacos/src/main/java/com/alibaba/csp/sentinel/datasource/nacos/NacosDataSource.java)。

控制台推送规则：

- 将规则推送到Nacos或其他远程配置中心
- Sentinel客户端链接Nacos，获取规则配置；并监听Nacos配置变化，如发生变化，就更新本地缓存（从而让本地缓存总是和Nacos一致）
- 控制台监听Nacos配置变化，如发生变化就更新本地缓存（从而让控制台本地缓存总是和Nacos一致）

![Remote push rules to config center](./assets/53381986-a0b73f00-39ad-11e9-90cf-b49158ae4b6f.png)



#### 服务配置

首先要添加如下依赖

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

然后在springboot项目中只要在配置文件中按照如下配置就会自动帮创建并注册只读数据源 `NacosDataSource`

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: 127.0.0.1:8080
      datasource:
        # 名称随意
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
        system:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-system-rules
            groupId: SENTINEL_GROUP
            rule-type: system
        authority:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-authority-rules
            groupId: SENTINEL_GROUP
            rule-type: authority
        param-flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-param-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: param-flow
```

然后把刚才拉文件的模式关闭，然后在nacos配置管理里面添加对应上面这些的配置，再把刚才文件中生成的json复制进去，最后重启服务就可以看到效果

但是这是只读配置，也就是在控制台中添加修改规则不会同步到nacos中，只能在nacos修改配置然后同步到服务中

看上面的推送流程图，在控制台改动规则后应该由控制台直接推送到nacos中，然后再由nacos通知服务



#### 控制台改造

要想控制台能够推送到nacos需要修改控制台的源码，可以参考下面的两个地址：

https://github.com/alibaba/Sentinel/wiki/Sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0%EF%BC%88%E9%9B%86%E7%BE%A4%E6%B5%81%E6%8E%A7%E7%AE%A1%E7%90%86%EF%BC%89#%E8%A7%84%E5%88%99%E9%85%8D%E7%BD%AE

https://www.imooc.com/article/289464



## 生产环境使用

​                                                                  

- 要持久化规则，推荐使用推模式
- 使用阿里云提供的AHAS产品：https://help.aliyun.com/product/87450.html



## 集群流控

https://github.com/alibaba/Sentinel/wiki/%E9%9B%86%E7%BE%A4%E6%B5%81%E6%8E%A7



## 异常处理

```java
@RestController
@AllArgsConstructor
@RequestMapping("/user")
public class UserController {

    @GetMapping("/exception")
    public String exception() {
        return "hello";
    }
}
```

我们创建这一个端点，然后在控制台中对其添加规则，然后再访问这个端点让其规则触发，你会发现不管触发了什么规则，sentinel返回的响应体都是 *Blocked by Sentinel (flow limiting)* 且状态码都为429

如果想要针对流程、降级、授权等不同异常返回不同的状态码和响应体我们可以向容器中注册 `BlockExceptionHandler` 类型的实例来处理这些异常，sentinel是用的spring mvc拦截器作请求拦截处理的，具体逻辑可以看 `SentinelWebInterceptor` 源码（之前的版本是用过滤器实现的），默认使用的是DefaultBlockExceptionHandler

```java
public class DefaultBlockExceptionHandler implements BlockExceptionHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception {
        // Return 429 (Too Many Requests) by default.
        response.setStatus(429);

        PrintWriter out = response.getWriter();
        out.print("Blocked by Sentinel (flow limiting)");
        out.flush();
        out.close();
    }
}
```

自定义处理，返回json格式数据

```java
@Bean
public BlockExceptionHandler blockExceptionHandler(ObjectMapper objectMapper) {
    return (req, res, ex) -> {
        Map<String, Object> data = new HashMap<>();
        if (ex instanceof FlowException) {
            res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            data.put("code", HttpStatus.TOO_MANY_REQUESTS.value());
            data.put("msg", "被限流了");
        } else if (ex instanceof AuthorityException) {
            res.setStatus(HttpStatus.UNAUTHORIZED.value());
            data.put("code", HttpStatus.UNAUTHORIZED.value());
            data.put("msg", "不允许访问");
        } else {
            res.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
            data.put("code", HttpStatus.SERVICE_UNAVAILABLE.value());
            data.put("msg", "服务当前不可用");
        }
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(res.getWriter(), data);
    };
}
```



## 资源定义注意点



!> 另外值得注意的是不要在方法上用了 `@SentinelResource` 之后在url和注解指定的资源上都配置了相同规则，造成规则重复

```java
@GetMapping("/exception")
@SentinelResource("exception")
public String exception() {
    return "exception";
}
```

![image-20230224092151835](./assets/image-20230224092151835.png)

!> 更不要将注解指定的资源名和url一样

```java
@GetMapping("/exception")
@SentinelResource("/user/exception")
public String exception() {
    return "exception";
}
```

sentinel会将每个url视为资源，对于url的处理是在拦截器中处理的

`@SentinelResource` 注解指定的资源是在切面类 `SentinelResourceAspect` 中处理的

这样就会造成一次请求被处理两次，从而统计错误。你在控制台里也可以看到请求一次被算作了两次qps



## 客户端配置项

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: 127.0.0.1:8080 # 控制台地址
        port: 8719 # 与控制台交互的端口
        client-ip: # 注册到控制台的ip
        heartbeat-interval-ms: 5000 #与控制台的心跳间隔时间，毫秒
      datasource: # 读取规则的数据源
        flow: # 名称随意
          nacos: # 数据源类型及其相关配置
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
      filter:
        enabled: true # 开启SentinelWebInterceptor
        order: 9999999 # 拦截器的顺序
        url-patterns: # 拦截器对url的匹配规则
      block-page: # 自定义的跳转URL，当请求被限流时会自动跳转至该URL
      eager: true # 取消控制台懒加载
      enabled: true # Sentinel自动化配置是否生效
      flow:
        cold-factor: 3 # 流控效果中预热模式的冷加载因子
      http-method-specify: false # 是否为url创建的资源名添加请求方式前缀，例如：GET:/user/exception
      log:
        dir: /xxx/xxx # 日志文件目录 
        switch-pid: true # 日志文件名是否要带上pid
      metric:
        charset: UTF-8 # metric文件字符集
        file-single-size: 10485760 # metric单个文件大小
        file-total-count: 50 # metric总文件数量
```