# NIO

## 简介

Java NIO（New IO）是从Java 1.4版本开始引入的一个新的IO API，可以替代标准的Java IO API。

NIO与原来的IO有同样的作用和目的，但是使用的方式完全不同。

NIO支持`面向缓冲区`的、`基于通道的IO操作`。NIO将以更加高效的方式进行文件的读写操作。



## NIO与IO的主要区别

| IO                      | NIO                         |
| ----------------------- | --------------------------- |
| 面向流(Stream Oriented) | 面向缓冲区(Buffer Oriented) |
| 阻塞IO(Blocking IO)     | 非阻塞IO(Non Blocking IO)   |
| (无)                    | 选择器(Selectors)           |

> 传统IO面向流，程序读取文件需要建立一个输入流

![20191228175457](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217628.gif)

> 同样传统IO要想将程序中的内容输出到文件还要建立一个输出流

![1577527290649](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211733.png)

> NIO面向缓存区，其中的通道也可以理解为传统IO中流，但是又有些差异

如果把传统IO中流理解为生活中的水流(单向流动)，那么可以把NIO中的通道理解为生活中的火车轨道，只是一条通往两个地方的连接(A->B)，铁路是静止的，是无法完成运输的，要想从A到B就要坐上从A到B的火车(缓存区)，然后沿着这条轨道(通道)才能到达B，到达B之后乘客从火车上下来，同样火车又可以载着想从B到A的人沿着这条轨道再回到A

![20191228181005](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218035.gif)

> 所以NIO中的缓存区是双向的

![1577528211499](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211999.png)



?> **简而言之，通道负责传输， 缓存区负责存储**



## 缓冲区(Buffer)

`缓冲区（Buffer）`：一个用于特定基本数据类型的容器。由 java.nio 包定义的，所有缓冲区都是 Buffer 抽象类的子类。

Java NIO 中的 Buffer 主要用于与 NIO 通道进行交互，数据是从通道`读`入缓冲区，从缓冲区`写`入通道中的



Buffer 就像一个数组，可以保存多个相同类型的数据。根据数据类型不同(boolean 除外) ，有以下 Buffer 常用子类：

- **ByteBuffer**
- **CharBuffer**
- **ShortBuffer**
- **IntBuffer**
- **LongBuffer**
- **FloatBuffer**
- **DoubleBuff**

上述 Buffer 类 他们都采用相似的方法进行管理数据，只是各自管理的数据类型不同而已。都是通过`allocate`静态方法获取一个 Buffer对象：

```java
//创建一个容量为 capacity 的 XxxBuffer 对象
XxxBuffer.allocate(int capacity)
```



### 缓冲区的基本属性

- `容量 (capacity)` ：表示 Buffer 最大数据容量，缓冲区容量不能为负，并且创建后不能更改。

  (因为底层是数组，数组一但被创建就不能被改变)

- `限制 (limit)`：界限，表示缓冲区中可以操作数据的大小。（limit 后数据不能进行读写）

- `位置 (position)`：位置，表示缓冲区中正在操作数据的位置。

- `标记 (mark)与重置 (reset)`：标记，表示记录当前 position 的位置。可以通过 reset() 恢复到 mark 的位置

!> 标记、位置、限制、容量遵守以下不变式： `0 <= mark <= position <= limit <= capacity`

```java
public class BufferTest {
    
    @Test
    public void test01() throws Exception {
        //通过 allocate() 获取缓冲区
        ByteBuffer byteBuffer = ByteBuffer.allocate(10);
        this.print(byteBuffer);
    }

    public void print(Buffer buffer) {
        //表示 Buffer 最大数据容量
        System.out.println("capacity：" + buffer.capacity());

        //界限，表示缓冲区中可以操作数据的大小
        System.out.println("limit：" + buffer.limit());

        //位置，表示缓冲区中正在操作数据的位置
        System.out.println("position：" + buffer.position());
    }

}
```

输出结果：

```
capacity：10
limit：10
position：0
```



### Buffer的常用方法 

| 方 法                  | 描 述                                                     |
| ---------------------- | --------------------------------------------------------- |
| Buffer clear()         | 清空缓冲区并返回对缓冲区的引用                            |
| Buffer flip()          | 将缓冲区的界限设置为当前位置，并将当前位置重置为 0        |
| int capacity()         | 返回 Buffer 的 capacity 大小                              |
| boolean hasRemaining() | 判断缓冲区中是否还有元素                                  |
| int limit()            | 返回 Buffer 的界限(limit) 的位置                          |
| Buffer limit(int n)    | 将设置缓冲区界限为 n, 并返回一个具有新 limit 的缓冲区对象 |
| Buffer mark()          | 对缓冲区设置标记                                          |
| int position()         | 返回缓冲区的当前位置 position                             |
| Buffer position(int n) | 将设置缓冲区的当前位置为 n , 并返回修改后的 Buffer 对象   |
| int remaining()        | 返回 position 和 limit 之间的元素个数                     |
| Buffer reset()         | 将位置 position 转到以前设置的 mark 所在的位置            |
| Buffer rewind()        | 将位置设为为 0， 取消设置的 mark                          |

![1577534826954](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212493.png)



### 缓冲区的数据操作

> Buffer 所有子类提供了两个用于数据操作的方法：**get()** 与 **put()** 方法

- **获取 Buffer 中的数据**
  - `get()` ：读取单个字节
  - `get(byte[] dst)`：批量读取多个字节到 dst 中
  - `get(int index)`：读取指定索引位置的字节(不会移动 position)

- **放入数据到 Buffer 中**
  - `put(byte b)`：将给定单个字节写入缓冲区的当前位置
  - `put(byte[] src)`：将 src 中的字节写入缓冲区的当前位置
  - `put(int index, byte b)`：将指定字节写入缓冲区的索引位置(不会移动 position)



### put()

```java
@Test
public void test02() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abc".getBytes());
    this.print(byteBuffer);
    byteBuffer.put("中".getBytes());
    this.print(byteBuffer);
}
```

输出结果：

```
capacity：10
limit：10
position：3

capacity：10
limit：10
position：6
```



### flip()

```java
@Test
public void test03() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());
    this.print(byteBuffer);
    //切换读取数据模式,将缓冲区的界限(limit)设置为当前位置(position)，并将当前位置重置为 0
    byteBuffer.flip();
    this.print(byteBuffer);
}
```

输出结果：

```
capacity：10
limit：10
position：5

capacity：10
limit：5
position：0
```



### get()

```java
@Test
public void test04() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());
    this.print(byteBuffer);
    //切换读取数据模式,将缓冲区的界限(limit)设置为当前位置(position)，并将当前位置重置为 0
    byteBuffer.flip();
    this.print(byteBuffer);
    //利用 get() 读取缓冲区中的数据
    byte[] b = new byte[byteBuffer.limit()];
    byteBuffer.get(b);
    System.out.println(new String(b));

}
```

输出结果：

```
capacity：10
limit：10
position：5

capacity：10
limit：5
position：0

abcde

capacity：10
limit：5
position：5
```



### rewind()可重复读

```java
@Test
public void test05() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());
    //切换读取数据模式,将缓冲区的界限(limit)设置为当前位置(position)，并将当前位置重置为 0
    byteBuffer.flip();
    //利用 get() 读取缓冲区中的数据
    byte[] b = new byte[byteBuffer.limit()];
    byteBuffer.get(b);
    System.out.println(new String(b));
    this.print(byteBuffer);
    byteBuffer.rewind();
    this.print(byteBuffer);
}
```

```
abcde

capacity：10
limit：5
position：5

capacity：10
limit：5
position：0
```



### clear()  

> 清空缓冲区. 但是缓冲区中的数据依然存在，但是处于“被遗忘”状态

```java
@Test
public void test06() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());
    //切换读取数据模式,将缓冲区的界限(limit)设置为当前位置(position)，并将当前位置重置为 0
    byteBuffer.flip();
    //利用 get() 读取缓冲区中的数据
    byte[] b = new byte[byteBuffer.limit()];
    byteBuffer.get(b);
    System.out.println(new String(b));
    this.print(byteBuffer);
    
    byteBuffer.rewind();
    this.print(byteBuffer);
    
    byteBuffer.clear();
    this.print(byteBuffer);
    
    System.out.println((char) byteBuffer.get());
    System.out.println((char)byteBuffer.get());
    System.out.println((char)byteBuffer.get());
    System.out.println((char)byteBuffer.get());
    System.out.println((char)byteBuffer.get());
    System.out.println(byteBuffer.get());
}
```

```
abcde

capacity：10
limit：5
position：5

capacity：10
limit：5
position：0

capacity：10
limit：10
position：0

a
b
c
d
e
0
```



### mark()和reset()

> mark() : 标记，reset() : 恢复到 mark 的位置

```
@Test
public void test07() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());
    byteBuffer.flip();

    byte[] bytes = new byte[byteBuffer.limit()];
    byteBuffer.get(bytes, 0, 2);
    System.out.println(byteBuffer.position());
    //标记当前position位置
    byteBuffer.mark();
    System.out.println(new String(bytes));

    //再读取两个
    byteBuffer.get(bytes, byteBuffer.position(), 2);
    System.out.println(byteBuffer.position());
    System.out.println(new String(bytes));

    //reset() : 恢复到 mark 的位置
    byteBuffer.reset();
    System.out.println(byteBuffer.position());
    System.out.println((char) byteBuffer.get());
}
```

```
2
ab

4
abcd

2
c
```



### hasRemaining()和remaining()

> hasRemaining()：判断缓冲区中是否还有剩余数据
>
> remaining()：获取缓冲区中可以操作的数量

```java
@Test
public void test08() throws Exception {
    ByteBuffer byteBuffer = ByteBuffer.allocate(10);
    byteBuffer.put("abcde".getBytes());

    System.out.println(byteBuffer.hasRemaining());
    System.out.println(byteBuffer.remaining());


    byteBuffer.put("12345".getBytes());
    System.out.println(byteBuffer.hasRemaining());
    System.out.println(byteBuffer.remaining());
}
```

```
true
5

false
0
```



## 直接与非直接缓冲区

> 非直接缓冲区：通过 allocate() 方法分配缓冲区，将缓冲区建立在 JVM 的内存中
>
> 直接缓冲区：通过 allocateDirect() 方法分配直接缓冲区，将缓冲区建立在物理内存中。可以提高效率

![1577535963932](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212960.png)

![1577536017071](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213392.png)

- 字节缓冲区要么是直接的，要么是非直接的。如果为直接字节缓冲区，则 Java 虚拟机会尽最大努力直接在
  此缓冲区上执行本机 I/O 操作。也就是说，在每次调用基础操作系统的一个本机 I/O 操作之前（或之后），
  虚拟机都会尽量避免将缓冲区的内容复制到中间缓冲区中（或从中间缓冲区中复制内容）。
- 直接字节缓冲区可以通过调用此类的 `allocateDirect()` 工厂方法来创建。此方法返回的缓冲区进行分配和取消分配所需成本通常高于非直接缓冲区。直接缓冲区的内容可以驻留在常规的垃圾回收堆之外，因此，它们对应用程序的内存需求量造成的影响可能并不明显。所以，建议将直接缓冲区主要分配给那些易受基础系统的
  本机 I/O 操作影响的大型、持久的缓冲区。一般情况下，最好仅在直接缓冲区能在程序性能方面带来明显好
  处时分配它们。
- 直接字节缓冲区还可以通过 `FileChannel` 的 `map()` 方法 将文件区域直接映射到内存中来创建。该方法返回`MappedByteBuffer` 。Java 平台的实现有助于通过 JNI 从本机代码创建直接字节缓冲区。如果以上这些缓冲区中的某个缓冲区实例指的是不可访问的内存区域，则试图访问该区域不会更改该缓冲区的内容，并且将会在访问期间或稍后的某个时间导致抛出不确定的异常。
- 字节缓冲区是直接缓冲区还是非直接缓冲区可通过调用其 `isDirect()` 方法来确定。提供此方法是为了能够在性能关键型代码中执行显式缓冲区管理。



```java
@Test
public void test01() throws Exception {
    //非直接缓存区
    ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
    System.out.println(byteBuffer.isDirect());
    //直接缓存区
    ByteBuffer directByteBuffer = ByteBuffer.allocateDirect(1024);
    System.out.println(directByteBuffer.isDirect());
}
```

```
false
true
```



## 通道(Channel)

> 通道（Channel）：由 java.nio.channels 包定义的。Channel 表示 IO 源与目标打开的连接。
> Channel 类似于传统的“流”。只不过 Channel 本身不能直接访问数据，Channel 只能与Buffer 进行交互。
>
> 简而言之就是用于源节点与目标节点的连接。在 Java NIO 中负责缓冲区中数据的传输。Channel 本身不存储数据，因此需要配合缓冲区进行传输。



> 先来**了解**一下计算机的IO原理

![1577538320259](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213820.png)

在Java应用程序要对磁盘中的数据进行读写的时候都要通过read或者write方法调用操作系统提供的IO接口进行读写操作

在早期的时候所有的IO接口都是由CPU中央处理器独立负责的，这样也就是说当程序发出大量的读写请求时CPU的占用率就会变得非常高以至于CPU没有空闲的时间去调度其他的工作



后来操作系统在内存和接口之间加了DMA(Direct Memory Access，直接内存存取)，这个时候如果应用程序再向操作系统发送读写请求，DMA会向CPU申请权限，CPU给(jǐ)予权限后所有的IO操作都将由DMA管理，在DMA控制器的控制下，在传送过程中就不需要中央处理器的参与，这个时候读写操作就不会占用CPU资源，但是大量的IO请求就有可能会造成总线冲突

![1577538836863](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214264.png)

![9150e4e5gy1fy3oj4ctywj204z04kt8r](http://ww1.sinaimg.cn/large/9150e4e5gy1fy3oj4ctywj204z04kt8r.jpg)

反正到最后就变成了通道，这个东东具有执行I/O指令的能力，并通过执行通道(I/O)程序来控制I/O操作，不需要CPU的介入，所以就提高了CPU的利用率

![1577540113316](https://cdn.tencentfs.clboy.cn/images/2021/20210911203214677.png)



![9150e4e5jw1fcdcmp73ptj204o05kq30](http://ww2.sinaimg.cn/large/9150e4e5jw1fcdcmp73ptj204o05kq30.jpg)



### 主要实现类

> Java 为 Channel 接口提供的最主要实现类如下：

`java.nio.channels.Channel` 接口：

- `FileChannel`：用于读取、写入、映射和操作文件的通道。
- `DatagramChannel`：通过 UDP 读写网络中的数据通道。
- `SocketChannel`：通过 TCP 读写网络中的数据。
- `ServerSocketChannel`：可以监听新进来的 TCP 连接，对每一个新进来的连接都会创建一个SocketChannel。



### 获取通道

> 获取通道的一种方式是对支持通道的对象调用getChannel() 方法。支持通道的类如下：

- FileInputStream
- FileOutputStream
- RandomAccessFile
- DatagramSocket
- Socket
- ServerSocket
- 在 JDK 1.7 中的 NIO.2 针对各个通道提供了静态方法 open()
 - 在 JDK 1.7 中的 NIO.2 的 Files 工具类的 newByteChannel()



### 通道的数据传输

> 利用通道完成文件的复制（非直接缓冲区）

```java
@Test
public void test01() throws Exception {
    long start = System.currentTimeMillis();

    FileInputStream in = new FileInputStream("resources/1.jpg");
    FileOutputStream out = new FileOutputStream("resources/1_copy.jpg");
    //创建缓存区
    ByteBuffer byteBuffer = ByteBuffer.allocate(1024);

    FileChannel inChannel = in.getChannel();
    FileChannel outChannel = out.getChannel();

    //从 Channel 读取数据到 Buffer
    while (inChannel.read(byteBuffer) != -1) {
        //切换读取数据的模式
        byteBuffer.flip();

        //将 Buffer 中数据写入 Channel
        outChannel.write(byteBuffer);

        //清空缓冲区
        byteBuffer.clear();
    }
    //关闭资源
    if (outChannel != null) outChannel.close();
    if (inChannel != null) inChannel.close();
    if (out != null) out.close();
    if (in != null) in.close();

    long end = System.currentTimeMillis();
    System.out.println("非直接缓冲区耗费时间：" + (end - start));
}
```



> 使用直接缓冲区完成文件的复制(内存映射文件)

```java
@Test
public void test02() throws Exception {
    long start = System.currentTimeMillis();

    //创建一个用于读的通道
    FileChannel inChannel = FileChannel.open(Paths.get("resources", "1.jpg"), StandardOpenOption.READ);

    //创建一个用于写的通道,因为下面获取的内存映射是读写模式所以这里也要开启读的模式，如果文件不存在还需要能够创建
    FileChannel outChannel = FileChannel.open(Paths.get("resources", "1_copy_2.jpg"), StandardOpenOption.WRITE, StandardOpenOption.READ, StandardOpenOption.CREATE);

    //内存映射文件
    MappedByteBuffer inMapBuffer = inChannel.map(FileChannel.MapMode.READ_ONLY, 0, inChannel.size());
    MappedByteBuffer outMapBuffer = outChannel.map(FileChannel.MapMode.READ_WRITE, 0, inChannel.size());

    //直接对缓存区进行读写操作,不需要通过通道操作
    byte[] bytes = new byte[inMapBuffer.limit()];
    inMapBuffer.get(bytes);
    outMapBuffer.put(bytes);

    outChannel.close();
    inChannel.close();

    long end = System.currentTimeMillis();
    System.out.println("直接缓冲区耗费时间：" + (end - start));
}
```



### transferTo()和transferFrom()

> 将数据从源通道传输到其他 Channel 中

```java
@Test
public void test03() throws Exception {
    FileChannel inChannel = FileChannel.open(Paths.get("resources", "1.jpg"), StandardOpenOption.READ);
    FileChannel outChannel = FileChannel.open(Paths.get("resources", "1_copy_3.jpg"), StandardOpenOption.WRITE, StandardOpenOption.CREATE);

    inChannel.transferTo(0, inChannel.size(), outChannel);
    //outChannel.transferFrom(inChannel, 0, inChannel.size());

    outChannel.close();
    inChannel.close();
}
```



### 分散(Scatter)和聚集(Gather)

> 分散读取（Scattering Reads）是指从 Channel 中读取的数据“分散”到多个 Buffer 中。

![1577612307893](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215096.png)

> 聚集写入（Gathering Writes）是指将多个 Buffer 中的数据“聚集”到 Channel。

![1577612355504](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215513.png)



```java
@Test
public void test04() throws Exception {
    RandomAccessFile file = new RandomAccessFile("resources/a1.txt", "rw");
    //获取通道
    FileChannel inChannel = file.getChannel();

    //分配指定大小的缓存区
    ByteBuffer buffer1 = ByteBuffer.allocate(26);
    ByteBuffer buffer2 = ByteBuffer.allocate(102);

    //分散读取
    ByteBuffer[] buffers = {buffer1, buffer2};
    inChannel.read(buffers);

    //切换读取数据模式
    for (ByteBuffer buffer : buffers) {
        buffer.flip();
        //查看每个buffer读取的数据
        System.out.println(new String(buffer.array(), 0, buffer.limit()));
    }

    //聚集写入
    RandomAccessFile out = new RandomAccessFile("resources/a1_copy.txt", "rw");
    FileChannel outChannel = out.getChannel();
    outChannel.write(buffers);

    outChannel.close();
    inChannel.close();
    out.close();
    file.close();
}
```



### FileChannel的常用方法

| 方法                          | 描述                                         |
| ----------------------------- | -------------------------------------------- |
| int read(ByteBuffer dst)      | 从 Channel 中读取数据到 ByteBuffer           |
| long read(ByteBuffer[] dsts)  | 将 Channel 中的数据“分散”到 ByteBuffer[]     |
| int write(ByteBuffer src)     | 将 ByteBuffer 中的数据写入到 Channel         |
| long write(ByteBuffer[] srcs) | 将 ByteBuffer[] 中的数据“聚集”到 Channel     |
| long position()               | 返回此通道的文件位置                         |
| FileChannel position(long p)  | 设置此通道的文件位置                         |
| long size()                   | 返回此通道的文件的当前大小                   |
| FileChannel truncate(long s)  | 将此通道的文件截取为给定大小                 |
| void force(boolean metaData)  | 强制将所有对此通道的文件更新写入到存储设备中 |



## 字符集：Charset

> 编码：字符串 -> 字节数组
>
> 解码：字节数组  -> 字符串



```java
@Test
public void test05() throws Exception {
    //001.txt的编码为GBK
    FileChannel channel = FileChannel.open(Paths.get("resources", "001.txt"), StandardOpenOption.READ);
    ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
    channel.read(byteBuffer);
    byteBuffer.flip();
    //输出乱码,默认是使用UTF-8解码
    System.out.println(new String(byteBuffer.array(), 0, byteBuffer.limit()));

    Charset gbk = Charset.forName("GBK");
    //使用GBK编码格式进行解码
    CharBuffer decode = gbk.decode(byteBuffer);
    System.out.println(String.valueOf(decode.array()));

    //使用GBK编码
    ByteBuffer byteBuffer02 = gbk.encode("我爱你，亲爱的姑娘。。。");
    //乱码
    System.out.println(new String(byteBuffer02.array(), 0, byteBuffer02.limit()));
    //使用GBK解码
    System.out.println(new String(byteBuffer02.array(), 0, byteBuffer02.limit(), gbk));
}
```

输出结果：

![1577620983665](https://cdn.tencentfs.clboy.cn/images/2021/20210911203215943.png)



## 阻塞与非阻塞

> 传统的 IO 流都是阻塞式的。也就是说，当一个线程调用 read() 或 write() 时，该线程被阻塞，直到有一些数据被读取或写入，该线程在此期间不能执行其他任务。因此，在完成网络通信进行 IO 操作时，由于线程会阻塞，所以服务器端必须为每个客户端都提供一个独立的线程进行处理，当服务器端需要处理大量客户端时，性能急剧下降。

>  Java NIO 是非阻塞模式的。当线程从某通道进行读写数据时，若没有数据可用时，该线程可以进行其他任务。线程通常将非阻塞 IO 的空闲时间用于在其他通道上执行 IO 操作，所以单独的线程可以管理多个输入和输出通道。因此，NIO 可以让服务器端使用一个或有限几个线程来同时处理连接到服务器端的所有客户端。



- 传统阻塞IO方式：客户端向服务器端发送请求，服务器端便开始进行监听客户端的数据是否传过来。这时候客户端在准备自己的数据，而服务器端就需要干等着。即使服务器端是多线程的，但有时一味增加线程数，只会让阻塞的线程越来越多。
- NIO的非阻塞方式：将用于传输的通道全部注册到选择器上。
- 选择器的作用是监控这些通道的IO状况（读，写，连接，接收数据的情况等状况）。
- 选择器与通道之间的联系：
  - 通道注册到选择器上
  - 选择器监控通道
  - 当某一通道，某一个事件就绪之后，选择器才会将这个通道分配到服务器端的一个或多个线程上，再继续运行。例如客户端需要发送数据给服务器端，只当客户端所有的数据都准备完毕后，选择器才会将这个注册的通道分配到服务器端的一个或多个线程上。而在客户端准备数据的这段时间，服务器端的线程可以执行别的任务。



![1577622352000](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216369.jpg)

### SocketChannel

> Java NIO中的SocketChannel是一个连接到TCP网络套接字的通道。

**操作步骤：**

- 打开 SocketChannel
- 读写数据
- 关闭 SocketChannel

> Java NIO中的 ServerSocketChannel 是一个可以监听新进来的TCP连接的通道，就像标准IO中的ServerSocket一样。

### 阻塞式NIO

```java
public class BlockingNIOTest {

    /**
     * 客户端
     *
     * @throws Exception
     */
    @Test
    public void testClient() throws Exception {
        //获取网络通道
        SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7001));

        //获取读取本地文件的通道
        FileChannel localFileChannel = FileChannel.open(Paths.get("resources", "1.jpg"), StandardOpenOption.READ);

        //分配指定大小的缓冲区
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);

        //读取本地文件，并发送到服务端
        while (localFileChannel.read(byteBuffer) != -1) {
            byteBuffer.flip();
            socketChannel.write(byteBuffer);
            byteBuffer.clear();
        }

        //关闭通道
        localFileChannel.close();
        socketChannel.close();
    }


    /**
     * 服务端
     *
     * @throws Exception
     */
    @Test
    public void testServer() throws Exception {
        //获取服务端网络通道
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        //绑定端口号
        serverSocketChannel.bind(new InetSocketAddress(7001));

        //获取本地文件存储通道
        FileChannel localFileChannel = FileChannel.open(
                Paths.get("resources/server/1.jpg"),
                StandardOpenOption.WRITE, StandardOpenOption.CREATE);

        //获取客户端连接的通道
        SocketChannel clientSocketChannel = serverSocketChannel.accept();

        //分配指定大小的缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        //接收客户端的数据，并保存到本地
        while (clientSocketChannel.read(buffer) != -1) {
            buffer.flip();
            localFileChannel.write(buffer);
            buffer.clear();
        }

        //关闭通道
        clientSocketChannel.close();
        localFileChannel.close();
        serverSocketChannel.close();
    }
}
```
```java
public class BlockingNIOTest02 {

    /**
     * 客户端
     *
     * @throws Exception
     */
    @Test
    public void testClient() throws Exception {
        //获取网络通道
        SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7001));

        //获取读取本地文件的通道
        FileChannel localFileChannel = FileChannel.open(Paths.get("resources", "1.jpg"), StandardOpenOption.READ);

        //分配指定大小的缓冲区
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);

        //读取本地文件，并发送到服务端
        while (localFileChannel.read(byteBuffer) != -1) {
            byteBuffer.flip();
            socketChannel.write(byteBuffer);
            byteBuffer.clear();
        }

        socketChannel.shutdownOutput();
        //接收服务端的反馈
        int len = 0;
        while ((len = socketChannel.read(byteBuffer)) != -1) {
            byteBuffer.flip();
            System.out.println(new String(byteBuffer.array(), 0, len));
            byteBuffer.clear();
        }

        //关闭通道
        localFileChannel.close();
        socketChannel.close();
    }

    /**
     * 服务端
     *
     * @throws Exception
     */
    @Test
    public void testServer() throws Exception {
        //获取服务端网络通道
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        //绑定端口号
        serverSocketChannel.bind(new InetSocketAddress(7001));

        //获取本地文件存储通道
        FileChannel localFileChannel = FileChannel.open(
                Paths.get("resources/server/1.jpg"),
                StandardOpenOption.WRITE, StandardOpenOption.CREATE);

        //获取客户端连接的通道
        SocketChannel clientSocketChannel = serverSocketChannel.accept();

        //分配指定大小的缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        //接收客户端的数据，并保存到本地
        while (clientSocketChannel.read(buffer) != -1) {
            buffer.flip();
            localFileChannel.write(buffer);
            buffer.clear();
        }

        //发送反馈消息给客户端
        buffer.put("服务端成功接收".getBytes());
        buffer.flip();
        clientSocketChannel.write(buffer);

        //关闭通道
        clientSocketChannel.close();
        localFileChannel.close();
        serverSocketChannel.close();
    }
}
```



### 选择器(Selector)

> 选择器（Selector） 是 SelectableChannle 对象的多路复用器，Selector 可以同时监控多SelectableChannel 的 IO 状况，也就是说，利用 Selector 可使一个单独的线程管理多个 Channel。Selector 是非阻塞 IO 的核心。

**SelectableChannle 的结构如下：**

![1577694612406](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216779.png)



### 选择器(Selector)的应用

> 创建 Selector ：通过调用 Selector.open() 方法创建一个 Selector。

```java
 Selector selector = Selector.open();
```



> 向选择器注册通道：SelectableChannel.register(Selector sel, int op

```java
@Test
public void testSelector() throws Exception {
    //获取socket网络通道
    SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 80));

    //创建 Selector ：通过调用 Selector.open() 方法创建一个 Selector。
    Selector selector = Selector.open();

    //将SocketChannel切换到非阻塞模式
    socketChannel.configureBlocking(false);

    //向选择器注册通道：
    SelectionKey selectionKey = socketChannel.register(selector, SelectionKey.OP_WRITE | SelectionKey.OP_READ);
}
```





### SelectionKey

- 当调用 register(Selector sel, int ops) 将通道注册选择器时，选择器对通道的监听事件，需要通过第二个参数 ops 指定。

- 可以监听的事件类型（可使用 SelectionKey 的四个常量表示）：

  - 读 : SelectionKey.OP_READ （1）

  - 写 : SelectionKey.OP_WRITE （4）

  - 连接 : SelectionKey.OP_CONNECT （8）

  - 接收 : SelectionKey.OP_ACCEPT （16）

  - 若注册时不止监听一个事件，则可以使用“位或”操作符连接。

    ```java
    //向选择器注册通道：
    socketChannel.register(selector, SelectionKey.OP_WRITE | SelectionKey.OP_READ);
    ```

    

> SelectionKey：表示 SelectableChannel 和 Selector 之间的注册关系。每次向选择器注册通道时就会选择一个事件(选择键)。选择键包含两个表示为整数值的操作集。操作集的每一位都表示该键的通道所支持的一类可选择操作。

| 方 法                       | 描 述                            |
| --------------------------- | -------------------------------- |
| int interestOps()           | 获取感兴趣事件集合               |
| int readyOps()              | 获取通道已经准备就绪的操作的集合 |
| SelectableChannel channel() | 获取注册通道                     |
| Selector selector()         | 返回选择器                       |
| boolean isReadable()        | 检测 Channal 中读事件是否就绪    |
| boolean isWritable()        | 检测 Channal 中写事件是否就绪    |
| boolean isConnectable()     | 检测 Channel 中连接是否就绪      |
| boolean isAcceptable()      | 检测 Channel 中接收是否就绪      |



### Selector的常用方法

| 方 法                      | 描 述                                                        |
| -------------------------- | ------------------------------------------------------------ |
| Set\<SelectionKey\> keys() | 所有的 SelectionKey 集合。代表注册在该Selector上的Channel    |
| selectedKeys()             | 被选择的 SelectionKey 集合。返回此Selector的已选择键集       |
| int select()               | 监控所有注册的Channel，当它们中间有需要处理的 IO 操作时，该方法返回，并将对应得的 SelectionKey 加入被选择的集合中，该方法返回这些 Channel 的数量。 |
| int select(long timeout)   | 可以设置超时时长的 select() 操作                             |
| int selectNow()            | 执行一个立即返回的 select() 操作，该方法不会阻塞线程         |
| Selector wakeup()          | 使一个还未返回的 select() 方法立即返回                       |
| void close()               | 关闭该选择器                                                 |



### 非阻塞式NIO

```java
public class NonBlockingNIOTest {
    /**
     * 客户端
     *
     * @throws Exception
     */
    @Test
    public void testClient() throws Exception {
        //获取通道
        SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7001));

        //切换到非阻塞模式
        socketChannel.configureBlocking(false);

        //分配指定大小的缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        //创建标准输入流
        Scanner scanner = new Scanner(System.in);
        System.out.println("键入您的昵称：");
        String name = scanner.nextLine();
        System.out.println("OK，开始聊天吧！");
        while (scanner.hasNext()) {
            String info = scanner.nextLine();
            if ("quit".equals(info)) {
                break;
            }
            String msg = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(LocalDateTime.now()) + "：\n" + name + "：" + info;
            buffer.put(msg.getBytes());
            buffer.flip();
            socketChannel.write(buffer);
            buffer.clear();
        }

        //关闭通道
        socketChannel.close();
    }

    /**
     * 服务端
     *
     * @throws Exception
     */
    @Test
    public void testServer() throws Exception {
        //获取通道
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress(7001));

        //切换到非阻塞模式
        serverSocketChannel.configureBlocking(false);

        //获取选择器
        Selector selector = Selector.open();

        //将通道注册到选择器，并且指定“监听接收事件”
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

        //轮询式的获取选择器上已经“准备就绪”的事件
        while (selector.select() > 0) {
            //获取当前选择器中所有注册的“选择键(已就绪的监听事件)”
            Set<SelectionKey> selectionKeys = selector.selectedKeys();
            Iterator<SelectionKey> it = selectionKeys.iterator();
            while (it.hasNext()) {
                //获取准备“就绪”的事件
                SelectionKey sk = it.next();

                // 判断具体是什么事件准备就绪
                if (sk.isAcceptable()) {
                    //若“接收就绪”，获取客户端连接
                    SocketChannel socketChannel = serverSocketChannel.accept();

                    //切换到非阻模式
                    socketChannel.configureBlocking(false);

                    //将该通道注册到选择器上
                    socketChannel.register(selector, SelectionKey.OP_READ);
                } else if (sk.isReadable()) {
                    //获取当前选择器上“读就绪”状态的通道
                    SocketChannel socketChannel = (SocketChannel) sk.channel();

                    //分配缓冲区
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    //读取数据,客户端没有关闭，不能判断是否-1,返回的可能是0
                    while (socketChannel.read(buffer) > 0) {
                        buffer.flip();
                        System.out.println(new String(buffer.array(), 0, buffer.limit()));
                        buffer.clear();
                    }

                }

                //用完之后取消选择键 SelectionKey，不然下一次循环这个已经就绪的SelectionKey还存在
                it.remove();
            } //end while
        }

    }
}
```



> IDEA控制台单元测试无法输入
>
> 点击Help>Edit Custom VM Options，天津哎如下一行，然后重启IDEA

```properties
-Deditable.java.test.console=true
```



## DatagramChannel 

> Java NIO中的DatagramChannel是一个能收发UDP包的通道。

**操作步骤：**

- 打开 DatagramChannel
- 接收/发送

```java
public class NonBlockingNIO_UDPTest {

    /**
     * 发送端
     *
     * @throws Exception
     */
    @Test
    public void testSend() throws Exception {
        //获取网络通道
        DatagramChannel datagramChannel = DatagramChannel.open();

        //设置为非阻塞模式
        datagramChannel.configureBlocking(false);

        ByteBuffer buffer = ByteBuffer.allocate(1024);

        Scanner scanner = new Scanner(System.in);
        System.out.println("键入你的昵称：");
        String name = scanner.nextLine();
        System.out.println("OK,开始聊天吧!");
        while (scanner.hasNext()) {
            String info = scanner.next();
            if ("quit".equalsIgnoreCase(info)) {
                break;
            }
            String msg = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(LocalDateTime.now()) + "：\n" + name + "：" + info;
            buffer.put(msg.getBytes());
            buffer.flip();
            datagramChannel.send(buffer, new InetSocketAddress("127.0.0.1", 7001));
            buffer.clear();
        }

        datagramChannel.close();
    }

    /**
     * 接收端
     *
     * @throws Exception
     */
    @Test
    public void testReceive() throws Exception {
        DatagramChannel datagramChannel = DatagramChannel.open();
        datagramChannel.bind(new InetSocketAddress(7001));

        //设置为非阻塞模式
        datagramChannel.configureBlocking(false);

        //创建选择器
        Selector selector = Selector.open();

        //注册到选择器
        datagramChannel.register(selector, SelectionKey.OP_READ);
        while (selector.select() > 0) {
            Iterator<SelectionKey> it = selector.selectedKeys().iterator();
            while (it.hasNext()) {
                SelectionKey sk = it.next();
                if (sk.isReadable()) {
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    datagramChannel.receive(buffer);
                    buffer.flip();
                    System.out.println(new String(buffer.array(), 0, buffer.limit()));
                    buffer.clear();
                }
            }
            it.remove();
        }
    }
}
```



## 管道(pipe)

> Java NIO 管道是2个线程之间的单向数据连接。Pipe有一个source通道和一个sink通道。数据会被写到sink通道，从source通道读取。

![1577706711253](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217201.png)



```java
public static void main(String[] args) throws Exception {
    Pipe pipe = Pipe.open();

    ThreadFactory threadFactory = Executors.defaultThreadFactory();
    ThreadPoolExecutor threadPool = new ThreadPoolExecutor(2, 2, 0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<Runnable>(), threadFactory);
    //线程A 将数据写到sink通道
    threadPool.execute(() -> {
        Pipe.SinkChannel sinkChannel = pipe.sink();
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        try {
            int i = 0;
            while (i < 10) {
                Thread.sleep(1000);
                buffer.put(formatter.format(LocalDateTime.now()).getBytes());
                buffer.flip();
                sinkChannel.write(buffer);
                buffer.clear();
                i++;
            }
            sinkChannel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    });

    //线程B 从source通道读取数据
    threadPool.execute(() ->

    {
        Pipe.SourceChannel sourceChannel = pipe.source();
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        try {
            while (sourceChannel.read(buffer) > 0) {
                buffer.flip();
                System.out.println(new String(buffer.array(), 0, buffer.limit()));
                buffer.clear();
            }
            sourceChannel.close();
            threadPool.shutdown();
        } catch (Exception e) {
        }
    });
}
```