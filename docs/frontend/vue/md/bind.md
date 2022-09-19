# 属性绑定

## 基本格式

> `v-bind:属性="值"`

```html
<img v-bind:src="imageSrc">
```



## 缩写格式

> `:属性="值"`

```html
<img :src="imageSrc">
```



## 案例

[v-bind演示](../code/v-bind.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/v-bind.html" height="200px"></iframe>

## 动态属性名

```html
<input v-bind:[key]="value"/>
```

[v-bind演示](../code/v-bind-dynamic-attr.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/v-bind-dynamic-attr.html" height="50px"></iframe>



## 内联字符串拼接

```html
<img :src="'/path/to/images/' + fileName">
```



##  class 绑定

> {className:value},value返回true则添加对应className

```html
<div :class="{ red: isRed }"></div>
<div :class="[classA, classB]"></div>
<div :class="[classA, { classB: isB, classC: isC }]">
```

[v-bind-class](../code/v-bind-class.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/v-bind-class.html" height="200px"></iframe>

## style 绑定



## 绑定一个有属性的对象