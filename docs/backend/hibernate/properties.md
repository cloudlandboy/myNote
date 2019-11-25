# Hibernate配置文件

## 主配置文件

`hibernate.cfg.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
	"-//Hibernate/Hibernate Configuration DTD 3.0//EN"
	"http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">

<hibernate-configuration>
	<session-factory>
		<!-- 
			hibernate下载文件\project\etc可查看
			
			#hibernate.dialect org.hibernate.dialect.MySQLDialect
			#hibernate.dialect org.hibernate.dialect.MySQLInnoDBDialect
			#hibernate.dialect org.hibernate.dialect.MySQLMyISAMDialect
			#hibernate.connection.driver_class com.mysql.jdbc.Driver
			#hibernate.connection.url jdbc:mysql:///test
			#hibernate.connection.username gavin
			#hibernate.connection.password 
		-->
		<property name="hibernate.connection.driver_class">com.mysql.jdbc.Driver</property>
		<property name="hibernate.connection.url">jdbc:mysql:///hibernate</property>
		<property name="hibernate.connection.username">root</property>
		<property name="hibernate.connection.password">root</property>
		
		<!-- 数据库方言
			不同的数据库中,sql语法略有区别. 指定方言可以让hibernate框架在生成sql语句时.针对数据库的方言生成.
			sql99标准: DDL 定义语言  库表的增删改查
					   DCL 控制语言  事务 权限
					   DML 操纵语言  增删改查
			注意: MYSQL在选择方言时,请选择最短的方言.
		 -->
		<property name="hibernate.dialect">org.hibernate.dialect.MySQLDialect</property>
		
		<!-- 
			#hibernate.show_sql true 把自动生成的sql语句打印在控制台
			#hibernate.format_sql true 格式化sql语句不然都在一行 
		-->
		<property name="hibernate.show_sql">true</property>
		<property name="hibernate.format_sql">true</property>
		
		<!-- 
			## auto schema export  自动导出表结构. 自动建表
			#hibernate.hbm2ddl.auto create		自动建表.每次框架运行都会创建新的表.以前表将会被覆盖,表数据会丢失.(开发环境中测试使用)
			#hibernate.hbm2ddl.auto create-drop 自动建表.每次框架运行结束都会将所有表删除.(开发环境中测试使用)
			#hibernate.hbm2ddl.auto update(推荐使用) 自动生成表.如果已经存在不会再生成.如果表有变动.自动更新表(不会删除任何数据).表中没有的字段会自动添加
			#hibernate.hbm2ddl.auto validate	校验.不自动生成表.每次启动会校验数据库中表是否正确.校验失败.
		 -->
		 <property name="hibernate.hbm2ddl.auto">update</property>
        
        <!-- 
		specify a JDBC isolation level 		设置事物级别
		hibernate.connection.isolation 4	1，2，4，8   eg:0000
		 -->
		<property name="hibernate.connection.isolation">4</property>
		
		<!--配置session与threadLocal绑定 		 注：还有其他方式-->
		<property name="hibernate.current_session_context_class">thread</property>
		 
		 <!-- 
		 	引入orm元数据
			路径书写: 填写src下的路径 相对于src
		 -->
		 <mapping resource="club/zzrfdsnsyl/domain/Customer.hbm.xml"/>
		
	</session-factory>
</hibernate-configuration>
```



## 实体类映射文件

实体类

- 提供一个**无参数** public访问控制符的构造器
- 提供一个**标识属性**，映射数据表主键字段，提供id
- 所有属性提供public访问控制符的 set  get 方法(javaBean)
- 标识属性应尽量使用**基本数据类型的包装类型**
- **不要用final修饰实体** （将无法生成代理对象进行优化）



### 主键

-  Java按**地址区**分同一个类的不同对象.l
- 关系数据库用**主键区分同一条**记录l
- Hibernate使用OID来建立内存中的对象和数据库中记录的对应关系结论: **对象的OID和数据库的表的主键对应。**
- 为保证OID的唯一性，应该让**Hibernate来为OID赋值**



- 主键需要具备: **不为空/不能重复/不能改变**		
- 自然主键:	在业务中,某个属性符合主键的三个要求.那么该属性可以作为主键列.【例如：**登录名可以是自然主键**】
- 代理主键: 	在业务中,不存符合以上3个条件的属性,那么就增加一个没有意义的列.作为主键.



- 基本数据类型和包装类型对应hibernate的映射类型相同l
- 基本类型无法表达null、数字类型的默认值为0。
- 包装类默认值是null。当对于默认值有业务意义的时候需要使用包装类。



`xxx.hbm.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    
    <!-- package代表class中配置的类所在的包名，可以不写但class中就要写全路径 -->
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    	<!-- 
    		class元素配置实体与表的对应关系
    		name代表实体类名 
    		table代表数据库中的表名
    		catalog代表数据库名称(可选)
    	 -->
    	<class name="Customer" table="cst_customer">
    		<!-- 
    		id配置主键映射关系(表中的主键)
    		name代表实体中的属性
    		column代表表中的列名
    		column(默认实体属性名) type(内部判断,java/hibernate/sql 如:java.lang.String/string/varchar) length(所用数据库最大长度) 均可省略 
    		-->
    		<id name="cust_id" column="cust_id">
                <!-- 
					主键生成策略
	    			identity：主键自增，由数据库维护 不需手动设置主键
	    			sequence：Oracle的主键生成策略
	    			increment：主键自增 由hibernate维护 插入时先去查询最大值再+1
	    			hilo：高低位算法，主键自增 有hibernate维护 开发时不使用
	    			native：hilo+sequence+identity 自动三选一
	    			uuid：产生长度为32的唯一字符串作为主键 主键类型必须是String
	    			assigend：自然主键生成策略 就是自己设置
    			 -->
    			<generator class="native"></generator>
    		</id>
            
    		<!-- 除id(主键)外普通属性 not-null：该列不能为空 -->
    		<property name="cust_name" column="cust_name" type="java.lang.String" length="32" not-null="true"></property>
            
    		<property name="cust_source" column="cust_source" type="java.lang.String" length="32"></property>
            
    		<property name="cust_industry" column="cust_industry" type="java.lang.String" length="32"></property>
            
    		<property name="cust_level" column="cust_level" type="java.lang.String" length="32"></property>
            
    		<property name="cust_linkman" column="cust_linkman" type="java.lang.String" length="64"></property>
            
    		<property name="cust_phone" column="cust_phone" type="java.lang.String" length="64"></property>
            
    		<property name="cust_mobile" column="cust_mobile" type="java.lang.String" length="16"></property>
            
    	</class>
    </hibernate-mapping>
```



**class标签属性：**

dynamic-insert="true/false" 是否动态生成插入语句,**如果属性字段为空，就不会有该字段的插入语句**

dynamic-update="true/false" 同上



## API

```java
package club.zzrfdsnsyl.hibernateAPI;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

import club.zzrfdsnsyl.domain.Customer;

public class A_api {

	public static void main(String[] args) {
		// 1.创建加载配置文件的对象
		Configuration config = new Configuration();
        
		// 2.加载配置文件 默认找src下的hibernate.cfg.xml
		config.configure();
//		config.addResource("");				
//		config.addClass(persistentClass)
        
		//3.根据配置文件创建SessionFactory对象
		SessionFactory sessionFactory=config.buildSessionFactory();
        
		//4.获取一个新的session对象（连接数据库对象）
		Session session = sessionFactory.openSession();
		//Session session= sessionFactory.getCurrentSession(); 获取当前线程绑定的session,需要在配置文件中配置
        
		//5.获取事物对象
		Transaction transaction = session.getTransaction();
        
		//6.开启事物
		transaction.begin();
        
		//7.创建实体对象
		Customer customer=new Customer();
//		customer.setCust_id(1000L); ---目前好像没有 应该是配置文件中的那个没讲的标签问题
		customer.setCust_industry("电脑厂商");
		customer.setCust_level("VIP");
		customer.setCust_linkman("赵麻子");
		customer.setCust_mobile("17533214759");
		customer.setCust_name("华硕");
		customer.setCust_phone("7845-84564847");
		customer.setCust_source("互联网");
		//8.保存--执行sql
		session.save(customer);
        
		//9.[回滚事物]
		//transaction.rollback();
        
		//10.提交事物
		transaction.commit(); 
        
		//11.关闭session连接
		session.close();
        
		//12.关闭工厂
		sessionFactory.close();
		
	}
}

```



## 简单的增删改查

``` java
package club.zzrfdsnsyl.hibernateAPI;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.domain.Customer;

/**
 * hibernate的增删改查
 * @author SYL
 *
 */
public class B_api {
	Session session = HmUtil.openSession();
	@Test
	public void save() {
		Customer customer=new Customer();
		customer.setCust_industry("电脑厂商");
		customer.setCust_level("VIP");
		customer.setCust_linkman("lucy");
		customer.setCust_mobile("17598754589");
		customer.setCust_name("tonny");
		customer.setCust_phone("7845-84564847");
		customer.setCust_source("互联网");
		session.save(customer);
		session.close();
	}
	@Test
	public void get() {
		Customer customer = session.get(Customer.class, 1L);
		System.out.println(customer);
		session.close();
	}
	
	@Test
	/**
	 * 必须开启事物
	 */
	public void update() {
		//先获取要修改的对象
//		Transaction t = session.beginTransaction();
		Customer customer = session.get(Customer.class, 10L);
		customer.setCust_name("李雷");
		customer.setCust_linkman("韩梅梅");
		session.update(customer);
//		t.commit();
		session.close();
	}
	@Test
	/**
	 * 必须开启事物
	 */
	public void delete() {
		//先获取要删除的对象
		Transaction t = session.beginTransaction();
		Customer customer = session.get(Customer.class, 3L);
		session.delete(customer);
		t.commit();
		session.close();
	}
	
}

```



## 数据类型

| Java数据类型                       | Hibernate数据类型 | 标准SQL数据类型 (PS:对于不同的DB可能有所差异) |
| ---------------------------------- | ----------------- | --------------------------------------------- |
| byte、java.lang.Byte               | byte              | TINYINT                                       |
| short、java.lang.Short             | short             | SMALLINT                                      |
| int、java.lang.Integer             | integer           | INGEGER                                       |
| long、java.lang.Long               | long              | BIGINT                                        |
| float、java.lang.Float             | float             | FLOAT                                         |
| double、java.lang.Double           | double            | DOUBLE                                        |
| java.math.BigDecimal               | big_decimal       | NUMERIC                                       |
| char、java.lang.Character          | character         | CHAR(1)                                       |
| boolean、java.lang.Boolean         | boolean           | BIT                                           |
| java.lang.String                   | string            | VARCHAR                                       |
| boolean、java.lang.Boolean         | yes_no            | CHAR(1)('Y'或'N')                             |
| boolean、java.lang.Boolean         | true_false        | CHAR(1)('Y'或'N')                             |
| java.util.Date、java.sql.Date      | date              | DATE                                          |
| java.util.Date、java.sql.Time      | time              | TIME                                          |
| java.util.Date、java.sql.Timestamp | timestamp         | TIMESTAMP                                     |
| java.util.Calendar                 | calendar          | TIMESTAMP                                     |
| java.util.Calendar                 | calendar_date     | DATE                                          |
| byte[]                             | binary            | VARBINARY、BLOB                               |
| java.lang.String                   | text              | CLOB                                          |
| java.io.Serializable               | serializable      | VARBINARY、BLOB                               |
| java.sql.Clob                      | clob              | CLOB                                          |
| java.sql.Blob                      | blob              | BLOB                                          |
| java.lang.Class                    | class             | VARCHAR                                       |
| java.util.Locale                   | locale            | VARCHAR                                       |
| java.util.TimeZone                 | timezone          | VARCHAR                                       |
| java.util.Currency                 | currency          | VARCHAR                                       |