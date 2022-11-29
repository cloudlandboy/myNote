# VUE入门

先聊一下前端开发模式的发展。

> 静态页面

最初的网页以HTML为主，是纯静态的网页。网页是只读的，信息流只能从服务端到客户端单向流通。**开发人员也只关心页面的样式和内容**即可。

> 异步刷新，操作DOM

1995年，网景工程师Brendan Eich 花了10天时间设计了JavaScript语言.

随着JavaScript的诞生，我们可以操作页面的DOM元素及样式，页面有了一些动态的效果，但是依然是以静态为主。

ajax盛行：

- 2005年开始，ajax逐渐被前端开发人员所重视，因为不用刷新页面就可以更新页面的数据和渲染效果。
- 此时的**开发人员不仅仅要编写HTML样式，还要懂ajax与后端交互，然后通过JS操作Dom元素来实现页面动态效果**。比较流行的框架如Jquery就是典型代表。

> MVVM，关注模型和视图

2008年，google的Chrome发布，随后就以极快的速度占领市场，超过IE成为浏览器市场的主导者。

2009年，Ryan Dahl在谷歌的Chrome V8引擎基础上，打造了基于事件循环的异步IO框架：Node.js。

- 基于事件循环的异步IO
- 单线程运行，避免多线程的变量同步问题
- JS可以编写后台代码，前后台统一编程语言 

node.js的伟大之处不在于让JS迈向了后端开发，而是构建了一个庞大的生态系统。

2010年，NPM作为node.js的包管理系统首次发布，开发人员可以遵循Common.js规范来编写Node.js模块，然后发布到NPM上供其他开发人员使用。目前已经是世界最大的包模块管理系统。

随后，在node的基础上，涌现出了一大批的前端框架：

 ![1525825983230](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212775.png)

> MVVM模式

- M：即Model，模型，包括数据和一些基本操作
- V：即View，视图，页面渲染结果
- VM：即View-Model，模型与视图间的双向操作（无需开发人员干涉）

在MVVM之前，开发人员从后端获取需要的数据模型，然后要通过DOM操作Model渲染到View中。而后当用户操作视图，我们还需要通过DOM获取View中的数据，然后同步到Model中。

而MVVM中的VM要做的事情就是把DOM操作完全封装起来，开发人员不用再关心Model和View之间是如何互相影响的：

- 只要我们Model发生了改变，View上自然就会表现出来。
- 当用户修改了View，Model中的数据也会跟着改变。

把开发人员从繁琐的DOM操作中解放出来，把关注点放在如何操作Model上。

 ![1525828854056](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213201.png)



而我们今天要学习的，就是一款MVVM模式的框架：Vue



## 认识Vue

Vue (读音 /vjuː/，类似于 **view**) 是一套用于构建用户界面的**渐进式框架**。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与[现代化的工具链](https://cn.vuejs.org/v2/guide/single-file-components.html)以及各种[支持类库](https://github.com/vuejs/awesome-vue#libraries--plugins)结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。

```
前端框架三巨头：Vue.js、React.js、AngularJS，vue.js以其轻量易用著称，vue.js和React.js发展速度最快，AngularJS还是老大。
```

官网：https://cn.vuejs.org/

参考：https://cn.vuejs.org/v2/guide/

![1525829249048](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214057.png)

Git地址：https://github.com/vuejs

![1525829030730](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213630.png)

**尤雨溪**，Vue.js 创作者，Vue Technology创始人，致力于Vue的研究开发。



## Node和NPM

NPM是Node提供的模块管理工具，可以非常方便的下载安装很多前端框架，包括Jquery、AngularJS、VueJs都有。为了后面学习方便，我们先安装node及NPM工具。

> 参考：[npm的简单使用](frontend/node/npm001 ':target=_blank')



## 切换镜像

npm默认的仓库地址是在国外网站，速度较慢，建议大家设置到淘宝镜像。但是切换镜像是比较麻烦的。推荐一款切换镜像的工具：nrm

我们首先安装nrm，这里`-g`代表全局安装。可能需要一点儿时间

安装成功后通过`nrm ls`命令查看npm的仓库列表,带`*`的就是当前选中的镜像仓库：

![1575088264294](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217014.png)



可以通过`nrm test 名称`来测试镜像源的速度，直接`nrm test`是测试所有的

通过`nrm use 名称`来指定要使用的镜像源：

![1575088869015](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217437.png)





## 安装vue

这里我们使用npm的方式

1. 创建一个空文件夹`vue-learning`，然后打开命令行进入该文件夹

2. 使用 `npm init -y` 进行初始化

3. 安装Vue，输入命令：`npm install vue`

   !>  **注意**，如果要安装的模块如果和当前文件夹名称一样会报错，比如vue-learning改名为vue，在执行**npm install vue**时就会报错

   ![1575089772721](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218224.png)

   

   然后就会在hello-vue目录发现一个node_modules目录，并且在下面有一个vue目录。

   node_modules是通过npm安装的所有模块的默认位置。



## vue入门案例

```html
<body>
    <body>
        <div id="app">
            <h2>xxx，非常帅！！！</h2>
        </div>
    </body>
</body>
```

h2中要输出一句话：xxx 非常帅。前面的xxx是要渲染的数据。



### vue声明式渲染

```html
<body>

    <body>
        <div id="app">
            <h2>{{name}}，非常帅！！！</h2>
        </div>
    </body>

    <!-- 引入vue -->
    <script src="node_modules/vue/dist/vue.js"></script>
    <script>
        // 创建vue实例
        var app = new Vue({
            el: "#app", // el即element，该vue实例要渲染的页面元素
            data: { // 渲染页面需要的数据
                name: "刘德华"
            }
        });
    </script>
</body>
```

- 首先通过 new Vue()来创建Vue实例
- 然后构造函数接收一个对象，对象中有一些属性：
  - el：是element的缩写，通过id选中要渲染的页面元素，本例中是一个div
  - data：数据，数据是一个对象，里面有很多属性，都可以渲染到视图中
    - name：这里我们指定了一个name属性
- 页面中的`h2`元素中，我们通过{{name}}的方式，来渲染刚刚定义的name属性。

打开页面查看效果：

![1575090556278](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218552.png)

更神奇的在于，当你修改name属性时，页面会跟着变化：

![1575090630698](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218872.png)



### 双向绑定

我们对刚才的案例进行简单修改：

```html
<body>

    <body>

        <div id="app">
            <!-- 可以修改num -->
            <input type="text" v-model="num">
            <h2> {{name}}，非常帅！！！有{{num}}位女神为他着迷。</h2>
        </div>
    </body>

    <!-- 引入vue -->
    <script src="node_modules/vue/dist/vue.js"></script>
    <script>
        // 创建vue实例
        var app = new Vue({
            el: "#app", // el即element，该vue实例要渲染的页面元素
            data: { // 渲染页面需要的数据
                name: "刘德华",
                num: 1
            }
        });
    </script>
</body>
```



![20191130182757](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222316.gif)



- 我们在data添加了新的属性：`num`
- 在页面中有一个`input`元素，通过`v-model`与`num`进行绑定。
- 同时通过`{{num}}`在页面输出

我们可以观察到，输入框的变化引起了data中的num的变化，同时页面输出也跟着变化。

- input与num绑定，input的value值变化，影响到了data中的num值
- 页面`{{num}}`与数据num绑定，因此num值变化，引起了页面效果变化。

没有任何dom操作，这就是双向绑定的魅力。



!> 注意，这个input要放在#app里面



### 浏览器插件的安装

- [获取Chrome扩展程序](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) (需要科学上网，不信你百度Google Helper)
- [获取Firefox插件](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)



!> 安装完重启浏览器



### 事件处理

我们在页面添加一个按钮，做到点击按钮时候让num自增1

```html
    <body>

        <div id="app">
            <!-- 可以修改num -->
            <p>
                    <input type="text" v-model="num">
            </p>
            <p>
                <button v-on:click="num++">是兄弟就来砍我</button>
            </p>
            <h2> {{name}}，非常帅！！！有{{num}}位女神为他着迷。</h2>
        </div>
    </body>
```



![20191130184347](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222595.gif)





## Vue实例

> 创建Vue实例

每个 Vue 应用都是通过用 `Vue` 函数创建一个新的 **Vue 实例**开始的：

```javascript
var vm = new Vue({
  // 选项
})
```

在构造函数中传入一个对象，并且在对象中声明各种Vue需要的数据和方法，包括：

- el
- data
- methods

等等

接下来我们一 一介绍。



## 模板或元素

每个Vue实例都需要关联一段Html模板，Vue会基于此模板进行视图渲染。

我们可以通过el属性来指定。

例如一段html模板：

```html
<div id="app">
    
</div>
```

然后创建Vue实例，关联这个div

```js
var vm = new Vue({
	el:"#app"
})
```

这样，Vue就可以基于id为`app`的div元素作为模板进行渲染了。在这个div范围以外的部分是无法使用vue特性的。



## 数据

当Vue实例被创建时，它会尝试获取在data中定义的所有属性，用于视图的渲染，并且监视data中的属性变化，当data发生改变，所有相关的视图都将重新渲染，这就是“响应式“系统。

html：

```html
<div id="app">
    <input type="text" v-model="name"/>
</div>
```

js:

```js
var vm = new Vue({
    el:"#app",
    data:{
        name:"刘德华"
    }
})
```

- name的变化会影响到`input`的值
- input中输入的值，也会导致vm中的name发生改变



## 方法和this

Vue实例中除了可以定义data属性，也可以定义方法，并且在Vue实例的作用范围内使用。

html：

```html
<div id="app">
            <!-- ..... -->
            <p>
                <button v-on:click="num++">是兄弟就来砍我</button>
                <button v-on:click="add">一刀999</button>
            </p>
            <h2> {{name}}，非常帅！！！有{{num}}位女神为他着迷。</h2>
</div>
```

js：

```js
        // 创建vue实例
        var app = new Vue({
            el: "#app", // el即element，该vue实例要渲染的页面元素
            data: { // 渲染页面需要的数据
                name: "刘德华",
                num: 1
            },
            methods: {
                add() {
                    this.num += 999;
                    console.log(this);
                }
            },
        });
```
![1575111368671](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219165.png)



## 生命周期钩子

### 生命周期

每个 Vue 实例在被创建时都要经过一系列的初始化过程 ：创建实例，装载模板，渲染模板等等。Vue为生命周期中的每个状态都设置了钩子函数（监听函数）。每当Vue实例处于不同的生命周期时，对应的函数就会被触发调用。

生命周期：

![Vue life cycle](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224870.png)

### 钩子函数

- `beforeCreated`：我们在用Vue时都要进行实例化，因此，该函数就是在Vue实例化时调用，也可以将他理解为初始化函数比较方便一点，在Vue1.0时，这个函数的名字就是init。 
- `created`：在创建实例之后进行调用。 
- `beforeMount`：页面加载完成，没有渲染。如：此时页面还是{{name}}
- `mounted`：我们可以将他理解为原生js中的window.onload=function({.,.}),或许大家也在用jquery，所以也可以理解为jquery中的$(document).ready(function(){….})，他的功能就是：在dom文档渲染完毕之后将要执行的函数，该函数在Vue1.0版本中名字为compiled。 此时页面中的{{name}}已被渲染成刘德华
- `beforeDestroy`：该函数将在销毁实例前进行调用 。
- `destroyed`：改函数将在销毁实例时进行调用。
- `beforeUpdate`：组件更新之前。
- `updated`：组件更新之后。



例如：created代表在vue实例创建后；

我们可以在Vue中定义一个created函数，代表这个时期的钩子函数：

```javascript
        // 创建vue实例
        var app = new Vue({
            el: "#app", // el即element，该vue实例要渲染的页面元素
            created() {
                this.num=520
            },
            data: { // 渲染页面需要的数据
                name: "刘德华",
                num: 1
            },
            methods: {
                add() {
                    this.num += 999;
                    console.log(this);
                }
            },
        });
```

刷新页面就是520，data中定义的1就会被覆盖



## 指令

什么是指令？

指令 (Directives) 是带有 `v-` 前缀的特殊特性。指令特性的预期值是：**单个 JavaScript 表达式**。指令的职责是，当表达式的值改变时，将其产生的连带影响，响应式地作用于 DOM。 

例如我们在入门案例中的v-on，代表绑定事件。

### 插值表达式

#### 花括号

> `{{表达式}}`



说明：

- 该表达式支持JS语法，可以调用js内置函数（必须有返回值）
- 表达式必须有返回结果。例如 1 + 1，没有结果的表达式不允许使用，如：`{{var a = 1 + 1}}`;
- 可以直接获取Vue实例中定义的数据或函数



html：

```html
<ul>
    <li>{{name}}</li>
    <li>{{getAge()}}</li>
    <!-- 
        错误的
        <li>{{var sex='男'}}</li> 
    -->
</ul>
```

js：

```javscript
// 创建vue实例
var app = new Vue({
    el: "#app", // el即element，该vue实例要渲染的页面元素
    created() {
        this.num = 520
    },
    data: { // 渲染页面需要的数据
        name: "刘德华",
        num: 1
    },
    methods: {
        add() {
            this.num += 999;
            console.log(this);
        },
        getAge() {
            return 2019 - 1961 + 1;
        }
    },
});
```

![1575113990082](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219447.png)

#### 插值闪烁现象

使用{{}}方式在网速较慢时会出现问题。在数据未加载完成时，页面会显示出原始的`{{}}`，加载完毕后才显示正确数据，我们称为插值闪烁。

我们将网速调慢一些，然后试试看刚才的案例：

![1529836021593](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215752.png)

刷新页面就会看到如下效果：

![20191130194250](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222881.gif)



#### v-text和v-html

使用v-text和v-html指令来替代`{{}}`

说明：

- v-text：将数据输出到元素内部，如果输出的数据有HTML代码，会作为普通文本输出
- v-html：将数据输出到元素内部，如果输出的数据有HTML代码，会被渲染

html：

```html
 <ul>
    <li v-text="hello"></li>
    <li v-html="hello"></li>
</ul>
```

js：

```javscript
data: { // 渲染页面需要的数据
    name: "刘德华",
    num: 1,
    hello:'<span style="color:red">hello,大家好！我是华仔</span>'
}
```

刷新页面，效果如下，并且不会出现插值闪烁，当没有数据时，会显示空白。

![20191130195120](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223175.gif)



### v-model

刚才的v-text和v-html可以看做是单向绑定，数据影响了视图渲染，但是反过来就不行。接下来学习的v-model是双向绑定，视图（View）和模型（Model）之间会互相影响。

既然是双向绑定，一定是在视图中可以修改数据，这样就限定了视图的元素类型。目前v-model的可使用元素有：

- input
- select
- textarea
- checkbox
- radio
- components（Vue中的自定义组件）

基本上除了最后一项，其它都是表单的输入项。



> checkbox案例

html：

```html
<div>
    <input type="checkbox" name="language" v-model="language" value="java">java
    <input type="checkbox" name="language" v-model="language" value="c++">c++
    <input type="checkbox" name="language" v-model="language" value="php">php
    <p>
        你选择了：{{language}}
    </p>
</div>
```

js：

```javascript
data: { // 渲染页面需要的数据
    name: "刘德华",
    num: 1,
    hello:'<span style="color:red">hello,大家好！我是华仔</span>',
    language:[]
},
```

效果：

![1575115507995](https://cdn.tencentfs.clboy.cn/images/2021/20210911203219725.png)

但是这样有中括号很不爽，别忘了`{{这里可以写表达式}}`，使用数组的join方法

```html
<p>
    你选择了：{{language.join('，')}}
</p>
```

![1575115628345](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220017.png)

### v-on

v-on指令用于给页面元素绑定事件。

> 语法：`v-on:事件名="js片段或函数名"`



#### 基本语法

前面我们已经写过了点击事件

```html
<p>
    <button v-on:click="num++">是兄弟就来砍我</button>
    <button v-on:click="add">一刀999</button>
</p>
```

另外，事件绑定可以简写，例如`v-on:click='add'`可以简写为`@click='add'`



#### 事件修饰符

在事件处理程序中调用 `event.preventDefault()` 或 `event.stopPropagation()` 是非常常见的需求。尽管我们可以在方法中轻松实现这点，但更好的方式是：方法只有纯粹的数据逻辑，而不是去处理 DOM 事件细节。

为了解决这个问题，Vue.js 为 `v-on` 提供了**事件修饰符**。修饰符是由点开头的指令后缀来表示的。

- `.stop` ：阻止事件冒泡到父元素
- `.prevent`：阻止默认事件发生*
- `.capture`：使用事件捕获模式
- `.self`：只有元素自身触发事件才执行。（冒泡或捕获的都不执行）
- `.once`：只执行一次

阻止默认事件，例如阻止浏览器默认的右键显示菜单事件



html：

```html
<div>
     <button @contextmenu.prevent="increment">添加一个菇凉</button>
     <button @contextmenu="decrement($event)">减少一个菇凉</button>
 </div>
```

js：

```javascript
methods: {
    add() {
        this.num += 999;
        console.log(this);
    },
    getAge() {
        return 2019 - 1961 + 1;
    },
    increment() {
        this.num++
    },
    decrement(event) {
        event.preventDefault();
        this.num--
    }
},
```



#### 按键修饰符

在监听键盘事件时，我们经常需要检查常见的键值。Vue 允许为 `v-on` 在监听键盘事件时添加按键修饰符：

```html
<p>
    <!-- 只有在 `keyCode` 是 13 时调用 `submit()` -->
    <input type="text" @keyup.13="submit($event)">
</p>
```

js：

```javascript
methods: {
    // ......
    submit(event){
        alert(event.target.value)
    }
},
```

记住所有的 `keyCode` 比较困难，所以 Vue 为最常用的按键提供了别名：

- `.enter`
- `.tab`
- `.delete` (捕获“删除”和“退格”键)
- `.esc`
- `.space`
- `.up`
- `.down`
- `.left`
- `.right`

例如上面的事件调用还可以这样写

```html
<input type="text" @keyup.enter="submit($event)">
```



#### 自定义按键修饰符别名

你还可以通过全局 `config.keyCodes` 对象[自定义按键修饰符别名](https://cn.vuejs.org/v2/api/#keyCodes)：

```
// 可以使用 `v-on:keyup.f1`
Vue.config.keyCodes.f1 = 112
```





### v-for

遍历数据渲染页面是非常常用的需求，Vue中通过v-for指令来实现。

#### 遍历数组

> 语法：

``` vue
v-for="item in items"
```

- items：要遍历的数组，需要在vue的data中定义好。
- item：迭代得到的数组元素的别名



> 案例

html：

```html
<div id="app">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <div class="container">
        <div class="row">
            <p
                style="text-align: center;font-size:28px;color:#FFF;background: linear-gradient(#FF7F00, #FF82AB);">
                <b>
                    <i>GODDESS</i>
                </b>
            </p>
            <!-- 遍历 -->
            <div class="col-md-3" v-for="user in goddess" style="text-align: center;">
                <p>
                    <img v-bind:src="user.image" style="vertical-align:text-bottom;" height="200" />
                </p>
                <p>
                    {{user.name}}
                </p>
                <p>
                    {{user.gender}}
                </p>
                <p>
                    {{user.age}}
                </p>
            </div>
        </div>
    </div>
</div>
```

<details>

<summary>js</summary>

```javascript
const year = new Date().getFullYear();
// 创建vue实例
var app = new Vue({
    el: "#app", // el即element，该vue实例要渲染的页面元素
    data: { // 渲染页面需要的数据
        name: "刘德华",
        num: 1,
        hello: '<span style="color:red">hello,大家好！我是华仔</span>',
        language: [],
        goddess: [
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/87863ad4c4d6e93a.jpg', name: '翁美玲', gender: '女', age: year - 1959 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeetTe.jpg', name: '蓝洁瑛', gender: '女', age: year - 1963 + 1 },
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/655f90ac240f8d26.jpg', name: '周慧敏', gender: '女', age: year - 1967 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeBlt.jpg', name: '关之琳', gender: '女', age: year - 1962 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeRYj.jpg', name: '邱淑贞', gender: '女', age: year - 1968 + 1 },
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/c889f7b09a6478ed.jpeg', name: '林青霞', gender: '女', age: year - 1954 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeTmT.jpg', name: '李若彤', gender: '女', age: year - 1967 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeerOf.jpg', name: '王祖贤', gender: '女', age: year - 1967 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeWfs.jpg', name: '张柏芝', gender: '女', age: year - 1980 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeecTg.jpg', name: '张曼玉', gender: '女', age: year - 1964 + 1 },
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/0821807f09267a9b.jpg', name: '蔡少芬', gender: '女', age: year - 1973 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qee560.jpg', name: '温碧霞', gender: '女', age: year - 1966 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeUFH.jpg', name: '万绮雯', gender: '女', age: year - 1970 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeaYd.jpg', name: '钟欣潼', gender: '女', age: year - 1981 + 1 },
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/32c501866339e345.png', name: '周秀娜', gender: '女', age: year - 1985 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qee4lq.jpg', name: '杨紫', gender: '女', age: year - 1992 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qee70U.png', name: '郑爽', gender: '女', age: year - 1991 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qee2kQ.jpg', name: '唐嫣', gender: '女', age: year - 1983 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeH7F.jpg', name: '佟丽娅', gender: '女', age: year - 1983 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeeIXV.jpg', name: '舒畅', gender: '女', age: year - 1987 + 1 },
                { image: 'https://ftp.bmp.ovh/imgs/2019/12/22c88e047a214210.jpg', name: '杨幂', gender: '女', age: year - 1986 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qeehpn.jpg', name: '刘亦菲', gender: '女', age: year - 1987 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/Qelv5T.jpg', name: '韩雪', gender: '女', age: year - 1983 + 1 },
                { image: 'https://s2.ax1x.com/2019/12/01/QeedfA.jpg', name: '宋祖儿', gender: '女', age: year - 1998 + 1 },
            ]
    }
});
```

</details>





#### 数组角标

在遍历的过程中，如果我们需要知道数组角标，可以指定第二个参数：

> 语法

``` vue
v-for="(item,index) in items"
```

- items：要迭代的数组
- item：迭代得到的数组元素别名
- index：迭代到的当前元素索引，从0开始。

例：

```html
  <!-- 遍历 -->
<div class="col-md-3" v-for="(user,index) in goddess" style="text-align: center;">
    <p>
        <img v-bind:src="user.image" style="vertical-align:text-bottom;" height="200" />
    </p>
    <p>
        - {{index+1}} -
    </p>

    <!-- ...... -->
</div>
```





效果：[遍历演示](frontend/vue/vfor.html ':ignore')



#### 遍历对象

v-for除了可以迭代数组，也可以迭代对象。语法基本类似

> 语法：

```javascript
v-for="value in object"
v-for="(value,key) in object"
v-for="(value,key,index) in object"
```

- 1个参数时，得到的是对象的属性值
- 2个参数时，第一个是属性值，第二个是属性名
- 3个参数时，第三个是索引，从0开始



#### key

当 Vue.js 用 `v-for` 正在更新已渲染过的元素列表时，它默认用“就地复用”策略。如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序， 而是简单复用此处每个元素，并且确保它在特定索引下显示已被渲染过的每个元素。 

这个功能可以有效的提高渲染的效率。

但是要实现这个功能，你需要给Vue一些提示，以便它能跟踪每个节点的身份，从而重用和重新排序现有元素，你需要为每项提供一个唯一 `key` 属性。理想的 `key` 值是每项都有的且唯一的 id。 

示例：

```html
<div class="col-md-3" v-for="(user,index) in goddess" :key=index style="text-align: center;" >
```

- 这里使用了一个特殊语法：`:key=""` 我们后面会讲到，它可以让你读取vue中的属性，并赋值给key属性
- 这里我们绑定的key是数组的索引，应该是唯一的



### v-if和v-show



v-if，顾名思义，条件判断。当得到结果为true时，所在的元素才会被渲染。

> 语法：`v-if="布尔表达式"`，`v-show="布尔表达式"`



html：

```html
 <button @click="isShow=!isShow">点击显示</button>
 <div v-if="isShow" style="background: red;">v-if</div>
 <div v-show="isShow" style="background: green;">v-show</div>
```

js：

```javascript
 data: { // 渲染页面需要的数据
     isShow: false
 },
```

![20191201181127](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223455.gif)



#### 与v-for结合

当v-if和v-for出现在一起时，v-for优先级更高。也就是说，会先遍历，再判断条件。

修改v-for中的案例，添加v-if：

```html
 <div class="col-md-3" v-if="user.age<35" v-for="(user,index) in goddess" style="text-align: center;">
```

这样就只有年龄小于35的女神才会显示



#### v-else和v-else-if

你可以使用 `v-else` 指令来表示 `v-if` 的“else 块”：

```html
<button @click="num=Math.random()">点击生成随机数</button>
<p>随机数：{{num}}</p>
<p v-if="num>0.75">大于0.75</p>
<p v-else-if="num>0.5">大于0.5</p>
<p v-else>小于0.5</p>
```

`v-else-if` 必须紧跟在带 `v-if` 或者 `v-else-if` 的元素之后。

`v-else` 元素也必须紧跟在带 `v-if` 或者 `v-else-if` 的元素的后面，否则它将不会被识别。

错误示例：

<del>

```html
<button @click="num=Math.random()">点击生成随机数</button>
<p>随机数：{{num}}</p>
<p v-if="num>0.75">大于0.75</p>
<hr>
<p v-else-if="num>0.5">大于0.5</p>
<p v-else>小于0.5</p>
```

</del>



### v-bind

html属性不能使用双大括号形式绑定，只能使用v-bind指令。

上面在遍历显示女神时，图片的src属性就用的是v-bind

```html
<img v-bind:src="user.image" style="vertical-align:text-bottom;" height="200" />
```



在将 `v-bind` 用于 `class` 和 `style` 时，Vue.js 做了专门的增强。表达式结果的类型除了字符串之外，还可以是对象或数组。 



#### 绑定class样式

> 数组语法

我们可以借助于`v-bind`指令来实现：

HTML：

```html
<div id="app">
    <div v-bind:class="activeClass"></div>
    <div v-bind:class="errorClass"></div>
    <div v-bind:class="[activeClass, errorClass]"></div>
</div>
<script src="./node_modules/vue/dist/vue.js"></script>
<script type="text/javascript">
    var app = new Vue({
        el: "#app",
        data: {
            activeClass: 'active',
            errorClass: ['text-danger', 'text-error']
        }
    })
</script>
```

渲染后的效果：

![1530026818515](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216182.png)



> 对象语法

我们可以传给 `v-bind:class` 一个对象，以动态地切换 class：

```html
<div v-bind:class="{ active: isActive }"></div>
```

上面的语法表示 `active` 这个 **class 存在与否将取决于数据属性 `isActive`** 的 [truthiness](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)（所有的值都是真实的，除了false,0,“”,null,undefined和NaN）。

你可以在对象中传入更多属性来动态切换多个 class。此外，`v-bind:class` 指令也可以与普通的 class 属性共存。如下模板:

```html
<div class="static" v-bind:class="{ active: isActive, 'text-danger': hasError }">
</div>
```

和如下 data：

```js
data: {
  isActive: true,
  hasError: false
}
```

结果渲染为：

```html
<div class="static active"></div>
```

active样式和text-danger样式的存在与否，取决于isActive和hasError的值。本例中isActive为true，hasError为false，所以active样式存在，text-danger不存在。



#### 绑定style样式

> 数组语法

数组语法可以将多个样式对象应用到同一个元素上： 

```html
<div v-bind:style="[baseStyles, overridingStyles]"></div>
```

数据：

```javascript
data: {
    baseStyles: {'background-color': 'red'},
    overridingStyles: {border: '1px solid black'}
}
```

渲染后的结果：

```html
<div style="background-color: red; border: 1px solid black;"></div>
```

> 对象语法

`v-bind:style` 的对象语法十分直观——看着非常像 CSS，但其实是一个 JavaScript 对象。CSS 属性名可以用驼峰式 (camelCase) 或短横线分隔 (kebab-case，记得用单引号括起来) 来命名： 

```html
<div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

数据：

```javascript
data: {
  activeColor: 'red',
  fontSize: 30
}
```

效果：

```html
<div style="color: red; font-size: 30px;"></div>
```



#### 简写

> 例

`v-bind:属性名`可以简写为`:属性名`



### 计算属性

在插值表达式中使用js表达式是非常方便的，而且也经常被用到。

但是如果表达式的内容很长，就会显得不够优雅，而且后期维护起来也不方便，例如下面的场景，我们有一个日期的数据，但是是毫秒值：

```js
data:{
    birthday:880905600000 // 毫秒值
}
```

我们在页面渲染，希望得到yyyy-MM-dd的样式：

```html
<h1>您的生日是：{{
    new Date(birthday).getFullYear() + '-'+ new Date(birthday).getMonth()+ '-' + new Date(birthday).getDay()
    }}
</h1>
```

虽然能得到结果，但是非常麻烦。

Vue中提供了计算属性，来替代复杂的表达式：

```javascript
var vm = new Vue({
    el:"#app",
    data:{
        birthday:880905600000 // 毫秒值
    },
    computed:{
        birth(){// 计算属性本质是一个方法，但是必须返回结果
            const d = new Date(this.birthday);
            return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDay();
        }
    }
})
```

html：

```html
<h2>计算属性</h2>
<p>生日为：{{birth}}</p>
```



我们可以将同一函数定义为一个方法而不是一个计算属性。两种方式的最终结果确实是完全相同的。然而，不同的是**计算属性是基于它们的依赖进行缓存的**。计算属性只有在它的相关依赖发生改变时才会重新求值。这就意味着只要`birthday`还没有发生改变，多次访问 `birthday` 计算属性会立即返回之前的计算结果，而不必再次执行函数。 



### watch

watch可以让我们监控一个值的变化。从而做出相应的反应。

示例：

```html
<div id="app">
    <input type="text" v-model="message">
</div>
<script src="./node_modules/vue/dist/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el:"#app",
        data:{
            message:""
        },
        watch:{
            message(newVal, oldVal){
                console.log(newVal, oldVal);
            }
        }
    })
</script>
```

效果

![20191201193624](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223741.gif)

## 组件化

在大型应用开发的时候，页面可以划分成很多部分。往往不同的页面，也会有相同的部分。例如可能会有相同的头部导航。

但是如果每个页面都独自开发，这无疑增加了我们开发的成本。所以我们会把页面的不同部分拆分成独立的组件，然后在不同页面就可以共享这些组件，避免重复开发。

在vue里，所有的vue实例都是组件



### 全局组件

我们通过Vue的component方法来定义一个全局组件。

我们创建`part.js`文件，文件内容：

```js
// 定义全局组件，两个参数：1，组件名称。2，组件参数
Vue.component("common", {
    template: `
        <button @click="add">点了我 {{count}} 次</button>
    `,
    data() {
        return {
            count: 0
        }
    },
    methods: {
        add() {
            this.count++
        }
    }
})
```

然后在页面引入该js，注意在引入vue的后面

```html
<!-- 引入vue -->
<script src="node_modules/vue/dist/vue.js"></script>
<script src="./part.js"></script>
```

使用定义好的全局组件，标签名就是定义的组件名

```html
<div id="app">
    <common></common>
</div>

```

- 组件其实也是一个Vue实例，因此它在定义时也会接收：data、methods、生命周期函数等
- 不同的是组件不会与页面的元素绑定，否则就无法复用了，因此没有el属性。
- 但是组件渲染需要html模板，所以增加了template属性，值就是HTML模板
- 全局组件定义完毕，任何vue实例都可以直接在HTML中通过组件名称来使用组件了。
- data必须是一个函数，不再是一个对象，在该函数中返回数据对象。



### 组件的复用

定义好的组件，可以任意复用多次：

```html
<div id="app">
    <common></common>
    <common></common>
    <common></common>
</div>
```

![20191201200145](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224047.gif)

你会发现每个组件互不干扰，都有自己的count值。怎么实现的？



> **组件的data属性必须是函数**！

当我们定义组件时，它的data 并不是像之前直接提供一个对象：

```js
data: {
  count: 0
}
```

取而代之的是，一个组件的 data 选项必须是一个函数，因此每个实例可以维护一份被返回对象的独立的拷贝：

```js
data: function () {
  return {
    count: 0
  }
}
```

如果 Vue 没有这条规则，点击一个按钮就会影响到其它所有实例！



### 局部组件

一旦全局注册，就意味着即便以后你不再使用这个组件，它依然会随着Vue的加载而加载。

因此，对于一些并不频繁使用的组件，我们会采用局部注册。

我们先在外部定义一个对象，结构与创建全局组件时传递的第二个参数一致

然后在Vue中使用它：

```javascript
    <script>
        const year = new Date().getFullYear();
        const localPart = {
            template: '<button @click="add">点了我 {{count}} 次</button>',
            data() {
                return {
                    count: 0
                }
            },
            methods: {
                add() {
                    this.count++
                }
            }
        };
        // 创建vue实例
        var app = new Vue({
            el: "#app", // el即element，该vue实例要渲染的页面元素
            components: {
                localPart: localPart // 将定义的对象注册为组件
            }
        });
```



- components就是当前vue对象子组件集合。
  - 其key就是子组件名称
  - 其值就是组件对象名
- 效果与刚才的全局注册是类似的，不同的是，这个组件只能在当前的Vue实例中使用



然后刷新页面，发现神么也没！！！

![9150e4e5gy1fygz1imng5j205905fwed](http://ww1.sinaimg.cn/large/9150e4e5gy1fygz1imng5j205905fwed.jpg)

来，我们F12试一试，看到了什么，我的P是大大的P，这个p是小p，原来是大小写的问题，html渲染时会转为小写

![1575202218857](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220319.png)

> 解决方法：使用驼峰命名

改标签

```html
<local-part></local-part>
```

或者直接改注册组件名

```javascript
components: {
    localpart: localPart // 将定义的对象注册为组件
}
```



### 注意事项

!> 组件模板(template)只能有一个顶级标签

> 错误示范：

<del>

```javascript
    template: `
            <button @click="add">点了我 {{count}} 次</button>
			<p>哈哈哈哈</p>
    `,
```

</del>

> 正确写法，使用一个标签包裹起来

```javascript
    template: `
			<div>
            	<button @click="add">点了我 {{count}} 次</button>
				<p>哈哈哈哈</p>
			</div>
    `,
```





## 组件通信

通常一个单页应用会以一棵嵌套的组件树的形式来组织：

![1525855149491](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214493.png)

- 页面首先分成了顶部导航、左侧内容区、右侧边栏三部分
- 左侧内容区又分为上下两个组件
- 右侧边栏中又包含了3个子组件

各个组件之间以嵌套的关系组合在一起，那么这个时候不可避免的会有组件间通信的需求。



### props（父向子传递）

1. 父组件使用子组件时，自定义属性（属性名任意，属性值为要传递的数据）
2. 子组件通过props接收父组件数据，通过自定义属性的属性名

> 例，修改开始的全局组件

在使用组件的时候给组件传递message参数

```html
<h2>全局组件</h2>
<common message="hello，my son！"></common>
<common></common>
<common></common>
```

!> HTML 中的特性名是大小写不敏感的，所以浏览器会把所有大写字符解释为小写字符。这意味着当你使用 DOM 中的模板时，camelCase (驼峰命名法) 的 prop(即当前的message) 名需要使用其等价的 kebab-case (短横线分隔命名) 命名



子组件中通过props来接收一个父组件传递的属性

```js
// 定义全局组件，两个参数：1，组件名称。2，组件参数
Vue.component("common", {
    template: `
            <div>
                <button @click="add">点了我 {{count}} 次</button>
                <p>{{message}}</p>
            </div>
    `,
    data() {
        return {
            count: 0
        }
    },
    methods: {
        add() {
            this.count++
        }
    },
    props:['message'] // 通过props来接收一个父组件传递的属性
})
```

效果：

![1575204773127](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220636.png)

### props验证

我们定义一个局部组件，并接收复杂数据：

```js
const userList = {
    template: `
        <ul>
            <li v-for="user in users" :key="user.id">{{ user.name }} : {{ user.age }}</li>
        </ul>`,
    props: {
        users: {
            type: Array,
            default: [],
            required: true
        }
    }
};
```

- 这个子组件可以对 items 进行迭代，并输出到页面。
- props：定义需要从父组件中接收的属性
  - users：是要接收的属性名称
    - type：限定父组件传递来的必须是数组
    - default：默认值
    - required：是否必须

**当 prop 验证失败的时候，(开发环境构建版本的) Vue 将会产生一个控制台的警告。** 

我们在父组件中使用它，我们把在学习 [v-for](#v-for)时定义的女神数组传过去：

```javascript
components: {
    localpart: localPart, // 将定义的对象注册为组件
    userList: userList
}
```

```html
<div id="app">
    <user-list :users="goddess"></user-list>
</div>
```



测试将参数改为非数组类型

```html
<user-list :users="name"></user-list>
```



`type` 可以是下列原生构造函数中的一个：

- `String`
- `Number`
- `Boolean`
- `Array`
- `Object`
- `Date`
- `Function`
- `Symbol`



### 动态静态传递

给 prop 传入一个静态的值： 

```html
<common message="大家好，我是华仔"/>
```

给 prop 传入一个动态的值： （通过v-bind从数据模型中，获取title的值）

```html
<common :message="name"/>
```

静态传递时，我们传入的值都是字符串类型的，但实际上**任何类型**的值都可以传给一个 props。 

```html
<!-- 即便 `42` 是静态的，我们仍然需要 `v-bind` 来告诉 Vue -->
<!-- 这是一个JavaScript表达式而不是一个字符串。-->
<local-part v-bind:likes="42"></local-part>

<!-- 用一个变量进行动态赋值。-->
<local-part v-bind:likes="post.likes"></local-part>
```



### 子向父的通信：$emit

来看这样的一个案例：

```html
<div id="app">
    <h2>num: {{num}}</h2>
    <!--使用子组件的时候，传递num到子组件中-->
    <test-part :num="num"></test-part>
</div>
<script src="./node_modules/vue/dist/vue.js"></script>
<script type="text/javascript">
        const testPart = {// 子组件，定义了两个按钮，点击数字num会加或减
        template: '\
        <div>\
            <button @click="num++">加</button>  \
            <button @click="num--">减</button>  \
        </div>',
        props: ['num']// count是从父组件获取的。
    };
    var app = new Vue({
        el:"#app",
        data:{
            num:520
        },
        components: {
            localpart: localPart, // 将定义的对象注册为组件
            userList: userList,
            testPart: testPart
        }
    })
</script>
```

- 子组件接收父组件的num属性
- 子组件定义点击按钮，点击后对num进行加或减操作

我们尝试运行，好像没问题，点击按钮试试：

![1575207152210](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220927.png)

子组件接收到父组件属性后，默认是不允许修改的。怎么办？

既然只有父组件能修改，那么加和减的操作一定是放在父组件：

```javascript
var app = new Vue({
    el:"#app",
    data:{
        num:520
    },
    methods:{ // 父组件中定义操作num的方法
        increment(){
            this.num++;
        },
        decrement(){
            this.num--;
        }
    }
})
```

但是，点击按钮是在子组件中，那就是说需要子组件来调用父组件的函数，怎么做？

我们可以**通过v-on指令将父组件的函数绑定到子组件**上：

```html
<!--使用子组件的时候，传递事件到子组件中-->
<test-part @sincr="increment" @sdecr="decrement"></test-part>
```

在子组件中定义函数，函数的具体实现调用父组件的实现，并在子组件中调用这些函数。当子组件中按钮被点击时，调用绑定的函数：

```javascript
const testPart = {// 子组件，定义了两个按钮，点击数字num会加或减
    template: '\
    <div>\
        <button @click="push">加</button>  \
        <button @click="reduce">减</button>  \
    </div>',
    props: ['num'],// count是从父组件获取的。
    methods: {
        push() {
            this.$emit('sincr');
        },
        reduce() {
            this.$emit('sdecr');
        },
    },
};
```

vue提供了一个内置的this.$emit()函数，用来调用父组件绑定的函数，可以传递参数

> this.$emit('函数名',参数......)

效果

![20191201215008](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224324.gif)

## 路由vue-router

### 场景模拟

现在我们来实现这样一个功能：

一个页面，包含登录和注册，点击不同按钮，实现登录和注册页切换：

### 编写父组件

为了让接下来的功能比较清晰，我们先新建一个文件夹：src

然后新建一个HTML文件，作为入口：index.html

![1575208614402](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221209.png)



然后编写页面的基本结构：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>vue路由</title>
</head>

<body>
    <div id="app">
        <span>登录</span>
        <span>注册</span>
        <hr />
        <div>
            登录页/注册页
        </div>
    </div>
    <script src="../node_modules/vue/dist/vue.js"></script>
    <script type="text/javascript">
        var vm = new Vue({
            el: "#app"
        })
    </script>
</body>

</html>
```

效果：

![1575208722360](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221493.png)

### 编写登录及注册组件

接下来我们来实现登录组件，以前我们都是写在一个文件中，但是为了复用性，开发中都会把组件放入独立的JS文件中，我们在src下新建一个user目录以及在下面创建login.js及register.js：

编写组件，这里我们只写模板，不写功能。

login.js内容如下：

```js
const loginForm = {
    template:'\
    <div>\
    <h2>登录页</h2> \
    用户名：<input type="text"><br/>\
    密&emsp;码：<input type="password"><br/>\
    </div>\
    '
}
```

register.js内容：

```js
const registerForm = {
    template:'\
    <div>\
    <h2>注册页</h2> \
    用&ensp;户&ensp;名：<input type="text"><br/>\
    密&emsp;&emsp;码：<input type="password"><br/>\
    确认密码：<input type="password"><br/>\
    </div>\
    '
}
```



### ensp和emsp

> `&ensp;`

它叫“半角空格”，全称是En Space，en是字体排印学的计量单位，为em宽度的一半。根据定义，它等同于字体度的一半（如16px字体中就是8px）。名义上是小写字母n的宽度。此空格传承空格家族一贯的特性：透明的，此空格有个相当稳健的特性，就是其占据的**宽度正好是1/2个中文宽度，而且基本上不受字体影响。**

> `&emsp;`

它叫“全角空格”，全称是Em Space，em是字体排印学的计量单位，相当于当前指定的点数。例如，1 em在16px的字体中就是16px。此空格也传承空格家族一贯的特性：透明的，此空格也有个相当稳健的特性，就是其占据的**宽度正好是1个中文宽度，而且基本上不受字体影响。**



然后在父组件(index.html)中引用

```html
<body>
    <div id="app">
        <span>登录</span>
        <span>注册</span>
        <hr />
        <div>
            <login-form></login-form>
            <register-form></register-form>
        </div>
    </div>
    <script src="../node_modules/vue/dist/vue.js"></script>
    <script src="./user/login.js"></script>
    <script src="./user/register.js"></script>
    <script type="text/javascript">
        var vm = new Vue({
            el: "#app",
            components: {
                loginForm: loginForm,
                registerForm: registerForm
            }
        })
    </script>
</body>
```

效果：

![1575209413553](https://cdn.tencentfs.clboy.cn/images/2021/20210911203221764.png)

>  问题

我们期待的是，当点击登录或注册按钮，分别显示登录页或注册页，而不是一起显示。

但是，如何才能动态加载组件，实现组件切换呢？

虽然使用原生的Html5和JS也能实现，但是官方推荐我们使用vue-router模块。



### vue-router简介和安装

使用vue-router和vue可以非常方便的实现 复杂单页应用的动态路由功能。

官网：https://router.vuejs.org/zh-cn/

使用npm安装：`npm install vue-router` 

 ![1575209505537](https://cdn.tencentfs.clboy.cn/images/2021/20210911203222043.png)

 

在index.html中引入依赖：

```html
<script src="../node_modules/vue/dist/vue.js"></script>
<script src="../node_modules/vue-router/dist/vue-router.js"></script>
```



### 快速入门

新建vue-router对象，并且指定路由规则：

```js
// 创建VueRouter对象
const router = new VueRouter({
    routes:[ // 编写路由规则
        {
            path:"/login", // 请求路径，以“/”开头
            component:loginForm // 组件名称
        },
        {
            path:"/register",
            component:registerForm
        }
    ]
})
```

- 创建VueRouter对象，并指定路由参数
- routes：路由规则的数组，可以指定多个对象，每个对象是一条路由规则，包含以下属性：
  - path：路由的路径
  - component：组件名称

在父组件中引入router对象：

```js
var vm = new Vue({
    el:"#app",
    components:{// 引用登录和注册组件
        loginForm,//键和值名称一样时，直接写一个就行
        registerForm
    },
    router // 引用上面定义的router对象
})
```



页面跳转控制：

```html
<div id="app">
    <!--router-link来指定跳转的路径-->
    <span><router-link to="/login">登录</router-link></span>
    <span><router-link to="/register">注册</router-link></span>
    <hr/>
    <div>
        <!--vue-router的锚点-->
        <router-view></router-view>
    </div>
</div>
```

- 通过`<router-view>`来指定一个锚点，当路由的路径匹配时，vue-router会自动把对应组件放到锚点位置进行渲染
- 通过`<router-link>`指定一个跳转链接，当点击时，会触发vue-router的路由功能，路径中的hash值会随之改变

效果：

![20191201222303](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224597.gif)

**注意**：单页应用中，页面的切换并不是页面的跳转。仅仅是地址最后的hash值变化。

事实上，我们总共就一个HTML：index.html 

 