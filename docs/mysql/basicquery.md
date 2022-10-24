# 基本查询

> [SQL文件](https://www.lanzous.com/i763iqf)

## SELECT 语句

> **SELECT** *****|{[DISTINCT] **column**|expression [alias],...}**FROM** **table**

- **SELECT** 标识选择哪些列。
- **FROM** 标识从哪个表中选

语法：

``` mysql
select 查询列表 from 表名;
```

特点：

1. 查询列表可以是：表中的字段、常量值、表达式、函数
2. 查询的结果是一个虚拟的表格

查询全部列:

``` mysql
SELECT *FROM 表名;
```

查询特定的列:

``` mysql
SELECT id, name FROM student;
```

查询表达式:

``` mysql
 SELECT 100%98;
```

查询函数:

``` mysql
select now();
```

## 查询时给列的别名

别名使用双引号，以便在别名中包含空格或特殊的字符

 ①便于理解
 ②如果要查询的字段有重名的情况，使用别名可以区分开来

1. 使用**as**

   ``` mysql
   SELECT 列名1 AS "列1别名",列名2 AS "列2别名" FROM 表名;
   ```

   案例:

   ``` mysql
   SELECT 100%98 AS "结果";
   SELECT last_name AS "姓",first_name AS "名" FROM employees;
   ```

2. 使用**空格**

   ``` mysql
   SELECT 列名1 "列1别名",列名2 "列2别名" FROM 表名;
   ```

   案例:

   ``` mysql
   # 查询salary，显示结果为 out put
   SELECT salary AS "out put" FROM employees;
   ```

   

## 查询去重

``` mysql
select distinct 字段名 from 表名;
```

``` mysql
# 案例：查询员工表中涉及到的所有的部门编号
SELECT DISTINCT department_id FROM employees;
```

## +号的作用

`java`中的+号：
①运算符，两个操作数都为数值型
②连接符，只要有一个操作数为字符串

`mysql`中的+号：
仅仅只有一个功能：运算符

``` mysql
# 直接运算
select 数值+数值;

# 先试图将字符转换成数值，如果转换成功，则继续运算；否则转换成0，再做运算
select 字符+数值;

# 结果都为null
select null+值;
```

## concat函数

功能：拼接字符，相当于java中的 `"1"+"23"="123"`

``` mysql
select concat(字符1，字符2，字符3,...);
```

## ifnull函数

功能：判断某字段或表达式是否为null，如果为null 返回指定的值，否则返回原本的值

``` mysql
# 如果commission_pct列为空则返回0
select ifnull(commission_pct,0) from employees;
```

## isnull函数

功能：判断某字段或表达式是否为null，如果是，则返回1，否则返回0