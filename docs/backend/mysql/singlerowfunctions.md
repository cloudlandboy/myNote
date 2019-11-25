# 单行函数

## 字符函数

### length(s)

获取参数值的字符个数

``` mysql
SELECT LENGTH('john');
SELECT LENGTH('张三丰hahaha');
```

### CONCAT(s1,s2...sn)

 拼接字符串

``` mysql
SELECT CONCAT(last_name,'_',first_name) 姓名 FROM employees;
```

### UPPER(s)

将字符串转换为大写

``` mysql
SELECT UPPER('john');
```

### LOWER(s)

将字符串转换为小写

``` mysql
SELECT LOWER('joHn');
```

``` mysql
# 示例：将姓变大写，名变小写，然后拼接
SELECT CONCAT(UPPER(last_name),LOWER(first_name))  姓名 FROM employees;
```

### SUBSTR(s, start, length)、SUBSTRING()

SUBSTR(s, start, length)：从字符串 s 的 start 位置截取长度为 length 的子字符串



截取字符串（注意：索引从1开始）

``` mysql
SELECT SUBSTR('李莫愁爱上了陆展元',7)  out_put;
```

``` mysql
SELECT SUBSTRING('李莫愁爱上了陆展元',7)  out_put;
```

``` mysql
SELECT SUBSTR('李莫愁爱上了陆展元',1,3)  out_put;
```

``` mysql
# 案例：姓名中首字符大写，其他字符小写然后用_拼接，显示出来

SELECT CONCAT(UPPER(SUBSTR(last_name,1,1)),'_',LOWER(SUBSTR(last_name,2)))  out_put
FROM employees;
```



### INSTR(s,s)

返回子串第一次出现的索引，如果找不到返回0

``` mysql
SELECT INSTR('杨不殷六侠悔爱上了殷六侠','殷八侠') AS out_put;
```



### TRIM(s)

LTRIM(s)：去掉字符串 s **开始**处的空格

RTRIM(s)：去掉字符串 s **结尾**处的空格

 去掉字符串开始和结尾处的空格

``` mysql
SELECT LENGTH(TRIM('    张翠山    ')) AS out_put;
```



### LPAD(s1,len,s2)

在字符串 s1 的`开始`处填充字符串 s2，使字符串长度达到 len

如果长度小于原字符串，则只取前len个字符

``` mysql
SELECT LPAD('殷素素',5,'*') AS out_put;	--> **殷素素
```

``` mysql
SELECT LPAD('殷素素',2,'*') AS out_put;	--> 殷素
```



### RPAD(s1,len,s2)

 在字符串 s1 的`结尾`处添加字符串 s2，使字符串的长度达到 len

如果长度小于原字符串，则只取前len个字符

``` mysql
SELECT RPAD('殷素素',5,'*') AS out_put;	--> 殷素素**
```

``` mysql
SELECT RPAD('殷素素',2,'*') AS out_put;	--> 殷素
```

### REPLACE(s,s1,s2)

用字符串 s2 替代字符串 s 中的字符串 s1

``` mysql
SELECT REPLACE('张无忌爱上了周芷若','周芷若','赵敏') AS out_put;	-->张无忌爱上了赵敏
```



## 数学函数

### ROUND(x)

ROUND(x,d)：保留d位小数

四舍五入

``` mysql
SELECT ROUND(-1.55);	--> -2
```

``` mysql
SELECT ROUND(1.567,2);	--> 1.57
```

### CEIL(x)

向上取整

``` mysql
SELECT CEIL(-1.02);	--> -1
```

``` mysql
SELECT CEIL(1.02);	--> 2
```

### FLOOR(x)

向下取整

``` mysql
SELECT FLOOR(-1.58);	--> -2
```

``` mysql
SELECT FLOOR(1.58);	--> 1
```

### TRUNCATE(x,y)

返回数值 x 保留到小数点后 y 位的值（与 ROUND 最大的区别是`不会`进行四舍五入）

``` mysql
SELECT TRUNCATE(1.567,2);    --> 1.56
```

### MOD(x,y)

返回 x 除以 y 以后的余数　

``` mysql
SELECT MOD(10,-3);	--> 1
```

等价于

``` mysql
SELECT 10%-3;	--> 1
```

余数的符号取决于被除数的符号

``` mysql
SELECT MOD(-10,3);	--> -1
```

``` mysql
SELECT MOD(-10,-3);	--> -1
```



## 日期函数

### NOW()

返回当前系统时间(注：日期+时间)

``` mysql
SELECT NOW();	--> 2019-10-05 09:56:57
```

### CURDATE()

返回当前系统日期，不包含时间

``` mysql
SELECT CURDATE();	--> 2019-10-05
```

### CURTIME()

``` mysql
SELECT CURTIME();	-->09:56:57
```

### YEAR(d)

返回年份

``` mysql
SELECT YEAR(NOW());	-->2019
```

``` mysql
SELECT YEAR('1998-1-1');	-->1998
```

``` mysql
SELECT  YEAR(hiredate) 入职时间 FROM employees;
```

### MONTH(d)

返回日期d中的月份值，1 到 12

``` mysql
SELECT MONTH(NOW());	--> 10
```

### MONTHNAME(d)

 返回日期当中的月份名称，如 November

``` mysql
SELECT MONTHNAME(NOW());	--> October
```

### STR_TO_DATE(s, f)

将字符通过指定的格式转换成日期

``` mysql
SELECT STR_TO_DATE('1998-3-2','%Y-%c-%d') AS out_put;	--> 1998-03-02
```

查询入职日期为1992-4-3的员工信息

``` mysql
SELECT * FROM employees WHERE hiredate = '1992-4-3';

# 或者

SELECT * FROM employees WHERE hiredate = STR_TO_DATE('4-3 1992','%c-%d %Y');
```

### DATE_FORMAT(d,f)

将日期通过指定的格式转换成字符

``` mysql
SELECT DATE_FORMAT(NOW(),'%Y年%m月%d日') AS out_put;	--> 2019年10月05日
```

查询有奖金的员工名和入职日期(xx月/xx日 xx年)

``` mysql
SELECT last_name,DATE_FORMAT(hiredate,'%m月/%d日 %y年') 入职日期
FROM employees
WHERE commission_pct IS NOT NULL;
```

## 其他函数

### VERSION()

返回数据库的版本号

``` mysql
SELECT VERSION();
```

### DATABASE()

 返回当前数据库名

``` mysql
SELECT DATABASE();
```

### USER()

返回当前用户

``` mysql
SELECT USER();
```

## 流程控制函数

### IF(expr,v1,v2)

如果表达式 expr 成立，返回结果 v1；否则，返回结果 v2。

``` mysql
SELECT IF(1 > 0,'正确','错误');	--> 正确
```

``` mysql
SELECT
	last_name,
	commission_pct,
IF
	( commission_pct IS NULL, '没奖金，呵呵', '有奖金，嘻嘻' ) 备注 
FROM
	employees;
```

### CASE

```
CASE expression
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
   ...
    WHEN conditionN THEN resultN
    ELSE result
END
```

CASE 表示函数开始，END 表示函数结束。如果 condition1 成立，则返回 result1, 如果 condition2 成立，则返回 result2，当全部不成立则返回 result，而当有一个成立之后，后面的就不执行了。

```
case 要判断的字段或表达式
when 常量1 then 要显示的值1或语句1;
when 常量2 then 要显示的值2或语句2;
...
else 要显示的值n或语句n;
end
```

``` mysql
SELECT CASE 
　　WHEN 1 > 0
　　THEN '1 > 0'
　　WHEN 2 > 0
　　THEN '2 > 0'
　　ELSE '3 > 0'
　　END
　　
--> 1 > 0
```

查询员工的工资，要求

1. 部门号=30，显示的工资为1.1倍
2. 部门号=40，显示的工资为1.2倍
3. 部门号=50，显示的工资为1.3倍
4. 其他部门，显示的工资为原工资

``` mysql
SELECT salary 原始工资,department_id,
CASE department_id
WHEN 30 THEN salary*1.1
WHEN 40 THEN salary*1.2
WHEN 50 THEN salary*1.3
ELSE salary
END AS 新工资
FROM employees;
```

查询员工的工资的情况

1. 如果工资>20000,显示A级别
2. 如果工资>15000,显示B级别
3. 如果工资>10000，显示C级别
4. 否则，显示D级别

``` mysql
SELECT salary,
CASE 
WHEN salary>20000 THEN 'A'
WHEN salary>15000 THEN 'B'
WHEN salary>10000 THEN 'C'
ELSE 'D'
END AS 工资级别
FROM employees;

```

