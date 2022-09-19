const fs=require("fs") //引入fs模块

//同步读取文件的方法
function readFile(){
	let text=fs.readFileSync('20200427.txt');
	return text;
}

//同步写入文件的方法
function writeFile(){
	fs.writeFileSync('20200427.txt','hello world!');
	return "写入完成！现在文件内容为：\r\n"+readFile();
}

exports.readFile=readFile;
exports.writeFile=writeFile;