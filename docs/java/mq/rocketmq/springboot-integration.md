# Springboot集成RocketMQ



## 依赖

版本选择：看其传递依赖中的 `rocketmq-client` 版本与你安装的RocketMQ版本是否匹配

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>${rocketmq.version}</version>
</dependency>
```

## 配置

配置了NameServer的地址以及生产者分组名称，这两个配置项是必须的，否则RocketMQ的自动配置不会生效

```yaml
rocketmq:
  name-server: 127.0.0.1:9876
  producer:
    group: test-producer-group
```

## 生产者发送消息

发送消息只需要注入RocketMQTemplate，调用其提供的api即可

```java
private final RocketMQTemplate rocketMQTemplate;

public void testSendRocketMqMessage(){
    rocketMQTemplate.convertAndSend("test-topic","hello world");
}
```

该方法运行后查看RocketMQ控制台，在主题中就自动生成了 `test-topic`，在消息中查找test-topic类型的消息也可以查询到

## 消费者消费消息

首先，我们要创建一个类去实现 `RocketMQListener` 接口，接口泛型为接收的消息类型，然后在类上标注 `@RocketMQMessageListener` 注解

在注解中指定消息的Topic和消费者所属分组名称这两个必填属性，最后将该类型注册到Spring容器中

```java
@Component
@RocketMQMessageListener(topic = "test-topic", consumerGroup = "test-consumer-group")
public class TestTopicListener implements RocketMQListener<String> {

    @Override
    public void onMessage(String message) {
        System.out.println("========> 收到消息：" + message);
    }
}
```

## 事务消息



### 发送流程



假如有下面这样一个流程

```java
@Transactional(rollbackFor = Exception.class)
public User updateUser(UserDTO dto) {
    User user = getById(dto.getUerId());
    user.setName(dto.getName());
    //1.更新数据库
    userService.updateById(user);
    //2.发送消息
    rocketMQTemplate.convertAndSend("user-info-update-topic", user);
    //3.清理缓存
    cacheManager.clearUserCahce(user.getUserId());
    return user;
}
```

如果在步骤3出错了，由于方法上开启了事务，1会回滚，但是2的消息已经发送出去了，该怎么办呢？

RocketMQ中提供了事务消息，可以保证只有在本地事务确保完成提交之后才将消息投递给消费者，如果本地事务失败，那么已经发送到Broker的消息就会被删掉

发送事务消息的整个流程如下图所示：

![mpv-shot0010](https://cdn.tencentfs.clboy.cn/images/2023/20230405234106392.jpg)

1. 发送消息，消息生产者会发送一个半消息到MQ服务端，服务端收到这类消息会标记为不能投递的状态，消费者就不会收到这类消息
2. 半消息发送成功
3. 生产者接着执行本地事务
4. 生产者本地事务执行完成之后，将本地事务执行结果告诉MQ服务端，服务端收到本地事务执行结果，如果本地事务已提交，则刚才的半消息就会变成可投递状态，之后就如正常消息一样被消费者消费，如果本地事务已回滚，则服务端就会删除半消息
5. 如果服务端迟迟未收到生产者的本地事务执行结果，则会主动向生产者询问
6. 生产者收到服务端的询问后检查本地事务状态并返回给服务端



事务消息的三种状态：

- `COMMIT` ：提交事务，允许消费者消费该消息
- `ROLLBACK` ：回滚事务，消息将被丢弃不允许消费
- `UNKNOW` ：未知状态，等待固定时间以后Broker端根据回查规则向生产者进行消息回查



### 代码演示

发送事务消息需要使用RocketMQTemplate中的 `sendMessageInTransaction` 方法

```java
/**
 * 发送事务消息
 *
 * @param destination 消息的topic
 * @param message 消息 {@link org.springframework.messaging.Message}
 * @param arg 自定义参数
 * @return TransactionSendResult
 * @throws MessagingException
 */
public TransactionSendResult sendMessageInTransaction(final String destination,
    final Message<?> message, final Object arg) throws MessagingException
```



下面 `public User updateUser(Integer id, UserDTO dto)` 方法是更新用户时发送事务消息的示例

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final RocketMQTemplate rocketMQTemplate;


    @Override
    public User updateUser(Integer id, UserDTO dto) {
        User user = getById(id);
        Assert.notNull(user, "用户不存在或已被删除");

        //构建消息，生成一个唯一的事务id
        Message<Integer> message = MessageBuilder.withPayload(id)
                .setHeader(RocketMQHeaders.TRANSACTION_ID, UUID.randomUUID().toString().replace("-", ""))
                .build();
        
        //自定义参数
        Pair<User, UserDTO> pair = new Pair<>(user, dto);
        
        // 发送消息
        rocketMQTemplate.sendMessageInTransaction("update_user_topic", message, pair);
        
        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user, UserDTO dto) {
        Assert.hasText(dto.getNickname(), "昵称不能为空");
        user.setNickname(dto.getNickname());
        this.updateById(user);
        
      	// ... do something
       
    }


}
```



根据发送事务消息的流程，在发送消息之后需要执行本地事务，如何执行本地事务呢？

在springboot中需要创建一个类去实现 `RocketMQLocalTransactionListener` 接口，然后注册到容器中

```java
public interface RocketMQLocalTransactionListener {
    
    /**
     * 执行本地事务，返回事务执行结果
     */
    RocketMQLocalTransactionState executeLocalTransaction(final Message msg, final Object arg);

    /**
     * 检查本地事务的执行结果
     */
    RocketMQLocalTransactionState checkLocalTransaction(final Message msg);
}
```

还有个条件是需要标注 `@RocketMQTransactionListener` 注解

```java
public @interface RocketMQTransactionListener {

    // ... 省略其他属性
    
    /**
     * 设置 rocketMQTemplate bean 名称，默认为 rocketMQTemplate
     */
    String rocketMQTemplateBeanName() default "rocketMQTemplate";

}
```

项目启动时会获取容器中所有标注了该注解的bean(必须为RocketMQLocalTransactionListener类型)

稍后会根据注解中 `rocketMQTemplateBeanName`  将其与容器中匹配bean名称的 `RocketMQTemplate` 进行绑定



更新用户时本地事务的执行逻辑

```java
@Component
@RequiredArgsConstructor
@RocketMQTransactionListener
class UpdateUserLocalTransaction implements RocketMQLocalTransactionListener {

    private final IUserService userService;
    
    /**
     * 用户保存事务id对应的事务状态，实际应该保存到数据库，这里只是演示
     */
    private final Map<String, RocketMQLocalTransactionState> txVirtualDb = new ConcurrentHashMap<>();

    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        String transactionId = (String) msg.getHeaders().get(RocketMQHeaders.TRANSACTION_ID);
        Pair<User, UserDTO> pair = (Pair<User, UserDTO>) arg;
        try {
            userService.updateUser(pair.getObject1(), pair.getObject2());
            txVirtualDb.put(transactionId, RocketMQLocalTransactionState.COMMIT);
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            txVirtualDb.put(transactionId, RocketMQLocalTransactionState.ROLLBACK);
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        String transactionId = (String) msg.getHeaders().get(RocketMQHeaders.TRANSACTION_ID);
        return txVirtualDb.getOrDefault(transactionId, RocketMQLocalTransactionState.UNKNOWN);
    }
}
```



### 疑问

通过上面的代码想必你会有这样一个疑问：

假如有多个地方都要发送事务消息，执行本地事务的逻辑又不一样， `RocketMQLocalTransactionListener` 的实现类该如何写，发送事务消息是也没办法指定用哪个实现类，况且一个 RocketMQTemplate 也只能设置一个 RocketMQLocalTransactionListener

我总不能在实现类中写一堆if判断吧！！！

目前我能想到的解决方法就是以下三种：

1. 使用不同的 `RocketMQTemplate` ，`@RocketMQTransactionListener` 注解中可以指定与其绑定的容器中 RocketMQTemplate 的bean名称，这样就可以为每个事务消息注册一个RocketMQTemplate

2. 利用自定义参数或消息头，我们不妨将 `RocketMQLocalTransactionListener` 实现注册到容器中，然后在消息头中指定实现类注册到容器的Bean名称

   ```java
   @Component
   @RequiredArgsConstructor
   @RocketMQTransactionListener
   class BeanNameLocalTransactionListener implements RocketMQLocalTransactionListener, ApplicationContextAware {
   
       private ApplicationContext applicationContext;
   
       public static String LOCAL_TRANSACTION_LISTENER_BEAN_NAME = "LOCAL_TRANSACTION_LISTENER_BEAN_NAME";
   
       @Override
   
       public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
           String beanName = (String) msg.getHeaders().get(LOCAL_TRANSACTION_LISTENER_BEAN_NAME);
           RocketMQLocalTransactionListener listener = (RocketMQLocalTransactionListener) applicationContext.getBean(beanName);
           return listener.executeLocalTransaction(msg, arg);
       }
   
       @Override
       public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
           String beanName = (String) msg.getHeaders().get(LOCAL_TRANSACTION_LISTENER_BEAN_NAME);
           RocketMQLocalTransactionListener listener = (RocketMQLocalTransactionListener) applicationContext.getBean(beanName);
           return listener.checkLocalTransaction(msg);
       }
   
       @Override
       public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
           this.applicationContext = applicationContext;
       }
   }
   ```

   然后其他的实现只需要注册到容器，不需要添加 `@RocketMQTransactionListener` 注解

   ```java
   @RequiredArgsConstructor
   @Component("updateUserLocalTransaction")
   class UpdateUserLocalTransaction implements RocketMQLocalTransactionListener
   ```

   发送消息时添加消息头

   ```java
   @Override
   public User updateUser(Integer id, UserDTO dto) {
       User user = getById(id);
       Assert.notNull(user, "用户不存在或已被删除");
   
       //构建消息
       Message<Integer> message = MessageBuilder.withPayload(id)
               .setHeader(RocketMQHeaders.TRANSACTION_ID, UUID.randomUUID().toString().replace("-", ""))
               .setHeader(BeanNameLocalTransactionListener.LOCAL_TRANSACTION_LISTENER_BEAN_NAME, "updateUserLocalTransaction")
               .build();
       //自定义参数
       Pair<User, UserDTO> pair = new Pair<>(user, dto);
       rocketMQTemplate.sendMessageInTransaction("update_user_topic", message, pair);
       return user;
   }
   ```

3. 第三种方法是使用 `TransactionTemplate` 来控制本地事务，并且利用发送消息时的自定义参数，参数为Runnable类型

   ```java
   @Component
   @RequiredArgsConstructor
   @RocketMQTransactionListener
   class TransactionTemplateRunnableLocalTransaction implements RocketMQLocalTransactionListener {
   
       private final TransactionTemplate transactionTemplate;
   
       private final Map<String, RocketMQLocalTransactionState> txVirtualDb = new ConcurrentHashMap<>();
   
       @Override
       public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
           Runnable runnable = (Runnable) arg;
           String transactionId = (String) msg.getHeaders().get(RocketMQHeaders.TRANSACTION_ID);
   
           try {
               transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                   @Override
                   protected void doInTransactionWithoutResult(TransactionStatus status) {
                       runnable.run();
                   }
               });
               txVirtualDb.put(transactionId, RocketMQLocalTransactionState.COMMIT);
               return RocketMQLocalTransactionState.COMMIT;
           } catch (Exception ex) {
               txVirtualDb.put(transactionId, RocketMQLocalTransactionState.ROLLBACK);
               return RocketMQLocalTransactionState.ROLLBACK;
           }
   
       }
   
       @Override
       public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
           String transactionId = (String) msg.getHeaders().get(RocketMQHeaders.TRANSACTION_ID);
           return txVirtualDb.getOrDefault(transactionId, RocketMQLocalTransactionState.UNKNOWN);
       }
   }
   ```

   发送消息

   ```java
   @Service
   @RequiredArgsConstructor
   public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {
   
       private final RocketMQTemplate rocketMQTemplate;
   
       @Override
       public User updateUser(Integer id, UserDTO dto) {
           User user = getById(id);
           Assert.notNull(user, "用户不存在或已被删除");
           Assert.hasText(dto.getNickname(), "昵称不能为空");
           user.setNickname(dto.getNickname());
           //构建消息
           Message<Integer> message = MessageBuilder.withPayload(id)
                   .setHeader(RocketMQHeaders.TRANSACTION_ID, UUID.randomUUID().toString().replace("-", ""))
                   .build();
   
           //自定义参数
           rocketMQTemplate.sendMessageInTransaction("update_user_topic", message, (Runnable) () -> {
               this.updateById(user);
               //测试回滚
               if ("error".equals(dto.getNickname())) {
                   throw new RuntimeException();
               }
           });
           return user;
       }
   
   }
   ```

   这种方式好处是代码量更少，缺点是事务状态记录需要统一
