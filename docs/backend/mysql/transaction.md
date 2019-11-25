# MySQL事物

TCL：`Transaction Control Language` 事务控制语言

> 事务由单独单元的一个或多个SQL语句组成，在这个单元中，每个MySQL语句是相互依赖的。而整个单独单元作为一个不可分割的整体，如果单元中某条SQL语句一旦执行失败或产生错误，整个单元将会回滚。所有受到影响的数据将返回到事物开始以前的状态；如果单元中的所有SQL语句均执行成功，则事物被顺利执行。

!> 一个或一组sql语句组成一个执行单元，这个执行单元要么**全部执行**，要么**全部不执行**。

- 概念：在mysql中的数据用各种不同的技术存储在文件（或内存）中。
- 通过show engines；来查看mysql支持的存储引擎。
- 在mysql中用的最多的存储引擎有：innodb，myisam ,memory 等。其中`innodb`支持事务，而myisam、memory等不支持

## 转账案例

张三丰转给郭襄500元

```
# 张三丰  1000
# 郭襄	1000

update 表 set 张三丰的余额=张三丰的余额-500 where name='张三丰'

#　中间发生意外，张三丰的余额少了500，而郭襄的余额并没有增加

update 表 set 郭襄的余额=郭襄的余额+500 where name='郭襄'
```



## 事务的特性(ACID)

1. **原子性**（Atomicity）

   原子性是指事务是一个不可分割的工作单位，事务中的操作要么都发生，要么都不发生。

2. **一致性**（Consistency）

   事务必须使数据库从一个一致性状态变换到另外一个一致性状态。

3. **隔离性**（Isolation）

   事务的隔离性是指一个事务的执行不能被其他事务干扰，即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。

4. **持久性**（Durability）

   持久性是指一个事务一旦被提交，它对数据库中数据的改变就是永久性的，接下来的其他操作和数据库故障不应该对其有任何影响

## 事务的创建

### 隐式事务

事务没有明显的开启和结束的标记，比如insert、update、delete语句

``` mysql
# 执行完表中id列为1的那一行数据就直接被删除了
delete from 表 where id =1;
```

### 显式事务

事务具有明显的开启和结束的标记

!> 前提：必须先设置自动提交功能为禁用 `set autocommit=0;`



``` mysql
# 查看自动提交是否开启
SHOW VARIABLES LIKE 'autocommit';

# 查看数据库引擎
SHOW ENGINES;
```



### 开启事物步骤

1. 开启事务

   ``` mysql
   # 关闭自动提交
   set autocommit=0;
   
   #　开启事物（可选）
   start transaction;
   ```

   

2. 编写事务中的sql语句(select insert update delete)

3. 可选：`savepoint 节点名`;设置回滚点

4. 结束事务

   ``` mysql
   commit;提交事务
   # 或者
   rollback;回滚事务
   # 或者
   rollback to 回滚点名;回滚到指定的地方
   ```

   

## 并发事务

1. 事务的并发问题是如何发生的？

   多个事务 同时 操作 同一个数据库的相同数据时

2. 并发问题都有哪些？

   **<span style='color: red'>脏读: </span>**对于两个事务 T1, T2, T1 读取了已经被 T2 更新但还没有被提交的字段. 之后, 若 T2 回滚, T1读取的内容就是临时且无效的

   **<span style='color: red'>不可重复读: </span>**对于两个事务T1, T2, T1 读取了一个字段, 然后 T2 更新了该字段. 
   之后, T1再次读取同一个字段, 值就不同了(在一个事物中不管读多少次，读取的数据应该都一样)

   **<span style='color: red'>幻读: </span>**对于两个事务T1, T2, T1 从一个表中读取了一个字段, 然后 T2 在该表中插入了一些新的行. 之后, 如果 T1 再次读取同一个表, 就会多出几行

3. 如何解决并发问题

   通过设置隔离级别来解决并发问题

## 事物隔离级别

√：已解决

| 隔离级别                  | 脏读 | 不可重复读 | 幻读 |
| ------------------------- | :--: | :--------: | :--: |
| read uncommitted:读未提交 |  ×   |     ×      |  ×   |
| read committed：读已提交  |  √   |     ×      |  ×   |
| repeatable read：可重复读 |  √   |     √      |  ×   |
| serializable：串行化      |  √   |     √      |  √   |

`mysql`中默认 第三个隔离级别 `repeatable read`

`oracle`中默认第二个隔离级别 `read committed`

**查看隔离级别**

``` mysql
select @@tx_isolation;
```

**设置隔离级别**

``` mysql
# 设置当前 mySQL 连接的隔离级别: 
set transaction isolation level read committed;

# 设置数据库系统的全局的隔离级别:
set global transaction isolation level read committed;
```

## 案例

1. 事务的使用步骤

   ``` mysql
   # 开启事务
   SET autocommit=0;
   START TRANSACTION;
   # 编写一组事务的语句
   UPDATE account SET balance = 1000 WHERE username='张无忌';
   UPDATE account SET balance = 1000 WHERE username='赵敏';
   
   # 结束事务
   ROLLBACK;
   # COMMIT;
   
   SELECT * FROM account;
   ```

2. 事务对于delete和truncate的处理的区别

   ```mysql
   SET autocommit=0;
   START TRANSACTION;
   
   DELETE FROM account;
   ROLLBACK;
   ```

   TRUNCATE 无法回滚

   ``` mysql
   SET autocommit=0;
   START TRANSACTION;
   
   TRUNCATE TABLE account;
   ROLLBACK;
   ```

3. savepoint 的使用

   ``` mysql
   SET autocommit=0;
   START TRANSACTION;
   DELETE FROM account WHERE id=25;
   SAVEPOINT a;#设置保存点
   DELETE FROM account WHERE id=28;
   ROLLBACK TO a;#回滚到保存点
   
   SELECT * FROM account;
   ```

   

   

