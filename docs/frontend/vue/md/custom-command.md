# 自定义指令

> 像 v-if, v-bind, v-on 等等指令，都是 vus.js 自带的指令，那么除了这些指令，开发者还可以开发自定义的指令，比如 v-xxx 来做一些效果。

?> 例：使用 v-cbg这个指令，那么文字颜色就会变成粉红，背景就会变为黑色

## 自定义指令的方式：

1. 使用`Vue.directive(name,fn) `来自定义
2. 第一个参数就是 指令名称 xxx
3. el 表示当前的dom对象
4. 在方法体内就可以操控当前元素了

[custom-command](../code/custom-command.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/custom-command.html" height="60px"></iframe>



## 带参数的自定义指令

> binding.value就是参数值，如果指令需要多个值，可以传入一个 JavaScript 对象字面量。记住，指令函数能够接受所有合法的 JavaScript 表达式。

[custom-command-param](../code/custom-command-param.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/custom-command-param.html" height="120px"></iframe>

