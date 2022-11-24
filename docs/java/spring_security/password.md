# 密码

## 密码进化史

![mpv-shot0001](https://cdn.tencentfs.clboy.cn/images/2022/20221118165809873.png)

1. 最开始我们的登录密码很简单，我记得刚上初中那会qq还刚火没几年，那时候注册qq也不需要绑定手机号接收验证码什么鬼的，于是就注册了很多小号，而且密码可以设置为 `123456` 这样特别简单
2. 后来因为qq号经常被盗，于是就给密码设置很长
3. 再到后面腾讯平台强制要求设置的密码要包含字母数字和特殊字符
4. 又过了几年，我记得好像是国家要求手机号必须实名认证之后，各大网络平台注册账户都必须绑定手机号码，而且登录的时候不仅需要输入正确账户密码而且有时还要接收短信验证码进行二次验证
5. 近些年又有了智能手机的普及，指纹识别，人脸识别也被用在了app登录和支付上，但是对于web应用来说这种基于硬件方面的验证还是有一定的局限性



## 密码的存储

> `明文` -> `hash` -> `加盐` 

1. 最开始我们在某平台注册的账户他们都是直接把密码明文存储到数据库

   | user_id | username | nickname     | password |
   | ------- | -------- | ------------ | -------- |
   | 1       | 65164614 | 萩迗の丶孤漃 | 123456   |
   | 2       | 72442432 | 隨著颩逃跑   | 4234256  |
   | 3       | 75242345 | 死榊↘阻擊手  | 976313   |

   由于平台直接将明文密码存储到数据库，一旦平台的服务器数据库被黑客攻击，拿到数据库里的数据，那么注册的所有用户账户都会被泄露，黑客可以直接拿着你的密码去登录或者公布在其他平台，很容易被不发分子利用。而且有时我们会为了方便就会在多个平台设置同样的密码，这样一旦某个平台的明文密码泄露，很可能会影响你在其他站点的账号。例如当时比较出名的 [CSDN密码外泄门](https://baike.baidu.com/item/%E5%AF%86%E7%A0%81%E5%A4%96%E6%B3%84%E9%97%A8/4976608?fr=aladdin)

2. 为了用户的隐私安全，其实注重网络安全的平台都不会将用户密码直接用明文存储，而是使用哈希算法对密码加密后再存储到数据库，这样即使是网站的工作人员其实也是不知道用户的真实密码的，比较常用的hash算法有 `md5` 、`sha1`、`sha256` 等 

   使用 `md5(密码)` 加密后的存储

   | user_id | username | nickname     | password                         |
   | ------- | -------- | ------------ | -------------------------------- |
   | 1       | 65164614 | 萩迗の丶孤漃 | e10adc3949ba59abbe56e057f20f883e |
   | 2       | 72442432 | 隨著颩逃跑   | 782bcc4b1ed7e808ab799d78f934fa19 |
   | 3       | 75242345 | 死榊↘阻擊手  | 2e46feb6ed79cf0ad14c9ce075802815 |

   但是由于现在计算机的运算速度很快，有些黑客会拿一些常用的密码进行hash后放到自己的匹配库中(或称为 [彩虹表](https://baike.baidu.com/item/%E5%BD%A9%E8%99%B9%E8%A1%A8?fromModule=lemma_search-box))，然后拿着从平台窃取来的密文密码在自己的加密库里寻找相同的加密结果从而达到所谓的破解

   例如这个： [加密算法反向查询网站](https://www.cmd5.com/) 。我们上面这些password由于很简单所有在这个网站都能够查到

3. 由于直接进行hash还是不太安全于是又推出了对密码进行加盐的策略，就是随机生成一个值

   然后将这个随机值和密码拼接到一起进行加密 `md5(密码+盐值)`

   | user_id | username | nickname     | password                         | salt |
   | ------- | -------- | ------------ | -------------------------------- | ---- |
   | 1       | 65164614 | 萩迗の丶孤漃 | 461415eb5abc901468c15e798382710a | eqad |
   | 2       | 72442432 | 隨著颩逃跑   | e4bbbf4784cf438c0754b5d3410f4dfd | rete |
   | 3       | 75242345 | 死榊↘阻擊手  | 68110d86f6a81e8b6e4c89b8f5da74d4 | ygvc |

   这样再在  [加密算法反向查询网站](https://www.cmd5.com/) 查询到的概率就小很多

   而且我们还可以对加密结果进行多次迭代，同时迭代次数也要记录下来

   就是对加密结果再加密 `md5(md5(密码+盐值))`

   | user_id | username | nickname     | password                         | salt | iterations |
   | ------- | -------- | ------------ | -------------------------------- | ---- | ---------- |
   | 1       | 65164614 | 萩迗の丶孤漃 | a58e081fa12a2e39bdd718a37091f5a4 | eqad | 1          |
   | 2       | 72442432 | 隨著颩逃跑   | 8a578587d8cea18d8191841150882deb | rete | 2          |
   | 3       | 75242345 | 死榊↘阻擊手  | c8f182acba140d6e081af1a65ab3122e | ygvc | 3          |



## PasswordEncoder

> spring security 中的密码编码器
>
> `org.springframework.security.crypto.password.PasswordEncoder`
>
> 官方源码注解：用于编码密码的服务接口。首选实现是 `BCryptPasswordEncoder`

在前面学习security配置的章节我们就接触到了密码编码器

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    //这里设置的密码需要使用PasswordEncoder类型的编码器进行加密，同时需要将编码器注册到spring容器中供security使用
    //System.out.println(passwordEncoder().encode("123456"));
    auth.inMemoryAuthentication()
            .withUser("admin")
            .password("$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS")
            .roles("ADMIN");
}

/**
 * 密码编码器
 */
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### BCrypt加密算法

> BCrypt是单向Hash加密算法，一般用于密码加密，相对来说，BCrypt比MD5更安全 ，但是MD5加密会更快速
>
> 但是它还是会被彩虹破解，只是相对于破解时间来说两者差别巨大，如果非要举例说明一下，用彩虹破解MD5可能需要3分钟左右，而BCrypt就需要14年之久。所以一般都推荐使用bcrypt。

这是BCrypt算法生成的结果构造

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221118165818448.png)

Bcrypt生成的密文是字符长度是60位的，其中：`$` 是分割符

- `2a` ：加密版本号，还有 `2b` 和 `2y` 版本，默认就是 `$2a`
- `10` ：加密迭代次数，最小值为 `4` ，最大值 `31` 默认值 `10`
- 最后面的 `前22位字符` 是盐值，剩余的就是加密结果了

Bcrypt的盐值是随机生成的，所以每次的加密结果都会不一样

```java
@Test
public void bCryptTest() {
    String password = "123456";
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    for (int i = 0; i < 10; i++) {
        System.out.println(passwordEncoder.encode(password));
    }
}

/** 
 * 输出结果：
 * $2a$10$4.5w8GvM/m7f/DuxT9rNGOfkMBF0TIpsx56k6Ap3kQZyr7GCq/aZC
 * $2a$10$bi7Mget9jj2cnUGXqP9uXOlPGkoB2.6JoLESupg7h3./R8mwj.HiC
 * $2a$10$F7cEfbJURr.m02ydJi23huRWMU.ikd9nqMMY.nOA/rHo6DoIKzCfK
 * $2a$10$ChoYx8qMbYE8ArAM.pFRL.46XywjOmulqbb6xn4Ia4opomU9r5k/a
 * $2a$10$MRW7y1D7ET3Nmg288s6aUe6Wx.vK2L5e8hRcwe6/QmVlX.3yH6bJ6
 * $2a$10$znfpML6HOuqTB2RaOpTud.Qi/DoPgIxUrFFBbYgvMQXOVl42gyNlC
 * $2a$10$5.WHf/YlSdKLe73e2EohnegNG6CGXJUFGd7e7wAT9hdgAPTHraZa.
 * $2a$10$0aGNSQsiM8HxtpJGSW2mIeRBUVDlFgA8VPulgWeMH402Detwbv0eK
 * $2a$10$3HK09QnUiZhid9Mb/v/4AOqQiflgziNqmVVyssnA.mBDWwF927sx2
 * $2a$10$GomJKqFsUMEmn3BuGT3Bmuk.Y5D5ES3Wtfr6okaUSal9pnAZGvPWW
 */
```

验证密码是否正确的过程，也就是从存储的密文中提取出算法版本、迭代次数、盐值对输入的明文密码加密，然后比较加密结果。`PasswordEncoder` 接口已经提供了验证的方法

```java
@Test
public void bCryptMatchTest() {
    String password = "123456";
    String encodedPassword = "$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS";
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    System.out.println(passwordEncoder.matches(password, encodedPassword)); //true
    System.out.println(passwordEncoder.matches("654321", encodedPassword)); //false
}
```



### 摘要加密算法

> 摘要加密算法就是我们常用的 `MD5` 、`SHA-1` 、`SHA-256` 等
>
> spring security也提供了这样一个密码编码器给我们使用
>
> `org.springframework.security.crypto.password.MessageDigestPasswordEncoder`
>
> 但是这个类已经被标上 `@Deprecated` 注解，也就是不推荐使用，因为摘要算法是不安全的
>
> 可能由于老项目的原因我们数据库存储的密码都是MD5加密值，所以这个类还是使用的上的

```java
@Test
public void messageDigestPasswordEncoderTest() {
    String password = "123456";
    PasswordEncoder passwordEncoder = new MessageDigestPasswordEncoder("MD5");
    System.out.println(passwordEncoder.encode(password));
}
```

加密结果：前面由{}包围的部分是随机生成的盐值

`{sBU4DqWPHQooYGDMBjagR2tCS0JtZZQcPFeiHB3EzVA=}26beaa221c38ee91847f1e53b5b09dd1`

!> `{` 和 `}` 符号也是算到盐值里面的

```java
public String encode(CharSequence rawPassword) {
   String salt = PREFIX + this.saltGenerator.generateKey() + SUFFIX;
   return digest(salt, rawPassword);
}
```

对于老项目我们可以从数据库查出密文和盐值后拼接成适配的加密字符后进行匹配验证，如果我们数据库的盐值不是 `{}` 包围这种形式

我们可以写一个自己的类复制`MessageDigestPasswordEncoder` 中的代码进行改造，重点就改了两处

1. 加密时不把 `PREFIX` 和 `SUFFIX` 算进去，只用作最后生成的盐值标识
2. 提取盐值 `PREFIX` 和 `SUFFIX`  中间部分

对于有迭代次数的自己根据需求再做出改动就好了

```java
/**
 * 自定义摘要密码编码器，取消加密和解密过程PREFIX和SUFFIX参与
 *
 * @author clboy
 * @date 2022/11/18 15:42:29
 */
public class MyMessageDigestPasswordEncoder implements PasswordEncoder {

    private static final String PREFIX = "{";

    private static final String SUFFIX = "}";

    private StringKeyGenerator saltGenerator = new Base64StringKeyGenerator();

    private boolean encodeHashAsBase64;

    private Digester digester;

    public MyMessageDigestPasswordEncoder(String algorithm) {
        this.digester = new Digester(algorithm, 1);
    }

    public void setEncodeHashAsBase64(boolean encodeHashAsBase64) {
        this.encodeHashAsBase64 = encodeHashAsBase64;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        String salt = this.saltGenerator.generateKey();
        return digest(salt, rawPassword);
    }

    private String digest(String salt, CharSequence rawPassword) {
        String saltedPassword = rawPassword + salt;
        byte[] digest = this.digester.digest(Utf8.encode(saltedPassword));
        String encoded = encode(digest);
        return PREFIX + salt + SUFFIX + encoded;
    }

    private String encode(byte[] digest) {
        if (this.encodeHashAsBase64) {
            return Utf8.decode(Base64.getEncoder().encode(digest));
        }
        return new String(Hex.encode(digest));
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String salt = extractSalt(encodedPassword);
        String rawPasswordEncoded = digest(salt, rawPassword);
        return encodedPassword.equals(rawPasswordEncoded);
    }


    public void setIterations(int iterations) {
        this.digester.setIterations(iterations);
    }

    private String extractSalt(String prefixEncodedPassword) {
        int start = prefixEncodedPassword.indexOf(PREFIX);
        if (start != 0) {
            return "";
        }
        int end = prefixEncodedPassword.indexOf(SUFFIX, start);
        if (end < 0) {
            return "";
        }
        return prefixEncodedPassword.substring(start + 1, end);
    }

    private class Digester {
        private final String algorithm;
        private int iterations;

        Digester(String algorithm, int iterations) {
            createDigest(algorithm);
            this.algorithm = algorithm;
            setIterations(iterations);
        }

        byte[] digest(byte[] value) {
            MessageDigest messageDigest = createDigest(this.algorithm);
            for (int i = 0; i < this.iterations; i++) {
                value = messageDigest.digest(value);
            }
            return value;
        }

        void setIterations(int iterations) {
            if (iterations <= 0) {
                throw new IllegalArgumentException("Iterations value must be greater than zero");
            }
            this.iterations = iterations;
        }

        private MessageDigest createDigest(String algorithm) {
            try {
                return MessageDigest.getInstance(algorithm);
            } catch (NoSuchAlgorithmException ex) {
                throw new IllegalStateException("No such hashing algorithm", ex);
            }
        }

    }
}
```

### 兼容多种加密方式

> spring security还提供了一个类可以让我们兼容多种加密方式
>
> `org.springframework.security.crypto.password.DelegatingPasswordEncoder`
>
> 例如我们系统之前的密码加密方式都是 `MD5`，我想以后的加密方式都改为 `BCrypt` 就可以使用这个编码器而不会对之前的数据造成影响

该加密器的原理就和上面讲到的摘要加密类似，在密文前面使用固定格式前缀标识加密方式

```
{加密方式Id}密文
{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
{sha256}97cde38028ad898ebc02e690819fa220e88c62e0699403e94fff291cfffaf8410849f27605abcbc0

```

该加密器内部维护一个map存储所有加密器

```java
//key就是加密方式Id
private final Map<String, PasswordEncoder> idToPasswordEncoder;
```

构造函数

```java
DelegatingPasswordEncoder(String idForEncode, Map<String, PasswordEncoder> idToPasswordEncoder)
```

- `idForEncode` ：设置用于加密的密码编码器Id
- `idToPasswordEncoder` ：编码器与其id映射的map

```java
@Test
public void delegatingPasswordEncoderTest() throws Exception {
    Map<String, PasswordEncoder> passwordEncoderMap = CollectionUtils.newHashMap(3);
    String idForEncode = "bcrypt";
    PasswordEncoder defaultMatchEncoder = new MyMessageDigestPasswordEncoder("MD5");
    passwordEncoderMap.put(idForEncode, new BCryptPasswordEncoder());
    passwordEncoderMap.put("md5", defaultMatchEncoder);
    passwordEncoderMap.put("sha256", new MyMessageDigestPasswordEncoder("SHA-256"));
    DelegatingPasswordEncoder passwordEncoder = new DelegatingPasswordEncoder("bcrypt", passwordEncoderMap);
    //设置匹配时默认使用的编码器，如果从密文中提取的id与map没有匹配到就会使用该匹配器
    passwordEncoder.setDefaultPasswordEncoderForMatches(defaultMatchEncoder);

    String password = "123456";
    String encodedPasswordByBcrypt = "{bcrypt}$2a$10$KbuV10kI1nqcM5PsScHqmOTAzQpqkxGo1j0aDXHZFb0U94x.ao1kS";
    //没有匹配到的id，这个是盐值，会使用defaultMatchEncoder
    String encodedPasswordByMd5NoId = "{eqad}461415eb5abc901468c15e798382710a";
    //有id，也有盐值。不会冲突，在匹配的时候会把最前面的{md5}去掉后再调用md5编码器的matches方法匹配
    String encodedPasswordByMd5HasId = "{md5}{eqad}461415eb5abc901468c15e798382710a";
    //这个654321的密文
    String encodedPasswordBySha256 = "{sha256}{eqad}dd5fef9c1c1da1394d6d34b248c51be2ad740840";

    System.out.println(passwordEncoder.matches(password, encodedPasswordByBcrypt)); //true
    System.out.println(passwordEncoder.matches(password, encodedPasswordByMd5NoId)); //true
    System.out.println(passwordEncoder.matches(password, encodedPasswordByMd5HasId)); //true
    System.out.println(passwordEncoder.matches(password, encodedPasswordBySha256)); //false
}
```



## 升级密码

> 假设之前数据库存储的密码都是使用MD5存储，后续想改为 `BCrypt` 。
>
> 那么我们就应该使用 `DelegatingPasswordEncoder`
>
> 然后我们可以在用户登录成功之后判断当前密码是否是BCrypt格式，如果不是则使用用户输入的密码重新使用 `BCrypt` 加密，最后更新到数据库

`PasswordEncoder` 接口已经提供了判断是否需要升级的方法

```java
/**
 * 如果密码需要升级则返回true，否则返回false
 */
default boolean upgradeEncoding(String encodedPassword) {
	return false;
}

/**
 * 这是DelegatingPasswordEncoder对其的实现
 */
@Override
public boolean upgradeEncoding(String prefixEncodedPassword) {
   String id = extractId(prefixEncodedPassword);
   if (!this.idForEncode.equalsIgnoreCase(id)) {
      return true;
   }
   else {
      String encodedPassword = extractEncodedPassword(prefixEncodedPassword);
      return this.idToPasswordEncoder.get(id).upgradeEncoding(encodedPassword);
   }
}
```



另外security框架还提供了一个接口用于更新密码

```java
package org.springframework.security.core.userdetails;
public interface UserDetailsPasswordService {

   /**
    * 修改指定用户的密码
    * user：要修改密码的user
    * newPassword：要更改的密码，由配置的PasswordEncoder编码
    * return：更新密码后的UserDetails
    */
   UserDetails updatePassword(UserDetails user, String newPassword);

}
```