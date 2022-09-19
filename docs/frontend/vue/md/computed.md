# 计算属性

> 把运算过程，放在computed里去，显示运算结果



## 不用 computed时

> 先看不用 computed ，直接在 {{}} 上运行，{{num*10}}

[no-computed](../code/no-computed.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/no-computed.html" height="100px"></iframe>



## 用computed时

> 如果运算过程比较复杂，那么维护起来就比较麻烦。
>
> 反转字符串:`{{str.split('').reverse().join('')}}`
>
> 所以可以把运算过程，都放在computed里去，只用显示运算结果就好了。

[computed](../code/computed.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/computed.html" height="80px"></iframe>



## 用methods

> methods 也能达到一样的效果，调用的时候，要加上括号 `{{ getReverseStr()}}`

[computed-methods](../code/computed-methods.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/computed-methods.html" height="80px"></iframe>



## computed 和 methods 的区别

computed 是有缓存的，只要字符串没有变化，reverseStr会直接返回以前计算出来的值，而不会再次计算。 这样如果是复杂计算，就会节约不少时间。而methods每次都会调用