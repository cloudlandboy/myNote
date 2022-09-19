# DML数据处理之增删改

DML(Data Manipulation Language –数据操纵语言) 可以在下列条件下执行:

- 向表中插入数据
- 修改现存数据
- 删除现存数据

**事务是由完成若干项工作的DML语句组成的**

运行以下脚本创建表my_employees

``` mysql
USE myemployees;
CREATE TABLE my_employees(
	Id INT(10),
	First_name VARCHAR(10),
	Last_name VARCHAR(10),
	Userid VARCHAR(10),
	Salary DOUBLE(10,2)
);
CREATE TABLE users(
	id INT,
	userid VARCHAR(10),
	department_id INT

);
```

显示表my_employees的结构

```mysql
DESC my_employees;
```

## INSERT

### 方式一

### 语法

``` 
insert into 表名(字段名,...) values(值,...);
```

### 特点

1. 要求值的类型和字段的类型要一致或兼容

2. 字段的个数和顺序不一定与原始表中的字段个数和顺序一致

   `但必须保证值和字段一一对应`

3. 假如表中有可以为null的字段，注意可以通过以下两种方式插入null值

   ① 字段和值都省略  
   ② 字段写上，值使用null

4. 字段和值的个数必须一致
5. 字段名可以省略，默认所有列

### 方式二

语法

```
insert into 表名 set 字段=值,字段=值,...;
```

**两种方式的区别：**

1. 方式一支持一次插入多行，语法如下：

   ```
   insert into 表名【(字段名,..)】 values(值，..),(值，...),...;
   ```

   

2. 方式一支持子查询，语法如下：

   ```
   insert into 表名
   查询语句;
   ```

### 向表中插入数据

向my_employees表中插入下列数据

| ID   | FIRST_NAME | LAST_NAME | USERID   | SALARY |
| ---- | ---------- | --------- | -------- | ------ |
| 1    | patel      | Ralph     | Rpatel   | 895    |
| 2    | Dancs      | Betty     | Bdancs   | 860    |
| 3    | Biri       | Ben       | Bbiri    | 1100   |
| 4    | Newman     | Chad      | Cnewman  | 750    |
| 5    | Ropeburn   | Audrey    | Aropebur | 155    |

``` mysql
INSERT INTO my_employees
VALUES
	( 1, 'patel', 'Ralph', 'Rpatel', 895 ),
	( 2, 'Dancs', 'Betty', 'Bdancs', 860 ),
	( 3, 'Biri', 'Ben', 'Bbiri', 1100 ),
	( 4, 'Newman', 'Chad', 'Cnewman', 750 ),
	( 5, 'Ropeburn', 'Audrey', 'Aropebur', 1550 );
```

或者

``` mysql
# 先删除表数据
DELETE FROM my_employees;
# 再插入
INSERT INTO my_employees
SELECT 1,'patel','Ralph','Rpatel',895 UNION
SELECT 2,'Dancs','Betty','Bdancs',860 UNION
SELECT 3,'Biri','Ben','Bbiri',1100 UNION
SELECT 4,'Newman','Chad','Cnewman',750 UNION
SELECT 5,'Ropeburn','Audrey','Aropebur',1550;
```

向users表中插入数据

``` mysql
INSERT INTO users
VALUES
	( 1, 'Rpatel', 10 ),
	( 2, 'Bdancs', 10 ),
	( 3, 'Bbiri', 20 );
```

## UPDATE

### 修改单表的记录

### 语法

```
update 表名 set 字段=值,字段=值 【where 筛选条件】;
```

1. 将3号员工的last_name修改为“drelxer”

   ``` mysql
   UPDATE my_employees SET last_name='drelxer' WHERE id = 3;
   ```

2. 将所有工资少于900的员工的工资修改为1000

   ``` mysql
   UPDATE my_employees SET salary=1000 WHERE salary<900;
   ```

### 修改多表的记录

### 语法

``` 
update 表1 别名 
left|right|inner join 表2 别名 
on 连接条件  
set 字段=值,字段=值 
【where 筛选条件】;
```

## DELETE

### 删除单表的记录

### 语法

```
delete from 表名 【where 筛选条件】【limit 条目数】
```

### 级联删除

### 语法

```
delete 别名1,别名2 from 表1 别名 
inner|left|right join 表2 别名 
on 连接条件
 【where 筛选条件】
```

1. 将userid 为Bbiri的user表和my_employees表的记录全部删除

   ``` mysql
   DELETE u,e 
   FROM
   	users u
   	JOIN my_employees e 
   ON u.`userid` = e.`Userid` 
   WHERE
   	u.`userid` = 'Bbiri';
   ```

   

2. 删除所有数据

   ```
   DELETE FROM my_employees;
   DELETE FROM users;
   ```

## TRUNCATE

清空表

### 语法

```
truncate table 表名
```

## DELETE和TRUNCATE的区别

1. truncate删除后，如果再插入，标识列从1开始。delete删除后，如果再插入，标识列从断点开始
2. delete可以添加筛选条件，truncate不可以添加筛选条件
3. truncate效率较高
4. truncate没有返回值，delete可以返回受影响的行数
5. truncate不可以回滚，delete可以回滚