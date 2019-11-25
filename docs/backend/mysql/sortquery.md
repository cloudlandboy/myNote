# 排序查询

ORDER BY

- 使用 ORDER BY 子句排序
  - ASC（ascend）: 升序
  - DESC（descend）: 降序

## 语法

``` mysql
select 查询列表

from 表名

【where  筛选条件】

order by 排序的字段或表达式;

```

## 特点

1. asc代表的是升序，可以省略
2. order by子句可以支持 单个字段、别名、表达式、函数、多个字段
3. order by子句在查询语句的最后面，除了limit子句

## 案例

### 单个字段排序

1. 查询员工表按薪水降序

   ```
   SELECT * FROM employees ORDER BY salary DESC;
   ```

2. 查询部门编号>=90的员工信息，并按员工编号降序

   ``` mysql
   SELECT *
   FROM employees
   WHERE department_id>=90
   ORDER BY employee_id DESC;
   ```

### 按表达式排序

1. 查询员工信息 按年薪降序

   ```mysql
   SELECT *,salary*12*(1+IFNULL(commission_pct,0))
   FROM employees
   ORDER BY salary*12*(1+IFNULL(commission_pct,0)) DESC;
   ```

   

### 按别名排序

1. 查询员工信息 按年薪升序

   ``` mysql
   SELECT *,salary*12*(1+IFNULL(commission_pct,0)) 年薪
   FROM employees
   ORDER BY 年薪 ASC;
   ```

### 按函数排序

1. 查询员工名，并且按名字的长度降序

   ``` mysql
   SELECT LENGTH(last_name),last_name 
   FROM employees
   ORDER BY LENGTH(last_name) DESC;
   ```

### 多个字段排序

1. 查询员工信息，要求先按工资降序，再按employee_id升序

   ``` mysql
   SELECT *
   FROM employees
   ORDER BY salary DESC,employee_id ASC;
   ```

   



