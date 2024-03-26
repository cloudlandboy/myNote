# 索引

索引（index）是帮助MySQL高效获取数据的数据结构(有序)

在数据之外，数据库系统还维护着满足特定查找算法的数据结构，这些数据结构以某种方式引（指向）数据， 这样就可以在这些数据结构上实现高级查找算法，这种数据结构就是索引。



## 索引结构

下表是mysql支持的所有的索引结构

| 索引结构            | 描述                                                         |
| ------------------- | ------------------------------------------------------------ |
| B+Tree索引          | 最常见的索引类型，大部分引擎都支持 B+ 树索引                 |
| Hash索引            | 底层数据结构是用哈希表实现的, 只有精确匹配索引列的查询才有效, 不支持范围查询 |
| R-tree(空间索引）   | MyISAM引擎的一个特殊索引类型，主要用于地理空间数据类型，通常使用较少 |
| Full-text(全文索引) | 通过建立倒排索引,快速匹配文档的方式。类似于Lucene,Solr,ES    |

有如下表结构和数据：

![image-20240322160332956](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092448007.png)

查找age为45的用户

```sql
select * from tb_user where age = 45;
```

在无索引情况下，就需要从第一行开始扫描，一直扫描到最后一行，我们称之为 全表扫描，性能很低

如果我们针对于这张表建立了索引，假设索引结构就是二叉树，那么也就意味着，会对age这个字段建立一个二叉树的索引结构。

![image-20240322160529348](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092454391.png)





### B-Tree

B-Tree，B树是一种多叉路衡查找树，相对于二叉树，B树每个节点可以有多个分支，即多叉。以一颗最大度数（max-degree）为5(5阶)的b-tree为例，那这个B树每个节点最多存储4个key，5个指针：

?> 树的度数指的是一个节点的子节点个数

![image-20240322161733355](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092500652.png)

下面这个网站可以用动画展示B数的增删查逻辑

https://www.cs.usfca.edu/~galles/visualization/BTree.html

- 5阶的B树，每一个节点最多存储4个key，对应5个指针
- 一旦节点存储的key数量到达5，就会裂变，中间元素向上分裂
- 在B树中，非叶子节点和叶子节点都会存放数据



### B+Tree

B+Tree是B-Tree的变种，我们以一颗最大度数（max-degree）为4（4阶）的b+tree为例，来看一下其结构示意图：

![image-20240322163326747](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092504607.png)

- 蓝色标注的是索引部分，仅仅起到索引数据的作用，不存储数据
- 绿色标注是数据存储部分，在其叶子节点中要存储具体的数据

https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html

最终我们看到，B+Tree 与 B-Tree相比，主要有以下三点区别：

- 所有的数据都会出现在叶子节点
- 叶子节点形成一个单向链表
- 非叶子节点仅仅起到索引数据作用，具体的数据都是在叶子节点存放的

上述我们所看到的结构是标准的B+Tree的数据结构，接下来，我们再来看看MySQL中优化之后的B+Tree

MySQL索引数据结构对经典的B+Tree进行了优化。在原B+Tree的基础上，增加一个指向相邻叶子节点的链表指针，就形成了带有顺序指针的B+Tree，提高区间访问的性能，利于排序

![image-20240322164633376](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092509164.png)



### Hash

哈希索引就是采用一定的hash算法，将键值换算成新的hash值，映射到对应的槽位上，然后存储在hash表中

![image-20240322165420476](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092513125.png)

如果两个(或多个)键值，映射到一个相同的槽位上，他们就产生了hash冲突（也称为hash碰撞），可以通过链表来解决

![image-20240322165448392](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092518101.png)

**特点** ：

- Hash索引只能用于对等比较(=，in)，不支持范围查询
- 无法利用索引完成排序操作
- 查询效率高，通常(不存在hash冲突的情况)只需要一次检索就可以了，效率通常要高于B+tree索 引

在MySQL中，支持hash索引的是Memory存储引擎。 而InnoDB中具有自适应hash功能，hash索引是InnoDB存储引擎根据B+Tree索引在指定条件下自动构建的



## 索引分类

在MySQL数据库，将索引的具体类型主要分为以下几类：

| 分类     | 含义                             | 特点                     | 关键字   |
| -------- | -------------------------------- | ------------------------ | -------- |
| 主键索引 | 针对于表中主键创建的索引         | 默认自动创建, 只能有一个 | PRIMARY  |
| 唯一索引 | 避免同一个表中某数据列中的值重复 | 可以有多个               | UNIQUE   |
| 常规索引 | 快速定位特定数据                 | 可以有多个               |          |
| 全文索引 | 查找的是文本中的关键词           | 可以有多个               | FULLTEXT |



### 聚集索引

而在在InnoDB存储引擎中，根据索引的存储形式，又可以分为以下两种

| 分类     | 含义                                                       | 特点                |
| -------- | ---------------------------------------------------------- | ------------------- |
| 聚集索引 | 将数据存储与索引放到了一块，索引结构的叶子节点保存了行数据 | 必须有,而且只有一个 |
| 二级索引 | 将数据与索引分开存储，索引结构的叶子节点关联的是对应的主键 | 可以存在多个        |

聚集索引选取规则

- 如果存在主键，主键索引就是聚集索引
- 如果不存在主键，将使用第一个唯一（UNIQUE）索引作为聚集索引
- 如果表没有主键，且没有合适的唯一索引，则InnoDB会自动生成一个rowid作为隐藏的聚集索引



聚集索引和二级索引的具体结构如下：



![image-20240322170322570](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092523660.png)

- 聚集索引的叶子节点下挂的是这一行的数据
- 二级索引的叶子节点下挂的是该字段值对应的主键值



### 回表查询

接下来，我们来分析一下，当我们执行如下的SQL语句时，具体的查找过程是什么样子的

![image-20240322170452640](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092528985.png)

1. 由于是根据name字段进行查询，所以先根据name='Arm'到name字段的二级索引中进行匹配查找。但是在二级索引中只能查找到 Arm 对应的主键值10
2. 由于查询返回的数据是*，所以此时，还需要根据主键值10，到聚集索引中查找10对应的记录，最终找到10对应的行row
3. 最终拿到这一行的数据，直接返回即可

?> 这种先到二级索引中查找数据，找到主键值，然后再到聚集索引中根据主键值，获取数据的方式，就称之为回表查询



以下两条SQL语句，那个执行效率高? 为什么?

1. `select * from user where id = 10;`
2. `select * from user where name = 'Arm';`

备注: id为主键，name字段创建的有索引

<details>
  <summary>解答：</summary>
  通过id查询性能要高于通过name查询，因为通过id直接走聚集索引，直接返回数据。<br/>
  而通过name查询需要先查询name字段的二级索引，然后再查询聚集索引，也就是需要进行回表查询
</details>


## 索引语法



**创建索引**

```sql
CREATE [ UNIQUE | FULLTEXT ] INDEX 索引名 ON 表名 ( 列表,... );
```

**查看索引**

```sql
SHOW INDEX FROM 表名;
```

**删除索引**

```sql
DROP INDEX 索引名 ON 表名;
```





## SQL性能分析

### SQL执行频率

MySQL 客户端连接成功后，通过 `show [session|global] status` 命令可以提供服务器状态信息。

通过如下指令，可以查看当前数据库的INSERT、UPDATE、DELETE、SELECT的访问频次

```sql
-- session 是查看当前会话
-- global 是查询全局数据
SHOW GLOBAL STATUS LIKE 'Com_______';
```

![image-20240322175226898](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092536577.png)

- `Com_delete` ：删除次数
- `Com_insert` ：插入次数
- `Com_select` ：查询次数
- `Com_update` ： 更新次数

通过上述指令，我们可以查看到当前数据库到底是以查询为主，还是以增删改为主，从而为数据库优化提供参考依据。 如果是以增删改为主，我们可以考虑不对其进行索引的优化。 如果是以查询为主，那么就要考虑对数据库的索引进行优化了



### 慢查询日志

慢查询日志记录了所有执行时间超过指定参数（ `long_query_time` 单位：秒，默认10秒）的所有SQL语句的日志

MySQL的慢查询日志默认没有开启，我们可以查看一下系统变量 slow_query_log

```sql
SHOW VARIABLES LIKE 'slow_query_log'
```

如果要开启慢查询日志，需要在MySQL的配置文件（/etc/my.cnf）中配置如下信息：

```properties
# 开启MySQL慢日志查询开关
slow_query_log=1 
# 设置慢日志的时间为2秒，SQL语句执行时间超过2秒，就会视为慢查询，记录慢查询日志
long_query_time=2
```

设置完毕后重启mysql，查看慢日志文件中记录的信息，日志文件位于：`/var/lib/mysql/xxx-slow.log`

```shell
systemctl restart mysqld
```

我们可以使用navicat提供的数据生成工具一千万以上数据

![image-20240325094448630](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092541499.png)

然后使用模糊查询增加耗时

```sql
SELECT * FROM tb_user WHERE name LIKE '张%'
```

然后查看慢查询日志文件就可以看到记录了查询时间超过2秒的sql

![image-20240325102904463](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092546401.png)



### profile详情

show profiles 能够在做SQL优化时帮助我们了解时间都耗费到哪里去了。通过 `have_profiling` 参数，能够看到当前MySQL是否支持profile操作：

```sql
SELECT @@have_profiling;
```

返回 `YES`，代表当前MySQL是支持 profile操作的，查询开启状态

```sql
SELECT @@profiling;
```

通过set语句在session/global级别开启profiling：

```sql
SET profiling = 1;
```

接下来，我们所执行的SQL语句，都会被MySQL记录，并记录执行时间消耗到哪儿去了。 我们直接执行如下的SQL语句：

```sql
select * from tb_user LIMIT 100;
select * from tb_user where id = 1;
select * from tb_user where name = '白起';
select count(*) from tb_user;
```

然后通过如下指令查看SQL的执行耗时：

```sql
-- 查看每一条SQL的耗时基本情况
show profiles;

-- 查看指定query_id的SQL语句各个阶段的耗时情况
show profile for query query_id;

-- 查看指定query_id的SQL语句CPU的使用情况
show profile cpu for query query_id;
```



### explain

`EXPLAIN` 或者 `DESC` 命令获取 MySQL 如何执行 SELECT 语句的信息，包括在 SELECT 语句执行过程中表如何连接和连接的顺序。

```sql
EXPLAIN 查询语句;
```

![image-20240325104809852](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092555015.png)

Explain 执行计划中各个字段的含义:

| 字段         | 含义                                                         |
| ------------ | ------------------------------------------------------------ |
| id           | select查询的序列号，表示查询中执行select子句或者是操作表的顺序<br/>(id相同，执行顺序从上到下；id不同，值越大，越先执行)。 |
| select_type  | 表示 SELECT 的类型，常见的取值有：<br /> `SIMPLE` （简单表，即不使用表连接或者子查询）<br />`PRIMARY` （主查询，即外层的查询）<br />`UNION` （UNION 中的第二个或者后面的查询语句）<br />`SUBQUERY` （SELECT/WHERE之后包含了子查询）等 |
| type         | 表示连接类型，性能由好到差的连接类型为：<br />`NULL` 、`system` 、 `const` 、`eq_ref` 、`ref` 、`range` 、 `index` 、 `all` |
| possible_key | 显示可能应用在这张表上的索引，一个或多个                     |
| key          | 实际使用的索引，如果为NULL，则没有使用索引                   |
| key_len      | 表示索引中使用的字节数，该值为索引字段最大可能长度，并非实际使用长度，在不损失精确性的前提下， 长度越短越好 |
| rows         | MySQL认为必须要执行查询的行数，在innodb引擎的表中，是一个估计值，可能并不总是准确的 |
| filtered     | 表示返回结果的行数占需读取行数的百分比， filtered 的值越大越好 |



分别执行下面两条sql

```sql
SELECT * FROM tb_user WHERE id = 1;
SELECT * FROM tb_user WHERE name = '吕布';
```

![image-20240325110728223](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092605601.png)

可以看到即使有1000w的数据,根据id进行数据查询,性能依然很快，而根据name查询却要耗时很久，因为主键id是有索引的

我们给name字段也加上索引再查询就会很快了

```sql
CREATE INDEX idx_user_name ON tb_user (`name`);
```



## 联合索引

### 最左前缀法则

如果索引了多列（联合索引），要遵守最左前缀法则。

最左前缀法则指的是查询从索引的最左列开始，并且不跳过索引中的列。如果跳跃某一列，索引将会失效

给 `tb_user` 的 `profession` ,`age` ,`status`  三列创建联合索引

```sql
CREATE INDEX idx_user_profession_age_status ON tb_user (profession,age,`status`);
```

对于最左前缀法则指的是，查询时，最左边的列，也就是 `profession` **必须存在** ，否则索引失效

```sql
EXPLAIN SELECT * FROM tb_user WHERE age = 31 AND profession = '软件工程'  AND `status` = '0';
```



![image-20240325112128920](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092616162.png)

通过查询计划可以看出这个查询是走了联合索引的，而我们sql语句中条件的顺序和索引的顺序不一致，由此可以看出 **查询条件顺序和索引顺序无关**

接下来我们看这五条sql的执行计划

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程';
EXPLAIN SELECT * FROM tb_user WHERE age = 35;
EXPLAIN SELECT * FROM tb_user WHERE `status` = '0';
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程'  AND `age` = 35;
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程'  AND `status` = '0';
```

![image-20240325132624704](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092620185.png)



通过以上测试，我们发现只要条件中联合索引最左边的字段 `profession` 存在，索引就会生效，只不过索引的长度不同。 我们也可以推测出profession字段索引长度为47、age字段索引长度为2、status字段索引长度为5

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程'  AND `status` = '0';
```

上述的SQL查询时，最左边的列profession是存在的，索引满足最左前缀法则的基本条件。

但是查询时，跳过了age这个列，所以后面的列索引是不会使用的，也就是索引部分生效，所以索引的长度是47



### 范围查询

联合索引中，出现范围查询 `>` `<`，范围查询右侧的列索引失效

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程' AND age > 30 and status = '0';
```



![image-20240325133315093](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092625525.png)

使用到的索引的长度为49，就说明范围查询右边的status字段是没有走索引的

当范围查询使用 `>=` 或 `<=` 时，所有的字段都是走索引的。

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程' AND age > 30 AND age<=50 and status = '0';
```



![image-20240325133723258](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092629362.png)

所以，在业务允许的情况下，尽可能的使用类似于 `>=` 或 `<=` 这类的范围查询，而避免使用 `>` 或 `<`



## 索引失效

### 索引列运算

不要在索引列上进行运算操作， 索引将失效

```sql
EXPLAIN SELECT * FROM tb_user WHERE id%8 = 0;
```

### 字符串不加引号

字符串类型字段使用时，不加引号，索引将失效

`tb_user` 表的 `status` 列是字符串类型，我们看下面两个SQL的执行计划区别

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程'  AND `age` = 35 AND `status` = '0';
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程'  AND `age` = 35 AND `status` = 0;
```

![image-20240325134440028](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092633850.png)

通过索引长度可以看出第二条SQL由于没加引号导致status部分索引失效，如果是单列索引会直接导致索引失效，造成全表扫描



### 模糊查询

如果仅仅是尾部模糊匹配 `xxx%`，索引不会失效。如果是头部模糊匹配 `%xxx` 、`%xxx%`，索引失效

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession LIKE '软件%';
EXPLAIN SELECT * FROM tb_user WHERE profession LIKE '%工程';
EXPLAIN SELECT * FROM tb_user WHERE profession LIKE '%工%';
```

![image-20240325135005703](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092638125.png)



### OR连接条件

用OR连接时，如果其中一个条件没有索引就会导致索引失效

```sql
CREATE INDEX idx_user_phone ON tb_user(phone);
```

给 `phone` 列加上单列索引

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程' OR phone LIKE '176%';
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程' OR age = 35;
```

![image-20240325140439073](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092642315.png)

从上图也可以看出，虽然 `profession` 和 `age` 列有联合索引，但是OR条件会使联合索引失效



### 数据分布影响

如果MySQL评估使用索引比全表更慢，则不使用索引

我们给 `age` 列创建索引 

```sql
CREATE INDEX idx_user_age ON tb_user (age)
```

然后看下面两个sql的执行计划，虽然条件一样，但是执行结果截然不同

```sql
EXPLAIN SELECT * FROM tb_user WHERE age > 18;
EXPLAIN SELECT * FROM tb_user WHERE age > 64;
```

![image-20240325144434303](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092646789.png)



这是因为MySQL在查询时，会评估使用索引的效率与走全表扫描的效率，如果走全表扫描更快，则放弃索引，走全表扫描。 因为索引是用来索引少量数据的，如果通过索引查询返回大批量的数据，则还不如走全表扫描来的快，此时索引就会失效



## SQL提示

现在 `tb_user` 表的索引如下：

![image-20240325145917154](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092651969.png)

一个 `profession` 列的单列索引和联合索引，查看这段sql的执行计划

```sql
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程';
```

![image-20240325151743559](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092655182.png)

从上图可以看到mysql选择了联合索引

那么，我们能不能在查询的时候，自己来指定使用哪个索引呢？ 答案是肯定的，此时就可以借助于MySQL的SQL提示来完成

- `USE INDEX` ： 建议MySQL使用哪一个索引完成此次查询（仅仅是建议，mysql内部还会再次进行评估）
- `IGNORE INDEX` ： 忽略指定的索引
- `FORCE INDEX` ： 强制使用索引

```sql
EXPLAIN SELECT * FROM tb_user USE INDEX (idx_user_profession) WHERE profession = '软件工程';
EXPLAIN SELECT * FROM tb_user IGNORE INDEX (idx_user_profession_age_status) WHERE profession = '软件工程';
EXPLAIN SELECT * FROM tb_user FORCE INDEX (idx_user_profession) WHERE profession = '软件工程';
```

![image-20240325152316890](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092658958.png)



## 覆盖索引

尽量使用覆盖索引，减少select *。 那么什么是覆盖索引呢？ 

覆盖索引是指 查询使用了索引，并且需要返回的列，在该索引中已经全部能够找到，这样就不需要 [回表查询](#回表查询)

```sql
EXPLAIN SELECT id, profession FROM tb_user WHERE profession = '软件工程';
EXPLAIN SELECT id, profession,age,`status` FROM tb_user WHERE profession = '软件工程';
EXPLAIN SELECT id, profession,age,`status`,phone FROM tb_user WHERE profession = '软件工程';
EXPLAIN SELECT * FROM tb_user WHERE profession = '软件工程';
```

上面几个sql都使用了索引，`Extra` 结果不同，前面两个执行计划出现 `Using index` 表示不需要回表查询，不同版本 `Extra` 显示不一致

![image-20240325152935946](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092703310.png)



## 前缀索引

当字段类型为字符串（varchar，text，longtext等）时，有时候需要索引很长的字符串，这会让索引变得很大，查询时，浪费大量的磁盘IO， 影响查询效率。此时可以只将字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率。

```sql
CREATE INDEX 索引名 ON 表名( 列名(截取长度) ) ;
```

为tb_user表的email字段，建立长度为5的前缀索引

```sql
CREATE INDEX idx_email_5 ON tb_user(email(5));
```

可以根据索引的选择性来决定，而选择性是指不重复的索引值（基数）和数据表的记录总数的比值，索引选择性越高则查询效率越高， 唯一索引的选择性是1，这是最好的索引选择性，性能也是最好的

```sql
SELECT COUNT(DISTINCT email) / COUNT(*) FROM tb_user;
SELECT COUNT(DISTINCT SUBSTRING(email,1,5)) / COUNT(*) FROM tb_user;
```

前缀索引的查询流程：

![image-20240326092109478](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326092708761.png)



## 索引设计原则

1. 针对于数据量较大，且查询比较频繁的表建立索引
2. 针对于常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索引
3. 尽量选择区分度高的列作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高
4. 如果是字符串类型的字段，字段的长度较长，可以针对于字段的特点，建立前缀索引
5. 尽量使用联合索引，减少单列索引，查询时，联合索引很多时候可以覆盖索引，节省存储空间，避免回表，提高查询效率
6. 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价也就越大，会影响增删改的效率
7. 如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它。当优化器知道每列是否包含NULL值时，它可以更好地确定哪个索引最有效地用于查询

