``` java
package club.zzrfdsnsyl.demo.c_transcation;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.Test;

import club.zzrfdsnsyl.Utils.HbUtil;
import club.zzrfdsnsyl.domain.Customer;

public class HbTranscation {

	@Test
	public void transcation() {
		Session session = HbUtil.getCurrentSession();
		Session session2 = HbUtil.getCurrentSession();
		System.out.println(session==session2);
		
		
		Transaction transcation = session.beginTransaction(); //获取并开启事物
		Customer customer = session.get(Customer.class, 1L);
		customer.setCust_phone("13954123687");
		
		transcation.commit();//提交事物
		
//		transcation.rollback();//回滚事物
        
        //getCurrentSession()获得的session会在提交或回滚事物后会自动关闭 写不写都行
		session.close(); 
        
		System.out.println(customer);
	}
}

```

