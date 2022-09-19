# Springboot整合七牛云文件储存

> 官网文档：https://developer.qiniu.com/kodo/1644/security

## 上传和下载流程

![上传和下载流程](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247207)





## 文件上传

> 文件上传分为客户端上传（主要是指网页端和移动端等面向终端用户的场景）和服务端上传两种场景，客户端上传前需要先获取从服务端颁发的上传凭证，并在上传资源时将上传凭证包含为请求内容的一部分。不带凭证或带非法凭证的请求将返回 HTTP 错误码 401，代表认证失败。
>
> 服务端SDK在上传方面主要提供两种功能，一种是生成客户端上传所需要的上传凭证，另外一种是直接上传文件到云端





### 服务端文件上传

#### 项目搭建

1. 七牛云提供的javaSDK依赖

   ```xml
           <!-- 七牛云SDK依赖 -->
           <dependency>
               <groupId>com.qiniu</groupId>
               <artifactId>qiniu-java-sdk</artifactId>
               <version>[7.4.0, 7.4.99]</version>
           </dependency>
   
           <!--运行时使用 七牛云SDK中的依赖-->
           <dependency>
               <groupId>com.google.code.gson</groupId>
               <artifactId>gson</artifactId>
               <scope>provided</scope>
           </dependency>
   ```

2. 创建配置属性类，为了方便可以在`application.yaml` 修改配置

   ```java
   package cn.cbloy.demo.springboot.file.upload.qiniu.config;
   
   
   import com.qiniu.storage.Region;
   import com.qiniu.util.Json;
   import org.springframework.beans.factory.InitializingBean;
   import org.springframework.boot.context.properties.ConfigurationProperties;
   
   import java.util.HashMap;
   import java.util.Map;
   
   
   @ConfigurationProperties(prefix = "upload.qiniu")
   public class UploadProperties implements InitializingBean {
   
       public static final int DEFAULT_EXPIRESECONDS = 3600;
       /**
        * 七牛云 access key
        * 
        * 密钥管理中心获取：https://portal.qiniu.com/user/key
        * 
        */
       private String accessKey;
   
   
       /**
        * 七牛云 secret key
        * 
        * 密钥管理中心获取：https://portal.qiniu.com/user/key
        *
        */
       private String secretKey;
   
       /**
        * 七牛云 bucket
        * 需要先创建好
        */
       private String bucket;
   
       /**
        * 文件名前缀
        * 会被policy.saveKey和上传文件时指定的key所覆盖
        * 当policy.forceSaveKey为true时，必须设置prefix或者policy.saveKey（而选一），此时不会被key所覆盖
        */
       private String prefix;
   
       /**
        * 存储支空间所在的机房，可选值：
        * 华东，
        * 华北，
        * 华南，
        * 北美，
        * 东南亚
        */
       private String region;
   
       /**
        * 七牛云 域名
        */
       private String domain;
   
       /**
        * 凭证的有效时长，默认3600
        */
       private int expireSeconds = DEFAULT_EXPIRESECONDS;
   
       /**
        * 上传策略
        * 
        * 上传策略是资源上传时附带的一组配置设定。通过这组配置信息，七牛云存储可以了解用户上传的需求：它将上传什么资源，上传到哪个空间，上传结果是回调通知还是使用重定向跳转，是否需要设置反馈信息的内容，以及授权上传的截止时间等等。
        * 
        * 上传策略同时还参与请求验证，可以验证用户对某个资源的上传请求是否完整。
        * 
        * 见： https://developer.qiniu.com/kodo/1206/put-policy#save-key
        * 
        * scope和deadline无需配置，由程序根据bucket和expireSeconds生成。
        * 
        * 上传策略的ReturnBody和callbackBody字段内容中使用变量:
        * 
        * https://developer.qiniu.com/kodo/1235/vars#magicvar
        */
       private Map<String, Object> policy;
   
   
       /**
        * 区域名与获取 Region的方法名映射
        */
       private static Map<String, String> regionMap = new HashMap<>(7);
   
       static {
           regionMap.put("华东", "region0");
           regionMap.put("华北", "region1");
           regionMap.put("华南", "region2");
           regionMap.put("北美", "regionNa0");
           regionMap.put("东南亚", "regionAs0");
       }
   
       //...省略get，set方法
   
       static Region toRegionObj(String regionName) {
           Region region = null;
           try {
               String method = regionMap.get(regionName);
               region = (Region) (Region.class.getMethod(method).invoke(null));
           } catch (Exception e) {
               throw new RuntimeException("get region error!");
           }
           return region;
       }
   
       @Override
       public void afterPropertiesSet() throws Exception {
           Object returnBody = this.policy.get("returnBody");
   
           // 转为json字符串（必须，有的参数格式就要求是json格式字符串）
           if (returnBody instanceof Map) {
               this.policy.put("returnBody", Json.encode(returnBody));
           }
   
           //添加文件前缀
           if (this.prefix != null && !this.policy.containsKey("saveKey")) {
               this.policy.put("saveKey", this.prefix + "$(etag)");
           }
           //其他参数需要转的也在这里转...
   
       }
   }
   ```

3. 创建用于与七牛云服务交互，上传文件的client类

   ```java
   package cn.cbloy.demo.springboot.file.upload.qiniu.config;
   
   
   import com.qiniu.http.Response;
   import com.qiniu.storage.Configuration;
   import com.qiniu.storage.Region;
   import com.qiniu.storage.UploadManager;
   import com.qiniu.util.Auth;
   import com.qiniu.util.StringMap;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.context.properties.EnableConfigurationProperties;
   import org.springframework.stereotype.Component;
   
   import java.io.File;
   import java.io.FileInputStream;
   import java.io.IOException;
   import java.io.InputStream;
   
   /**
    * 用于上传的工具类
    */
   @Component
   @EnableConfigurationProperties(UploadProperties.class)
   public class UploadClient {
   
       private UploadProperties uploadProperties;
   
       private Auth auth;
   
       private StringMap policy;
   
       private UploadManager uploadManager;
   
   
       @Autowired
       public UploadClient(UploadProperties uploadProperties) {
           this.uploadProperties = uploadProperties;
           this.auth = Auth.create(uploadProperties.getAccessKey(), uploadProperties.getSecretKey());
           this.policy = new StringMap(uploadProperties.getPolicy());
           Region region = UploadProperties.toRegionObj(uploadProperties.getRegion());
           this.uploadManager = new UploadManager(new Configuration(region));
       }
   
       public String getUploadToken() {
           return this.getUploadToken(null);
       }
   
       /**
        * 表示只允许用户上传指定 key 的文件
        *
        * @param key
        * @return
        */
       public String getUploadToken(String key) {
           return this.auth.uploadToken(uploadProperties.getBucket(), key, uploadProperties.getExpireSeconds(), policy);
       }
   
       public Response uploadFile(File file) throws IOException {
           return this.uploadFile(new FileInputStream(file), null);
       }
   
       public Response uploadFile(File file, String key) throws IOException {
           return this.uploadFile(new FileInputStream(file), key);
       }
   
       public Response uploadFile(InputStream inputStream) throws IOException {
           return this.uploadFile(inputStream, null);
       }
   
       public Response uploadFile(InputStream inputStream, String key) throws IOException {
           return uploadManager.put(inputStream, key, this.getUploadToken(), null, null);
       }
   
       /**
        * 返回访问链接(域名+key)
        */
       public String getUrl(String key) {
           return this.uploadProperties.getDomain().concat(key);
       }
   
   }
   ```

4. application配置文件

   ```yaml
   server:
     port: 8080
   spring:
     application:
       name: demo-springboot-file-upload-qiniu
     servlet:
       multipart:
         max-file-size: 4MB #限制文件上传的大小
         max-request-size: 4MB #最大请求大小（默认10MB），当上传文件大小超过该值时会导致触发多次MaxUploadSizeExceededException
     mvc:
       hiddenmethod:
         filter:
           enabled: true #开启mvc的HiddenHttpMethodFilter，以便可以表单可以发送PUT、DELETE等请求
   upload:
     qiniu:
       access-key: 你的accessKey
       secret-key: 你的secretKey
       bucket: demo-bucket
       domain: https://qiniu.clboy.cn/
       region: 华南
       prefix: demo/test/
       policy:
         returnBody:
           key: $(key)
           hash: $(etag)
           bucket: $(bucket)
           fsize: $(fsize)
   ```

   

#### 单文件上传

> 上传单一的一个文件接口文档：https://developer.qiniu.com/kodo/1312/upload

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class UploadTest {

    @Autowired
    UploadClient uploadClient;

    @Test
    public void uploadFileTest() throws IOException {
        InputStream inputStream = new ClassPathResource("images/001.jpg").getInputStream();
        try {
            Response response = uploadClient.uploadFile(inputStream);
            boolean ok = response.isOK();
            System.out.println(ok);
            Map resBody = new Gson().fromJson(response.bodyString(), Map.class);
            System.out.println(resBody);
        } catch (QiniuException ex) {
            Response r = ex.response;
            System.err.println(r.toString());
            try {
                System.err.println(r.bodyString());
            } catch (QiniuException ex2) {
                //ignore
            }
        }
    }
}
```







### 客户端文件上传



#### 无回调

![无回调上传流程](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247395)

#### 有回调

![带回调的上传流程](https://cdn.tencentfs.clboy.cn/images/2021/20210911203247305)

## 源码





## 参考官网文档

> javaSDK：https://developer.qiniu.com/kodo/1239/java

