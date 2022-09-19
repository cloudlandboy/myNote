# 用户注册



## 创建用户中心

用户搜索到自己心仪的商品，接下来就要去购买，但是购买必须先登录。所以接下来我们编写用户中心，实现用户的登录和注册功能。

用户中心的提供的服务：

- 用户的注册
- 用户登录
- 用户个人信息管理
- 用户地址管理
- 用户收藏管理
- 我的订单
- 优惠券管理

这里我们暂时先实现基本的：`注册和登录`功能

因为用户中心的服务其它微服务也会调用，因此这里我们做聚合。

leyou-user：父工程，包含2个子工程：
- leyou-user-interface：实体及接口
- leyou-user-service：业务和服务



## 创建父module

打包方式为`pom`

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-parent</artifactId>
        <groupId>com.leyou</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.leyou.user</groupId>
    <artifactId>leyou-user</artifactId>
    <packaging>pom</packaging>
    <modules>
        <module>leyou-user-interface</module>
        <module>leyou-user-service</module>
    </modules>
</project>
```

</details>

## 创建leyou-user-interface

在leyou-user下，创建module：

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-user</artifactId>
        <groupId>com.leyou.user</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.leyou.user</groupId>
    <artifactId>leyou-user-interface</artifactId>


</project>
```

</details>

## 创建leyou-user-service

<details>
    <summary>pom.xml</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-user</artifactId>
        <groupId>com.leyou.user</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <artifactId>leyou-user-service</artifactId>
    <groupId>com.leyou.user</groupId>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <!-- mybatis启动器 -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
        </dependency>
        <!-- 通用Mapper启动器 -->
        <dependency>
            <groupId>tk.mybatis</groupId>
            <artifactId>mapper-spring-boot-starter</artifactId>
        </dependency>
        <!-- mysql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>com.leyou.user</groupId>
            <artifactId>leyou-user-interface</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
    </dependencies>
</project>
```

</details>



启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
@MapperScan("com.leyou.user.mapper")
public class LeyouUserApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeyouUserApplication.class, args);
    }
}
```



父工程leyou-user的pom：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou</artifactId>
        <groupId>com.leyou.parent</groupId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.leyou.user</groupId>
    <artifactId>leyou-user</artifactId>
    <packaging>pom</packaging>
    <version>1.0.0-SNAPSHOT</version>
    <modules>
        <module>leyou-user-interface</module>
        <module>leyou-user-service</module>
    </modules>

</project>
```



## 添加网关路由

我们修改`leyou-gateway`，添加路由规则，对`leyou-user-service`进行路由:

![1532779772325](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307555.png)



## 后台功能准备

## 接口文档

整个用户中心的开发，我们将模拟公司内面向接口的开发。

现在假设项目经理已经设计好了接口文档，详见：[用户接口说明](project/leyoumall/Introduction/user-interface.md ':target=_blank')

![1527174356711](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247060.png)

我们将根据文档直接编写后台功能，不关心页面实现。



## 数据结构

```mysql
CREATE TABLE `tb_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(32) NOT NULL COMMENT '密码，加密存储',
  `phone` varchar(20) DEFAULT NULL COMMENT '注册手机号',
  `created` datetime NOT NULL COMMENT '创建时间',
  `salt` varchar(32) NOT NULL COMMENT '密码加密的salt值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COMMENT='用户表';
```

数据结构比较简单，因为根据用户名查询的频率较高，所以我们给用户名创建了索引



## 基本代码

 ![1532781014342](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307606.png)

### 实体类

放在`user-interface`中

```java
@Table(name = "tb_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;// 用户名

    @JsonIgnore
    private String password;// 密码

    private String phone;// 电话

    private Date created;// 创建时间

    @JsonIgnore
    private String salt;// 密码的盐值
}
```

注意：为了安全考虑。这里对password和salt添加了注解@JsonIgnore，这样在json序列化时，就不会把password和salt返回。

!> 需要添加jpa和jackson的依赖

```xml
<dependency>
    <groupId>javax.persistence</groupId>
    <artifactId>persistence-api</artifactId>
    <version>1.0</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```



### mapper

```java
public interface UserMapper extends Mapper<User> {
}
```



### Service

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;
}
```



### controller

```java
@Controller
public class UserController {

    @Autowired
    private UserService userService;
    
}
```



## 数据验证功能

### 接口说明

实现用户数据的校验，主要包括对：手机号、用户名的唯一性校验。

**接口路径：**

```
GET /check/{data}/{type}
```

**参数说明：**

| 参数 | 说明                                   | 是否必须 | 数据类型 | 默认值 |
| ---- | -------------------------------------- | -------- | -------- | ------ |
| data | 要校验的数据                           | 是       | String   | 无     |
| type | 要校验的数据类型：1，用户名；2，手机； | 否       | Integer  | 1      |

**返回结果：**

返回布尔类型结果：

- true：可用
- false：不可用

状态码：

- 200：校验成功
- 400：参数有误
- 500：服务器内部异常



### controller

因为有了接口，我们可以不关心页面，所有需要的东西都一清二楚：

- 请求方式：GET
- 请求路径：/check/{param}/{type}
- 请求参数：param,type
- 返回结果：true或false

```java
@GetMapping("/check/{data}/{type}")
public ResponseEntity<Boolean> checkUserData(@PathVariable("data") String data, @PathVariable(value = "type") Integer type) {
    Boolean boo = this.userService.checkData(data, type);
    if (boo == null) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(boo);
}
```

### Service

```java
@Override
public Boolean checkData(String data, Integer type) {
    User user = new User();
    if (type == 1) {
        //校验用户名
        user.setUsername(data);
    } else if (type == 2) {
        //校验手机
        user.setPhone(data);
    }
    //查询
    int count = this.userMapper.selectCount(user);
    return count == 0;
}
```



### 测试

> 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
@MapperScan(basePackages = "com.leyou.user.mapper")
public class LeyouUserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeyouUserServiceApplication.class, args);
    }
}
```

> 配置文件

```
server:
  port: 7005
spring:
  application:
    name: user-service
  datasource:
    url: jdbc:mysql:///leyoumall
    username: root
    password: root
    driver-class-name: com.mysql.jdbc.Driver
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10001/eureka
  instance:
    lease-renewal-interval-in-seconds: 5 # 5秒钟发送一次心跳
    lease-expiration-duration-in-seconds: 10 # 10秒不发送就过期
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

我们在数据库有两条假数据：

![1532781696303](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320872.png)

然后在浏览器调用接口，测试：

<http://api.leyou.com/api/user/check/zhangsan/1>

![1532781679924](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307659.png)

<http://api.leyou.com/api/user/check/lsi/1>

![1532781726835](https://cdn.tencentfs.clboy.cn/images/2021/20210911203307761.png)



## 阿里云短信服务

注册页面上有短信发送的按钮，当用户点击发送短信，我们需要生成验证码，发送给用户。我们将使用阿里提供的阿里大于来实现短信发送。

> 开通短信服务

![1576407943002](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320923.png)

> 快速学习，点击马上添加签名

![1576408021201](https://cdn.tencentfs.clboy.cn/images/2021/20210911203320974.png)





![1576408090801](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321030.png)



> 添加短信模板

!> 注意验证码模版只支持一个变量

![1576409455295](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321187.png)

```
欢迎您注册乐优商城，验证码为：${code}，该验证码5分钟内有效，请妥善保管！
```

稍等片刻即可审核通过

然后就可以查看开发文档了

发送短信验证码文档：<https://help.aliyun.com/document_detail/141484.html>



### 测试

!> 需要先充值再测试

1. 创建maven项目，引入依赖

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
   
       <groupId>org.example</groupId>
       <artifactId>demo-aliyunSms</artifactId>
       <version>1.0-SNAPSHOT</version>
       <dependencies>
           <!-- https://mvnrepository.com/artifact/com.aliyun/aliyun-java-sdk-core -->
           <dependency>
               <groupId>com.aliyun</groupId>
               <artifactId>aliyun-java-sdk-core</artifactId>
               <version>4.4.3</version>
           </dependency>
       </dependencies>
   
   </project>
   ```

2. 测试类

   ```java
   package com.demo.sms;
   
   import com.aliyuncs.CommonRequest;
   import com.aliyuncs.CommonResponse;
   import com.aliyuncs.DefaultAcsClient;
   import com.aliyuncs.IAcsClient;
   import com.aliyuncs.exceptions.ClientException;
   import com.aliyuncs.profile.DefaultProfile;
   import com.google.gson.Gson;
   
   import java.time.LocalDate;
   import java.time.format.DateTimeFormatter;
   import java.util.HashMap;
   import java.util.Map;
   
   /**
    * 发送短信
    */
   public class SendSmsDemo {
   
       /**
        * 设置鉴权参数，初始化客户端
        * （地域ID，您的AccessKey ID，您的AccessKey Secret）
        */
       private DefaultProfile profile = DefaultProfile.getProfile(
               "cn-hangzhou",
               "修改为您的AccessKey",
               "修改为您的AccessKey Secret");
       private IAcsClient client = new DefaultAcsClient(profile);
   
       private static void log_print(String functionName, Object result) {
           Gson gson = new Gson();
           System.out.println("-------------------------------" + functionName + "-------------------------------");
           System.out.println(gson.toJson(result));
       }
   
       /**
        * 添加短信模板（不用看这里，已经在控制台创建好了）
        */
       private String addSmsTemplate() throws ClientException {
           CommonRequest addSmsTemplateRequest = new CommonRequest();
           addSmsTemplateRequest.setSysDomain("dysmsapi.aliyuncs.com");
           addSmsTemplateRequest.setSysAction("AddSmsTemplate");
           addSmsTemplateRequest.setSysVersion("2017-05-25");
           // 短信类型。0：验证码；1：短信通知；2：推广短信；3：国际/港澳台消息
           addSmsTemplateRequest.putQueryParameter("TemplateType", "0");
           // 模板名称，长度为1~30个字符
           addSmsTemplateRequest.putQueryParameter("TemplateName", "测试短信模板");
           // 模板内容，长度为1~500个字符
           addSmsTemplateRequest.putQueryParameter("TemplateContent", "您正在申请手机注册，验证码为：${code}，5分钟内有效！");
           // 短信模板申请说明
           addSmsTemplateRequest.putQueryParameter("Remark", "测试");
           CommonResponse addSmsTemplateResponse = client.getCommonResponse(addSmsTemplateRequest);
           String data = addSmsTemplateResponse.getData();
           // 消除返回文本中的反转义字符
           String sData = data.replaceAll("'\'", "");
           log_print("addSmsTemplate", sData);
           Gson gson = new Gson();
           // 将字符串转换为Map类型，取TemplateCode字段值
           Map map = gson.fromJson(sData, Map.class);
           Object templateCode = map.get("TemplateCode");
           return templateCode.toString();
       }
   
       /**
        * 发送短信
        */
       private String sendSms(String telephone, String param) throws ClientException {
           CommonRequest request = new CommonRequest();
           request.setSysDomain("dysmsapi.aliyuncs.com");
           request.setSysVersion("2017-05-25");
           request.setSysAction("SendSms");
           // 接收短信的手机号码
           request.putQueryParameter("PhoneNumbers", telephone);
           // 短信签名名称。请在控制台签名管理页面签名名称一列查看（必须是已添加、并通过审核的短信签名）。
           request.putQueryParameter("SignName", "换成您的短信签名");
           // 短信模板ID
           request.putQueryParameter("TemplateCode", "换成您的短信模板ID");
           // 短信模板变量对应的实际值，JSON格式。
           request.putQueryParameter("TemplateParam", param);
           CommonResponse commonResponse = client.getCommonResponse(request);
           String data = commonResponse.getData();
           String sData = data.replaceAll("'\'", "");
           log_print("sendSms", sData);
           Gson gson = new Gson();
           Map map = gson.fromJson(sData, Map.class);
           Object bizId = map.get("BizId");
           return bizId.toString();
       }
   
       /**
        * 查询发送详情
        */
       private void querySendDetails(String bizId, String telephone) throws ClientException {
           CommonRequest request = new CommonRequest();
           request.setSysDomain("dysmsapi.aliyuncs.com");
           request.setSysVersion("2017-05-25");
           request.setSysAction("QuerySendDetails");
           // 接收短信的手机号码
           request.putQueryParameter("PhoneNumber", telephone);
           // 短信发送日期，支持查询最近30天的记录。格式为yyyyMMdd，例如20191010。
           String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
           request.putQueryParameter("SendDate", today);
           // 分页记录数量
           request.putQueryParameter("PageSize", "10");
           // 分页当前页码
           request.putQueryParameter("CurrentPage", "1");
           // 发送回执ID，即发送流水号。
           request.putQueryParameter("BizId", bizId);
           CommonResponse response = client.getCommonResponse(request);
           log_print("querySendDetails", response.getData());
       }
   
       public static void main(String[] args) {
           SendSmsDemo sendSmsDemo = new SendSmsDemo();
           try {
   
               Map<String, String> map = new HashMap(1);
               //验证码信息
               map.put("code", "123456");
               Gson gson = new Gson();
               // 发送短信
               String bizId = sendSmsDemo.sendSms("换成接收短信的手机号", gson.toJson(map));
               // 根据短信发送流水号查询短信发送情况
               sendSmsDemo.querySendDetails(bizId, "换成接收短信的手机号");
           } catch (ClientException e) {
               e.printStackTrace();
           }
       }
   }
   ```

   

## 创建短信微服务

因为系统中不止注册一个地方需要短信发送，因此我们将短信发送抽取为微服务：`leyou-sms-service`，凡是需要的地方都可以使用。

另外，因为短信发送API调用时长的不确定性，为了提高程序的响应速度，短信发送我们都将采用异步发送方式，即：

- 短信服务监听MQ消息，收到消息后发送短信。
- 其它服务要发送短信时，通过MQ通知短信微服务。



### pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>leyou-parent</artifactId>
        <groupId>com.leyou</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.leyou.sms</groupId>
    <artifactId>leyou-sms-service</artifactId>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.aliyun</groupId>
            <artifactId>aliyun-java-sdk-core</artifactId>
            <version>4.4.3</version>
        </dependency>
    </dependencies>

</project>
```



### 编写启动类

```java
@SpringBootApplication
public class LeyouSmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeyouSmsApplication.class, args);
    }
}
```



### 编写application.yml

```yaml
server:
  port: 7006
spring:
  application:
    name: sms-service
  rabbitmq:
    host: 172.16.145.141
    username: leyou
    password: 123456
    virtual-host: /leyou
```



### 编写短信工具类

项目结构：

 ![1532955721215](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308026.png)

### 属性抽取

我们首先把一些常量抽取到application.yml中：

```yaml
leyou:
  sms:
    accessKeyId: JWffwFJIwada # 你自己的accessKeyId
    accessKeySecret: aySRliswq8fe7rF9gQyy1Izz4MQ # 你自己的AccessKeySecret
    signName: leyouMall # 签名名称
    verifyCodeTemplate: SMS_133976814 # 模板名称
```

然后注入到属性类中：

```java
@ConfigurationProperties(prefix = "leyou.sms")
public class SmsProperties {

    String accessKeyId;

    String accessKeySecret;

    String signName;

    String verifyCodeTemplate;

    public String getAccessKeyId() {
        return accessKeyId;
    }

    public void setAccessKeyId(String accessKeyId) {
        this.accessKeyId = accessKeyId;
    }

    public String getAccessKeySecret() {
        return accessKeySecret;
    }

    public void setAccessKeySecret(String accessKeySecret) {
        this.accessKeySecret = accessKeySecret;
    }

    public String getSignName() {
        return signName;
    }

    public void setSignName(String signName) {
        this.signName = signName;
    }

    public String getVerifyCodeTemplate() {
        return verifyCodeTemplate;
    }

    public void setVerifyCodeTemplate(String verifyCodeTemplate) {
        this.verifyCodeTemplate = verifyCodeTemplate;
    }
}
```



### 工具类

我们把阿里提供的demo进行简化和抽取，封装一个工具类：

```java
package com.leyou.sms.util;

@Component
@EnableConfigurationProperties(SmsProperties.class)
public class SendSmsUtils {

    private SmsProperties smsProperties;

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    private IAcsClient client = null;

    /**
     * 通过构造方法注入
     *
     * @param smsProperties
     */
    public SendSmsUtils(SmsProperties smsProperties) {
        this.smsProperties = smsProperties;

        /**
         * 设置鉴权参数，初始化客户端
         * （地域ID，您的AccessKey ID，您的AccessKey Secret）
         */
        DefaultProfile profile = DefaultProfile.getProfile(
                "cn-hangzhou",
                smsProperties.getAccessKeyId(),
                smsProperties.getAccessKeySecret());
        client = new DefaultAcsClient(profile);
    }


    /**
     * 发送短信
     */
    public CommonResponse sendSms(String telephone, String param, String signName, String templateId) throws ClientException {
        CommonRequest request = new CommonRequest();
        request.setSysDomain("dysmsapi.aliyuncs.com");
        request.setSysVersion("2017-05-25");
        request.setSysAction("SendSms");
        // 接收短信的手机号码
        request.putQueryParameter("PhoneNumbers", telephone);
        // 短信签名名称。请在控制台签名管理页面签名名称一列查看（必须是已添加、并通过审核的短信签名）。
        request.putQueryParameter("SignName", signName);
        // 短信模板ID
        request.putQueryParameter("TemplateCode", templateId);
        // 短信模板变量对应的实际值，JSON格式。
        request.putQueryParameter("TemplateParam", param);
        CommonResponse commonResponse = client.getCommonResponse(request);
        LOGGER.info("发送短信结果：{}", commonResponse.getData());

        return commonResponse;
    }

}
```



### 编写消息监听器

接下来，编写消息监听器，当接收到消息后，我们发送短信。

```java
package com.leyou.sms.listener;

@Component
@EnableConfigurationProperties(SmsProperties.class)
public class SmsListener {

    @Autowired
    private SendSmsUtils SendSmsUtils;

    @Autowired
    private SmsProperties smsProperties;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "LEYOU.SMS.QUEUE", durable = "true"),
            exchange = @Exchange(value = "LEYOU.SMS.EXCHANGE", ignoreDeclarationExceptions = "true"),
            key = {"sms.verify.code"})
    )
    public void listenSms(Map<String, String> msg) throws Exception {
        if (CollectionUtils.isEmpty(msg)) {
            // 放弃处理
            return;
        }
        String phone = msg.get("phone");
        String code = msg.get("code");

        if (StringUtils.isAnyBlank(phone, code)) {
            // 放弃处理
            return;
        }

        //发送消息
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("code", code);
        CommonResponse commonResponse = this.SendSmsUtils.sendSms(phone, jsonObject.toString(), smsProperties.getSignName(), smsProperties.getVerifyCodeTemplate());

    }
}
```

我们注意到，消息体是一个Map，里面有两个属性：

- phone：电话号码
- code：短信验证码



然后启动项目，查看rabbitmq后台页面是否存在交换机，消息队列等



## 发送短信功能

短信微服务已经准备好，我们就可以继续编写用户中心接口了。

### 接口说明

![1527238127932](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247157.png)



这里的业务逻辑是这样的：

1. 我们接收页面发送来的手机号码
2. 生成一个随机验证码
3. 将验证码保存在服务端
4. 发送短信，将验证码发送到用户手机



那么问题来了：验证码保存在哪里呢？

验证码有一定有效期，一般是5分钟，我们可以利用Redis的过期机制来保存。



## Redis

版本：`redis-5.0.7`

### 安装

1. 官网下载安装包

2. 上传到服务器

3. 解压

4. 进入解压后的目录执行编译，编译后安装

   ```
   # 编译，时间较长耐心等待
   make
   
   # 编译后安装
   make install
   ```



### 配置

修改安装目录下的redis.conf文件

```shell
vim redis.conf
```

修改以下配置：

```shell
#bind 127.0.0.1 # 将这行代码注释，监听所有的ip地址，外网可以访问
protected-mode no # 把yes改成no，允许外网访问
daemonize yes # 把no改成yes，后台运行
```



### 启动或停止

redis提供了服务端命令和客户端命令：

- redis-server 服务端命令
- redis-cli 客户端控制台，包含参数：
  -h xxx 指定服务端地址，缺省值是127.0.0.1
  -p xxx 指定服务端端口，缺省值是6379



在redis安装目录启动，使用当前文件夹下的配置文件：

```shell
redis-server redis.conf
```

查看是否启动：

```shell
ps -ef | grep redis
```

连接redis，默认连接本机6379端口

```
redis-cli
```

关闭使用客户端命令

```shell
redis-cli shutdown
```

### 设置开机启动

输入命令，新建文件

```sh
vim /etc/init.d/redis
```

输入下面内容：

```sh
#!/bin/sh
# chkconfig:   2345 90 10
# description:  Redis is a persistent key-value database
PATH=/usr/local/bin:/sbin:/usr/bin:/bin

REDISPORT=6379
EXEC=/usr/local/bin/redis-server
REDIS_CLI=/usr/local/bin/redis-cli

PIDFILE=/var/run/redis_6379.pid

CONF="/usr/local/leyou/redis/redis.conf"

case "$1" in  
    start)  
        if [ -f $PIDFILE ]  
        then  
                echo "$PIDFILE exists, process is already running or crashed"  
        else  
                echo "Starting Redis server..."  
                $EXEC $CONF  
        fi  
        if [ "$?"="0" ]   
        then  
              echo "Redis is running..."  
        fi  
        ;;  
    stop)  
        if [ ! -f $PIDFILE ]  
        then  
                echo "$PIDFILE does not exist, process is not running"  
        else  
                PID=$(cat $PIDFILE)  
                echo "Stopping ..."  
                $REDIS_CLI -p $REDISPORT SHUTDOWN  
                while [ -x ${PIDFILE} ]  
               do  
                    echo "Waiting for Redis to shutdown ..."  
                    sleep 1  
                done  
                echo "Redis stopped"  
        fi  
        ;;  
   restart|force-reload)  
        ${0} stop  
        ${0} start  
        ;;  
  *)  
    echo "Usage: /etc/init.d/redis {start|stop|restart|force-reload}" >&2  
        exit 1  
esac

```

然后保存退出

注意：以下信息需要根据安装目录进行调整：

> EXEC=/usr/local/bin/redis-server # 执行脚本的地址
>
> REDIS_CLI=/usr/local/bin/redis-cli # 客户端执行脚本的地址
>
> PIDFILE=/var/run/redis_6379.pid # 进程id文件地址
>
> CONF="/usr/local/leyou/redis/redis.conf" #配置文件地址

不知道在哪里使用下面命令查看

```
which redis-server
which redis-cli
```



设置权限

```sh
chmod 755 /etc/init.d/redis
```



启动测试

```sh
/etc/init.d/redis start
```

启动成功会提示如下信息：

```
Starting Redis server...
Redis is running...
```



设置开机自启动

```sh
chkconfig --add /etc/init.d/redis
chkconfig redis on
```



## Spring Data Redis

官网：<http://projects.spring.io/spring-data-redis/>

 ![1527250056698](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248082.png)                                    

Spring Data Redis，是Spring Data 家族的一部分。 对Jedis客户端进行了封装，与spring进行了整合。可以非常方便的来实现redis的配置和操作。 

### RedisTemplate基本操作

Spring Data Redis 提供了一个工具类：RedisTemplate。里面封装了对于Redis的五种数据结构的各种操作，包括：

- redisTemplate.opsForValue() ：操作字符串 
- redisTemplate.opsForHash() ：操作hash
- redisTemplate.opsForList()：操作list
- redisTemplate.opsForSet()：操作set
- redisTemplate.opsForZSet()：操作zset

其它一些通用命令，如expire，可以通过redisTemplate.xx()来直接调用

5种结构：

- String：等同于java中的，`Map<String,String>`
- list：等同于java中的`Map<String,List<String>>`
- set：等同于java中的`Map<String,Set<String>>`
- sort_set：可排序的set
- hash：等同于java中的：`Map<String,Map<String,String>>`



### StringRedisTemplate

RedisTemplate在创建时，可以指定其泛型类型：

- K：代表key 的数据类型
- V: 代表value的数据类型

注意：这里的类型不是Redis中存储的数据类型，而是Java中的数据类型，RedisTemplate会自动将Java类型转为Redis支持的数据类型：字符串、字节、二进制等等。

![1527250218215](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248139.png)

不过RedisTemplate默认会采用JDK自带的序列化（Serialize）来对对象进行转换。生成的数据十分庞大，因此一般我们都会指定key和value为String类型，这样就由我们自己把对象序列化为json字符串来存储即可。



因为大部分情况下，我们都会使用key和value都为String的RedisTemplate，因此Spring就默认提供了这样一个实现： ![1527256139407](https://cdn.tencentfs.clboy.cn/images/2021/20210911203248195.png)



### 测试

 ![1533013709197](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308081.png)

```java
package com.leyou.user.test;

import com.leyou.user.LeyouUserServiceApplication;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.BoundHashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = LeyouUserServiceApplication.class)
public class RedisTest {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Test
    public void testRedis() {
        // 存储数据
        this.redisTemplate.opsForValue().set("key1", "value1");
        // 获取数据
        String val = this.redisTemplate.opsForValue().get("key1");
        System.out.println("val = " + val);
    }

    @Test
    public void testRedis2() {
        // 存储数据，并指定剩余生命时间,5分钟
        this.redisTemplate.opsForValue().set("key2", "value2",
                5, TimeUnit.MINUTES);;
    }

    @Test
    public void testHash() {
        BoundHashOperations<String, Object, Object> hashOps =
                this.redisTemplate.boundHashOps("user");
        // 操作hash数据
        hashOps.put("name", "jack");
        hashOps.put("age", "21");

        // 获取单个数据
        Object name = hashOps.get("name");
        System.out.println("name = " + name);

        // 获取所有数据
        Map<Object, Object> map = hashOps.entries();
        for (Map.Entry<Object, Object> me : map.entrySet()) {
            System.out.println(me.getKey() + " : " + me.getValue());
        }
    }
}
```



需要在项目中引入Redis启动器：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

然后在配置文件中指定Redis地址：

```yaml
spring:
  redis:
    host: 172.16.145.141
```



## 在项目中实现

需要三个步骤：

- 生成随机验证码
- 将验证码保存到Redis中，用来在注册的时候验证
- 发送验证码到`leyou-sms-service`服务，发送短信

因此，我们需要引入Redis和AMQP：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

添加RabbitMQ和Redis配置：

```yaml
spring:
  redis:
    host: 172.16.145.141
  rabbitmq:
    host: 172.16.145.141
    username: leyou
    password: 123456
    virtual-host: /leyou
```



另外还要用到工具类，生成6位随机码，这个我们封装到了`leyou-common`中，因此需要引入依赖：

```xml
<dependency>
    <groupId>com.leyou.common</groupId>
    <artifactId>leyou-common</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

NumberUtils中有生成随机码的工具方法：

```java
/**
 * 生成指定位数的随机数字
 * @param len 随机数的位数
 * @return 生成的随机数
 */
public static String generateCode(int len){
    len = Math.min(len, 8);
    int min = Double.valueOf(Math.pow(10, len - 1)).intValue();
    int num = new Random().nextInt(
        Double.valueOf(Math.pow(10, len + 1)).intValue() - 1) + min;
    return String.valueOf(num).substring(0,len);
}
```

[工具包](/project/leyoumall/resources/utils.tar.gz ':ignore')

### UserController

在leyou-user-service工程中的UserController添加方法：

```java
@PostMapping("/code")
public ResponseEntity<Void> sendVerifyCode(@RequestParam("phone") String phone) {
    Boolean boo = this.userService.sendVerifyCode(phone);
    if (boo == null) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    } else if (!boo) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.noContent().build();
}
```



### UserService

在Service中添加代码：

```java
@Service
public class UserServiceImpl implements UserService {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AmqpTemplate amqpTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String KEY_PREFIX = "user:code:phone:";


    @Override
    public Boolean checkData(String data, Integer type) {
        User user = new User();
        if (type == 1) {
            //校验用户名
            user.setUsername(data);
        } else if (type == 2) {
            //校验手机
            user.setPhone(data);
        }
        //查询
        int count = this.userMapper.selectCount(user);
        return count == 0;
    }

    @Override
    public Boolean sendVerifyCode(String phone) {
        //校验手机号格式是否正确
        if (!phone.matches("^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\\d{8}$")) {
            return false;
        }

        //生成验证码
        String code = NumberUtils.generateCode(6);
        Map<String, String> msg = new HashMap<>(2);
        msg.put("phone", phone);
        msg.put("code", code);

        try {
            //将验证码存入redis，有效期5分钟
            redisTemplate.opsForValue().set(KEY_PREFIX + phone, code, 5, TimeUnit.MINUTES);
            //调用sms服务发送验证码
            amqpTemplate.convertAndSend("LEYOU.SMS.EXCHANGE", "sms.verify.code", msg);
        } catch (AmqpException e) {
            LOGGER.error("给{}发送验证码失败", phone, e);
            return null;
        }

        return true;
    }
}
```

注意：要设置短信验证码在Redis的缓存时间为5分钟



### 测试

通过Postman工具发送请求试试：

![1576469102358](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321238.png)

查看Redis中的数据：

![1576469139443](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321292.png)

查看是否收到短信



## 注册功能

### 接口说明

 ![1527240855176](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247441.png)

基本逻辑：

1. 校验短信验证码
2. 生成盐
3. 对密码加密
4. 写入数据库
5. 删除Redis中的验证码



### UserController

```java
@PostMapping("/register")
public ResponseEntity<Void> register(User user, @RequestParam("code") String code) {
    Boolean boo = this.userService.register(user, code);
    if (!boo) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.created(null).build();
}
```



### UserService

```java
@Override
public Boolean register(User user, String code) {
    //校验验证码是否正确
    String realCode = this.redisTemplate.opsForValue().get(KEY_PREFIX + user.getPhone());
    if (!StringUtils.equals(realCode, code)) {
        return false;
    }

    //生成盐
    String salt = CodecUtils.generateSalt();
    //设置盐
    user.setSalt(salt);
    //密码加密
    user.setPassword(CodecUtils.md5Hex(user.getPassword(), salt));

    // 强制设置不能指定的参数为null
    user.setId(null);
    user.setCreated(new Date());

    //保存到数据库
    boolean boo = this.userMapper.insertSelective(user) == 1;

    //注册成功删除redis中的验证码
    if (boo) {
        this.redisTemplate.delete(KEY_PREFIX + user.getPhone());
    }

    return boo;
}
```

此处使用了资料中的CodeUtils：

该工具类需要apache加密工具包：

```xml
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
</dependency>
```



### 测试

我们通过RestClient测试：

![1533024221725](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308288.png)

查看数据库：

![1533024241233](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308340.png)

查看redis中的信息也被删除



## hibernate-validate

刚才虽然实现了注册，但是服务端并没有进行数据校验，而前端的校验是很容易被有心人绕过的。所以我们必须在后台添加数据校验功能：

我们这里会使用Hibernate-Validator框架完成数据校验：

而SpringBoot的web启动器中已经集成了相关依赖：

 ![1527244265451](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247810.png)

### 什么是Hibernate Validator

Hibernate Validator是Hibernate提供的一个开源框架，使用注解方式非常方便的实现服务端的数据校验。

官网：http://hibernate.org/validator/

![1527244393041](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247862.png)



**hibernate Validator** 是 Bean Validation 的参考实现 。

Hibernate Validator 提供了 JSR 303 规范中所有内置 constraint（约束） 的实现，除此之外还有一些附加的 constraint。

在日常开发中，Hibernate Validator经常用来验证bean的字段，基于注解，方便快捷高效。



### Bean校验的注解

常用注解如下：

| **Constraint**                                     | **详细信息**                                                 |
| -------------------------------------------------- | ------------------------------------------------------------ |
| **@Valid**                                         | 被注释的元素是一个对象，需要检查此对象的所有字段值           |
| **@Null**                                          | 被注释的元素必须为 null                                      |
| **@NotNull**                                       | 被注释的元素必须不为 null                                    |
| **@AssertTrue**                                    | 被注释的元素必须为 true                                      |
| **@AssertFalse**                                   | 被注释的元素必须为 false                                     |
| **@Min(value)**                                    | 被注释的元素必须是一个数字，其值必须大于等于指定的最小值     |
| **@Max(value)**                                    | 被注释的元素必须是一个数字，其值必须小于等于指定的最大值     |
| **@DecimalMin(value)**                             | 被注释的元素必须是一个数字，其值必须大于等于指定的最小值     |
| **@DecimalMax(value)**                             | 被注释的元素必须是一个数字，其值必须小于等于指定的最大值     |
| **@Size(max,   min)**                              | 被注释的元素的大小必须在指定的范围内                         |
| **@Digits   (integer, fraction)**                  | 被注释的元素必须是一个数字，其值必须在可接受的范围内         |
| **@Past**                                          | 被注释的元素必须是一个过去的日期                             |
| **@Future**                                        | 被注释的元素必须是一个将来的日期                             |
| **@Pattern(value)**                                | 被注释的元素必须符合指定的正则表达式                         |
| **@Email**                                         | 被注释的元素必须是电子邮箱地址                               |
| **@Length**                                        | 被注释的字符串的大小必须在指定的范围内                       |
| **@NotEmpty**                                      | 被注释的字符串的必须非空                                     |
| **@Range**                                         | 被注释的元素必须在合适的范围内                               |
| **@NotBlank**                                      | 被注释的字符串的必须非空                                     |
| **@URL(protocol=,host=,   port=,regexp=, flags=)** | 被注释的字符串必须是一个有效的url                            |
| **@CreditCardNumber**                              | 被注释的字符串必须通过Luhn校验算法，银行卡，信用卡等号码一般都用Luhn计算合法性 |



### 给User添加校验

我们在`leyou-user-interface`中添加Hibernate-Validator依赖：

```xml
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
</dependency>
```



我们在User对象的部分属性上添加注解：

```java
@Table(name = "tb_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Length(min = 4, max = 30, message = "用户名只能在4~30位之间")
    private String username;// 用户名

    @JsonIgnore
    @Length(min = 4, max = 30, message = "密码只能在4~30位之间")
    private String password;// 密码

    @Pattern(regexp = "^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\\d{8}$", message = "手机号码格式不正确")
    private String phone;// 电话

    private Date created;// 创建时间

    @JsonIgnore
    private String salt;// 密码的盐值
}
```



### 在controller上进行控制

在controller中改造register方法，只需要给User添加 `@Valid`注解即可。

![1533030001081](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308494.png)

### 测试

我们故意填错：

![1533029312208](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308392.png)

然后SpringMVC会自动返回错误信息：

![1533029343713](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308443.png)



## 根据用户名和密码查询用户

**功能说明**

查询功能，根据参数中的用户名和密码查询指定用户



**接口路径**

```
GET /query
```



**参数说明**

| 参数     | 说明                                     | 是否必须 | 数据类型 | 默认值 |
| -------- | ---------------------------------------- | -------- | -------- | ------ |
| username | 用户名，格式为4~30位字母、数字、下划线   | 是       | String   | 无     |
| password | 用户密码，格式为4~30位字母、数字、下划线 | 是       | String   | 无     |



**返回结果**

用户的json格式数据

```json
{
    "id": 6572312,
    "username":"test",
    "phone":"13688886666",
    "created": 1342432424
}
```



**状态码**

- 200：返回查询数据
- 400：用户名或密码错误
- 500：服务器内部异常，查询失败



### controller

```java
@GetMapping("/query")
public ResponseEntity<User> queryUser(@RequestParam("username") String username, @RequestParam("password") String password) {

    User user = this.userService.queryUser(username, password);
    if (user == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(user);
}
```

### service

```java
@Override
public User queryUser(String username, String password) {
    User user = new User();
    user.setUsername(username);
    //先根据用户名查询用户
    user = this.userMapper.selectOne(user);
    if (user == null) {
        //没有用户直接返回null
        return null;
    }

    //查询到用户进行密码比对
    boolean boo = StringUtils.equals(user.getPassword(), CodecUtils.md5Hex(password, user.getSalt()));

    if (!boo) {
        //密码不一致，返回null
        return null;
    }

    return user;
}
```

要注意，查询时也要对密码进行加密后判断是否一致。



### 测试

![1533030961886](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308545.png)



## 在注册页进行测试

<http://www.leyou.com/register.html>

在注册页填写信息：

![1533031066018](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308596.png)

页面获取验证码的请求路径有误，应该改为/code

![1576473569460](https://cdn.tencentfs.clboy.cn/images/2021/20210911203321345.png)

提交发现页面自动跳转到了登录页，查看数据库：

![1533031705871](https://cdn.tencentfs.clboy.cn/images/2021/20210911203308648.png)





