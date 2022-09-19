# NPM安装模块

> 前面学习了模块，那么可以想想，有很多其他做好的模块，我们只要拿来用就可以了。
>
> 那么npm 是什么呢？就是用来下载别人的模块，和发布自己的模块用的工具。

NPM是随同NodeJS一起安装的包管理工具，能解决NodeJS代码部署上的很多问题，常见的使用场景有以下几种：

- 允许用户从NPM服务器下载别人编写的第三方包到本地使用。
- 允许用户从NPM服务器下载并安装别人编写的命令行程序到本地使用。
- 允许用户将自己编写的包或命令行程序上传到NPM服务器供别人使用。

由于新版的nodejs已经集成了npm，所以之前npm也一并安装好了。同样可以通过输入 **"npm -v"** 来测试是否成功安装。出现版本提示表示安装成功:



## 使用 npm 命令安装模块

> 语法：`npm install <Module Name>`

首先创建一个项目文件夹，我这里创建一个名为npmTest的文件夹，然后进入文件夹，在该文件夹打开cmd窗口

以下实例，我们使用 npm 命令安装`express`框架模块

```shell
npm install express
```



安装好之后，会生成一个`node_modules` 目录和`package-lock.json`文件  `express`包就放在了工程目录下的 `node_modules` 目录中，因此在代码中只需要通过 `require('express')` 的方式就好，无需指定第三方包路径。

```js
var express = require('express');
```

## 全局安装与本地安装

npm 的包安装分为本地安装（local）、全局安装（global）两种，从敲的命令行来看，差别只是有没有-g而已，比如

```shell
npm install express      # 本地安装
npm install express -g   # 全局安装
```

### 本地安装

1. 将安装包放在 ./node_modules 下（运行 npm 命令时所在的目录），如果没有 node_modules 目录，会在当前执行 npm 命令的目录下生成 node_modules 目录。
2. 可以通过 require() 来引入本地安装的包。

### 全局安装

1. 将安装包放在 /usr/local 下或者你 node 的安装目录。
2. 可以直接在命令行里使用。



## 查看所有全局安装的模块

```shell
npm list -g
```



## package.json

package.json 位于模块的目录下，用于定义包的属性。例如express 包的 package.json 文件，位于 node_modules/express/文件夹下

### Package.json 属性说明

- **name** - 包名。
- **version** - 包的版本号。
- **description** - 包的描述。
- **homepage** - 包的官网 url 。
- **author** - 包的作者姓名。
- **contributors** - 包的其他贡献者姓名。
- **dependencies** - 依赖包列表。如果依赖包没有安装，npm 会自动将依赖包安装在 node_module 目录下。
- **repository** - 包代码存放的地方的类型，可以是 git 或 svn，git 可在 Github 上。
- **main** - main 字段指定了程序的主入口文件，require('moduleName') 就会加载这个文件。这个字段的默认值是模块根目录下面的 index.js。
- **keywords** - 关键字



## 安装指定版本的模块

```shell
npm install <Module Name>@版本号
```



## 卸载模块

```shell
npm uninstall <Module Name>
```

卸载后，你可以到 /node_modules/ 目录下查看包是否还存在，或者使用以下命令查看：

```shell
$ npm ls
```

## 更新模块

```shell
$ npm update <Module Name>
```

## 搜索模块

```
$ npm search 名称
```

