# 查询两张表不同的数据

有两张表：一张A表和一张B表

- left join(左联接) 返回包括左表中的所有记录和右表中联结字段相等的记录 ；
- right join(右联接) 返回包括右表中的所有记录和左表中联结字段相等的记录；
- inner join(等值连接) 只返回两个表中联结字段相等的行；

**表A数据：**

| a_id | bookName       | price |
| ---- | -------------- | ----- |
| 1    | java教程       | 84    |
| 2    | javascript教程 | 80    |
| 3    | mysql教程      | 69    |
| 4    | c语言          | 102   |

**表B数据：**

| b_id | bookName       | price |
| ---- | -------------- | ----- |
| 1    | java教程       | 84    |
| 2    | javascript教程 | 80    |
| 5    | linux教程      | 80    |
| 6    | android教程    | 68    |

```sql
DROP TABLE IF EXISTS a;
DROP TABLE IF EXISTS b;

CREATE TABLE a(
	a_id INT,
	bookName VARCHAR(50),
	price FLOAT
);
CREATE TABLE b(
	a_id INT,
	bookName VARCHAR(50),
	price FLOAT
);

INSERT INTO a VALUES
(1,'java教程',84),
(2,'javascript教程',80),
(3,'mysql教程',69),
(4,'c语言',102);

INSERT INTO b VALUES
(1,'java教程',84),
(2,'javascript教程',80),
(5,'linux教程',80),
(6,'android教程',68);
```



> 查询两张表中都有的记录（相同数据）
>

```sql
SELECT a.* FROM a INNER JOIN b ON a.a_id = b.b_id;
```

> 查询表A中有，表B中没有的数据

先使用连接查询a表的全部

![1577093558538](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212539.png)

然后筛选出b中没有的数据

```sql
SELECT a.* FROM a LEFT JOIN b ON a.a_id = b.b_id WHERE b.b_id IS NULL;
```



> 查询表A中没有，表B中有的数据

```sql
SELECT b.* FROM a RIGHT JOIN b ON a.a_id = b.b_id WHERE a.a_id IS NULL;
```



> 查询表A表和B表中不相同的数据

将上面两个结果连接在一起

```sql
SELECT a.* FROM a LEFT JOIN b ON a.a_id = b.b_id WHERE b.b_id IS NULL UNION SELECT b.* FROM a RIGHT JOIN b ON a.a_id = b.b_id WHERE a.a_id IS NULL;
```

