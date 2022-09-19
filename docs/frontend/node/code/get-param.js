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