# docsify文档加密解密

> docsify是一个静态网站生成器，可以利用它将写好的Markdown文件在运行时转换成html显示在网站上
>
> 关于如何使用可以看[官方文档](https://docsify.js.org) 简单明了



1. 我们可以使用这个工具将写好的笔记、API文档提交到github，利用github pages搭建静态站点。这样对于没有特殊需求(比如SEO)的用户来说省下了一笔购买服务器的钱，而且还能随时随地查看笔记。
2. 现在我想有个文档发布上去，但是我不想所有人都可以看到内容。也就是给文档内容加密，只有输入正确密码解密后才能查看原文，这样即使别人查看github上的源码也不知道真实内容

下面就来实现一下，对文档进行加密，然后在 `docsify` 动态解析 `Markdown` 时判断文档是否是加密的文档，对于非加密文档直接解析成 `html`渲染即可，对于加密文档就弹出提示框，待输入解密密钥后对内容解密再进行渲染，错误的密钥因解密失败自然无法查看原文。这里我使用对称加密 `DES`算法进行加密解密



## 不看实现，只看代码

[点击这里](#封装插件)




## 约定

不管是否加密的内容，对于 `docsify` 来说都是普通文本，现在需要制定一个标准，让其在解析时知道拿到的文本到底是不是已经加密过的

标准制定：`加密标识.加密算法(加密后内容)`

- 加密标识：一个有标识性的单词，我这里使用 `ENCRYPTED`
- 加密算法：`DES` `AES` 等等，我这里使用 `DES`

最终约定：`ENCRYPTED.DES(加密后内容)`

例如正常文档内容：

```markdown
# docsify文档加密解密

> docsify是一个静态网站生成器，可以利用它将写好的Markdown文件在运行时转换成html显示在网站上
>
> 关于如何使用可以看[官方文档](https://docsify.js.org) 简单明了
```

然后使用DES工具对内容加密

![image-20220825093718150](https://cdn.tencentfs.clboy.cn/images/2022/20220827160840037.png)

最后将文档改为加密后的

```markdown
ENCRYPTED.DES(U2FsdGVkX19wTf+nuhMjn3eFF9FtxfmEwmCf/eDSwU5jHo4RPq5sBXDdxzI1oTdE0wcIXYpaYN/iutm9nrk7NH07daM9tP1A1dxNl0/c1D2YftFPyqKP43fAHGVZ8U+YZNkuhODU9n4Vrk3yXxBvW7H6SeLj/71xHNHb9kxVSKHdLp/vDSHwcsq7QvGhV5n+DFqq2+qJ6xOlf4BOOfKU/o6oJmyDjxyG4po0OsQKmV1omuS5NGb0rpJBe2buC392j53xtIB3a6joQVZ3oq/oKrdY/kArUOQY5ZwInsn9DQqQBBA8HY63XXqWH1fMN8Lalx3qoZV51sDQDpMNLQl8Rg==)
```



## docsify插件

> 该插件每次开始解析 Markdown 内容时调用
>
> 获取文档内容使用正则表达式判断内容是否与 `加密约定` 匹配

解密使用的是 [crypto-js](https://github.com/brix/crypto-js) ，需要在页面引入该库

```javascript
window.$docsify = {
  plugins: [
    function (hook, vm) {
      hook.beforeEach(function (content) {
        //格式：ENCRYPTED.加密方式(加密内容)
        let matchResult = content.match(/ENCRYPTED\.(\w+)\((\S+)\)/);
        if (matchResult) {
          //等待访问者输入密钥返回解密后的内容
          return inputSecretKeydecryptContent(matchResult[1], matchResult[2]);
        }
        return content;
      });
    }
  ]
}


/**
 * @description: 等待用户输入密钥后使用指定算法解密
 * @param {string} algorithm 算法
 * @param {string} content 文档内容
 * @return {string} 解密后文档内容
 */
function inputSecretKeydecryptContent(algorithm, content) {
    if (!CryptoJS[algorithm]) {
        return "# 不支持的加密算法 `~_~`";
    }
    let secretKey = prompt('请输入密钥：');
    try {
        return CryptoJS[algorithm].decrypt(content, secretKey).toString(CryptoJS.enc.Utf8);
    } catch (err) {
        return "# 解密失败 `~_~`";
    }
}
```

这样每次重新加载页面时只有输入正确密钥才能看到真实内容

![image-20220825114646526](https://cdn.tencentfs.clboy.cn/images/2022/20220827160948691.png)



## markdown链接加锁图标

现在我想将侧边栏或者页面上的链接对于加密的文档加上一个锁的图标，类似下面这样：

- **clboy的文档**

  

  - [这是一个加密的文档 :lock:](https://www.clboy.cn)
  - [XXX](https://www.clboy.cn)

最简单的方法是给链接文本加上一个 `markdown` 锁的表情符号 `:lock:`

```markdown
[这是一个加密的文档 :lock:](https://www.clboy.cn)
```

但是我不这样做，我采用在 `markdown` 超链接标题中添加特殊标记：`:encrypted` ，在解析时动态添加这个表情图标

```markdown
[账号密码](pwd.md ':encrypted')
```

```javascript
    window.$docsify = {
      markdown: function (marked, renderer) {
        const normalLink = renderer.link;
        renderer.link = function (href, title, text) {
          if (':encrypted' === title) {
            //侧边栏加锁图标
            let html = normalLink(href, '', text);
            return html.substring(0, html.length - 4) + ' <img class="emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/1f512.png" alt="100">' + '</a>'
          }
          return normalLink(href, title, text);
        }
        marked.use({ renderer });
        return marked
      }
    }
```

这样做的好处就是某天我不想要这个加锁的图标了，我只需要把这段 `js` 删除即可，不需要去改所有的文件



## 封装插件

为了方便使用，可以将上面的代码全部写入到一个单独的 `js` 中，在使用时引入即可，取消只需剔除引入

[docsify-decrypt-content.js](https://github.com/cloudlandboy/javaScript-utils/tree/master/docsify-decrypt-content-plugin)

```html
/*
 * @Author: clboy syl@clboy.cn
 * @Date: 2022-08-24 17:30:55
 * @LastEditors: clboy syl@clboy.cn
 * @LastEditTime: 2022-08-25 12:30:29
 * @Description: docsify document content encryption plugin
 * 
 * Copyright (c) 2022 by clboy syl@clboy.cn, All Rights Reserved. 
 */

(function () {
    //依赖https://github.com/brix/crypto-js
    if (!window.$docsify || !window.CryptoJS) {
        return;
    }

    /**
     * @description: 等待用户输入密钥后使用指定算法解密
     * @param {string} algorithm 算法
     * @param {string} content 文档内容
     * @return {string} 解密后文档内容
     */
    function inputSecretKeydecryptContent(algorithm, content) {
        if (!CryptoJS[algorithm]) {
            return "# 不支持的加密算法 `~_~`";
        }
        let secretKey = prompt('请输入密钥：');
        try {
            return CryptoJS[algorithm].decrypt(content, secretKey).toString(CryptoJS.enc.Utf8);
        } catch (err) {
            return "# 解密失败 `~_~`";
        }
    }

    const beforeEachHook = function (hook, vm) {
        hook.beforeEach(function (content) {
            //格式：ENCRYPTED.加密方式(加密内容)
            let matchResult = content.match(/ENCRYPTED\.(\w+)\((\S+)\)/);
            if (matchResult) {
                return inputSecretKeydecryptContent(matchResult[1], matchResult[2]);
            }
            return content;
        });
    }

    const linkLockIconMarkdown = function (marked, renderer) {
        const normalLink = renderer.link;
        renderer.link = function (href, title, text) {
            if (':encrypted' === title) {
                //侧边栏加锁图标
                let html = normalLink(href, '', text);
                return html.substring(0, html.length - 4) + ' <img class="emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/1f512.png" alt="100">' + '</a>'
            }
            return normalLink(href, title, text);
        }
        marked.use({ renderer });
        return marked
    }
    window.$docsify.plugins = [beforeEachHook].concat(window.$docsify.plugins || []);
    window.$docsify.markdown = window.$docsify.markdown ? function (marked, renderer) {
        marked = window.$docsify.markdown(marked, renderer);
        return linkLockIconMarkdown(marked, renderer);
    } : linkLockIconMarkdown;
})();
```

```html
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'clboy document',
      repo: '',
      loadSidebar: true,
      subMaxLevel: 6
    }
  </script>

  <script src="./static/js/docsify@4.js"></script>
  <script src="./static/js/crypto-js.min.js"></script>
  <script src="./static/js/docsify-decrypt-content.js"></script>
</body>
```

