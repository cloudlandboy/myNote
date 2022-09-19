# 加载策略

## 类级别的加载策略

`get`：**立即检索**。get方法一执行，立即查询所有字段的数据。

`load`：**延迟检索**。默认情况，load方法执行后，如果只使用OID的值不进行查询，如果要使用其他属性值才查询

需要断点调试查看

```java
package club.zzrfdsnsyl.demo.a_OID;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

/**
 * 就是 sessino.get()和.load()
 * @author SYL
 *
 */
public class OID {
	
	@Test
	public void t1() {
		Session session = HbUtil.getCurrentSession();
		Transaction transaction = session.beginTransaction();
		Customer customer = session.get(Customer.class, 1L);
		System.out.println(customer);
		transaction.commit();
		session.close();
	}
	@Test
	public void t2() {
		Session session = HbUtil.getCurrentSession();
		Transaction transaction = session.beginTransaction();
		Customer customer = session.load(Customer.class, 2L);
		System.out.println(customer);
		transaction.commit();
		session.close();
	}
}

```



## 关联级别的加载策略

