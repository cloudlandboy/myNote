var http=require("http");
var url=require("url");

function start(route,handle){

	function onRequest(request,response){
		let pathname=url.parse(request.url).pathname;
		console.log(pathname);
		let resContent=route(handle,pathname);
		response.writeHead(200,{"Content-Type":"text/plane;charset=utf-8"});
		response.write(resContent);
		response.end();
	}

	//调用start方法后就创建服务器，处理函数就是onRequest，监听端口为8888
	http.createServer(onRequest).listen(8888);
}

exports.start=start;