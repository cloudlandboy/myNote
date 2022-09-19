# Hibernate缓存

## 一级缓存

一级缓存：又称为session级别的缓存。

当获得一次会话（session），hibernate在session中创建多个集合（map），用于存放操作数据（PO对象），**为程序优化服务**，如果之后需要相应的数据，hibernate优先从session缓存中获取，如果有就使用；如果没有再查询数据库。

**当session关闭时，一级缓存销毁。**



```java
package club.zzrfdsnsyl.demo.b_cache;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

/**
 * 一级缓存
 * @author SYL
 *
 */
public class First_cache {
	
	@Test
	public void test_first_cache() {
		Session session = HbUtil.openSession();
		Customer customer = session.get(Customer.class, 1L);
		Customer customer2 = session.get(Customer.class, 1L);
		System.out.println(customer==customer2);
		System.out.println(customer.equals(customer2));
		session.close();
	}
	
	
	/**
	 * 持久化就是把对象放到session缓存
	 */
	@Test
	public void test() {
		Session session = HbUtil.openSession();
		Customer customer=new Customer();
		customer.setCust_id(1L);	//游离状态 有OID没有与session绑定 
		customer.setCust_name("百度公司");;
		session.update(customer);	//持久化状态
		Customer customer2 = session.get(Customer.class,1L);
		System.out.println(customer2.getCust_name()); //从缓存中找 有则不会去数据库
		session.close();
	}
}

```

## 清除一级缓存

1. `session.clear()` 清除所有缓存
2. `session.evict(obj)` 清除指定的对象缓存



## 一级缓存快照

快照：与一级缓存存放位置是一样，对一级缓存数据备份。

保证数据库的数据与 一级缓存的数据必须一致。

如果一级缓存**修改了**，在执行commit提交时，将自动刷新一级缓存。执行update语句，将一级缓存的数据更新到数据库。



!> HQL的结果会进行一级缓存，SQL的结果不会添加到一级缓存

