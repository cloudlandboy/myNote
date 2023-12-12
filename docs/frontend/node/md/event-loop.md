# EventLoop

JavaScript 是一门单线程执行的编程语言。也就是说，同一时间只能做一件事情。

![image-20231212175734822](https://cdn.tencentfs.clboy.cn/images/2023/20231212175737268.png)

单线程执行任务队列的问题：

如果前一个任务非常耗时，则后续的任务就不得不一直等待，从而导致程序假死的问题。

为了防止某个耗时任务导致程序假死的问题，JavaScript 把待执行的任务分为了两类：

## 同步任务

- 又叫做非耗时任务，指的是在主线程上排队执行的那些任务
- 只有前一个任务执行完毕，才能执行后一个任务



## 异步任务

- 又叫做耗时任务，异步任务由 JavaScript 委托给宿主环境进行执行
- 当异步任务执行完成后，会通知 JavaScript 主线程执行异步任务的回调函数



![image-20231212180129729](https://cdn.tencentfs.clboy.cn/images/2023/20231212193338644.png)

1. 同步任务由 JavaScript 主线程次序执行
2. 异步任务委托给宿主环境执行
3. 已完成的异步任务对应的回调函数，会被加入到任务队列中等待执行
4. JavaScript 主线程的执行栈被清空后，会读取任务队列中的回调函数，次序执行
5. JavaScript 主线程不断重复上面的第 4 步



JavaScript 主线程从 *任务队列* 中读取异步任务的回调函数，放到执行栈中依次执行。这个过程是循环不断的

所以整个的这种运行机制又称为 EventLoop（事件循环）。

![image-20231212193330550](https://cdn.tencentfs.clboy.cn/images/2023/20231212193355898.png)



## 宏任务和微任务

JavaScript 把异步任务又做了进一步的划分，异步任务又分为两类，分别是：

- **宏任务**
  - 异步 Ajax 请求
  - setTimeout、setInterval
  - 文件操作
  - 其它宏任务
- **微任务**
  - Promise.then、.catch 和 .finally
  - process.nextTick
  - 其它微任务

![image-20231212193751384](https://cdn.tencentfs.clboy.cn/images/2023/20231212193805305.png)



每一个宏任务执行完之后，都会检查是否存在待执行的微任务，如果有，则执行完所有微任务之后，再继续执行下一个宏任务。

![image-20231212193852874](https://cdn.tencentfs.clboy.cn/images/2023/20231212193857032.png)
