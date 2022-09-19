# 初识Node.js



## node.js 介绍

> 什么是 Node.js，众所周知 javascript 是在浏览器上运行的脚本语言，主要用来控制 html 元素，即 html dom 对象，是纯粹的 客户端语言。
> 那么要和服务端交互，就需要等待服务端的开发人员，而服务端开发又以 java 居多，对于不了解 java　语言的前端开发人员，有的时候就不得不干等着服务端准备好，很多时候，青春就在这样的尬等中消逝了。
> 那么于是就有人想，如果服务端也是用 javascript 开写的话，那么前端人员不是很容易也可以开发服务端的东西了吗？ 于是就有大佬开发了一个 v8 引擎，它在服务端运行 javascript 语言，在这个基础上再进行了一定的发展，就出现了可以在服务端运行的 javascript， 它就叫做 node.js 了。
> 可以把 node.js 简单的看成 javascript 写的 tomcat ...



## node.js 的优势

既然已经有了tomcat这样的基于 java 的服务器，为什么还要有 node.js 呢？

1. node.js 上的应用可以使用 javascript 开发，这样方便前端人员
2. . node.js 的 I/O 操作是非阻塞式的，比起 tomcat 这种 阻塞式 的更有优势



## Node.js 安装配置

### 下载安装包

Node.js 安装包及源码下载地址为：https://nodejs.org/en/download/

Node.js 历史版本下载地址：https://nodejs.org/dist/

!> **注意：**Linux 上安装 Node.js 需要安装 Python 2.6 或 2.7 ，不建议安装 Python 3.0 以上版本。

安装一直下一步下一步就行了



### 检验是否安装成功

打开cmd窗口，在控制台输入`node --version`，出现版本号，即表示安装成功了



## Node.js 创建第一个应用

在我们创建 Node.js 第一个 "Hello, World!" 应用前，让我们先了解下 Node.js 应用是由哪几部分组成的：

1. **引入 required 模块：**我们可以使用 **require** 指令来载入 Node.js 模块。
2. **创建服务器：**服务器可以监听客户端的请求，类似于 Apache 、Nginx 等 HTTP 服务器。
3. **接收请求与响应请求** 服务器很容易创建，客户端可以使用浏览器或终端发送 HTTP 请求，服务器接收请求后返回响应数据。



### 引入 required 模块

首先创建一个js文件，我这里命名为`server.js`

我们使用 **require** 指令来载入 http 模块，并将实例化的 HTTP 赋值给变量 http，实例如下:

```js
var http = require("http");
```

### 准备处理请求函数

准备处理请求和响应的 service 函数，就像是 servlet 里的 doGet, doPost 方法。
这个service函数做了两件事：

1. 设置返回代码200，以及返回格式为 text/plain
2. 返回内容是: Hello Node.js

```javascript
function service(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello Node.js');
};
```



### 创建服务器

接下来我们基于service函数方法创建服务器，并使用 listen 方法绑定 8888 端口。

```js
//创建服务器，参数是处理请求的函数
var server = http.createServer(service);
//绑定端口
server.listen(8888);
```



### 源代码

[node-1](../code/server.js ':include :type=code')

### 运行

在server.js文件所在的目录下打开cmd窗口  <small>按住shift然后点击鼠标右键(在此处打开命令窗口) :smirk:</small>

执行如下命令

```shell
node server.js
```

然后就可以打开浏览器访问 http://127.0.0.1:8888/ 测试了