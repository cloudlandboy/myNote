# 远程调用方式

无论是微服务还是SOA，都面临着服务间的远程调用。那么服务间的远程调用方式有哪些呢？

常见的远程调用方式有以下几种：

- `RPC`：Remote Produce Call远程过程调用，类似的还有RMI。自定义数据格式，基于原生TCP通信，速度快，效率高。早期的webservice，现在热门的dubbo，都是RPC的典型

- `Http`：http其实是一种网络传输协议，基于TCP，规定了数据传输的格式。现在客户端浏览器与服务端通信基本都是采用Http协议。也可以用来进行远程服务调用。缺点是消息封装臃肿。

  现在热门的Rest风格，就可以通过http协议来实现。



## 认识RPC

RPC，即 Remote Procedure Call（远程过程调用），是一个计算机通信协议。 该协议允许运行于一台计算机的程序调用另一台计算机的子程序，而程序员无需额外地为这个交互作用编程。说得通俗一点就是：A计算机提供一个服务，B计算机可以像调用本地服务那样调用A计算机的服务。

通过上面的概念，我们可以知道，实现RPC主要是做到两点： 

1. 实现远程调用其他计算机的服务

   要实现远程调用，肯定是通过网络传输数据。A程序提供服务，B程序通过网络将请求参数传递给A，A本地执行后得到结果，再将结果返回给B程序。这里需要关注的有两点：

   - 采用何种网络通讯协议？

     现在比较流行的RPC框架，都会采用TCP作为底层传输协议

   - 数据传输的格式怎样？

     两个程序进行通讯，必须约定好数据传输格式。就好比两个人聊天，要用同一种语言，否则无法沟通。所以，我们必须定义好请求和响应的格式。另外，数据在网路中传输需要进行序列化，所以还需要约定统一的序列化的方式。

2. 要像调用本地服务一样调用远程服务

   如果仅仅是远程调用，还不算是RPC，因为RPC强调的是过程调用，调用的过程对用户而言是应该是透明的，用户不应该关心调用的细节，可以像调用本地服务一样调用远程服务。所以RPC一定要对调用的过程进行封装



RPC调用流程图：

![1525568965976](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1525568965976.png)

想要了解详细的RPC实现，给大家推荐一篇文章：[自己动手实现RPC](https://legacy.gitbook.com/book/huge0612/tour-of-rpc/details)



## 认识Http

Http协议：超文本传输协议，是一种应用层协议。规定了网络传输的请求格式、响应格式、资源定位和操作的方式等。但是底层采用什么网络传输协议，并没有规定，不过现在都是采用TCP协议作为底层传输协议。说到这里，大家可能觉得，Http与RPC的远程调用非常像，都是按照某种规定好的数据格式进行网络通信，有请求，有响应。没错，在这点来看，两者非常相似，但是还是有一些细微差别。

- RPC并没有规定数据传输格式，这个格式可以任意指定，不同的RPC协议，数据格式不一定相同。
- Http中还定义了资源定位的路径，RPC中并不需要
- 最重要的一点：RPC需要满足像调用本地服务一样调用远程服务，也就是对调用过程在API层面进行封装。Http协议没有这样的要求，因此请求、响应等细节需要我们自己去实现。
  - 优点：RPC方式更加透明，对用户更方便。Http方式更灵活，没有规定API和语言，跨语言、跨平台
  - 缺点：RPC方式需要在API层面进行封装，限制了开发的语言环境。

例如我们通过浏览器访问网站，就是通过Http协议。只不过浏览器把请求封装，发起请求以及接收响应，解析响应的事情都帮我们做了。如果是不通过浏览器，那么这些事情都需要自己去完成。

![1525569352313](https://cdn.static.note.zzrfdsn.cn/images/springcloud/assets/1525569352313.png)



## 如何选择？

既然两种方式都可以实现远程调用，我们该如何选择呢？

- 速度来看，RPC要比http更快，虽然底层都是TCP，但是http协议的信息往往比较臃肿，不过可以采用gzip压缩。
- 难度来看，RPC实现较为复杂，http相对比较简单
- 灵活性来看，http更胜一筹，因为它不关心实现细节，跨平台、跨语言。

因此，两者都有不同的使用场景：

- 如果对效率要求更高，并且开发过程使用统一的技术栈，那么用RPC还是不错的。
- 如果需要更加灵活，跨语言、跨平台，显然http更合适



那么我们该怎么选择呢？

微服务，更加强调的是独立、自治、灵活。而RPC方式的限制较多，因此微服务框架中，一般都会采用基于Http的Rest风格服务。



## Http客户端工具

既然微服务选择了Http，那么我们就需要考虑自己来实现对请求和响应的处理。不过开源世界已经有很多的http客户端工具，能够帮助我们做这些事情，例如：

- HttpClient
- OKHttp
- URLConnection

接下来，我们就一起了解一款比较流行的客户端工具：`HttpClient`



## HttpClient

`HttpClient`是Apache公司的产品，是`Http Components`下的一个组件。

### 特点

- 基于标准、纯净的Java语言。实现了Http1.0和Http1.1
- 以可扩展的面向对象的结构实现了Http全部的方法（GET, POST, PUT, DELETE, HEAD, OPTIONS, and TRACE）
- 支持HTTPS协议。
- 通过Http代理建立透明的连接。
- 自动处理Set-Cookie中的Cookie。



### 使用

#### 提供服务

1. 创建数据库，运行sql脚本创建`tb_user`表，随便添加几条数据

   ```sql
   DROP TABLE IF EXISTS `tb_user`;
   CREATE TABLE `tb_user` (
     `id` bigint(20) NOT NULL AUTO_INCREMENT,
     `username` varchar(50) NOT NULL COMMENT '用户名',
     `password` varchar(32) NOT NULL COMMENT '密码，加密存储',
     `phone` varchar(20) DEFAULT NULL COMMENT '注册手机号',
     `created` datetime NOT NULL COMMENT '创建时间',
     PRIMARY KEY (`id`),
     UNIQUE KEY `username` (`username`) USING BTREE
   ) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COMMENT='用户表';
   ```

2. 创建SpringBoot项目1 `httpClientService`用于提供服务

   引入web场景和mysql驱动以及通用mapper场景

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>2.2.1.RELEASE</version>
           <relativePath/> <!-- lookup parent from repository -->
       </parent>
       <groupId>cn.clboy</groupId>
       <artifactId>httpclientservice</artifactId>
       <version>0.0.1-SNAPSHOT</version>
       <name>httpclientservice</name>
       <description>Demo project for Spring Boot</description>
   
       <properties>
           <java.version>1.8</java.version>
       </properties>
   
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
   
           <dependency>
               <groupId>mysql</groupId>
               <artifactId>mysql-connector-java</artifactId>
               <scope>runtime</scope>
           </dependency>
   
           <dependency>
               <groupId>tk.mybatis</groupId>
               <artifactId>mapper-spring-boot-starter</artifactId>
               <version>2.1.5</version>
           </dependency>
   
       <build>
           <plugins>
               <plugin>
                   <groupId>org.springframework.boot</groupId>
                   <artifactId>spring-boot-maven-plugin</artifactId>
               </plugin>
           </plugins>
       </build>
   
   </project>
   
   ```

   配置数据库连接信息

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/leyoumall
       username: root
       password: root
       driver-class-name: com.mysql.cj.jdbc.Driver
   ```

   

3. 创建`TbUser`实体类

   ```java
   package cn.clboy.httpclientservice.pojo;
   
   import javax.persistence.*;
   import java.util.Date;
   
   @Table(name = "tb_user")
   public class TbUser {
   
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private String username;
       private String password;
       private String phone;
       private Date created;
       
       //getter setter方法	......
   
   ```

4. 创建`Mapper`继承`通用mapper`，添加`@mapper`注解

   ```java
   package cn.clboy.httpclientservice.Mapper;
   
   import cn.clboy.httpclientservice.pojo.TbUser;
   import tk.mybatis.mapper.common.Mapper;
   
   @org.apache.ibatis.annotations.Mapper
   public interface UserMapper extends Mapper<TbUser> {
   
   }
   ```

5. 创建Controller

   ```java
   @RestController
   public class UserController {
   
       @Autowired
       private UserMapper userMapper;
   
       @GetMapping("/user")
       public List<TbUser> users() {
           return userMapper.selectAll();
       }
   
       @PostMapping("/user")
       public TbUser add(TbUser user) {
           userMapper.insert(user);
           return user;
       }
   }
   ```

6. 访问：<http://localhost:8080/user>，访问成功下一步



#### 调用服务

1. 创建`httpClientConsumer`项目调用`httpClientService`的服务

2. 引入httpclient依赖

   ```xml
   <dependency>
       <groupId>org.apache.httpcomponents</groupId>
       <artifactId>httpclient</artifactId>
       <version>4.5.10</version>
   </dependency>
   ```

3. 测试

   ```java
   @SpringBootTest
   class HttpclientconsumerApplicationTests {
   
       //1. 安装浏览器
       public CloseableHttpClient httpClient;
   
       @BeforeEach
       public void init() {
           //2. 打开浏览器
           httpClient = HttpClients.createDefault();
       }
   
       @Test
       public void get() throws IOException {
           //2. 创建get请求
           HttpGet getRequest = new HttpGet("http://localhost:8080/user");
           String response = httpClient.execute(getRequest, new BasicResponseHandler());
           System.out.println(response);
       }
   
       @Test
       public void post() throws IOException {
           //创建post请求
           HttpPost postRequest = new HttpPost("http://localhost:8080/user");
           //表单数据
           List<NameValuePair> formparams = new ArrayList<NameValuePair>();
           formparams.add(new BasicNameValuePair("username", "zhangsan"));
           formparams.add(new BasicNameValuePair("password", "123456"));
           formparams.add(new BasicNameValuePair("phone", "13945126789"));
           formparams.add(new BasicNameValuePair("created", "2019/10/01"));
   
           UrlEncodedFormEntity entity = new UrlEncodedFormEntity(formparams, "utf-8");
           postRequest.setEntity(entity);
   
           String response = httpClient.execute(postRequest, new BasicResponseHandler());
           System.out.println(response);
           
       }
   
   }
   ```



## Json转换工具(Jackson)

HttpClient请求数据后是json字符串，需要我们自己把Json字符串反序列化为对象，我们可以使用Jackson工具来实现。

`Jackson`是SpringMVC内置的json处理工具，其中有一个`ObjectMapper`类，可以方便的实现对json的处理：

### 对象转json

```java
@SpringBootTest
class HttpclientserviceApplicationTests {

    @Autowired
    private UserMapper userMapper;

    @Test
    void contextLoads() throws JsonProcessingException {
        TbUser user = userMapper.selectByPrimaryKey(1);

        ObjectMapper mapper=new ObjectMapper();
        //序列化
        String jsonStr = mapper.writeValueAsString(user);
        System.out.println(jsonStr);
    }

}
```



### json转普通对象

在服务调用项目中放一份User类，添加jackson的依赖

```java
public class TbUser {
    private Long id;
    private String username;
    private String password;
    private String phone;
    private Date created;
    
    //getter,setter......
}
```

```xml
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.10.1</version>
        </dependency>
```

```java
    @Test
    public void post() throws IOException {
        
        //......

        String response = httpClient.execute(postRequest, new BasicResponseHandler());

        ObjectMapper mapper = new ObjectMapper();
        TbUser tbUser = mapper.readValue(response, TbUser.class);
        System.out.println(tbUser);
    }
```



### json转集合

json转集合比较麻烦，因为你无法同时把集合的class和元素的class同时传递到一个参数。

因此Jackson做了一个类型工厂，用来解决这个问题：

```java
    @Test
    public void get() throws IOException {
        //2. 创建get请求
        HttpGet getRequest = new HttpGet("http://localhost:8080/user");
        String response = httpClient.execute(getRequest, new BasicResponseHandler());

        ObjectMapper mapper = new ObjectMapper();
        CollectionLikeType type = mapper.getTypeFactory().constructCollectionType(List.class, TbUser.class);
        List<TbUser> users = mapper.readValue(response, type);
        System.out.println(users);
    }
```



### json转任意复杂类型

当对象泛型关系复杂时，类型工厂也不好使了。这个时候Jackson提供了TypeReference来接收类型泛型，然后底层通过反射来获取泛型上的具体类型。实现数据转换。



```java
    @Test
    public void testJsonToMap() throws IOException {
        Map<String, Object> map = new HashMap<>();

        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<TbUser>> listTypeReference = new TypeReference<List<TbUser>>() {
        };

        //使用TypeReference，它是一个抽象类
        List<TbUser> users = mapper.readValue(new URL("http://localhost:8080/user"), listTypeReference);

        for (TbUser user : users) {
            map.put(user.getUsername(), user);
        }

        //序列化
        String mapJson = mapper.writeValueAsString(map);
        System.out.println(mapJson);

        //反序列化，使用类型工厂
        Map<String, Object> result = mapper.readValue(mapJson, mapper.getTypeFactory().constructMapType(HashMap.class, String.class, TbUser.class));


        System.out.println(result);

    }
```



## Spring的RestTemplate

Spring提供了一个RestTemplate模板工具类，对基于Http的客户端进行了封装，并且实现了对象与json的序列化和反序列化，非常方便。RestTemplate并没有限定Http的客户端类型，而是进行了抽象，目前常用的3种都有支持：

- HttpClient
- OkHttp
- JDK原生的URLConnection（默认的）

首先在项目中注册一个`RestTemplate`对象，可以在启动类位置注册：

要使用RestTemplate，需要映入web场景，web场景包括Jackson，所以可以把开始引入的Jackson依赖删掉了

给调用服务的项目添加web场景

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

给容器中添加`RestTemplate`

```java
@SpringBootApplication
public class HttpclientconsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HttpclientconsumerApplication.class, args);
    }

    @Bean
    public RestTemplate resttemplate() {
        return new RestTemplate();
    }
}
```

测试

```java
@SpringBootTest
class HttpclientconsumerApplicationTests {

    @Autowired
    private RestTemplate restTemplate;

    @Test
    public void restTemplateGet() {
        List<TbUser> users = restTemplate.getForObject("http://localhost:8080/user", List.class);
        System.out.println("users --> " + users);
    }

}
```

