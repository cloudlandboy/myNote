# 配置文件

SpringBoot使用一个全局的配置文件，配置文件名`application`是固定的；

- application.properties
- application.yml
- application.yaml

配置文件的作用：修改SpringBoot自动配置的默认值；SpringBoot在底层都给我们自动配置好；



## YAML

YAML（YAML Ain't Markup Language）

​	YAML  A Markup Language：是一个标记语言

​	YAML   isn't Markup Language：不是一个标记语言；

标记语言：

​	以前的配置文件；大多都使用的是  **xxxx.xml**文件；

​	YAML：**以数据为中心**，比json、xml等更适合做配置文件；

### YAML语法：

以`空格`的缩进来控制层级关系；只要是左对齐的一列数据，都是同一个层级的

次等级的前面是空格，不能使用制表符(tab) 

冒号之后如果有值，那么冒号和值之间至少有一个空格，不能紧贴着

### 字面量：普通的值（数字，字符串，布尔）

`k: v`

字符串默认不用加上单引号或者双引号；

`""`：双引号；不会转义字符串里面的特殊字符；特殊字符会作为本身想表示的意思

?>  _eg：_ name:   "zhangsan \n lisi"：输出；zhangsan 换行  lisi

`''`：单引号；会转义特殊字符，特殊字符最终只是一个普通的字符串数据

?> _eg：_ name:   ‘zhangsan \n lisi’：输出；zhangsan \n  lisi

### 对象、Map（属性和值）：

`k: v`在下一行来写对象的属性和值的关系；注意缩进

1. ```yaml
   person:
     name: 张三
     gender: 男
     age: 22
   ```

2. 行内写法

   ```yaml
   person: {name: 张三,gender: 男,age: 22}
   ```



### 数组（List、Set）

1. ```
   fruits: 
     - 苹果
     - 桃子
     - 香蕉
   ```

2. 行内写法

   ```
   fruits: [苹果,桃子,香蕉]
   ```



## 配置文件值注入

<details> 
<summary style="font-weight:bold;color:green">JavaBean：</summary>

```java
public class Pet {

    private String name;
    private Integer age;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Pets{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

}
```

```java
/**
 * @Author cloudlandboy
 * @Date 2019/11/13 下午8:06
 * @Since 1.0.0
 * 将配置文件中配置的每一个属性的值，映射到这个组件中
 *
 * ConfigurationProperties：告诉SpringBoot将本类中的所有属性和配置文件中相关的配置进行绑定；
 *      prefix = "person"：配置文件中哪个下面的所有属性进行一一映射
 * 只有这个组件是容器中的组件，才能容器提供的@ConfigurationProperties功能；
 */
@Component
@ConfigurationProperties(prefix = "person")
public class Person {
    private String name;
    private Character gender;
    private Integer age;
    private boolean boss;
    private Date birth;
    private Map<String,Object> maps;
    private List<Object> lists;
    private Pet pet;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Character getGender() {
        return gender;
    }

    public void setGender(Character gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public boolean isBoss() {
        return boss;
    }

    public void setBoss(boolean boss) {
        this.boss = boss;
    }

    public Date getBirth() {
        return birth;
    }

    public void setBirth(Date birth) {
        this.birth = birth;
    }

    public Map<String, Object> getMaps() {
        return maps;
    }

    public void setMaps(Map<String, Object> maps) {
        this.maps = maps;
    }

    public List<Object> getLists() {
        return lists;
    }

    public void setLists(List<Object> lists) {
        this.lists = lists;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", gender=" + gender +
                ", age=" + age +
                ", boss=" + boss +
                ", birth=" + birth +
                ", maps=" + maps +
                ", lists=" + lists +
                ", pet=" + pet +
                '}';
    }
}
```

提示：

![提示](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573648927366.png)

需要导入配置文件处理器，以后编写配置就有提示了

</details>

```xml
		<!--导入配置文件处理器，配置文件进行绑定就会有提示-->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-configuration-processor</artifactId>
			<optional>true</optional>
		</dependency>
```

**配置文件：**

```yaml
person:
  name: 张三
  gender: 男
  age: 36
  boss: true
  birth: 1982/10/1
  maps: {k1: v1,k2: v2}
  lists:
    - apple
    - peach
    - banana
  pet:
    name: 小狗
    age: 12

```



**测试**

``` java
package cn.clboy.helloworldquickstart;

import cn.clboy.helloworldquickstart.model.Person;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class HelloworldquickstartApplicationTests {

    @Autowired
    private Person person;

    @Test
    void contextLoads() {
        System.out.println(person);
    }

}

```



## properties

上面yaml对应的properties配置文件写法

```properties
person.name=李四
person.age=34
person.birth=1986/09/12
person.boss=true
person.gender=女
person.lists=cat,dog,pig
person.maps.k1=v1
person.maps.k2=v2
person.pet.name="小黑"
person.pet.age=10
```

!> 测试，发现中文会乱码，而且char类型还会抛出Failed to bind properties under 'person.gender' to java.lang.Character异常

### 中文乱码解决方法：

在设置中找到`File Encodings`，将配置文件字符集改为`UTF-8`，并勾选：
- [x] `Transparent native-to-ascii conversion`

![乱码解决](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573695616496.png)



!> yaml和properties配置文件同时存在，properties配置文件的内容会覆盖yaml配置文件的内容



## 配置文件值注入两种方式对比

配置文件值注入有两种方式，一个是Spring Boot的`@ConfigurationProperties`注解，另一个是spring原先的`@value`注解

|                      | @ConfigurationProperties | @Value     |
| -------------------- | ------------------------ | ---------- |
| 功能                 | 批量注入配置文件中的属性 | 一个个指定 |
| 松散绑定（松散语法） | 支持                     | 不支持     |
| SpEL                 | 不支持                   | 支持       |
| JSR303数据校验       | 支持                     | 不支持     |
| 复杂类型封装         | 支持                     | 不支持     |

**松散绑定**：例如Person中有`lastName`属性，在配置文件中可以写成

`lastName`或`lastname`或`last-name`或`last_name`等等

**SpEL**：

```
##　properties配置文件
persion.age=#{2019-1986+1}

# Person类
#--------------------使用@ConfigurationProperties注解，会抛出异常--------------------
@Component
@ConfigurationProperties(prefix = "person")
public class Person {
    private Integer age;
    
    
#--------------------使用@value注解 OK--------------------
@Component
public class Person {
    @Value("${person.age}")
    private Integer age;
```



**JSR303数据校验**

`@ConfigurationProperties`支持校验，如果校验不通过，会抛出异常

![数据校验](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573716216690.png)

`@value`注解不支持数据校验

![数据校验](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573716427494.png)



**复杂类型封装**

`@value`注解无法注入map等对象的复杂类型，但`list、数组可以`

![1573716770263](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573716770263.png)



## @PropertySource

`@PropertySource`注解的作用是加载指定的配置文件，值可以是数组，也就是可以加载多个配置文件

springboot默认加载的配置文件名是`application`，如果配置文件名不是这个是不会被容器加载的，所以这里Person并没有被注入任何属性值

![1573718577827](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573718577827.png)

使用`@PropertySource({"classpath:person.properties"})`指定加载`person.properties`配置文件

![1573718679208](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573718679208.png)



## @ImportResource

`@ImportResource`注解用于导入Spring的配置文件，让配置文件里面的内容生效；(就是以前写的springmvc.xml、applicationContext.xml)

Spring Boot里面没有Spring的配置文件，我们自己编写的配置文件，也不能自动识别；

![1573719440710](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573719440710.png)



想让Spring的配置文件生效，加载进来；@**ImportResource**标注在一个配置类上

![1573720006428](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573720006428.png)

!> 注意！这个注解是放在主入口函数的类上，而不是测试类上



## @Configuration

SpringBoot推荐给容器中添加组件的方式；推荐使用全注解的方式

配置类**@Configuration**  ---equals--->	Spring配置文件

### @Bean

使用**@Bean**给容器中添加组件

```java
package cn.clboy.helloworldquickstart.config;

import cn.clboy.helloworldquickstart.model.Pet;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Author cloudlandboy
 * @Date 2019/11/14 下午4:33
 * @Since 1.0.0
 *
 * Configuration：指明当前类是一个配置类；就是来替代之前的Spring配置文件
 */


@Configuration
public class BeanConfiguration {

    /**
     *相当于在配置文件中用<bean><bean/>标签添加组件
     */
    @Bean
    public Pet myPet() {
        Pet pet = new Pet();
        pet.setName("嘟嘟");
        pet.setAge(3);
        return pet;
    }
}
```



## 配置文件占位符

**随机**

```
${random.value}
${random.int}
${random.long}
${random.int(10)}
${random.int[1024,65536]}
```



![1573721695426](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573721695426.png)



可以引用在配置文件中配置的其他属性的值，如果使用一个没有在配置文件中的属性，则会原样输出

![1573722018302](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573722018302.png)

可以使用`:`指定默认值

![1573722098119](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573722098119.png)



## Profile

Profile是Spring对不同环境提供不同配置功能的支持，可以通过激活、指定参数等方式快速切换环境

### 多profile文件形式

文件名格式：application-{profile}.properties/yml，例如：

- application-dev.properties
- application-prod.properties

![1573723830627](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573723830627.png)

程序启动时会默认加载`application.properties`，启动的端口就是8080

可以在主配置文件中指定激活哪个配置文件

![1573724084979](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573724084979.png)



### yml支持多文档块方式

每个文档块使用`---`分割

```yaml
server:
  port: 8080
spring:
  profiles:
    active: prod
---
server:
  port: 8081
spring:
  profiles: dev
---
server:
  port: 8082
spring:
  profiles: prod
```

![1573724588671](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573724588671.png)



### 激活指定profile的三种方式

1. 在配置文件中指定  spring.profiles.active=dev（如上）

2. 项目打包后在命令行启动

   ```shell
   java -jar xxx.jar --spring.profiles.active=dev；
   ```

   ![1573724952868](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573724952868.png)

3. 虚拟机参数

   ```
   -Dspring.profiles.active=dev
   ```

   ![1573725631649](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573725631649.png)





## 配置文件加载位置

springboot 启动会扫描以下位置的application.properties或者application.yml文件作为Spring boot的默认配置文件

<pre>

file: ./config/

​	file: ./

​		classpath: /config/

​			classpath: /		-->first load ↑

</pre>

优先级由高到底，高优先级的配置会覆盖低优先级的配置（优先级低的先加载）；

SpringBoot会从这四个位置全部加载主配置文件；**互补配置**；

![1573728449451](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573728449451.png)



!> 这里项目根路径下的配置文件maven编译时不会打包过去，需要修改pom

```xml
        <resources>
            <resource>
                <directory>.</directory>
                <filtering>true</filtering>
                <includes>
                    <include>**/*.properties</include>
                    <include>**/*.yaml</include>
                </includes>
            </resource>
        </resources>
```





> 我们还可以通过`spring.config.location`来改变默认的配置文件位置
>
> **项目打包好以后，我们可以使用命令行参数的形式，启动项目的时候来指定配置文件的新位置；指定配置文件和默认加载的这些配置文件共同起作用形成互补配置；**
>
> ```
> java -jar xxx.jar --spring.config.location=/home/cloudlandboy/application.yaml
> ```
>
> 



## 外部配置加载顺序

**SpringBoot也可以从以下位置加载配置； 优先级从高到低；高优先级的配置覆盖低优先级的配置，所有的配置会形成互补配置**

1. **命令行参数**  :point_up_2:

   所有的配置都可以在命令行上进行指定

   ```
   java -jar xxx.jar --server.port=8087  --server.context-path=/abc
   ```

   多个配置用空格分开； --配置项=值

2. 来自java:comp/env的JNDI属性 ⤴️

3. Java系统属性（System.getProperties()） ⤴️

4. 操作系统环境变量 ⤴️

5. RandomValuePropertySource配置的random.*属性值 ⤴️

<mark>**由jar包外向jar包内进行寻找；**<mark>

<mark>**再来加载不带profile**</mark>

6. **jar包外部的`application.properties`或`application.yml`(不带spring.profile)配置文件** ⤴️
7. **jar包内部的`application.properties`或`application.yml`(不带spring.profile)配置文件 ⤴️

<mark>**优先加载带profile**</mark>

8. **jar包外部的`application-{profile}.properties`或`application.yml`(带spring.profile)配置文件 ⤴️
9. **jar包内部的`application-{profile}.properties`或`application.yml`(带spring.profile)配置文件 ⤴️



10. @Configuration注解类上的@PropertySource ⤴️
11. 通过SpringApplication.setDefaultProperties指定的默认属性 ⤴️

所有支持的配置加载来源：

[参考官方文档](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/htmlsingle/#boot-features-external-config)

![1573735371567](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1573735371567.png)