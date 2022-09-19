const requestHandlers=require("./requestHandlers")
const router=require("../router_20200427/router")
const server=require("../router_20200427/server")

const handle={
	"/readFile":requestHandlers.readFile,
	"/writeFile":requestHandlers.writeFile
}

//启动服务
server.start(router.route,handle);