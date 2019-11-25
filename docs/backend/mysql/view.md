# MySQL视图

> MySQL从5.0.1版本开始提供视图功能。一种虚拟存在的表，行和列的数据来自定义视图的查询中 使用的表，并且是在使用视图时动态生成的，只保存了sql逻辑，不保存查询结果

## 应用场景

- 多个地方用到同样的查询结果
- 该查询结果使用的sql语句较复杂

## 优点

1. 简化sql语句

2. 提高了sql的重用性
3. 保护基表的数据，提高了安全性

## 创建视图

``` mysql
create view 视图名
as
查询语句;
```

1. 创建视图emp_v1,要求查询电话号码以‘011’开头的员工姓名和工资、邮箱

   ``` mysql
   CREATE VIEW emp_v1 AS SELECT
   	last_name,
   	salary,
   	email 
   FROM
   	employees 
   WHERE
   	phone_number LIKE '011%';
   ```

2. 创建视图emp_v2，要求查询部门的最高工资高于12000的部门信息

   ``` mysql
   # 创建视图，查询每个部门的最高工资,筛选出高于12000的
   DROP VIEW emp_v2;
   CREATE VIEW emp_v2 AS SELECT
   department_id,
   MAX( salary ) max_salary 
   FROM
   	employees 
   GROUP BY
   	department_id 
   HAVING
   	max_salary > 12000;
   	
   # 根据创建的视图连接departments表查询部门信息
   SELECT
   	d.*,
   	ev2.max_salary 
   FROM
   	departments d
   	JOIN emp_v2 ev2 
   	ON d.department_id = ev2.department_id;
   ```

3. 查询姓名中包含a字符的员工名、部门名和工种信息

   ```
   # 查询员工名、部门名和工种信息
   CREATE VIEW emp_v3 AS SELECT
   e.last_name,
   d.department_name,
   j.job_title 
   FROM
   	employees e
   	LEFT JOIN departments d ON e.department_id = d.department_id
   	LEFT JOIN jobs j ON e.job_id = j.job_id;
   
   # 筛选出姓名中包含a字符的员工
   SELECT * FROM emp_v3 WHERE last_name LIKE '%a%';
   ```

4. 查询各部门的平均工资级别

   ``` mysql
   # 查询各部门的平均工资
   CREATE VIEW emp_v4 AS SELECT
   AVG( salary ) avg_salary,
   department_id 
   FROM
   	employees 
   GROUP BY
   	department_id;
   	
   # 查询各部门的平均工资级别
   SELECT
   	department_id,
   	j.grade_level 
   FROM
   	emp_v4 ev4
   	LEFT JOIN job_grades j 
   	ON ev4.avg_salary BETWEEN j.lowest_sal 
   	AND j.highest_sal
   ```

5. 查询平均工资最低的部门信息

   ``` mysql
   SELECT
   	d.*,
   	ev4.avg_salary 
   FROM
   	departments d
   	JOIN ( SELECT * FROM emp_v4 ORDER BY avg_salary LIMIT 1 ) ev4 
   	ON d.department_id = ev4.department_id
   ```

   

## 修改视图

### 方式一

```
create or replace view  视图名
as
查询语句;
```

### 方式二

```
alter view 视图名
as 
查询语句;
```



## 删除视图

```
drop view 视图名,视图名,...
```

``` mysql
DROP VIEW emp_v1,emp_v2,emp_v3,emp_v4;
```



## 查看视图

```
DESC 视图名;

SHOW CREATE VIEW 视图名;
```

``` mysql
CREATE VIEW emp_v1 AS SELECT
* 
FROM
	employees;

DESC emp_v1;

SHOW CREATE VIEW emp_v1;
```



## 视图的更新

视图的可更新性和视图中查询的定义有关系，以下类型的视图是不能更新的。

- 包含以下关键字的sql语句：分组函数、distinct、group by
- having、union或者union all
- 常量视图
- Select中包含子查询
- join
- from一个不能更新的视图
- where子句的子查询引用了from子句中的表



### 案例

1. <details> <summary>张飞能否成功插入？</summary>不能，原表中没有annual salary那一列 </details>

   ``` mysql
   # 创建视图，查询员工的姓名，邮箱和年薪
   
   CREATE 
   	OR REPLACE VIEW myv1 AS SELECT
   	last_name,
   	email,
   	salary * 12 *(1+IFNULL ( commission_pct, 0 )) "annual salary" 
   FROM
   	employees;
   	
   # 插入一条数据
   INSERT INTO myv1 VALUES('张飞','zf@qq.com',94862.00);
   ```

   

2. <details> <summary>张飞能否成功插入？</summary>能，并且原表中也存在 </details>

   ``` mysql
   # 创建视图，查询员工的姓名和邮箱
   
   CREATE 
   	OR REPLACE VIEW myv1 AS SELECT
   	last_name,
   	email
   FROM
   	employees;
   	
   # 插入一条数据
   INSERT INTO myv1 VALUES('张飞','zf@qq.com');
   ```

3. <details> <summary>能否将张飞修改为张无忌？</summary>能 </details>

   ``` mysql
   UPDATE myv1 SET last_name = '张无忌' WHERE last_name='张飞';
   ```

4. <details> <summary>能否干掉张无忌？</summary>能 </details>

   ``` mysql
   DELETE FROM myv1 WHERE last_name = '张无忌';
   ```

5. <details> <summary>能否将10号部门的最高薪水改为9000？</summary>不能 ，包含group by和分组函数</details>

   ``` mysql
   #　创建视图，查询每个部门的最高工资
   CREATE 
   	OR REPLACE VIEW myv1 AS SELECT
   	MAX( salary ) m,
   	department_id 
   FROM
   	employees 
   GROUP BY
   	department_id;
   
   ＃ 将10号部门的最高薪水改为9000
   UPDATE myv1 SET m=9000 WHERE department_id=10;
   ```

6. <details> <summary>能否更改？</summary>不能，常量视图 </details>

   ``` mysql
   CREATE OR REPLACE VIEW myv2
   AS
   SELECT 'john' NAME;
   
   #更新
   UPDATE myv2 SET NAME='lucy';
   ```

7. <details> <summary>能够将最高工资列修改为100000？</summary>不能，select中包含子查询 </details>

   ``` mysql
   CREATE OR REPLACE VIEW myv3 AS 
   SELECT department_id,( SELECT MAX( salary ) FROM employees ) 最高工资 
   FROM
   	departments;
   
   # 修改
   
   UPDATE myv3 SET 最高工资=100000;
   ```

8. <details> <summary>修改和插入能成功吗？</summary>可以更新，但是不能插入 </details>

   ``` mysql
   # 创建视图，查询员工名与部门名
   CREATE 
   	OR REPLACE VIEW myv4 AS SELECT
   	last_name,
   	department_name 
   FROM
   	employees e
   	JOIN departments d ON e.department_id = d.department_id;
   
   # 修改
   UPDATE myv4 SET last_name  = '张飞' WHERE last_name='Whalen';
   # 插入
   INSERT INTO myv4 VALUES('陈真','Acc');
   ```

9. <details> <summary>能修改吗？</summary>不能，from一个不能更新的视图，myv3中select使用了子查询 </details>

   ``` mysql
   CREATE 
   	OR REPLACE VIEW myv5 AS SELECT
   	* 
   FROM
   	myv3;
   	
   # 修改
   UPDATE myv5 SET 最高工资=10000 WHERE department_id=60;
   ```

10. <details> <summary>能修改吗？</summary>不能，where子句的子查询引用了from子句中的表</details>

    ``` mysql
    # 查询所有的领导信息
    CREATE OR REPLACE VIEW myv6
    AS
    
    SELECT last_name,email,salary
    FROM employees
    WHERE employee_id IN(
    	SELECT  manager_id
    	FROM employees
    	WHERE manager_id IS NOT NULL
    );
    
    # 修改
    UPDATE myv6 SET salary=10000 WHERE last_name = 'k_ing';
    ```

    查询领导Id（将所有员工的上级Id查出来，这些Id就是领导Id）：

    `SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL`

## 视图和表的对比

|      | 关键字 | 是否占用物理空间        | 使用         |
| ---- | ------ | ----------------------- | ------------ |
| 视图 | view   | 占用较小，只保存sql逻辑 | 一般用于查询 |
| 表   | table  | 保存实际的数据          | 增删改查     |

​					
​							