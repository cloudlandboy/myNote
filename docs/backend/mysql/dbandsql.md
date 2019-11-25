# 数据库和SQL概述

## 数据库的好处

- 实现数据持久化
- 使用完整的管理系统统一管理，易于查询

## 数据库的概念

DB
DBMS
SQL
数据库（database）：存储数据的“仓库”。它保存了一系列有组织的数据。
数据库管理系统（Database Management System）。数据库是通过DBMS创
建和操作的容器
结构化查询语言（Structure Query Language）：专门用来与数据库通信的语
言

常见的数据库管理系统：MySQL、Oracle、DB2、SqlServe

## SQL语言

数据库是不认识JAVA语言的，但是我们同样要与数据库交互，这时需要使用到数据库认识的语言SQL语句，它是数据库的代码。

结构化查询语言(Structured Query Language)简称SQL，是一种数据库查询和[程序设计语言](http://baike.baidu.com/view/128511.htm)，用于存取数据以及查询、更新和管理[关系数据库系统](http://baike.baidu.com/view/549699.htm)。

创建数据库、创建数据表、向数据表中添加一条条数据信息均需要使用SQL语句。

### DML

DML（Data Manipulation Language):数据操纵语句，用于添加、删除、修改、查询数据库记录，并检查数据完整性。包括如下SQL语句等：

- INSERT：添加数据到数据库中
- UPDATE：修改数据库中的数据
- DELETE：删除数据库中的数据
- **SELECT：选择（查询）数据**
  - SELECT是SQL语言的基础，最为重要。

### DDL

DDL（Data Definition Language):数据定义语句，用于库和表的创建、修改、删除。包括如下SQL语句等：

- CREATE TABLE：创建数据库表
- ALTER TABLE：更改表结构、添加、删除、修改列长度
- DROP TABLE：删除表
- CREATE INDEX：在表上建立索引
- DROP INDEX：删除索引

### DCL

DCL（Data Control Language):数据控制语句，用于定义用户的访问权限和安全级别包括如下SQL语句等：

- GRANT：授予访问权限
- REVOKE：撤销访问权限
- COMMIT：提交事务处理
- ROLLBACK：事务处理回退
- SAVEPOINT：设置保存点
- LOCK：对数据库的特定部分进行锁定

### DQL

数据查询语言：简称DQL(Data Query Language)，用来查询数据库中表的记录。关键字：select，from，where等