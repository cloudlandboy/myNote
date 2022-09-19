# Springboot之Webscoket聊天

> 使用websocket建立点对点连接

## 添加依赖

> 新建springboot项目添加`spring-boot-starter-websocket`依赖

```xml
<!--websocket-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

## 创建 WebSocket 配置类

> `@EnableWebSocket`
>
> 如果想在使用内嵌容器的Spring Boot应用中使用`@ServerEndpoint`，你需要声明一个单独的`ServerEndpointExporter` `@Bean`
>
> 该bean将使用底层的WebSocket容器注册任何被`@ServerEndpoint`注解的beans。当部署到一个单独的servlet容器时，该角色将被一个servlet容器初始化方法执行，`ServerEndpointExporter` bean也就不需要了

```java
@Configuration
@EnableWebSocket
public class WebsocketConfig {

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

}
```

## 端点配置

> 有两种配置端点的方式：基于*注解*和基于扩展。您可以扩展*javax.websocket.Endpoint*类或使用专用的方法级注解。与编程模式相比，注解模式代码更清晰，因此注解已成为编码的常规选择。在这种情况下，WebSocket 端点生命周期事件由以下注解处理：

- `@ServerEndpoint`：如果用 *@ServerEndpoint 修饰* ，容器确保类作为 *WebSocket* 服务器的可用性，监听指定的 URI 
- `@ClientEndpoint`：使用此注解修饰的类被视为 *WebSocket* 客户端
- `@OnOpen`：当启动新的 *WebSocket* 连接时，容器会调用带有 *@OnOpen* 的 Java 方法
- `@OnMessage`：一个Java方法，用 *@OnMessage* 注解，当消息发送到端点时从 *WebSocket* 容器接收信息
- `@OnError`：当通信出现问题时调用带有 *@OnError* 的方法
- `@OnClose`：用于装饰一个 Java 方法，该方法在 *WebSocket* 连接关闭时由容器调用



我们通过使用`@ServerEndpoint`注释来声明一个 Java 类*WebSocket*服务器端点。我们还指定部署端点的 URI。URI 是相对于服务器容器的根定义的，并且必须以`/`开头，否则会报错

```java
@Getter
@Controller
@ServerEndpoint("/chat/{userName}")
public class ChatEndpoint {


    /**
     * 连接的用户名
     */
    private String userName;

    /**
     * 连接的websocket会话session
     */
    private Session session;

    /**
     * 用于存储所有的连接
     * key为用户标识
     */
    private static final Map<String, ChatEndpoint> CHAT_ENDPOINT_LIST = new ConcurrentHashMap<String, ChatEndpoint>();

    /**
     * 由于该类不是单例的,只能定义为静态变量
     */
    private static ChatSessionService chatSessionService;

    /**
     * spring初始化的时候设置静态变量
     *
     * @param chatSessionService
     */
    @Autowired
    private void setChatSessionService(ChatSessionService chatSessionService) {
        ChatEndpoint.chatSessionService = chatSessionService;
    }

    /**
     * 建立连接时调用
     * PathParam参数注解类似于springmvc的PathVariable
     *
     * @param session
     * @throws IOException
     */
    @OnOpen
    public void onOpen(@PathParam("userName") String userName, Session session) throws IOException {
        this.userName = userName;
        this.session = session;
        CHAT_ENDPOINT_LIST.put(userName, this);
        System.out.println(userName + "，已上线！");
    }

    /**
     * 收到消息时调用
     *
     * @param session
     * @param message
     * @throws IOException
     */
    @OnMessage
    public void onMessage(Session session, String message) throws IOException, EncodeException {
        System.out.println("收到来至" + this.userName + "的消息：" + message);
        ObjectMapper objectMapper = new ObjectMapper();
        ChatSession chatSession = objectMapper.readValue(message, ChatSession.class);

        //存储会话
        chatSession.setCreateTime(LocalDateTime.now());
        chatSessionService.save(chatSession);

        ChatEndpoint chatEndpoint = CHAT_ENDPOINT_LIST.get(chatSession.getSendTo());
        if (chatEndpoint == null) {
            System.out.println(chatSession.getSendTo() + "，不在线！");
            return;
        }
        //服务器推送消息给对方
        chatEndpoint.getSession().getBasicRemote().sendText(message);
    }

    /**
     * 连接关闭时调用
     *
     * @param session
     * @throws IOException
     */
    @OnClose
    public void onClose(Session session) throws IOException {
        System.out.println(this.userName + "，已下线！");
    }

    /**
     * 出错时调用
     *
     * @param session
     * @param throwable
     */
    @OnError
    public void onError(Session session, Throwable throwable) {
        throwable.printStackTrace();
    }
}

```



## 前端代码

> UI框架用的`element-ui`

```html
<!doctype html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Springboot之Webscoket聊天</title>
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
</head>
<body>
<div id="app" style="margin-top: 50px">
    <el-row>
        <el-col :span="6" :offset="10">
            <div style="margin-bottom: 38px">
                <el-avatar style="vertical-align: middle;margin-right: 20px">{{loginUser.substr(0, 3)}}</el-avatar>
                <span>{{loginUser}}</span>
            </div>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="6" :offset="6">
            <el-form ref="form" :model="chatSession" label-width="80px">
                <el-form-item label="消息：">
                    <el-input v-model="chatSession.message"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="sendMessage">发送</el-button>
                    <el-button @click="logout">退出连接</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-col :span="8" :offset="4">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>消息记录</span>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="clearChatHistory">清空聊天
                    </el-button>
                </div>
                <div v-for="(chat,index) in chatHistory" :key="index" class="text item">
                    <div v-if="chat.userName==loginUser" style="text-align: left;margin-bottom: 8px">
                        <el-avatar style="vertical-align: middle">{{chat.userName.substr(0, 3)}}</el-avatar>
                        ： {{chat.message}}
                    </div>
                    <div v-else style="text-align: right;margin-bottom: 8px">
                        {{chat.message}}：
                        <el-avatar style="vertical-align: middle">{{chat.userName.substr(0, 3)}}</el-avatar>
                    </div>
                </div>
                <div v-if="chatHistory.length==0" style="text-align: center;color: #C0C4CC">
                    暂无消息
                </div>
            </el-card>
        </el-col>
    </el-row>
    <div>
        <el-dialog title="聊天室" :visible.sync="login" width="30%" :close-on-click-modal="false"
                   :close-on-press-escape="false" :show-close="false">
            <div>
                <el-input v-model="loginUser" placeholder="请输入登录用户名"></el-input>
            </div>
            <div style="margin-top: 20px">
                <el-input v-model="chatSession.sendTo" placeholder="和谁聊天"></el-input>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="connect">连接</el-button>
            </div>
        </el-dialog>
    </div>
</div>
</body>
<script src="https://unpkg.com/vue@2.6.14/dist/vue.js"></script>
<script src="https://unpkg.com/element-ui@2.15.3/lib/index.js"></script>
<script src="https://unpkg.com/axios@0.21.1/dist/axios.min.js"></script>
<script>
    const app = new Vue({
        el: '#app',
        data: {
            login: true,
            loginUser: '',
            chatWs: null,
            chatSession: {
                message: '',
                sendTo: ''
            },
            chatHistory: []
        },
        methods: {
            clearChatHistory() {
                this.chatHistory = [];
            },
            connect() {
                if (this.loginUser.length < 1 || this.chatSession.sendTo.length < 1) {
                    return;
                }
                //判断当前浏览器是否支持WebSocket
                if ('WebSocket' in window) {
                    this.chatWs = new WebSocket("ws://127.0.0.1:8080/chat/" + this.loginUser);
                    //连接发生错误的回调方法
                    this.chatWs.onerror = function () {
                        app.$notify.error({
                            title: '错误',
                            message: '连接出错了'
                        });
                    };

                    //连接成功建立的回调方法
                    this.chatWs.onopen = function (event) {
                        app.$notify({
                            title: '成功',
                            message: "连接成功",
                            type: 'success'
                        });

                        //获取聊天记录
                        axios.get("http://127.0.0.1:8081/chat_session/" + app.loginUser + "/" + app.chatSession.sendTo).then(res => {
                            res.data.forEach(s => {
                                app.chatHistory.push(s);
                            })
                        })
                        app.login = false;
                    }


                    //接收到消息的回调方法
                    this.chatWs.onmessage = function (event) {
                        let receive = event.data;
                        app.chatHistory.push(JSON.parse(receive));
                    }

                    //连接关闭的回调方法
                    this.chatWs.onclose = function () {
                        app.chatWs = null;
                        app.chatHistory = [];
                        app.chatSession.sendTo = '';
                        app.login = true;
                    }

                    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
                    window.onbeforeunload = function () {
                        this.chatWs.close();
                    }
                } else {
                    alert('Not support websocket')
                }
            },
            sendMessage() {
                if (this.chatSession.message.length < 1) return;
                this.chatSession.userName = this.loginUser;
                this.chatHistory.push(Object.assign({}, this.chatSession));
                this.chatWs.send(JSON.stringify(this.chatSession));
                this.chatSession.message = '';
            },
            logout() {
                this.chatWs.close();
            }
        }
    })
</script>
</html>
```

## 消息类型

> WebSocket 规范支持两种在线数据格式
>
> - 文本
> - 二进制
>
> API 支持这两种格式，还添加了处理规范中定义的 Java 对象和健康检查消息（Ping-Pong）的功能

- `Text`：任何文本数据（`java.lang.String`）
- `Binary`：由`java.nio.ByteBuffer`或`byte[]`（字节数组）表示的二进制数据（例如音频、图像等）
- `Java 对象`：API 可以在您的代码中Java 对象表示，并使用自定义转换器（编码器/解码器）将它们转换为 WebSocket 协议允许的兼容在线格式（文本、二进制）
- `Ping-Pong`：`javax.websocket.PongMessage` 是 WebSocket 对响应健康检查 (ping) 请求而发送的确认



## 编码器(消息转换器)

编码器采用 Java 对象并生成适合作为消息传输的典型表示，例如` JSON`、`XML` 或二进制表示。可以通过实现`Encoder.Text<T>`或`Encoder.Binary<T>`接口来使用编码器

### 定义实体类

```java
@Data
public class ChatSession implements Serializable {
    private String userName;
    private String sendTo;
    private String message;
    private LocalDateTime createTime;
}
```

### 定义编码器

```java
@Component
@NoArgsConstructor
public class ChatSessionEncode implements Encoder.Text<ChatSession> {

    private static ObjectMapper objectMapper;

    @Autowired
    public ChatSessionEncode(ObjectMapper objectMapper) {
        ChatSessionEncode.objectMapper = objectMapper;
    }

    @Override
    @SneakyThrows
    public String encode(ChatSession chatSession) throws EncodeException {
        return objectMapper.writeValueAsString(chatSession);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
    }

    @Override
    public void destroy() {

    }
}
```

### 定义解码器

```java
@Component
@NoArgsConstructor
public class ChatSessionDecode implements Decoder.Text<ChatSession> {

    private static ObjectMapper objectMapper;

    @Autowired
    public ChatSessionDecode(ObjectMapper objectMapper) {
        ChatSessionDecode.objectMapper = objectMapper;
    }

    @Override
    @SneakyThrows
    public ChatSession decode(String s) throws DecodeException {
        return objectMapper.readValue(s, ChatSession.class);
    }

    @Override
    public boolean willDecode(String s) {
        return true;
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
```

### 端点中设置编码器和解码器

```java
@Getter
@Controller
@ServerEndpoint(
        value = "/chat/{userName}",
        encoders = ChatSessionEncode.class,
        decoders = ChatSessionDecode.class
)
public class ChatEndpoint{
	//......
}
```

### 改造接收消息方法

```java
@OnMessage
public void onMessage(Session session, ChatSession chatSession) throws IOException, EncodeException {
    System.out.println("收到来至" + this.userName + "的消息：" + chatSession.getMessage());
    //存储会话
    chatSession.setCreateTime(LocalDateTime.now());
    chatSessionService.save(chatSession);

    ChatEndpoint chatEndpoint = CHAT_ENDPOINT_LIST.get(chatSession.getSendTo());
    if (chatEndpoint == null) {
        System.out.println(chatSession.getSendTo() + "，不在线！");
        return;
    }
    //服务器推送消息给对方
    chatEndpoint.getSession().getBasicRemote().sendObject(chatSession);
}
```



## 微服务解决方案

> 在微服务项目中，通常都是一个服务部署多分，而websocket服务端向客户端推送消息都是使用session来完成的，这个对象不能够共享
>
> 我个人是使用redis的发布/订阅消息来解决的，消息队列同理：
>
> 各个微服务监听消息，收到消息后判断连接用户是否在自己这里，在的话就推送，不在就不做处理

### redis配置

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(connectionFactory);
        redisTemplate.setKeySerializer(RedisSerializer.string());
        redisTemplate.setValueSerializer(RedisSerializer.json());
        redisTemplate.setHashKeySerializer(RedisSerializer.string());
        redisTemplate.setHashValueSerializer(RedisSerializer.json());
        return redisTemplate;
    }

    @Bean
    public RedisMessageListenerContainer chatMessageListener(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer listenerContainer = new RedisMessageListenerContainer();
        listenerContainer.setConnectionFactory(connectionFactory);

        //如果不是注入到spring容器的方式，需要自己手动调用afterPropertiesSet
        ChatMessageListener chatMessageListener = new ChatMessageListener();
        chatMessageListener.afterPropertiesSet();

        listenerContainer.addMessageListener(chatMessageListener, ChannelTopic.of(CommonConstants.CHAT_CHANNEL));
        return listenerContainer;
    }
}
```

### 定义channel

```java
public interface CommonConstants {
    String CHAT_CHANNEL = "chat_channel";
    String CHAT_ONLINE_USER_KEY = "chat_online_user";
}
```

### 连接成功

```java
@OnOpen
public void onOpen(@PathParam("userName") String userName, Session session) throws IOException {
    this.userName = userName;
    this.session = session;
    CHAT_ENDPOINT_LIST.put(userName, this);
    //记录到redis
    redisTemplate.opsForSet().add(CommonConstants.CHAT_ONLINE_USER_KEY, userName);
    System.out.println(userName + "，已上线！");
}
```

### 退出连接

```java
@OnClose
public void onClose(Session session) throws IOException {
    System.out.println(this.userName + "，已下线！");
    redisTemplate.opsForSet().remove(CommonConstants.CHAT_ONLINE_USER_KEY, this.userName);
}
```

### 收到消息推送

```java
@OnMessage
public void onMessage(Session session, ChatSession chatSession) throws IOException, EncodeException {
    System.out.println("收到来至" + this.userName + "的消息：" + chatSession.getMessage());
    //存储会话
    chatSession.setCreateTime(LocalDateTime.now());
    chatSessionService.save(chatSession);

    ChatEndpoint chatEndpoint = CHAT_ENDPOINT_LIST.get(chatSession.getSendTo());
    if (chatEndpoint != null) {
        //在本服务上，直接推送
        chatEndpoint.getSession().getBasicRemote().sendObject(chatSession);
        return;
    }

    Boolean online = redisTemplate.opsForSet().isMember(CommonConstants.CHAT_ONLINE_USER_KEY, chatSession.getSendTo());
    if (!online) {
        System.out.println(chatSession.getSendTo() + "，不在线！");
        return;
    }
    //在线发布消息
    redisTemplate.convertAndSend(CommonConstants.CHAT_CHANNEL, chatSession);

}
```

### 监听redis处理

```java
public class ChatMessageListener extends MessageListenerAdapter {

    public void handleMessage(ChatSession chatSession) throws EncodeException, IOException {
        ChatEndpoint chatEndpoint = ChatEndpoint.get(chatSession.getSendTo());
        if (chatEndpoint != null) {
            chatEndpoint.getSession().getBasicRemote().sendObject(chatSession);
        }
    }
}
```

### 测试

1. 启动两个服务

   ![image-20210727142042174](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214539.png)

2. 修改前端，一个连接8080.一个连接8081

   ![image-20210727150410380](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216229.png)

3. 分别访问

   - http://localhost:8080/8080.html
   - http://localhost:8081/8081.html

4. 分别登录两个用户建立聊天

   ![image-20210727171558740](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217060.png)

   ![image-20210727171632515](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217898.png)

5. 结果

   ![image-20210727171759571](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218598.png)

   ![image-20210727171816147](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219214.png)
   
   

## Nginx自动断开问题

> 当使用nginx代理之后，发现websocket连接隔一段时间就会断开，这是nginx的代理机制导致的。可以参考官方文档配置代理测试
>
> [http://nginx.org/en/docs/http/websocket.html](http://nginx.org/en/docs/http/websocket.html)

修改`application.yml`配置项目访问路径

```yaml
server:
  port: ${PORT:8080}
  servlet:
    context-path: /ws
```

`nginx`配置文件，将`/ws`开头的都代理到本地8080端口

```nginx
upstream ws {
    server 127.0.0.1:8080;
}

server {
    listen       80;
    server_name  localhost;

    location / {
        root   html;
        index  index.html index.htm;
    }

    location /ws {
        proxy_pass http://ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 15s;
    }
}
```

修改前端连接地址

```js
new WebSocket("ws://127.0.0.1/ws/chat/" + this.loginUser)
```

重启测试，没过15秒就会端口wesocket连接，解决方案就是把时间设置长一点，还有就是加入ping-pong机制，每隔一段时间向服务器发送一条消息，保证连接不会断开，这里nginx配置的是15秒，那我们就在前端设置一个小于15秒的定时器，向服务器发送ping消息。这个可以自己定义格式，比如在json参数里加一个参数标识是一个ping消息。我这里为了方便就直接在前端使用`ArrayBuffer`类型消息，后端用`byteBuffer`类型接收

