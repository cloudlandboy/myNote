## 为什么使用Nosql

> 1、单机Mysql时代

![2020082010365930.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203210944.png)

90年代,一个网站的访问量一般不会太大，单个数据库完全够用。随着用户增多，网站出现以下问题

1. 数据量增加到一定程度，单机数据库就放不下了
2. 数据的索引（B+ Tree）,一个机器内存也存放不下
3. 访问量变大后（读写混合），一台服务器承受不住。

> 2、Memcached(缓存) + Mysql + 垂直拆分（读写分离）

网站80%的情况都是在读，每次都要去查询数据库的话就十分的麻烦！所以说我们希望减轻数据库的压力，我们可以使用缓存来保证效率！

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211048.png)

优化过程经历了以下几个过程：

1. 优化数据库的数据结构和索引(难度大)
2. 文件缓存，通过IO流获取比每次都访问数据库效率略高，但是流量爆炸式增长时候，IO流也承受不了
3. MemCache,当时最热门的技术，通过在数据库和数据库访问层之间加上一层缓存，第一次访问时查询数据库，将结果保存到缓存，后续的查询先检查缓存，若有直接拿去使用，效率显著提升。

> 3、分库分表 + 水平拆分 + Mysql集群

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211157.png)

> 4、如今最近的年代

 如今信息量井喷式增长，各种各样的数据出现（用户定位数据，图片数据等），大数据的背景下关系型数据库（RDBMS）无法满足大量数据要求。Nosql数据库就能轻松解决这些问题。

> 目前一个基本的互联网项目

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211263.png)

> 为什么要用NoSQL ？

用户的个人信息，社交网络，地理位置。用户自己产生的数据，用户日志等等爆发式增长！
这时候我们就需要使用NoSQL数据库的，Nosql可以很好的处理以上的情况！

### 什么是Nosql

**NoSQL = Not Only SQL（不仅仅是SQL）**

Not Only Structured Query Language

关系型数据库：列+行，同一个表下数据的结构是一样的。

非关系型数据库：数据存储没有固定的格式，并且可以进行横向扩展。

NoSQL泛指非关系型数据库，随着web2.0互联网的诞生，传统的关系型数据库很难对付web2.0时代！尤其是超大规模的高并发的社区，暴露出来很多难以克服的问题，NoSQL在当今大数据环境下发展的十分迅速，Redis是发展最快的。

### Nosql特点

1. 方便扩展（数据之间没有关系，很好扩展！）

2. 大数据量高性能（Redis一秒可以写8万次，读11万次，NoSQL的缓存记录级，是一种细粒度的缓存，性能会比较高！）

3. 数据类型是多样型的！（不需要事先设计数据库，随取随用）

4. 传统的 RDBMS 和 NoSQL

   ```
   传统的 RDBMS(关系型数据库)
   - 结构化组织
   - SQL
   - 数据和关系都存在单独的表中 row col
   - 操作，数据定义语言
   - 严格的一致性
   - 基础的事务
   - ...
   ```

   ```
   Nosql
   - 不仅仅是数据
   - 没有固定的查询语言
   - 键值对存储，列存储，文档存储，图形数据库（社交关系）
   - 最终一致性
   - CAP定理和BASE
   - 高性能，高可用，高扩展
   - ...
   ```

> 了解：3V + 3高

大数据时代的3V ：主要是**描述问题**的

1. 海量Velume
2. 多样Variety
3. 实时Velocity

大数据时代的3高 ： 主要是**对程序的要求**

1. 高并发
2. 高可扩
3. 高性能

真正在公司中的实践：NoSQL + RDBMS 一起使用才是最强的。

### 阿里巴巴演进分析

推荐阅读：阿里云的这群疯子https://yq.aliyun.com/articles/653511

![1](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211364.png)

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211470.png)

```bash
# 商品信息
- 一般存放在关系型数据库：Mysql,阿里巴巴使用的Mysql都是经过内部改动的。

# 商品描述、评论(文字居多)
- 文档型数据库：MongoDB

# 图片
- 分布式文件系统 FastDFS
- 淘宝：TFS
- Google: GFS
- Hadoop: HDFS
- 阿里云: oss

# 商品关键字 用于搜索
- 搜索引擎：solr,elasticsearch
- 阿里：Isearch 多隆

# 商品热门的波段信息
- 内存数据库：Redis，Memcache

# 商品交易，外部支付接口
- 第三方应用
```

### Nosql的四大分类

> **KV键值对**

- 新浪：**Redis**
- 美团：Redis + Tair
- 阿里、百度：Redis + Memcache

> **文档型数据库（bson数据格式）：**

- **MongoDB**(掌握)
  - 基于分布式文件存储的数据库。C++编写，用于处理大量文档。
  - MongoDB是RDBMS和NoSQL的中间产品。MongoDB是非关系型数据库中功能最丰富的，NoSQL中最像关系型数据库的数据库。
- ConthDB

> **列存储数据库**

- **HBase**(大数据必学)
- 分布式文件系统

> **图关系数据库**

用于广告推荐，社交网络

- **Neo4j**、InfoGrid

| **分类**                | **Examples举例**                                   | **典型应用场景**                                             | **数据模型**                                    | **优点**                                                     | **缺点**                                                     |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **键值对（key-value）** | Tokyo Cabinet/Tyrant, Redis, Voldemort, Oracle BDB | 内容缓存，主要用于处理大量数据的高访问负载，也用于一些日志系统等等。 | Key 指向 Value 的键值对，通常用hash table来实现 | 查找速度快                                                   | 数据无结构化，通常只被当作字符串或者二进制数据               |
| **列存储数据库**        | Cassandra, HBase, Riak                             | 分布式的文件系统                                             | 以列簇式存储，将同一列数据存在一起              | 查找速度快，可扩展性强，更容易进行分布式扩展                 | 功能相对局限                                                 |
| **文档型数据库**        | CouchDB, MongoDb                                   | Web应用（与Key-Value类似，Value是结构化的，不同的是数据库能够了解Value的内容） | Key-Value对应的键值对，Value为结构化数据        | 数据结构要求不严格，表结构可变，不需要像关系型数据库一样需要预先定义表结构 | 查询性能不高，而且缺乏统一的查询语法。                       |
| **图形(Graph)数据库**   | Neo4J, InfoGrid, Infinite Graph                    | 社交网络，推荐系统等。专注于构建关系图谱                     | 图结构                                          | 利用图结构相关算法。比如最短路径寻址，N度关系查找等          | 很多时候需要对整个图做计算才能得出需要的信息，而且这种结构不太好做分布式的集群 |

## Redis入门

### 概述

> Redis是什么？

Redis（Remote Dictionary Server )，即远程字典服务。

是一个开源的使用ANSI C语言编写、支持网络、可基于内存亦可持久化的日志型、**Key-Value数据库**，并提供多种语言的API。

与memcached一样，为了保证效率，**数据都是缓存在内存中**。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。

> Redis能该干什么？

1. 内存存储、持久化，内存是断电即失的，所以需要持久化（RDB、AOF）
2. 高效率、用于高速缓冲
3. 发布订阅系统
4. 地图信息分析
5. 计时器、计数器(eg：浏览量)
6. 。。。

> 特性

1. 多样的数据类型

2. 持久化

3. 集群

4. 事务

   …

### 环境搭建

官网：https://redis.io/

推荐使用Linux服务器学习。

windows版本的Redis已经停更很久了…

### Windows安装

https://github.com/dmajkic/redis

1. 解压安装包
2. 开启redis-server.exe
3. 启动redis-cli.exe测试

### Linux安装

1. 下载安装包！`redis-6.2.1.tar.gz`

2. 在Linux服务器上创建准备安装redis 的目录`/usr/local/redis`

3. 将压缩包上传到服务器上面的目录并解压

   ```shell
   tar -xvf redis-6.2.1.tar.gz
   ```

4. 基本环境安装

   ```bash
   yum install gcc-c++
   # 然后进入redis目录下执行，编译
   make 
   # 然后执行安装（默认安装在/usr/local/bin）
   make install
   ```

   !> 如果编译失败，删除解压目录后重新解压再编译

5. 拷贝解压目录下 redis.conf 到redis安装目录中

6. 启动redis

   ```shell
   # 如果你当前目录不是redis.conf所在目录，请带上全路径
   redis-server redis.conf
   ```

   

### 远程连接

1. 需配置redis端口6379在linux防火墙中开放(虚拟机测试直接关闭防火墙)

   ```shell
   systemctl stop firewalld
   
   # 禁用开机自启
   systemctl disable firewalld
   ```

2. 修改redis.conf配置文件`bind属性`，直接将其注释，关闭`protected-mode`模式

   > redis3.2版本后新增protected-mode配置，默认是yes，即开启
   >
   > 开启protected-mode保护模式，需配置bind ip或者设置访问密码

   ```
   #bind 127.0.0.1 -::1
   
   protected-mode no
   ```

   

   



### 后端启动

1. 将`redis.conf` 文件中的`daemonize`从 `false`修改成 `true `表示后台启动
2. 使用命令查看是否启动 `ps -ef | grep redis`

!> 非root用户需要给予redis相关目录权限，否则无法创建数据文件，将无法正常关闭

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203227516.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203227516.png)

前端启动，使用Ctrl+C关闭

后端启动，执行redis-cli shutdown关闭

### 测试性能

**redis-benchmark：**Redis官方提供的性能测试工具，参数选项如下：

| 号   | 选项      | 描述                                       | 默认值    |
| :--- | :-------- | :----------------------------------------- | :-------- |
| 1    | **-h**    | 指定服务器主机名                           | 127.0.0.1 |
| 2    | **-p**    | 指定服务器端口                             | 6379      |
| 3    | **-s**    | 指定服务器 socket                          |           |
| 4    | **-c**    | 指定并发连接数                             | 50        |
| 5    | **-n**    | 指定请求数                                 | 10000     |
| 6    | **-d**    | 以字节的形式指定 SET/GET 值的数据大小      | 2         |
| 7    | **-k**    | 1=keep alive 0=reconnect                   | 1         |
| 8    | **-r**    | SET/GET/INCR 使用随机 key, SADD 使用随机值 |           |
| 9    | **-P**    | 通过管道传输 <numreq> 请求                 | 1         |
| 10   | **-q**    | 强制退出 redis。仅显示 query/sec 值        |           |
| 11   | **--csv** | 以 CSV 格式输出                            |           |
| 12   | **-l**    | 生成循环，永久执行测试                     |           |
| 13   | **-t**    | 仅运行以逗号分隔的测试命令列表。           |           |
| 14   | **-I**    | Idle 模式。仅打开 N 个 idle 连接并等待。   |           |

**简单测试：**

```bash
# 测试：100个并发连接 100000请求
redis-benchmark -h 127.0.0.1 -p 6379 -c 100 -n 100000
```

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203211840.png)

### 基础知识

> redis默认有16个数据库

![20200820104357466.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212353.png)

默认使用的第0个;

16个数据库为：DB 0~DB 15
默认使用DB 0 ，可以使用`select n`切换到DB n，`dbsize`可以查看当前数据库的大小，与key数量相关。

```bash
127.0.0.1:6379> config get databases # 命令行查看数据库数量databases
1) "databases"
2) "16"

127.0.0.1:6379> select 8 # 切换数据库 DB 8
OK
127.0.0.1:6379[8]> dbsize # 查看数据库大小
(integer) 0
```

`keys *` ：查看当前数据库中所有的key。

`flushdb`：清空当前数据库中的键值对。

`flushall`：清空所有数据库的键值对。



> **Redis是单线程的，Redis是基于内存操作的。**

所以Redis的性能瓶颈不是CPU,而是机器内存和网络带宽。

那么为什么Redis的速度如此快呢，性能这么高呢？QPS达到10W+

> **Redis为什么单线程还这么快？**

- 误区1：高性能的服务器一定是多线程的？
- 误区2：多线程（CPU上下文会切换！）一定比单线程效率高！

核心：Redis是将所有的数据放在内存中的，所以说使用单线程去操作效率就是最高的，多线程（CPU上下文会切换：耗时的操作！），对于内存系统来说，如果没有上下文切换效率就是最高的，多次读写都是在一个CPU上的，在内存存储数据情况下，单线程就是最佳的方案。

## 五大数据类型

 Redis是一个开源（BSD许可），内存存储的数据结构服务器，可用作**数据库**，**高速缓存**和**消息队列代理**。它支持[字符串](https://www.redis.net.cn/tutorial/3508.html)、[哈希表](https://www.redis.net.cn/tutorial/3509.html)、[列表](https://www.redis.net.cn/tutorial/3510.html)、[集合](https://www.redis.net.cn/tutorial/3511.html)、[有序集合](https://www.redis.net.cn/tutorial/3512.html)，[位图](https://www.redis.net.cn/tutorial/3508.html)，[hyperloglogs](https://www.redis.net.cn/tutorial/3513.html)等数据类型。内置复制、[Lua脚本](https://www.redis.net.cn/tutorial/3516.html)、LRU收回、[事务](https://www.redis.net.cn/tutorial/3515.html)以及不同级别磁盘持久化功能，同时通过Redis Sentinel提供高可用，通过Redis Cluster提供自动[分区](https://www.redis.net.cn/tutorial/3524.html)。

### Redis-key

> 在redis中无论什么数据类型，在数据库中都是以key-value形式保存，通过进行对Redis-key的操作，来完成对数据库中数据的操作。

下面学习的命令：

- **keys pattern**：获取所有与pattern匹配的key，可以使用通配符，*表示任意字符，?表示单个字符

- **del key1 key2 ...**：删除指定的key

- **exists key**：判断该key是否存在，1表示存在，0表示不存在

- **rename key newkey**：为当前key重命名

- **expire key seconds**：设置key的过期时间

- **ttl key**：获取该key所剩的超时时间，如果没有设置超时，返回-1，如果返回-2表示已经超时不存在

- **persist key**：清除key的过期时间。Key持久化。

- **type key**：获取指定key的类型，返回的字符串为(string，list，set，hash，zset)，如果key不存在返回none

关于`TTL`命令

Redis的key，通过TTL命令返回key的过期时间，一般来说有3种：

1. 当前key**没有设置过期时间**，所以会返回`-1`.
2. 当前key有设置过期时间，而且key**已经过期**，所以会返回`-2`.
3. 当前key有设置过期时间，且key还**没有过期**，故会返回key的正常`剩余时间`.

关于重命名`RENAME`和`RENAMENX`

- `RENAME key newkey`修改 key 的名称
- `RENAMENX key newkey`仅当 newkey 不存在时，将 key 改名为 newkey 。

更多命令学习：https://www.redis.net.cn/order/

http://redisdoc.com/



### String(字符串)

**1．存储字符串string**

字符串类型是Redis中最为基础的数据存储类型，它在Redis中是二进制安全的，这 便意味着该类型可以接受任何格式的数据，如JPEG图像数据或Json对象描述信息等。

在Redis中字符串类型的Value最多可以容纳的数据长度是512M

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203228439.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228439.png)

- **set key value**：设定key持有指定的字符串value，如果该key存在则进行覆盖操作。总是返回”OK”

- **get key**：获取key的value。如果与该key关联的value不是String类型，redis 将返回错误信息，因为get命令只能用于获取String value；如果该key不存在，返 回null。

- **getset key value**：先获取该key的值，然后在设置该key的值。

- **incr key**：将指定的key的value原子性的递增1.如果该key不存在，其初始值 为0，在incr之后其值为1。如果value的值不能转成整型，如hello，该操作将执 行失败并返回相应的错误信息。

- **decr key**：将指定的key的value原子性的递减1.如果该key不存在，其初始值 为0，在incr之后其值为-1。如果value的值不能转成整型，如hello，该操作将执 行失败并返回相应的错误信息。

- **incrby key increment**：将指定的key的value原子性增加increment，如果该 key不存在，器初始值为0，在incrby之后，该值为increment。如果该值不能转成 整型，如hello则失败并返回错误信息

- **decrby key decrement**：将指定的key的value原子性减少decrement，如果 该key不存在，器初始值为0，在decrby之后，该值为decrement。如果该值不能 转成整型，如hello则失败并返回错误信息

- **append key value**：如果该key存在，则在原有的value后追加该值；如果该 key 不存在，则重新创建一个key/value



![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203228911.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203228911.png)



### List(列表)

> 在Redis中，List类型是按照插入顺序排序的字符串链表。和数据结构中的普通链表 一样，我们可以在其头部(left)和尾部(right)添加新的元素。在插入时，如果该键并不存在，Redis将为该键创建一个新的链表。与此相反，如果链表中所有的元素均被移 除，那么该键也将会被从数据库中删除。一个列表最多可以包含 2<sup>32</sup> - 1 个元素 (4294967295, 每个列表超过40亿个元素)。
>
> 从元素插入和删除的效率视角来看，如果我们是在链表的两头插入或删除元素，这将会是非常高效的操作，即使链表中已经存储了百万条记录，该操作也可以在常量时间内完成。然而需要说明的是，如果元素插入或删除操作是作用于链表中间，那将会是非常低效的。相信对于有良好数据结构基础的开发者而言，这一点并不难理解。

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203229382.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229382.png)

首先我们列表，可以经过规则定义将其变为队列、栈、双端队列等

![[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-VPvbIltc-1597890996518)(狂神说 Redis.assets/image-20200813114255459.png)]](https://img-blog.csdnimg.cn/20200820104440398.png?type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0RERERlbmdf,size_16,color_FFFFFF,t_70#pic_center)

正如图Redis中List是可以进行双端操作的，所以命令也就分为了LXXX和RLLL两类，有时候L也表示List例如LLEN

- **lpush key value1 value2...**：在指定的key所关联的list的头部插入所有的 values，如果该key不存在，该命令在插入的之前创建一个与该key关联的空链表，之后再向该链表的头部插入数据。插入成功，返回元素的个数。

- **rpush key value1、value2…**：在该list的尾部添加元素

- **lrange key start end**：获取链表中从start到end的元素的值，start、end可 为负数，若为-1则表示链表尾部的元素，-2则表示倒数第二个，依次类推…

- **lpushx key value**：仅当参数中指定的key存在时（如果与key管理的list中没 有值时，则该key是不存在的）在指定的key所关联的list的头部插入value。

- **rpushx key value**：在该list的尾部添加元素

- **lpop key**：返回并弹出指定的key关联的链表中的第一个元素，即头部元素。

- **rpop key**：从尾部弹出元素。

- **rpoplpush resource destination**：将resource链表中的尾部元素弹出并添加到destination链表的头部

- **llen key**：返回指定的key关联的链表中的元素的数量。

- **lset key index value**：设置链表中的index的脚标的元素值，0代表链表的头元 素，-1代表链表的尾元素。

- **lrem key count value**：删除count个值为value的元素，如果count大于0，从头向尾遍历并删除count个值为value的元素，如果count小于0，则从尾向头遍历并删除。如果count等于0，则删除链表中所有等于value的元素。

- **linsert key before|after pivot value**：在pivot元素前或者后插入value这个元素。

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203229645.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229645.png)

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203229882.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203229882.png)

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203230113.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230113.png)

> 小结

- list实际上是一个链表，before Node after , left, right 都可以插入值
- 如果key不存在，则创建新的链表
- 如果key存在，新增内容
- 如果移除了所有值，空链表，也代表不存在
- 在两边插入或者改动值，效率最高！修改中间元素，效率相对较低

**应用：**

**消息排队！消息队列（Lpush Rpop）,栈（Lpush Lpop）**



### Set(集合)

> 在Redis中，我们可以将Set类型看作为没有排序的字符集合，和List类型一样，我 们也可以在该类型的数据值上执行添加、删除或判断某一元素是否存在等操作。
>
> 需要 说明的是，这些操作的时间是常量时间。Set可包含的最大元素数是4294967295。 和List类型不同的是，Set集合中不允许出现重复的元素。
>
> 和List类型相比，Set类 型在功能上还存在着一个非常重要的特性，即在服务器端完成多个Sets之间的聚合计 算操作，如unions、intersections和differences。由于这些操作均在服务端完成， 因此效率极高，而且也节省了大量的网络IO开销

- **sadd key value1、value2…**：向set中添加数据，如果该key的值已有则不会重复添加

- **smembers key**：获取set中所有的成员

- **scard key**：获取set中成员的数量

- **sismember key member**：判断参数中指定的成员是否在该set中，1表示存在，0表示不存在或者该key本身就不存在

- **srem key member1、member2…**：删除set中指定的成员

- **srandmember key**：随机返回set中的一个成员

- **sdiff key1 key2**：返回key1与key2中相差的成员，而且与key的顺序有关。即返回差集。

- **sdiffstore destination key1 key2**：将key1、key2相差的成员存储在destination上

- **sinter key[key1,key2…]**：返回交集。

- **sinterstore destination key1 key2**：将返回的交集存储在destination上

- **sunion key1、key2**：返回并集。

- **sunionstore destination key1 key2**：将返回的并集存储在destination上

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203230345.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230345.png)

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203230610.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230610.png)



### Zset（有序集合）

> Sorted-Sets和Sets类型极为相似，它们都是字符串的集合，都不允许重复的成员出 现在一个Set中。它们之间的主要差别是Sorted-Sets中的每一个成员都会有一个分 数(score)与之关联，Redis正是通过分数来为集合中的成员进行从小到大的排序。然 而需要额外指出的是，尽管Sorted-Sets中的成员必须是唯一的，但是分数(score) 却是可以重复的。
>
> 在Sorted-Set中添加、删除或更新一个成员都是非常快速的操作，其时间复杂度为 集合中成员数量的对数。由于Sorted-Sets中的成员在集合中的位置是有序的，因此， 即便是访问位于集合中部的成员也仍然是非常高效的。事实上，Redis所具有的这一 特征在很多其它类型的数据库中是很难实现的，换句话说，在该点上要想达到和Redis 同样的高效，在其它数据库中进行建模是非常困难的。

应用案例：

- set排序 存储班级成绩表 工资表排序！
- 普通消息，1.重要消息 2.带权重进行判断
- 排行榜应用实现，取Top N测试

- **zadd key score member score2 member2 …** ：将所有成员以及该成员的分数存放到sorted-set中

- **zcard key**：获取集合中的成员数量

- **zcount key min max**：获取分数在[min,max]之间的成员的个数

- **zincrby key increment member**：设置指定成员的增加的分数。

- **zrange key start end [withscores]**：获取集合中脚标为start-end的成员，[withscores]参数表明返回的成员包含其分数。

- **zrangebyscore key min max [withscores] [limit offset count]**：返回分数在[min,max]的成员并按照分数从低到高排序。[withscores]：显示分数；[limit offset count]：offset，表明从脚标为offset的元素开始并返回count个成员

- **zrank key member**：返回成员在集合中的位置。

- **zrem key member[member…]**：移除集合中指定的成员，可以指定多个成员。

- **zscore key member**：返回指定成员的分数

### Hash（哈希）

> Redis中的Hashes类型可以看成具有String Key和String Value的map容器。
>
> 所以该类型非常适合于存储值对象的信息。如Username、Password和Age等。如果 Hash中包含很少的字段，那么该类型的数据也将仅占用很少的磁盘空间。每一个Hash 可以存储4294967295个键值对。

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203231338.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231338.png)

- **hset key field value**：为指定的key设定field/value对（键值对）。

- **hgetall key**：获取key中的所有filed-vaule

- **hget key field**：返回指定的key中的field的值

- **hmset key fields**：设置key中的多个filed/value

- **hmget key fileds**：获取key中的多个filed的值

- **hexists key field**：判断指定的key中的filed是否存在

- **hlen key**：获取key所包含的field的数量

- **hincrby key field increment**：设置key中filed的值增加increment，如：age增加20

![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203231571.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231571.png)



## 另外三种特殊数据类型

### Geospatial(地理位置)

> 使用经纬度定位地理坐标并用一个**有序集合zset保存**，所以zset命令也可以使用

| 命令                                                         | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `geoadd key longitud(经度) latitude(纬度) member [..]`       | 将具体经纬度的坐标存入一个有序集合                           |
| `geopos key member [member..]`                               | 获取集合中的一个/多个成员坐标                                |
| `geodist key member1 member2 [unit]`                         | 返回两个给定位置之间的距离。默认以米作为单位。               |
| `georadius key longitude latitude radius m|km|mi|ft [WITHCOORD][WITHDIST] [WITHHASH] [COUNT count]` | 以给定的经纬度为中心， 返回集合包含的位置元素当中， 与中心的距离不超过给定最大距离的所有位置元素。 |
| `GEORADIUSBYMEMBER key member radius...`                     | 功能与GEORADIUS相同，只是中心位置不是具体的经纬度，而是使用结合中已有的成员作为中心点。 |
| `geohash key member1 [member2..]`                            | 返回一个或多个位置元素的Geohash表示。使用Geohash位置52点整数编码。 |

**有效经纬度**

> - 有效的经度从-180度到180度。
> - 有效的纬度从-85.05112878度到85.05112878度。

指定单位的参数 **unit** 必须是以下单位的其中一个：

- **m** 表示单位为米。
- **km** 表示单位为千米。
- **mi** 表示单位为英里。
- **ft** 表示单位为英尺。

**关于GEORADIUS的参数**

> 通过`georadius`就可以完成 **附近的人**功能
>
> withcoord:带上坐标
>
> withdist:带上距离，单位与半径单位相同
>
> COUNT n : 只显示前n个(按距离递增排序)

```bash
----------------georadius---------------------
127.0.0.1:6379> GEORADIUS china:city 120 30 500 km withcoord withdist # 查询经纬度(120,30)坐标500km半径内的成员
1) 1) "hangzhou"
   2) "29.4151"
   3) 1) "120.20000249147415"
      2) "30.199999888333501"
2) 1) "shanghai"
   2) "205.3611"
   3) 1) "121.40000134706497"
      2) "31.400000253193539"
     
------------geohash---------------------------
127.0.0.1:6379> geohash china:city yichang shanghai # 获取成员经纬坐标的geohash表示
1) "wmrjwbr5250"
2) "wtw6ds0y300"
```

### Hyperloglog(基数统计)

> Redis HyperLogLog 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定的、并且是很小的。
>
> 花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基数。
>
> 因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。
>
> 其底层使用string数据类型

**什么是基数？**

> 数据集中不重复的元素的个数。

**应用场景：**

网页的访问量（UV）：一个用户多次访问，也只能算作一个人。

> 传统实现，存储用户的id,然后每次进行比较。当用户变多之后这种方式及其浪费空间，而我们的目的只是**计数**，Hyperloglog就能帮助我们利用最小的空间完成。

| 命令                                      | 描述                                      |
| ----------------------------------------- | ----------------------------------------- |
| `PFADD key element1 [elememt2..]`         | 添加指定元素到 HyperLogLog 中             |
| `PFCOUNT key [key]`                       | 返回给定 HyperLogLog 的基数估算值。       |
| `PFMERGE destkey sourcekey [sourcekey..]` | 将多个 HyperLogLog 合并为一个 HyperLogLog |

```bash
----------PFADD--PFCOUNT---------------------
127.0.0.1:6379> PFADD myelemx a b c d e f g h i j k # 添加元素
(integer) 1
127.0.0.1:6379> type myelemx # hyperloglog底层使用String
string
127.0.0.1:6379> PFCOUNT myelemx # 估算myelemx的基数
(integer) 11
127.0.0.1:6379> PFADD myelemy i j k z m c b v p q s
(integer) 1
127.0.0.1:6379> PFCOUNT myelemy
(integer) 11

----------------PFMERGE-----------------------
127.0.0.1:6379> PFMERGE myelemz myelemx myelemy # 合并myelemx和myelemy 成为myelemz
OK
127.0.0.1:6379> PFCOUNT myelemz # 估算基数
(integer) 17
```

如果允许容错，那么一定可以使用Hyperloglog !

如果不允许容错，就使用set或者自己的数据类型即可 ！

### BitMaps(位图)

> 使用位存储，信息状态只有 0 和 1
>
> Bitmap是一串连续的2进制数字（0或1），每一位所在的位置为偏移(offset)，在bitmap上可执行AND,OR,XOR,NOT以及其它位操作。

**应用场景**

签到统计、状态统计

| 命令                                  | 描述                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `setbit key offset value`             | 为指定key的offset位设置值                                    |
| `getbit key offset`                   | 获取offset位的值                                             |
| `bitcount key [start end]`            | 统计字符串被设置为1的bit数，也可以指定统计范围按字节         |
| `bitop operration destkey key[key..]` | 对一个或多个保存二进制位的字符串 key 进行位元操作，并将结果保存到 destkey 上。 |
| `BITPOS key bit [start] [end]`        | 返回字符串里面第一个被设置为1或者0的bit位。start和end只能按字节,不能按位 |

```bash
------------setbit--getbit--------------
127.0.0.1:6379> setbit sign 0 1 # 设置sign的第0位为 1 
(integer) 0
127.0.0.1:6379> setbit sign 2 1 # 设置sign的第2位为 1  不设置默认 是0
(integer) 0
127.0.0.1:6379> setbit sign 3 1
(integer) 0
127.0.0.1:6379> setbit sign 5 1
(integer) 0
127.0.0.1:6379> type sign
string

127.0.0.1:6379> getbit sign 2 # 获取第2位的数值
(integer) 1
127.0.0.1:6379> getbit sign 3
(integer) 1
127.0.0.1:6379> getbit sign 4 # 未设置默认是0
(integer) 0

-----------bitcount----------------------------
127.0.0.1:6379> BITCOUNT sign # 统计sign中为1的位数
(integer) 4
```

**bitmaps的底层**

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-9PlszjhS-1597890996519)(D:\我\MyBlog\狂神说 Redis.assets\image-20200803234336175.png)]

这样设置以后你能get到的值是：**\xA2\x80**，所以bitmaps是一串从左到右的二进制串

## 事务

Redis的单条命令是保证原子性的，但是redis事务不能保证原子性

> Redis事务本质：一组命令的集合。
>
> ----------------- 队列 set set set 执行 -------------------
>
> 事务中每条命令都会被序列化，执行过程中按顺序执行，不允许其他命令进行干扰。
>
> - 一次性
> - 顺序性
> - 排他性
>
> ------
>
> 1. Redis事务没有隔离级别的概念
> 2. Redis单条命令是保证原子性的，但是事务不保证原子性！



![图片地址：https://cdn.tencentfs.clboy.cn/images/2021/20210911203232585.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232585.png)

### Redis事务操作过程

- 开启事务（`multi`）
- 命令入队
- 执行事务（`exec`）

所以事务中的命令在加入时都没有被执行，直到提交时才会开始执行(Exec)一次性完成。

```bash
127.0.0.1:6379> multi # 开启事务
OK
127.0.0.1:6379> set k1 v1 # 命令入队
QUEUED
127.0.0.1:6379> set k2 v2 # ..
QUEUED
127.0.0.1:6379> get k1
QUEUED
127.0.0.1:6379> set k3 v3
QUEUED
127.0.0.1:6379> keys *
QUEUED
127.0.0.1:6379> exec # 事务执行
1) OK
2) OK
3) "v1"
4) OK
5) 1) "k3"
   2) "k2"
   3) "k1"
```

**取消事务(`discurd`)**

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379> set k1 v1
QUEUED
127.0.0.1:6379> set k2 v2
QUEUED
127.0.0.1:6379> DISCARD # 放弃事务
OK
127.0.0.1:6379> EXEC 
(error) ERR EXEC without MULTI # 当前未开启事务
127.0.0.1:6379> get k1 # 被放弃事务中命令并未执行
(nil)
```

### 事务错误

> 代码语法错误（编译时异常）所有的命令都不执行

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379> set k1 v1
QUEUED
127.0.0.1:6379> set k2 v2
QUEUED
127.0.0.1:6379> error k1 # 这是一条语法错误命令
(error) ERR unknown command `error`, with args beginning with: `k1`, # 会报错但是不影响后续命令入队 
127.0.0.1:6379> get k2
QUEUED
127.0.0.1:6379> EXEC
(error) EXECABORT Transaction discarded because of previous errors. # 执行报错
127.0.0.1:6379> get k1 
(nil) # 其他命令并没有被执行
```

> 代码逻辑错误 (运行时异常) **其他命令可以正常执行 ** >>> 所以不保证事务原子性

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379> set k1 v1
QUEUED
127.0.0.1:6379> set k2 v2
QUEUED
127.0.0.1:6379> INCR k1 # 这条命令逻辑错误（对字符串进行增量）
QUEUED
127.0.0.1:6379> get k2
QUEUED
127.0.0.1:6379> exec
1) OK
2) OK
3) (error) ERR value is not an integer or out of range # 运行时报错
4) "v2" # 其他命令正常执行

# 虽然中间有一条命令报错了，但是后面的指令依旧正常执行成功了。
# 所以说Redis单条指令保证原子性，但是Redis事务不能保证原子性。
```

### 监控

**悲观锁：**

- 很悲观，认为什么时候都会出现问题，无论做什么都会加锁

**乐观锁：**

- 很乐观，认为什么时候都不会出现问题，所以不会上锁！更新数据的时候去判断一下，在此期间是否有人修改过这个数据

- 获取version

- 更新的时候比较version

  使用`watch key`监控指定数据，相当于乐观锁加锁。

> 正常执行

```bash
127.0.0.1:6379> set money 100 # 设置余额:100
OK
127.0.0.1:6379> set use 0 # 支出使用:0
OK
127.0.0.1:6379> watch money # 监视money (上锁)
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379> DECRBY money 20
QUEUED
127.0.0.1:6379> INCRBY use 20
QUEUED
127.0.0.1:6379> exec # 监视值没有被中途修改，事务正常执行
1) (integer) 80
2) (integer) 20
```

> 测试多线程修改值，使用watch可以当做redis的乐观锁操作（相当于getversion）

我们启动另外一个客户端模拟插队线程。

线程1：

```bash
127.0.0.1:6379> watch money # money上锁
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379> DECRBY money 20
QUEUED
127.0.0.1:6379> INCRBY use 20
QUEUED
127.0.0.1:6379> 	# 此时事务并没有执行
```

模拟线程插队，线程2：

```bash
127.0.0.1:6379> INCRBY money 500 # 修改了线程一中监视的money
(integer) 600
12
```

回到线程1，执行事务：

```bash
127.0.0.1:6379> EXEC # 执行之前，另一个线程修改了我们的值，这个时候就会导致事务执行失败
(nil) # 没有结果，说明事务执行失败

127.0.0.1:6379> get money # 线程2 修改生效
"600"
127.0.0.1:6379> get use # 线程1事务执行失败，数值没有被修改
"0"
```

> 解锁获取最新值，然后再加锁进行事务。
>
> `unwatch`进行解锁。

注意：每次提交执行exec后都会自动释放锁，不管是否成功



## Redis.conf

> 容量单位不区分大小写，G和GB有区别

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208463.png)

> 可以使用 include 组合多个配置问题

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208557.png)

> 网络配置

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208648.png)

> 日志输出级别

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208740.png)

> 日志输出文件

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208830.png)

> 持久化规则

由于Redis是基于内存的数据库，需要将数据由内存持久化到文件中

持久化方式：

- RDB
- AOF

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203208921.png)

> RDB文件相关

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209013.png)

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209113.png)

> 主从复制

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209213.png)

> Security模块中进行密码设置

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209314.png)

> 客户端连接相关

```bash
maxclients 10000  最大客户端数量
maxmemory <bytes> 最大内存限制
maxmemory-policy noeviction # 内存达到限制值的处理策略
```

redis 中的**默认**的过期策略是 **volatile-lru** 。

**设置方式**

```bash
config set maxmemory-policy volatile-lru 
1
```

#### **maxmemory-policy 六种方式**

**1、volatile-lru：**只对设置了过期时间的key进行LRU（默认值）

**2、allkeys-lru ：** 删除lru算法的key

**3、volatile-random：**随机删除即将过期key

**4、allkeys-random：**随机删除

**5、volatile-ttl ：** 删除即将过期的

**6、noeviction ：** 永不过期，返回错误

> AOF相关部分

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209407.png)

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209498.png)



## 持久化-RDB

RDB：Redis Databases

在指定时间间隔后，将内存中的数据集快照写入数据库 ；在恢复时候，直接读取快照文件，进行数据的恢复 ；

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209599.jpg)

默认情况下， Redis 将数据库快照保存在名字为 dump.rdb的二进制文件中。文件名可以在配置文件中进行自定义。

### 工作原理

------

在进行 **`RDB`** 的时候，**`redis`** 的主线程是不会做 **`io`** 操作的，主线程会 **`fork`** 一个子线程来完成该操作；

1. Redis 调用forks。同时拥有父进程和子进程。
2. 子进程将数据集写入到一个临时 RDB 文件中。
3. 当子进程完成对新 RDB 文件的写入时，Redis 用新 RDB 文件替换原来的 RDB 文件，并删除旧的 RDB 文件。

这种工作方式使得 Redis 可以从写时复制（copy-on-write）机制中获益(因为是使用子进程进行写操作，而父进程依然可以接收来自客户端的请求。)

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209703.jpg)

### 触发机制

------

1. save的规则满足的情况下，会自动触发rdb原则
2. 执行flushall命令，也会触发我们的rdb原则
3. 退出redis，也会自动产生rdb文件

#### save

使用 `save` 命令，会立刻对当前内存中的数据进行持久化 ,但是会阻塞，也就是不接受其他操作了；

> 由于 `save` 命令是同步命令，会占用Redis的主进程。若Redis数据非常多时，`save`命令执行速度会非常慢，阻塞所有客户端的请求。

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209809.jpg)

#### flushall命令

`flushall` 命令也会触发持久化 ；

#### 触发持久化规则

满足配置条件中的触发条件 ；

> 可以通过配置文件对 Redis 进行设置， 让它在“ N 秒内数据集至少有 M 个改动”这一条件被满足时， 自动进行数据集保存操作。
>
> ![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203209911.png)

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203210006.jpg)

#### bgsave

`bgsave` 是异步进行，进行持久化的时候，`redis` 还可以将继续响应客户端请求 ；

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203210112.jpg)

**bgsave和save对比**

| 命令   | save               | bgsave                             |
| ------ | ------------------ | ---------------------------------- |
| IO类型 | 同步               | 异步                               |
| 阻塞？ | 是                 | 是（阻塞发生在fock()，通常非常快） |
| 复杂度 | O(n)               | O(n)                               |
| 优点   | 不会消耗额外的内存 | 不阻塞客户端命令                   |
| 缺点   | 阻塞客户端命令     | 需要fock子进程，消耗内存           |

### 优缺点

**优点：**

1. 适合大规模的数据恢复
2. 对数据的完整性要求不高

**缺点：**

1. 需要一定的时间间隔进行操作，如果redis意外宕机了，这个最后一次修改的数据就没有了。
2. fork进程的时候，会占用一定的内容空间。

## 持久化-AOF

**Append Only File**

将我们所有的命令都记录下来，history，恢复的时候就把这个文件全部再执行一遍

> 以日志的形式来记录每个写的操作，将Redis执行过的所有指令记录下来（读操作不记录），只许追加文件但不可以改写文件，redis启动之初会读取该文件重新构建数据，换言之，redis重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作。

 快照功能（RDB）并不是非常耐久（durable）： 如果 Redis 因为某些原因而造成故障停机， 那么服务器将丢失最近写入、以及未保存到快照中的那些数据。 从 1.1 版本开始， Redis 增加了一种完全耐久的持久化方式： AOF 持久化。

如果要使用AOF，需要修改配置文件：

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203210211.png)

`appendonly no/yes`则表示启用AOF

默认是不开启的，我们需要手动配置，然后重启redis，就可以生效了！

如果这个aof文件有错位，这时候redis是启动不起来的，我需要修改这个aof文件

redis给我们提供了一个工具`redis-check-aof --fix`

> 优点和缺点

```bash
appendonly yes  # 默认是不开启aof模式的，默认是使用rdb方式持久化的，在大部分的情况下，rdb完全够用
appendfilename "appendonly.aof"

# appendfsync always # 每次修改都会sync 消耗性能
appendfsync everysec # 每秒执行一次 sync 可能会丢失这一秒的数据
# appendfsync no # 不执行 sync ,这时候操作系统自己同步数据，速度最快
```

**优点**

1. 每一次修改都会同步，文件的完整性会更加好
2. 没秒同步一次，可能会丢失一秒的数据
3. 从不同步，效率最高

**缺点**

1. 相对于数据文件来说，aof远远大于rdb，修复速度比rdb慢！
2. Aof运行效率也要比rdb慢，所以我们redis默认的配置就是rdb持久化

## RDB和AOP选择

### 对比

| RDB        | AOF    |              |
| ---------- | ------ | ------------ |
| 启动优先级 | 低     | 高           |
| 体积       | 小     | 大           |
| 恢复速度   | 快     | 慢           |
| 数据安全性 | 丢数据 | 根据策略决定 |

### 如何选择使用哪种持久化方式？

一般来说， 如果想达到足以媲美 PostgreSQL 的数据安全性， 你应该同时使用两种持久化功能。

如果你非常关心你的数据， 但仍然可以承受数分钟以内的数据丢失， 那么你可以只使用 RDB 持久化。

有很多用户都只使用 AOF 持久化， 但并不推荐这种方式： 因为定时生成 RDB 快照（snapshot）非常便于进行数据库备份， 并且 RDB 恢复数据集的速度也要比 AOF 恢复的速度要快。

## Redis发布与订阅

Redis 发布订阅(pub/sub)是一种消息通信模式：发送者(pub)发送消息，订阅者(sub)接收消息。

下图展示了频道 channel1 ， 以及订阅这个频道的三个客户端 —— client2 、 client5 和 client1 之间的关系：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215523258.png)

当有新消息通过 PUBLISH 命令发送给频道 channel1 时， 这个消息就会被发送给订阅它的三个客户端：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051321553483.png?type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzg3MzIyNw==,size_16,color_FFFFFF,t_70)

### 命令

| 命令                                     | 描述                               |
| ---------------------------------------- | ---------------------------------- |
| `PSUBSCRIBE pattern [pattern..]`         | 订阅一个或多个符合给定模式的频道。 |
| `PUNSUBSCRIBE pattern [pattern..]`       | 退订一个或多个符合给定模式的频道。 |
| `PUBSUB subcommand [argument[argument]]` | 查看订阅与发布系统状态。           |
| `PUBLISH channel message`                | 向指定频道发布消息                 |
| `SUBSCRIBE channel [channel..]`          | 订阅给定的一个或多个频道。         |
| `SUBSCRIBE channel [channel..]`          | 退订一个或多个频道                 |

### 原理

每个 Redis 服务器进程都维持着一个表示服务器状态的 redis.h/redisServer 结构， 结构的 pubsub_channels 属性是一个字典， 这个字典就用于保存订阅频道的信息，其中，字典的键为正在被订阅的频道， 而字典的值则是一个链表， 链表中保存了所有订阅这个频道的客户端。

![在这里插入图片描述](https://cdn.tencentfs.clboy.cn/images/2021/20210911203210304.png)

客户端订阅，就被链接到对应频道的链表的尾部，退订则就是将客户端节点从链表中移除。

### 缺点

1. 如果一个客户端订阅了频道，但自己读取消息的速度却不够快的话，那么不断积压的消息会使redis输出缓冲区的体积变得越来越大，这可能使得redis本身的速度变慢，甚至直接崩溃。
2. 这和数据传输可靠性有关，如果在订阅方断线，那么他将会丢失所有在短线期间发布者发布的消息。

### 应用

1. 消息订阅：公众号订阅，微博关注等等（其实更多是使用消息队列来进行实现）
2. 多人在线聊天室。

稍微复杂的场景，我们就会使用消息中间件MQ处理。

## 缓存穿透与雪崩

### 缓存穿透（查不到）

> 概念

在默认情况下，用户请求数据时，会先在缓存(Redis)中查找，若没找到即缓存未命中，再在数据库中进行查找，数量少可能问题不大，可是一旦大量的请求数据（例如秒杀场景）缓存都没有命中的话，就会全部转移到数据库上，造成数据库极大的压力，就有可能导致数据库崩溃。网络安全中也有人恶意使用这种手段进行攻击被称为洪水攻击。

> 解决方案

**布隆过滤器**

对所有可能查询的参数以Hash的形式存储，以便快速确定是否存在这个值，在控制层先进行拦截校验，校验不通过直接打回，减轻了存储系统的压力。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215824722.jpg?type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzg3MzIyNw==,size_16,color_FFFFFF,t_70)

**缓存空对象**

一次请求若在缓存和数据库中都没找到，就在缓存中方一个空对象用于处理后续这个请求。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215836317.jpg?type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzg3MzIyNw==,size_16,color_FFFFFF,t_70)

 这样做有一个缺陷：存储空对象也需要空间，大量的空对象会耗费一定的空间，存储效率并不高。解决这个缺陷的方式就是设置较短过期时间

即使对空值设置了过期时间，还是会存在缓存层和存储层的数据会有一段时间窗口的不一致，这对于需要保持一致性的业务会有影响。

### 缓存击穿（量太大，缓存过期）

> 概念

 相较于缓存穿透，缓存击穿的目的性更强，一个存在的key，在缓存过期的一刻，同时有大量的请求，这些请求都会击穿到DB，造成瞬时DB请求量大、压力骤增。这就是缓存被击穿，只是针对其中某个key的缓存不可用而导致击穿，但是其他的key依然可以使用缓存响应。

 比如热搜排行上，一个热点新闻被同时大量访问就可能导致缓存击穿。

> 解决方案

1. **设置热点数据永不过期**

   这样就不会出现热点数据过期的情况，但是当Redis内存空间满的时候也会清理部分数据，而且此种方案会占用空间，一旦热点数据多了起来，就会占用部分空间。

2. **加互斥锁(分布式锁)**

   在访问key之前，采用SETNX（set if not exists）来设置另一个短期key来锁住当前key的访问，访问结束再删除该短期key。保证同时刻只有一个线程访问。这样对锁的要求就十分高。

### 缓存雪崩

> 概念

大量的key设置了相同的过期时间，导致在缓存在同一时刻全部失效，造成瞬时DB请求量大、压力骤增，引起雪崩。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215850428.jpeg?type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzg3MzIyNw==,size_16,color_FFFFFF,t_70)

> 解决方案

- redis高可用

  这个思想的含义是，既然redis有可能挂掉，那我多增设几台redis，这样一台挂掉之后其他的还可以继续工作，其实就是搭建的集群

- 限流降级

  这个解决方案的思想是，在缓存失效后，通过加锁或者队列来控制读数据库写缓存的线程数量。比如对某个key只允许一个线程查询数据和写缓存，其他线程等待。

- 数据预热

  数据加热的含义就是在正式部署之前，我先把可能的数据先预先访问一遍，这样部分可能大量访问的数据就会加载到缓存中。在即将发生大并发访问前手动触发加载缓存不同的key，设置不同的过期时间，让缓存失效的时间点尽量均匀。