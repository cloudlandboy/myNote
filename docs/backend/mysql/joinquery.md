# 连接查询

## 含义

又称多表查询，当查询的字段来自于多个表时，就会用到连接查询

```
select 字段1，字段2

from 表1，表2,...;
```

## 笛卡尔乘积现象

当查询多个表时，没有添加有效的连接条件，导致多个表所有行实现完全连接

表1 有m行，表2有n行，结果=m*n行

发生原因：没有有效的连接条件
如何避免：添加有效的连接条件

## 分类

按年代分类：
	sql92标准:仅仅支持内连接
	sql99标准【推荐】：支持内连接+外连接（左外和右外）+交叉连接
	

	按功能分类：
		内连接：
			等值连接
			非等值连接
			自连接
		外连接：
			左外连接
			右外连接
			全外连接（mysql不支持）
		
		交叉连接
## 等值连接

1. 多表等值连接的结果为多表的交集部分
2. n表连接，至少需要n-1个连接条件
3. 表的顺序没有要求
4. 一般需要为表起别名
5. 可以搭配前面介绍的所有子句使用，比如排序、分组、筛选

### 案例1

1. 查询女神名和对应的男神名

   ``` mysql
   SELECT NAME,boyName 
   FROM
   	boys,
   	beauty 
   WHERE
   	beauty.boyfriend_id = boys.id;
   ```

   

2. 查询员工名和对应的部门名

   ``` mysql
   SELECT
   	last_name,
   	department_name 
   FROM
   	employees,
   	departments 
   WHERE
   	employees.`department_id` = departments.`department_id`;
   ```

   

### 为表起别名

1. 提高语句的简洁度
2. 区分多个重名的字段

`注意`：如果为表起了别名，则查询的字段就不能使用原来的表名去限定

1. 查询员工名、工种号、工种名

   ``` mysql
   SELECT
   	e.last_name,
   	e.job_id,
   	j.job_title 
   FROM
   	employees e,
   	jobs j 
   WHERE
   	e.`job_id` = j.`job_id`;
   ```

### 加筛选条件

1. 查询有奖金的员工名、部门名

   ``` mysql
   SELECT
   	last_name,
   	department_name,
   	commission_pct 
   FROM
   	employees e,
   	departments d 
   WHERE
   	e.`department_id` = d.`department_id` 
   	AND e.`commission_pct` IS NOT NULL;
   ```

   

2. 查询城市名中第二个字符为o的部门名和城市名

   ``` mysql
   SELECT
   	department_name,
   	city 
   FROM
   	departments d,
   	locations l 
   WHERE
   	d.`location_id` = l.`location_id` 
   	AND city LIKE '_o%';
   ```

   

### 加分组

1. 查询每个城市的部门个数

   ``` mysql
   SELECT
   	COUNT(*) 个数,
   	city 
   FROM
   	departments d,
   	locations l 
   WHERE
   	d.`location_id` = l.`location_id` 
   GROUP BY
   	city;
   ```

   

2. 查询有奖金的每个部门的部门名和部门的领导编号和该部门的最低工资

   ``` mysql
   SELECT
   	department_name,
   	d.`manager_id`,
   	MIN( salary ) 
   FROM
   	departments d,
   	employees e 
   WHERE
   	d.`department_id` = e.`department_id` 
   	AND commission_pct IS NOT NULL 
   GROUP BY
   	department_name,
   	d.`manager_id`;
   ```

   

3. 查询每个工种的工种名和员工的个数，并且按员工个数降序

   ``` mysql
   SELECT
   	job_title,
   	COUNT(*) 
   FROM
   	employees e,
   	jobs j 
   WHERE
   	e.`job_id` = j.`job_id` 
   GROUP BY
   	job_title 
   ORDER BY
   	COUNT(*) DESC;
   ```

   

4. 查询员工名、部门名和所在的城市，并且城市名以s开头，按部门名称降序

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	d.department_name 部门名,
   	l.city 城市 
   FROM
   	employees e,
   	departments d,
   	locations l 
   WHERE
   	e.department_id = d.department_id 
   	AND d.location_id = l.location_id 
   	AND city LIKE 's%' 
   ORDER BY
   	department_name DESC;
   ```

## 非等值连接

### 语法

   ```
   	select 查询列表
   	from 表1 别名,表2 别名
   	where 非等值的连接条件
   	【and 筛选条件】
   	【group by 分组字段】
   	【having 分组后的筛选】
   	【order by 排序字段】
   ```

### 案例2

1. 查询员工的工资和工资级别

   ``` mysql
   SELECT
   	e.salary 工资,
   	j.grade_level 工资级别 
   FROM
   	employees e,
   	job_grades j 
   WHERE
   	e.salary BETWEEN j.lowest_sal 
   	AND j.highest_sal;
   ```

   

2. 查询员工的工资和工资级别并筛选出级别为A的

   ``` mysql
   SELECT
   	e.salary 工资,
   	j.grade_level 工资级别 
   FROM
   	employees e,
   	job_grades j 
   WHERE
   	e.salary BETWEEN j.lowest_sal 
   	AND j.highest_sal 
   	AND j.grade_level = 'A';
   ```

## 自连接

连接的相同的表

### 语法

``` mysql
	select 查询列表
	from 表 别名1,表 别名2
	where 等值的连接条件
	【and 筛选条件】
	【group by 分组字段】
	【having 分组后的筛选】
	【order by 排序字段】
```

1. 查询员工名和上级的名称

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	m.last_name 上级名称 
   FROM
   	employees e,
   	employees m 
   WHERE
   	e.manager_id = m.employee_id;
   ```

   

## SQL99语法-内连接

	select 查询列表
	from 表1 别名
	【inner】 join 表2 别名 on 连接条件
	where 筛选条件
	group by 分组列表
	having 分组后的筛选
	order by 排序列表
	limit 子句;
### 特点

1. 表的顺序可以调换
2. 内连接的结果=多表的交集
3. n表连接至少需要n-1个连接条件
4. 添加排序、分组、筛选
5. inner可以省略
6. 筛选条件放在where后面，连接条件放在on后面，提高分离性，便于阅读
7. inner join连接和sql92语法中的等值连接效果是一样的，都是查询多表的交集

### 分类

- 等值连接
- 非等值连接
- 自连接

### 内连接-等值连接

1. 查询员工名、部门名

   ``` mysql
   SELECT
   	last_name,
   	department_name 
   FROM
   	departments d
   	INNER JOIN employees e ON e.`department_id` = d.`department_id`;
   ```

   

2. 查询名字中包含e的员工名和工种名（添加筛选）

   ``` mysql
   SELECT
   	last_name,
   	job_title 
   FROM
   	employees e
   	JOIN jobs j ON e.`job_id` = j.`job_id` 
   WHERE
   	e.`last_name` LIKE '%e%';
   ```

   

3. 查询部门个数>3的城市名和部门个数，（添加分组+筛选）

   ``` mysql
   SELECT
   	COUNT( department_id ) 部门个数,
   	city 城市名 
   FROM
   	departments d
   	JOIN locations l ON d.location_id = l.location_id 
   GROUP BY
   	l.city 
   HAVING
   	COUNT( department_id )> 3;
   ```

   

4. 查询哪个部门的员工个数>3的部门名和员工个数，并按个数降序（添加排序）

   ``` mysql
   SELECT
   	COUNT(*) 员工个数,
   	d.department_name 部门名称 
   FROM
   	departments d
   	JOIN employees e ON d.department_id = e.department_id 
   GROUP BY
   	d.department_id 
   HAVING
   	COUNT(
   	*)> 3 
   ORDER BY
   	1 DESC
   ```

   

5. 查询员工名、部门名、工种名，并按部门名降序（添加三表连接）

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	d.department_name 部门号,
   	j.job_title 工种名 
   FROM
   	employees e
   	JOIN departments d ON e.department_id = d.department_id
   	JOIN jobs j ON e.job_id = j.job_id 
   ORDER BY
   	d.department_name DESC;
   ```

### 内连接-非等值连接

1. 查询员工的工资级别

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	e.salary 薪水,
   	j.grade_level 工资级别 
   FROM
   	employees e
   	JOIN job_grades j ON e.salary BETWEEN j.lowest_sal 
   	AND j.highest_sal;
   ```

   

2. 查询工资级别的个数>20的个数，并且按工资级别降序

   ``` mysql
   SELECT
   	j.grade_level 工资级别,
   	COUNT( * ) 个数 
   FROM
   	employees e
   	JOIN job_grades j ON e.salary BETWEEN j.lowest_sal 
   	AND j.highest_sal 
   GROUP BY
   	j.grade_level 
   HAVING
   	COUNT( * ) > 20 
   ORDER BY
   	2 DESC;
   ```

   

### 内连接-自连接

1. 查询员工的名字、上级的名字

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	m.last_name 上级名 
   FROM
   	employees e
   	JOIN employees m ON e.manager_id = m.employee_id;
   ```

   

2. 查询姓名中包含字符k的员工的名字、上级的名字

   ``` mysql
   SELECT
   	e.last_name 员工名,
   	m.last_name 上级名 
   FROM
   	employees e
   	JOIN employees m ON e.manager_id = m.employee_id 
   WHERE
   	e.last_name LIKE '%k%'
   ```

   

## SQL99语法-外连接

### 语法

```
select 查询列表
from 表1 别名
left|right|full【outer】 join 表2 别名 on 连接条件
where 筛选条件
group by 分组列表
having 分组后的筛选
order by 排序列表
limit 子句;
```

### 应用场景

用于查询一个表中有，另一个表没有的记录

### 特点

1. 外连接的查询结果为主表中的所有记录

   如果从表中有和它匹配的，则显示匹配的值

   如果从表中没有和它匹配的，则显示null

   外连接查询结果=内连接结果+主表中有而从表没有的记录

2. 左外连接，`left join` 左边的是主表

3. 右外连接，`right join` 右边的是主表

4. 左外和右外交换两个表的顺序，可以实现同样的效果 

5. 全外连接=内连接的结果+表1中有但表2没有的+表2中有但表1没有的

### 左外连接

1. 查询哪个部门没有员工

   ``` mysql
   SELECT
   	d.* 
   FROM
   	departments d
   	LEFT JOIN employees e ON d.department_id = e.department_id 
   WHERE
   	e.department_id IS NULL
   ```

### 右外连接

1. 查询哪个部门没有员工(调换位置使用RIGHT JOIN)

   ``` mysql
   SELECT
   	d.* 
   FROM
   	employees e
   	RIGHT JOIN departments d ON d.department_id = e.department_id 
   WHERE
   	e.department_id IS NULL
   ```

### 全外连接

mysql不支持全外连接

<del>

``` sql
 USE girls;
 SELECT b.*,bo.*
 FROM beauty b
 FULL OUTER JOIN boys bo
 ON b.`boyfriend_id` = bo.id;
```

</del>

beauty表中有其他的数据与boys表没有关系(就是这些女神还是单身)，就把boys表的那部分全部显示为空，

同样boys表有的beauty没有的也是显示null

### 交叉连接

交叉联接返回左表中的所有行，左表中的每一行与右表中的所有行组合。交叉联接也称作笛卡尔积。    

``` mysql
 SELECT b.*,bo.*
 FROM beauty b
 CROSS JOIN boys bo;
```

