# SQL练习-01

## TOPIC1

> 用一条SQL 语句 查询出每门课都大于80 分的学生姓名

```sql
DROP TABLE IF EXISTS student;
CREATE TABLE student(
	name VARCHAR(10) COMMENT '姓名',
	kecheng VARCHAR(10) COMMENT '课程',
	fenshu TINYINT UNSIGNED COMMENT '姓名'
);

INSERT INTO student VALUES('张三','语文',81);
INSERT INTO student VALUES('张三','数学',75);
INSERT INTO student VALUES('李四','语文',76);
INSERT INTO student VALUES('李四','数学',90);
INSERT INTO student VALUES('王五','语文',81);
INSERT INTO student VALUES('王五','数学',100);
INSERT INTO student VALUES('王五','英语',90);
INSERT INTO student VALUES('赵六','语文',90);
INSERT INTO student VALUES('赵六','英语',90);
```

<details>
    <summary>答案</summary>

```sql
# A. 使用子查询
SELECT DISTINCT `name` FROM student WHERE `name` NOT IN (SELECT `name` FROM student WHERE fenshu<=80);

# B. 使用分组过滤查询
SELECT `name` FROM student GROUP BY `name` HAVING MIN(fenshu)>80;
```

</details>



## TOPIC2

> 删除除了编号不同, 其他都相同的学生冗余信息

```sql
DROP TABLE IF EXISTS student;
 CREATE TABLE student(
	id BIGINT(10) COMMENT '编号',
	sid VARCHAR(10) COMMENT '学号',
	name VARCHAR(10) COMMENT '姓名',
	cid VARCHAR(10) COMMENT '课程编号',
	cname VARCHAR(10) COMMENT '课程名称',
	score TINYINT UNSIGNED COMMENT '分数'
);

INSERT INTO student VALUES(1,'2005001','张三','0001','数学',69);
INSERT INTO student VALUES(2,'2005002','李四','0001','数学', 89);
INSERT INTO student VALUES(3,'2005001','张三','0001','数学', 69);
```

<details>
    <summary>答案</summary>

思路：对编号以外的其他字段进行分组，然后只保留最小的，删除其他的

```sql
DELETE FROM student WHERE id NOT IN (SELECT MIN(id) FROM student GROUP BY sid,`name`,cid,cname,score);
```

上面可能会报错，说是查询和删除的是同一张表，那就再查询一次虚表

![1576832038562](https://cdn.tencentfs.clboy.cn/images/2021/20210911203212053.png)

```sql
DELETE FROM student WHERE id NOT IN (SELECT * FROM (SELECT MIN(id) FROM student GROUP BY sid,`name`,cid,cname,score) temp);
```

</details>



## TOPIC3

> 一个叫 team 的表，里面只有一个字段name, 一共有4 条纪录，分别是a,b,c,d, 对应四个球对，现在四个球对进行比赛，用一条sql 语句显示所有可能的比赛组合.
>
> *eg*：ab，ac ，ad，bc，......

```sql
DROP TABLE IF EXISTS team;
CREATE TABLE team(
	name VARCHAR(1) COMMENT '球队名称'
)
INSERT INTO team VALUES('a'),('b'),('c'),('d');
```

<details>
    <summary>答案</summary>

```sql
SELECT CONCAT(a.name,b.name) "组合名" FROM team a,team b WHERE a.name<b.name 
```

</details>



## TOPIC4

> 怎么把这样一个表儿：

```sql
DROP TABLE IF EXISTS temp;
CREATE TABLE temp(
	year INT UNSIGNED,
	MONTH INT UNSIGNED,
	amount DECIMAL
);

INSERT INTO temp VALUES(1991,1,1.1);
INSERT INTO temp VALUES(1991,2,1.2);
INSERT INTO temp VALUES(1991,3,1.3);
INSERT INTO temp VALUES(1991,4,1.4);
INSERT INTO temp VALUES(1992,1,2.1);
INSERT INTO temp VALUES(1992,2,2.2);
INSERT INTO temp VALUES(1992,3,2.3);
INSERT INTO temp VALUES(1992,4,2.4);
```

> 查成这样一个结果：

| year | m1   | m2   | m3   | m4   |
| ---- | ---- | ---- | ---- | ---- |
| 1991 | 1.1  | 1.2  | 1.3  | 1.4  |
| 1992 | 2.1  | 2.2  | 2.3  | 2.4  |

<details>
    <summary>答案</summary>

```sql
SELECT 
`year`,
( SELECT amount FROM temp m WHERE MONTH = 1 AND m.YEAR = temp.YEAR ) AS m1,
( SELECT amount FROM temp m WHERE MONTH = 2 AND m.YEAR = temp.YEAR ) AS m2,
( SELECT amount FROM temp m WHERE MONTH = 3 AND m.YEAR = temp.YEAR ) AS m3,
( SELECT amount FROM temp m WHERE MONTH = 4 AND m.YEAR = temp.YEAR ) AS m4 
FROM
	temp 
GROUP BY
YEAR
```

</details>



## TOPIC5

> 成绩表

```sql
DROP TABLE IF EXISTS grade;
CREATE TABLE grade(
	courseid INT PRIMARY KEY auto_increment,
	coursename VARCHAR(10),
	score INT
);
INSERT INTO grade VALUES(NULL,'Java',70);
INSERT INTO grade VALUES(NULL,'oracle',90);
INSERT INTO grade VALUES(NULL,'xml',40);
INSERT INTO grade VALUES(NULL,'jsp',30);
INSERT INTO grade VALUES(NULL,'servlet',80);
```



> 要求查询所有课程成绩，60分及格，及格显示pass，否则显示fail，如下：

| courseid | coursename | score | 考试结果 |
| -------- | ---------- | ----- | -------- |
| 4        | jsp        | 30    | fail     |
| 5        | servlet    | 80    | pass     |

<details>
    <summary>答案</summary>

```sql
SELECT g.*,IF(g.score>60,'pass','fail') "考试结果" FROM grade g; 
```

</details>


​			