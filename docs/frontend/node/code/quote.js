var http=require("http")
var hello=require("./hello")

//调用 hi() 函数，间接地就调用了hello.js 里的 sayHello()函数
hello.hi();

//基于hello.service() 函数创建服务
http.createServer(hello.service).listen(8888);