

# Node.js 连接 MySQL

## 准备数据

```sql
CREATE DATABASE node_test CHARACTER SET utf8;

USE node_test;

CREATE TABLE category_ (
  id INT(11) NOT NULL AUTO_INCREMENT,
  NAME VARCHAR(30) ,
  PRIMARY KEY (id)
) DEFAULT CHARSET=UTF8;
INSERT INTO category_ VALUES(NULL,"category1");
INSERT INTO category_ VALUES(NULL,"category2");
INSERT INTO category_ VALUES(NULL,"category3");
INSERT INTO category_ VALUES(NULL,"category4");
INSERT INTO category_ VALUES(NULL,"category5");
```



## 创建项目

创建一个node_mysql项目文件夹

## 安装驱动

```shell
cnpm install mysql
```

## 连接数据库

!> 在以下实例中根据你的实际配置修改数据库用户名、及密码及数据库名：

创建`dao.js`文件

```javascript
const mysql=require("mysql"); //导入mysql模块

//打开连接的方法
function openConnection(){
	//创建连接
	let connection=mysql.createConnection({
		host:'111.231.56.104',
		port:'3306',
		user:'syl_remote',
		password:'17633759236',
		database:'node_test'
	})

	//开启连接
	connection.connect((error)=>{
		if (error) {
			console.error('连接出错了: ' + error.stack);
			return;
		}
		console.log('连接成功,连接id为：'+connection.threadId);
	});

	return connection;
}

const connection=openConnection();
```



更多[连接选项参考](https://github.com/mysqljs/mysql#connection-options)



## 数据库操作( CURD )

### 查询数据

```javascript
const mysql=require("mysql"); //导入mysql模块

//打开连接的方法
function openConnection(){
	//创建连接
	let connection=mysql.createConnection({
		host:'111.231.56.104',
		port:'3306',
		user:'syl_remote',
		password:'17633759236',
		database:'node_test'
	})

	//开启连接
	connection.connect((error)=>{
		if (error) {
			console.error('连接出错了: ' + error.stack);
			return;
		}
		console.log('连接成功,连接id为：'+connection.threadId);
	});

	return connection;
}

const connection=openConnection();

/**
 * 查询全部
 */
function queryAll(){

	let sql="select * from category_";

	connection.query(sql,(error,result)=>{
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}



module.exports={
	queryAll
}
```

创建`main.js`

```javascript
const dao=require("./dao");

dao.queryAll();
```

### 新增数据

在`dao.js`添加新增数据的方法

```javascript
/**
 * @param {[String]}
 */
function add(name) {

	let sql = "INSERT INTO category_ VALUES (?,?)";

	let sqlParam=[null,name]

	connection.query(sql, sqlParam, (error, result) => {
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}


module.exports = {
	queryAll,
	add
}
```

`main.js`

```javascript
const dao=require("./dao");

dao.add("电脑办公");

dao.queryAll();

```

运行结果如下：

![20200506020322.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213009.png)



### 修改数据

在`dao.js`添加修改数据的方法

```javascript
/**
 * @param  {[String]}
 * @param  {[Number]}
 */
function update(name,id) {

	let sql = "UPDATE category_ SET name=? WHERE id=?";

	let sqlParam=[name,id];

	connection.query(sql, sqlParam, (error, result) => {
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}

module.exports = {
	queryAll,
	add,
	update
}
```

![20200506021815.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213441.png)

### 删除数据

在`dao.js`添加删除数据的方法

```javascript
/**
 * @param  {[Number]}
 */
function remove(id) {

	let sql = "DELETE FROM category_ WHERE id=?";

	let sqlParam=[id];

	connection.query(sql, sqlParam, (error, result) => {
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}


module.exports = {
	queryAll,
	add,
	update,
	remove
}
```

![20200506022850.png](https://cdn.tencentfs.clboy.cn/images/2021/20210911203213868.png)

## 源代码

<a href="frontend/node/code/node_mysql/dao.js" download="dao.js">dao.js</a>