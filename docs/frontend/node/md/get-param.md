# 获取参数

> 既然是web 服务器，那么总归要解决如何获取请求参数的问题



## 获取GET请求内容

由于GET请求直接被嵌入在路径中，URL是完整的请求路径，包括了?后面的部分

```js
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

```txt
/?name=zhangsan&age=22&curentYear=2020
```



> 你可以手动解析后面的内容作为GET请求的参数。node.js 中 `url 模块`中的 `parse` 函数提供了这个功能。

```js
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

```txt
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

```js
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

<a href="frontend/node/code/get-param.js" download="get-param.js">源代码</a>

得到的结果：

```txt
name：zhangsan
age：22
curentYear：2020
```



## 获取 POST 请求内容

POST 请求的内容全部的都在请求体中，http.ServerRequest 并没有一个属性内容为请求体，原因是等待请求体传输可能是一件耗时的工作。

比如上传文件，而很多时候我们可能并不需要理会请求体的内容，恶意的POST请求会大大消耗服务器的资源，所以 node.js 默认是不会解析请求体的，当你需要的时候，需要手动来做。

[post-param](../code/post-param.js ':include :type=code')

<a href="frontend/node/code/post-param.js" download="post-param.js">源代码</a>

<iframe scrolling="0" frameborder="0" src="frontend/node/code/post-param-form.html" height="180px"></iframe>