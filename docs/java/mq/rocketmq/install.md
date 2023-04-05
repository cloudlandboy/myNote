# RocketMQ的安装

## 使用二进制包部署



官方文档已经详细介绍了该如何安装：

https://rocketmq.apache.org/zh/docs/4.x/introduction/02quickstart



安装官网文档下载二进制包后很容易就把NameServer和Broker启动起来了，安装我这里就总结下注意点

首先RocketMQ使用java开发的，所以要准备安装的机器上要有java环境，另外在环境变量中要通过 `JAVA_HOME` 去指定java的安装目录

建议第一次启动的时候不要用nohub命令，让其直接在控制台启动，查看一次完整的启动流程日志，比如我之前直接在环境变量path中配置的jdk目录，并没有 `JAVA_HOME` 这个变量，直接运行会给出错误提示，使用nohub反而第一时间看不出问题。确保能够在机器上正常启动之后再加上nohub在后台运行



## 部署控制面板

RocketMQ不像RabibitMQ那样安装之后就自带了可视化的web界面，RocketMQ的web可视化界面需要单独部署

官方文档给出了docker部署和源码部署两种方式：

https://rocketmq.apache.org/zh/docs/4.x/deployment/03Dashboard#1-docker-%E9%95%9C%E5%83%8F%E5%AE%89%E8%A3%85

为了方便可直接用docker部署，注意将映射到宿主机的端口8080修改为别的，不要和正在运行的服务冲突

```shell
docker run -d --name rocketmq-dashboard -e "JAVA_OPTS=-Drocketmq.namesrv.addr=127.0.0.1:9876" -p 20001:8080 -t apacherocketmq/rocketmq-dashboard:latest
```

启动后访问 http://127.0.0.1:20001 就能看到控制台界面了，但是会报错，连接不上NameServer，因为我们填写的是127.0.0.1，可以在控制台运维面板中修改为宿主机ip



