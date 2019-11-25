# Jsp(JavaServer Pages)

## jsp脚本

`<%!java代码%>`：会被翻译成servlet的成员的内容

```jsp
//下面的代码在一个标签中声明了一个变量和一个方法：
<%!
    String color[] = {"red", "green", "blue"};
    String getColor(int i){
        return color[i];
    }
%>
```

`<%java代码%>`：内部的java代码翻译到service方法的内部

```jsp
<%! int count = 0; %>
<% count++; %>
```

`<%=java变量或表达式>`：会被翻译成service方法内部out.print()

```jsp
<%= count%>
```



## jsp注释

1. html注释：`<!--注释内容-->` ---可见范围 jsp源码、翻译后的servlet、页面												显示html源码
2. java注释：`//单行注释  /*多行注释*/` ---可见范围 jsp源码 翻译后的servlet
3. jsp注释：`<%--注释内容--%>` --- 可见范围 jsp源码可见



## jsp运行原理

jsp本质就是一个servlet

当第一次访问jsp页面时，会向一个servlet容器（tomcat等）发出请求，servlet容器先要把 jsp页面转化为servlet代码（.java），再编译成.class 文件 再进行调用。当再次访问jsp页面时 跳过翻译和编译的过程 直接调用 流程：

第一次访问流程：

1. 客户端发出请求hello.jsp
2. web容器将jsp转化为servlet代码（hello_jsp.java）

          3、web容器将转化为servlet代码编译（hello_jsp.class）

          4、web容器加载编译后的代码并执行

          5、将执行结果响应给客户端



## jsp指令

### page指令

```
<%@ page 属性名1= "属性值1" 属性名2= "属性值2" ...%>
```

| **属性**           | **描述**                                            |
| ------------------ | --------------------------------------------------- |
| buffer             | 指定out对象使用缓冲区的大小                         |
| autoFlush          | 控制out对象的 缓存区                                |
| contentType        | 指定当前JSP页面的MIME类型和字符编码                 |
| errorPage          | 指定当JSP页面发生异常时需要转向的错误处理页面       |
| isErrorPage        | 指定当前页面是否可以作为另一个JSP页面的错误处理页面 |
| extends            | 指定servlet从哪一个类继承                           |
| import             | 导入要使用的Java类                                  |
| info               | 定义JSP页面的描述信息                               |
| isThreadSafe       | 指定对JSP页面的访问是否为线程安全                   |
| language           | 定义JSP页面所用的脚本语言，默认是Java               |
| session            | 指定JSP页面是否使用session                          |
| isELIgnored        | 指定是否执行EL表达式                                |
| isScriptingEnabled | 确定脚本元素能否被使用                              |

### include指令

页面包含（静态包含）指令，可以将一个jsp页面包含到另一个jsp页面中

```
<%@ include file="被包含文件的 相对 url 地址"%>
```



### taglib指令

在jsp页面中引入标签库（jstl标签库、struts2标签库）

```
<%@ taglib uri="标签库地址" prefix="前缀"%>
```



## JSP 动作元素（标签）



### jsp:include

页面包含（动态包含）

```
<jsp:include page="被包含的页面"/>
```

&lt;jsp:useBean&gt;

```
<jsp:forward page="要转发的资源" />
```

### jsp:forward

把请求转到另外的页面

```
<jsp:forward page="相对 URL 地址" />
```

### jsp:useBean

加载一个将在JSP页面中使用的JavaBean。

```
<jsp:useBean id="name" class="package.class" />
```

### jsp:setProperty

用来设置已经实例化的Bean对象的属性，有两种用法。

1. 你可以在jsp:useBean元素的外面（后面）使用
2. 把jsp:setProperty放入jsp:useBean元素的内部

```
<jsp:useBean id="myName" [type="指定将引用该对象变量的类型"] />
...
<jsp:setProperty name="myName" property="属性名" [value="指定值" param="请求参数作为Bean属性的值"] />

//或者

<jsp:useBean id="myName" ... >
...
   <jsp:setProperty name="myName" property="属性名" [value="指定值" param="请求参数作为Bean属性的值"] />
</jsp:useBean>
```

### jsp:getProperty

获取指定Bean属性的值，转换成字符串，然后输出。

```
<jsp:useBean id="myName" ... />
...
<jsp:getProperty name="myName" property="属性名" />
```



## jsp内置/隐式对象（9个）

| **名称**    | **类型**                               | **描述**                                    |
| ----------- | -------------------------------------- | ------------------------------------------- |
| out         | javax.servlet.jsp.JspWriter            | 用于页面输出                                |
| request     | javax.servlet.http.HttpServletRequest  | 得到用户请求信息，                          |
| response    | javax.servlet.http.HttpServletResponse | 服务器向客户端的回应信息                    |
| config      | javax.servlet.ServletConfig            | 服务器配置，可以取得初始化参数              |
| session     | javax.servlet.http.HttpSession         | 用来保存用户的信息                          |
| application | javax.servlet.ServletContext           | 所有用户的共享信息                          |
| page        | java.lang.Object                       | 指当前页面转换后的Servlet类的实例           |
| pageContext | javax.servlet.jsp.PageContext          | JSP的页面容器                               |
| exception   | java.lang.Throwable                    | 表示JSP页面所发生的异常，在错误页中才起作用 |

