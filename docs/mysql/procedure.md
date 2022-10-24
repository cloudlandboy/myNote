# 存储过程

**什么是存储过程：**

> 事先经过编译并存储在数据库中的一段sql语句的集合。
>
> 类似于java中的方法



**使用好处**

1. 简化应用开发人员的很多工作
2. 减少数据在数据库和应用服务器之间的传输
3. 提高了数据处理的效率
4. 

一组预先编译好的SQL语句的集合，理解成批处理语句

## 创建语法

```
CREATE PROCEDURE 存储过程名(参数列表)
BEGIN

	存储过程体（一组合法的SQL语句）
END
```



**参数列表包含三部分**

- 参数模式
- 参数名
- 参数类型

> 例：in stuname varchar(20)



**参数模式：**

`in`：该参数可以作为输入，也就是该参数需要调用方传入值

`out`：该参数可以作为输出，也就是该参数可以作为返回值

`inout`：该参数既可以作为输入又可以作为输出，也就是该参数既需要传入值，又可以返回值



- 如果存储过程体仅仅只有一句话，begin end可以省略

- 存储过程体中的每条sql语句的结尾要求必须加分号。

- 存储过程的结尾可以使用 delimiter 重新设置（避免与存储过程体的分号混淆）

  ```
  delimiter 结束标记
  # 例
  delimiter $
  ```

**例：**

插入到admin表中五条记录

``` mysql
USE girls;

DELIMITER $
CREATE PROCEDURE myp1()
BEGIN
	INSERT INTO admin(username,`password`) 
	VALUES
	('john1','0000'),('lily','0000'),('rose','0000'),('jack','0000'),('tom','0000');
END $
```

## 调用语法

``` 
CALL 存储过程名(实参列表);
```

``` mysql
CALL myp1();
```



## 创建带in模式参数的存储过程

创建存储过程实现 根据女神名，查询对应的男神信息

``` mysql
DELIMITER $
CREATE PROCEDURE myp2(IN beautyName VARCHAR(20))
BEGIN
	SELECT bo.*
	FROM boys bo
	RIGHT JOIN beauty b ON bo.id = b.boyfriend_id
	WHERE b.name=beautyName;
END $
```

``` mysql
CALL myp2('赵敏');
```

创建存储过程实现，判断用户是否登录成功

``` mysql
DELIMITER $
CREATE PROCEDURE myp3(IN username VARCHAR(20),IN PASSWORD VARCHAR(20))
BEGIN
	DECLARE result INT DEFAULT 0;	#声明并初始化
	
	SELECT COUNT(*) INTO result	#赋值
	FROM admin
	WHERE admin.username = username
	AND admin.password = PASSWORD;
	
	SELECT IF(result>0,'成功','失败');	#使用
END $
```



``` mysql
CALL myp3('john','8888');
CALL myp3('john','1234');
```



## 创建out模式参数的存储过程

根据输入的女神名，返回对应的男神名

``` mysql
DELIMITER $
CREATE PROCEDURE myp4(IN beautyName VARCHAR(20),OUT boyName VARCHAR(20))
BEGIN
	SELECT bo.boyname INTO boyname
	FROM boys bo
	RIGHT JOIN
	beauty b ON b.boyfriend_id = bo.id
	WHERE b.name=beautyName ;
END $
```

``` mysql
# 调用 使用自定义变量接收
CALL myp4('赵敏',@name);
SELECT @name;
```

根据输入的女神名，返回对应的男神名和魅力值

``` mysql
DELIMITER $
CREATE PROCEDURE myp5(IN beautyName VARCHAR(20),OUT boyName VARCHAR(20),OUT usercp INT) 
BEGIN
	SELECT boys.boyname ,boys.usercp INTO boyname,usercp
	FROM boys 
	RIGHT JOIN
	beauty b ON b.boyfriend_id = boys.id
	WHERE b.name=beautyName ;
	
END $
```

``` mysql
CALL myp5('小昭',@name,@cp);
SELECT @name,@cp;
```



## 创建带inout模式参数的存储过程

传入a和b两个值，最终a和b都翻倍并返回

``` mysql
DROP PROCEDURE IF EXISTS myp5;

DELIMITER $
CREATE PROCEDURE myp5(INOUT a INT,INOUT b INT)
BEGIN

	SET a:=a*2;
	SET b:=b*2;

END $
```

``` mysql
SET @m=10;
SET @n=20;
CALL myp5(@m,@n);
SELECT @m,@n;
```



## 查看存储过程的信息

``` mysql
SHOW CREATE PROCEDURE myp5;
```

