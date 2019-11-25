# deepin的使用

[TOC]

## wine设置

### 为wine方式安装的程序创建快捷方式

```properties
[Desktop Entry]
Encoding=UTF-8
Exec=deepin-wine "/home/cloudlandboy/.wine/drive_c/Program Files/DAUM/PotPlayer/PotPlayerMini.exe"
Icon=/home/cloudlandboy/others/icon/PotPlayer.xpm
Name=PotPlayer
Name[zh_CN]=PotPlayer
Terminal=false
Type=Application
X-Deepin-Vendor=user-custom

```
需要修改的地方  
- <mark>Exec</mark>：要执行的命令
- <mark>Icon</mark>：快捷方式图标
- <mark>Name</mark>：快捷方式名称
- <mark>Name[zh_CN]</mark>：快捷方式中文名称

### wine窗口美化

[参考连接：https://www.lulinux.com/archives/362](https://www.lulinux.com/archives/362 "wine窗口美化")

## 软件安装位置和配置文件路径

| 软件名称 |     安装路径     |       配置文件       |         其他         |
| :------: | :--------------: | :------------------: | :------------------: |
|  nginx   | /usr/share/nginx |      /etc/nginx      | 日志：/var/log/nginx |
|  mysql   | /usr/share/mysql | data：/var/lib/mysql | 日志：/var/log/mysql |

## 解压

### rar格式

安装rar

```shell
sudo apt install rar
```

解压

```shell
rar x xxx.rar
```

## 安装ibus输入法

1. 卸载自带搜狗输入法和fcitx

   ```shell
   sudo apt purge -y sogou* fcitx*
   ```

2. 安装

   ```shell
   sudo apt-get install ibus-rime
   ```

3. 把xinputrc里面的fcitx换成ibus。

   ```shell
   vim ~/.xinputrc
   ```

4. 然后把export gtk_im_module=ibus、export xmodifiers=@im=ibus、export qt_im_module=ibus粘到bashrc里面。(直接执行下面就行)。

   ```shell
   echo -e "export gtk_im_module=ibus\nexport xmodifiers=@im=ibus\nexport qt_im_module=ibus" >> ~/.bashrc
   ```

5. 清理一下冗余文件。

   ```shell
   sudo rm -f /usr/share/im-config/data/23_ibus.*
   ```

6. 重启或者注销重新登录

7. super+空格键可切换输入法（可在设置中修改为系统键位），按住Ctrl+`或者F4，选择 朙月拼音.简化字

8. 后选词不跟随光标解决。

   ```shell
   sudo apt-get install ibus-gtk ibus-gtk3 ibus-qt4
   ```

9. DIY，配置文件路径`/home/cloudlandboy/.config/ibus/rime/`，例如修改候选词个数为9，创建default.custom.yaml文件，然后重启ibus。

   ```shell
   patch:
     "menu/page_size": 9
   ```


