# 组件

[回顾](https://cloudlandboy.github.io/#/frontend/vue/start?id=%e7%bb%84%e4%bb%b6%e5%8c%96)

[官方文档](https://cn.vuejs.org/v2/guide/components-registration.html)

## 组件是什么

> 如下效果所示，每个产品展示，就是一个模板。 只用做一个模板，然后照着这个模板，传递不同的参数就可以看到不同的产品展示了
>

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-view.html" height="150px"></iframe>



## 局部组件

1. 在 Vue对象里增加 components

   ```javascript
   new Vue({
       el: '#main',
       components: {
           'product': {
               template: '<div class="product" >MAXFEEL休闲男士手包真皮</div>'
           }
       }
   })
   ```

   

2. 然后在视图里，通过如下方式就可以调用了

   ```html
   <product></product>
   ```

3. 如果想重复使用，则多写几次就行了

   ```html
   <product></product>
   <product></product>
   <product></product>
   ```



[component-local](../code/component-local.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-local.html" height="150px"></iframe>



## 全局组件

和vue.js 里的过滤器一样，有的组件会在不同页面使用，这个时候就可以考虑用全局组件。

```js
Vue.component('product', {
	  template: '<div class="product" >MAXFEEL休闲男士手包真皮手拿包</div>'
	})
```

[component-global](../code/component-global.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-global.html" height="150px"></iframe>



## 通过 Prop 向子组件传递数据

> Prop 是你可以在组件上注册的一些自定义 attribute。当一个值传递给一个 prop attribute 的时候，它就变成了那个组件实例的一个属性。我们可以用一个 `props` 选项将其包含在该组件可接受的 prop 列表中：

像前面的例子，产品名称都是固定的，这样肯定不行，所以就要能够传递参数给组件。

[component-global](../code/component-props.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-props.html" height="150px"></iframe>

!>   HTML 中的 attribute 名是大小写不敏感的，所以浏览器会把所有大写字符解释为小写字符。这意味着当你使用 DOM 中的模板时，camelCase (驼峰命名法) 的 prop 名需要使用其等价的 kebab-case (短横线分隔命名) 命名



## 动态参数

> 所谓的动态参数，就是指组件内的参数可以和组件外的值关联起来
>
> prop 可以通过 `v-bind` 动态赋值 [参考官方文档](https://cn.vuejs.org/v2/guide/components-props.html#%E4%BC%A0%E9%80%92%E9%9D%99%E6%80%81%E6%88%96%E5%8A%A8%E6%80%81-Prop)

[dynamic-param](../code/dynamic-param.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/dynamic-param.html" height="100px"></iframe>

## 自定义事件

> 增加自定义事件和在一个Vue对象上增加 methods 是一样的做法

[component-event](../code/component-event.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-event.html" height="200px"></iframe>



## 遍历 json 数组

> 大部分时候是拿到一个 json 数组，然后遍历这个 json 数组为多个组件实例。

[component-each](../code/component-each.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/component-each.html" height="180px"></iframe>

