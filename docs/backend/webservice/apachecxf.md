# apache CXF入门

maven依赖：

```xml
    <dependency>
      <groupId>org.apache.cxf</groupId>
      <artifactId>cxf-rt-frontend-jaxws</artifactId>
      <version>3.0.1</version>
    </dependency>
    <dependency>
      <groupId>org.apache.cxf</groupId>
      <artifactId>cxf-rt-transports-http</artifactId>
      <version>3.0.1</version>
    </dependency>
```



## 整合Spring开发

第一步：创建动态web项目

第二步：导入CXF相关jar包

第三步：在web.xml中配置CXF框架提供的一个Servlet

```xml
	<servlet>
		<servlet-name>CXFServlet</servlet-name>
		<servlet-class>org.apache.cxf.transport.servlet.CXFServlet</servlet-class>
	</servlet>
	<servlet-mapping>
		<servlet-name>CXFServlet</servlet-name>
		<url-pattern>/service/*</url-pattern>
	</servlet-mapping>
```

案例：

[WebService入门](https://gitee.com/syl_zzrfdsn/HelloWebService)