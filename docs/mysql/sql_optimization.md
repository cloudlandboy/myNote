# SQL优化



## 插入数据

如果我们需要一次性往数据库表中插入多条记录，可以从以下三个方面进行优化

```sql
INSERT INTO tb_test VALUES(1,'tom');
INSERT INTO tb_test VALUES(2,'cat');
INSERT INTO tb_test VALUES(3,'jerry');
.....
```

1. 批量插入数据

   ```sql
   INSERT INTO tb_test VALUES(1,'Tom'),(2,'Cat'),(3,'Jerry');
   ```

2. 手动控制事务

   ```sql
   START TRANSACTION;
   INSERT INTO tb_test VALUES(1,'Tom'),(2,'Cat'),(3,'Jerry');
   INSERT INTO tb_test VALUES(4,'Tom'),(5,'Cat'),(6,'Jerry');
   INSERT INTO tb_test VALUES(7,'Tom'),(8,'Cat'),(9,'Jerry');
   COMMIT;
   ```

3. 主键顺序插入，性能要高于乱序插入

   主键乱序插入 : 8 -> 1 -> 9 -> 21 -> 88 -> 2 -> 4 -> 15 -> 89 -> 5 -> 7 -> 3

   主键顺序插入 : 1 -> 2 -> 3 -> 4 -> 5 -> 7 -> 8 -> 9 -> 15 -> 21 -> 88 -> 89 -> 12



## 大批量插入数据

如果一次性需要插入大批量数据(比如: 几百万的记录)，使用insert语句插入性能较低，此时可以使用MySQL数据库提供的load指令进行插入

可以执行如下指令，将数据脚本文件中的数据加载到表结构中：

1. 客户端连接服务端时，加上参数 `–-local-infile`

   ```shell
   mysql --local-infile -u root -p
   ```

2. 设置全局参数 `local_infile` 为1，开启从本地加载文件导入数据的开关

   ```sql
   SET GLOBAL local_infile = 1;
   ```

3. 执行load指令将准备好的数据，加载到表结构中

   ```sql
   LOAD DATA LOCAL INFILE '/root/load-demo.txt' INTO TABLE tb_user FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';
   ```

   文件格式如下：

   ```
   25,锤石,17788880000,chuishi@163.com,软件工程,23,1,6,2021-01-01 00:00:00
   26,德莱文,17788880001,delaiwen@qq.com,通讯工程,33,1,0,2022-01-01 00:00:00
   27,拉克丝,17788880002,lakesi@139.com,英语,34,1,2,2023-01-01 00:00:00
   28,金克斯,17788880003,jinkes@sina.com,工程造价,54,1,0,2024-01-01 00:00:00
   ```



## 主键优化

主键顺序插入的性能是要高于乱序插入的

在InnoDB存储引擎中，表数据都是根据主键顺序组织存放的，这种存储方式的表称为索引组织表

![image-20240326100702321](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142058688.png)



行数据，都是存储在聚集索引的叶子节点上的

![image-20240322153043376](https://cdn.tencentfs.clboy.cn/images/2024%2F20240322155647241.png)

在InnoDB引擎中，数据行是记录在逻辑结构 page 页中的，而每一个页的大小是固定的，默认16K。那也就意味着， 一个页中所存储的行也是有限的，如果插入的数据行row在该页存储不了，将会存储到下一个页中，页与页之间会通过指针连接

### 页分裂

页可以为空，也可以填充一半，也可以填充100%。每个页包含了2-N行数据(如果一行数据过大，会行溢出)，根据主键排列

主键顺序插入效果：

1. 从磁盘中申请页， 主键顺序插入

   ![image-20240326101209355](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142054607.png)

2. 第一个页没有满，继续往第一页插入

3. 当第一个页写满之后，再写入第二个页，页与页之间会通过指针连接

   ![image-20240326101257170](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142050545.png)

4. 当第二页写满了，再往第三页写入

   ![image-20240326101328152](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142046084.png)

主键乱序插入效果：

1. 假如1#,2#页都已经写满了，存放了如图所示的数据

   ![image-20240326101410266](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142041677.png)

2. 此时再插入id为50的记录，我们来看看会发生什么现象，会再次开启一个页，写入新的页中吗？

   ![image-20240326101516543](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142037478.png)

   不会。因为，索引结构的叶子节点是有顺序的。按照顺序，应该存储在47之后

3. 但是47所在的1#页，已经写满了，存储不了50对应的数据了。 那么此时会开辟一个新的页 3#。

   ![image-20240326101654807](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142030040.png)

4. 但是并不会直接将50存入3#页，而是会将1#页后一半的数据，移动到3#页，然后在3#页，插入50

   ![image-20240326101731875](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142023734.png)

   ![image-20240326101744473](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142019663.png)

5. 移动数据，并插入id为50的数据之后，那么此时，这三个页之间的数据顺序是有问题的。 1#的下一个页，应该是3#， 3#的下一个页是2#。 所以，此时，需要重新设置链表指针

   ![image-20240326101914609](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142015343.png)

上述的这种现象，称之为 "页分裂"，是比较耗费性能的操作



### 页合并

目前表中已有数据的索引结构（叶子节点）如下：

![image-20240326102103600](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142010714.png)

当删除一行记录时，实际上记录并没有被物理删除，只是记录被标记（flaged）为删除并且它的空间变得允许被其他记录声明使用

![image-20240326102146762](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142007107.png)

当我们继续删除2#的数据记录

![image-20240326102213803](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142003890.png)

当页中删除的记录达到 `MERGE_THRESHOLD`（默认为页的50%），InnoDB会开始寻找最靠近的页（前或后）看看是否可以将两个页合并以优化空间使用

![image-20240326102424803](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326142000370.png)

删除数据，并将页合并之后，再次插入新的数据21，则直接插入3#页

![image-20240326102447593](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141956986.png)

?> `MERGE_THRESHOLD` ：合并页的阈值，可以自己设置，在创建表或者创建索引时指定



## 索引设计原则

- 满足业务需求的情况下，尽量降低主键的长度
- 插入数据时，尽量选择顺序插入，选择使用 **AUTO_INCREMENT** 自增主键
- 尽量不要使用UUID做主键或者是其他自然主键，如身份证号
- 业务操作时，避免对主键的修改



## 排序优化

MySQL的排序，有两种方式：

- `Using filesort` : 通过表的索引或全表扫描，读取满足条件的数据行，然后在排序缓冲区sort buffer中完成排序操作，所有不是通过索引直接返回排序结果的排序都叫 FileSort 排序
- `Using index` ：通过有序索引顺序扫描直接返回有序数据，这种情况即为 using index，不需要额外排序，操作效率高

我们将 `tb_user` 表的索引全部删除，然后测试排序

```sql
EXPLAIN SELECT id,age,phone FROM tb_user ORDER BY age;
```

![image-20240326105915720](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141950493.png)

```sql
EXPLAIN SELECT id,age,phone FROM tb_user ORDER BY age, phone ;
```

由于 age, phone 都没有索引，所以上述两条sql排序都是Using filesort， 排序性能较低

给这两列创建联合索引

```sql
CREATE INDEX idx_user_age_phone_aa ON tb_user(age,phone);
```

再进行排序：

![image-20240326110302972](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141942212.png)

建立索引之后，再次进行排序查询，就由原来的Using filesort， 变为了 Using index，性能就是比较高的了

根据age, phone进行降序排序：

```sql
EXPLAIN SELECT id,age,phone FROM tb_user ORDER BY age DESC , phone DESC;
```

![image-20240326110456878](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141938021.png)

也出现 Using index， 但是此时Extra中出现了 Backward index scan，这个代表反向扫描索引，因为在MySQL中我们创建的索引，默认索引的叶子节点是从小到大排序的，而此时我们查询排序时，是从大到小，所以，在扫描时，就是反向扫描，就会出现 Backward index scan。

根据phone，age进行升序排序，phone在前，age在后

![image-20240326110751143](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141933835.png)

排序时,也需要满足最左前缀法则,因为在创建索引的时候， age是第一个字段，phone是第二个字段

所以排序时，也就该按照这个顺序来，否则就会出现 **Using filesort**



根据age, phone进行降序一个升序，一个降序

```sql
EXPLAIN SELECT id,age,phone FROM tb_user ORDER BY age ASC , phone DESC;
```

![image-20240326110955180](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141928059.png)

因为创建索引时，如果未指定顺序，默认都是按照升序排序的，而查询时，一个升序，一个降序，此时就会出现Using filesort

为了解决上述的问题，我们可以创建一个索引，这个联合索引中 age 升序排序，phone 倒序排序

```sql
CREATE INDEX idx_user_age_phone_ad ON tb_user(age ASC ,phone DESC);
```

升序/降序联合索引结构图示：

![image-20240326111318020](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141924748.png)

![image-20240326111329482](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141921197.png)



由上述的测试,我们得出order by优化原则：

- 根据排序字段建立合适的索引，多字段排序时，也遵循最左前缀法则
- 尽量使用覆盖索引
- 多字段排序, 一个升序一个降序，此时需要注意联合索引在创建时的规则（ASC/DESC）
- 如果不可避免的出现filesort，大数据量排序时，可以适当增大排序缓冲区大小 `sort_buffer_size` （默认256k）



## 分组优化

执行以下SQL观察结果：

```sql
EXPLAIN SELECT age,COUNT(*) FROM tb_user GROUP BY age;
EXPLAIN SELECT age,phone,COUNT(*) FROM tb_user GROUP BY age,phone;
EXPLAIN SELECT phone,COUNT(*) FROM tb_user GROUP BY phone;
```

![image-20240326112153683](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141914421.png)

通过执行计划可以发现分组在联合索引中，也是符合最左前缀法则的

所以，在分组操作中，我们需要通过以下两点进行优化，以提升性能：

- 可以通过索引来提高效率。
- 索引的使用也是满足最左前缀法则的



## 分页优化

在数据量比较大时，如果进行limit分页查询，在查询时，越往后，分页查询效率越低

![image-20240326140128270](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141908897.png)



因为，当在进行分页查询时，如果执行 `limit 2000000,10` 

此时需要MySQL排序前2000010 记录，仅仅返回 2000000 - 2000010 的记录，其他记录丢弃，查询排序的代价非常大

优化思路: 一般分页查询时，通过创建 覆盖索引能够比较好地提高性能，可以通过覆盖索引加子查询形式进行优化

```sql
SELECT * FROM tb_user LIMIT 5000000,2;

-- WHERE 子查询，mysql版本可能不支持
WHERE id IN (SELECT id FROM tb_user LIMIT 5000000,2);

-- 连表子查询
SELECT tu.* FROM tb_user tu INNER JOIN (SELECT id FROM tb_user ORDER BY id LIMIT 5000000,2) tui ON tu.id = tui.id;
```

![image-20240326140808497](https://cdn.tencentfs.clboy.cn/images/2024%2F20240326141903948.png)



## count优化

```sql
SELECT COUNT(*) FROM tb_user;
```

在之前的测试中，我们发现，如果数据量很大，在执行count操作时，是非常耗时的

- MyISAM 引擎把一个表的总行数存在了磁盘上，因此执行 count(*) 的时候会直接返回这个数，效率很高； 但是如果是带条件的count，MyISAM也慢
- InnoDB 引擎就麻烦了，它执行 count(*) 的时候，需要把数据一行一行地从引擎里面读出来，然后累积计数

如果说要大幅度提升InnoDB表的count效率，主要的优化思路：自己计数(可以借助于redis这样的数据库进行,但是如果是带条件的count又比较麻烦了

`count()`  是一个聚合函数，对于返回的结果集，一行行地判断，如果 count 函数的参数不是NULL，累计值就加 1，否则不加，最后返回累计值

| 用法        | 含义                                                         |
| ----------- | ------------------------------------------------------------ |
| count(主键) | InnoDB 引擎会遍历整张表，把每一行的 主键id 值都取出来，返回给服务层。<br/>服务层拿到主键后，直接按行进行累加(主键不可能为null) |
| count(字段) | **没有not null 约束** ：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层<br />  服务层判断是否为null，不为null，计数累加<br/>**有not null 约束** ：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加 |
| count(数字) | InnoDB 引擎遍历整张表，但不取值。服务层对于返回的每一行，放一个数字“1“进去，直接按行进行累加 |
| count(*)    | InnoDB引擎并不会把全部字段取出来，而是专门做了优化，不取值，服务层直接按行进行累加 |

按照效率排序的话，`count(字段) ` < `count(主键 id)` < `count(1)`  ≈ `count(*)`，所以尽量使用 `count(*)`