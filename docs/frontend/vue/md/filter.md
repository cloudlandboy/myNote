# 过滤器

> Vue.js 允许你自定义过滤器，可被用于一些常见的文本格式化。过滤器可以用在两个地方：**双花括号插值和 `v-bind` 表达式** (后者从 2.1.0+ 开始支持)。过滤器应该被添加在 JavaScript 表达式的尾部，由“管道”符号指示

```html
<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 `v-bind` 中 -->
<div v-bind:id="rawId | formatId"></div>
```



## 一个过滤器

定义一个 **首字母大写** 过滤器

[one-filter](../code/one-filter.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/one-filter.html" height="80px"></iframe>

## 多个过滤器

定义两个过滤器，分别是**首字母大写**和**尾字母大写**

[multiple-filter](../code/multiple-filter.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/multiple-filter.html" height="80px"></iframe>

## 全局过滤器

> 在上面的例子里可以看到，过滤器是定义在Vue对象里的。 但是有时候，很多不同的页面都会用到相同的过滤器，如果每个Vue对象里都重复开发相同的过滤器，不仅开发量增加，维护负担也增加了。
> 所以就可以通过全局过滤器的方式，只定义一次过滤器，然后就可以在不同的Vue对象里使用了

参考[官方文档](https://cn.vuejs.org/v2/api/#Vue-filter)