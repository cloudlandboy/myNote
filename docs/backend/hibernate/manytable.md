# Hibernate的多表关联关系映射

一对多：主表的主键 与 从表外键 形成 **主外键关系**

多对多：提供**中间表**（从表），提供2个字段（外键）分别对应两个主表。

一对一: **主外键关系**



## 一对多，多对一

例：客户(`Customer`)和联系人(`LinkMan`)

一个客户对应多个联系人

`Customer`实体类添加`LinkMan`的集合

```java
	//表达一对多关系
	private Set<LinkMan> linkMans=new HashSet<LinkMan>();
```



`Customer`映射文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    	<class name="Customer">
    		<id name="cust_id">
    			<generator class="native"></generator>
    		</id>
    		<property name="cust_name"></property>
    		<property name="cust_source"></property>
    		<property name="cust_industry"></property>
    		<property name="cust_level"></property>
    		<property name="cust_linkman"></property>
    		<property name="cust_phone"></property>
    		<property name="cust_mobile"></property>
    		<!-- 
    			配置关联
    			set：集合类型
    			name：属性名称
    			inverse属性: 配置关系是否维护. 
		  		true: customer不维护关系
		  		false(默认值): customer维护关系
    			inverse属性: 性能优化.提高关系维护的性能.
		  		原则: 无论怎么放弃,总有一方必须要维护关系.
		  		一对多关系中: 一的一方放弃.也只能一的一方放弃.多的一方不能放弃.
    		 -->
    		<!-- 
    			column:多的一方的外键名(也就是本表的主键)
    			
    		-->
    		 <!--
   				一对多
   				class:多的一方的类名
    		-->
    		<set name="linkMans">
    			<key column="lkm_cust_id"></key>
    			<one-to-many class="LinkMan"/>
    		</set>
    	</class>
    </hibernate-mapping>
```



`LinkMan`实体类添加`Customer`类型的属性

```java
	//表达多对一关系
	private Customer customer ;
```



LinkMan实体映射文件

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    	<class name="LinkMan" table="linkman">
    		<id name="lkm_id">
    			<generator class="native"></generator>
    		</id>
    		<property name="lkm_gender"></property>
    		<property name="lkm_name"></property>
    		<property name="lkm_phone"></property>
    		<property name="lkm_email"></property>
    		<property name="lkm_qq"></property>
    		<property name="lkm_mobile"></property>
    		<property name="lkm_memo"></property>
    		<property name="lkm_position"></property>
    		<!--
    			配置关联 
    			name:一的一方的属性名
    			class:一的一方的类路径
    			column：外键名
    		 -->
   		   <!-- 
		 		级联操作:	cascade
		 		save-update: 级联保存更新
		 		delete:级联删除
		 		all:save-update+delete
		 		级联操作: 简化操作.目的就是为了少些两行代码.
		  	-->
    		<many-to-one cascade="save-update" name="customer" class="Customer" column="lkm_cust_id">
    		</many-to-one>
    	</class>
    </hibernate-mapping>
```



```java
	@Test
	/**
	 * 	添加客户与联系人
	 */
	public void t1() {
		Transaction transaction = session.beginTransaction();
		Customer customer=new Customer();
		customer.setCust_name("阿里巴巴");
		
		LinkMan linkMan01=new LinkMan();
		linkMan01.setLkm_name("利达");
		linkMan01.setCustomer(customer);
		
		LinkMan linkMan02=new LinkMan();
		linkMan02.setLkm_name("大卫王");
		linkMan02.setCustomer(customer);
		
		customer.getLinkMans().add(linkMan01);
		customer.getLinkMans().add(linkMan02);
		
		session.save(customer);
		session.save(linkMan01);
		session.save(linkMan02);
		
		transaction.commit();
	}
	
```



## 设置外键维护的方式

修改Customer的配置文件，**添加一个inverse选项**

inverse是hibernate双向关系中的基本概念。

inverse的真正作用就是指定由哪一方来维护之间的关联关系。当一方中指定了“inverse=false”（默认），那么那一方就有责任负责之间的关联关系。



## cascade级联

级联保存,级联修改. 保存`Customer`(客户)时,同时保存`LinkMan`(联系人)

或者保存`LinkMan`(联系人)时,同时保存`Customer`(客户)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    	<class name="LinkMan" table="linkman">
            
           ......
            
   		   <!-- 
		 		级联操作:	cascade
		 		save-update: 级联保存更新
		 		delete:级联删除
		 		all:save-update+delete
				delete-orphan:删除所有和当前对象解除关联关系的对象
				all-delete-orphan: 
					在解除父子关系时,自动删除不属于父对象的子对象, 也支持级联删除和级联保存更新.

		 		级联操作: 简化操作.目的就是为了少些两行代码.
		  	-->
    		<many-to-one cascade="save-update" name="customer" class="Customer" column="lkm_cust_id">
    		</many-to-one>
    	</class>
    </hibernate-mapping>
```



```java
	public void t2() {
		Transaction transaction = session.beginTransaction();
		Customer customer=new Customer();
		customer.setCust_name("海尔");
		
		LinkMan linkMan01=new LinkMan();
		linkMan01.setLkm_name("的撒达");
		linkMan01.setCustomer(customer);
		
		LinkMan linkMan02=new LinkMan();
		linkMan02.setLkm_name("大蒜");
		linkMan02.setCustomer(customer);
		
		customer.getLinkMans().add(linkMan01);
		customer.getLinkMans().add(linkMan02);
		
//		session.save(customer); 设置了级联会自动保存
		session.save(linkMan01);
		session.save(linkMan02);
		
		transaction.commit();
	}
	
```



## 多对多

User(用户)和`Role`(角色)，中间表`sys_user_role`

User实体类

``` java
	//表达多对多
	private Set<Role> roles = new HashSet<Role>();
```

User实体类映射文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    
    	<class name="User" table="sys_user">
    		<id name="user_id">
    			<generator class="native"></generator>
    		</id>
    		<property name="user_code"></property>
    		<property name="user_name"></property>
    		<property name="user_password"></property>
    		<property name="user_state"></property>
    		<set name="roles" table="sys_user_role" cascade="save-update">
    			<key column="user_id"></key>
    			<many-to-many class="Role" column="role_id"></many-to-many>
    		</set>
    	</class>
    </hibernate-mapping>
```

Role实体类

``` java
	//表达多对多
	private Set<User> users = new HashSet<User>();
```

Role实体类映射文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping package="club.zzrfdsnsyl.domain">
    	<class name="Role" table="sys_role">
    		<id name="role_id">
    			<generator class="native"></generator>
    		</id>
    		<property name="role_name"></property>
    		<property name="role_memo"></property>
    		<!-- 
    			关联映射
    			name:关联的集合属性名
    			table:中间表的名称
    			key column:当前表在中间表的外键名名称
    			many-to-many class:关联表的类实体路径
    			many-to-many column:关联表在中间表中的列名（外键名）
   			 -->
    		<set name="users" table="sys_user_role" inverse="true">
    			<key column="role_id"></key>
    			<many-to-many class="User" column="user_id"></many-to-many>
    		</set>
    	</class>
    </hibernate-mapping>
    
```





```java
package club.zzrfdsnsyl.demo;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Role;
import club.zzrfdsnsyl.domain.User;

/**
 * 多对多
 * @author SYL
 *
 */
public class ManyToMany {
	private Session session=HbUtil.getCurrentSession();
	
	@Test
	public void t1() {
		Transaction transatction = session.beginTransaction();
		//创建user
		User user1=new User();
		user1.setUser_name("赵XX");
		User user2=new User();
		user2.setUser_name("杨XX");
		User user3=new User();
		user3.setUser_name("孙XX");
		
		//创建角色
		Role role1=new Role();
		role1.setRole_name("CEO");
		Role role2=new Role();
		role2.setRole_name("男公关");
		Role role3=new Role();
		role3.setRole_name("则所清洁员");
		
		//对应关系
		user1.getRoles().add(role2);
		user1.getRoles().add(role3);
		
		user2.getRoles().add(role3);
		
		user3.getRoles().add(role1);
		
		//持久化
		session.save(user1);
		session.save(user2);
		session.save(user3);
		session.save(role1);
		session.save(role2);
		session.save(role3);
		
		transatction.commit();
	}
	
	/**
	 * 	多表的级联 给user添加级联
	 */
	@Test
	public void t2() {
		Transaction transatction = session.beginTransaction();
		//创建角色
		Role r1=new Role();
		r1.setRole_name("行政管理");
		Role r2=new Role();
		r2.setRole_name("人事管理");
		Role r3=new Role();
		r3.setRole_name("财政管理");
		
		User user = session.get(User.class, 3L);
		user.getRoles().add(r1);
		user.getRoles().add(r2);
		user.getRoles().add(r3);
		transatction.commit();
	}
}

```

