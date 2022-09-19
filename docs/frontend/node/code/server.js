//引入http模块
var http=require("http");
//处理请求函数
function service(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello Node.js');
};
//创建服务器，参数是处理请求的函数
var server = http.createServer(service);
//绑定端口
server.listen(8888);
