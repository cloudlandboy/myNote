# 整合负载均衡



## Spring Cloud LoadBalancer



### 依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```





## Ribbon

spring cloud 2020及之后的版本已经剔除了Ribbon的依赖管理，改为LoadBalancer

官方文档：https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#spring-cloud-loadbalancer

同样对应spring cloud 2020之后版本的spring cloud alibaba在 `spring-cloud-starter-alibaba-nacos-discovery` 模块中也剔除了 Ribbon的依赖

要想使用Ribbon需要使用alibaba `2.2.x` 及之前的版本

修改SpringBoot的版本为 `2.2.13.RELEASE`

修改Spring Cloud的版本为 `Hoxton.SR12`

修改Spring Cloud Alibaba的版本为 `2.2.9.RELEASE`



### 依赖

`spring-cloud-starter-alibaba-nacos-discovery` 已经依赖了 `spring-cloud-starter-netflix-ribbon`

所以不需要再单独引入



### 根据权重随机

nacos支持给服务实例设置权重，可以在配置文件中设置，也可以在控制台设置

```
spring:
  application:
    name: @project.artifactId@
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        metadata:
          author: clboy
          email: syl@clboy.cn
          version: v1
        # 设置权重
        weight: 10
```

![image-20230217091615141](https://cdn.tencentfs.clboy.cn/images/2023/20230217093744290.png)

然后在nacos-discovery中也提供了根据权重随机选择服务实例的算法

`com.alibaba.nacos.client.naming.core.Balancer.getHostByRandomWeight(List<Instance> hosts)`

但是这个方法是 `protected` ，我们要想使用可以创建一个类去继承Balancer

```java
public class ExtendBalancer extends Balancer {

   public static Instance getHostByRandomWeight2(List<Instance> instances) {
      return getHostByRandomWeight(instances);
   }

}
```

然后开发者就可以实现 `Irule` 接口来提供这样一个根据权重随机的负载均衡算法

```java
public class RandomWeightRule extends AbstractLoadBalancerRule {
    private static final Logger LOGGER = LoggerFactory.getLogger(NacosRule.class);

    /**
     * 注入nacos配置类
     */
    @Autowired
    private NacosDiscoveryProperties nacosDiscoveryProperties;

    @Autowired
    private NacosServiceManager nacosServiceManager;

    @Override
    public Server choose(Object key) {
        try {
            // 从配置中获取分组名
            String group = this.nacosDiscoveryProperties.getGroup();
            // 获取服务名称
            DynamicServerListLoadBalancer loadBalancer = (DynamicServerListLoadBalancer) getLoadBalancer();
            String name = loadBalancer.getName();
            // 获取服务列表
            NamingService namingService = nacosServiceManager.getNamingService();
            List<Instance> instances = namingService.selectInstances(name, group, true);
            // 根据权重随机选择一个服务
            Instance instance = ExtendBalancer.getHostByRandomWeight2(instances);
            return new NacosServer(instance);
        } catch (Exception e) {
            LOGGER.warn("NacosRule error", e);
            return null;
        }
    }

    @Override
    public void initWithNiwsConfig(IClientConfig iClientConfig) {
    }
}
```







### 同一集群优先调用



1. 用nacos配置中获取集群名称

   ```java
   String clusterName = this.nacosDiscoveryProperties.getClusterName();
   ```

   

2. 从服务列表中过滤出同一集群的，未匹配到还是使用原来的

   ```java
   List<Instance> instancesToChoose = instances;
   if (StringUtils.isNotBlank(clusterName)) {
      List<Instance> sameClusterInstances = instances.stream()
            .filter(instance -> Objects.equals(clusterName,instance.getClusterName()))
            .collect(Collectors.toList());
      if (!CollectionUtils.isEmpty(sameClusterInstances)) {
         instancesToChoose = sameClusterInstances;
      }
   }
   ```

3. 再根据权重随机在过滤后的的服务列表中取一个实例

   ```java
   Instance instance = ExtendBalancer.getHostByRandomWeight2(instancesToChoose);
   ```



### NacosRule

nacos-discovery中已经集成了这样一个负载均衡算法：`com.alibaba.cloud.nacos.ribbon.NacosRule`

开发者直接拿来使用就行了



## 基于元数据进行版本控制

```java
public class VersionClusterRandomWeightRule extends AbstractLoadBalancerRule {
    private static final Logger LOGGER = LoggerFactory.getLogger(NacosRule.class);

    @Autowired
    private NacosDiscoveryProperties nacosDiscoveryProperties;

    @Autowired
    private NacosServiceManager nacosServiceManager;

    public static final String METADATA_VERSION = "version";

    @Override
    public Server choose(Object key) {
        try {
            String clusterName = this.nacosDiscoveryProperties.getClusterName();
            String group = this.nacosDiscoveryProperties.getGroup();
            Map<String, String> metadata = nacosDiscoveryProperties.getMetadata();
            // 获取版本号
            String version = metadata.get(METADATA_VERSION);

            DynamicServerListLoadBalancer loadBalancer = (DynamicServerListLoadBalancer) getLoadBalancer();
            String name = loadBalancer.getName();

            NamingService namingService = nacosServiceManager.getNamingService();
            List<Instance> instances = namingService.selectInstances(name, group, true);
            if (CollectionUtils.isEmpty(instances)) {
                LOGGER.warn("no instance in service {}", name);
                return null;
            }

            // 过滤出相同版本实例
            List<Instance> sameVersionInstances = instances.stream()
                    .filter(instance -> Objects.equals(version, instance.getMetadata().get(METADATA_VERSION)))
                    .collect(Collectors.toList());

            if (CollectionUtils.isEmpty(sameVersionInstances)) {
                LOGGER.error("no service instances that match to the same version，" +
                        "name = {}, instance = {}", name, instances);
                return null;
            }

            List<Instance> instancesToChoose = sameVersionInstances;
            if (StringUtils.isNotBlank(clusterName)) {
                List<Instance> sameClusterInstances = instances.stream()
                        .filter(instance -> Objects.equals(clusterName,instance.getClusterName()))
                        .collect(Collectors.toList());
                if (!CollectionUtils.isEmpty(sameClusterInstances)) {
                    instancesToChoose = sameClusterInstances;
                } else {
                    LOGGER.warn(
                            "A cross-cluster call occurs，name = {}, clusterName = {}, instance = {}",
                            name, clusterName, instances);
                }
            }

            Instance instance = ExtendBalancer.getHostByRandomWeight2(instancesToChoose);

            return new NacosServer(instance);
        } catch (Exception e) {
            LOGGER.warn("NacosRule error", e);
            return null;
        }
    }

    @Override
    public void initWithNiwsConfig(IClientConfig iClientConfig) {
    }
}
```

