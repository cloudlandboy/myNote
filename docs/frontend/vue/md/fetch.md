# fetch.js

> 与XMLHttpRequest(XHR)类似，fetch()方法允许你发出AJAX请求。区别在于Fetch API使用Promise，因此是一种简洁明了的API，比XMLHttpRequest更加简单易用。

[官方网站](https://github.github.io/fetch/)



## 使用fetch语法

```js
Promise<Response> fetch(url,[init]);
```

fetch接受两个参数，`url`和`init`，其中`url`参数是必须的，而`init`参数是可选的。

`url`参数是一个字符串，表示请求的url地址，

`init`是一个对象，在里面可以对这个请求进行配置，例如设置请求方法，设置请求头等，如果不传入`init`参数，将会采用默认的配置，[可选参数参考](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowOrWorkerGlobalScope/fetch#%E5%8F%82%E6%95%B0)

## 返回值

一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/API/Promise)，resolve 时回传 [`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response) 对象

## 通过fetch获取数据案例

[fetch](../code/fetch.html ':include  :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/fetch.html" height="400px"></iframe>