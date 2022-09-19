# NPM发布模块

## npmjs.com

所有npm都是发布在 https://www.npmjs.com/ 上面的，所以在发布之前，需要到 npmjs 上去注册一个账号，才有权限发布自己定义模块。

!> 注册后会收到一封电子邮件，需要验证之后才能够发布模块



## 新建项目

我这里创建的项目名是`clboy-npm-test`，在该文件夹下新建`say.js`

[say.js](../code/clboy-npm-test/say.js ':include :type=code')

创建模块，`package.json` 文件是必不可少的。我们可以使用 NPM 生成 package.json 文件

在该项目文件夹下打开cmd窗口，运行`npm init` 命令，然后就要填写一些信息，如果使用默认值直接按回车就好了，同意也可以使用`npm init -y`命令直接使用默认值，不再询问

## 登陆 npm

在发布之前需要登录npm，前面 npmjs.com 步骤时注册的账号和密码

使用`npm adduser` 命令登录

```shell
Username: clboy
Password:
Email: (this IS public) 617751303@qq.com
Logged in as clboy on https://registry.npmjs.org/.
```

## 发布

登录成功后就可以使用`npm publish` 命令发布模板了

如果你的邮箱没有验证就会出现下面发布失败的提示

![20200427174432.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212099.png)

## 测试

使用`npm search clboy` 命令就可以搜索到我发布的模块

首先`npm install clboy-npm-test` 安装模块，然后创建`index.js` 引入模块测试

[index.js ](../code/npm-published-test/index.js ':include :type=code')

![20200428161721.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212591.png)



## 淘宝 NPM 镜像

npm 命令用于从国外的服务器上下载别人做好的模块。 因为是在国外的服务器，有的时候网速会很受影响，其结果就是导致下载会非常卡顿。这里推荐使用淘宝 NPM 镜像。

淘宝 NPM 镜像是一个完整 npmjs.org 镜像，你可以用此代替官方版本(只读)，同步频率目前为 10分钟 一次以保证尽量与官方服务同步。

你可以使用淘宝定制的 cnpm (gzip 压缩支持) 命令行工具代替默认的 npm，这里的c 是 copy的意思，即复制 npm 上面的库。把npm 上面的库复制到 国内的服务器上，当需要用的时候，使用 cnpm 命令获取，就会快很多了

### 安装 cnpm

```shell
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

### 检查是否安装成功

`cnpm -v` 出现版本号就是安装成功



### cnpm 命令安装模块

```shell
cnpm install [name]
```



!> cnpm 本质上是复制库，它只负责从源库定期复制国内库，所以不支持通过 cnpm publish 发布到复制库上。
要发布，还是要通过 npm 发布到源库，然后耐心等待复制库同步。 （一般说来是十几分钟）