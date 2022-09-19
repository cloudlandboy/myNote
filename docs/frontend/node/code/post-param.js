var http=require("http");
var querystring=require("querystring");//引入 querystring 库，帮助解析用的
var util=require("util");

function service(req,res){
	// 定义了一个post变量，用于暂存请求体的信息
    var post = ''; 

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
	req.on('data',(chunk)=>{
		post+=chunk;
	})

	// 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
	req.on('end',()=>{
		post=querystring.parse(post);
		res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
		res.end(util.inspect(post));
	})
}

http.createServer(service).listen(8888);