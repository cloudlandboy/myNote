# 模板引擎

常见的模板引擎有`JSP`、`Velocity`、`Freemarker`、`Thymeleaf`

SpringBoot推荐使用Thymeleaf；

## 引入thymeleaf

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
```



**如需切换thymeleaf版本：**

```xml
<properties>

		<thymeleaf.version>X.X.X.RELEASE</thymeleaf.version>

		<!-- 布局功能的支持程序  thymeleaf3主程序  layout2以上版本 -->
		<!-- thymeleaf2   layout1-->
		<thymeleaf-layout-dialect.version>2.2.2</thymeleaf-layout-dialect.version>

  </properties>
```



## Thymeleaf使用

```java
package org.springframework.boot.autoconfigure.thymeleaf;

......

@ConfigurationProperties(
    prefix = "spring.thymeleaf"
)
public class ThymeleafProperties {
    private static final Charset DEFAULT_ENCODING;
    public static final String DEFAULT_PREFIX = "classpath:/templates/";
    public static final String DEFAULT_SUFFIX = ".html";
    private boolean checkTemplate = true;
    private boolean checkTemplateLocation = true;
    private String prefix = "classpath:/templates/";
    private String suffix = ".html";
    private String mode = "HTML";
```

默认只要我们把HTML页面放在`classpath:/templates/`，thymeleaf就能自动渲染；

1. 创建模板文件`t1.html`，并导入thymeleaf的名称空间

   ```html
   <html lang="en" xmlns:th="http://www.thymeleaf.org">
   ```

   ```html
   <!DOCTYPE html>
   <html lang="en" xmlns:th="http://www.thymeleaf.org">
   <head>
       <meta charset="UTF-8">
       <title>Title</title>
   </head>
   <body>
   
   </body>
   </html>
   ```

2. 使用模板

   ```html
   <!DOCTYPE html>
   <html lang="en" xmlns:th="http://www.thymeleaf.org">
   <head>
       <meta charset="UTF-8">
       <title>[[${title}]]</title>
   </head>
   <body>
   <h1 th:text="${title}"></h1>
   <div th:text="${info}">这里的文本之后将会被覆盖</div>
   </body>
   </html>
   ```

3. 在controller中准备数据

   ```java
   @Controller
   public class HelloT {
   
       @RequestMapping("/ht")
       public String ht(Model model) {
           model.addAttribute("title","hello Thymeleaf")
                .addAttribute("info","this is first thymeleaf test");
           return "t1";
       }
   }
   ```

   

## 语法规则

`th:text` --> 改变当前元素里面的文本内容；

`th：任意html属性 ` --> 来替换原生属性的值

![thymeleaf](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/2018-02-04_123955.png)

更多配置参考官方文档：<https://www.thymeleaf.org/documentation.html>

中文参考书册：https://www.lanzous.com/i7dzr2j