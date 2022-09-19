# 分组查询

## 语法

``` 
select 分组函数，分组后的字段
from 表
【where 筛选条件】
 group by 分组的字段
【having 分组后的筛选】
【order by 排序列表】
```

## 特点

1. 和分组函数一同查询的字段`必须`是group by后出现的字段
2. 筛选分为两类：分组前筛选和分组后筛选

|    筛选    |      针对的表      | 连接的关键字 |
| :--------: | :----------------: | :----------: |
| 分组前筛选 |       原始表       |    where     |
| 分组后筛选 | group by后的结果集 |    having    |

## 问题

1. 分组函数做筛选能不能放在where后面

   不能，原表中没有分组后的数据



## 案例

### 简单的分组

1. 查询每个工种的员工平均工资

   ``` mysql
   SELECT AVG(salary),job_id
   FROM employees
   GROUP BY job_id;
   ```

2. 查询每个位置的部门个数

   ``` mysql
   SELECT COUNT(*),location_id
   FROM departments
   GROUP BY location_id;
   ```

### 分组前筛选

1. 查询邮箱中包含a字符的 每个部门的最高工资

   ``` mysql
   SELECT MAX(salary),department_id
   FROM employees
   WHERE email LIKE '%a%'
   GROUP BY department_id;
   ```

   

2. 查询有奖金的每个领导手下员工的平均工资

   ``` mysql
   SELECT
   	AVG( salary ),
   	manager_id 
   FROM
   	employees 
   WHERE
   	commission_pct IS NOT NULL 
   GROUP BY
   	manager_id;
   ```

### 分组后筛选

1. 查询哪个部门的员工个数>5

   ① 首先查询每个部门的员工个数

   ``` mysql
   SELECT COUNT(*),department_id
   FROM employees
   GROUP BY department_id;
   ```

   ② 筛选刚才①结果

   ``` mysql
   SELECT COUNT(*),department_id
   FROM employees
   
   GROUP BY department_id
   
   HAVING COUNT(*)>5;
   ```

   

2. 每个工种有奖金的员工的最高工资>12000的工种编号和最高工资

   ``` mysql
   SELECT
   	MAX( salary ) 最高工资,
   	job_id 工种编号 
   FROM
   	employees 
   WHERE
   	commission_pct IS NOT NULL 
   GROUP BY
   	job_id 
   HAVING
   	MAX( salary )> 12000;
   ```

   

3. 领导编号>102的每个领导手下的最低工资大于5000的领导编号和最低工资

   ``` mysql
   SELECT
   	manager_id 领导编号,
   	MIN( salary ) 最低工资 
   FROM
   	employees 
   WHERE
   	manager_id > 102 
   GROUP BY
   	manager_id 
   HAVING
   	MIN( salary )> 5000
   ```

   

### 添加排序

1. 每个工种有奖金的员工的最高工资>6000的工种编号和最高工资,按最高工资升序

   ``` mysql
   SELECT
   	job_id 工种编号,
   	MAX( salary ) 最高工资 
   FROM
   	employees 
   WHERE
   	commission_pct IS NOT NULL 
   GROUP BY
   	job_id 
   HAVING
   	MAX( salary )> 6000 
   ORDER BY
   	MAX( salary );
   ```

   

### 按多个字段分组

1. 查询每个工种每个部门的最低工资,并按最低工资降序

   ``` mysql
   SELECT
   	MIN( salary ) 最低工资,
   	department_id 部门,
   	job_id 工种 
   FROM
   	employees 
   GROUP BY
   	department_id,
   	job_id 
   ORDER BY
   	MIN( salary ) DESC;
   ```

   

