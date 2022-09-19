# RabbitMQ的安装

## windows下安装

!> 没有实操，未知是否可行

### 安装Erlang

下载：<http://www.erlang.org/download/otp_win64_17.3.exe>

安装：

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325036.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325129.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325230.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325326.png)

安装完成。

 

如果出现：

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325420.png)

请选择忽略。

 

### 安装RabbitMQ

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325516.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325618.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325670.png)

安装完成。

 

 

启动、停止、重新安装等。

 

按下win + R 然后运行命令：services.msc

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325782.png)

 

查看RabbitMQ服务有没有启动：

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325836.png)

 

 

### 安装的注意事项

**1）推荐使用默认的安装路径**

**2）系统用户名必须是英文**

可以查看下用户目录：

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325950.png)

也可以在桌面打开cmd查看路径：

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326061.png)

**3**）计算机名必须是英文

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326164.png)

**4）系统的用户必须是管理员**

 

### 启用管理工具

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326269.png)

1、 点击![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326324.png)

2、 输入命令：

rabbitmq-plugins enable rabbitmq_management
 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326376.png)

 

3、 在浏览器中输入地址查看：<http://127.0.0.1:15672/>

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203326429.png)

4、 使用默认账号登录：guest/ guest

 

### 安装失败解决方案

如果安装失败的同学应该如何解决：

l  **重装系统**  

--  不推荐

l  **将RabbitMQ安装到linux虚拟机中**

--  推荐

l  **使用别人安装好的RabbitMQ服务**

a)     只要给你开通一个账户即可。

b)     使用公用的RabbitMQ服务，在192.168.50.22

--  推荐

 

## Linux下安装



首先创建一个文件夹，我这里放在`/usr/local/leyou/rabbitmq`

```
cd /usr/local/leyou/
mkdir rabbitmq
```

 

### 安装Erlang

下载地址：<https://github.com/rabbitmq/erlang-rpm/releases>（RabbitMQ团队精简的软件包）

我这是下载的是：https://github.com/rabbitmq/erlang-rpm/releases/download/v22.2/erlang-22.2-1.el7.x86_64.rpm（安装环境centos7）

关于rabbitmq版本策略参考：<https://www.rabbitmq.com/which-erlang.html>

下载完成后上传到开始创建的文件夹下

> 安装

```shell
rpm -ivh erlang-22.2-1.el7.x86_64.rpm
```

![1576308494191](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324191.png)

### 安装RabbitMQ

RabbitMQ：[rabbitmq-server-3.8.1-1.el7.noarch.rpm](https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.8.1/rabbitmq-server-3.8.1-1.el7.noarch.rpm)

上传后安装：

```
rpm -ivh rabbitmq-server-3.8.1-1.el7.noarch.rpm
```

提示缺少依赖

![1576308576453](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324296.png)

```shell
yum install socat
```

然后再安装

![1576308992781](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324398.png)



### 启动、停止

```
service rabbitmq-server start

service rabbitmq-server stop

service rabbitmq-server restart
```



### 开启web界面管理工具

```
rabbitmq-plugins enable rabbitmq_management

service rabbitmq-server restart
```

 ![1576310477788](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324612.png)

 

### 设置开机启动

```
chkconfig rabbitmq-server on
```

 

### 防火墙开放15672端口

查看防火墙状态（直接关闭防火墙方便一点）

```shell
service firewalld status

# 如果没有关闭则关闭防火墙
systemctl stop firewalld.service
#设置开机不启动防火墙
systemctl disable firewalld.service
```

 

## 管理界面

访问：http://虚拟机ip:15672

登录用户名和密码都是`guest`

提示只能本地连接，那我们就开启远程连接

### 配置文件

启动RabbitMQ后，会在 /var/log/rabbitmq 目录下生成运行日志，在日志的最上方，我们可以看到配置文件的信息：

```shell
cat  /var/log/rabbitmq/rabbit@localhost.log 
```

![1576309469494](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324506.png)

这里显示没有配置文件

我们手动创建配置文件

```shell
vim /etc/rabbitmq/rabbitmq.conf
```

开启远程访问

```
loopback_users = none
```

然后重启rabbitmq

其他配置参考：<https://www.rabbitmq.com/configure.html#config-file-formats>



![1576310818176](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324720.png)

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203325725.png)

connections：无论生产者还是消费者，都需要与RabbitMQ建立连接后才可以完成消息的生产和消费，在这里可以查看连接情况

channels：通道，建立连接后，会形成通道，消息的投递获取依赖通道。

Exchanges：交换机，用来实现消息的路由

Queues：队列，即消息队列，消息存放在队列中，等待消费，消费后被移除队列。

端口：

5672: rabbitMq的编程语言客户端连接端口

15672：rabbitMq管理界面端口

25672：rabbitMq集群的端口

 

## 添加用户

如果不使用guest，我们也可以自己创建一个用户：

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323520.png)

1、 超级管理员(administrator)

可登陆管理控制台，可查看所有的信息，并且可以对用户，策略(policy)进行操作。

2、 监控者(monitoring)

可登陆管理控制台，同时可以查看rabbitmq节点的相关信息(进程数，内存使用情况，磁盘使用情况等)

3、 策略制定者(policymaker)

可登陆管理控制台, 同时可以对policy进行管理。但无法查看节点的相关信息(上图红框标识的部分)。

4、 普通管理者(management)

仅可登陆管理控制台，无法看到节点信息，也无法对策略进行管理。

5、 其他

无法登陆管理控制台，通常就是普通的生产者和消费者。

 

## 创建Virtual Hosts

虚拟主机：类似于mysql中的database。他们都是以“/”开头

![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323611.png)



## 设置权限

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323703.png)

 ![img](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323804.png)

![1576313463517](https://cdn.tencentfs.clboy.cn/images/2021/20210911203324827.png)
