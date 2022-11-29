# FastDFS

### 什么是分布式文件系统

分布式文件系统（Distributed File System）是指文件系统管理的物理存储资源不一定直接连接在本地节点上，而是通过计算机网络与节点相连。 

通俗来讲：

- 传统文件系统管理的文件就存储在本机。
- 分布式文件系统管理的文件存储在很多机器，这些机器通过网络连接，要被统一管理。无论是上传或者访问文件，都需要通过管理中心来访问



### 什么是FastDFS

FastDFS是由淘宝的余庆先生所开发的一个轻量级、高性能的开源分布式文件系统。用纯C语言开发，功能丰富：

- 文件存储
- 文件同步
- 文件访问（上传、下载）
- 存取负载均衡
- 在线扩容

适合有大容量存储需求的应用或系统。同类的分布式文件系统有谷歌的GFS、HDFS（Hadoop）、TFS（淘宝）等。

### FastDFS的架构

先上图：

 ![1526205318630](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231668.png)

FastDFS两个主要的角色：Tracker Server 和 Storage Server 。

- Tracker Server：跟踪服务器，主要负责调度storage节点与client通信，在访问上起负载均衡的作用，和记录storage节点的运行状态，是连接client和storage节点的枢纽。 
- Storage Server：存储服务器，保存文件和文件的meta data（元数据），每个storage server会启动一个单独的线程主动向Tracker cluster中每个tracker server报告其状态信息，包括磁盘使用情况，文件同步情况及文件上传下载次数统计等信息
- Group：文件组，多台Storage Server的集群。上传一个文件到同组内的一台机器上后，FastDFS会将该文件即时同步到同组内的其它所有机器上，起到备份的作用。不同组的服务器，保存的数据不同，而且相互独立，不进行通信。 
- Tracker Cluster：跟踪服务器的集群，有一组Tracker Server（跟踪服务器）组成。
- Storage Cluster ：存储集群，有多个Group组成。



### 上传和下载流程

> 上传

 ![1526205664373](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231926.png)

1. Client通过Tracker server查找可用的Storage server。
2. Tracker server向Client返回一台可用的Storage server的IP地址和端口号。
3. Client直接通过Tracker server返回的IP地址和端口与其中一台Storage server建立连接并进行文件上传。
4. 上传完成，Storage server返回Client一个文件ID，文件上传结束。

> 下载

 ![1526205705687](https://cdn.tencentfs.clboy.cn/images/2021/20210911203232190.png)

1. Client通过Tracker server查找要下载文件所在的的Storage server。
2. Tracker server向Client返回包含指定文件的某个Storage server的IP地址和端口号。
3. Client直接通过Tracker server返回的IP地址和端口与其中一台Storage server建立连接并指定要下载文件。
4. 下载文件成功。

## 安装环境

> 所需文件下载地址：<https://github.com/happyfish100>

- vmware
- CentOS-7
- [fastdfs-6.03.tar.gz](https://github.com/happyfish100/fastdfs/archive/V6.03.tar.gz)
- [fastdfs-nginx-module-1.22.tar.gz](https://github.com/happyfish100/fastdfs-nginx-module/archive/V1.22.tar.gz)
- [libfastcommon-1.0.42.tar.gz](https://github.com/happyfish100/libfastcommon/archive/V1.0.42.tar.gz)
- [nginx-1.17.6](http://nginx.org/download/nginx-1.17.6.tar.gz)



!> 系统镜像安装后之后记得先做一份快照

1. 在/usr/local下新建leyou目录
2. 然后把下载的安装包上传到leyou目录下

![1575520941277](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318978.png)  

![1575521421898](https://cdn.tencentfs.clboy.cn/images/2021/20210911203319030.png)

## 单节点FastDFS

整个安装过程非常复杂，很容易出错，建议进行多次备份。

我们这里不打算安装多台虚拟机，因此会把tracker和storage都安装在一起。

 

### 安装gcc

GCC用来对C语言代码进行编译运行，使用yum命令安装：

```shell
yum -y install gcc
```

后面会用到解压命令（unzip），所以这里可以用yum把unzip 也装一下

```shell
yum install -y unzip zip
```

 

### 安装libevent

```shell
yum -y install libevent
```

 

### 安装libfastcommon

```shell
解压
tar -xvf libfastcommon-1.0.42.tar.gz

进入解压完成的目录
cd libfastcommon-1.0.42

编译并且安装：
./make.sh 
./make.sh install
```

 

### 安装fastdfs

```shell
tar -xvf fastdfs-6.03.tar.gz
cd  fastdfs-6.03/
./make.sh 
./make.sh install
```

 

如果安装成功，会看到/etc/init.d/下看到提供的脚本文件：

```shell
ll /etc/init.d/ | grep fdfs
```

![1575521951082](https://cdn.tencentfs.clboy.cn/images/2021/20210911203319082.png)

- `fdfs_trackerd` 是tracker启动脚本
- `fdfs_storaged` 是storage启动脚本



能够在 /etc/fdfs/ 目录下看到默认的配置文件模板：

```shell
ll /etc/fdfs/
```

![1575521980252](https://cdn.tencentfs.clboy.cn/images/2021/20210911203319134.png)

- `tarcker.conf.sample` 是tracker的配置文件模板
- `storage.conf.sample` 是storage的配置文件模板
- `client.conf.sample` 是客户端的配置文件模板



### 配置并启动tracker服务

FastDFS的tracker和storage在刚刚的安装过程中，都已经被安装了，因此我们安装这两种角色的方式是一样的。不同的是，两种需要不同的配置文件。

我们要启动tracker，就修改刚刚看到的`tarcker.conf`，并且启动`fdfs_trackerd`脚本即可。

1. 首先将模板文件复制

   ```shell
   cp /etc/fdfs/tracker.conf.sample /etc/fdfs/tracker.conf
   ```

2. 修改复制后的配置文件：

   ```shell
   vim /etc/fdfs/tracker.conf 
   ```

   修改的内容如下：

   ```properties
   # 存储日志和数据的根目录
   # base_path=/home/fastdfs/tracker
   base_path=/leyou/tracker
   ```

   ![1575522759356](https://cdn.tencentfs.clboy.cn/images/2021/20210911203319191.png)

3. 新建目录：     

   ```shell
   # mkdir -p /home/fastdfs/tracker
   mkdir -p /leyou/tracker
   ```

4. 注意：关闭防火墙：

   ```shell
   # 关闭
   service firewalld stop
   # 禁止开机自启
   systemctl disable firewalld.service
   #查看状态
   service firewalld status
   ```

   



**启动和停止**

启动tracker服务器:     `/etc/init.d/fdfs_trackerd start`

停止tracker服务器:     `/etc/init.d/fdfs_trackerd stop`

不过安装过程中，fdfs已经被设置为系统服务，我们可以采用熟悉的服务启动方式：

```shell
service fdfs_trackerd start # 启动fdfs_trackerd服务，停止用stop
```



检查FastDFS Tracker Server是否启动成功：

```shell
service fdfs_trackerd status
```



```shell
ps -ef | grep fdfs_trackerd
```



设置tracker服务开机启动:

```shell
chkconfig fdfs_trackerd on
```

 

### 配置并启动storage服务

1. 首先将模板文件复制

   ```shell
   cp /etc/fdfs/storage.conf.sample /etc/fdfs/storage.conf
   ```

2. 修改复制后的配置文件：

   ```shell
   vim /etc/fdfs/storage.conf
   ```

   修改的内容如下:

   ```properties
   # 数据和日志文件存储根目录 
   # /home/fastdfs/storage
   base_path=/leyou/storage
   
   # 第一个存储目录 
   # /home/fastdfs/storage
   store_path0=/leyou/storage
   
   # tracker服务器(这里是安装在本机，是本机ip)IP和端口 
   tracker_server=172.16.145.141::22122
   ```

3. 新建目录：     

   ```shell
   # mkdir -p /home/fastdfs/storage
   mkdir -p /leyou/storage
   ```



**启动和停止**

启动storage服务器：`/etc/init.d/fdfs_storaged start`

停止storage服务器：`/etc/init.d/fdfs_storaged stop`

推荐使用：

```shell
service fdfs_storaged start  # 启动fdfs_storaged服务，停止用stop
```



设置storage服务开机启动：

``` shell
chkconfig fdfs_storaged on
```



查看状态

```shell
service fdfs_storaged status
```



## 使用nginx访问FastDFS

### 为什么需要用Nginx访问？

FastDFS通过Tracker服务器,将文件放在Storage服务器存储，但是同组存储服务器之间需要进入文件复制，有同步延迟的问题。

假设Tracker服务器将文件上传到了192.168.4.125，上传成功后文件ID已经返回给客户端。此时FastDFS存储集群机制会将这个文件同步到同组存储192.168.4.126，在文件还没有复制完成的情况下，客户端如果用这个文件ID在192.168.4.126上取文件,就会出现文件无法访问的错误。

而fastdfs-nginx-module可以重定向文件连接到文件上传时的源服务器取文件,避免客户端由于复制延迟导致的文件无法访问错误



### 安装fastdfs-nginx-module

> 解压

```shell
tar -xvf fastdfs-nginx-module-1.22.tar.gz
```





> 修改config



1. 进入src目录

   ```shell
   cd fastdfs-nginx-module-1.22/src/
   ```

2. 编辑config

   ```shell
   vim config
   ```

3. 使用以下替换命令：

   ```shell
   :%s+/usr/local/+/usr/+g
   ```

   将所有的/usr/local替换为 /usr，这个才是正确的目录



### 配置nginx与FastDFS关联配置文件

复制 fastdfs-nginx-module 源码中的配置文件到/etc/fdfs 目录， 并修改

```shell
cp /usr/local/leyou/fastdfs-nginx-module-1.22/src/mod_fastdfs.conf /etc/fdfs/

vi /etc/fdfs/mod_fastdfs.conf
```

修改以下配置：

```shell
# 客户端访问文件连接超时时长（单位：秒）
connect_timeout=10

# tracker服务IP和端口
tracker_server=172.16.145.141:22122

# 访问链接前缀加上组名
url_have_group_name=true

# 文件存储路径
store_path0=/leyou/storage
```



复制 FastDFS 的部分配置文件到/etc/fdfs 目录

```shell
cd /usr/local/leyou/fastdfs-6.03/conf/
cp http.conf mime.types /etc/fdfs/
```



## 安装Nginx的插件

### 如果没有安装过nginx

- 安装nginx的依赖库


```shell
yum -y install gcc pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

 

- 解压安装包


```shell
tar -xvf nginx-1.17.6.tar.gz
```

 

- 配置nginx安装包，并指定fastdfs-nginx-model

```shell
cd nginx-1.17.6/

./configure --prefix=/opt/nginx --sbin-path=/usr/bin/nginx --add-module=/usr/local/leyou/fastdfs-nginx-module-1.22/src/
```

**注意**：在执行./configure配置nginx参数的时候，需要将fastdfs-nginx-moudle源码作为模块编译进去。



- 编译并安装

```shell
make && make install
```



### 如果已经安装过nginx

进入nginx目录：

```shell
cd /usr/local/leyou/nginx-1.17.6/
```

 

配置FastDFS 模块

```shell
./configure --prefix=/opt/nginx --sbin-path=/usr/bin/nginx --add-module=/usr/local/leyou/fastdfs-nginx-module-1.22/src/
```

注意：这次配置时，要添加fastdfs-nginx-moudle模块

 

编译，注意，这次不要安装（install）

```shell
make
```

 

替换nginx二进制文件:

备份：

```shell
mv /usr/bin/nginx /usr/bin/nginx-bak
```

用新编译的nginx启动文件替代原来的：

```shell
cp objs/nginx /usr/bin/
```

 

 

### 启动nginx

配置nginx整合fastdfs-module模块

我们需要修改nginx配置文件，在/opt/nginx/conf/nginx.conf文件中：

```shell
vim  /opt/nginx/conf/nginx.conf
```

将文件中，原来的`server 80{ ...}` 部分代码替换为如下代码：

```nginx
    server {
        listen       80;
        server_name  image.leyou.com;

    	# 监听域名中带有group的，交给FastDFS模块处理
        location ~/group([0-9])/ {
            ngx_fastdfs_module;
        }

        location / {
            root   html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```



启动nginx：

```shell
nginx	# 启动nginx

nginx -s stop	# 停止nginx

nginx -s reload	# 重新载入配置文件
```

可通过ps -ef | grep nginx查看nginx是否已启动成功    



### 设置nginx开机启动

创建一个开机启动的脚本：

```shell
vim /usr/lib/systemd/system/nginx.service
```

添加以下内容：

```sh
[Unit]
Description=nginx
After=network.target
  
[Service]
Type=forking
ExecStart=/usr/bin/nginx
ExecReload=/usr/bin/nginx -s reload
ExecStop=/usr/bin/nginx -s quit
PrivateTmp=true
  
[Install]
WantedBy=multi-user.target
```



!> 粘贴后注意检查一遍头尾



设置开机启动

```shell
systemctl enable nginx
```

如果提示`Failed to execute operation: Access denied`，执行下面后再重新执行上面

``` shell
systemctl daemon-reexec
```

然后重启系统后，查看是否是运行状态

```shell
service nginx status
```

