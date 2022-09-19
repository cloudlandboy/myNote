# 循环语句

> 此指令之值，必须使用特定语法 `v-for="alias in expression"`，为当前遍历的元素提供别名

```html
<ul>
    <li v-for="stu in students">{{stu}}</li>
</ul>
```



## 索引指定别名 (或对象key)

```html
<div v-for="(item, index) in items"></div>
<div v-for="(val, key) in object"></div>
<div v-for="(val, name, index) in object"></div>
```



## 纯数字遍历

```html
<span v-for="i in 10">{{i}}</span>
```

## 与v-if使用

!> 当和 `v-if` 一起使用时，`v-for` 的优先级比 `v-if` 更高



## 演示

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/v-for.html" height="650px"></iframe>

[v-for演示](../code/v-for.html ':include :type=code')