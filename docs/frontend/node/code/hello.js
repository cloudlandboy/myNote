function service(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    response.end('Hello Node.js');
}

function sayHello(){
	console.log('hello node.js');
}

//允许外部通过 hi() 这个函数名称调用 sayHello() 这个函数
exports.hi = sayHello;
//允许外部通过 service() 同名调用
exports.service = service;