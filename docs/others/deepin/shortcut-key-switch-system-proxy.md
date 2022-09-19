# 快捷键快速设置系统代理

> 演示环境
>
> 代理软件：clash
>
> 桌面系统：deepin



## 脚本文件

`/home/clboy/clash/switch.sh`

```sh
#!/bin/sh
PORT=8889
SOCKS_PORT=1080
WORK_DIRECTORY='/home/clboy/clash'
PROXY_EXEC_COMMAND='/home/clboy/clash/clash -f /home/clboy/clash/clash.yaml -d /home/clboy/clash'

CURRENT_MODE=`gsettings get org.gnome.system.proxy mode`
if [ "$CURRENT_MODE" = "'none'" ]
then
	nohup ${PROXY_EXEC_COMMAND} > "$WORK_DIRECTORY/proxy.log" 2>&1 &
    gsettings set org.gnome.system.proxy mode 'manual'
	gsettings set org.gnome.system.proxy.http host '127.0.0.1'
	gsettings set org.gnome.system.proxy.http port "$PORT"
	gsettings set org.gnome.system.proxy.ftp host '127.0.0.1'
	gsettings set org.gnome.system.proxy.ftp port "$PORT"
	gsettings set org.gnome.system.proxy.https host '127.0.0.1'
	gsettings set org.gnome.system.proxy.https port "$PORT"
	gsettings set org.gnome.system.proxy.socks host '127.0.0.1'
	gsettings set org.gnome.system.proxy.socks port "$SOCKS_PORT"
	notify-send -i /home/clboy/clash/logo.png '开启系统代理'
else
	CLASH_PID=`ps -aux | grep -v grep | grep "$PROXY_EXEC_COMMAND" | awk '{print $2}'`
	if [ -n "$CLASH_PID" ]
	then
		kill -9 $CLASH_PID
	fi
    gsettings set org.gnome.system.proxy mode 'none'
	notify-send -i /home/clboy/clash/logo.png '关闭系统代理'
fi
```

## 设置系统快捷键

![image-20220913160650186](https://cdn.tencentfs.clboy.cn/images/2022/20220913160715549.png)

这样就可以使用 `ctrl+shift+p` 快捷键快速开启和关闭