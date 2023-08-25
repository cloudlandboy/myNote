# Aop



当有人问你AOP的实现原理时，你怎么回答？

可能大多数人想到的就是代理，其实Aop有三种方式实现

1. 编译时对源代码进行修改，通过Maven插件：`aspectj-maven-plugin`
2. 通过JavaAgent，在类加载阶段修改字节码：`aspectjweaver.jar`
3. 代理：JDK动态代理、CGLib动态代理



## 实现-Ajc编译器

首先我们要添加springAop的依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

创建一个Service

```java
@Slf4j
public class TestService {

    public void buy() {
        log.info("买东西");
    }
}
```

再创建一个切面类对TestService进行增强

```java
@Slf4j
@Aspect
public class TestAspect {

    @Before("execution(* cn.clboy.springboot.starter.demo.h.TestService.buy())")
    public void driveCar() {
        log.info("开车去");
    }
}
```

测试程序

```java
public class TestApp {

    public static void main(String[] args) {
        TestService testService = new TestService();
        testService.buy();
    }
}
```

运行程序后你会发现并没有被增强，这是因为我们还没有添加maven编译插件

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>aspectj-maven-plugin</artifactId>
    <version>1.14.0</version>
    <configuration>
        <complianceLevel>1.8</complianceLevel>
        <source>8</source>
        <target>8</target>
        <showWeaveInfo>true</showWeaveInfo>
        <verbose>true</verbose>
        <Xlint>ignore</Xlint>
        <encoding>UTF-8</encoding>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>compile</goal>
                <goal>test-compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

添加完插件后，你发现还没有被增强，这是什么原因，难道是因为我们没有在spring环境中运行？

当然不是，上文也说了，这种方式是在源码编译时对源码进行修改来增强，这个时候和spring没什么关系

!> 在Idea中运行时，idea是使用javac来进行编译的，这时候maven插件没法运行，我们需要手动运行idea右侧面板中maven>Lifecycle>compile进行编译

但是当你运行compile后，发现编译会报错，这是因为我们使用了lombok的原因

!> lombok和aspectj-maven-plugin无法在一起工作

解决方法：

1. 不使用lombok  **（不推荐）**

2. 先使用javac编译代码（lombok解析完），然后再使用aspectj来编织类

   再 `aspectj-maven-plugin` 的 `configuration` 标签中添加如下几个配置

   ```xml
   <!--强制重新编译-->
   <forceAjcCompile>true</forceAjcCompile>
   <!--排除掉源代码-->
   <excludes>
       <exclude>**/*.java</exclude>
   </excludes>
   <!--指定要编织的目录-->
   <weaveDirectories>
       <weaveDirectory>${project.build.outputDirectory}</weaveDirectory>
   </weaveDirectories>
   ```

然后再运行compile，查看target目录下编译后的字节码（在idea中反编译）

```java
public class TestService {
    private static final Logger log = LoggerFactory.getLogger(TestService.class);

    public TestService() {
    }

    public void buy() {
        TestAspect.aspectOf().driveCar();
        log.info("买东西");
    }
}
```





## 实现-Agent类加载

这种方式是类加载时编织，通过指定JVM参数：`-javaagent:aspectjweaver的jar包路径`

首先将之前添加的 `aspectj-maven-plugin` 移除掉，然后运行 `maven clean` 将之前编译的的目录清除

然后我们还要在 `resources/META-INF` 目录下创建名为 `aop.xml` 的配置文件

```xml
<aspectj>
    <aspects>
        <!-- 切面类全限定类名 -->
        <aspect name="cn.clboy.springboot.starter.demo.h.TestAspect"/>
        <!--编织配置-->
        <weaver options="-verbose -showWeaveInfo">
            <!--  被增强方法所在类的全限定类名 -->
            <include within="cn.clboy.springboot.starter.demo.h.TestService"/>
            <include within="cn.clboy.springboot.starter.demo.h.TestAspect"/>
        </weaver>
    </aspects>
</aspectj>
```

测试启动类

```java
public class TestApp {

    public static void main(String[] args) throws InterruptedException {
        TestService testService = new TestService();
        testService.buy();
        //让程序不要停掉
        Thread.sleep(Integer.MAX_VALUE);
    }
}
```

添加启动JVM参数，我这里是使用本地maven仓库中aspectjweaver的jar包绝对路径

![image-20230821151352815](https://cdn.tencentfs.clboy.cn/images/image-20230821151352815.png)

这次再运行启动类后查看target目录，发现字节码并没有被改变增强，但是运行输出结果确实是被增强后的

我们需要使用阿里的 [Arthas](https://arthas.aliyun.com/doc/download.html) 工具来反编译JVM内存中的字节码

从官网下载压缩包后解压，进入解压后的目录启动

```powershell
java "-Dfile.encoding=utf-8" -jar .\arthas-boot.jar
```

启动后会让我们选择java进程，找到 `TestApp` 对应的进程，输入前面的数字后回车进入Arthas终端

然后输入以下命令即可查看反编译后的代码

```shell
jad cn.clboy.springboot.starter.demo.h.TestService
```



## 实现-JDK动态代理

jdk 动态代理要求目标 **必须** 实现接口，生成的代理类实现相同接口，因此代理与目标之间是平级兄弟关系

我们先看一下使用jdk的api如何来生成代理对象

```java
public class JdkProxyTest {
    
    public interface Foo {
        void random();

        void echo(String message);

        int subtract(int n, int m);
    }

    public static class Target implements Foo {
        @Override
        public void random() {
            System.out.println("随机数：" + new Random().nextInt(999));
        }

        @Override
        public void echo(String message) {
            System.out.println("输出：" + message);
        }

        @Override
        public int subtract(int n, int m) {
            return n + m;
        }
    }

    public static void main(String[] args) {
        Class<?> interfaceClass = Foo.class;
        Target target = new Target();

        Foo proxy = (Foo) Proxy.newProxyInstance(interfaceClass.getClassLoader(),
                new Class[]{interfaceClass}, (p, method, params) -> {
                    System.out.println("代理对象：" + p.getClass());
                    System.out.println("要执行的目标方法：" + method);
                    System.out.println("参数：" + Arrays.toString(params));
                    System.out.println("before......");
                    Object returnVal = method.invoke(target, params);
                    System.out.println("after>>>>>>>>>>>>>>>>>>>>>>>>");
                    return returnVal;
                });

        proxy.random();
        proxy.echo("hello world");
        int value = proxy.subtract(16, 9);
        System.out.println(value);

    }
}
```

JDK动态代理的核心部分是 `java.lang.reflect` 包中的两个主要类：`Proxy` 和 `InvocationHandler`。

- **Proxy类**：这个类提供了用于创建动态代理类实例的静态方法
- **InvocationHandler接口**：这个接口是动态代理的关键，它只有一个 `invoke` 方法，在创建代理对象时，你需要提供一个实现了该接口的对象，它负责实际的代理逻辑。你可以在这里编写拦截、修改、记录日志等处理逻辑



### 模拟实现

```java
public class MockJdkProxyTest {

    public static class Proxy0 implements JdkProxyTest.Foo {
        private final InvocationHandler handler;

        public Proxy0(InvocationHandler handler) {
            this.handler = handler;
        }

        @Override
        public void random() {
            try {
                Method method = JdkProxyTest.Foo.class.getMethod("random");
                handler.invoke(this, method, null);
            } catch (RuntimeException | Error ex) {
                //运行时异常，直接抛出
                throw ex;
            } catch (Throwable ex) {
                //非运行时异常，包装成运行时异常再抛出
                throw new UndeclaredThrowableException(ex);
            }
        }

        @Override
        public void echo(String message) {
            try {
                Method method = JdkProxyTest.Foo.class.getMethod("echo", String.class);
                handler.invoke(this, method, new Object[]{message});
            } catch (RuntimeException | Error ex) {
                //运行时异常，直接抛出
                throw ex;
            } catch (Throwable ex) {
                //非运行时异常，包装成运行时异常再抛出
                throw new UndeclaredThrowableException(ex);
            }
        }

        @Override
        public int subtract(int n, int m) {
            try {
                Method method = JdkProxyTest.Foo.class.getMethod("subtract", int.class, int.class);
                return (int) handler.invoke(this, method, new Object[]{n, m});
            } catch (RuntimeException | Error ex) {
                //运行时异常，直接抛出
                throw ex;
            } catch (Throwable ex) {
                //非运行时异常，包装成运行时异常再抛出
                throw new UndeclaredThrowableException(ex);
            }
        }
    }

    public static void main(String[] args) {
        JdkProxyTest.Target target = new JdkProxyTest.Target();
        Proxy0 proxy = new Proxy0((p, method, params) -> {
            System.out.println("代理对象：" + p.getClass());
            System.out.println("要执行的目标方法：" + method);
            System.out.println("参数：" + Arrays.toString(params));
            System.out.println("before......");
            Object returnVal = method.invoke(target, params);
            System.out.println("after>>>>>>>>>>>>>>>>>>>>>>>>");
            return returnVal;
        });

        proxy.random();
        proxy.echo("hello world");
        int value = proxy.subtract(16, 9);
        System.out.println(value);
    }
}

```



### 代理类源码

接下来我们看一下jdk生成的源码和我们模拟是否一致

首先我们在 `JdkProxyTest` 的main方法最后加上一行等待控制台输入的代码，防止程序运行后终止

```java
int read = System.in.read();
```

然后使用 [Arthas](https://arthas.aliyun.com/doc/download.html) 工具来反编译JVM内存中代理类的字节码如下：

```java
public final class $Proxy0 extends Proxy implements JdkProxyTest.Foo {
    private static Method m1;
    private static Method m4;
    private static Method m2;
    private static Method m5;
    private static Method m0;
    private static Method m3;

    public $Proxy0(InvocationHandler invocationHandler) {
        super(invocationHandler);
    }

    static {
        try {
            m0 = Class.forName("java.lang.Object")
                .getMethod("hashCode", new Class[0]);
            m1 = Class.forName("java.lang.Object")
                .getMethod("equals", Class.forName("java.lang.Object"));
            m2 = Class.forName("java.lang.Object")
                .getMethod("toString", new Class[0]);
            m3 = Class.forName("cn.clboy.springboot.starter.demo.i.jdk.JdkProxyTest$Foo")
                .getMethod("subtract", Integer.TYPE, Integer.TYPE);
            m4 = Class.forName("cn.clboy.springboot.starter.demo.i.jdk.JdkProxyTest$Foo")
                .getMethod("echo", Class.forName("java.lang.String"));
            m5 = Class.forName("cn.clboy.springboot.starter.demo.i.jdk.JdkProxyTest$Foo")
                .getMethod("random", new Class[0]);
            return;
        } catch (NoSuchMethodException noSuchMethodException) {
            throw new NoSuchMethodError(noSuchMethodException.getMessage());
        } catch (ClassNotFoundException classNotFoundException) {
            throw new NoClassDefFoundError(classNotFoundException.getMessage());
        }
    }

    public final int subtract(int n, int n2) {
        try {
            return (Integer)this.h.invoke(this, m3, new Object[]{n, n2});
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final void echo(String string) {
        try {
            this.h.invoke(this, m4, new Object[]{string});
            return;
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    
    public final void random() {
        try {
            this.h.invoke(this, m5, null);
            return;
        } catch (Error | RuntimeException throwable) {
            throw throwable;
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    
    public final boolean equals(Object object) {
        try {
            return (Boolean)this.h.invoke(this, m1, new Object[]{object});
        } catch (Error | RuntimeException throwable) {
            throw throwable;
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final String toString() {
        try {
            return (String)this.h.invoke(this, m2, null);
        } catch (Error | RuntimeException throwable) {
            throw throwable;
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final int hashCode() {
        try {
            return (Integer)this.h.invoke(this, m0, null);
        } catch (Error | RuntimeException throwable) {
            throw throwable;
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
}
```

可以看到JDK动态代理生成的代码和我们模拟的大致相同，JDK做了一些优化

1. 为所有方法生成静态变量，然后在静态代码块中初始化
2. 直接继承 `Proxy` 类，Proxy类中维护了成员变量 `InvocationHandler`
3. 还代理了Object类中的一些方法



### 字节码生成

在生成代理类的字节码时，JDK 使用了字节码生成库，其中最常用的是 `javassist` 或 `ASM`。

由于这写库不是学习的重点，这里就不过多讨论。

有兴趣的话，可以在Idea中安装 `ASM Bytecode Outline` 插件，将 [代理类源码](#代理类源码) 放到Idea中用插件生成 `ASM` 代码





### JDK反射优化

```java
public class MethodInvokeTest {

    public static void main(String[] args) throws Exception {
        MethodInvokeTest test = new MethodInvokeTest();
        Method method = MethodInvokeTest.class.getMethod("echo", int.class);
        for (int i = 1; i <= 20; i++) {
            show(i, method);
            method.invoke(test, i);
        }
        int read = System.in.read();
    }

    public void echo(int i) {
        System.out.println("echo：" + i);
    }

    private static void show(int i, Method method) throws Exception {
        // 方法反射调用时，底层使用了 MethodAccessor 的实现类
        Method getMethodAccessor = Method.class.getDeclaredMethod("getMethodAccessor");
        getMethodAccessor.setAccessible(true);
        MethodAccessor methodAccessor = (MethodAccessor) getMethodAccessor.invoke(method);
        //没反射调用过方法之前是null
        if (methodAccessor == null) {
            System.out.println(i + ": null");
            return;
        }
        //使用的是DelegatingMethodAccessorImpl（不同版本的 JDK 存在差异）
        Field delegate = Class.forName("sun.reflect.DelegatingMethodAccessorImpl")
            .getDeclaredField("delegate");
        delegate.setAccessible(true);
        //获取实际使用的实现
        System.out.println(i + ": " + delegate.get(methodAccessor));
    }
}
```

运行代码后你会发现，反射调用方法时，前15次调用都是使用的 `NativeMethodAccessorImpl` 

NativeMethodAccessorImpl 基于 Java 本地 API 实现，性能较低

后面自动转为了 `GeneratedMethodAccessor2` 实现，同样，我们使用 [Arthas](https://arthas.aliyun.com/doc/download.html) 工具 来查看源码

```java
public class GeneratedMethodAccessor2 extends MethodAccessorImpl {

    public Object invoke(Object object, Object[] objectArray) throws InvocationTargetException {
        char c;
        MethodInvokeTest methodInvokeTest;
        block10: {
            if (object == null) {
                throw new NullPointerException();
            }
            methodInvokeTest = (MethodInvokeTest)object;
            if (objectArray.length != 1) {
                throw new IllegalArgumentException();
            }
            Object object2 = objectArray[0];
            if (object2 instanceof Byte) {
                c = ((Byte)object2).byteValue();
                break block10;
            }
            if (object2 instanceof Character) {
                c = ((Character)object2).charValue();
                break block10;
            }
            if (object2 instanceof Short) {
                c = (char)((Short)object2).shortValue();
                break block10;
            }
            if (object2 instanceof Integer) {
                c = (char)((Integer)object2).intValue();
                break block10;
            }
            throw new IllegalArgumentException();
        }
        try {
            methodInvokeTest.echo((int)c);
            return null;
        }
        catch (Throwable throwable) {
            throw new InvocationTargetException(throwable);
        }
        catch (ClassCastException | NullPointerException runtimeException) {
            throw new IllegalArgumentException(super.toString());
        }
    }
}
```

可以看到，它这个不再是通过反射调用方法，而是直接正常调用方法，因此性能得到了提升，但这样的提升也是有一定代价的：

为优化 一个 方法的反射调用，生成了一个 GeneratedMethodAccessor2 代理类





## 实现-CGLib动态代理

CGLib动态代理需要使用CGLIB库，通过生成目标类的子类来实现代理。

CGLib能够代理没有实现接口的类，它继承了目标类，并重写了目标类的方法。

- 与 JDK 动态代理相比，CGLib 动态代理无需实现接口
- 代理对象和目标对象是父子关系，也就是说代理类继承了目标类
- 由于代理类继承了目标类，因此目标类不能被 final 修饰
- 代理类继承目标类后，还会重写目标类中要求被增强的方法，因此被增强的方法不能被 final 修饰



```java
public class CglibProxyTest {

    public static class Target {
        public void random() {
            System.out.println("随机数：" + new Random().nextInt(999));
        }

        public void echo(String message) {
            System.out.println("输出：" + message);
        }

        public int subtract(int n, int m) {
            return n + m;
        }
    }

    public static void main(String[] args) {
        Target target = new Target();
        Target proxy = (Target) Enhancer.create(Target.class,
                (MethodInterceptor) (p, method, params, methodProxy) -> {
                    System.out.println("代理对象：" + p.getClass());
                    System.out.println("要执行的目标方法：" + method);
                    System.out.println("参数：" + Arrays.toString(params));
                    System.out.println("before......");
                    Object returnVal = method.invoke(target, params);
                    System.out.println("after>>>>>>>>>>>>>>>>>>>>>>>>");
                    return returnVal;
                });
        proxy.random();
        proxy.echo("hello world");
        int value = proxy.subtract(16, 9);
        System.out.println(value);
    }
}
```

`Enhancer.create` 方法需要两个参数，一个是目标类Class，另一个是 `Callback` 接口实现

一般使用的实现类是：`MethodInterceptor`

```java
public interface MethodInterceptor extends Callback {
    Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable;
}
```

调用目标方法的方式有三种，上文使用的是反射调用

```java
Object returnVal = method.invoke(target, params);
```

还可以使用 methodProxy 不利用反射对目标方法进行调用

```java
//使用目标对象,它会正常（间接）调用目标对象的方法（Spring 采用）
Object returnVal = methodProxy.invoke(target, params);
//使用代理对象本身，可以省略目标对象
Object returnVal = methodProxy.invokeSuper(p, params);
```



### 模拟实现

```java
public class MockCglibProxyTest {

    public static class Proxy extends Target {
        private final MethodInterceptor methodInterceptor;

        public Proxy(MethodInterceptor methodInterceptor) {
            this.methodInterceptor = methodInterceptor;
        }

        static Method randomMethod;
        static Method echoMethod;
        static Method subtractMethod;

        static {
            try {
                randomMethod = Target.class.getMethod("random");
                echoMethod = Target.class.getMethod("echo", String.class);
                subtractMethod = Target.class.getMethod("subtract", int.class, int.class);
            } catch (NoSuchMethodException e) {
                throw new NoSuchMethodError(e.getMessage());
            }
        }


        @Override
        public void random() {
            try {
                methodInterceptor.intercept(this, randomMethod, new Object[0], null);
            } catch (Throwable e) {
                throw new UndeclaredThrowableException(e);
            }
        }

        @Override
        public void echo(String message) {
            try {
                methodInterceptor.intercept(this, echoMethod, new Object[]{message}, null);
            } catch (Throwable e) {
                throw new UndeclaredThrowableException(e);
            }
        }

        @Override
        public int subtract(int n, int m) {
            try {
                return (int) methodInterceptor.intercept(this, subtractMethod,
                        new Object[]{n, m}, null);
            } catch (Throwable e) {
                throw new UndeclaredThrowableException(e);
            }
        }
    }


    public static void main(String[] args) {
        Target target = new Target();
        Proxy proxy = new Proxy((p, method, params, methodProxy) -> {
            System.out.println("代理对象：" + p.getClass());
            System.out.println("要执行的目标方法：" + method);
            System.out.println("参数：" + Arrays.toString(params));
            System.out.println("before......");
            Object returnVal = method.invoke(target, params);
            System.out.println("after>>>>>>>>>>>>>>>>>>>>>>>>");
            return returnVal;
        });

        proxy.random();
        proxy.echo("hello world");
        int value = proxy.subtract(16, 9);
        System.out.println(value);
    }
}
```



### MethodProxy

`MethodInterceptor` 的 `intercept` 方法中最后一个类型为 `MethodProxy` 的实例参数可以用它来避免反射调用

MethodProxy提供了静态方法 `create` 来创建实例

```java
/**
* @param c1    目标类Class对象
* @param c2    代理类Class对象
* @param desc  方法描述符
* @param name1 调用 增强 功能的方法名称
* @param name2 调用 原始 功能的方法名称
* @return {@code MethodProxy }
*/
public static MethodProxy create(Class c1, Class c2, String desc, String name1, String name2) {
    MethodProxy proxy = new MethodProxy();
    proxy.sig1 = new Signature(name1, desc);
    proxy.sig2 = new Signature(name2, desc);
    proxy.createInfo = new CreateInfo(c1, c2);
    return proxy;
}
```

关于描述符的官网文档：[Descriptors](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.3)

然后对Proxy类改写，首先要创建出直接调用原始功能的方法，然后为每个方法创建 `MethodProxy`

```java
public static class Proxy extends Target {
    private final MethodInterceptor methodInterceptor;

    public Proxy(MethodInterceptor methodInterceptor) {
        this.methodInterceptor = methodInterceptor;
    }

    static Method randomMethod;
    static Method echoMethod;
    static Method subtractMethod;
    static MethodProxy randomMethodProxy;
    static MethodProxy echoMethodProxy;
    static MethodProxy subtractMethodProxy;

    static {
        try {
            randomMethod = Target.class.getMethod("random");
            echoMethod = Target.class.getMethod("echo", String.class);
            subtractMethod = Target.class.getMethod("subtract", int.class, int.class);

            randomMethodProxy = MethodProxy.create(Target.class, Proxy.class,
                                                   "()V", "random", "superRandom");
            echoMethodProxy = MethodProxy.create(Target.class, Proxy.class,
                                                 "(Ljava/lang/String;)V", "echo", "superEcho");
            subtractMethodProxy = MethodProxy.create(Target.class, Proxy.class,
                                                     "(II)I", "subtract", "superSubtract");
        } catch (NoSuchMethodException e) {
            throw new NoSuchMethodError(e.getMessage());
        }
    }


    public void superRandom() {
        super.random();
    }

    public void superEcho(String message) {
        super.echo(message);
    }

    public int superSubtract(int n, int m) {
        return super.subtract(n, m);
    }

    @Override
    public void random() {
        try {
            methodInterceptor.intercept(this, randomMethod,new Object[0], randomMethodProxy);
        } catch (Throwable e) {
            throw new UndeclaredThrowableException(e);
        }
    }

    @Override
    public void echo(String message) {
        try {
            methodInterceptor.intercept(this, echoMethod,new Object[]{message}, echoMethodProxy);
        } catch (Throwable e) {
            throw new UndeclaredThrowableException(e);
        }
    }

    @Override
    public int subtract(int n, int m) {
        try {
            return (int) methodInterceptor.intercept(this, subtractMethod,
                                                     new Object[]{n, m}, subtractMethodProxy);
        } catch (Throwable e) {
            throw new UndeclaredThrowableException(e);
        }
    }
}
```

这样就可以在 `methodInterceptor.intercep` 方法中使用methodProxy来避免反射调用了



### MethodProxy原理

在调用 `methodProxy.invoke()` 或 `methodProxy.invokeSuper()` 方法时

MethodProxy会调用内部的init方法生成两个代理类( `FastClass` 类型 )，这两个代理类分别配合目标类和代理类使用

`FastClass` 是一个抽象类，其内部有多个抽象方法，我们主要关注以下两个抽象方法：

```java
/**
 * 通过方法签名获取唯一索引
 *
 * @param signature 方法签名
 */
public abstract int getIndex(Signature signature);

/**
 * 执行方法
 *
 * @param index 方法索引
 * @param obj 实例对象(目标类实例/代理类实例)
 * @param args 参数
 */
public abstract Object invoke(int index, Object obj, Object[] args) throws InvocationTargetException;
```

接下来我们模拟实现一下

```java
public static abstract class FastClass {
    public abstract int getIndex(Signature signature);

    public abstract Object invoke(int index, Object obj, Object[] args);
}

/**
 * 目标类FastClass
 */
public static class TargetFastClass extends FastClass {
    static Signature i0 = new Signature("random", "()V");
    static Signature i1 = new Signature("echo", "(Ljava/lang/String;)V");
    static Signature i2 = new Signature("subtract", "(II)I");

    @Override
    public int getIndex(Signature signature) {
        if (i0.equals(signature)) {
            return 0;
        } else if (i1.equals(signature)) {
            return 1;
        } else if (i2.equals(signature)) {
            return 2;
        }
        return -1;
    }

    @Override
    public Object invoke(int index, Object obj, Object[] args) {
        Target target = ((Target) obj);
        if (index == 0) {
            target.random();
            return null;
        } else if (index == 1) {
            target.echo((String) args[0]);
            return null;
        } else if (index == 2) {
            return target.subtract((int) args[0], (int) args[1]);
        }
        throw new RuntimeException("no such method");
    }
}

/**
 * 代理类FastClass
 */
public static class ProxyFastClass extends FastClass {
    static Signature i0 = new Signature("superRandom", "()V");
    static Signature i1 = new Signature("superEcho", "(Ljava/lang/String;)V");
    static Signature i2 = new Signature("superSubtract", "(II)I");

    @Override
    public int getIndex(Signature signature) {
        if (i0.equals(signature)) {
            return 0;
        } else if (i1.equals(signature)) {
            return 1;
        } else if (i2.equals(signature)) {
            return 2;
        }
        return -1;
    }

    @Override
    public Object invoke(int index, Object obj, Object[] args) {
        Proxy proxy = ((Proxy) obj);
        if (index == 0) {
            proxy.superRandom();
            return null;
        } else if (index == 1) {
            proxy.superEcho((String) args[0]);
            return null;
        } else if (index == 2) {
            return proxy.superSubtract((int) args[0], (int) args[1]);
        }
        throw new RuntimeException("no such method");
    }
}
```

测试：

```java
public static void main(String[] args) {
    Target target = new Target();
    TargetFastClass tfs = new TargetFastClass();
    tfs.invoke(tfs.getIndex(new Signature("random", "()V")),
               target, new Object[0]);
    tfs.invoke(tfs.getIndex(new Signature("echo", "(Ljava/lang/String;)V")),
               target, new Object[]{"hello world"});
    Object value = tfs.invoke(tfs.getIndex(new Signature("subtract", "(II)I")),
                              target, new Object[]{16, 9});
    System.out.println("16-9：" + value);

    System.out.println("===================================================");

    Proxy proxy = new Proxy(null);
    ProxyFastClass pfs = new ProxyFastClass();
    pfs.invoke(pfs.getIndex(new Signature("superRandom", "()V")),
               proxy, new Object[0]);
    pfs.invoke(pfs.getIndex(new Signature("superEcho", "(Ljava/lang/String;)V")),
               proxy, new Object[]{"hello world"});
    value = pfs.invoke(pfs.getIndex(new Signature("superSubtract", "(II)I")),
                       proxy, new Object[]{16, 9});
    System.out.println("16-9：" + value);

}
```



## Spring Aop



### Advisor

切面有 `aspect` 和 `advisor` 两个概念

aspect 是多组通知（advice）和切点（pointcut）的组合，也是实际编码时使用的

```java
@Aspect
public class TestAspect {

    @Before(value = "execution(* cn.clboy.xxx.echo())")
    public void before() {
        System.out.println("before......");
    }

    @AfterReturning(value = "execution(* cn.clboy.xxx.echo())")
    public void after() {
        System.out.println("after......");
    }
}
```

advisor 则是更细粒度的切面，仅包含一个通知和切点，aspect 在生效之前会被拆解成多个 advisor



### 创建代理



Spring 中对切点、通知、切面的抽象如下：

![image-20230823103413872](https://cdn.tencentfs.clboy.cn/images/image-20230823103413872.png)

- 切点(Pointcut)：其典型实现是 `AspectJExpressionPointcut`
- 通知(Advice)：其典型子类接口为 `MethodInterceptor` ，表示环绕通知
- 切面(Advisor)：仅包含一个切点和通知



通过以下四步创建切面和代理：

1. 备好切点

   切点通过接口 `org.springframework.aop.Pointcut` 来表示：

   Pointcut 接口有很多实现类，比如：

   - `AnnotationMatchingPointcut` ：通过注解进行匹配
   - `AspectJExpressionPointcut` ：通过 AspectJ 表达式进行匹配

2. 备好通知

   通知通过接口 `org.aopalliance.aop.Advice` 来表示

   其中最重要的子接口 `org.aopalliance.intercept.MethodInterceptor` 这个接口实现的通知属于环绕通知

   ```java
   @FunctionalInterface
   public interface MethodInterceptor extends Interceptor {
   	@Nullable
   	Object invoke(@Nonnull MethodInvocation invocation) throws Throwable;
   }
   ```

3. 备好切面

   切面通过接口 `org.springframework.aop.Advisor` 来表示

   在此选择 `DefaultPointcutAdvisor` ，创建这种切面时，需要传递一个切点和通知

   ```java
   public DefaultPointcutAdvisor(Pointcut pointcut, Advice advice) {
       this.pointcut = pointcut;
       setAdvice(advice);
   }
   ```

4. 创建代理

   最后创建代理对象时，无需显式实现 JDK 动态代理或 CGLib 动态代理，Spring 提供了名为 ProxyFactory 的工厂，其内部通过不同的情况选择不同的代理实现，更方便地创建代理对象

   ```java
   public class AdvisorTest {
   
       interface I1 {
           void foo();
   
           void bar();
       }
   
       static class Target1 implements I1 {
   
           @Override
           public void foo() {
               System.out.println("target1 foo");
           }
   
           @Override
           public void bar() {
               System.out.println("target1 bar");
           }
       }
   
       public static void main(String[] args) {
           //1. 准备切入点
           AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
           pointcut.setExpression("execution(* foo())");
           //2. 准备通知
           Advice advice = (MethodInterceptor) invocation -> {
               System.out.println("before......");
               Object returnVal = invocation.proceed();
               System.out.println("after......");
               return returnVal;
           };
           //3. 准备切面
           Advisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
   
           //创建代理
           ProxyFactory factory = new ProxyFactory();
           factory.setTarget(new Target1());
           factory.addAdvisor(advisor);
           I1 proxy = (I1) factory.getProxy();
           proxy.foo();
           proxy.bar();
           System.out.println(proxy.getClass()); 
       }
   }
   ```

   

运行代码，控制台最终输出：

```
before......
target1 foo
after......
target1 bar
class x.xx.AdvisorTest$Target1$$EnhancerBySpringCGLIB$$c30c1ce
```

从代理对象类名可以看出使用的是CGLIB代理

Spring 是根据什么信息来选择不同的动态代理实现呢？

ProxyFactory中可以通过 `setProxyTargetClass` 方法设置为 `true` 来指定使用CGLIB代理

```java
factory.setProxyTargetClass(true);
```

默认值为false，当值为false时，spring是这样判断的：

- 目标对象所在类实现了接口时，选择 JDK 动态代理
- 标对象所在类未实现接口时，选择 CGLib 动态代理

但是 `Target1` 明明实现了接口，但还是选择 CGLIB 的原因是因为创建代理时没有告诉spring要代理的接口，Spring 认为其并未实现接口。

```java
factory.setInterfaces(Target1.class.getInterfaces());
```

修改代码后控制台输出：

```
before......
target1 foo
after......
target1 bar
class x.xx.$Proxy0
```



### 切点匹配

如何判断一个方法与切点表达式是否匹配呢？

`AspectJExpressionPointcut` 实现了 `MethodMatcher` 接口

```java
public interface MethodMatcher {

	boolean matches(Method method, Class<?> targetClass);

	// ......
}
```

因此我们可以直接调用 `matches` 来判断一个方法是否与该切点匹配

```java
public static void main(String[] args) {
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* foo())");

    for (Method method : Target1.class.getDeclaredMethods()) {
        System.out.print(method.getName() + "：");
        System.out.println(pointcut.matches(method, Target1.class));
    }
}
```

但是，当使用注解表达式的时候，这个匹配方法就有一定的局限性，它只能匹配方法自身上是否有指定的注解

```java
pointcut.setExpression("@annotation(org.springframework.transaction.annotation.Transactional)");
```

在spring中 `@Transactional` 不仅可以标在方法上，还能标在类上，甚至接口上

```java
public class AdvisorTest {

    @Transactional
    interface I1 {
        void foo();

        void bar();
    }

    static class Target1 implements I1 {

        @Override
        public void foo() {
            System.out.println("target1 foo");
        }

        @Override
        public void bar() {
            System.out.println("target1 bar");
        }
    }

    @Transactional
    static class Target2 {
        public void foo() {
            System.out.println("target2 foo");
        }

        public void bar() {
            System.out.println("target2 bar");
        }
    }

    public static void main(String[] args) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression("@annotation(org.springframework.transaction.annotation.Transactional)");

        for (Method method : Target1.class.getDeclaredMethods()) {
            System.out.print(method.getName() + "：");
            System.out.println(pointcut.matches(method, Target1.class));
        }
        System.out.println("=================================>");
        for (Method method : Target2.class.getDeclaredMethods()) {
            System.out.print(method.getName() + "：");
            System.out.println(pointcut.matches(method, Target2.class));
        }
    }
}

```

运行后结果全都是false，那spring对 `@Transactional` 是怎么匹配的呢？

在底层 @Transactional 注解的匹配使用到了 `StaticMethodMatcherPointcut` 

模拟代码：

```java
public static void main(String[] args) {
    MethodMatcher matcher = new StaticMethodMatcherPointcut() {
        @Override
        public boolean matches(Method method, Class<?> targetClass) {
            //检查方法上是否有注解
            MergedAnnotations annotations = MergedAnnotations.from(method);
            if (annotations.isPresent(Transactional.class)) {
                return true;
            }
            //检查类或者超类是否有注解
            annotations = MergedAnnotations.from(targetClass, MergedAnnotations.SearchStrategy.TYPE_HIERARCHY);
            return annotations.isPresent(Transactional.class);
        }
    };

    for (Method method : Target1.class.getDeclaredMethods()) {
        System.out.print(method.getName() + "：");
        System.out.println(matcher.matches(method, Target1.class));
    }
    System.out.println("=================================>");
    for (Method method : Target2.class.getDeclaredMethods()) {
        System.out.print(method.getName() + "：");
        System.out.println(matcher.matches(method, Target2.class));
    }
}
```



### 自动创建代理

在spring中我们将标注 `@Aspect` 注解的类注入到容器中，在运行时就会帮我们生成代理，接下来就探究一下它是如何来创建的

上文讲过，切面有 `aspect` (高级切面) 和 `advisor`  (低级切面) 两个概念

spring在创建代理时会将高级切面转为低级切面

我们准备如下几个类：

```java
public class AutoProxyCreatorTest {

    static class Target1 {
        public void foo() {
            System.out.println("target1 foo");
        }
    }

    static class Target2 {
        public void bar() {
            System.out.println("target2 bar");
        }
    }

    /**
     * 高级切面
     */
    @Aspect
    static class TestAspect {
        @Before("execution(* foo())")
        public void before() {
            System.out.println("testAspect before...");
        }

        @After("execution(* foo())")
        public void after() {
            System.out.println("testAspect after...");
        }
    }


    @Configuration
    static class Config {

        @Bean
        public Advice testAdvice() {
            return (MethodInterceptor) invocation -> {
                System.out.println("testAdvice before...");
                Object result = invocation.proceed();
                System.out.println("testAdvice after...");
                return result;
            };
        }

        /**
         * 低级切面，由一个切点和一个通知组成
         */
        @Bean
        public Advisor testAdvisor(Advice testAdvice) {
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression("execution(* foo())");
            return new DefaultPointcutAdvisor(pointcut, testAdvice);
        }

    }

    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean("testAspect", TestAspect.class);
        context.registerBean("config", Config.class);
        context.registerBean(ConfigurationClassPostProcessor.class);
        context.refresh();
        for (String name : context.getBeanDefinitionNames()) {
            System.out.println(name);
        }
        context.close();
    }

}
```

运行代码后输出：

```
testAspect
config
org.springframework.context.annotation.ConfigurationClassPostProcessor
testAdvice
testAdvisor
```

现在容器中有一个高级切面 `testAspect` 和 低级切面 `testAdvisor`

spring是如何知道这些切面的呢？

spring中有一个名为 `AnnotationAwareAspectJAutoProxyCreator` 的Bean后置处理器，这个后置处理器会从容器中找到所有切面

这个类中的两个重要方法：

- `findEligibleAdvisors()` ：位于父类 AbstractAdvisorAutoProxyCreator 中，用于找到符合条件的切面类。低级切面直接添加，高级切面转换为低级切面再添加。
- `wrapIfNecessary()` ：位于父类 AbstractAutoProxyCreator 中，用于将有资格被代理的 Bean 进行包装，即创建代理对象。

由于这两个方法都是 `protected` ，不好直接测试，解决方法有三种

1. 自己写一个子类去继承它

2. 使用反射

3. 测试类所在包名定义和它所在包名一致

   ```
   org.springframework.aop.framework.autoproxy
   ```



#### findEligibleAdvisors

该方法接收两个参数：

- `beanClass` ：寻找匹配切面的class
- `beanName` ：当前代理 bean 的名称

返回值是所有匹配的切面

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("testAspect", TestAspect.class);
    context.registerBean("config", Config.class);
    context.registerBean(ConfigurationClassPostProcessor.class);
    context.refresh();
    AnnotationAwareAspectJAutoProxyCreator creator = new AnnotationAwareAspectJAutoProxyCreator();
    creator.setBeanFactory(context.getBeanFactory());
    List<Advisor> advisors = creator.findEligibleAdvisors(Target1.class, "target1");
    for (Advisor advisor : advisors) {
        System.out.println(advisor);
    }
    context.close();
}
```

运行代码后输出：

```
org.springframework.aop.interceptor.ExposeInvocationInterceptor.ADVISOR
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.framework.autoproxy.AutoProxyCreatorTest$Config$$Lambda$44/1131040331@c0c2f8d]
InstantiationModelAwarePointcutAdvisor: expression [execution(* foo())]; advice method [public void org.springframework.aop.framework.autoproxy.AutoProxyCreatorTest$TestAspect.before()]; perClauseKind=SINGLETON
InstantiationModelAwarePointcutAdvisor: expression [execution(* foo())]; advice method [public void org.springframework.aop.framework.autoproxy.AutoProxyCreatorTest$TestAspect.after()]; perClauseKind=SINGLETON
```

打印出 4 个匹配 Target1 的切面信息，其中：

- 第一个切面 ExposeInvocationInterceptor.ADVISOR 是 Spring 为每个代理对象都会添加的切面；
- 第二个切面 DefaultPointcutAdvisor 是自行编写的低级切面；
- 第三个和第四个切面 InstantiationModelAwarePointcutAdvisor 是由高级切面转换得到的两个低级切面。



#### wrapIfNecessary

wrapIfNecessary() 方法内部调用了 findEligibleAdvisors() 方法，若 findEligibleAdvisors() 方法返回的集合不为空，则表示需要创建代理对象。

如果需要创建对象，wrapIfNecessary() 方法返回的是代理对象，否则仍然是原对象。

wrapIfNecessary() 方法接收三个参数：

- `bean` ：原始 Bean 实例
- `beanName` ：Bean 的名称
- `cacheKey` ：用于元数据访问的缓存 key

```java
Object target1 = creator.wrapIfNecessary(new Target1(), "target1", "target1");
System.out.println(target1.getClass());
Object target2 = creator.wrapIfNecessary(new Target2(), "target2", "target2");
System.out.println(target2.getClass());
```

输入结果：

```
class org.springframework.aop.framework.autoproxy.AutoProxyCreatorTest$Target1$$EnhancerBySpringCGLIB$$747bec66
class org.springframework.aop.framework.autoproxy.AutoProxyCreatorTest$Targe
```



#### 切面顺序控制

我们拿到代理对象后调用代理方法，看一下两个切面的执行顺序

```java
Target1 target1 = (Target1) creator.wrapIfNecessary(new Target1(), "target1", "target1");
target1.foo();
```

输出：

```
testAdvice before...
testAspect before...
target1 foo
testAspect after...
testAdvice after...
```

可以看到是Advisor切面优先级更高先执行

对于 `@Aspect` 注解的切面可以使用 `@order` 注解或实现 `Ordered` 接口来指定排序值

对于 `@Bean` 方法 不支持 `@order` 注解，只能是实现 `Ordered` 接口

```java
@Aspect
@Order(0)
static class TestAspect{
	// ......
}

@Bean
public Advisor testAdvisor(Advice testAdvice) {
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* foo())");
    DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, testAdvice);
    //DefaultPointcutAdvisor 实现了 Ordered 注解
    advisor.setOrder(1);
    return advisor;
}
```

输出：

```
testAspect before...
testAdvice before...
target1 foo
testAdvice after...
testAspect after...
```





#### 代理创建时机

现有如下测试类：

```java
public class AutoProxyCreatorOccasionTest {

    static class Bean1 {

        public Bean1() {
            System.out.println("Bean1()");
        }

        @PostConstruct
        public void init() {
            System.out.println("Bean1 init");
        }

        public void foo() {
            System.out.println("bean1 foo");
        }
    }

    static class Bean2 {
        public Bean2() {
            System.out.println("Bean2()");
        }

        @Autowired
        public void setBean1(Bean1 bean1) {
            System.out.println("Autowired bean1：" + bean1.getClass());
        }


        @PostConstruct
        public void init() {
            System.out.println("Bean2 init");
        }
    }

    @Aspect
    static class TestAspect {
        @Before("execution(* foo())")
        public void before() {
            System.out.println("testAspect before...");
        }

        @After("execution(* foo())")
        public void after() {
            System.out.println("testAspect after...");
        }
    }

    public static void main(String[] args) {
        LoggingSystem.get(AutoProxyCreatorOccasionTest.class.getClassLoader())
                .setLogLevel("org.springframework.aop.aspectj", LogLevel.TRACE);
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean("testAspect", TestAspect.class);
        context.registerBean("bean1", Bean1.class);
        context.registerBean("bean2", Bean2.class);
        context.registerBean(ConfigurationClassPostProcessor.class);
        context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
        context.registerBean(CommonAnnotationBeanPostProcessor.class);
        context.registerBean(AnnotationAwareAspectJAutoProxyCreator.class);
        context.refresh();
        context.close();
    }

}
```

输出结果：

```
Bean1()
Bean1 init
[main] TRACE org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator - Creating implicit proxy for bean 'bean1' with 0 common interceptors and 3 specific interceptors
[main] DEBUG org.springframework.beans.factory.support.DefaultListableBeanFactory - Creating shared instance of singleton bean 'bean2'
Bean2()
Autowired bean1：class org.springframework.aop.framework.autoproxy.AutoProxyCreatorOccasionTest$Bean1$$EnhancerBySpringCGLIB$$23f27ea9
Bean2 init
```

从日志中可以看出代理对象是在初始化之后创建的

创建 ->  依赖注入 -> 初始化 -> 创建代理对象

如果是循环依赖呢，给Bean1也注入Bean2

```java
@Autowired
public void setBean2(Bean2 bean2){
    System.out.println("Autowired bean2：" + bean2.getClass());
}
```

日志输出：

```
Bean1()
[main] DEBUG org.springframework.beans.factory.support.DefaultListableBeanFactory - Creating shared instance of singleton bean 'bean2'
Bean2()
[main] TRACE org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator - Creating implicit proxy for bean 'bean1' with 0 common interceptors and 3 specific interceptors
Autowired bean1：class org.springframework.aop.framework.autoproxy.AutoProxyCreatorOccasionTest$Bean1$$EnhancerBySpringCGLIB$$b956a7ce
Bean2 init
Autowired bean2：class org.springframework.aop.framework.autoproxy.AutoProxyCreatorOccasionTest$Bean2
Bean1 init
```

1. 创建Bean1  -> 发现依赖Bean2
2.  创建Bean2 -> 发现依赖Bean1-> 创建Bean1代理对象然后注入 -> Bean2初始化
3.  Bean1依赖注入 -> Bean1初始化

总结：

- 无循环依赖时：在 Bean 初始化阶段之后创建；
- 有循环依赖时：在 Bean 实例化后、依赖注入之前创建，并将代理对象暂存于二级缓存。



Bean 的依赖注入阶段和初始化阶段不应该被增强，仍应被施加于原始对象



#### 高级切面转低级

spring在创建代理的时候会将高级切面转为低级切面，统一放到 `List<Advisor>` 集合中

高级切面中与通知类型相关的常用注解有 5 个：

- `@Before` ：前置通知
- `@AfterReturning` ：后置通知
- `@AfterThrowing` ：异常通知
- `@After` ：最终通知
- `@Around` ：环绕通知

下面是模拟解析 `@Before` 注解的代码：

```java
public class AspectConvertTest {

    @Aspect
    static class TestAspect {

        @Before("execution(* foo())")
        public void before() {
            System.out.println("testAspect before...");
        }

        @After("execution(* foo())")
        public void after() {
            System.out.println("testAspect after...");
        }

        @AfterReturning(value = "execution(* foo())")
        public void afterReturning() {
            System.out.println("afterReturning");
        }

        @AfterThrowing(value = "execution(* foo())")
        public void afterThrowing() {
            System.out.println("afterThrowing");
        }

        @Around(value = "execution(* foo())")
        public Object around(ProceedingJoinPoint pjp) throws Throwable {
            try {
                System.out.println("around...before");
                return pjp.proceed();
            } finally {
                System.out.println("around...after");
            }
        }
    }


    public static void main(String[] args) {
        List<Advisor> advisors = new ArrayList<>();
        //提供 Aspect切面实例 的工厂，就是用于获取标注@Aspect注解类的实例，后续反射调用切面中的方法
        AspectInstanceFactory factory = new SingletonAspectInstanceFactory(new TestAspect());
        for (Method method : TestAspect.class.getDeclaredMethods()) {
            Before before = method.getAnnotation(Before.class);
            if (before != null) {
                //转换切点
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(before.value());
                //创建通知，前置通知对应的通知类是 AspectJMethodBeforeAdvice
                AspectJMethodBeforeAdvice advice = new AspectJMethodBeforeAdvice(method, pointcut, factory);
                //创建切面
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            }
        }

        advisors.forEach(System.out::println);
    }
}
```



通知相关注解与原始通知类对应关系如下：

| 注解              | 对应的原始通知类              |
| ----------------- | ----------------------------- |
| `@Before`         | `AspectJMethodBeforeAdvice`   |
| `@AfterReturning` | `AspectJAfterReturningAdvice` |
| `@AfterThrowing`  | `AspectJAfterThrowingAdvice`  |
| `@After`          | `AspectJAfterAdvice`          |
| `@Around`         | `AspectJAroundAdvice`         |

​	

#### 统一转成环绕通知

通知相关注解都对应一个原始通知类，在 Spring 底层会将这些通知转换成环绕通知 MethodInterceptor。

如果原始通知类本就实现了 MethodInterceptor 接口，则无需转换。



| 原始通知类                    | 是否已实现MethodInterceptor |
| ----------------------------- | --------------------------- |
| `AspectJMethodBeforeAdvice`   | ❌                           |
| `AspectJAfterReturningAdvice` | ❌                           |
| `AspectJAfterThrowingAdvice`  | ✅                           |
| `AspectJAfterAdvice`          | ✅                           |
| `AspectJAroundAdvice`         | ✅                           |

使用 ProxyFactory 创建代理对象后，调用代理对象方法时会经过一系列通知方法（before/after/...）

```java
Advice advice = new MethodInterceptor() {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("before......");
        Object returnVal = invocation.proceed();
        System.out.println("after......");
        return returnVal;
    }
};
```

 项目中切面往往不止一个 `List<Advisor>` ，它们一个套一个地被调用，因此需要一个调用链对象，即 `MethodInvocation`

![image-20230824112737784](https://cdn.tencentfs.clboy.cn/images/image-20230824112737784.png)

由上图可知，环绕通知最适合作为 advice，而且这种调用方法是不是很像servlet中的过滤器调用 `chain.doFilter(req,res)`

这种设计就是责任链模式

而统一转换成环绕通知的形式，体现了设计模式中的适配器模式：

 `proxyFactory.getInterceptorsAndDynamicInterceptionAdvice()` 方法可将其他通知统一转换为 MethodInterceptor 环绕通知：

| 注解              | 原始通知类                    | 适配器                        | MethodInterceptor类型通知         |
| ----------------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `@Before`         | `AspectJMethodBeforeAdvice`   | `MethodBeforeAdviceAdapter`   | `MethodBeforeAdviceInterceptor`   |
| `@AfterReturning` | `AspectJAfterReturningAdvice` | `AspectJAfterReturningAdvice` | `AfterReturningAdviceInterceptor` |

我们将其他注解也转换成低级切面测试

```java
public class AspectConvertTest {

    // ...... 省略 TestAspect 代码
    
    static class Target {
        public void foo() {
            System.out.println("target foo");
        }
    }

    public static void main(String[] args) throws Exception {
        List<Advisor> advisors = new ArrayList<>();
        AspectInstanceFactory factory = new SingletonAspectInstanceFactory(new TestAspect());
        for (Method method : TestAspect.class.getDeclaredMethods()) {
            if (method.isAnnotationPresent(Before.class)) {
                Before before = method.getAnnotation(Before.class);
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(before.value());
                AspectJMethodBeforeAdvice advice = new AspectJMethodBeforeAdvice(method, pointcut, factory);
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            } else if (method.isAnnotationPresent(After.class)) {
                After after = method.getAnnotation(After.class);
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(after.value());
                AspectJAfterAdvice advice = new AspectJAfterAdvice(method, pointcut, factory);
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            } else if (method.isAnnotationPresent(AfterReturning.class)) {
                AfterReturning afterReturning = method.getAnnotation(AfterReturning.class);
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(afterReturning.value());
                AspectJAfterReturningAdvice advice = new AspectJAfterReturningAdvice(method, pointcut, factory);
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            } else if (method.isAnnotationPresent(AfterThrowing.class)) {
                AfterThrowing afterThrowing = method.getAnnotation(AfterThrowing.class);
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(afterThrowing.value());
                AspectJAfterThrowingAdvice advice = new AspectJAfterThrowingAdvice(method, pointcut, factory);
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            } else if (method.isAnnotationPresent(Around.class)) {
                Around around = method.getAnnotation(Around.class);
                AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
                pointcut.setExpression(around.value());
                AspectJAroundAdvice advice = new AspectJAroundAdvice(method, pointcut, factory);
                DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
                advisors.add(advisor);
            }

        }

        Target target = new Target();
        ProxyFactory proxyFactory = new ProxyFactory();
        proxyFactory.setTarget(target);
        proxyFactory.addAdvisors(advisors);
        Method method = Target.class.getMethod("foo");
        List<Object> advices = proxyFactory.getInterceptorsAndDynamicInterceptionAdvice(method, Target.class);
        advices.forEach(System.out::println);
    }
}
```

输出结果：

```
org.springframework.aop.aspectj.AspectJAfterAdvice: ......
org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@1e127982
org.springframework.aop.aspectj.AspectJAfterThrowingAdvice: ......
org.springframework.aop.aspectj.AspectJAroundAdvice: ......
org.springframework.aop.framework.adapter.AfterReturningAdviceInterceptor@60c6f5b
```

可以看到没有实现 `MethodInterceptor` 接口的通知类型被转换了

前置通知 `AspectJMethodBeforeAdvice` 被转换为 `MethodBeforeAdviceInterceptor`

后置通知 `AspectJAfterReturningAdvice`  被转换为 `AfterReturningAdviceInterceptor`

其他通知类型已经实现了 `MethodInterceptor` 接口保持不变



#### MethodInvocation

在环绕通知 `MethodInterceptor` 接口的 `invoke`  方法中，通知的调用链路是由 `MethodInvocation` 对象来完成的

这个调用链对象中存放了所有经过转换得到的环绕通知和目标方法。

MethodInvocation 是一个接口，其最根本的实现是 `ReflectiveMethodInvocation`

构建 ReflectiveMethodInvocation 对象需要 6 个参数：

- `proxy` ：代理对象
- `target` ：目标对象
- `method` ：目标对象中的方法对象
- `arguments` ：调用目标对象中的方法需要的参数
- `targetClass` ：目标对象的 Class 对象
- `interceptorsAndDynamicMethodMatchers` ：转换得到的环绕通知列表

由于 `ReflectiveMethodInvocation` 的构造方法是 `protected` ，我们创建一个类去继承它，方便测试

```java
static class ReflectiveMethodInvocationExt extends ReflectiveMethodInvocation{
    protected ReflectiveMethodInvocationExt(Object proxy, Object target, Method method, Object[] arguments, Class<?> targetClass, List<Object> interceptorsAndDynamicMethodMatchers) {
        super(proxy, target, method, arguments, targetClass, interceptorsAndDynamicMethodMatchers);
    }
}


public static void main(String[] args) throws Throwable {
    List<Advisor> advisors = new ArrayList<>();

    // ...... 

    Target target = new Target();
    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.setTarget(target);
    proxyFactory.addAdvisors(advisors);
    Method method = Target.class.getMethod("foo");
    Object proxy = proxyFactory.getProxy();
    List<Object> advices = proxyFactory.getInterceptorsAndDynamicInterceptionAdvice(method, Target.class);
    MethodInvocation invocation = new ReflectiveMethodInvocationExt(proxy, target, method, new Object[0], Target.class, advices);
    invocation.proceed();
}
```

运行代码后会抛出错误，错误信息如下：

```
Exception in thread "main" java.lang.IllegalStateException: No MethodInvocation found: Check that an AOP invocation is in progress and that the ExposeInvocationInterceptor is upfront in the interceptor chain. Specifically, note that advices with order HIGHEST_PRECEDENCE will execute before ExposeInvocationInterceptor! In addition, ExposeInvocationInterceptor and ExposeInvocationInterceptor.currentInvocation() must be invoked from the same thread.
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.currentInvocation(ExposeInvocationInterceptor.java:74)
	at org.springframework.aop.aspectj.AbstractAspectJAdvice.getJoinPointMatch(AbstractAspectJAdvice.java:658)
	at org.springframework.aop.aspectj.AspectJAfterAdvice.invoke(AspectJAfterAdvice.java:52)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
	at org.springframework.aop.framework.autoproxy.AspectConvertTest.main(AspectConvertTest.java:121)
```

错误是从 `ExposeInvocationInterceptor` 的 静态方法 `currentInvocation()` 方法中抛出来的

这个方法的内部就是从 `ThreadLocal` 中获取 `MethodInvocation`

结果获取到的是null就抛出异常了

翻看 `ExposeInvocationInterceptor` 源码，将 `MethodInvocation` 设置到 ThreadLocal 的方法是 `invoke(MethodInvocation mi)`

怎么看这个方法那么熟悉，仔细看它实现了 `MethodInterceptor` 接口，原来它也是一个环绕通知

直接将这个切面添加到切面集合的头部，让它最先执行，它就会把 `MethodInvocation` 放到 ThreadLocal 中

```java
Target target = new Target();
ProxyFactory proxyFactory = new ProxyFactory();
proxyFactory.setTarget(target);
proxyFactory.addAdvisors(ExposeInvocationInterceptor.ADVISOR);
proxyFactory.addAdvisors(advisors);
Method method = Target.class.getMethod("foo");
Object proxy = proxyFactory.getProxy();
List<Object> advices = proxyFactory.getInterceptorsAndDynamicInterceptionAdvice(method, Target.class);
```

再运行就不会报错了



#### 模拟实现调用链

```java
public class MockMethodInvocationTest {
    
    @RequiredArgsConstructor
    static class MockMethodInvocation implements MethodInvocation {
        private final Object target;
        private final Method method;
        private final Object[] args;
        private final List<MethodInterceptor> interceptors;
        private int currentIndex = 0;


        @Override
        public Method getMethod() {
            return method;
        }

        @Override
        public Object[] getArguments() {
            return args;
        }

        @Override
        public Object proceed() throws Throwable {
            if (currentIndex == interceptors.size()) {
                //执行目标方法
                return method.invoke(target, args);
            }
            // 逐一调用通知
            MethodInterceptor interceptor = interceptors.get(currentIndex++);
            // 递归操作交给通知类 invocation.proceed()
            return interceptor.invoke(this);
        }

        @Override
        public Object getThis() {
            return target;
        }

        @Override
        public AccessibleObject getStaticPart() {
            return method;
        }
    }

    public static void main(String[] args) throws Throwable {
        AspectConvertTest.Target target = new AspectConvertTest.Target();
        Method method = AspectConvertTest.Target.class.getMethod("foo");

        MethodInterceptor advice1 = invocation -> {
            System.out.println("advice1.before......");
            Object returnVal = invocation.proceed();
            System.out.println("advice1.after......");
            return returnVal;
        };

        MethodInterceptor advice2 = invocation -> {
            System.out.println("advice2.before......");
            Object returnVal = invocation.proceed();
            System.out.println("advice2.after......");
            return returnVal;
        };


        List<MethodInterceptor> interceptors = new ArrayList<>(2);
        interceptors.add(advice1);
        interceptors.add(advice2);
        MockMethodInvocation invocation = new MockMethodInvocation(target, method, args, interceptors);
        invocation.proceed();
    }

}
```



#### 动态通知调用

什么是动态通知？

就是指通知方法需要获取额外的参数，比如注解信息、目标方法参数信息

```java
public class DynamicAdviceTest {

    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @interface TestAnno {
        String value();
    }

    @Aspect
    static class TestAspect {

        /**
         * 静态通知
         */
        @Before(value = "execution(* foo(..))")
        public void before1() {
            System.out.println("before1......");
        }

        /**
         * 动态通知
         */
        @Before(value = "execution(* foo(..)) && args(age)")
        public void before2(int age) {
            System.out.println("before2......" + age);
        }

        /**
         * 动态通知
         */
        @After(value = "@annotation(anno)")
        public void after(TestAnno anno) {
            System.out.println("after......" + anno.value());
        }

    }

    static class TestTarget {

        @TestAnno(value = "666")
        public String foo(int age) {
            System.out.println("target.foo()，age：" + age);
            return "hello world";
        }
    }

    public static void main(String[] args) throws NoSuchMethodException {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean("testAspect", TestAspect.class);
        context.refresh();
        AnnotationAwareAspectJAutoProxyCreator creator = new AnnotationAwareAspectJAutoProxyCreator();
        creator.setBeanFactory(context.getBeanFactory());
        List<Advisor> advisors = creator.findEligibleAdvisors(TestTarget.class, "testTarget");

        TestTarget target = new TestTarget();
        ProxyFactory factory = new ProxyFactory();
        factory.setTarget(target);
        factory.addAdvisors(advisors);


        Method fooMethod = TestTarget.class.getMethod("foo", int.class);
        List<Object> advices = factory.getInterceptorsAndDynamicInterceptionAdvice(fooMethod, TestTarget.class);
        for (Object advice : advices) {
            System.out.println(advice);
        }

    }

}
```

运行代码，输出结果：

```
org.springframework.aop.interceptor.ExposeInvocationInterceptor@1725dc0f
org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@3911c2a7
org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher@4ac3c60d
org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher@4facf68f
```

第一个 ExposeInvocationInterceptor 对象是 Spring 添加的环绕通知，用于将 `MethodInterceptor` 放入 `ThreadLocal`

第二次 MethodBeforeAdviceInterceptor 对象是 `@Before` 注解正常转换后的低级切面

后两个 `InterceptorAndDynamicMethodMatcher` 从名称上，似乎是动态通知

```java
class InterceptorAndDynamicMethodMatcher {

	final MethodInterceptor interceptor;

	final MethodMatcher methodMatcher;

	public InterceptorAndDynamicMethodMatcher(MethodInterceptor interceptor, MethodMatcher methodMatcher) {
		this.interceptor = interceptor;
		this.methodMatcher = methodMatcher;
	}

}
```

但是这个类并没有实现 `MethodInterceptor` 而是在内部持有 `MethodInterceptor` 实例和一个 `MethodMatcher` 方法匹配器实例

在 [切点匹配](#切点匹配) 章节中讲过 `AspectJExpressionPointcut` 实现了 `MethodMatcher` 接口，最终这个 `MethodMatcher` 就是切点对象

`MethodMatcher` 中有两个匹配方法，之前我们用的都是静态方法匹配

```java
/**
 * 静态方法匹配
 */
boolean matches(Method method, Class<?> targetClass);

/**
 * 运行时动态方法匹配
 */
boolean matches(Method method, Class<?> targetClass, Object... args);
```

`ReflectiveMethodInvocation` 的 `proceed` 在代码中判断通知是否是 `InterceptorAndDynamicMethodMatcher` 类型

```java
public Object proceed() throws Throwable {
    if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
        return invokeJoinpoint();
    }

    Object interceptorOrInterceptionAdvice =
        this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
    if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
        InterceptorAndDynamicMethodMatcher dm =
            (InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
        Class<?> targetClass = (this.targetClass != null ? this.targetClass : this.method.getDeclaringClass());
        if (dm.methodMatcher.matches(this.method, targetClass, this.arguments)) {
            return dm.interceptor.invoke(this);
        }
        else {
            return proceed();
        }
    }
    else {
        return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
    }
}
```

?> 动态通知调用需要切点信息，需要对参数进行匹配和绑定，复杂程度高，性能比静态通知调用低。





