const mysql = require("mysql"); //导入mysql模块

//打开连接的方法
function openConnection() {
	//创建连接
	let connection = mysql.createConnection({
		host: '111.222.111.222',
		port: '3306',
		user: 'yourName',
		password: 'yourPWD',
		database: 'node_test'
	})

	//开启连接
	connection.connect((error) => {
		if (error) {
			console.error('连接出错了: ' + error.stack);
			return;
		}
		console.log('连接成功,连接id为：' + connection.threadId);
	});

	return connection;
}

const connection = openConnection();

/**
 * 查询全部
 */
function queryAll() {

	let sql = "select * from category_";

	connection.query(sql, (error, result) => {
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}

/**
 * @param {[String]}
 */
function add(name) {

	let sql = "INSERT INTO category_ VALUES (?,?)";

	let sqlParam=[null,name];

	connection.query(sql, sqlParam, (error, result) => {
		if (error) {
			console.log(error);
			return;
		}
		console.log(result);
	})
}

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