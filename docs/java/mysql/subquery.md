# 子查询

## 含义

嵌套在其他语句内部的select语句称为子查询或内查询，
外面的语句可以是insert、update、delete、select等，一般select作为外面语句较多
外面如果为select语句，则此语句称为外查询或主查询

## 分类

### 按出现位置

```
select后面：
		仅仅支持标量子查询
from后面：
		表子查询
where或having后面：
		标量子查询
		列子查询
		行子查询
exists后面：
		标量子查询
		列子查询
		行子查询
		表子查询
```

### 按结果集的行列

标量子查询（单行子查询）：结果集为一行一列
列子查询（多行子查询）：结果集为多行一列
行子查询：结果集为多行多列
表子查询：结果集为多行多列

## 示例

### where或having后面

1. 标量子查询（单行单列）
2. 列子查询（多行单列）
3. 行子查询（多行多列）

### 特点

① 子查询放在小括号内  
② 子查询一般放在条件的右侧  
③ 标量子查询，一般搭配着单行操作符使用  

> <、>、<=、>=、=、<>

④ 列子查询，一般搭配着多行操作符使用  

> in、any/some、all

⑤ 子查询的执行优先于主查询执行，主查询的条件用到了子查询的结果  

### 标量子查询

1. 谁的工资比 Abel 高?

   ① 查询Abel的工资

   ``` mysql
   SELECT salary
   FROM employees
   WHERE last_name = 'Abel'
   ```

   ②查询员工的信息，满足 salary>①结果

   ``` mysql
   SELECT *
   FROM employees
   WHERE salary>(
   
   	SELECT salary
   	FROM employees
   	WHERE last_name = 'Abel'
   
   );
   ```

   

2. 返回job_id与141号员工相同，salary比143号员工多的员工 姓名，job_id 和工资

   ① 查询141号员工的job_id

   ``` mysql
   SELECT job_id
   FROM employees
   WHERE employee_id = 141
   ```

   ② 查询143号员工的salary

   ``` mysql
   SELECT salary
   FROM employees
   WHERE employee_id = 143
   ```

   ③ 查询员工的姓名，job_id 和工资，要求job_id=①并且salary>②

   ``` mysql
   SELECT last_name,job_id,salary
   FROM employees
   WHERE job_id = (
   	SELECT job_id
   	FROM employees
   	WHERE employee_id = 141
   ) AND salary>(
   	SELECT salary
   	FROM employees
   	WHERE employee_id = 143
   
   );
   ```

   

3. 返回公司工资最少的员工的last_name,job_id和salary

   ① 查询公司的 最低工资

   ``` mysql
   SELECT MIN(salary)
   FROM employees
   ```

   ② 查询last_name,job_id和salary，要求salary=①

   ``` mysql
   SELECT last_name,job_id,salary
   FROM employees
   WHERE salary=(
   	SELECT MIN(salary)
   	FROM employees
   );
   ```

   

4. 查询最低工资大于50号部门最低工资的部门id和其最低工资

   ① 查询50号部门的最低工资

   ``` mysql
   SELECT  MIN(salary)
   FROM employees
   WHERE department_id = 50
   ```

   ② 查询每个部门的最低工资

   ``` mysql
   SELECT MIN(salary),department_id
   FROM employees
   GROUP BY department_id
   ```

   ③ 在②基础上筛选，满足min(salary)>①

   ``` mysql
   SELECT MIN(salary),department_id
   FROM employees
   GROUP BY department_id
   HAVING MIN(salary)>(
   	SELECT  MIN(salary)
   	FROM employees
   	WHERE department_id = 50
   );
   ```

   

5. <span style="color:red">非法使用标量子查询</span>

   <del>

   ``` mysql
   SELECT MIN(salary),department_id
   FROM employees
   GROUP BY department_id
   HAVING MIN(salary)>(
   	SELECT  salary
   	FROM employees
   	WHERE department_id = 250
   );
   ```

   </del>

   这里250号部门的员工可能不止一个人，查询的是多行单列，就是列子查询了

### 列子查询

|  操作符   |            含义            |
| :-------: | :------------------------: |
| IN/NOT IN |    等于列表中的任意一个    |
| ANY\|SOME | 和子查询返回的某一个值比较 |
|    ALL    |  和子查询返回的所有值比较  |



1. 返回location_id是1400或1700的部门中的所有员工姓名

   ①查询location_id是1400或1700的`部门编号`

   ``` mysql
   SELECT DISTINCT department_id
   FROM departments
   WHERE location_id IN(1400,1700)
   ```

   ② 查询员工姓名，要求部门号是①列表中的某一个

   ``` mysql
   SELECT last_name
   FROM employees
   WHERE department_id IN(
   	SELECT DISTINCT department_id
   	FROM departments
   	WHERE location_id IN(1400,1700)
   );
   ```

   

2. 返回其它工种中比job_id为‘IT_PROG’工种任一工资低的员工的员工号、姓名、job_id 以及salary

   ① 查询job_id为‘IT_PROG’部门任一工资

   ``` mysql
   SELECT DISTINCT salary
   FROM employees
   WHERE job_id = 'IT_PROG';
   ```

   ② 查询员工号、姓名、job_id 以及salary，salary<(①)的任意一个

   ``` mysql
   SELECT last_name,employee_id,job_id,salary
   FROM employees
   WHERE salary<ANY(
   	SELECT DISTINCT salary
   	FROM employees
   	WHERE job_id = 'IT_PROG'
   
   ) AND job_id<>'IT_PROG';
   ```

   或者(小于最大值，就肯定满足任意一个)

   ``` mysql
   SELECT last_name,employee_id,job_id,salary
   FROM employees
   WHERE salary<(
   	SELECT MAX(salary)
   	FROM employees
   	WHERE job_id = 'IT_PROG'
   
   ) AND job_id<>'IT_PROG';
   ```

   

3. 返回其它部门中比job_id为‘IT_PROG’部门所有工资都低的员工   的员工号、姓名、job_id 以及salary

   ``` mysql
   SELECT last_name,employee_id,job_id,salary
   FROM employees
   WHERE salary<ALL(
   	SELECT DISTINCT salary
   	FROM employees
   	WHERE job_id = 'IT_PROG'
   
   ) AND job_id<>'IT_PROG';
   ```

   或者（小于最小的）

   ``` mysql
   SELECT last_name,employee_id,job_id,salary
   FROM employees
   WHERE salary<(
   	SELECT MIN( salary)
   	FROM employees
   	WHERE job_id = 'IT_PROG'
   
   ) AND job_id<>'IT_PROG';
   ```

   

### 行子查询

1. 查询员工编号最小并且工资最高的员工信息

   ``` mysql
   SELECT * 
   FROM employees
   WHERE (employee_id,salary)=(
   	SELECT MIN(employee_id),MAX(salary)
   	FROM employees
   );
   ```

   或者

   ``` mysql
   SELECT *
   FROM employees
   WHERE employee_id=(
   	SELECT MIN(employee_id)
   	FROM employees
   )AND salary=(
   	SELECT MAX(salary)
   	FROM employees
   );
   ```

### select后面

仅仅支持标量子查询

1. 查询每个部门的员工个数

   ``` mysql
   SELECT d.*,(
   	SELECT COUNT(*)
   	FROM employees e
   	WHERE e.department_id = d.`department_id`
    ) 个数
    FROM departments d;
   ```

   或者(使用外连接)

   ``` mysql
   SELECT
   	d.*,
   	count( e.employee_id ) 个数 
   FROM
   	employees e
   	RIGHT JOIN departments d ON e.department_id = d.department_id 
   GROUP BY
   	d.department_id;
   ```

   

2. 查询员工号=102的部门名

   ``` mysql
   SELECT department_id,( 
       SELECT department_name 
       FROM departments d 
       WHERE department_id = e.department_id 
   ) 
   FROM
   	employees e 
   WHERE
   	e.employee_id = 102;
   ```

   或者

   ``` mysql
   	SELECT department_name,e.department_id
   	FROM departments d
   	INNER JOIN employees e
   	ON d.department_id=e.department_id
   	WHERE e.employee_id=102;
   ```

   

### from后面

将子查询结果充当一张表，要求必须起别名

1. 查询每个部门的平均工资的工资等级

   ``` mysql
   SELECT  ag_dep.*,g.`grade_level`
   FROM (
   	SELECT AVG(salary) ag,department_id
   	FROM employees
   	GROUP BY department_id
   ) ag_dep
   INNER JOIN job_grades g
   ON ag_dep.ag BETWEEN lowest_sal AND highest_sal;
   ```

   

### exists后面（相关子查询）

判断子查询是否存在结果，存在返回1，不能存在返回0，可用于筛选判断

1. 查询有员工的部门名

   ``` mysql
   SELECT department_name
   FROM departments d
   WHERE EXISTS(
   	SELECT *
   	FROM employees e
   	WHERE d.`department_id`=e.`department_id`
   );
   ```

2. 查询没有女朋友的男神信息

   ``` mysql
   SELECT bo.*
   FROM boys bo
   WHERE NOT EXISTS(
   	SELECT boyfriend_id
   	FROM beauty b
   	WHERE bo.`id`=b.`boyfriend_id`
   );
   
   ```

   ``` mysql
   SELECT bo.*
   FROM boys bo
   WHERE bo.id NOT IN(
   	SELECT boyfriend_id
   	FROM beauty
   )
   ```

   

能用exists的地方就都可以用In替代