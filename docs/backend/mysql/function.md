# 存储函数

## 存储过程与存储函数的区别

> 存储过程：可以有0个返回，也可以有多个返回，适合做批量插入、批量更新
>
> 存储函数：有且仅有1 个返回，适合做处理数据后返回一个结果



## 创建语法

```
CREATE FUNCTION 函数名(参数列表) RETURNS 返回类型
BEGIN
	函数体
END
```



- 参数列表 包含两部分：参数名，参数类型
- 函数体：
  - 肯定会有return语句，如果没有会报错 如果return语句没有放在函数体的最后也不报错，但不建议
  - 函数体中仅有一句话，则可以省略begin end
- 使用 delimiter语句设置结束标记

## 调用语法

```
SELECT 函数名(参数列表);
```



## 无参有返回

返回公司的员工个数

``` mysql
USE myemployees;
DELIMITER //
CREATE FUNCTION myf1() RETURNS INT
BEGIN

	DECLARE c INT DEFAULT 0;	#定义局部变量
	SELECT COUNT(*) INTO c 	#赋值
	FROM employees;
	RETURN c;
	
END //
```

``` mysql
SELECT myf1();
```



## 有参有返回

根据员工名，返回它的工资

``` mysql
DELIMITER //
CREATE FUNCTION myf2(empName VARCHAR(20)) RETURNS DOUBLE
BEGIN
	SET @sal=0;	#定义用户变量 
	SELECT salary INTO @sal	#赋值
	FROM employees
	WHERE last_name = empName;
	
	RETURN @sal;
	
END //
```

``` mysql
SELECT myf2('Kochhar');

SELECT @sal;
```

根据部门名，返回该部门的平均工资

``` mysql
DELIMITER //
CREATE FUNCTION myf3(deptName VARCHAR(20)) RETURNS DOUBLE
BEGIN
	DECLARE sal DOUBLE ;
	SELECT AVG(salary) INTO sal
	FROM employees e
	JOIN departments d ON e.department_id = d.department_id
	WHERE d.department_name=deptName;
	RETURN sal;
END //
```

``` mysql
SELECT myf3('IT');
```



## 查看函数

``` mysql
SHOW CREATE FUNCTION myf3;
```



### 删除函数

``` mysql
DROP FUNCTION myf3;
```



创建函数，实现传入两个float，返回二者之和

``` mysql
DELIMITER //
CREATE OR REPLACE FUNCTION myf3(num1 FLOAT,num2 FLOAT) RETURNS FLOAT(3,1)
BEGIN
	DECLARE SUM FLOAT(3,1) DEFAULT 0;
	SET SUM=num1+num2;
	RETURN SUM;
END //
```

``` mysql
SELECT myf3(15.5,15.3);	--> 30.8
```

