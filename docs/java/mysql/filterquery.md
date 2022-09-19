# 条件查询

过滤：使用WHERE 子句，将不满足条件的行过滤掉。

语法：

``` mysql
select 查询列表 from 表名 where 筛选条件;
```

| 比较运算符 | >、< 、>=、<=、= 、<> | 大于、小于、大于等于、小于等于、等于、不等于                 |
| ---------- | --------------------- | ------------------------------------------------------------ |
|            | BETWEEN  ...AND...    | 显示在某一区间的值(含头含尾)                                 |
|            | IN(set)               | 显示在in列表中的值，例：in(100,200)                          |
|            | LIKE 通配符           | 模糊查询，Like语句中有两个通配符：% 用来匹配多个字符；例first_name like ‘a%’；_ 用来匹配一个字符。例first_name like ‘a_’; |
|            | IS NULL               | 判断是否为空is null; 判断为空；is not null; 判断不为空       |
| 逻辑运算符 | and (&&)              | 多个条件同时成立                                             |
|            | or (\|\|)             | 多个条件任一成立                                             |
|            | not (!)               | 不成立，例：where not(salary>100);                           |

## 案例

### 按条件表达式筛选

1. 查询工资>12000的员工信息

   ``` mysql
   SELECT 
   	*
   FROM
   	employees
   WHERE
   	salary>12000;
   ```

2. 查询部门编号不等于90号的员工名和部门编号

   ``` mysql
   SELECT 
   	last_name,
   	department_id
   FROM
   	employees
   WHERE
   	department_id<>90;
   ```

### 按逻辑表达式筛选

1. 查询工资在10000到20000之间的员工名、工资以及奖金

   ``` mysql
   SELECT
   	last_name,
   	salary,
   	commission_pct
   FROM
   	employees
   WHERE
   	salary>=10000 AND salary<=20000;
   ```

   或者

   ``` mysql
   SELECT
   	last_name,
   	salary,
   	commission_pct 
   FROM
   	employees 
   WHERE
   	salary BETWEEN 10000 
   	AND 20000;
   ```

2. 查询部门编号不是在90到110之间，或者工资高于15000的员工信息

   ``` mysql
   SELECT
   	* 
   FROM
   	employees 
   WHERE
   	NOT ( department_id >= 90 AND department_id <= 110 ) 
   	OR salary > 15000;
   ```

   或者

   ``` mysql
   SELECT
   	* 
   FROM
   	employees 
   WHERE
   	NOT ( department_id BETWEEN 90 AND 110 ) 
   	OR salary > 15000;
   ```


### 模糊查询

1. 查询员工名中包含字符a的员工信息

   ``` mysql
   select 
   	*
   from
   	employees
   where
   	last_name like '%a%';
   ```

2. 查询员工名中第三个字符为e，第五个字符为a的员工名和工资

   ``` mysql
   select
   	last_name,
   	salary
   FROM
   	employees
   WHERE
   	last_name LIKE '__e_a%';
   ```

3. 查询员工名中第二个字符为_的员工名

   ESCAPE：定义转义标识

   ``` mysql
   SELECT
   	last_name
   FROM
   	employees
   WHERE
   	last_name LIKE '_$_%' ESCAPE '$';
   ```

### IN

含义：判断某字段的值是否属于in列表中的某一项
特点：

1. 使用in提高语句简洁度
2. 列表的值类型必须一致或兼容
3. 列表中不支持通配符

查询员工的工种编号是 IT_PROG、AD_VP、AD_PRES中的一个员工名和工种编号

``` mysql
SELECT
	last_name,
	job_id
FROM
	employees
WHERE
	job_id IN( 'IT_PROT' ,'AD_VP','AD_PRES');
```

或者

``` mysql
SELECT
	last_name,
	job_id
FROM
	employees
WHERE
	job_id = 'IT_PROT' OR job_id = 'AD_VP' OR JOB_ID ='AD_PRES';
```

### IS NULL

**=或<>不能用于判断null值**
is null或is not null 可以判断null值

1. 查询没有奖金的员工名和奖金率

   ``` mysql
   SELECT
   	last_name,
   	commission_pct
   FROM
   	employees
   WHERE
   	commission_pct IS NULL;
   ```

2. 查询有奖金的员工名和奖金率

   ``` mysql
   SELECT
   	last_name,
   	commission_pct
   FROM
   	employees
   WHERE
   	commission_pct IS NOT NULL;
   ```

### 安全等于  <=>

1. 查询没有奖金的员工名和奖金率

   ``` mysql
   SELECT
   	last_name,
   	commission_pct
   FROM
   	employees
   WHERE
   	commission_pct <=>NULL;
   ```

2. 查询工资为12000的员工信息

   ``` mysql
   SELECT
   	last_name,
   	salary
   FROM
   	employees
   
   WHERE 
   	salary <=> 12000;
   ```

   

IS NULL:仅仅可以判断NULL值，可读性较高，建议使用
<=>    :既可以判断NULL值，又可以判断普通的数值，可读性较低

<span style="color:red">错误的写法：</span>

<del>

``` mysql
SELECT
	last_name,
	commission_pct
FROM
	employees

WHERE 
	salary IS 12000;
```

</del>