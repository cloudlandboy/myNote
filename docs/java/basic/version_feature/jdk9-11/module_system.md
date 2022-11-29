# 模块系统 <sup class="version-number">jdk9</sup>

> Java 9 在包之上引入了一个新的抽象级别，正式称为 Java 平台模块系统 (JPMS)，或简称为“模块”。

!> 出于java向下兼容的特性，我们可以直接使用 `jdk11` (长期支持版本)进行学习



[参考文档1](https://dev.java/learn/modules/)

[参考文档2](https://www.baeldung.com/java-9-modularity)



## 什么是模块

> 模块就是代码和数据的封装体。模块的代码被组织成多个包，每个包中包含Java类和接口；模块的数据则包括资源文件和其他静态信息
>
> 换句话说，就是在java包基础之上的封装，使我们的代码更加安全、可重用



### 包

> 模块中的包与我们之前使用的包一模一样，没有任何改变
>
> 模块化之后的包除了组织我们的代码外，还用于确定哪些代码可以在模块之外公开访问



### 资源

> 以前，我们将所有资源放入项目的根级别，并手动管理哪些资源属于应用程序的不同部分。
>
> 使用模块，我们可以将所需的图像和 XML等文件与需要它的模块一起发送，从而使我们的项目更易于管理。
>
> 使用maven创建过父子工程的应该不陌生



### 模块描述符

> 当我们创建一个模块时，我们包含一个描述符文件 `module-info.java`，它定义了模块的信息
>
> 熟悉npm的应该熟悉 `package.json` 文件，这个就和它有点类似

- `名称` ：模块的名称（与包名类似，允许使用英文逗号 `.`，不允许使用破折号 `-`）
- `依赖` ：模块所依赖的其他模块的列表
- `公开的包列表` ：提供给其他模块访问的所有包的列表 **（默认情况下所有包都是模块私有的）**
- `提供的服务` ：提供给其他模块可以使用的服务实现
- `反射权限` ：明确允许其他类使用反射来访问包的私有成员 **（默认情况下是不允许其他模块访问的，不能对从另一个模块导入的类使用反射）**



### 模块类型

- `系统模块` ：使用 `list-modules` 命令时列出的模块。它们包括 Java SE 和 JDK 模块

  ```shell
  java --list-modules
  ```

- `应用程序模块` ：这些模块是我们在决定使用模块时通常想要构建的。它们包含在组装 JAR中的编译后的 `module-info.class` 文件中命名和定义
- `自动装置模块` ：我们可以通过将现有的 JAR 文件添加到模块路径来包含非官方模块。模块的名称将派生自 JAR 的名称。自动装置模块将对路径加载的每个其他模块具有完全读取权限
- `未命名模块` ：当类或 JAR 加载到类路径而不是模块路径时，它会自动添加到未命名模块。它是一个包罗万象的模块，可保持与以前编写的 Java 代码的向后兼容性

### 模块分发

> 可以将模块打包成JAR 文件分发，这与任何其他 Java 项目相同，因此也就不足为奇了
>
> 值得注意的是：**每个 JAR 文件只能有一个模块** 。我们需要确保将项目中的每个模块捆绑为一个单独的 jar



## 模块声明

### module-info.java文件

> 要构建模块，我们需要在包的根目录下放置一个名为 module-info.java的特殊文件
>
> 该文件称为模块描述符，包含构建和使用我们的新模块所需的所有数据

```java
module 模块名 {
    //可选指令
}
```



创建项目 `java11` ，目录结构如下：

```java11
java11                                    
├─ lib                                    
│  └─ lombok-1.18.22.jar                  
└─ module-provider                        
   └─ src                                 
      ├─ cn.clboy.jdk.module.provider             
      │  ├─ inner             
      │  │  └─ Personal.java  
      │  └─ Common.java       
      └─ module-info.java                 

```
`cn.clboy.jdk.module.provider.inner.Personal`

```java
package cn.clboy.jdk.module.provider.inner;

import lombok.Data;

@Data
public class Personal {
    private String name;
    private Integer age;
}
```

`cn.clboy.jdk.module.provider.Common`

```java
package cn.clboy.jdk.module.provider;

import cn.clboy.jdk.module.provider.inner.Personal;

public class Common {
    public static void printInfo(String name, Integer age) {
        Personal personal = new Personal();
        personal.setName(name);
        personal.setAge(age);
        System.out.println(personal);
    }
}
```



### requires指令

> 这个模块指令用来声明模块所依赖的其他模块
>
> 使用这个指令时，我们的模块可以访问从依赖项导出的所有公共类型

上面 `Personal` 类的源码中使用了 `lombok` 的注解，现在即使把lib目录下的jar包添加到项目库，在该项目下也无法引用到。在 idea 中会给出错误提示

![image-20221019145206868](https://cdn.tencentfs.clboy.cn/images/2022/20221019152853872.png)



```java
module cn.clboy.jdk.module.provider {
    requires lombok;
}
```

现在，  我们的模块 `cn.clboy.jdk.module.provider`  对 `lombok` 模块有运行时和编译时依赖



### requires static指令

> 通过使用 requires static 指令，可以创建了一个仅编译时必须但运行时可选的依赖项

```java
module cn.clboy.jdk.module.provider {
    requires static lombok;
}
```

比如 模块 *A* `requires static` 模块 *B* ，模块系统在编译和运行时表现不同：

- 在编译时：*B* 必须存在（否则会出现错误）并且 *B* 可以被 *A* 读取。
- 在运行时： *B* 可以不存在，这既不会导致错误也不会导致警告。如果它存在，它可以被 *A* 读取。



### requires transitive指令

> 依赖传递
>
> 该指令来强制任何下游消费者也读取我们所需的依赖项

```java
module cn.clboy.jdk.module.provider {
     requires transitive lombok;
}
```

这样如果其他模块依赖了我们的模块，如果他也要使用到`lombok` ，就不需要在自己的 `module-info.java` 文件中再声明，可以直接使用



### exports指令

> 默认情况下，一个模块不会将其任何 API 暴露给其他模块。
>
> 这样我们的代码就显更加安全
>
> 如果想将代码提供给外部使用，则可以使用 exports 来公开包和包下的所有公共成员



```java
module cn.clboy.jdk.module.provider {
    requires static lombok;
    exports cn.clboy.jdk.module.provider;
}
```

这样，其他依赖该模块的模块就可以调用 `cn.clboy.jdk.module.provider` 包下的所有公开成员

我们给项目下再添加个模块 `module-consumer ` 进行测试，现项目结构如下：

```java11
java11
├─ lib
│  └─ lombok-1.18.22.jar
├─ module-consumer
│  └─ src
│     ├─ cn.clboy.jdk.module.consumer
│     │     └─ MainTest.java
│     └─ module-info.java
└─ module-provider
   └─ src
      ├─ cn.clboy.jdk.module.provider
      │     ├─ inner
      │     │  └─ Personal.java
      │     └─ Common.java
      └─ module-info.java
```
`module-info.java`

```java
module moduleConsumer {
    requires cn.clboy.jdk.module.provider;
}
```

这样 `moduleConsumer` 模块就可以使用 `cn.clboy.jdk.module.provider` 模块下的 `cn.clboy.jdk.module.provider` 包下的成员，但是不能使用 `cn.clboy.jdk.module.provider.inner` 下的成员

![image-20221019160242833](https://cdn.tencentfs.clboy.cn/images/2022/20221019160249508.png)



### exports to指令

> exports指令暴露出的api可以被其他任意模块引用，现在我只想将模块暴露给指定的模块使用
>
> to后面可以跟多个模块名，中间用英文逗号隔开

```java
module cn.clboy.jdk.module.provider {
    exports cn.clboy.jdk.module.provider to otherModuleName;
    requires lombok;
}
```

这里 `moduleConsumer` 就不能使用 `cn.clboy.jdk.module.provider` 模块了，在idea中查看 `MainTest.java` 类给出了错误提示，修复如下

```java
module cn.clboy.jdk.module.provider {
    exports cn.clboy.jdk.module.provider to otherModuleName, moduleConsumer;
    requires lombok;
}
```



### uses和provides With指令

> 在 Java 中，通常将 API 建模为接口（或有时是抽象类），然后根据情况选择最佳的实现类
>
> 理想情况下，API 的使用者应该与实现完全分离，这意味着它们之间没有直接的依赖关系

写过web项目的应该熟悉 `XxxService` 、`XxxServiceImpl` ，然后会在controller类中使用以下方式创建实例

```java
XxxService service = new XxxServiceImpl();
```

这种创建方式就造成了服务使用者(controller) 和服务实现(XxxServiceImpl) 需要直接依赖而且是硬编码，不过后来使用 `spring` 之后有了容器和依赖注入也能够达到这种理想

在java9以后，我们先来看看不理想的情况，首先我们再创建一个模块 `module-api` ，这个模块用来定义接口(Logger.java)，也就是服务，然后在`module-provider` 中 `impl` 包下创建服务实现 `OnlyDebugLogger.java`

```java11
java11
├─ lib
│  └─ lombok-1.18.22.jar
├─ module-api
│  └─ src
│     ├─ cn.clboy.jdk.module.api
│     │  └─ Logger.java
│     └─ module-info.java
├─ module-consumer
│  └─ src
│     ├─ cn.clboy.jdk.module.consumer
│     │  └─ MainTest.java
│     └─ module-info.java
└─ module-provider
   └─ src
      ├─ cn.clboy.jdk.module.provider
      |  ├─ impl
      │  │  └─ OnlyDebugLogger.java
      │  ├─ inner
      │  │  └─ Personal.java
      │  └─ Common.java
      └─ module-info.java
```
`Logger.java`

``` java
public interface Logger {

    void debug(String msg);

    void info(String msg);

    void error(String msg);
}
```

`OnlyDebugLogger.java`

```java
public class OnlyDebugLogger implements Logger {
    @Override
    public void debug(String msg) {
        System.out.println(getClass().getName() + " [debug] " + msg);
    }

    @Override
    public void info(String msg) {

    }

    @Override
    public void error(String msg) {

    }
}
```

三个模块的模块声明 `module-info.java` 文件

```java
//module-api
module cn.clboy.jdk.module.api {
    exports cn.clboy.jdk.module.api;
}

//module-provider
module cn.clboy.jdk.module.provider {
    exports cn.clboy.jdk.module.provider to otherModuleName, moduleConsumer;
    exports cn.clboy.jdk.module.provider.impl;
    requires lombok;
    requires cn.clboy.jdk.module.api;
}

//module-consumer
module moduleConsumer {
    //依赖服务实现
    requires cn.clboy.jdk.module.provider;
    //依赖服务api
    requires cn.clboy.jdk.module.api;
}
```



服务使用者 `module-consumer` 

```java
public class MainTest {

    public static void main(String[] args) throws Exception {
        Common.printInfo("clboy", 24);
        Logger logger = new OnlyDebugLogger();
        logger.debug(System.currentTimeMillis() + "");
        logger.info(System.currentTimeMillis() + "");
        logger.error(System.currentTimeMillis() + "");
    }
}
```

假如现在我们日志的实现了不再是 `cn.clboy.jdk.module.provider` 模块，换成其他模块下的其他包下的 `Logger` 实现类，我们就需要去改动很多源码

看看java9之后的实现

```java
//module-api
module cn.clboy.jdk.module.api {
    exports cn.clboy.jdk.module.api;
}

//module-provider
module cn.clboy.jdk.module.provider {
    exports cn.clboy.jdk.module.provider to otherModuleName, moduleConsumer;
    //如果不想暴露包下的其他类就不要写，而是使用 provides ... with ... 细粒度控制
    //exports cn.clboy.jdk.module.provider.impl;
    requires lombok;
    requires cn.clboy.jdk.module.api;
    //提供接口的实现类
    provides Logger with OnlyDebugLogger;
}

//module-consumer
module moduleConsumer {
    //依赖服务实现,如果不需要provider的其他类，只使用服务的话，应该使用 uses 进行细粒度控制
    requires cn.clboy.jdk.module.provider的;
    //依赖服务api
    requires cn.clboy.jdk.module.api;
    //声明使用的服务接口
    uses cn.clboy.jdk.module.api.Logger;
}
```

```java
public class MainTest {

    public static void main(String[] args) throws Exception {
        Common.printInfo("clboy", 24);
        //Logger logger = new OnlyDebugLogger();
        Logger logger = ServiceLoader.load(Logger.class).findFirst().orElseThrow(() -> new RuntimeException("未找到Logger实现类"));
        logger.debug(System.currentTimeMillis() + "");
        logger.info(System.currentTimeMillis() + "");
        logger.error(System.currentTimeMillis() + "");
    }
}
```



### open和opens指令

> 我们知道java中有封装这个设计，我们可以将类访问控制修饰符设为
>
> - `public` ：允许任何地方使用
> - `protected` ：在同一个包内，或者是其子类才能使用
> - `default` ：在同一个包内才能使用
> - `private` ：只能自己使用
>
> 虽然有上面这些访问限制，但是我们仍然可以使用反射来访问包中的每个类型和成员，甚至是私有的。没有什么是真正封装的
>
> 然而在java9之后默认是不允许使用反射访问其他模块的，需要主动声明



允许反射访问模块下的所有代码

```java
open module 模块名 {
}
```

允许反射访问模块下指定包的代码

```java
module 模块名 {
  opens 包名;
}
```



### opens to指令

> 和exports to指令同理
>
> 只允许指定的模块使用反射访问指定的包下代码
>
> to后面可以跟多个模块名，中间用英文逗号隔开

```java
module 模块名 {
    opens 包名 to 模块1, 模块2, 模块n;
}
```





## 与maven一起使用

> java模块化增加了更高的可靠性、更好的关注点分离和更强的封装。但是，它不是构建工具，因此缺乏自动管理项目依赖项的能力
>
> 由于模块化和依赖管理在 Java 中不是相互排斥的概念，因此我们可以与 Maven无缝集成，从而充分利用两者的优势。



首先，由于我们使用的是 `java11`，我们的系统上至少需要 `3.5.0` 及以上版本 ，因为 Maven 从该版本开始支持 Java 9 及更高版本。

而且，我们还需要至少 `3.8.0` 版的Maven编译器插件（其余无变动，和jdk8时maven项目一致）

```xml
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.0</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
```



接下来我们将项目改造为maven项目标准结构：

`module-info.java` **的内容都不变**

```
java11
├─ module-api
│  ├─ src
│  │  └─ main
│  │     ├─ java
│  │     │  ├─ cn.clboy.jdk.module.api
│  │     │  │  └─ Logger.java
│  │     │  └─ module-info.java
│  │     └─ resources
│  └─ pom.xml
├─ module-consumer
│  ├─ src
│  │  └─ main
│  │     └─ java
│  │        ├─ cn.clboy.jdk.module.consumer
│  │        │  └─ MainTest.java
│  │        └─ module-info.java
│  └─ pom.xml
├─ module-provider
│  ├─ src
│  │  └─ main
│  │     └─ java
│  │        ├─ cn.clboy.jdk.module.provider
│  │        │  ├─ impl
│  │        │  │  └─ OnlyDebugLogger.java
│  │        │  ├─ inner
│  │        │  │  └─ Personal.java
│  │        │  └─ Common.java
│  │        └─ module-info.java
│  └─ pom.xml
└─ pom.xml

```


### 父工程POM文件

> 除添加编译器插件外和jdk8时的maven项目一致，其余无改变

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>cn.clboy</groupId>
    <artifactId>java11</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>module-provider</module>
        <module>module-consumer</module>
    </modules>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.8.0</version>
                    <configuration>
                        <source>11</source>
                        <target>11</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

</project>
```

