# 双向绑定

> 把视图上的数据放到Vue对象上去
>
> 当input里面的值发生变化的时候，就会自动把变化后的值，绑定到Vue对象上去了

[官网教程](https://cn.vuejs.org/v2/guide/forms.html ':target=_blank')



## 修饰符

### .lazy

> 对于输入元素，默认的行为方式是一旦有数据变化，马上进行绑定。
> 但是加上.lazy之后，相当于监听change操作，只有在失去焦点的时候，才会进行数据绑定了

### .number

> 有时候，拿到了数据需要进行数学运算， 为了保证运算结果，必须先把类型转换为number类型，而v-model默认是string类型，所以就可以通过.number方式确保获取到的是数字类型了。

[.number](../code/two-way-binding.html ':include :type=code')

<iframe scrolling="0" frameborder="0" src="frontend/vue/code/two-way-binding.html" height="150px"></iframe>

### .trim

> trim 去掉前后的空白

