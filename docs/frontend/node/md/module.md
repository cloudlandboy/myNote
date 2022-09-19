# 模块系统

在node.js中，所谓的模块，就是别人写的 js，比如在前面教程中的 server.js 里引入 http模块,url模块



## 创建模块

首先创建一个`hello.js`

定义了两个函数

```js
function service(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    response.end('Hello Node.js');
}

function sayHello(){
	console.log('hello node.js');
}
```

但是，这两个函数并不能通过外部调用，除非通过 exports 指定如何去调用他们

Node.js 提供了 exports 和 require 两个对象，其中 exports 是模块公开的接口，require 用于从外部获取一个模块的接口，即所获取模块的 exports 对象。

```js
//允许外部通过 hi() 这个函数名称调用 sayHello() 这个函数
exports.hi = sayHello;
//允许外部通过 service() 同名调用
exports.service = service;
```

如此这般 hello 这个模块就准备好了



## 引用模块

在同一目录下创建`quote.js`文件， 使用`require('./hello')`引入了当前目录下的 hello.js 文件（./ 为当前目录，node.js 默认后缀为 js），如果不加上 `./` ,就会到 node安装目录下去寻找 ，是找不到滴。。。

[quote](../code/quote.js ':include :type=code')

<a href="frontend/node/code/hello.js" download="hello.js">hello.js</a> <a href="frontend/node/code/quote.js" download="quote.js">quote.js</a>

访问测试 http://127.0.0.1:8888/