# 变量

## 系统变量

系统变量：

- 全局变量
- 会话变量

说明：变量由系统定义，不是用户定义，属于服务器层面

注意：全局变量需要添加global关键字，会话变量需要添加session关键字，如果不写，默认会话级别



1. 查看所有系统变量

   ``` mysql
   # 全局
   show global variables;
   
   #会话
   show【session】variables;
   ```

2. 查看满足条件的部分系统变量

   ``` mysql
   show global |【session】 variables like '%char%';
   ```

3. 查看指定的系统变量的值（`带.`）

   ``` mysql
   select @@global |【@@session】.系统变量名;
   ```

4. 为某个系统变量赋值

   - 方式一 

     ``` mysql
     set global|【session】系统变量名=值;
     ```

   - 方式二（`带.`）

     ``` mysql
     set @@global|【@@session】.系统变量名=值;
     ```

     

**例如：**

``` mysql
# 查看所有全局变量
SHOW GLOBAL VARIABLES;
# 查看满足条件的部分系统变量
SHOW GLOBAL VARIABLES LIKE '%char%';
# 查看指定的系统变量的值
SELECT @@global.autocommit;
# 为某个系统变量赋值
SET @@global.autocommit=0;
SET GLOBAL autocommit=0;
```



``` mysql
# 查看所有会话变量
SHOW SESSION VARIABLES;
# 查看满足条件的部分会话变量
SHOW SESSION VARIABLES LIKE '%char%';
# 查看指定的会话变量的值
SELECT @@autocommit;
SELECT @@session.tx_isolation;
# 为某个会话变量赋值
SET @@session.tx_isolation='read-uncommitted';
SET SESSION tx_isolation='read-committed';
```



## 自定义变量

变量由用户自定义，而不是系统提供的

作用域：针对于当前会话（连接）有效，作用域同于会话变量

**声明并初始化**

赋值操作符：`=`或`:=`

``` mysql
SET @变量名=值;
SET @变量名:=值;
SELECT @变量名:=值;
```

**更新变量的值**

- 方式一

  ``` mysql
  SET @变量名=值;
  SET @变量名:=值;
  SELECT @变量名:=值;
  ```

- 方式二

  ``` mysql
  SELECT 字段 INTO @变量名
  FROM 表;
  ```

**查看变量的值**

``` mysql
SELECT @变量名;
```



## 局部变量

作用域：仅仅在定义它的begin end块中有效

应在 begin end中的第一句话声明

**声明**

``` mysql
DECLARE
	变量名 类型;
	...
END

# 

DECLARE 
	变量名 类型 【DEFAULT 值】;
	...
END
```

**赋值（更新变量的值）**

- 方式一

  ``` mysql
  SET 局部变量名=值;
  SET 局部变量名:=值;
  SELECT 局部变量名:=值;
  ```

- 方式二

  ``` mysql
  SELECT 字段 INTO 具备变量名
  FROM 表;
  ```



**查看变量的值**

``` mysql
SELECT 局部变量名;
```



## 案例

1. 声明两个用户变量，求和并打印

   ``` mysql
   SET @m=1;
   SET @n=1;
   SET @sum=@m+@n;
   SELECT @sum;
   ```