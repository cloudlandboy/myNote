# mysql的安装与使用

## mysql的安装

- Windows
- [Linux](https://note.zzrfdsn.cn/note/root/cloudlandboy/linux/1566488563139.html)

## 启动和停止MySQL服务

- Windows

  方式一：通过计算机管理方式
  右击计算机—管理—服务—启动或停止MySQL服务
  方式二：通过命令行方式
  启动：net start mysql服务名
  停止：net stop mysql服务名

- Linux

  启动：service mysql(mysqld) start

  停止：service mysql(mysqld) stop

  状态：service mysql(mysqld) status

## MySQL服务端的登录和退出

- 登录

  mysql –u用户名 –p密码

- 远程登录

  mysql -h 主机名 -P 端口号 -u root -proot

- 退出

  exit(quit)

## MySql数据库的使用

- 不区分大小写(Linux上区分，可以通过配置文件修改)
- 每句话用;或\g结尾
- 各子句一般分行写
- 关键字不能缩写也不能分行
- 用缩进提高语句的可读性

## 基本命令

查看 mysql 中有哪些个数据库: 

``` mysql
show databases;
```

 使用一个数据库: 

``` mysql
use 数据库名称;
```

查看当前使用数据库中的表：

``` mysql
show tables;
```

查看指定数据库中的表：

``` mysql
show tables from 库名;
```

新建一个数据库: 

``` mysql
#创建数据库 数据库中数据的编码采用的是安装数据库时指定的默认编码 utf8
CREATE DATABASE 数据库名;

#创建数据库 并指定数据库中数据的编码
CREATE DATABASE 数据库名 CHARACTER SET utf8;
```

查看当前选择的数据库:

``` mysql
select database();
```

创建表:

``` mysql
create table stuinfo(
    id int,
    name varchar(20));
```

查看表结构:

``` mysql
desc 表名;
```

查看表中的所有记录: 

``` mysql
select * from 表名;
```

向表中插入记录：

``` mysql
insert into 表名(列名1,列名,...,列名n) values(列1值,列2值,...,列n值);
```

<mark><small>注意：插入 varchar 或 date 型的数据要用 单引号 引起来<small></mark>