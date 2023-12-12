# 初识Node

> 什么是 Node.js，众所周知 javascript 是在浏览器上运行的脚本语言，主要用来控制 html 元素，即 html dom 对象，是纯粹的 客户端语言。
> 那么要和服务端交互，就需要等待服务端的开发人员，而服务端开发又以 java 居多，对于不了解 java　语言的前端开发人员，有的时候就不得不干等着服务端准备好，很多时候，青春就在这样的尬等中消逝了。
> 那么于是就有人想，如果服务端也是用 javascript 开写的话，那么前端人员不是很容易也可以开发服务端的东西了吗？ 于是就有大佬开发了一个 v8 引擎，它在服务端运行 javascript 语言，在这个基础上再进行了一定的发展，就出现了可以在服务端运行的 javascript， 它就叫做 node.js 了。
> 可以把 node.js 简单的看成 javascript 写的 tomcat ...



## 优势

既然已经有了tomcat这样的基于 java 的服务器，为什么还要有 node.js 呢？

1. node.js 上的应用可以使用 javascript 开发，这样方便前端人员
2. . node.js 的 I/O 操作是非阻塞式的，比起 tomcat 这种 阻塞式 的更有优势



## 安装

Node.js 安装包及源码下载地址为：https://nodejs.org/en/download/

Node.js 历史版本下载地址：https://nodejs.org/dist/

!> **注意：**Linux 上安装 Node.js 需要安装 Python 2.6 或 2.7 ，不建议安装 Python 3.0 以上版本。



打开cmd窗口，在控制台输入 `node --version`，出现版本号，即表示安装成功了



## 创建第一个Web应用

在我们创建 Node.js 第一个 "Hello, World!" 应用前，让我们先了解下 Node.js 应用是由哪几部分组成的：

- **导入模块：**我们可以使用 **require** 指令来载入 Node.js 模块。
- **创建服务器：**服务器可以监听客户端的请求，类似于 Apache 、Nginx 等 HTTP 服务器。
- **接收请求与响应请求** 服务器很容易创建，客户端可以使用浏览器或终端发送 HTTP 请求，服务器接收请求后返回响应数据。



1. 首先创建一个js文件，我这里命名为`server.js`

   我们使用 **require** 指令来载入 http 模块，并将实例化的 HTTP 赋值给变量 http，实例如下:

   ```javascript
   var http = require("http");
   ```

2. 准备处理请求和响应的 service 函数，就像是 servlet 里的 doGet, doPost 方法。这个service函数做了两件事：

   ```javascript
   function service(request, response) {
       //设置返回代码200，以及返回格式为 text/plain
       response.writeHead(200, {'Content-Type': 'text/plain'});
       //返回内容是: Hello Node.js
       response.end('Hello Node.js');
   };
   ```

3. 创建服务器，基于service函数方法创建服务器，并使用 listen 方法绑定 8888 端口

   ```javascript
   //创建服务器，参数是处理请求的函数
   var server = http.createServer(service);
   //绑定端口
   server.listen(8888);
   ```

   

4. 运行，在server.js文件所在的目录下打开cmd窗口  <small>按住shift然后点击鼠标右键(在此处打开命令窗口) :smirk:</small> ，执行如下命令

   ```shell
   node server.js
   ```

   然后就可以打开浏览器访问 http://127.0.0.1:8888/ 测试了

### 获取GET请求内容

既然是web 服务器，那么总归要解决如何获取请求参数的问题，由于GET请求直接被嵌入在路径中，URL是完整的请求路径，包括了?后面的部分

```javascript
var http = require('http');

function service(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(req.url);
}

var server=http.createServer(service);
server.listen(8888);
```

访问：http://127.0.0.1:8888/?name=zhangsan&age=22&curentYear=2020

得到的结果是：

```
/?name=zhangsan&age=22&curentYear=2020
```

你可以手动解析后面的内容作为GET请求的参数。node.js 中 `url 模块`中的 `parse` 函数提供了这个功能。

```javascript
var http = require('http');
var url=require('url'); //引入url模块
var util=require('util') //引入util模块

function service(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	//解析url参数
	let param=url.parse(req.url,true);
	//该方法是一个将任意对象转换 为字符串的方法
	param=util.inspect(param);
	res.end(param);
}

var server=http.createServer(service);
server.listen(8888);
```

再次访问上面的链接，得到的结果是：

```javascript
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: '?name=zhangsan&age=22&curentYear=2020',
  query: [Object: null prototype] {
    name: 'zhangsan',
    age: '22',
    curentYear: '2020'
  },
  pathname: '/',
  path: '/?name=zhangsan&age=22&curentYear=2020',
  href: '/?name=zhangsan&age=22&curentYear=2020'
}
```

接着我们只需要获取url对象中query对象的即可拿到参数

```javascript
var http = require('http');
var url=require('url'); //引入url模块
var util=require('util') //引入util模块

function service(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
	//解析url参数
	let param=url.parse(req.url,true);
	param=param.query;
	for(k in param){
		res.write(k+"："+param[k]);
		res.write("\n");
	}
	res.end();
}

var server=http.createServer(service);
server.listen(8888);
```

得到的结果：

```
name：zhangsan
age：22
curentYear：2020
```



### 获取 POST 请求内容

POST 请求的内容全部的都在请求体中，http.ServerRequest 并没有一个属性内容为请求体，原因是等待请求体传输可能是一件耗时的工作。

比如上传文件，而很多时候我们可能并不需要理会请求体的内容，恶意的POST请求会大大消耗服务器的资源，所以 node.js 默认是不会解析请求体的，当你需要的时候，需要手动来做。

[post-param](../code/post-param.js ':include :type=code')