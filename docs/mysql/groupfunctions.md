# 分组函数

用作统计使用，又称为聚合函数或统计函数或组函数

## SUM(expression)

​	求和

```mysql
SELECT SUM(salary) FROM employees;
```

## AVG(expression)

​	平均值

``` mysql
SELECT AVG(salary) FROM employees;
```



## MAX(expression)

​	最大值

``` mysql
SELECT MAX(salary) FROM employees;
```



## MIN(expression)

​	最小值

``` mysql
SELECT MIN(salary) FROM employees;
```



## COUNT(expression)

​	计算个数

``` mysql
SELECT COUNT(salary) FROM employees;
```

``` mysql
SELECT COUNT(*) FROM employees;
```

``` mysql
SELECT COUNT(1) FROM employees;
```

效率：
`MYISAM`存储引擎下  ，COUNT(*)的效率高
`INNODB`存储引擎下，COUNT(*)和COUNT(1)的效率差不多，比COUNT(字段)要高一些

------



``` mysql
SELECT
	SUM( salary ) 和,
	AVG( salary ) 平均,
	MAX( salary ) 最高,
	MIN( salary ) 最低,
	COUNT( salary ) 个数 
FROM
	employees;
```

平均工资保留两位小数(四舍五入)

``` mysql
SELECT
	SUM( salary ) 和,
	ROUND( AVG( salary ), 2 ) 平均,
	MAX( salary ) 最高,
	MIN( salary ) 最低,
	COUNT( salary ) 个数 
FROM
	employees;
```

## 参数支持哪些类型

### 字符

先试图将字符转换成数值，如果转换成功，则继续运算；否则转换成0，再做运算

``` mysql
SELECT
	SUM( last_name ),
	AVG( last_name ) 
FROM
	employees;
	
--> 0,0
```

与排序差不多

``` mysql
SELECT
	MAX( last_name ),
	MIN( last_name ) 
FROM
	employees;
```



### 日期

``` mysql
SELECT SUM(hiredate) ,AVG(hiredate) FROM employees;
```



``` mysql
SELECT MAX(hiredate),MIN(hiredate) FROM employees;
```





## 特点

1. sum、avg一般用于处理数值型

2. max、min、count可以处理任何类型
3. 以上分组函数都忽略null值
4. 可以和distinct搭配实现去重的运算
5. 一般使用count(*)用作统计行数
6. 和分组函数一同查询的字段要求是group by后的字段

## 案例

1. 查询员工表中的最大入职时间和最小入职时间的相差天数 （DIFFRENCE）

   ``` mysql
   SELECT
   	MAX( hiredate ) 最大,
   	MIN( hiredate ) 最小,
   	(MAX( hiredate )- MIN( hiredate ))/ 1000 / 3600 / 24 DIFFRENCE 
   FROM
   	employees;
   ```

   使用DATEDIFF(d1,d2)函数，计算日期 d1～d2 之间相隔的天数

   ``` mysql
   SELECT DATEDIFF(MAX(hiredate),MIN(hiredate)) DIFFRENCE;
   ```

   

2. 查询部门编号为90的员工个数

   ``` mysql
   SELECT
   	COUNT(*) 
   FROM
   	employees 
   WHERE
   	department_id = 90;
   ```

   