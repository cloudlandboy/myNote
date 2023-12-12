# ES6



## 什么是ECMAScript？

来看下前端的发展历程：

> web1.0时代：

- 最初的网页以HTML为主，是纯静态的网页。网页是只读的，信息流只能从服务的到客户端单向流通。**开发人员也只关心页面的样式和内容** 即可。

> web2.0时代：

- 1995年，网景工程师Brendan Eich 花了10天时间设计了JavaScript语言。
- 1996年，微软发布了JScript，其实是JavaScript的逆向工程实现。
- 1997年，为了统一各种不同script脚本语言，ECMA（欧洲计算机制造商协会）以JavaScript为基础，制定了 `ECMAscript` 标准规范。JavaScript和JScript都是`ECMAScript` 的标准实现者，随后各大浏览器厂商纷纷实现了 `ECMAScript` 标准。

所以，ECMAScript是浏览器脚本语言的规范，而各种我们熟知的js语言，如JavaScript则是规范的具体实现。

## ECMAScript的快速发展

而后，ECMAScript就进入了快速发展期。

- 1998年6月，ECMAScript 2.0 发布。

- 1999年12月，ECMAScript 3.0 发布。这时，ECMAScript 规范本身也相对比较完善和稳定了，但是接下来的事情，就比较悲剧了。

- 2007年10月。。。。ECMAScript 4.0 草案发布。

  这次的新规范，历时颇久，规范的新内容也有了很多争议。在制定ES4的时候，是分成了两个工作组同时工作的。

  - 一边是以 Adobe, Mozilla, Opera 和 Google为主的 ECMAScript 4.0 工作组。
  - 一边是以 Microsoft 和 Yahoo 为主的 ECMAScript 3.1 工作组。

  ECMAScript 4 的很多主张比较激进，改动较大。而 ECMAScript 3.1 则主张小幅更新。最终经过 TC39 的会议，决定将一部分不那么激进的改动保留发布为 ECMAScript 3.1，而ES4的内容，则延续到了后来的ECMAScript5和6版本中

- 2009年12月，ECMAScript 5 发布。

- 2011年6月，ECMAScript 5.1 发布。

- 2015年6月，ECMAScript 6，也就是 ECMAScript 2015 发布了。 并且从 ECMAScript 6 开始，开始采用年号来做版本。即 ECMAScript 2015，就是ECMAScript6。 它的目标，是使得 JavaScript 语言可以用来编写复杂的大型应用程序，成为企业级开发语言。



## ES5和6的一些新特性

之前，js定义变量只有一个关键字：`var`

`var` 有一个问题，就是定义的变量有时会莫名奇妙的成为全局变量。

例如这样的一段代码：

```js
for(var i = 0; i < 5; i++){
    console.log(i);
}
console.log("循环外：" + i)
```

你猜下打印的结果是什么？

![1529376275020](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215844.png)



### let关键字

`let` 所声明的变量，只在 `let` 命令所在的代码块内有效。

我们把刚才的`var`改成`let`试试：

```js
for(let i = 0; i < 5; i++){
    console.log(i);
}
console.log("循环外：" + i)
```

结果：

![1529395660265](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216277.png)



### const关键字

`const` 声明的变量是常量，不能被修改

![1529420270814](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216685.png)



### 字符串模板

ES6中提供了 <code>`</code> 来作为字符串模板标记。我们可以这么玩：

 ![1526108070980](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211894.png)

在两个 <code>`</code> 之间的部分都会被作为字符串的值，不管你任意换行，甚至加入js脚本



### 解构表达式

> 数组解构

比如有一个数组：

```js
let arr = [1,2,3]
```

我想获取其中的值，只能通过角标。ES6可以这样：

```js
const [x,y,z] = arr;// x，y，z将与arr中的每个位置对应来取值
// 然后打印
console.log(x,y,z);
```

结果：

 ![1526109778368](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212399.png)



> 对象解构

例如有个person对象：

```js
const person = {
    name:"jack",
    age:21,
    language: ['java','js','css']
}
```

我们可以这么做：

```js
// 解构表达式获取值
const {name,age,language} = person;
// 打印
console.log(name);
console.log(age);
console.log(language);
```

结果：

 ![1526109984544](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212866.png)



如过想要用其它变量接收，需要额外指定别名：

 ![1526110159450](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213295.png)

`{name:n}`：name是person中的属性名，冒号后面的n是解构后要赋值给的变量。



### 函数优化

#### 函数参数默认值

在ES6以前，我们无法给一个函数参数设置默认值，只能采用变通写法：

```js
    function add(a , b) {
        // 判断b是否为空，为空就给默认值1
        b = b || 1;
        return a + b;
    }
    // 传一个参数
    console.log(add(10));
```

现在可以这么写：

```js
function add(a , b = 1) {
    return a + b;
}
// 传一个参数
console.log(add(10));
```



#### 箭头函数

ES6中定义函数的简写方式：

一个参数时：

```js
var print = function (obj) {
    console.log(obj);
}
// 简写为：
var print2 = obj => console.log(obj);
```

多个参数：

```js
// 两个参数的情况：
var sum = function (a , b) {
    return a + b;
}
// 简写为：
var sum2 = (a,b) => a+b;
```

代码不止一行，可以用`{}`括起来

```js
var sum3 = (a,b) => {
    return a + b;
}
```



#### 对象的函数属性简写

比如一个Person对象，里面有eat方法：

```js
let person = {
    name: "jack",
    // 以前：
    eat: function (food) {
        console.log(this.name + "在吃" + food);
    },
    // 箭头函数版：
    eat2: food => console.log(person.name + "在吃" + food),// 这里不能用this，见下图
    // 简写版：
    eat3(food){
        console.log(this.name + "在吃" + food);
    }
}
```

![1575031909233](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217529.png)

#### 箭头函数结合解构表达式

比如有一个函数：

```js
const person = {
    name:"jack",
    age:21,
    language: ['java','js','css']
}

function hello(person) {
    console.log("hello," + person.name)
}
```

如果用箭头函数和解构表达式

```js
var hi = ({name}) =>  console.log("hello," + name);
```

![1575032036154](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217943.png)



### 字符串新增方法

ES6为字符串扩展了几个新的API：

- `includes(str)` ：返回布尔值，表示是否找到了参数字符串。
- `startsWith(str)` ：返回布尔值，表示参数字符串是否在原字符串的头部。
- `endsWith(str)` ：返回布尔值，表示参数字符串是否在原字符串的尾部。
- [MDN-JavaScript-String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)



### 对象新增方法

ES6给Object拓展了许多新的方法，如：

- keys(obj)：获取对象的所有key形成的数组
- values(obj)：获取对象的所有value形成的数组
- entries(obj)：获取对象的所有key和value形成的二维数组。格式：`[[k1,v1],[k2,v2],...]`
- assign(dest, ...src) ：将多个src对象的值 拷贝到 dest中（浅拷贝）。
- [MDN-JavaScript-Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)



### 数组新增方法

ES6给数组新增了许多方法：

- find(callback)：数组实例的find方法，用于找出第一个符合条件的数组成员。它的参数是一个回调函数，所有数组成员依次执行该回调函数，直到找出第一个返回值为true的成员，然后返回该成员。如果没有符合条件的成员，则返回undefined。 
- findIndex(callback)：数组实例的findIndex方法的用法与find方法非常类似，返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1。 
- includes(数组元素)：与find类似，如果匹配到元素，则返回true，代表找到了。
- [MDN-JavaScript-Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)



## 模块化

在 ES6 模块化规范诞生之前，JavaScript 社区已经尝试并提出了 AMD、CMD、CommonJS 等模块化规范。

但是，这些由社区提出的模块化标准，还是存在一定的差异性与局限性、并不是浏览器与服务器通用的模块化
标准，例如：

- `AMD` 和 `CMD` 适用于 **浏览器端** 的 Javascript 模块化
-  `CommonJS` 适用于 **服务器端** 的 Javascript 模块化

太多的模块化规范给开发者增加了学习的难度与开发的成本。因此，大一统的 ES6 模块化规范诞生了！

ES6 模块化规范是浏览器端与服务器端通用的模块化开发规范。它的出现极大的降低了前端开发者的模块化学
习成本，开发者不需再额外学习 AMD、CMD 或 CommonJS 等模块化规范。

ES6 模块化规范中定义：

- 每个 js 文件都是一个独立的模块
-  导入其它模块成员使用 `import` 关键字
-  向外共享模块成员使用 `export` 关键字



### node.js中使用ES6 模块化

node.js 中默认仅支持 CommonJS 模块化规范，若想基于 node.js 体验与学习 ES6 的模块化语法，可以按照
如下两个步骤进行配置：

1. 确保安装了 `v14.15.1` 或更高版本的 node.js
2. 在 package.json 的根节点中添加 `"type": "module"` 节点



### 基本语法

ES6 的模块化主要包含如下 3 种用法：

- `默认导出` 与 `默认导入`
- `按需导出` 与 `按需导入`
- 直接导入并执行模块中的代码



### 默认导出

语法：`export default 默认导出的成员`

```javascript
//定义模块私有成员 n1
let n1 = 10

//定义模块私有成员n2（外界访问不到n2，因为它没有被共享出去)
let n2 = 20

//定义模块私有方法show
function show() {}

//使用默认导出语法，向外共享 n1 和 show 两个成员
export default {
  n1,
  show
}
```



!> 每个模块中，只能有一个默认导出，`export default` 语法只能在模块中使用一次，否则会报错！

!> 因为`export default `命令其实只是输出一个叫做 `default` 的变量所以它后面不能跟变量声明语句

```javascript
export default const f1 = 'xxx'; //SyntaxError: Unexpected token 'const'
```



### 默认导入

语法：`import 接收变量名 from '模块标识符'`

```javascript
//从同级目录下的 m1.js 模块中默认导入其向外共享的成员,并使用 m1 变量进行接收
import m1 from './m1.js"
console.log(m1)
```



?> 默认导入时的接收名称可以任意名称，只要是合法的变量名即可



### 按需导出

语法：`export 按需导出的成员`

```javascript
//向外按需导出变量 s1
export let s1 = 'aaa';
//向外按需导出变量 s2
export let s2 = 'bbb';
//向外按需导出方法 say
export function say(){
    console.log('hello');
}
```



### 按需导入

语法：`import { 模块导出的变量名,s2 } from '模块标识符'` ，类似与解构语法

```javascript
import { s1, S2, say } from './m2.js"
console.log(s1); //echo aaa
console.log(s2); //echo bbb
console.log(say); //echo [Function: say]
```

按需导入时，可以使用 `as` 关键字进行重命名

```javascript
import { s1 as echoA,say as sayHello } from './m2.js"
console.log(echoA); //echo aaa
sayHello();
```

按需导入可以和默认导入一起使用

**导出**

```javascript
//向外按需导出变量 s1
export let s1 = 'aaa';
//向外按需导出变量 s2
export let s2 = 'bbb';

//向外默认导出s3
const s3 = 'ccc';
export default s3;
```

**导入**

```javascript
import s3,{ s1, s2 as echoB, say } from './m3.js'

console.log(s3); //echo ccc
console.log(s1); //echo aaa
```



### 仅执行模块中的代码

如果只想单纯地执行某个模块中的代码，并不需要得到模块中向外共享的成员。此时，可以直接导入并执行模块代码

**脚本**

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync } from "fs";

//输出当前脚本所在目录下的所有文件名
const __dirname = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(__dirname, { encoding: 'utf8' });
files.forEach(f => console.log(f));
```

**导入执行**

```javascript
//直接导入并执行模块代码，不需要得到模块向外共享的成员
import './m4.js'
console.log('666');
```



## 回调地狱

多层回调函数的相互嵌套，就形成了回调地狱

```javascript
setTimeout(() => {

    console.log("1000");

    setTimeout(() => {

        console.log("2000");

        setTimeout(() => {

            console.log("3000");

        }, 3000);

    }, 2000);

}, 1000);
```

回调地狱的缺点:

- 代码耦合性太强，难以维护
- 大量冗余的代码相互嵌套，代码的可读性变差

为了解决回调地狱的问题，ES6（ECMAScript 2015）中新增了 Promise 的概念



## Promise

- Promise 是一个构造函数
  - 我们可以创建 Promise 的实例 `const p = new Promise()`
  - new 出来的 Promise 实例对象，代表一个异步操作
- Promise.prototype 上包含一个 .then() 方法
  - 每一次 `new Promise()` 构造函数得到的实例对象，都可以通过原型链的方式访问到 `.then()` 方法
  - `.then()` 方法用来预先指定成功和失败的回调函数
  - `p.then(成功的回调函数，失败的回调函数)`
  - 调用 `.then()` 方法时，成功的回调函数是必选的、失败的回调函数是可选的

如果想要创建具体的异步操作，则需要在 new Promise() 构造函数期间，传递一个 function 函数，将具体的
异步操作定义到 function 函数内部

### Promise构造函数

`Promise` 构造函数接受一个函数作为参数，该函数的两个参数分别是 `resolve` 和 `reject` 

- `resolve` ：将 `Promise` 对象的状态从 未完成 变为 成功，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去

  ```javascript
  resolve(结果);
  ```

- `reject` ：将 `Promise` 对象的状态从 未完成 变为 失败，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

  ```javascript
  reject(参数);
  ```

用Promise对回调地域进行改造

```javascript
function waitForTimeout(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(timeout);
        }, timeout);
    })
}

waitForTimeout(1000).then((result1) => {
    console.log(result1);
    waitForTimeout(2000).then(result2 => {
        console.log(result2);
        waitForTimeout(3000).then(result3 => {
            console.log(result3);
        });
    })
})
```

但是这样依然是一层层的嵌套啊，别慌！

### promise.then()

如果 `then`方法返回的是一个新的 `Promise` 实例（注意，不是原来那个`Promise`实例）就可以采用链式写法，即 `then` 方法后面再调用另一个 `then` 方法

```javascript
waitForTimeout(1000).then((res) => {
    console.log(res);
    return waitForTimeout(2000);
}).then((res) => {
    console.log(res);
    return waitForTimeout(3000);
}).then((res) => {
    console.log(res);
})
```

这样是不是就看着清晰多了

接下看看异常处理

```javascript
function waitForTimeout(timeout) {
    return new Promise((resolve, reject) => {
        if (timeout > 1500) {
            reject('timeout must be less than 1000');
        }
        setTimeout(() => {
            resolve(timeout);
        }, timeout);
    })
}

waitForTimeout(1000).then((res) => {
    console.log(res);
    return waitForTimeout(2000);
}).then((res) => {
    console.log(res);
    return waitForTimeout(1200);
}).then((res) => {
    console.log(res);
}, errorMessage => {
    console.error(errorMessage);
})

```

上面代码判断如果timeout大于1500则会调用 `reject` 函数将状态置为失败，并 在链式调用 **最后一个then方法** 中传入了失败的回调函数

方法的执行结果输出:

```
1000
timeout must be less than 1000
```

最后一个1200的还没有执行就报错了，由此可见Promise 对象的错误具有 **冒泡** 性质，会一直向后传递，直到被捕获为止。

也就是说，错误总是会被下一个 错误回调 捕获

要想让1200正常执行，就需要把错误回调提前设置

```javascript
waitForTimeout(1000).then((res) => {
    console.log(res);
    return waitForTimeout(2000);
}).then((res) => {
    console.log(res);
    return waitForTimeout(1200);
}, errorMessage => {
    console.error(errorMessage);
    return waitForTimeout(1200);
}).then((res) => {
    console.log(res);
})
```

输出结果：

```
1000
timeout must be less than 1000
1200
```



### promise.catch()

`Promise.prototype.catch()` 方法是 `.then(null, rejection)` 或 `.then(undefined, rejection)` 的别名，用于指定发生错误时的回调函数

可以用 `.catch` 来代替 `.then` 方法来设置错误回调

```javascript
waitForTimeout(1000).then((res) => {
    console.log(res);
    return waitForTimeout(2000);
}).then((res) => {
    console.log(res);
    return waitForTimeout(1200);
}).catch(errorMessage => {
    console.error(errorMessage);
    return waitForTimeout(1200);
}).then((res) => {
    console.log(res);
})
```

推荐使用 `.catch` 来设置异常回调



### promise.finally()

`finally()` 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的

和 `try...catch...finally` 中 `finally` 的意思和用途一致

```javascript
waitForTimeout(1000).then((res) => {
    console.log(res);
    return waitForTimeout(2000);
}).then((res) => {
    console.log(res);
    return waitForTimeout(1200);
}).catch(errorMessage => {
    console.error(errorMessage);
    return waitForTimeout(1200);
}).finally(() => {
    console.log('waitForTimeout(2000) finally');
}).then((res) => {
    console.log(res);
})
```

输出结果：

```
1000
timeout must be less than 1000
waitForTimeout(2000) finally
1200
```



## async/await

async/await 是 ES8（ECMAScript 2017）引入的新语法，用来简化 Promise 异步操作。在 async/await 出
现之前，开发者只能通过链式 .then() 的方式处理 Promise 异步操作

使用 async/await 简化 Promise 异步操作的示例代码如下：

```javascript
async function stepAction() {
    console.log('start');
    const result1 = await waitForTimeout(1000);
    console.log(result1);
    const result2 = await waitForTimeout(1200);
    console.log(result2);
    const result3 = await waitForTimeout(1500);
    console.log(result3);
}

stepAction();
console.log('end');
```

!> 如果在 function 中使用了 await，则 function 必须被 async 修饰

`async` 表示函数里有异步操作，`await` 表示紧跟在后面的表达式需要等待结果

`async` 函数的返回值是 Promise 对象

`async` 函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而 `await` 命令就是内部 `then` 命令的语法糖

在 async 方法中，第一个 await 之前的代码会同步执行，await 之后的代码会异步执行

因此代码的输出结果为：

```
start
end
1000
1200
1500
```









## 学习文档

[ES6 教程](https://wangdoc.com/es6/)