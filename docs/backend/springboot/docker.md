# Docker基本使用

**Docker**是一个开源的应用容器引擎；是一个轻量级容器技术；

Docker支持将软件编译成一个镜像；然后在镜像中各种软件做好配置，将镜像发布出去，其他使用者可以直接使用这个镜像；

运行中的这个镜像称为容器，容器启动是非常快速的。



![](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/20180303145450.png)



![](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/20180303145531.png)

## 核心概念

`docker主机(Host)`：安装了Docker程序的机器（Docker直接安装在操作系统之上）；

`docker客户端(Client)`：连接docker主机进行操作；

`docker仓库(Registry)`：用来保存各种打包好的软件镜像；

`docker镜像(Images)`：软件打包好的镜像；放在docker仓库中；

`docker容器(Container)`：镜像启动后的实例称为一个容器；容器是独立运行的一个或一组应用

![](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/20180303165113.png)

使用Docker的步骤：

1. 确认要安装docker的系统的linux内核高于`3.10`，低于3.10使用`yum update`更新

   ```shell
   uname -r
   ```

2. 安装docker

   ```shell
   yum install docker
   ```

3. 查看docker版本

   ```shell
   docker -v
   ```

4. 查看docker状态

   ```shell
   service docker status
   ```

5. 启动docker

   ```shell
   service docker start
   ```

6. 停止docker

   ```shell
   service docker stop
   ```

7. 设置docker开机自启

   ```shell
   systemctl enable docker
   ```

   



## docker常用命令

### 镜像操作

| 操作 | 命令                                            | 说明                                                     |
| ---- | ----------------------------------------------- | -------------------------------------------------------- |
| 检索 | docker  search 关键字  eg：docker  search redis | 我们经常去docker  hub上检索镜像的详细信息，如镜像的TAG。 |
| 拉取 | docker pull 镜像名:tag                          | :tag是可选的，tag表示标签，多为软件的版本，默认是latest  |
| 列表 | docker images                                   | 查看所有本地镜像                                         |
| 删除 | docker rmi image-id                             | 删除指定的本地镜像                                       |

### 修改镜像源

修改 /etc/docker/daemon.json ，写入如下内容（如果文件不存在请新建该文件）

```
vim /etc/docker/daemon.json

#　内容：

{
"registry-mirrors":["http://hub-mirror.c.163.com"]
}
```

| 国内镜像源        | 地址                                 |
| ----------------- | ------------------------------------ |
| Docker 官方中国区 | https://registry.docker-cn.com       |
| 网易              | http://hub-mirror.c.163.com          |
| 中国科技大学      | https://docker.mirrors.ustc.edu.cn   |
| 阿里云            | https://pee6w651.mirror.aliyuncs.com |



## 容器操作

**以tomcat为例：**

1. 下载tomcat镜像

   ```shell
   docker pull tomcat
   ```

   如需选择具体版本，可以在<https://hub.docker.com/>搜索tomcat

   ```shell
   docker pull tomcat:7.0.96-jdk8-adoptopenjdk-hotspot
   ```

2. 根据镜像启动容器，不加TAG默认latest，如果没有下载latest会先去下载再启动

   ```shell
   docker run --name mytomcat -d tomcat:latest
   ```

   `--name`：给容器起个名字

   `-d`：后台启动，不加就是前端启动，然后你就只能开一个新的窗口连接，不然就望着黑乎乎的窗口，啥也干不了，`Ctrl+C`即可退出，当然，容器也会关闭

3. 查看运行中的容器

   ```shell
   docker ps
   ```

4. 停止运行中的容器

   ```shell
   docker stop  容器的id
   
   # 或者
   
   docker stop  容器的名称，就是--name给起的哪个名字
   ```

5. 查看所有的容器

   ```shell
   docker ps -a
   ```

6. 启动容器

   ```shell
   docker start 容器id/名字
   ```

7. 删除一个容器

   ```shell
   docker rm 容器id/名字
   ```

8. 启动一个做了端口映射的tomcat

   ```shell
    docker run -d -p 8888:8080 tomcat
   ```

   `-d`：后台运行
   `-p`: 将主机的端口映射到容器的一个端口    `主机端口(8888)`:`容器内部的端口(8080)`

   外界通过主机的8888端口就可以访问到tomcat，前提是8888端口开放

9. 关闭防火墙

   ```shell
   # 查看防火墙状态
   service firewalld status
   
   # 关闭防火墙
   service firewalld stop
   ```

10. 查看容器的日志

    ```shell
    docker logs 容器id/名字
    ```

    

**以mysql为例：**

``` shell
# 拉取镜像
docker pull mysql:5.7.28

# 运行mysql容器
 docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -d mysql:5.7.28
```

`--name mysql`：容器的名字是mysql；

`MYSQL_ROOT_PASSWORD=root`：root用户的密码是root (必须指定)

连接容器内mysql

在使用 **-d** 参数时，容器启动后会进入后台。此时想要进入容器，可以通过以下指令进入：

- **docker attach**
- **docker exec**：推荐使用 docker exec 命令，因为此退出容器终端，不会导致容器的停止。

```shell
docker exec -it mysql bash
```

`-i`: 交互式操作。

`-t`: 终端。

`mysql`: 名为mysql的 镜像。

`bash`：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 bash，也可以用`/bin/bash`。

连接上以后就可以正常使用mysql命令操作了

```shell
mysql -uroot -proot
```



直接使用端口映射更加方便

```shell
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:5.7.28
```

