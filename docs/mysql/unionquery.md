# 联合查询

合并、联合，将多次查询结果合并成一个结果

## 语法

```
查询语句1
union 【all】
查询语句2
union 【all】
...
```

## 意义

1. 将一条比较复杂的查询语句拆分成多条语句
2. 适用于查询多个表的时候，查询的列基本是一致

## 特点

1. 要求多条查询语句的查询列数是一致的！
2. 要求多条查询语句的查询的每一列的类型和顺序最好一致
3. union关键字默认去重，如果使用union all 可以包含重复项

## 案例

1. 查询部门编号>90或邮箱包含a的员工信息

   ``` mysql
   SELECT * FROM employees WHERE email LIKE '%a%' OR department_id>90;
   ```

   ``` mysql
   SELECT * FROM employees  WHERE email LIKE '%a%'
   UNION
   SELECT * FROM employees  WHERE department_id>90;
   ```