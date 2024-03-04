# 线程池

如果不使用线程池，每个任务都需要新开一个线程处理

```java
public class NonePool {

    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) {
            new Thread(() -> System.out.println(Thread.currentThread().getName())).start();
        }
    }
}
//输出：
// Thread-0
// Thread-1
// ......
// Thread-999
```

这样做带来的问题：

1. 反复创建线程开销大
2. 过多的线程会占用太多内存

解决以上两个问题的思路：

用少量的线程，来执行这1000个任务，这样就避免了反复创建并销毁线程所带来的开销问题

让这部分线程都保持工作，且可以反复执行任务，避免生命周期的损耗

使用线程池的好处：

- 加快响应速度
- 合理利用CPU和内存
- 统一管理



## 创建线程池

线程池对应的类是 `java.util.concurrent.ThreadPoolExecutor`

线程池构造函数的参数：

| 参数名            | 类型                       | 描述                                                         |
| ----------------- | -------------------------- | ------------------------------------------------------------ |
| `corePoolSize`    | `int`                      | 核心线程数                                                   |
| `maximumPoolSize` | `int`                      | 最大线程数                                                   |
| `keepAliveTime`   | `long`                     | 当线程数大于核心数时<br />多余的空闲线程的空闲时间           |
| `workQueue`       | `BlockingQueue<Runnable>`  | 任务存储队列                                                 |
| `threadFactory`   | `ThreadFactory`            | 当线程池需要新的线程的时<br/>会使用threadFactory来生成新的线程 |
| `handler`         | `RejectedExecutionHandler` | 提交任务时因线程数达到最大值<br />和任务队列已满时的拒绝策略 |



*corePoolSize* 指的是核心线程数：线程池在完成初始化后，默认情况下，线程池中并没有任何线程，线程池会等待有任务到来时，再创建新线程去执行任务

线程池有可能会在核心线程数的基础上，额外增加一些线程，但是这些新增加的线程数有一个上限，这就是最大量 *maxPoolSize*

1. 如果线程数小于corePoolSize，即使其他工作线程处于空闲状态，也会创建一个新线程来运行新任务。

2. 如果线程数等于（或大于）corePoolSize 但少于maximumPoolSize，则将任务放入队列

3. 如果队列已满，并且线程数小于maxPoolSize，则创建一个新线程来运行任务。
4. 如果队列已满，并且线程数大于或等于maxPoolSize，则拒绝该任务。



线程池添加线程的流程规则：

![image-20240117142243454](https://cdn.tencentfs.clboy.cn/images/2024/20240117142700115.png)

例：核心线程数：5，最大线程数：10，队列容量：100

当线程数已达到5时，新添加的任务将被放到队列中，当队列中任务数达到100时，将创建新的线程，如果所有线程数达到10时，后续添加的任务将会被拒绝

1. 通过设置corePoolSize和maximumPoolSize 相同，就可以创建固定大小的线程池。
2. 线程池希望保持较少的线程数，并且只有在负载变得很大时才增加它。
3. 通过设置maximumPoolSize为很高的值，例如 `Integer.MAX_VALUE` ，可以允许线程池容纳任意数量的并发任务。
4. 只有在队列填满时才创建多于corePoolSize的线程，所以如果你使用的是无界队列（例如LinkedBlockingQueue），那么线程数永远不会超过corePoolSize。

如果线程池当前的线程数多于corePoolSize，那么如果多余的线程空闲时间超过 *keepAliveTime* ，它们就会被销毁

新的线程是由 *ThreadFactory* 创建的，默认使用 `Executors.defaultThreadFactory()` ，创建出来的线程都在同一个线程组，拥有同样的NORM_PRIORITY优先级并且都不是守护线程。如果自己指定ThreadFactory，那么就可以改变线程名、线程组、优先级、是否是守护线程等。



## 工作队列

有3种最常见的队列类型：

- 直接交接：`SynchronousQueue`
- 无界队列：`LinkedBlockingQueue`
- 有界的队列：`ArrayBlockingQueue`



## Executors

这个类是JDK封装好，用来自动创建线程池的工具类，提供了许多创建线程的静态方法

`newFixedThreadPool`：创建固定大小的线程池

```java
public static void main(String[] args) {
    ExecutorService es = Executors.newFixedThreadPool(2);
    for (int i = 0; i < 5; i++) {
        es.execute(() -> System.out.println(Thread.currentThread().getName()));
    }
}
//输出：
// pool-1-thread-1
// pool-1-thread-2
// pool-1-thread-1
// pool-1-thread-2
// pool-1-thread-1
```

创建线程池源码：

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads, 0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

由于传进去的是LinkedBlockingQueue，该队列没有容量上限，所以当任务数越来越多，并且无法及时处理完毕的时候，也就是任务堆积的时候，会容易造成占用大量的内存，可能会导致OOM。

通过修改JVM启动参数测试：

![image-20240117145916494](https://cdn.tencentfs.clboy.cn/images/2024/20240117145939914.png)



`newSingleThreadExecutor` ：创建仅有一个线程的线程池

```java
public static void main(String[] args) {
    ExecutorService es = Executors.newSingleThreadExecutor();
    for (int i = 0; i < 5; i++) {
        es.execute(() -> System.out.println(Thread.currentThread().getName()));
    }
}
//输出：
// pool-1-thread-1
// pool-1-thread-1
// pool-1-thread-1
// pool-1-thread-1
// pool-1-thread-1
```

创建线程池源码：

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

可以看出，这里和newFixedThreadPool的原理基本一样，只不过把线程数直接设置成了1，所以这也会导致同样的问题，也就是当请求堆积的时候，可能会占用大量的内存。



`newCachedThreadPool` ：创建无解线程池(有空闲线程拿来用，无空闲则创建，也会回收长时间空闲线程)

```java
public static void main(String[] args) {
    ExecutorService es = Executors.newCachedThreadPool();
    for (int i = 0; i < 10; i++) {
        es.execute(() -> System.out.println(Thread.currentThread().getName()));
    }
}
//输出：
// pool-1-thread-2
// pool-1-thread-3
// pool-1-thread-1
// pool-1-thread-3
// pool-1-thread-4
// pool-1-thread-3
// pool-1-thread-6
// pool-1-thread-2
// pool-1-thread-5
// pool-1-thread-1
```

创建线程池源码：

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

这里创建线程池使用的是 `SynchronousQueue` ，该队列没有容量，也就是说任务提交会直接交给一个线程执行

这里的弊端在于第二个参数maximumPoolSize被设置为了 `Integer.MAX_VALUE` ，这可能会创建数量非常多的线程甚至导致OOM。



`newScheduledThreadPool` ：创建支持定时及周期性执行任务的线程池

```java
public static void main(String[] args) {
    ScheduledExecutorService ses = Executors.newScheduledThreadPool(5);
    //2秒后执行
    ses.schedule(() -> {
        System.out.println(Thread.currentThread().getName());
    }, 2, TimeUnit.SECONDS);

    //5秒后执行，之后每秒执行1次
    ses.scheduleAtFixedRate(() -> {
        System.out.println(Thread.currentThread().getName());
    }, 5, 1, TimeUnit.SECONDS);

}
```



对比以上几种线程池的区别：

| 类型                | 核心线程数 | 最大线程数        | 空闲存活时间 | 队列类型            |
| ------------------- | ---------- | ----------------- | ------------ | ------------------- |
| FixedThreadPool     | 自定义     | 同核心线程数      | 0            | LinkedBlockingQueue |
| SingleThreadPool    | 1          | 1                 | 0            | LinkedBlockingQueue |
| CachedThreadPool    | 0          | Integer.MAX_VALUE | 60           | SynchronousQueue    |
| ScheduledThreadPool | 自定义     | Integer.MAX_VALUE | 60           | DelayedWorkQueue    |



## 线程数量如何设定

根据任务类型分类：

- CPU密集型（加密、计算hash等）：最佳线程数为CPU核心数的1-2倍左右。
- 耗时IO型（读写数据库、文件、网络读写等）：最佳线程数一般会大于cpu核心数很多倍，以JVM线程监控显示繁忙情况为依据，保证线程空闲可以衔接上，参考BrainGoetz推荐的计算方法：*线程数 = CPU核心数 x(1+平均等待时间/平均工作时间)*



## 关闭线程池



### shutdown

调用该方法将会关闭线程池，但是需要等待已提交的任务也执行完毕才会关闭

```java
public static void main(String[] args) {
    ExecutorService es = Executors.newCachedThreadPool();
    for (int i = 0; i < 600; i++) {
        int sleepMs = i * 100;
        es.execute(() -> {
            try {
                TimeUnit.MILLISECONDS.sleep(sleepMs);
                System.out.println(sleepMs);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }
    es.shutdown();
}
```

上面的代码虽然在循环结束后就关闭了线程池，但是已提交的任务仍然在执行，线程池并没有立即停止

但是当调用关闭方法之后，不能再向线程池提交任务，会被直接拒绝

![image-20240117160727451](https://cdn.tencentfs.clboy.cn/images/2024%2F20240117160829349.png)



### isShutdown

该方法返回boolean类型值，表示该线程池是否已关闭

```java
System.out.println(es.isShutdown());
es.shutdown();
System.out.println(es.isShutdown());
//输出：
// false
// true
```



### isTerminated

该方法返回boolean类型值，表示该线程池中的所有任务是否都已经执行完毕

前提是线程池已经关闭，否则永远返回fasle

```java
public static void main(String[] args) throws InterruptedException {
    ExecutorService es = Executors.newCachedThreadPool();
    for (int i = 0; i < 100; i++) {
        int sleepMs = i * 100;
        es.execute(() -> {
            try {
                TimeUnit.MILLISECONDS.sleep(sleepMs);
                System.out.println(sleepMs);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }
    es.shutdown();
    //输出: false
    System.out.println(es.isTerminated());
    Thread.sleep(110 * 100);
    //输出: true
    System.out.println(es.isTerminated());
}
```



### awaitTermination

调用该方法后将阻塞等待isTerminated返回true，或达到超时时间，返回false

```java
es.shutdown();
boolean isTerminated = es.awaitTermination(11, TimeUnit.SECONDS);
System.out.println(isTerminated);
```



### shutdownNow

该方法比较暴力，调用会会立即停止线程池，不管任务是否执行完毕，返回任务队列中还未执行的任务

```java
es.shutdownNow()
```



## 拒绝策略

1. 当线程池被关闭后，后续提交的任务将被拒绝
2. 当线程池最大线程数和任务队列都达到最大阀值时，后续提交的任务将被拒绝

JDK提供了四种拒绝策略

- AbortPolicy：直接抛出 `RejectedExecutionException`
- CallerRunsPolicy：由提交任务的线程自己执行
- DiscardPolicy：直接丢弃
- DiscardOldestPolicy：丢弃任务队列中最旧的任务

要实现自己的拒绝策略，实现 `RejectedExecutionHandler` 接口即可



## 钩子函数

`ThreadPoolExecutor` 提供了`beforeExecute` 和 `afterExecute` 方法 ，可以在任务执行前后做一些事情

开发者可以创建自己的线程池类去继承ThreadPoolExecutor重写这两个方法

```java
public class EnhanceThreadPool extends ThreadPoolExecutor {
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();

    public EnhanceThreadPool(int corePoolSize, int maximumPoolSize) {
        super(corePoolSize, maximumPoolSize, 1, TimeUnit.MINUTES, new LinkedBlockingQueue<>());
    }

    @Override
    protected void beforeExecute(Thread t, Runnable r) {
        //任务执行前
        START_TIME.set(System.currentTimeMillis());
    }

    @Override
    protected void afterExecute(Runnable r, Throwable t) {
        //任务执行后
        System.out.println("任务耗时：" + (System.currentTimeMillis() - START_TIME.get()));
    }

    public static void main(String[] args) {
        EnhanceThreadPool pool = new EnhanceThreadPool(1, 30);
        for (int i = 0; i < 30; i++) {
            final int ss = i;
            pool.execute(() -> {
                try {
                    TimeUnit.SECONDS.sleep(ss);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            });
        }
    }
}
```



## 线程池状态

RUNNING：接受新任务并处理排队任务

SHUTDOWN：不接受新任务，但处理排队任务

STOP：不接受新任务，也不处理排队任务，并中断正在进行的任务

TIDYING：所有任务都已终止，workerCount为零时，线程会转换到TIDYING状态，并将运行terminate()钩子方法。

TERMINATED：terminate()运行完成
