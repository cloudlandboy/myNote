# 文件操作

> Node.js 文件系统（fs 模块）



## 准备测试用的文件

<a href="frontend/node/code/file_20200427/20200427.txt" download="20200427.txt">测试用的文件</a>



## 异步和同步

Node.js 文件系统（fs 模块）模块中的方法均有异步和同步版本，例如读取文件内容的函数有异步的 fs.readFile() 和同步的 fs.readFileSync()。

异步的方法函数最后一个参数为回调函数，回调函数的第一个参数包含了错误信息(error)。

建议大家使用异步方法，比起同步，异步方法性能更高，速度更快，而且没有阻塞。



## 同步读写文件

创建业务处理模块 `requestHandlers.js`

[requestHandlers.js](../code/file_20200427/requestHandlers.js ':include :type=code')

?> `router.js` 和 `server.js` 均和上节一样

主模块index.js

[index.js](../code/file_20200427/index.js ':include :type=code')

**测试**

- 读取文件：http://localhost:8888/readFile
- 写入文件：http://localhost:8888/writeFile