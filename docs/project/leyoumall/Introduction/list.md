# 项目资源清单



## 依赖版本一览

```xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.10.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>


    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>Greenwich.SR4</spring-cloud.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <mybatis.starter.version>2.1.1</mybatis.starter.version>
        <mapper.starter.version>2.1.5</mapper.starter.version>
        <druid.starter.version>1.1.10</druid.starter.version>
        <mysql.version>5.1.38</mysql.version>
        <pageHelper.starter.version>1.2.4</pageHelper.starter.version>
        <fastDFS.client.version>1.26.7</fastDFS.client.version>
    </properties>
```

- `Elasticsearch`学习时使用的是`7.5.0`版本，项目中使用的时`6.4.3`版本



## 使用端口一览

![201912111140](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323165.png)

- `leyou-manage-web :9001` 后台管理页面(VUE单页应用)
- `leyou-portal :9002` 商城门户

## 后台页面

[后台页面下载](/project/leyoumall/resources/leyou-manage-web.tar.gz ':ignore')



## sql文件

[leyou.sql](/project/leyoumall/resources/leyou.sql ':ignore')



## 商品图片

[images.zip](https://www.lanzous.com/i7vc6ub)



## 前台页面

[前台页面资源](/project/leyoumall/resources/leyou-portal.zip ':ignore')



## 工具包

`leyou-common`下的工具包：[utils.tar.gz](/project/leyoumall/resources/utils.tar.gz ':ignore')

`leyou-auth-common`下的工具包：[jwtUtils.tar.gz](/project/leyoumall/resources/jwtUtils.tar.gz ':ignore')



## 订单模块

[leyou-order.zip](/project/leyoumall/resources/leyou-order.zip ':ignore')