# 简历

## 联系方式

- 手机：17633759236
- Email：617751303@qq.com
- QQ/微信号：617751303

------

## 个人信息

- 孙云腊/男/1997
- 专科
- 期望职位：Java程序员
- 期望薪资：5000-8000
- 期望城市：杭州
- 个人博客：[http://www.clboy.cn](http://www.clboy.cn)

------

## 教育经历

- 时间：2016年9月 - 2019年6月
- 学校：郑州财经学院
- 专业：软件技术 
- 主修课程：计算机网络基础、JavaScript程序设计基础、JavaEE轻量级框架应用与开发、Linux操作系统、软件工程、Java Web程序设计实战、WEB程序开发技术、Android基础教程等

------

## 技能清单

- 熟练使用Java面向对象编程
- 熟练使用Jsp，Servlet，Tomcat
- 掌握HTML，CSS，JavaScript，Ajax，jQuery，EasyUI，layui等前端开发技术；
- 熟悉SVN，Maven，Git等项目管理工具;
- 熟悉Spring，SpringMVC，Struts2，Hibernate，MyBatis等开源框架技术；
- 熟悉关系型数据库MySQL，了解缓存数据库Redis
- 熟悉全文检索Luene和Solr
- 熟悉Linux常用命令
- 了解SpringBoot，SpringCloud
- 了解FreeMarker和Thyemleaf模板引擎技术
- 了解反向代理Nginx
- 了解消息中间件ActiveMQ
- 了解Dubbo和WebService远程调用
- 了解安全框架Shiro

------

## 项目经历



**项目名称：** 云梦商城

**项目描述：**该项目是一个综合性的B2C平台，系统按照功能模块拆分成多个子系统，包括后台系统、前台系统、订单系统、搜索系统、用户系统。主要功能有注册登录、商品CRUD和上架下架、内容分类和内容管理、导入索引库、商品搜索、商品详情、SSO单点登录、购物车、订单、在线支付等

**项目架构：**Spring+SpringMVC+Mybatis+Dubbo+Solr+MySQL

**开发环境：**Deepin15.11+IDEA+MySQL5.7+Tomcat7

**技术要点：**

1. 表现层和服务层之间通过Dubbo发布和调用服务
2. 使用FastDFS存储商品图片，添加商品时将图片上传到FastDFS服务器并返回访问地址
3. 首页内容进行分类，可以通过后台系统修改具体分类的内容，并使用Redis缓存，前台动态展示
4. 商品搜索结果来自Solr服务器，每次添加商品时通过ActiveMQ发布消息，商品搜索服务监听到消息时同步索引库
5. 商品详情页面是在添加商品时监听ActiveMQ消息，收到消息时使用Freemarker生成静态页面，访问时直接通过Nginx访问静态页面
6. 登录是调用QQ互联接口，登录成功后生成Token存放到Redis中并设置过期时间，写入到客户端Cookie
7. 购物车采用Cookie+Redis的方式
8. 支付功能调用支付宝在线支付接口



<div style="border-top:1px dotted green;margin:10px 0"></div>



**项目名称：** 物流后台管理

**项目描述：** 该系统主要完成了基本设置和系统设置两大部分，基础设置包括取派员设置，区域设置，定区管理与分区管理，受理，快递单录入，人工调度等，系统功能包括：用户管理，权限管理，角色管理等

**项目架构：** Struts2+Hibernate+Spring+MySQL

**开发环境：**Windows10+Eclipse+MySQL5.7+Tomcat7

**技术要点：**

1. 基础数据的CRUD
2. 使用Apache POI 对数据的导入导出
3. 使用Highcharts展示分区分布图
4. 使用Shiro管理权限
5. 使用WebService调用客户服务

**项目地址：**[http://bos.zzrfdsnsyl.club](http://bos.zzrfdsnsyl.club)

------

## 自我评价

自我学习能力还是比较强，性格沉稳踏实，做事很认真。热爱编程，喜欢学习新技术，具备良好的编程习惯和解决问题的能力。喜欢看技术类文章。

## 致谢

感谢您花时间阅读我的简历，期待能有机会和您共事。