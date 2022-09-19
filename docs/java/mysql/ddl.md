# DDL数据库定义语言

数据定义语言：简称DDL(Data Definition Language)，用来定义数据库对象：数据库，表，列等。关键字：create，alter，drop等 

- 创建： create
- 修改： alter
- 删除： drop

## 库的管理

### 创建库

```mysql
create database 【if not exists】 库名【 character set 字符集名】;
```

``` mysql
CREATE DATABASE IF NOT EXISTS books;
```

### 修改库

```
alter database 库名 character set 字符集名;
```

### 修改库名

``` mysql
RENAME DATABASE books TO 新库名;
```

### 修改库的字符集

``` mysql
ALTER DATABASE books CHARACTER SET gbk;
```



### 删除库

```
drop database 【if exists】 库名;
```



## 表的管理

### 创建表

```
create table 表名(
	列名 列的类型【(长度) 约束】,
	列名 列的类型【(长度) 约束】,
	列名 列的类型【(长度) 约束】,
	...
	列名 列的类型【(长度) 约束】
)
```

**创建表Book表**

``` mysql
CREATE TABLE book ( 
	id INT, #编号
	bName VARCHAR ( 20 ), #图书名
	price DOUBLE, #价格
	authorId INT, #作者编号
	publishDate DATETIME #出版日期
);
```

**查看book表结构**

``` mysql
DESC book;
```

**创建表author**

``` mysql
CREATE TABLE IF NOT EXISTS author(
	id INT,
	au_name VARCHAR(20),
	nation VARCHAR(10)
)
```

[数据类型](#mysql数据类型)

### 修改表

### 添加列

```
alter table 表名 add column 列名 类型 【first|after 字段名】;
```

### 修改列的类型或约束

```
alter table 表名 modify column 列名 新类型 【新约束】;
```

### 修改列名

```
alter table 表名 change column 旧列名 新列名 类型;
```

### 删除列

```
alter table 表名 drop column 列名;
```

### 修改表名

```
alter table 表名 rename 【to】 新表名;
```

### 删除表

```
drop table【if exists】 表名;
```

### 复制表

### 复制表的结构

```
create table 表名 like 旧表;
```

### 复制表的结构+数据

```
create table 表名 
select 查询列表 from 旧表【where 筛选】;
```

**案例**

1. 向author表插入数据

   ``` mysql
   INSERT INTO author
   VALUES
   	( 1, '村上春树', '日本' ),
   	( 2, '莫言', '中国' ),
   	( 3, '冯唐', '中国' ),
   	( 4, '金庸', '中国' );
   ```

2. 创建表copy，复制author表的结构

   ```mysql
   CREATE TABLE copy LIKE author;
   ```

3. 创建表copy2，复制author表的结构和数据

   ```mysql
   CREATE TABLE copy2 
   SELECT * FROM author;
   ```

4. 创建表copy3，复制author表的`部分数据`

   ```mysql
   CREATE TABLE copy3
   SELECT id,au_name
   FROM author 
   WHERE nation='中国';
   ```

5. 创建表copy4，复制author表的`部分字段`

   ``` mysql
   CREATE TABLE copy4 
   SELECT id,au_name
   FROM author
   WHERE 0;
   ```

   

## MYSQL数据类型

| **分类**             | **类型名称**   | **说明**                                                     |
| -------------------- | -------------- | ------------------------------------------------------------ |
| **整数类型**         | tinyInt        | 很小的整数                                                   |
|                      | smallint       | 小的整数                                                     |
|                      | mediumint      | 中等大小的整数                                               |
|                      | int(integer)   | 普通大小的整数                                               |
| **小数类型**         | float          | 单精度浮点数                                                 |
|                      | double         | 双精度浮点数                                                 |
|                      | decimal（m,d） | 压缩严格的定点数                                             |
| **日期类型**         | year           | YYYY  1901~2155                                              |
|                      | time           | HH : MM : SS -838:59 : 59~838 : 59 : 59                      |
|                      | date           | YYYY-MM-DD 1000-01-01~9999-12-3                              |
|                      | datetime       | YYYY-MM-DD HH : MM : SS 1000-01-01 00 : 00 : 00~ 9999-12-31 23 : 59 : 59 |
|                      | timestamp      | YYYY-MM-DD HH : MM : SS 1970~01~01 00 : 00 : 01 UTC~2038-01-19 03 : 14 : 07UTC |
| **文本、二进制类型** | CHAR(M)        | M为0~255之间的整数                                           |
|                      | VARCHAR(M)     | M为0~65535之间的整数                                         |
|                      | TINYBLOB       | 允许长度0~255字节                                            |
|                      | BLOB           | 允许长度0~65535字节                                          |
|                      | MEDIUMBLOB     | 允许长度0~167772150字节                                      |
|                      | LONGBLOB       | 允许长度0~4294967295字节                                     |
|                      | TINYTEXT       | 允许长度0~255字节                                            |
|                      | TEXT           | 允许长度0~65535字节                                          |
|                      | MEDIUMTEXT     | 允许长度0~167772150字节                                      |
|                      | LONGTEXT       | 允许长度0~4294967295字节                                     |
|                      | VARBINARY(M)   | 允许长度0~M个字节的变长字节字符串                            |
|                      | BINARY(M)      | 允许长度0~M个字节的定长字节字符串                            |

### 数值型

### 整型

tinyint、smallint、mediumint、int/integer、bigint

**特点：**

1. 都可以设置无符号和有符号，默认有符号，通过unsigned设置无符号
2. 如果超出了范围，会报out or range异常，插入临界值
3. 长度可以不指定，默认会有一个长度，长度代表显示的最大宽度，如果不够则左边用0填充，但需要搭配zerofill，并且默认变为无符号整型

**如何设置无符号**

``` mysql
CREATE TABLE tab_int(
	t1 INT,
	t2 INT unsigned 
);
```

**显示长度**

``` mysql
CREATE TABLE tab_int(
	t1 INT(7) ZEROFILL,
	t2 INT(7) ZEROFILL 
);
```



### 浮点型

**定点数**：decimal(M,D)
**浮点数**:
	float(M,D) 
	double(M,D)

**特点：**

1. M代表整数部位+小数部位的个数，D代表小数部位
2. 如果超出范围，则报out or range异常，并且插入临界值
3. M和D都可以省略，但对于定点数，M默认为10，D默认为0
4. 如果精度要求较高，则优先考虑使用定点数

### 字符型

char、varchar、binary、varbinary、enum(用于保存枚举)、set(用于保存集合)、text、blob

char：固定长度的字符，写法为char(M)，最大长度不能超过M，其中M可以省略，默认为1

varchar：可变长度的字符，写法为varchar(M)，最大长度不能超过M，其中M不可以省略

Enum：又称为枚举类型哦，要求插入的值必须属于列表中指定的值之一。

Set：和Enum类型类似，里面可以保存0~64个成员。和Enum类型最大的区别是：SET类型一次可以选取多个成员，而Enum只能选一个

``` mysql
CREATE TABLE tab_char(
	c1 ENUM('a','b','c')
);

INSERT INTO tab_char VALUES('a');
INSERT INTO tab_char VALUES('b');
INSERT INTO tab_char VALUES('c');
INSERT INTO tab_char VALUES('m');	--> 会插入空字符 ''
INSERT INTO tab_char VALUES('A');	-->  会插入 'a'
```

``` mysql
CREATE TABLE tab_set(
	s1 SET('a','b','c','d')
);

INSERT INTO tab_set VALUES('a');
INSERT INTO tab_set VALUES('A,B');
INSERT INTO tab_set VALUES('a,c,d');
```



### 日期型

year年
date日期
time时间
datetime 日期+时间
timestamp 日期+时间 ，比较容易受时区、语法模式、版本的影响，更能反映当前时区的真实时间

## 常见的约束

- NOT NULL：非空，该字段的值必填
- UNIQUE：唯一，该字段的值不可重复
- DEFAULT：默认，该字段的值不用手动插入有默认值
- CHECK：检查，mysql不支持（但是设置并不会报错，只是没有效果）
- PRIMARY KEY：主键，该字段的值不可重复并且非空  unique+not null
- FOREIGN KEY：外键，该字段的值引用了另外的表的字段

添加约束的时机：

1. 创建表时
2. 修改表时

**约束的添加分类**：

		列级约束：
		
			六大约束语法上都支持，但外键约束没有效果
			
		表级约束：
			
			除了非空、默认，其他的都支持
### 主键和唯一

**区别：**

1. 一个表至多有一个主键，但可以有多个唯一
2. 主键不允许为空，唯一可以为空

|      | 保证唯一性 | 是否允许为空 | 一个表中可以有多少个 | 是否允许组合 |
| :--: | :--------: | :----------: | :------------------: | ------------ |
| 主键 |     √      |      ×       |      至多有1个       | √，但不推荐  |
| 唯一 |     √      |      √       |      可以有多个      | √，但不推荐  |

**外键：**

1. 要求在从表设置外键关系
2. 从表的外键列的类型和主表的关联列的类型要求一致或兼容，名称无要求
3. 主表的关联列`必须是一个key`（一般是主键或唯一）
4. 插入数据时，先插入主表，再插入从表
5. 删除数据时，先删除从表，再删除主表

### 创建表时添加约束

```
CREATE TABLE 表名(
	字段名 字段类型 列级约束,
	字段名 字段类型,
	表级约束
)
```

### 添加列级约束

直接在字段名和类型后面追加 约束类型即可。

只支持：默认、非空、主键、唯一

```mysql
# 创建一个数据库
CREATE DATABASE students;
USE students;
```

``` mysql
CREATE TABLE stuinfo (
	id INT PRIMARY KEY,#主键
	stuName VARCHAR ( 20 ) NOT NULL UNIQUE,#非空并且唯一
	gender CHAR ( 1 ) CHECK ( gender = '男' OR gender = '女' ),#检查
	seat INT UNIQUE,#唯一
	age INT DEFAULT 18,#默认约束
	majorId INT REFERENCES major ( id ) #外键，(没有效果)
);

CREATE TABLE major(
	id INT PRIMARY KEY,
	majorName VARCHAR(20)
);

# 查看stuinfo中的所有索引，包括主键、外键、唯一
SHOW INDEX FROM stuinfo;
```

### 添加表级约束

在各个字段的最下面

【constraint 约束名】 约束类型(字段名) 

``` mysql
DROP TABLE IF EXISTS stuinfo;
CREATE TABLE stuinfo (
	id INT,
	stuname VARCHAR ( 20 ),
	gender CHAR ( 1 ),
	seat INT,
	age INT,
	majorid INT,
	CONSTRAINT pk PRIMARY KEY ( id ),#主键
	CONSTRAINT uq UNIQUE ( seat ),#唯一键
	CONSTRAINT ck CHECK ( gender = '男' OR gender = '女' ),#检查
	CONSTRAINT fk_stuinfo_major FOREIGN KEY ( majorid ) REFERENCES major ( id ) #外键

);
```

### 通用写法

``` mysql
CREATE TABLE IF NOT EXISTS stuinfo (
		id INT PRIMARY KEY,
		stuname VARCHAR ( 20 ),
		sex CHAR ( 1 ),
		age INT DEFAULT 18,
		seat INT UNIQUE,
		majorid INT,
	CONSTRAINT fk_stuinfo_major FOREIGN KEY ( majorid ) REFERENCES major ( id ) 
);
```

### 修改表时添加约束

- 添加列级约束

```
alter table 表名 modify column 字段名 字段类型 新约束;
```

- 添加表级约束

```
alter table 表名 add 【constraint 约束名】 约束类型(字段名) 【外键的引用】;
```

``` mysql
DROP TABLE IF EXISTS stuinfo;
CREATE TABLE stuinfo(
	id INT,
	stuname VARCHAR(20),
	gender CHAR(1),
	seat INT,
	age INT,
	majorid INT
)
```

1. 添加非空约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN stuname VARCHAR(20)  NOT NULL;
   ```

   

2. 添加默认约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN age INT DEFAULT 18;
   ```

   

3. 添加主键

   ① 列级约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN id INT PRIMARY KEY;
   ```

   ② 表级约束

   ``` mysql
   ALTER TABLE stuinfo ADD PRIMARY KEY(id);
   ```

   

4. 添加唯一

   ① 列级约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN seat INT UNIQUE;
   ```

   ② 表级约束

   ``` mysql
   ALTER TABLE stuinfo ADD UNIQUE(seat);
   ```



5. 添加外键

   ``` mysql
   ALTER TABLE stuinfo 
   ADD CONSTRAINT fk_stuinfo_major FOREIGN KEY(majorid) REFERENCES major(id); 
   ```

### 修改表时删除约束

1. 删除非空约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN stuname VARCHAR(20) NULL;
   ```

   

2. 删除默认约束

   ``` mysql
   ALTER TABLE stuinfo MODIFY COLUMN age INT ;
   ```

   

3. 删除主键

   ``` mysql
   ALTER TABLE stuinfo DROP PRIMARY KEY;
   ```

   

4. 删除唯一

   ``` mysql
   ALTER TABLE stuinfo DROP INDEX seat;
   ```

   

5. 删除外键

   ``` mysql
   ALTER TABLE stuinfo DROP FOREIGN KEY fk_stuinfo_major;
   ```

## 自增长列

不用手动插入值，可以自动提供序列值，默认从1开始，步长为1

`auto_increment_increment`

如果要更改起始值：手动插入值

如果要更改步长：更改系统变量：`set auto_increment_increment=值;`

1. 一个表至多有一个自增长列
2. 自增长列只能支持数值型
3. 自增长列必须为一个key

### 创建表时设置自增长列

``` 
create table 表(
	字段名 字段类型 约束 auto_increment
)
```

### 修改表时设置自增长列

```
alter table 表 modify column 字段名 字段类型 约束 auto_increment
```

### 删除自增长列

```
alter table 表 modify column 字段名 字段类型 约束 
```

