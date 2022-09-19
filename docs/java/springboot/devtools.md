# SpringBoot工程热部署

> 我们在开发中反复修改类、页面等资源，每次修改后都是需要重新启动才生效，这样每次启动都很麻烦，浪费了大量的时间，我们可以在修改代码后不重启就能生效，在 pom.xml 中添加如下配置就可以实现这样的功能，我们称之为热部署。

##  添加依赖

```xml
<!--热部署配置-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

## IDEA自动编译

> Intellij IEDA默认情况下不会自动编译，需要对IDEA进行自动编译的设置，不然还需要按`Ctrl+F9`进行编译

![image-20210324110123986](https://cdn.tencentfs.clboy.cn/images/2021/20210911203238052.png)

> 然后使用快捷键` Shift+Ctrl+Alt+/`，选择 `Registry...`

![image-20210324111339548](https://cdn.tencentfs.clboy.cn/images/2021/20210911203238241.png)

