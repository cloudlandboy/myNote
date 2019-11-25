

# WebService入门

## 什么是WebService

​	Web service是一个[平台](http://baike.baidu.com/view/58664.htm)独立的，低耦合的，自包含的、基于可[编程](http://baike.baidu.com/view/3281.htm)的web的应用程序，可使用开放的[XML](http://baike.baidu.com/view/63.htm)（[标准通用标记语言](http://baike.baidu.com/view/5286041.htm)下的一个子集）[标准](http://baike.baidu.com/view/8079.htm)来[描述](http://baike.baidu.com/view/491264.htm)、发布、发现、协调和配置这些应用程序，用于开发分布式的互操作的[应用程序](http://baike.baidu.com/view/330120.htm)。

​	Web Service技术， 能使得运行在不同机器上的不同应用无须借助附加的、专门的第三方软件或硬件， 就可相互交换数据或集成。依据Web Service规范实施的应用之间， 无论它们所使用的语言、 平台或内部协议是什么， 都可以相互交换数据。Web Service是自描述、 自包含的可用网络模块， 可以执行具体的业务功能。Web Service也很容易部署， 因为它们基于一些常规的产业标准以及已有的一些技术，诸如[标准通用标记语言](http://baike.baidu.com/view/5286041.htm)下的子集[XML](http://baike.baidu.com/view/63.htm)、HTTP。Web Service减少了应用接口的花费。Web Service为整个企业甚至多个组织之间的业务流程的集成提供了一个通用机制。

![webservice](https://cdn.static.note.zzrfdsn.cn/images/201911101542.png)

## WebService的特点

- WebService通过HTTP POST方式接受客户的请求
- WebService与客户端之间一般使用SOAP协议传输XML数据
- 它本身就是为了跨平台或跨语言而设计的



## 调用网络上的WebService服务

http://webxml.com.cn/



## SOAP

Simple Object Access Protocol：简单对象访问协议

- SOAP作为一个基于XML语言的协议用于在网上传输数据。
- SOAP = 在HTTP的基础上+XML数据。
- SOAP是基于HTTP的。

SOAP的组成如下：

- Envelope – 必须的部分。以XML的根元素出现。
- Headers – 可选的。
- Body – 必须的。在body部分，包含要执行的服务器的方法。和发送到服务器的数据。

 

```xml
POST /WebServices/IpAddressSearchWebService.asmx HTTP/1.1
Host: ws.webxml.com.cn
Content-Type: text/xml; charset=utf-8
Content-Length: length
SOAPAction: "http://WebXml.com.cn/getCountryCityByIp"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getCountryCityByIp xmlns="http://WebXml.com.cn/">
      <theIpAddress>string</theIpAddress>
    </getCountryCityByIp>
  </soap:Body>
</soap:Envelope>
```



## WSDL 

Web Services Description Language：Web服务描述语言

​	就是一个xml文档，用于描述当前服务的一些信息（服务名称、服务的发布地址、服务提供的方法、方法的参数类型、方法的返回值类型等）



## 发布一个WebService服务



第一步：创建一个Java项目

第二步：创建一个类，加入Webservice注解

第三步：提供一个方法sayHello

第四步：在main方法中调用jdk提供的发布服务的方法

第五步：访问服务的wsdl文档（服务的发布地址+?wsdl）

```java
@WebService
public class Hello {
	public String sayHello(String name,int i){
		System.out.println("服务端的sayHello方法被调用了。。。。");
		return "helle" + name;
	}
	
	public static void main(String[] args) {
		String address = "http://192.168.115.87:8080/hello";
		Hello implementor = new Hello();
		Endpoint.publish(address, implementor);
	}
}
```



## 客户端调用

### jdk中wsimport命令使用

作用：解析wsdl文件，生成客户端本地代码

​	在JDK的bin文件夹中，有一个wsimport.exe工具，可依据wsdl文件生成相应的类文件，将生存在本地这些类文件拷贝到需要使用的项目中，就可以像调用本地的类一样调用webService提供的方法。该工具可以用于非Java的服务器，如用C#编写的WebService，通过wsimport则生成Java的客户端实现。

参数：

`-keep`：是否生成java源文件

`-d`：指定.class文件的输出目录

`-s`：指定.java文件的输出目录

`-p`：定义生成类的包名，不定义的话有默认包名

`-verbose`：在控制台显示输出信息

`-b`：指定jaxws/jaxb绑定文件或额外的schemas

`-extension`：使用扩展来支持SOAP1.2

例如：

```
wsimport -s /home/test/wsimport http://192.168.115.87:8080/hello?wsdl
```



1. 使用wsimport命令解析wsdl文件生成本地代码
2. 将生成的代码复制到项目中
3. 通过本地代码创建一个代理对象
4. 通过代理对象实现远程调用



```java
public class App {
	public static void main(String[] args) {
		HelloService ss = new HelloService();
		//创建客户端代理对象，用于远程调用
		HelloService proxy = ss.getHelloPort();
		String ret = proxy.sayHello("小明", 10);
		System.out.println(ret);
	}
}
```

