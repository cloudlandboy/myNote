# 百度网盘配合油猴自动化解析下载



相信大家都有体会过百度网盘的下载速度，对于财大气粗或者不想麻烦的用户直接花几十块钱或者拼多多上拼个临时账号即可。但是对于我这种不经常使用网盘，只是偶尔下载一些学习资料的人来说只能使用一些技术手段来绕过限速了。哈哈，其实我就是不想掏钱 ~_~

上大学的时候有 [proxyee-down](https://github.com/proxyee-down-org/proxyee-down) 这个软件可以用，这个软件是真的好用，以至于每次无计可施的时候我都要去看一下它的主页，但是后面停止维护了。

后来也用过油猴脚本+idm、速盘，PanDownload之类的软件也都相继挂掉

那时候油猴脚本+idm可以多选文件下载，会直接打包成zip，速度直接拉满。不知道什么时候就不能用了。

不过，真的是道高一尺魔高一丈，现在又有了油猴脚本+aria2c的解决方案，但是好像都只能单个文件下载，当下载文件夹的时候还要自个儿一个一个去点击，浪费时间不说，这样重复性的行为，对于一个懒癌的程序员来说真的无法忍受，废话不多说，整个自动化脚本帮我去慢慢去点击吧，开干！

首先，语言选择node，你要问我为什么不用java，当然是占内存大啦，而且没js方便。至于Python、go语言我也不会呀！

自动化依赖模块就选择 [Puppeteer](https://zhaoqize.github.io/puppeteer-api-zh_CN)



## 控制自己的浏览器

首先我想到的就是自己在谷歌浏览器中安装好油猴插件，并且登录网盘，然后使用Puppeteer控制现有的浏览器去完成自动化

1. 手动启动谷歌浏览器并加上 `--remote-debugging-port=端口号` 参数开启远程调试

   ```shell
   # linux
   /opt/google/chrome --remote-debugging-port=9222
   # windows
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
   ```

   需要注意的，在使用远程调试模式启动浏览器之前不能有正在运行的谷歌浏览器，否则只会在当前浏览器中开一个窗口，远程调试参数不会生效，所以要事先关闭正在运行的浏览器，启动后在浏览器中访问 http://127.0.01:9222/json/versions

   如果有响应json则代表当前正在以远程调试模式运行。

   无法访问则需要打开任务管理器关闭所有谷歌浏览器相关的进程后再启动

   在windows上只关闭浏览器还是有后台进程在运行

2. 在node中调用刚在那个接口获取连接端点，然后使用Puppeteer进行连接

   ```javascript
   const axios = require('axios');
   const puppeteer = require('puppeteer-core');
   axios.get('http://127.0.01:9222/json/version').then(async res => {
       browser = await puppeteer.connect({
           browserWSEndpoint: res.data.webSocketDebuggerUrl,
           defaultViewport: null
       })
   })
   ```

3. 后面的步骤就是使用代码模拟人为，创建tab页->访问网盘页面地址->选中文件->根据油猴脚本步骤自动化点击，直到最后发送获取的aria2c下载连接到rpc服务，rpc我是使用的motrix软件，所以还要手动启动好motrix



后面我发现这样有点繁琐，每次都要自己去以debug模式运行谷歌浏览器，自己去启动motrix，还经常忘记关闭正在运行的浏览器再开启debug，导致每次都要重复执行好几次才能把程序跑起来。不如直接用脚本去查找有没有正在运行的进程，有的话直接kill掉，然后启动程序

为了兼容不同的操作系统，我从网上找到了 `find-process` 这个库来完成进程的查找工作，使用 `process` 模块的kill方法来杀死进程，最后调用 `child_process` 的exec方法启动浏览器和motrix

后面我又发现，如果把写好的程序发个别人用，他们的电脑上不一定安装的有motrix，于是我就想到把aria2的程序下载下来，然后直接启动aria2程序，同时使用网页端 [webui-aria2](https://github.com/ziahamza/webui-aria2) 项目来显示下载进度，最后将他们都和脚本一块打包就好了



## 控制内置浏览器

如果使用的是 `puppeteer` 完整模块，而不是 `puppeteer-core` 核心的话，在第一次安装依赖的时候会下载一个Chromium浏览器

当考虑到在一台没有安装chrome浏览器的电脑上跑自动化脚本时可以选择

但是这样浏览器就是一个新安装的，没有安装油猴扩展和脚本，而且不能访问外网的话还没办法在线安装，不过好在启动的时候可以通过命令行参数来让浏览器加载指定目录下的扩展。这样，就可以把 [tampermonkey](https://www.tampermonkey.net/) 也下载下来打包进去

```javascript
const browser = await puppeteer.launch({
    args: ['--load-extension=' + path.join(__dirname, "program/tampermonkey_stable"],
    userDataDir: path.join(__dirname, 'browser-data'),
    headless: false,
    defaultViewport: null,
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
})
```

这样就可以在启动后使用 puppeteer 去控制浏览器安装脚本



## 源代码

https://github.com/cloudlandboy/baidu-pan-batch-aria2-down
