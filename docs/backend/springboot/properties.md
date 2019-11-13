### 配置文件

SpringBoot使用一个全局的配置文件，配置文件名`application`是固定的；

- application.properties
- application.yml
- application.yaml

配置文件的作用：修改SpringBoot自动配置的默认值；SpringBoot在底层都给我们自动配置好；



### YAML

YAML（YAML Ain't Markup Language）

​	YAML  A Markup Language：是一个标记语言

​	YAML   isn't Markup Language：不是一个标记语言；

标记语言：

​	以前的配置文件；大多都使用的是  **xxxx.xml**文件；

​	YAML：**以数据为中心**，比json、xml等更适合做配置文件；

#### YAML语法：

以`空格`的缩进来控制层级关系；只要是左对齐的一列数据，都是同一个层级的

次等级的前面是空格，不能使用制表符(tab) 

冒号之后如果有值，那么冒号和值之间至少有一个空格，不能紧贴着

##### 字面量：普通的值（数字，字符串，布尔）

`k: v`

字符串默认不用加上单引号或者双引号；

`""`：双引号；不会转义字符串里面的特殊字符；特殊字符会作为本身想表示的意思

?>  _eg：_ name:   "zhangsan \n lisi"：输出；zhangsan 换行  lisi

`''`：单引号；会转义特殊字符，特殊字符最终只是一个普通的字符串数据

?> _eg：_ name:   ‘zhangsan \n lisi’：输出；zhangsan \n  lisi

##### 对象、Map（属性和值）：

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



##### 数组（List、Set）

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



### 配置文件值注入

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

