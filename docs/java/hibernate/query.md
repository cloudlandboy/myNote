

# hiberate查询语句

## HQL

Hibernate Query Language的缩写,就是Hibernate的查询语言

面向对象查询语言,最终底层要转成面向数据库查询语言

```java
package club.zzrfdsnsyl.demo.d_sql;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

@SuppressWarnings({"unchecked","unused"})
/**
 * hibernate query language
 * @author SYL
 *
 */
public class HQL {
	private Session session = HbUtil.getCurrentSession();

	@Test
	/**
	 * 查询全部 必须开启事物
	 */
	public void query() {
		// 当一个项目只有一个Customer可省略包名
		// 当查询所有列可省略select *
		// String hql="select * from club.zzrfdsnsyl.domain.Customer";
		Transaction transaction = session.beginTransaction();
		String hql = "from Customer";
		Query<Customer> query = session.createQuery(hql);
		List<Customer> list = query.list(); // 多个结果
		// Customer customer = (Customer) query.uniqueResult();//单个结果
		System.out.println(list);
		// System.out.println(customer);
	}

	@Test
	/**
	 * where 条件查询 必须开启事物
	 * 占位符 ?1 ?2 ?3 ?4 ...
	 * 占位符 :m :t ...
	 * 
	 */
	public void query2() {
		// 当一个项目只有一个Customer可省略包名
		Transaction transaction = session.beginTransaction();
		// String hql="from Customer where cust_id=1";
		//String hql = "from Customer where cust_id = ?0";
		String hql = "from Customer where cust_id = :cid";

		Query<Customer> query = session.createQuery(hql);
		//query.setParameter(0, 1L);
		query.setParameter("cid", 2L);
		Customer customer = query.uniqueResult();// 单个结果
		System.out.println(customer);
	}
	
	/**
	 * 	分页查询
	 */
	@Test
	public void queryPage() {
		session.beginTransaction();
		String hql="from Customer";
		Query<Customer> query = session.createQuery(hql);
		query.setFirstResult(0);	//起始
		query.setMaxResults(2);		//每页显示
		List<Customer> list =query.list();
		System.out.println(list);
	}
}

```



## Criteria

hibernate提供纯面向对象查询语言，提供直接使用PO对象进行操作。

```java
package club.zzrfdsnsyl.demo.d_sql;

import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import org.hibernate.Session;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.hibernate.query.Query;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

/**
 * 	hibernate的无语句查询 全部是调用方法
 * 	查询单表时使用
 * @author SYL
 *
 */
@SuppressWarnings({"deprecation","unchecked"})
public class Criteria {
	private Session session=HbUtil.getCurrentSession();
	
	@Test
	/**
	 * 查询全部
	 */
	public void ago() {
		session.beginTransaction();
		//这种方法好像已经过时了
		org.hibernate.Criteria criteria =session.createCriteria(Customer.class);
		List<Customer> list = criteria.list();
		System.out.println(list);
	}
	
	/**
	 * 	条件查询
	 * .add方法添加条件
	 * Restrictions.方法名()  比较规则
	 * >					.gt()
	 * <					.lt()
	 * ==					.eq()
	 * >=					.ge()
	 * <=					.le()
	 * !=					.ne()
	 * in					.in()
	 * between and			.between()
	 * like					.like()
	 * is not null			.isNotNull()
	 * is null				.isNull()
	 * or					.or()
	 * and					.and()
	 * 
	 * 
	 */
	@Test
	public void ago2() {
		session.beginTransaction();
		org.hibernate.Criteria criteria = session.createCriteria(Customer.class);
		criteria.add(Restrictions.eq("cust_id", 3L)); //add方法用于添加条件
		Customer customer = (Customer) criteria.uniqueResult();
		System.out.println(customer);
	}
	
	@Test
	/**
	 * 分页查询
	 */
	public void ago3() {
		session.beginTransaction();
		org.hibernate.Criteria criteria = session.createCriteria(Customer.class);
		criteria.setFirstResult(0);
		criteria.setMaxResults(2);
		List<Customer> list = criteria.list();
		System.out.println(list);
		
	}
	
	@Test
	/**
	 * 聚合函数
	 */
	public void ago4() {
		session.beginTransaction();
		org.hibernate.Criteria criteria = session.createCriteria(Customer.class);
		criteria.setProjection(Projections.rowCount());	//查询总行数
		Long row = (Long)criteria.uniqueResult();
		System.out.println(row);
		
	}
	
	
	
	
	
	
	@Test
	/**
	 * 	新方法
	 * 	查询全部
	 */
	public void query() {
		session.beginTransaction();
		CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
		CriteriaQuery<Customer> criteria = criteriaBuilder.createQuery(Customer.class);
		criteria.from(Customer.class);
		Query<Customer> query = session.createQuery(criteria);
		List<Customer> list = query.list();
		System.out.println(list);
	}
}

```



## 原生SQL

```java
package club.zzrfdsnsyl.demo.d_sql;

import java.util.Arrays;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.query.NativeQuery;
import org.hibernate.query.Query;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

/**
 * 	原始的sql查询
 * @author SYL
 *
 */
public class SQL {
	private Session session=HbUtil.getCurrentSession();
	@Test
	public void query() {
		session.beginTransaction();
		String sql ="select * from customer";
		Query query = session.createSQLQuery(sql);
		//查询到的每条数据都是数组
		List<Object[]> list = query.list();
		for(Object[] obj:list) {
			System.out.println(Arrays.toString(obj));
		}
	}
	
	@Test
	public void query2() {
		session.beginTransaction();
		String sql ="select * from customer";
		NativeQuery<Customer> query = session.createNativeQuery(sql, Customer.class);
		List<Customer> list = query.list();
		System.out.println(list);
	}
}

```

