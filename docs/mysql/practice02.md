# （学生表、教师表、课程表、成绩表）多表查询



## 建表语句

```sql
CREATE TABLE student ( s_id INT, sname VARCHAR (32), sage INT, ssex VARCHAR (8) );

CREATE TABLE course ( c_id INT, cname VARCHAR (32), t_id INT );

CREATE TABLE sc ( s_id INT, c_id INT, score INT );

CREATE TABLE teacher ( t_id INT, tname VARCHAR (16) );
```

```sql
insert into student select 1,N'刘一',18,N'男' union all
 select 2,N'钱二',19,N'女' union all
 select 3,N'张三',17,N'男' union all
 select 4,N'李四',18,N'女' union all
 select 5,N'王五',17,N'男' union all
 select 6,N'赵六',19,N'女' ;
 
 insert into teacher select 1,N'叶平' union all
 select 2,N'贺高' union all
 select 3,N'杨艳' union all
 select 4,N'周磊';
 
 insert into course select 1,N'语文',1 union all
 select 2,N'数学',2 union all
 select 3,N'英语',3 union all
 select 4,N'物理',4;
 
 insert into sc
 select 1,1,56 union all 
 select 1,2,78 union all 
 select 1,3,67 union all 
 select 1,4,58 union all 
 select 2,1,79 union all 
 select 2,2,81 union all 
 select 2,3,92 union all 
 select 2,4,68 union all 
 select 3,1,91 union all 
 select 3,2,47 union all 
 select 3,3,88 union all 
 select 3,4,56 union all 
 select 4,2,88 union all 
 select 4,3,90 union all 
 select 4,4,93 union all 
 select 5,1,46 union all 
 select 5,3,78 union all 
 select 5,4,53 union all 
 select 6,1,35 union all 
 select 6,2,68 union all 
 select 6,4,71;
```

## TOPIC1

>  查询“1”课程比“2”课程成绩高的所有学生的学号；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	c1.s_id "学号" 
FROM
	(SELECT s_id, score FROM sc WHERE c_id = 1) c1,
	(SELECT s_id, score FROM sc WHERE c_id = 2) c2 
WHERE
	c1.score > c2.score 
	AND c1.s_id = c2.s_id;
```

</details>



## TOPIC2

> 查询平均成绩大于60分的同学的学号和平均成绩

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s_id "学号",
	AVG( score ) avg 
FROM
	sc 
GROUP BY
	s_id 
HAVING
	avg > 60
```

</details>



## TOPIC3

> 查询所有同学的学号、姓名、选课数、总成绩

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s.s_id "学号",
	s.sname "姓名",
	COUNT(*) "选课数",
	SUM(sc.score) "总成绩" 
FROM
	student s
	LEFT JOIN sc ON s.s_id = sc.s_id 
GROUP BY
	sc.s_id;
```

</details>



## TOPIC4

> 查询姓“李”的老师的个数；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	COUNT(*) 
FROM
	teacher 
WHERE
	tname LIKE '李%'
```

</details>



## TOPIC5

> 查询没学过“叶平”老师课的同学的学号、姓名； 

<details>
    <summary>查看答案</summary>

```sql
SELECT DISTINCT
	s.s_id,
	s.sname 
FROM
	student s 
WHERE
	s.s_id NOT IN (
	SELECT
		sc.s_id 
	FROM
		sc
		INNER JOIN course c ON sc.c_id = c.c_id
		LEFT JOIN teacher t ON c.t_id = t.t_id 
WHERE
	t.tname = '叶平')
```

</details>



## TOPIC6

> 查询学过“1”并且也学过编号“2”课程的同学的学号、姓名；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s.s_id "学号",
	s.sname "姓名" 
FROM
	student s
	INNER JOIN sc ON s.s_id = sc.s_id 
WHERE
	sc.c_id = 1 
	OR sc.c_id = 2 
GROUP BY
	sc.s_id 
HAVING
	COUNT(*)>1
```

```sql
SELECT
	s.s_id "学号",
	s.sname "姓名" 
FROM
	student s
	INNER JOIN sc ON s.s_id = sc.s_id 
WHERE
	sc.c_id = 1 
	AND EXISTS ( SELECT * FROM sc sc2 WHERE sc2.s_id = sc.s_id AND sc2.c_id = 2 )
```

</details>



## TOPIC7

> 查询课程编号“2”的成绩比课程编号“1”课程低的所有同学的学号、姓名；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s.s_id,
	s.sname 
FROM
	sc sc1,
	sc sc2,
	student s 
WHERE
	sc1.c_id = 1 
	AND sc2.c_id = 2 
	AND sc1.s_id = sc2.s_id 
	AND sc2.score < sc1.score 
	AND sc2.s_id = s.s_id
```

```sql
SELECT
	s.s_id,
	s.sname 
FROM
	student s
WHERE
	s_id IN (
	SELECT
		c1.s_id 
	FROM
		( SELECT s_id, score FROM sc WHERE c_id = 1 ) c1,
		( SELECT s_id, score FROM sc WHERE c_id = 2 ) c2 
	WHERE
	c2.score < c1.score 
	AND c1.s_id = c2.s_id
)
```

</details>



## TOPIC8

> 查询学过“叶平”老师所教的所有课的同学的学号、姓名；

<details>
    <summary>查看答案</summary>

```sql
SELECT DISTINCT
	s.s_id,
	s.sname 
FROM
	student s 
WHERE
	s.s_id IN (
	SELECT
		sc.s_id 
	FROM
		sc
		INNER JOIN course c ON sc.c_id = c.c_id
		LEFT JOIN teacher t ON c.t_id = t.t_id 
WHERE
	t.tname = '叶平')
```

</details>



## TOPIC9

> 查询所有课程成绩小于60分的同学的学号、姓名；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s.s_id,
	s.sname 
FROM
	student s 
WHERE
	s.s_id NOT IN (SELECT DISTINCT sc.s_id FROM sc WHERE score>60)
```

</details>



## TOPIC10

> 查询没有学全所有课的同学的学号、姓名；

<details>
    <summary>查看答案</summary>

```sql
SELECT
	s.s_id,
	s.sname 
FROM
	student s,
	sc 
WHERE
	s.s_id = sc.s_id 
GROUP BY
	sc.s_id 
HAVING
	COUNT(*) < (SELECT COUNT(*) FROM course)
```

</details>

