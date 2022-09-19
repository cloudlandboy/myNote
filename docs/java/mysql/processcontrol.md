# 流程控制结构

## 分支结构

### if函数

**语法**：`if(条件,值1，值2)`

**功能**：实现双分支

应用在begin end中或外面

### case结构

类似java中的switch

**功能**：实现多分支

应用在begin end 中或外面

**语法一**：

```
case 表达式或字段
when 值1 then 语句1;
when 值2 then 语句2；
...
else 语句n;
end [case];
```

**语法二**：

```
case 
when 条件1 then 语句1;
when 条件2 then 语句2；
...
else 语句n;
end [case];
```



创建函数，实现传入成绩，如果成绩>90,返回A，如果成绩>80,返回B，如果成绩>60,返回C，否则返回D

```mysql
DELIMITER //
CREATE OR REPLACE FUNCTION test_case(score DOUBLE) RETURNS CHAR
BEGIN
-- DECLARE result CHAR;
CASE  
	WHEN score>90 THEN
		RETURN 'A';
	WHEN score>80 THEN 
		RETURN 'B';
	WHEN score>60 THEN
		RETURN 'C';
	ELSE
		RETURN 'D';
END CASE;

END //
```

```mysql
SELECT test_case(95);

SELECT test_case(85);

SELECT test_case(75);

SELECT test_case(55);
```



### if结构

**功能**：实现多分支

只能放在begin end中

**语法：**

```
if 条件1 then 语句1;
elseif 条件2 then 语句2;
...
else 语句n;
end if;
```

创建函数，实现传入成绩，如果成绩>90,返回A，如果成绩>80,返回B，如果成绩>60,返回C，否则返回D

```mysql
DELIMITER //
CREATE OR REPLACE FUNCTION test_if(score DOUBLE) RETURNS CHAR 
BEGIN 
	DECLARE result CHAR;
	IF score>90 THEN
		SET result:='A';
	ELSEIF score>80 THEN
		SET result:='B';
	ELSEIF score>60 THEN
		SET result:='C';
	ELSE
		SET result:='D';
	END IF;
	RETURN result;
END //
```

``` mysql
SELECT test_if(95);

SELECT test_if(85);

SELECT test_if(75);

SELECT test_if(55);
```

创建存储过程，如果工资<2000,则删除，如果5000>工资>2000,则涨工资1000，否则涨工资500

```mysql
DELIMITER //
CREATE OR REPLACE PROCEDURE test_if2(IN salary DOUBLE)
BEGIN

	IF salary<2000 THEN
			DELETE FROM employees WHERE employees.salary=salary;
	ELSEIF 2000<salary<5000 THEN 
			UPDATE employees SET employees.salary=employees.salary+1000 WHERE employees.salary=salary; 
	ELSE
			UPDATE employees SET employees.salary=employees.salary+500 WHERE employees.salary=salary; 
	END IF;
END //
```

```mysql
CALL test_if2(3300.00);
```



## 循环结构

**分类**：`while`、`loop`、`repeat`

**循环控制**：

`iterate`类似于 `continue`，继续，结束本次循环，继续下一次

`leave` 类似于  `break`，跳出，结束当前所在的循环

只能放在begin end中

**标签**：用上循环控制就必须要加

### while

```
[标签:] while 循环条件 do
	循环体;
end while [标签];
```

批量插入，根据次数插入到admin表中多条记录

```mysql
USE girls;

DELIMITER //
CREATE OR REPLACE PROCEDURE test_while(IN total INT)
BEGIN

DECLARE i INT DEFAULT 0;

WHILE i<total DO
	INSERT INTO admin VALUES(NULL,CONCAT('员工',i),'8888');
	SET i:=i+1;
END WHILE;

END //
```

```mysql
CALL test_while(10);
```

批量插入，根据次数插入到admin表中多条记录，如果次数>20则停止 <span style="color:red">（需要加标签）</span>

````mysql
DELIMITER //
CREATE OR REPLACE PROCEDURE test_while(IN total INT)
BEGIN

DECLARE i INT DEFAULT 1;

a:WHILE i<=total DO
	IF i>20 THEN LEAVE a;
	END IF;
	INSERT INTO admin VALUES(NULL,CONCAT('员工',i),'8888');
	SET i:=i+1;
END WHILE a;

END //
````

```mysql
TRUNCATE TABLE admin;
CALL test_while(100);
```



批量插入，根据次数插入到admin表中多条记录，只插入偶数次

```mysql
DELIMITER //
CREATE OR REPLACE PROCEDURE test_while(IN total INT)
BEGIN

DECLARE i INT DEFAULT 0;

a:WHILE i<=total DO
	SET i:=i+1;
	IF MOD(i,2)!=0 THEN ITERATE a;
	END IF;
	INSERT INTO admin VALUES(NULL,CONCAT('员工',i),'8888');
	
END WHILE a;

END //

```

```mysql
TRUNCATE TABLE admin;
CALL test_while(20);
```





### loop

```
[标签:] loop

	循环体;

end loop [标签];

```



### repeat

```
[标签] repeat
	循环体;
until 结束循环的条件
end repeat [标签];
```

