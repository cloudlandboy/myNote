# Beetl快速上手

## 官网文档

> http://ibeetl.com/guide/#/

## GroupTemplate

> Beetl的核心是GroupTemplate，是一个重量级对象，实际使用的时候建议使用单模式创建
>
> 创建GroupTemplate需要俩个参数：(模板资源加载器,配置类)
>
> 模板资源加载器Beetl内置了6种，分别是

- `StringTemplateResourceLoader`：字符串模板加载器，用于加载字符串模板
- `FileResourceLoader`：文件模板加载器，需要一个根目录作为参数构造，传入getTemplate方法的String是模板文件相对于Root目录的相对路径
- `ClasspathResourceLoader`：文件模板加载器，模板文件位于Classpath里
- `WebAppResourceLoader`：用于webapp集成，假定模板根目录就是WebRoot目录，参考web集成章
- `MapResourceLoader` : 可以动态存入模板
- `CompositeResourceLoader` ：混合使用多种加载方式



### stringTemplateResourceLoader

```java
@Test
public void stringTemplateResourceLoader() throws IOException {
    GroupTemplate groupTemplate = new GroupTemplate(
            new StringTemplateResourceLoader(),
            Configuration.defaultConfiguration()
    );

    //获取模板
    Template template = groupTemplate.getTemplate("hello,${name}");
    template.binding("name", "clboy");

    //渲染结果
    String render = template.render();
    System.out.println(render);

}
```

### fileResourceLoader

```java
@Test
public void fileResourceLoader() throws IOException {

    String userDir = System.getProperty("user.home");

    //桌面下的template文件夹
    GroupTemplate groupTemplate = new GroupTemplate(
            new FileResourceLoader(userDir + "/Desktop/template"),
            Configuration.defaultConfiguration()
    );

    //获取模板
    Template template = groupTemplate.getTemplate("hello.html");
    template.binding("title", "测试FileResourceLoader");
    template.binding("name", "clboy");

    //渲染结果
    String render = template.render();
    System.out.println(render);

}
```

### ClasspathResourceLoader

```java
@Test
public void classpathResourceLoader() throws IOException {

    //classpath下的template文件夹
    GroupTemplate groupTemplate = new GroupTemplate(
            new ClasspathResourceLoader("template"),
            Configuration.defaultConfiguration()
    );

    //获取模板
    Template template = groupTemplate.getTemplate("hello.html");
    template.binding("title", "测试ClasspathResourceLoader");
    template.binding("name", "clboy");

    //渲染结果
    String render = template.render();
    System.out.println(render);

}
```



## 代码体

> 代码体 以`<%` 开头， `%>` 结尾
>
> 代码体中的每段代码后面要加上`;`，不然会报错



## 临时变量

> 声明变量的关键字是`var` 
>
> 语法类似js，字符串可以使用`单引号`
>
> 这种在模板文件中声明的变量 称之为临时变量

```
<%
    /*多行注释*/
   //单行注释
	
    var title= "测试定界符与占位符号";
    var name="clboy";
    var birth=1997;
%>
```

## 全局变量

> 就是从java代码中传过来的，在模板的代码块中可以直接使用全局变量

```java
//全局变量定义
template.binding("now", LocalDate.now().getYear());
```

```
<%
    var birth=1997;
    //在模板里使用全局变量 now
    var age=now-birth+1;
%>
```

## 共享变量

> 共享变量指在所有模板中都可以引用的变量，可通过`groupTemplate.setSharedVars(Map<String, Object> sharedVars)`传入变量

```java
//设置共享变量
HashMap<String, Object> shareVars = new HashMap<>();
HashMap<String, Object> global = new HashMap<>();
global.put("k1", "value-1");
global.put("k2", "value-2");
shareVars.put("global", global);
groupTemplate.setSharedVars(shareVars);
```

## 局部代码块

> 类似java中代码块是`{代码块内容}`
>
> Beetl中也是`<%{代码块内容}%>`，只要是符合以`{`开头，`}`结尾
>
> 同样，代码块中声明的变量只在`{}`中可见

```
<%{
    var now="2019-06-22";
    println('<p>'+now+'</p>');
}%>
```



## 模板变量

> 将模板中任何一段的输出赋值到该变量，并允许稍后在其他地方使用.
>
> 由局部代码块演变：`<%var 变量名={>%`普通内容`<%};>%`，最后`;`不可以省略

```
<%var template={%>
    <ul>
        <li>菜单1</li>
        <li>菜单2</li>
        <li>菜单3</li>
    </ul>
<%};%>
<div>
    ${template}
</div>
<p>
    ${template}
</p>
```

渲染结果：

```html
<div>
    <ul>
        <li>菜单1</li>
        <li>菜单2</li>
        <li>菜单3</li>
	</ul>
</div>
<p>
    <ul>
        <li>菜单1</li>
        <li>菜单2</li>
        <li>菜单3</li>
	</ul>
</p>
```

```
<%
var type="菜单";
var template={%>
<ul>
    <li>${type} 1</li>
    <li>${type} 2</li>
    <li>${type} 3</li>
</ul>
<%};%>
<div>
    ${template}
</div>
<p>
    ${template}
</p>
```

渲染结果：

```html
<div>
    <ul>
        <li>菜单 1</li>
        <li>菜单 2</li>
        <li>菜单 3</li>
	</ul>
</div>
<p>
    <ul>
        <li>菜单 1</li>
        <li>菜单 2</li>
        <li>菜单 3</li>
	</ul>
</p>
```



?> 更复杂的：

```
<%
var typeA="员工";
var templateA={
    var date="2020-01-01";
    println("<div>\n\t"+date);
%>
    <p>${typeA} 1</p>
    <p>${typeA} 2</p>
    <p>${typeA} 3</p>
<%println("</div>");};%>

${templateA}
${templateA}
```

渲染结果：

```html
<div>
	2020-01-01
    <p>员工 1</p>
    <p>员工 2</p>
    <p>员工 3</p>
</div>

<div>
	2020-01-01
    <p>员工 1</p>
    <p>员工 2</p>
    <p>员工 3</p>
</div>
```



## 模板中获取变量

> `${变量名}`

### pojo对象类型

> `${变量名.属性名}`
>
> 获取的属性要有与之对应的get方法

### 数组或List集合类型

> `${变量名[下标]}`

```
水果0：${fruit[0]}
水果1：${fruit[1]}
水果2：${fruit[2]}
```

### Map类型

> `${变量名["key"]}`

```
page：${params["page"]}
size：${params["size"]}
```



### 虚拟属性

> 针对数组以及集合类型有个 size 属性
>
> `${变量名.~虚拟属性名}`

```
fruit的长度：${fruit.~size}
params的size：${fruit.~size}
```



## 函数调用

### Beetl内置常用函数

#### date

> 返回一个java.util.Date类型的变量 date(指定日期,format格式)，date(毫秒数),可以调用Date类的getXXX方法，date.xxx

```
<div>date()：${date()}</div>
```

#### print|println

```
--- print 打印一个对象
<%
	var date=date();
    print(date);
%>

--- println 打印一个对象以及回车换行符号，如果仅仅打印一个换行符，则直接调用println() 即可
<%
    println("打印一些东西");
%>
```

#### nvl

```
--- nvl 函数nvl，如果对象为null，则返回第二个参数，否则，返回自己 nvl(user,"不存在")
<%
    var aObj=nvl(nullObj,"nullObj是null，我来顶替");
    println(aObj);
%>
```

#### isEmpty|isNotEmpty

```
--- isEmpty 判断变量或者表达式是否为空.变量不存在，变量为null，变量是空字符串，变量是空集合，变量是空数组，此函数都将返回true
nullObj：${isEmpty(nullObj)}

--- isNotEmpty 同上，判断对象是否不为空
nullObj：${isNotEmpty(nullObj)}
```

#### has

```
--- has 判断是否存在此"全局变量" has(变量名)
<%
	// 这里声明的age是局部变量
    var age=35;
    println("age："+has(age));
%>
```

#### hasAttribute

```
--- hasAttribute 测试目标对象是否有此属性，hasAttribute(obj,"field")
user有name属性吗：${hasAttribute(user,"name")}
user有wife属性吗：${hasAttribute(user,"wife")}
```

#### assert

```
--- assert 如果表达式为false，则抛出异常
${assert(user.age==null)}
```

#### trim

```
--- trim 截取数字或者格式化日期，返回字符,如trim(12.456,2)返回"12.45",trim(date,'yyyy')返回"2017"

<%
    var pi=3.1415926;
%>

${pi}保留4位小数：${trim(pi,4)}
今天是：${trim(date(),"MM月dd号")}
```

#### decode

```
--- decode 一个简化的if else 结构 decode(obj,a,等于a时输出,b,等于b时输出,...其他结果)
<%
    var dayOfWeek=date().day;
%>
${decode(dayOfWeek,1,"周一",2,"周二",3,"周三",4,"周四",5,"周五",6,"周六",7,"周日","??你确定有星期"+dayOfWeek)}
```

#### debug

```
--- debug 在控制台输出debug指定的对象,并输出调用debug的行数@文件名
${debug(name)}
```

#### parseInt|parseLong|parseDouble

```
--- parseInt 将数字或者字符解析为整形 如 parseInt("123");
<%
    var numStr1="66";
    var numStr2="88.88";
%>
${numStr1}：${parseInt(numStr1)}
${numStr2}：${parseInt(numStr2)}

--- parseLong
${numStr1}：${parseLong(numStr1)}
${numStr2}：${parseLong(numStr2)}

--- parseDouble
${numStr1}：${parseDouble(numStr1)}
${numStr2}：${parseDouble(numStr2)}
```

#### range

```
--- range 接收三个参数，初始值，结束值，还有步增（可以不需要，则默认为1），返回一个Iterator，常用于循环中
<%
    var iterator=range(8,13);
    for(i in iterator){
        print(i+",");
    }
%>
```

#### json

```
--- json,将对象转成json字符串,需要项目中引入jackson或者fastjson库
${json(zhangSan)}
```

#### type.new

> 如果配置了IMPORT_PACKAGE，则可以省略包名，type.new("User")

```
--- type.new 创建一个对象实例，如 var user = type.new("com.xx.User"); 
<%
    var liSi=type.new("cn.clboy.demo.template.beetl.basic.pojo.User");
    liSi.name="李四";
    liSi.age=28;
%>
${json(liSi)}
```

#### type.name

```
--- type.name 返回一个实例所属的类的名字，var userClassName = type.name(user),返回"User"
${type.name(zhangSan)}
```

#### global

```
--- global 返回一个全局变量值，参数是一个字符串，如 var user = global("变量名");
<%
    var name="局部变量";
    println(name);
    println(global("name"));
%>
```

### 内置web开发的函数

#### pageCtx

> 仅仅在web开发中，设置一个变量，然后可以在页面渲染过程中，调用此api获取，如`pageCtx("title","用户添加页面")`
>
> 在其后任何地方，可以`pageCtx("title") `获取该变量

#### cookie

> 返回指定的cookie对象 ，如`var userCook = cookie("user"),allCookies = cookie();`



## 循环语句

### for(exp;exp;exp)

> 普通for循环

```
<%
    var fruits=["苹果","哈密瓜","葡萄","香蕉","火龙果"];

    //对应map类型
    var params={page:1,size:20};

    //空集合
    var emptyList=[];
%>

-----------------普通for循环
<%
    for(var i=0;i<10;i++){
         println("<p>"+fruits[i]+"</p>");
    }
%>
```

#### 遍历输出不用 println

> 将代码块和普通内容结合
>
> 下面这个等于说将`%>`content`<%`替换成了`println("content")`

```
<%for(var i=0;i<fruits.~size;i++){%>
    <p>${fruits[i]}<p>
<%}%>
```



### for-in

#### 遍历数组|集合

```
-----------------遍历集合/数组
<%
    for(fruit in fruits){
         println(fruit);
    }
%>
```

#### 遍历map

```
-----------------遍历map
<%
    for(entry in params){
         println(entry.key+" : "+entry.value);
    }
%>
```

### elsefor

> 没有进入for循环体时执行的代码块，如，数组|集合为空

```
<%
	var emptyList=[];
    for(v in emptyList){
         println("v");
    }elsefor{
        println("emptyList是一个空的集合");
    }
%>
```

!> 下面这种情况不算，elsefor不会执行

```
<%
    for(var i=1;i<1;i++){
        println(i);
    }elsefor{
        println("未执行循环体");
    }
%>
```

### while

```
<%
    var wi=1;
    while(wi<5){
%>
while --->> ${wi}
<% wi++; }%>
```

```
while --->> 1
while --->> 2
while --->> 3
while --->> 4
```



## 条件判断

### if else

> 同js写法

```
<%
    if(dayOfWeek<6){
        println("工作日，老老实实上班吧！");
    }else if(dayOfWeek==6){
        println("周六，去逛街吧！");
    }else if(dayOfWeek==7){
        println("周日，躺平");
    }else{
        println("你创造的 星期"+dayOfWeek+"吗？");
    }
%>
```

### switch-case

> 同js写法

```
<%
    switch(dayOfWeek){
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            println("工作日，老老实实上班吧！");
            break;
        case 6:
            println("周六，逛街");
            break;
        case 7:
            println("周日，躺平");
            break;
        default:
            println("你创造的 星期"+dayOfWeek+"吗？");
    }
%>
```



### select-case

> select-case 是switch case的增强版，允许case 里有逻辑表达式
>
> 也不需要每个case都break一下，默认遇到符合条件的case，执行完后就退出了

```
<%
    select(dayOfWeek){
        case 1,2,3,4,5:{
            println("工作日，老老实实上班吧！");
        }
        case 6:
            println("周六，去逛街吧！");
        case 7:
            println("周日，躺平！");
        default:
            println("你创造的 星期"+dayOfWeek+"吗？");
    }
%>
```

## 安全输出!

> 模板中还有俩种情况会导致模板输出异常
>
> 1. 模板变量并不存在
> 2. 模板变量为null，但输出的是此变量的一个属性
>
> 可以在变量引用后加上！以提醒beetl这是一个安全输出的变量
>
> `${变量名!}` 
>
> `${a.b.c!}`：不管a,b,c哪个为null都不会抛出异常
>
> `${变量名!默认值}` ：`${user.age!23}`，`${user.name!"张三"}`，${user.wife!zhangsan.wife}

!> `${!(变量名.属性)}`，beetl在调用与属性名对应的get方法时，如果发生异常，beetl将会忽略此异常，继续渲染（这种情况很少发生）

## 格式化

> 这些格式化的实现类都是可以在配置文件中修改的

### 日期

```
${date(),dateFormat="yyyy-MM-dd"}.
```

使用默认格式化格式：`19-6-6 下午1:40`

```
${date(),dateFormat}
```

简写

```
${date(),"yyyy-MM-dd HH:mm:ss"}
```

### 数字

> 对应java中的NumberFormat

```
${38005413.1415926,numberFormat="##.###"}
${38005413.1415926,"##.##"}
${38005413.1415926,"##,###.##"}
${3.1415,"00,000.0000000"}
```

输出：

```
38005413.142
38005413.14
38,005,413.14
00,003.1415000
```

- `#`：整数部分只是表示如何分割，写几个都不影响整数部分的值，小数部分表示保留几位（默认四舍五入）
- `0`：表示最少要有几位，整数部分不足，左边补0。小数部分不足，右边补0

## 标签函数

> 所谓标签函数，即允许处理模板文件里的一块内容

### Beetl内置标签函数

#### layout

> 有点类似于vue的模板
>
> 模板路径：相对于模板根目录下的路径

```
<%layout("模板路径",map类型参数){%>
	其他的普通内容
<%}%>
```

```
<%layout("/common/header.html",{companyName:"xxx有限公司"}){%>
	<p>${userName!'未登录'}</p>
<%}%>
<main>
	.....
</main>
```

**header.html**

```html
<header>
    <ul class="nav">
        <li class="nav-item">
            <a class="nav-link" href="#">${companyName}</a>
        </li>
        <%for(var i=1;i<5;i++){%>
            <li class="nav-item">
                <a class="nav-link" href="#">菜单${i}</a>
            </li>
        <%}%>
        <li class="nav-item">
            <a class="nav-link" href="#">${layoutContent}</a>
        </li>
    </ul>
</header>
```

结果：

```html
<header>
    <ul class="nav">
        <li class="nav-item">
            <a class="nav-link" href="#">xxx有限公司</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">菜单1</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">菜单2</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">菜单3</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">菜单4</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">
                <p>未登录</p>
            </a>
        </li>
    </ul>
</header>
<main>
    ......
</main>
```



##### layoutContent

> 获取layout标签体的普通内容

#### include

> 引入另外一个模板文件，与layout不同的是，include标签忽略标签体的普通内容

```
<%layout("/common/header.html",{companyName:"xxx有限公司"}){%>
	<p>${userName!'未登录'}</p>
<%}%>
<main>
	.....
</main>
<%include("common/footer.html",{companyName:"xxx有限公司"}){}%>
```

## HTML标签

> Beetl 也支持HTML tag形式的标签,标签默认以`#`开头
>
> Beetl 好像没有内置的HTML标签，需要自己去定义

```html
<#标签名 属性名="属性值" 属性名="${变量名}"></#标签名>
```

### 自定义HTML标签

> Beetl默认会寻找`模板根路径/htmltag/标签名.tag`
>
> `htmltag`：自定义HTML标签存放目录
>
> `.tag`：自定义HTML标签文件的后缀
>
> 这些都是可以在配置文件中修改的，包括标签默认以`#`开头

1. 首先我们在`模板根路径/htmltag/`创建一个`cart.tag`文件

   ```html
   <div class="card text-center" style="padding: 20px">
       <img src="${headImgUrl}" class="card-img-top" alt="${headImgUrl}">
       <div class="card-body">
           ${tagBody}
           <button type="button" class="btn btn-danger">点击关注</button>
       </div>
   </div>
   ```

2. 在其他地方引用这个标签

   ```html
   <%layout("/common/header.html",{companyName:"xxx有限公司"}){%>
   	<p>${userName!'未登录'}</p>
   <%}%>
   <main>
       <%for(user in users){%>
           <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
           	<!--引用HTML标签-->
               <#card head-img-url="${user.imgUrl}">
                   <p>姓名：${user.name}，年龄：${user.age}</p>
               </#card>
           </div>
       <%}%>
   </main>
   <%include("common/footer.html",{companyName:"xxx有限公司"}){}%>
   ```



**结果：**

```html
......
<main>
    <div class="card text-center" style="padding: 20px">
        <img src="http://www.baidu.com/img/4158748da.png" class="card-img-top" alt="http://www.baidu.com/img/4158748da.png">
        <div class="card-body">
            <p>姓名：王二，年龄：32</p>
            <button type="button" class="btn btn-danger">点击关注</button>
        </div>
    </div>
</main>
......
```

#### tagBody

> 获取自定义HTML标签体的普通内容



## Web环境提供的全局变量

- `ctxPath` ：Web应用ContextPath

- `request中的所有attribute` ：在模板中可以直接通过attribute name 来引用，如在controller层 request.setAttribute("user",user),则在模板中可以直接用${user.name} 
- `request`：标准的HTTPServletRequest,可以在模板里引用request属性（getter），如`${request.requestURL}`
- `session` ：提供了session会话，模板通过`session["name"]`,或者`session.name` 引用session里的变量
- `parameter` ：读取用户提交的参数。如`${parameter.userId}` (仅仅2.2.7以上版本支持)
- `servlet`： 是WebVariable的实例，包含了HTTPSession,HTTPServletRequest,HTTPServletResponse.三个属性，模板中可以通过request,response,session 来引用，如 `${servlet.request.requestURL}`;
- 所有的GroupTemplate的共享变量

## 集成Spring Boot

> 模板根目录是Spring Boot默认的`templates`目录
>
> beetl配置文件：`beetl.properties`

```xml
<dependency>
    <groupId>com.ibeetl</groupId>
    <artifactId>beetl-framework-starter</artifactId>
    <version>版本号</version>
</dependency>
```

**application.yaml**

```yaml
beetl:
  suffix: btl
```

**beetl.properties**

```properties
#自定义标签文件Root目录和后缀
RESOURCE.tagRoot = beetl_tags
RESOURCE.tagSuffix = btag
```

!> 这里配置的`suffix` 只是告诉beetl可以处理的后缀，在controller中返回的视图路径中还是要带上`.btl`

```java
@GetMapping("/users")
public String users(Model model) {
    ArrayList<User> users = new ArrayList<>();
    model.addAttribute("users", userService.getAllUser());
    return "userList.btl";
}
```