# 监听事件

## 基本格式

> `v-on:事件="处理函数名称"`

```html
<button v-on:click="HandlerFunction">点击</button>
```

## 缩写格式

> `@事件="处理函数名称"`

```html
<button @click="HandlerFunction">点击</button>
```

## 实例1

```html
<body>
	<div id="main">
		<button v-on:click="HandlerFunction">v-on:click="HandlerFunction"</button>
		<button v-on:click="HandlerFunction">@click="HandlerFunction"</button>
	</div>
	<script src="https://cdn.jsdelivr.net/npm/vue"></script>
	<script type="text/javascript">
		new Vue({
			el:'#main',
			data:{
				year:new Date().getFullYear()
			},
			methods:{
				HandlerFunction(){
					alert('当前是'+this.year+'年');
				}
			}
		})
	</script>
</body>
```

<iframe src="frontend/vue/code/Listen-events.html" frameborder="0" height="50"></iframe>

## 修饰符

> `@事件.修饰符="处理函数名称"`

- `.stop` - 调用 `event.stopPropagation()`，阻止冒泡事件。
- `.prevent` - 调用 `event.preventDefault()`，阻止默认事件。
- `.capture` - 添加事件侦听器时使用 capture 模式。
- `.self` - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
- `.{keyCode | keyAlias}` - 只当事件是从特定键触发时才触发回调。
- `.native` - 监听组件根元素的原生事件。
- `.once` - 只触发一次回调。
- `.left` - (2.2.0) 只当点击鼠标左键时触发。
- `.right` - (2.2.0) 只当点击鼠标右键时触发。
- `.middle` - (2.2.0) 只当点击鼠标中键时触发。
- `.passive` - (2.3.0) 以 `{ passive: true }` 模式添加侦听器

## 案例2

[点击查看](frontend/vue/code/Event-modifier.html ':ignore :target=_blank')