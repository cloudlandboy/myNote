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

