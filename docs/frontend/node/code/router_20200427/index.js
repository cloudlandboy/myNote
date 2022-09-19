const requestHandlers=require("./requestHandlers")
const router=require("./router")
const server=require("./server")

const handle={
	"/listCategory":requestHandlers.listCategory,
	"/listProduct":requestHandlers.listProduct
}

//启动服务
server.start(router.route,handle);