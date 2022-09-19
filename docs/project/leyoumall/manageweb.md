# 搭建后台管理前端页面



> [后台页面下载](/project/leyoumall/resources/leyou-manage-web.tar.gz ':ignore')

将前端页面工程解压后移动到工作空间下，然后使用IDEA打开，安装依赖



## 安装依赖

我们只需要打开终端，进入项目目录，输入：`npm install`命令，即可安装这些依赖。

![1575364739441](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318140.png)



## 运行测试

![1540706914029](https://cdn.tencentfs.clboy.cn/images/2021/20210911203315669.png)

在package.json文件中有scripts启动脚本配置，可以输入命令：`npm run dev`或者`npm start`

![1530374954209](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256417.png)

发现默认的端口是9001。访问：http://localhost:9001



## 目录结构

 ![1525962755237](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217718.png)

webpack：是一个现代 JavaScript 应用程序的*静态模块打包器(module bundler)*。并且提供了前端项目的热部署插件。



## 调用关系

我们最主要理清index.html、main.js、App.vue之间的关系：

![1525964023585](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218086.png)

理一下：

- index.html：html模板文件。定义了空的`div`，其id为`app`。

- main.js：**实例化vue对象**，并且通过id选择器绑定到index.html的div中，因此**main.js的内容都将在index.html的div中显示**。main.js中使用了App组件，即App.vue，main.js中还定义了路由，路由的信息

  `import router from './router'`，是引入当前文件夹下的router文件夹，由于router只有一个文件而且名称为`index.js`，所以可以直接写文件夹名称

- index.js：定义请求路径和组件的映射关系。相当于之前的`<vue-router>`

- App.vue中也没有内容，而是定义了vue-router的锚点：`<router-view>`,我们之前讲过，vue-router路由后的组件将会在锚点展示。

- 最终结论：**一切路由后的内容都将通过App.vue在index.html中显示。**

- 访问流程：用户在浏览器输入路径，例如：http://localhost:9001/#/item/brand --> index.js(/item/brand路径对应pages/item/Brand.vue组件) --> 该组件显示在App.vue的锚点位置 --> main.js使用了App.vue组件，并把该组件渲染在index.html文件中（id为“app”的div中）

  ![1575366950481](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318193.png)

- 也就是说index.html中最终展现的是App.vue中的内容。index.html引用它之后，就拥有了vue的内容（包括组件、样式等），所以，main.js也是**webpack打包的入口**。

![1543399927909](https://cdn.tencentfs.clboy.cn/images/2021/20210911203315943.png)



## Vuetify框架

### 为什么要学习UI框架

Vue虽然会帮我们进行视图的渲染，但样式还是由我们自己来完成。这显然不是我们的强项，因此后端开发人员一般都喜欢使用一些现成的UI组件，拿来即用，常见的例如：

- BootStrap
- LayUI
- EasyUI
- ZUI

然而这些UI组件的基因天生与Vue不合，因为他们更多的是利用DOM操作，借助于jQuery实现，而不是MVVM的思想。

而目前与Vue吻合的UI框架也非常的多，国内比较知名的如：

- element-ui：饿了么出品
- i-view：某公司出品

然而我们都不用，我们今天推荐的是一款国外的框架：Vuetify

官方网站：https://vuetifyjs.com/zh-Hans/



### 为什么选择Vuetify

有中国的为什么还要用外国的？原因如下：

- Vuetify几乎不需要任何CSS代码，而element-ui许多布局样式需要我们来编写
- Vuetify从底层构建起来的语义化组件。简单易学，容易记住。
- Vuetify基于Material Design（谷歌推出的多平台设计规范），更加美观，动画效果酷炫，且风格统一

这是官网的说明：

![1530555978248](https://cdn.tencentfs.clboy.cn/images/2021/20210911203259062.png)

缺陷：

- 目前官网虽然有中文文档，但因为翻译问题，几乎不太能看。



### 怎么用？

基于官方网站的文档进行学习：

![1525960312939](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216044.png)



我们重点关注`UI components`即可，里面有大量的UI组件，我们要用的时候再查看，不用现在学习，先看下有什么：

 ![1525961862771](https://cdn.tencentfs.clboy.cn/images/2021/20210911203216872.png)

 ![1525961875288](https://cdn.tencentfs.clboy.cn/images/2021/20210911203217294.png)

以后用到什么组件，就来查询即可。



## 项目页面布局

接下来我们一起看下页面布局。

Layout组件是我们的整个页面的布局组件：

![1530380040278](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256519.png)

一个典型的三块布局。包含左，上，中三部分：

 ![1525965779366](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218413.png)



里面使用了Vuetify中的2个组件和一个布局元素：

### 导航抽屉

`v-navigation-drawer` ：导航抽屉，主要用于容纳应用程序中的页面的导航链接。 

![1575367534222](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318244.png)



### 工具栏

`v-toolbar `：工具栏通常是网站导航的主要途径。可以与导航抽屉一起很好地工作，动态选择是否打开导航抽屉，实现可伸缩的侧边栏。

![1530380292558](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256578.png)



### 布局元素

`v-content`：并不是一个组件，而是标记页面布局的元素。可以根据您指定的**app**组件的结构动态调整大小，使得您可以创建高度可定制的组件。



那么问题来了：`v-content`中的内容来自哪里？

![1525966180568](https://cdn.tencentfs.clboy.cn/images/2021/20210911203218735.png)

- Layout映射的路径是`/`
- 除了Login以外的所有组件，都是定义在Layout的children属性，并且路径都是`/`的下面
- 因此当路由到子组件时，会在Layout中定义的锚点中显示。
- 并且Layout中的其它部分不会变化，这就实现了布局的共享。



## 使用域名访问本地项目

### 统一环境

我们现在访问页面使用的是：http://localhost:9001

有没有什么问题？

实际开发中，会有不同的环境：

- 开发环境：自己的电脑
- 测试环境：提供给测试人员使用的环境
- 预发布环境：数据是和生成环境的数据一致，运行最新的项目代码进去测试
- 生产环境：项目最终发布上线的环境

如果不同环境使用不同的ip去访问，可能会出现一些问题。为了保证所有环境的一致，我们会在各种环境下都使用域名来访问。

我们将使用以下域名：

- 主域名是：www.leyou.com，leyou.com 
- 管理系统域名：manage.leyou.com
- 网关域名：api.leyou.com
- ...

但是最终，我们希望这些域名指向的还是我们本机的某个端口。

那么，当我们在浏览器输入一个域名时，浏览器是如何找到对应服务的ip和端口的呢？



### 域名解析

一个域名一定会被解析为一个或多个ip。这一般会包含两步：

- 本地域名解析

  浏览器会首先在本机的hosts文件中查找域名映射的IP地址，如果查找到就返回IP ，没找到则进行域名服务器解析，一般本地解析都会失败，因为默认这个文件是空的。

  - Windows下的hosts文件地址：C:/Windows/System32/drivers/etc/hosts
  - Linux下的hosts文件所在路径： /etc/hosts 

  样式：

  ```
  # My hosts
  127.0.0.1 localhost
  ```

- 域名服务器解析

  本地解析失败，才会进行域名服务器解析，域名服务器就是网络中的一台计算机，里面记录了所有注册备案的域名和ip映射关系，一般只要域名是正确的，并且备案通过，一定能找到。



### 解决域名解析问题

我们不可能去购买一个域名，因此我们可以伪造本地的hosts文件，实现对域名的解析。修改本地的host为：

```
127.0.0.1 api.leyou.com
127.0.0.1 manage.leyou.com
```

这样就实现了域名的关系映射了。

每次在C盘寻找hosts文件并修改是非常麻烦的，给大家推荐一个快捷修改host的工具

[下载连接](https://github.com/oldj/SwitchHosts/releases)

解压，运行exe文件，效果：

![1530382550630](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256636.png)



Linux版效果

![1575368301245](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318295.png)

我们添加了两个映射关系（中间用空格隔开）：

- 127.0.0.1 api.leyou.com ：我们的网关Zuul
- 127.0.0.1 manage.leyou.com：我们的后台系统地址

切换为生效状态然后访问：http://manage.leyou.com:9001

出现如下效果就代表配置成功

![1575368609794](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318348.png)



### Invalid Host header解决

原因：我们配置了项目访问的路径，虽然manage.leyou.com映射的ip也是127.0.0.1，但是webpack会验证host是否符合配置。

![1530383612716](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256811.png)

在webpack.dev.conf.js中取消host验证：`disableHostCheck: true`

![1575369146716](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318400.png)

退出重新启动，`npm start`，刷新浏览器





## nginx解决端口问题

域名问题解决了，但是现在要访问后台页面，还得自己加上端口：`http://manage.taotao.com:9001`。

这就不够优雅了。我们希望的是直接域名访问：`http://manage.taotao.com`。这种情况下端口默认是80，如何才能把请求转移到9001端口呢？

这里就要用到反向代理工具：Nginx



### 什么是Nginx

 ![1526187409033](https://cdn.tencentfs.clboy.cn/images/2021/20210911203230962.png)

nginx可以作为web服务器，但更多的时候，我们把它作为网关，因为它具备网关必备的功能：

- 反向代理
- 负载均衡
- 动态路由
- 请求过滤



### nginx作为web服务器

Web服务器分2类：

- web应用服务器，如：
  - tomcat 
  - resin
  - jetty
- web服务器，如：
  - Apache 服务器 
  - Nginx
  - IIS  

区分：web服务器不能解析jsp等页面，只能处理js、css、html等静态资源。
并发：web服务器的并发能力远高于web应用服务器。



### nginx作为反向代理

什么是反向代理？

- 代理：通过客户机的配置，实现让一台服务器代理客户机，客户的所有请求都交给代理服务器处理。
- 反向代理：用一台服务器，代理真实服务器，用户访问时，不再是访问真实服务器，而是代理服务器。

nginx可以当做反向代理服务器来使用：

- 我们需要提前在nginx中配置好反向代理的规则，不同的请求，交给不同的真实服务器处理
- 当请求到达nginx，nginx会根据已经定义的规则进行请求的转发，从而实现路由功能



利用反向代理，就可以解决我们前面所说的端口问题，如图

![1526016663674](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220480.png)

### 安装和使用

#### windows



> 安装

安装非常简单，下载后直接解压即可，绿色免安装，舒服！

![1575448111000](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318606.gif) 





解压后，目录结构：

![1530384792790](https://cdn.tencentfs.clboy.cn/images/2021/20210911203256969.png)

1. conf：配置目录
2. contrib：第三方依赖
3. html：默认的静态资源目录，类似于tomcat的webapps
4. logs：日志目录
5. nginx.exe：启动程序。可双击运行，但不建议这么做。



> 反向代理配置

示例：

 ![1526188831504](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231200.png)

nginx中的每个server就是一个反向代理配置，可以有多个server

完整配置：

```nginx
#user  nobody;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
   
    keepalive_timeout  65;

    gzip  on;
	server {
        listen       80;
        server_name  manage.leyou.com;

        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location / {
			proxy_pass http://127.0.0.1:9001;
			proxy_connect_timeout 600;
			proxy_read_timeout 600;
        }
    }
	server {
        listen       80;
        server_name  api.leyou.com;

        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location / {
			proxy_pass http://127.0.0.1:20001;
			proxy_connect_timeout 600;
			proxy_read_timeout 600;
        }
    }
}
```



> 使用

nginx可以通过命令行来启动，操作命令：

- 启动：`start nginx.exe`
- 停止：`nginx.exe -s stop`
- 重新加载：`nginx.exe -s reload`

启动过程会闪烁一下，启动成功后，任务管理器中会有两个nginx进程：

 ![1532579488518](https://cdn.tencentfs.clboy.cn/images/2021/20210911203305085.png)



#### Linux

安装：ubuntu：`sudo apt install nginx`

命令：

- `service nginx start` ：启动(装上后好像默认就是启动状态，可以先通过命令查看当前状态)
- `service nginx status`：查看状态
- `sudo nginx -s stop`：关闭
- `sudo nginx -s reload`：刷新配置
- `sudo nginx -t`：测试配置文件配置是否配置正确



> 配置文件路径

一般都是存放在`/etc/nginx`下面



> **配置同Windows**

因为在`/etc/nginx/nginx.conf`主配置文件中引入了当前文件夹下`conf.d`下的所有conf配置文件，我们可以新建一个`leyou-mall.conf`配置文件，内容如下：

```nginx
server {
        listen       80;
        server_name  manage.leyou.com;

        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location / {
            proxy_pass http://127.0.0.1:9001;
            proxy_connect_timeout 600;
            proxy_read_timeout 600;
        }
    }

server {
    listen       80;
    server_name  api.leyou.com;

    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
        proxy_pass http://127.0.0.1:20001;
        proxy_connect_timeout 600;
        proxy_read_timeout 600;
    }
}
```



### 测试

启动nginx(如果已经启动，则使用reload命令重新加载即可)，然后直接用域名访问后台管理系统：

现在实现了域名访问网站了，中间的流程是怎样的呢？

![1526189945180](https://cdn.tencentfs.clboy.cn/images/2021/20210911203231430.png)

1. 浏览器准备发起请求，访问http://mamage.leyou.com，但需要进行域名解析

2. 优先进行本地域名解析，因为我们修改了hosts，所以解析成功，得到地址：127.0.0.1

3. 请求被发往解析得到的ip，并且默认使用80端口：http://127.0.0.1:80

   本机的nginx一直监听80端口，因此捕获这个请求

4. nginx中配置了反向代理规则，将manage.leyou.com代理到127.0.0.1:9001，因此请求被转发

5. 后台系统的webpack server监听的端口是9001，得到请求并处理，完成后将响应返回到nginx

6. nginx将得到的结果返回到浏览器



## 实现商品分类查询

商城的核心自然是商品，而商品多了以后，肯定要进行分类，并且不同的商品会有不同的品牌信息，我们需要依次去完成：商品分类、品牌、商品的开发。

首先将sql文件导入数据库：[leyou.sql](/project/leyoumall/resources/leyou.sql ':ignore')

```sql
CREATE TABLE `tb_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '类目id',
  `name` varchar(20) NOT NULL COMMENT '类目名称',
  `parent_id` bigint(20) NOT NULL COMMENT '父类目id,顶级类目填0',
  `is_parent` tinyint(1) NOT NULL COMMENT '是否为父节点，0为否，1为是',
  `sort` int(4) NOT NULL COMMENT '排序指数，越小越靠前',
  PRIMARY KEY (`id`),
  KEY `key_parent_id` (`parent_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1424 DEFAULT CHARSET=utf8 COMMENT='商品类目表，类目和商品(spu)是一对多关系，类目与品牌是多对多关系';
```

因为商品分类会有层级关系，因此这里我们加入了`parent_id`字段，对本表中的其它分类进行自关联。



### 实现功能

在浏览器页面点击“分类管理”菜单：

![1575378985398](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318452.png)



根据这个路由路径到路由文件（src/route/index.js），可以定位到分类管理页面：

![1545220316442](https://cdn.tencentfs.clboy.cn/images/2021/20210911203317196.png)

由路由文件知，页面是src/pages/item/Category.vue

![1545220394460](https://cdn.tencentfs.clboy.cn/images/2021/20210911203317249.png)

商品分类使用了树状结构，而这种结构的组件vuetify并没有为我们提供，这里自定义了一个树状组件。不要求实现或者查询组件的实现，只要求可以参照文档使用该组件即可：

> [自定义组件参考](project/leyoumall/custom_component.md ':target=_blank')



### url异步请求

点击商品管理下的分类管理子菜单，在浏览器控制台可以看到：

![1530427294644](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257127.png)

页面中没有，只是发起了一条请求：http://api.leyou.com/api/item/category/list?pid=0 



大家可能会觉得很奇怪，我们明明是使用的相对路径：/item/category/list，讲道理发起的请求地址应该是：

http://manage.leyou.com/item/category/list

但实际却是：

http://api.leyou.com/api/item/category/list?pid=0 

这是因为，我们有一个全局的配置文件，对所有的请求路径进行了约定：

![1530427514123](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257179.png)

路径是`http://api.leyou.com`，并且默认加上了/api的前缀，这恰好与我们的网关设置匹配，我们只需要把地址改成网关的地址即可,因为我们使用了nginx反向代理，这里可以写域名。

接下来，我们要做的事情就是编写后台接口，返回对应的数据即可。



### 实体类

在`leyou-item-interface`中添加category实体类：

 ![1530444682670](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257230.png)

内容：

```java
@Table(name = "tb_category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Long parentId;
    /**
     * 注意isParent生成的getter和setter方法需要手动加上Is
     */
    private Boolean isParent;
    private Integer sort;
	// getter和setter略
}
```

需要注意的是，这里要用到通用mapper的注解，因此我们应该在`leyou-item-iterface`中添加通用mapper依赖，但是这里我们只是用来存放一些实体类，并不需要与数据库打交道，而通用mapper用的注解其实是jpa里面的，通用mapper依赖了jpa，所以我们只用在这里添加jpa的依赖即可

```xml
<dependency>
    <groupId>javax.persistence</groupId>
    <artifactId>persistence-api</artifactId>
    <version>1.0</version>
</dependency>
```



### controller

编写一个controller一般需要知道四个内容：

- 请求方式：决定我们用GetMapping还是PostMapping
- 请求路径：决定映射路径
- 请求参数：决定方法的参数
- 返回值结果：决定方法的返回值

在刚才页面发起的请求中，我们就能得到绝大多数信息：

![1530445885707](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257282.png)

- 请求方式：Get，查询肯定是get请求

- 请求路径：/api/item/category/list。其中/api是网关前缀，/item是网关的路由映射，真实的路径应该是/category/list

- 请求参数：pid=0，根据tree组件的说明，应该是父节点的id，第一次查询为0，那就是查询一级类目

- 返回结果：？？

  根据前面tree组件的用法我们知道，返回的应该是json数组：

  ```json
  [
      { 
          "id": 74,
          "name": "手机",
          "parentId": 0,
          "isParent": true,
          "sort": 2
  	},
       { 
          "id": 75,
          "name": "家用电器",
          "parentId": 0,
          "isParent": true,
          "sort": 3
  	}
  ]
  ```

  对应的java类型可以是List集合，里面的元素就是类目对象了。也就是`List<Category>`



添加Controller：

 ![1530450599897](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257437.png)

controller代码：

```java
@Controller
@GetMapping("category")
public class CategoryController {

    @Autowired
    private CategoryService CategoryService;
    
	@RequestMapping("/list")
    public ResponseEntity<List<Category>> queryCategoriesByPid(@RequestParam(name = "pid", defaultValue = "0") Long pid) {
        List<Category> categoryList = CategoryService.queryCategoriesByPid(pid);

        //没有数据返回404
        if (CollectionUtils.isEmpty(categoryList)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(categoryList);
    }
}
```



### service

```java
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public List<Category> queryCategoriesByPid(Long pid) {
        Category category = new Category();
        category.setParentId(pid);
        List<Category> categories = categoryMapper.select(category);
        return categories;
    }
}
```



### mapper

我们使用通用mapper来简化开发：

```java
public interface CategoryMapper extends Mapper<Category> {
}
```

要注意，我们并没有在mapper接口上声明@Mapper注解，那么mybatis如何才能找到接口呢？

我们在启动类上添加一个扫描包功能：

```java
@SpringBootApplication
@EnableDiscoveryClient
@MapperScan("com.leyou.item.mapper") // mapper接口的包扫描
public class LeyouItemServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeyouItemServiceApplication.class, args);
    }
}
```



### 启动并测试

!> 修改端口，因为我之前配置的是9001端口，这与后台系统端口冲突了，改为7001

然后启动eureka注册中心，网关和服务

![1575424767218](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318504.png)

我们先不经过网关，直接访问：http://localhost:7001/category/list

成功的情况下再访问网关测试：http://api.leyou.com/api/item/category/list



一切OK！

然后刷新后台管理页面查看：

![1575425011409](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318555.png)



发现报错了！

浏览器直接访问没事，但是这里却报错，什么原因？

这其实是浏览器的同源策略造成的跨域问题。



## 解决跨域问题

我们这里会采用cors的跨域方案。

在`leyou-gateway`中编写一个配置类，并且注册CorsFilter：

```java
package com.leyou.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class LeyouCorsConfiguration {

    @Bean
    public CorsFilter corsFilter() {
        //1.添加CORS配置信息
        CorsConfiguration config = new CorsConfiguration();
        //1) 允许的域,不要写*，否则cookie就无法使用了
        config.addAllowedOrigin("http://manage.leyou.com");
        //2) 是否发送Cookie信息
        config.setAllowCredentials(true);
        //3) 允许的请求方式
        config.addAllowedMethod("*");
        // 4）允许的头信息
        config.addAllowedHeader("*");

        //2.添加映射路径，我们拦截一切请求
        UrlBasedCorsConfigurationSource configSource = new UrlBasedCorsConfigurationSource();
        configSource.registerCorsConfiguration("/**", config);
        //3.返回新的CorsFilter.
        return new CorsFilter(configSource);
    }
}
```

结构：

 ![1530462650711](https://cdn.tencentfs.clboy.cn/images/2021/20210911203257748.png)



重启网关，然后刷新页面测试，访问是否正常正常：<http://manage.leyou.com/#/item/category>



## 品牌的查询

商品分类完成以后，自然轮到了品牌功能了。

先看看我们要实现的效果：

![1526021968036](https://cdn.tencentfs.clboy.cn/images/2021/20210911203220787.png)

点击“品牌管理”菜单：

路由路径：/item/brand

根据路由文件知，对应的页面是：src/pages/item/Brand.vue

页面会发送如下请求：

![1543066995215](https://cdn.tencentfs.clboy.cn/images/2021/20210911203315773.png)



### 数据库表

```mysql
CREATE TABLE `tb_brand` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '品牌id',
  `name` varchar(50) NOT NULL COMMENT '品牌名称',
  `image` varchar(200) DEFAULT '' COMMENT '品牌图片地址',
  `letter` char(1) DEFAULT '' COMMENT '品牌的首字母',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=325400 DEFAULT CHARSET=utf8 COMMENT='品牌表，一个品牌下有多个商品（spu），一对多关系';
```

简单的四个字段，不多解释。

这里需要注意的是，品牌和商品分类之间是多对多关系。因此我们有一张中间表，来维护两者间关系：

```mysql
CREATE TABLE `tb_category_brand` (
  `category_id` bigint(20) NOT NULL COMMENT '商品类目id',
  `brand_id` bigint(20) NOT NULL COMMENT '品牌id',
  PRIMARY KEY (`category_id`,`brand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='商品分类和品牌的中间表，两者是多对多关系';

```

但是，你可能会发现，这张表中并**没有设置外键约束**，似乎与数据库的设计范式不符。为什么这么做？

- 外键会严重影响数据库读写的效率
- 数据删除时会比较麻烦

在电商行业，性能是非常重要的。我们宁可在代码中通过逻辑来维护表关系，也不设置外键。



### 实体类

 ![1530541070271](https://cdn.tencentfs.clboy.cn/images/2021/20210911203258594.png)

```java
@Table(name = "tb_brand")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;// 品牌名称
    private String image;// 品牌图片
    private Character letter;
    // getter setter 略
}
```



### controller

编写controller先思考四个问题，参照前端页面的控制台

- 请求方式：查询，肯定是Get
- 请求路径：分页查询，/brand/page
- 请求参数：根据我们刚才编写的页面，有分页功能，有排序功能，有搜索过滤功能，因此至少要有5个参数：
  - page：当前页，int
  - rows：每页大小，int
  - sortBy：排序字段，String
  - desc：是否为降序，boolean
  - key：搜索关键词，String
- 响应结果：分页结果一般至少需要两个数据
  - total：总条数
  - items：当前页数据
  - totalPage：有些还需要总页数

这里我们封装一个类，来表示分页结果

由于这个分页类可能不止商品服务中需要其他服务可能也需要，所以我们给它放在`leyou-common`中

```java
package com.leyou.common.pojo;

import com.sun.istack.internal.NotNull;

import java.util.List;

public class PageResult<T> {
    /**
     * 总条数
     */
    private Long total;
    /**
     * 总页数
     */
    private Integer totalPage;
    /**
     * 当前页数据
     */
    private List<T> items;

    public PageResult(Long total, List<T> items) {
        this.total = total;
        this.items = items;
    }

    public PageResult(Long total, Integer totalPage, List<T> items) {
        this.total = total;
        this.totalPage = totalPage;
        this.items = items;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public Integer getTotalPage() {
        return totalPage;
    }

    public void setTotalPage(Integer totalPage) {
        this.totalPage = totalPage;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }
}
```



然后在leyou-item-service工程的pom.xml中引入leyou-common的依赖

```xml
<!--leyou-common-->
<dependency>
    <groupId>com.leyou.common</groupId>
    <artifactId>leyou-common</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

接下来，我们编写Controller

```java
@Controller
@RequestMapping("brand")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @GetMapping("/page")
    public ResponseEntity<PageResult<Brand>> queryBrandsByPage
            (@RequestParam(name = "key", required = false) String key,
             @RequestParam(name = "page", defaultValue = "1") Integer page,
             @RequestParam(name = "rows", defaultValue = "5") Integer rows,
             @RequestParam(name = "sortBy", required = false) String sortBy,
             @RequestParam(name = "desc", required = false) Boolean desc
            ) {

        PageResult<Brand> pageResult = brandService.queryBrandsByPage(key, page, rows, sortBy, desc);
        return ResponseEntity.ok(pageResult);

    }
}
```



### service

```java
@Service
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandMapper brandMapper;

    @Override
    public PageResult<Brand> queryBrandsByPage(String key, Integer page, Integer rows, String sortBy, Boolean desc) {

        Example example = new Example(Brand.class);
        Example.Criteria criteria = example.createCriteria();

        //根据名称和首字母模糊查询
        if (StringUtils.isNotBlank(key)) {
            criteria.andLike("name", "%" + key + "%").orEqualTo("letter", key);
        }

        //使用PageHelper插件进行分页
        PageHelper.startPage(page, rows);

        //添加排序条件，默认升序
        if (StringUtils.isNotBlank(sortBy)) {
            example.setOrderByClause(sortBy + " " + (desc ? "desc" : "asc"));
        }

        //执行查询
        List<Brand> brands = brandMapper.selectByExample(example);

        //获取分页信息
        PageInfo pageInfo = new PageInfo(brands);
        PageResult<Brand> pageResult = new PageResult<Brand>(pageInfo.getTotal(), brands);
        return pageResult;
    }
}
```



mapper

```java
public interface BrandMapper extends Mapper<Brand> {}
```



### 测试

通过浏览器访问试试：http://api.leyou.com/api/item/brand/page

成功后刷新后台页面



## 异步查询工具axios

异步查询数据，自然是通过ajax查询，大家首先想起的肯定是jQuery。但jQuery与MVVM的思想不吻合，而且ajax只是jQuery的一小部分。因此不可能为了发起ajax请求而去引用这么大的一个库。

### axios入门

Vue官方推荐的ajax请求框架叫做：axios，看下demo：

 ![1526033988251](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223030.png)

axios的Get请求语法：

```js
axios.get("/item/category/list?pid=0") // 请求路径和请求参数拼接
    .then(function(resp){
    	// 成功回调函数
	})
    .catch(function(){
    	// 失败回调函数
	})
// 参数较多时，可以通过params来传递参数
axios.get("/item/category/list", {
        params:{
            pid:0
        }
	})
    .then(function(resp){})// 成功时的回调
    .catch(function(error){})// 失败时的回调
```

axios的POST请求语法：

比如新增一个用户

```js
axios.post("/user",{
    	name:"Jack",
    	age:21
	})
    .then(function(resp){})
    .catch(function(error){})
```

注意，POST请求传参，不需要像GET请求那样定义一个对象，在对象的params参数中传参。post()方法的第二个参数对象，就是将来要传递的参数

PUT和DELETE请求与POST请求类似

### axios的全局配置

而在我们的项目中，已经引入了axios，并且进行了简单的封装，在src下的http.js中：

 ![1526034150067](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223317.png)

http.js中对axios进行了一些默认配置：

```js
import Vue from 'vue'
import axios from 'axios'
import config from './config'
// config中定义的基础路径是：http://api.leyou.com/api
axios.defaults.baseURL = config.api; // 设置axios的基础请求路径
axios.defaults.timeout = 2000; // 设置axios的请求时间

Vue.prototype.$http = axios;// 将axios赋值给Vue原型的$http属性，这样所有vue实例都可使用该对象
```

- http.js中导入了config的配置，还记得吗？

  ![1526041205846](https://cdn.tencentfs.clboy.cn/images/2021/20210911203223598.png)

- http.js对axios进行了全局配置：`baseURL=config.api`，即`http://api.leyou.com/api`。因此以后所有用axios发起的请求，都会以这个地址作为前缀。

- 通过`Vue.property.$http = axios`，将`axios`赋值给了 Vue原型中的`$http`。这样以后所有的Vue实例都可以访问到$http，也就是访问到了axios了。



### 项目中是如何使用的

我们在组件`Brand.vue`的getDataFromServer方法，通过$http发起get请求，测试查询品牌的接口，看是否能获取到数据：

![1543067111272](https://cdn.tencentfs.clboy.cn/images/2021/20210911203315825.png)

网络监视：

 ![1526048143014](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224185.png)

resp到底都有那些数据，查看控制台结果：

![1526048275064](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224461.png)

可以看到，在请求成功的返回结果response中，有一个data属性，里面就是真正的响应数据。

响应结果中与我们设计的一致，包含3个内容：

- total：总条数，目前是165
- items：当前页数据
- totalPage：总页数，我们没有返回



## 分页和过滤原理

### 分页

点击分页，会发起请求，通过浏览器工具查看，会发现pagination对象的属性一直在变化：

 ![1575448245000](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318709.gif)

我们可以利用Vue的监视功能：watch，当pagination发生改变时，会调用我们的回调函数，我们在回调函数中进行数据的查询！

具体实现：

![1526049643506](https://cdn.tencentfs.clboy.cn/images/2021/20210911203224734.png)

成功实现分页功能：

![1575448207000](https://cdn.tencentfs.clboy.cn/images/2021/20210911203318658.gif)



### 过滤

过滤字段对应的是search属性，我们只要监视这个属性即可:

 ![1526049939985](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225007.png)

查看网络请求：

 ![1526050032436](https://cdn.tencentfs.clboy.cn/images/2021/20210911203225263.png)

页面结果：

![1530555740595](https://cdn.tencentfs.clboy.cn/images/2021/20210911203259003.png)



