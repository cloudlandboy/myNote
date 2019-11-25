# SpringBoot整合Mybatis

## 引入依赖

```xml
<dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.1</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.20</version>
        </dependency>
    </dependencies>
```

依赖关系

![1574423628318](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574423628318.png)



## 项目构建

1. 在resources下创建`department.sql`和`employee.sql`，项目启动时创建表

   ```sql
   DROP TABLE IF EXISTS `department`;
   CREATE TABLE `department` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `departmentName` varchar(255) DEFAULT NULL,
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
   ```

   ```sql
   DROP TABLE IF EXISTS `employee`;
   CREATE TABLE `employee` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `lastName` varchar(255) DEFAULT NULL,
     `email` varchar(255) DEFAULT NULL,
     `gender` int(2) DEFAULT NULL,
     `d_id` int(11) DEFAULT NULL,
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
   
   ```

2. 实体类

   <details>

   <summary>Department</summary>

   ```java
   public class Department implements Serializable {
       Integer id;
       String departmentName;
   
       public Integer getId() {
           return id;
       }
   
       public void setId(Integer id) {
           this.id = id;
       }
   
       public String getDepartmentName() {
           return departmentName;
       }
   
       public void setDepartmentName(String departmentName) {
           this.departmentName = departmentName;
       }
   }
   ```

   </details>

   <details>

   <summary>Employee</summary>

   ```java
   public class Employee {
       Integer id;
       String lastName;
       String email;
       Integer gender;
       Integer d_id;
   
       public Integer getId() {
           return id;
       }
   
       public void setId(Integer id) {
           this.id = id;
       }
   
       public String getLastName() {
           return lastName;
       }
   
       public void setLastName(String lastName) {
           this.lastName = lastName;
       }
   
       public String getEmail() {
           return email;
       }
   
       public void setEmail(String email) {
           this.email = email;
       }
   
       public Integer getGender() {
           return gender;
       }
   
       public void setGender(Integer gender) {
           this.gender = gender;
       }
   
       public Integer getD_id() {
           return d_id;
       }
   
       public void setD_id(Integer d_id) {
           this.d_id = d_id;
       }
   }
   ```

   </details>

   

3. 配置文件

   ```yaml
   spring:
     datasource:
       username: root
       password: root
       url: jdbc:mysql://172.16.145.137:3306/springboot
       driver-class-name: com.mysql.cj.jdbc.Driver
       initialization-mode: always
       type: com.alibaba.druid.pool.DruidDataSource
       druid:
         # 连接池配置
         # 配置初始化大小、最小、最大
         initial-size: 1
         min-idle: 1
         max-active: 20
         # 配置获取连接等待超时的时间
         max-wait: 3000
         validation-query: SELECT 1 FROM DUAL
         test-on-borrow: false
         test-on-return: false
         test-while-idle: true
         pool-prepared-statements: true
         time-between-eviction-runs-millis: 60000
         min-evictable-idle-time-millis: 300000
         filters: stat,wall,slf4j
         # 配置web监控,默认配置也和下面相同(除用户名密码，enabled默认false外)，其他可以不配
         web-stat-filter:
           enabled: true
           url-pattern: /*
           exclusions: "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*"
         stat-view-servlet:
           enabled: true
           url-pattern: /druid/*
           login-username: admin
           login-password: root
           allow: 127.0.0.1
       schema:
         - classpath:department.sql
         - classpath:employee.sql
   ```

## Mybatis增删改查

1. 创建mapper接口

   ```java
   @Mapper
   public interface DepartmentMapper {
   
       @Select("select * from department")
       public List<Department> selectAll();
   
       @Select("select * from department where id=#{id}")
       public Department selectById(Integer id);
   
       @Options(useGeneratedKeys = true, keyProperty = "id")
       @Insert("insert into department(departmentName) values(#{departmentName})")
       public int save(Department department);
   
       @Update("update department set departmentName=#{departmentName}")
       public int update(Department department);
   
       @Delete("delete from department where id =#{id}")
       public int delete(Integer id);
   }
   ```

2. 创建Controller

   ```java
   @RestController
   public class DepartmentController {
   
       @Autowired
       private DepartmentMapper departmentMapper;
   
       @RequestMapping("/dep/{id}")
       public List<Department> getDepById(@PathVariable Integer id) {
           return departmentMapper.selectAll();
       }
   
       @RequestMapping("/dep")
       public Department getDepById(Department department) {
           departmentMapper.save(department);
           return department;
       }
   }
   ```

   

3. 访问：<http://localhost:8080/dep?departmentName=PeppaPig> 添加一条数据

   访问：<http://localhost:8080/dep/1>获取数据

## Mybatis配置

### 开启驼峰命名法

我们的实体类和表中的列名一致，一点问题也没有

我们把department表的departmentName列名改为department-name看看会发生什么

访问：<http://localhost:8080/dep/1>获取数据

```
[{"id":1,"departmentName":null}]
```

由于列表和属性名不一致，所以就没有封装进去，我们表中的列名和实体类属性名都是遵循驼峰命名规则的，可以开启mybatis的开启驼峰命名配置

```yaml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

然后重启项目，重新插入数据，再查询就发现可以封装进去了

也可以通过向spring容器中注入`org.mybatis.spring.boot.autoconfigure.ConfigurationCustomizer`的方法设置mybatis参数

```JAVA
@Configuration
public class MybatisConfig {

    @Bean
    public ConfigurationCustomizer mybatisConfigurationCustomizer() {
        return new ConfigurationCustomizer() {
            @Override
            public void customize(org.apache.ibatis.session.Configuration configuration) {
                configuration.setMapUnderscoreToCamelCase(true);
            }
        };
    }
}
```



![1574430056512](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574430056512.png)

![1574430280791](https://cdn.static.note.zzrfdsn.cn/images/springboot/assets/1574430280791.png)

## Mapper扫描

使用`@mapper注解`的类可以被扫描到容器中，但是每个Mapper都要加上这个注解就是一个繁琐的工作，能不能直接扫描某个包下的所有Mapper接口呢，当然可以，在springboot启动类上加上`@MapperScan`

```java
@MapperScan("cn.clboy.springbootmybatis.mapper")
@SpringBootApplication
public class SpringbootMybatisApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootMybatisApplication.class, args);
    }

}
```

## 使用xml配置文件

1. 创建mybatis全局配置文件

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
   <configuration>
       <typeAliases>
           <package name="cn.clboy.springbootmybatis.model"/>
       </typeAliases>
   </configuration>
   ```

2. 创建EmployeeMapper接口

   ```java
   public interface EmployeeMapper {
   
       List<Employee> selectAll();
   
       int save(Employee employee);
   }
   ```

3. 创建EmployeeMapper.xml映射文件

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
   <mapper namespace="cn.clboy.springbootmybatis.mapper.EmployeeMapper">
       <select id="selectAll" resultType="employee">
           SELECT * FROM employee
       </select>
       <insert id="save" parameterType="employee" useGeneratedKeys="true" keyProperty="id">
          INSERT INTO employee(lastName,email,gender,d_id) VALUES (#{lastName},#{email},#{gender},#{d_id})
       </insert>
   </mapper>
   ```

4. 配置文件(application.yaml)中指定配置文件和映射文件的位置

   ```yaml
   mybatis:
     config-location: classpath:mybatis/mybatis-config.xml
     mapper-locations: classpath:mybatis/mapper/*.xml
   ```

5. 给表中插入两个数据，用于测试

   ```sql
    INSERT INTO employee(lastName,email,gender,d_id) VALUES ('张三','123456@qq.com',1,1);
    INSERT INTO employee(lastName,email,gender,d_id) VALUES ('lisi','245612@qq.com',1,1);
   ```

6. 创建EmployeeController

   ```java
   @RestController
   public class EmployeeController {
   
       @Autowired
       private EmployeeMapper employeeMapper;
   
       @RequestMapping("/emp/list")
       public List<Employee> getALl() {
           return employeeMapper.selectAll();
       }
   
       @RequestMapping("/emp/{id}")
       public Employee save(Employee employee) {
           employeeMapper.save(employee);
           return employee;
       }
   }
   ```

   访问：<http://localhost:8080/emp/list>

