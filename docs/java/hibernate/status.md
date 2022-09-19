# Hibernate 实体的状态

实体Entity有三种状态，`瞬时状态`、`持久状态`、`脱管状态`

瞬时状态：transient,  session没有缓存，数据库也没有记录，oid没有值

持久状态：persistent,  session有缓存，数据库也有记录,oid有值

脱管状态/游离状态：detached，session没有缓存，数据库有记录,oid有值



## 瞬时转持久

新创建的一个对象，经过save,或者savaOrUpdate调用后，会变成持久状态



## 持久转脱管

`load`，`get`返回的对象是持久状态的，当session关闭或者清除后，对象变成脱管状态



```java
package club.zzrfdsnsyl.demo.a_threeState;

import java.io.Serializable;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

/**
 * 持久化对象的三种状态
 * @author SYL
 *	瞬时		持久		游离
 *	瞬时	save()/get()-->持久
 *	游离 update()-->持久
 *	持久 delete()-->瞬时
 *	瞬时/游离 saveOrUpdate()-->持久
 */
public class State {
	/**
	 * 瞬时状态 无OID 没有与session关联
	 */
	@Test
	public void transientState() {
		Customer customer=new Customer();
		customer.setCust_name("郑州财经学院");
	}
    
	/**
	 * 持久化状态 有OID 与session关联
	 */
	@Test
	public void persistent() {
		Customer customer=new Customer();
		customer.setCust_name("郑州财经学院");
		Session session = HbUtil.openSession();
		Serializable save = session.save(customer); 
		System.out.println(save);
	}
	/**
	 * 游离状态 
	 */
	@Test
	public void detached() {
		Customer customer=new Customer();
		customer.setCust_name("郑州财经学院");
		Session session = HbUtil.openSession();
		Transaction transaction = session.beginTransaction();
		Serializable save = session.save(customer);
		System.out.println(save);
		transaction.commit();
		session.close(); //session关闭 与session没联系了
	}
	
	
	/**
	 * 持久化状态 有OID 与session关联
	 */
	@Test
	public void persistent02() {
		Session session = HbUtil.openSession();
		Transaction transaction = session.beginTransaction();
		Customer customer = session.get(Customer.class, 1L); 
		customer.setCust_name("小米科技");
		//无需.update(...);
		transaction.commit();
		session.close();
		
	}
}

```



## 总结

`get`、`load`、`createQuery`、`createCriteria` 等从数据库获得的都是持久态

瞬时状态执行`save`、`update`、`saveOrUpdate`之后变成持久状态



持久态转换脱管态

1. session.close () 关闭
2. session.clear() 清除所有
3. session.evict(obj) 清除指定的PO对象

