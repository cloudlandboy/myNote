# Node.js 路由



## 出现的问题

首先回顾一下前面 server.js 的代码， 这个代码很清爽，也很容易维护。 但是当业务开始略微复杂的时候，怎么办呢？
比如业务上需要通过访问 /listCategory 显示所有的分类，又需要通过访问 /listProduct 显示所有的产品，那么仅仅通过一个 service(request, response) 方法来进行维护不是很麻烦吗
所以在这个时候，就会引入路由的概念了。



## 路由概念

如果没有路由的概念，那么无论是访问/listCategory路径 还是访问 /listProduct 路径，都是在service(request,response) 函数里做的。

那么引入路由的概念的话，就是指访问 /listCategory 路径，会访问 listCategory函数。 而访问 /listProduct 路径，就会访问 listProduct 函数，这样子维护起来就容易多了。



## 路由代码实现

为了达到路由效果，需要多个模块协同配合达到这个效果。 所谓的多个模块，其实就是多个.js文件里的多个函数互相配合。

### 业务处理模块

创建`requestHandlers.js`，提供 listCategory函数和listProduct()函数

[requestHandlers](../code/router_20200427/requestHandlers.js ':include :type=code')

### 路由模块

创建`router.js`

!> 这里如果看不懂就直接往后看到最后就明白了，如果还是不明白可以结合[菜鸟教程](https://www.runoob.com/nodejs/nodejs-router.html)学习

router函数第一个参数 handle 是一个json对象，第二个参数是访问路径。

示例：`handle={"访问路径":"访问该路径时调用的处理函数"}`

[router](../code/router_20200427/router.js ':include :type=code')

### 服务器模块

创建`server.js`

[server](../code/router_20200427/server.js ':include :type=code')

### 入口主模块

与以往启动使用 server.js不同，带路由功能，一般都会通过 index.js 启动，所以index.js 就是入口模块。
handle 映射了不同的访问路径与 业务处理模块对应函数的对应关系。

[index](../code/router_20200427/index.js ':include :type=code')

然后分别访问 http://localhost:8888/listCategory 和 http://localhost:8888/listProduct

<a href="frontend/node/code/router_20200427.zip" download="node_router">源代码</a>



## 思路整理

1. 通过如下方式启动服务器

   ```shell
   node index.js
   ```

2. index.js 调用了 server.start 函数，并且传递了 router.js 里route 函数和handle作为参数

3.  serverl.js 通过了8888端口启动了服务。 然后用 onRequest 函数来处理业务

4. 当有请求进来的时候就会触发执行onRequest 函数

5. 首先解析获取请求的路径，然后调用router.js中的route方法，将映射关系和请求路径传递过去

6. route方法根据请求路径在映射关系中找到该请求路径对应的处理函数然后调用

7. 通过以上的方式，就落实在了 requestHandlers.js 的业务代码上面了

8. 最后在 serverl.js中将结果返回给页面


虽然看上去略复杂，但是以后如果要开发新的功能，比如 /listUser, 那么就只需要新增加 listUser 函数，并在 index.js 中对他进行映射即可了。