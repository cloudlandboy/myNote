# Linux任务栏图标显示错误



最近在使用realVnc查看器创建连接时候发现连接窗口的dock栏图标不正确，居然给我显示 Motrix的图标，喽！就介个死样子

![image-20221114152841689](https://cdn.tencentfs.clboy.cn/images/2022/20221115090440196.png)

解决方法，查看 `~/.local/share/applications` 目录下的所有 `desktop` 文件中 `StartupWMClass` 属性的值是不是未定义，一般这个值设为应用的名称，保证唯一，不和其他应用程序冲突

```properties
[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Motrix
Icon=/home/clboy/.local/share/appimages/icons/motrix.png
Categories=Network
Exec="/home/clboy/.local/share/appimages/Motrix-1.6.11.AppImage"
StartupWMClass=
```

修改后

```properties
[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Motrix
Icon=/home/clboy/.local/share/appimages/icons/motrix.png
Categories=Network
Exec="/home/clboy/.local/share/appimages/Motrix-1.6.11.AppImage"
StartupWMClass=Motrix
```



[参考：Different icons in dock for the same application](https://askubuntu.com/questions/1411410/different-icons-in-dock-for-the-same-application-gnome-terminal)

[参考：desktop文件的StartupWMClass字段代表什么？](https://qastack.cn/ubuntu/367396/what-does-the-startupwmclass-field-of-a-desktop-file-represent)