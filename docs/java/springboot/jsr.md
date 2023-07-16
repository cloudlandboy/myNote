# 参数验证-JSR303

> java6里面推出了一种规范：`JSR-303`，JSR是 `Java Specification Requests` 的缩写，意思是Java 规范提案，又叫做Bean Validation
>
> JSR 303是Java为bean `数据合法性校验` 提供的 `标准框架` 
>
> Hibernate Validator是对其的一种实现。



## 内置约束注解

> Bean Validation 中内置约束注解

| 注解                        |                           详细信息                           |
| :-------------------------- | :----------------------------------------------------------: |
| @Null                       |                   被注释的元素必须为 null                    |
| @NotNull                    |                  被注释的元素必须不为 null                   |
| @NotBlank                   |   被注释的元素不能为null ，并且必须至少包含一个非空白字符    |
| @AssertTrue                 |                   被注释的元素必须为 true                    |
| @AssertFalse                |                   被注释的元素必须为 false                   |
| @Min(value)                 |   被注释的元素必须是一个数字，其值必须大于等于指定的最小值   |
| @Max(value)                 |   被注释的元素必须是一个数字，其值必须小于等于指定的最大值   |
| @DecimalMin(value)          |   被注释的元素必须是一个数字，其值必须大于等于指定的最小值   |
| @DecimalMax(value)          |   被注释的元素必须是一个数字，其值必须小于等于指定的最大值   |
| @Size(max, min)             |             被注释的元素的大小必须在指定的范围内             |
| @Digits (integer, fraction) | 被注释的元素必须是一个数字，限制可接受的最大整数位数和可最大小数位数 |
| @Past                       |               被注释的元素必须是一个过去的日期               |
| @Future                     |               被注释的元素必须是一个将来的日期               |
| @Pattern(value)             |             被注释的元素必须符合指定的正则表达式             |

## Hibernate Validator附加注解

| 注解      |                           详细信息                           |
| :-------- | :----------------------------------------------------------: |
| @Email    |                被注释的元素必须是电子邮箱地址                |
| @Length   |            被注释的字符串的大小必须在指定的范围内            |
| @NotEmpty |                   被注释的字符串的必须非空                   |
| @Range    | 被注释的元素必须在合适的范围内，应用于数值或数值的字符串表示 |

## 验证及全局异常处理



`spring boot` 之前的版本只要引入了 `spring-boot-starter-web` 的依赖就可以使用

因为它其他依赖了 `spring-boot-starter-validation`

后面不知道从哪个版本开始 `web` 模块中移除了对其依赖，需不需要手动引入就看你当前使用的版本中web模块有没有

手动添加依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```



接下来我们定义一个模型类和controller用于测试

```java
@Data
public class UserDTO {

    /**
     * 用户名
     */
    @NotBlank
    private String username;

    /**
     * 性别，0：女，1：男
     */
    @Pattern(regexp = "[01]", message = "性别只能为0或1")
    private String gender;

    /**
     * 年龄
     */
    @Range(min = 16, max = 65, message = "年龄需要介于16到65岁之间")
    private Integer age;

    /**
     * 工资
     */
    @Digits(integer = Integer.MAX_VALUE, fraction = 2, message = "工资最多保留两位小数")
    private BigDecimal salary;

    /**
     * 邮箱
     */
    @Email(message = "邮箱格式不正确")
    private String email;
}
```



## @Valid注解

在Spring Boot中，`@Valid`注解是用于在方法参数、方法返回值或方法参数的字段上执行验证的注解。它是JSR-303（Bean验证）规范的一部分，用于验证输入参数的有效性。

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping("/register")
    public Map<String, String> register(@Valid @RequestBody UserDTO user) {
        Map<String, String> result = CollectionUtils.newHashMap(2);
        result.put("code", "0");
        result.put("msg", "注册成功");
        return result;
    }

}
```



然后如果验证不通过的话框架会抛出 `org.springframework.validation.BindException` 类型的异常

```http
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "clboy",
  "gender": null,
  "age": 12,
  "salary": 3131.444,
  "email": "44141"
}
```



我们可以定义一个全局异常处理，将验证错误消息转为友好的json格式

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> exceptionHandle(BindException ex) {
        Map<String, Object> result = CollectionUtils.newHashMap(3);
        result.put("code", "1");
        result.put("msg", "接口调用失败");
        String validateMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(","));
        result.put("data", validateMessage);
        return result;
    }
}
```

```http
HTTP/1.1 400 
Content-Type: application/json
Transfer-Encoding: chunked
Date: Mon, 21 Nov 2022 08:26:56 GMT
Connection: close

{
  "msg": "接口调用失败",
  "data": "年龄需要介于16到65岁之间,邮箱格式不正确,工资最多保留两位小数",
  "code": "1"
}
```

## 国际化错误消息

在resource目录下创建国际化文件

`messages.properties`

```properties
email.error.msg=邮箱格式不合法
username.error.msg=用户名不能为空
gender.error.msg=性别只能为0（女）或 1（男）
age.error.msg=年龄必须在16到65岁之间
salary.error.msg=工资最多可以保留到小数点后两位
```

`messages_en_us.properties`

```properties
email.error.msg=email is illegal
username.error.msg=username cannot be blank
gender.error.msg=gender can only be 0 (female) or 1 (male)
age.error.msg=age needs to be between 16 and 65
salary.error.msg=the salary can be kept to two decimal places at most
```

将注解错误消息改为 `{}` 占位符格式即可

```java
@Data
public class UserDTO {

    /**
     * 用户名
     */
    @NotBlank(message = "{username.error.msg}")
    private String username;

    /**
     * 性别，0：女，1：男
     */
    @Pattern(regexp = "[01]", message = "{gender.error.msg}")
    private String gender;

    /**
     * 年龄
     */
    @Range(min = 16, max = 65, message = "{age.error.msg}")
    private Integer age;

    /**
     * 工资
     */
    @Digits(integer = Integer.MAX_VALUE, fraction = 2, message = "{salary.error.msg}")
    private BigDecimal salary;

    /**
     * 邮箱
     */
    @Email(message = "{email.error.msg}")
    private String email;
}
```

接下来我们只需要在请求时携带语言标识请求头 `Accept-Language` 即可

```http
POST http://localhost:8080/users/register
Content-Type: application/json
Accept-Language: en-US

{
  "username": "clboy",
  "gender": 8,
  "age": 12,
  "salary": 3131.444,
  "email": "44141"
}
```



## 自定义验证注解

> 其实正则表达式 `@Pattern` 就可以满足大部分应用场景，当然也可以自定义注解实现复杂的验证逻辑

### 单字段验证注解

我们随便找一个内置注解看其内置结构，这里选择常用的 `NotBlank` 注解

```java
@Documented
@Constraint(validatedBy = { })
@Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
@Retention(RUNTIME)
@Repeatable(List.class)
public @interface NotBlank {

   String message() default "{javax.validation.constraints.NotBlank.message}";

   Class<?>[] groups() default { };

   Class<? extends Payload>[] payload() default { };

   @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
   @Retention(RUNTIME)
   @Documented
   public @interface List {
      NotBlank[] value();
   }
}
```

可以看到 `NotBlank` 标注的一堆注解除了 `@Constraint` 其余都是元注解，接下来看一下 `@Constraint` 注解的源码说明

```java
    /**
     * 这是约束定义的示例：
     *   @Documented
     *   @Constraint(validatedBy = OrderNumberValidator.class)
     *   @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
     *   @Retention(RUNTIME)
     *   public @interface OrderNumber {
     *       String message() default "{com.acme.constraint.OrderNumber.message}";
     *       Class<?>[] groups() default {};
     *       Class<? extends Payload>[] payload() default {};
     *   }
     *
     */
@Documented
@Target({ ANNOTATION_TYPE })
@Retention(RUNTIME)
public @interface Constraint {

   Class<? extends ConstraintValidator<?, ?>>[] validatedBy();
}
```

- 将注解标记为 Jakarta Bean 验证约束

- 给定的约束注解必须由 `@Constraint` 注解进行标注，该注解 `validatedBy` 属性引用其约束验证实现列表

- 每个标识该注解的约束注解必须包含以下属性：

  - `String message()` ：验证错误消息，可以使用国际化，格式应为 `{注解类的全限定类名.message}`，例如：

    ```
    {com.acme.constraints.NotSafe.message}
    ```

  - `Class<?>[] groups()` ：供用户自定义的分组

  - `Class<? extends Payload>[] payload()` ：出于可扩展性目的



`validatedBy` 属性需要 `ConstraintValidator` 类型的验证器

```java
/**
 * 定义为给定对象类型T验证给定约束A的逻辑。(A就是自定义的注解，T是指需要校验的数据类型)
 * 实施必须遵守以下限制：
 * 	T必须解析为非参数化类型或T的泛型参数必须是无限通配符类型
 */
public interface ConstraintValidator<A extends Annotation, T> {

    /** 
     * 这个只会在初始化的调用一次， 例如User类中，x属性和y属性都标识了A注解，那么就会为x和y属性上的该注解分别初始化一次
     * 初始化验证器以准备调用isValid(Object, ConstraintValidatorContext) 。传递给定约束声明的约束注释。
     * 保证在使用此实例进行验证之前调用此方法。
     * 默认实现是空操作。
     */
   default void initialize(A constraintAnnotation) {
   }
    
    /**
     * 实现验证的逻辑。 value状态不得改变。
     * 该方法可以并发访问，实现时必须保证线程安全。
     */
   boolean isValid(T value, ConstraintValidatorContext context);
}
```

现在我们有这样一个场景，给UserDTO类添加一个 `province` 注解，表示用户的所在省份，通常在项目中这种值都存储的是字典值，前端在渲染时是从后端接口得到字典值列表渲染成下拉列表，然后将字典值提交到后端。现在我为了保证字典值的正确性，防止不老实的用户故意传一个不是字典中的值，所以要在后端做一下校验

```java
@Data
public class UserDTO {

    /**
     * 省
     */
    @DictValue(dictType = "province", message = "不合法的省份值")
    private String province;
    
    //... 省略其他代码
    
}
```

定义一个字典验证注解和验证器

```java
@Documented
@Constraint(validatedBy = {DictValueValidator.class})
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
public @interface DictValue {

    /**
     * 字典类型
     */
    String dictType();

    String message() default "字典值不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
```

```java
@RequiredArgsConstructor
public class DictValueValidator implements ConstraintValidator<DictValue, String> {

    /**
     * 这里是可以使用自动注入的
     */
    private final DictService dictService;
    private List<String> dictValues;

    @Override
    public void initialize(DictValue constraintAnnotation) {
        dictValues = dictService.listDictValue(constraintAnnotation.dictType());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return dictValues.contains(value);
    }
}
```

这里 `DictService` 只是模拟从数据库查询的步骤

```java
@Service
public class DictService {

    private final Map<String, List<String>> VIRTUAL_DB = new HashMap<>();

    {
        VIRTUAL_DB.put("province", Arrays.asList("0:河北省", "1:河南省", "2:湖北省", "3:湖南省"));
        VIRTUAL_DB.put("gander", Arrays.asList("0:女", "1:男"));
    }

    public List<String> listDictValue(String dictType) {
        List<String> values = VIRTUAL_DB.get(dictType);
        if (values == null) {
            return Collections.emptyList();
        }
        return values.stream().map(v -> v.substring(0, 1)).collect(Collectors.toList());
    }
}
```

测试

```http
POST http://localhost:8080/users/register
Content-Type: application/json
Accept-Language: zh-CN

{
  "username": "clboy",
  "gender": "8",
  "province": "9",
  "age": 18,
  "salary": 3131.00,
  "email": "44141@qq.com"
}
```

响应结果

```json
{
  "msg": "接口调用失败",
  "data": "不合法的省份值,性别只能为0（女）或 1（男）",
  "code": "1"
}
```

这样，可以给性别字段也改为字典验证

```java
@Data
public class UserDTO {

    @DictValue(dictType = "province", message = "不合法的省份值")
    private String province;

    @DictValue(dictType = "gander", message = "{gender.error.msg}")
    private String gender;
    
    //... 省略其他代码
}
```

### 多字段组合验证注解

上面那些注解都只能够进行单字段验证无法组合使用，比如前端提交的密码和再次输入密码，需要校验两个字段是否一致，或者当某个字段是某个值时，其他几个字段必须填写等复杂逻辑。我们使用密码二次校验作为演示

定义注解和验证器

```java
@Documented
@Constraint(validatedBy = {PasswordUniformityValidator.class})
@Target({TYPE})
@Retention(RUNTIME)
public @interface PasswordUniformity {

    String message() default "密码输入不匹配";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

```java
public class PasswordUniformityValidator implements ConstraintValidator<PasswordUniformity, UserDTO> {

    @Override
    public boolean isValid(UserDTO value, ConstraintValidatorContext context) {
        return StringUtils.hasText(value.getPassword()) && value.getPassword().equals(value.getRePassword());
    }
}
```

然后我们把注解标注在类上即可

```java
@Data
@PasswordUniformity
public class UserDTO {
    
    //... 省略其他代码
    
    /**
     * 密码
     */
    private String password;

    /**
     * 重复密码
     */
    private String rePassword;
}
```

测试

```http
POST http://localhost:8080/users/register
Content-Type: application/json
Accept-Language: zh-CN

{
  "username": "clboy",
  "gender": "1",
  "province": "1",
  "age": 18,
  "salary": 3131.00,
  "email": "44141@qq.com",
  "password": "123456",
  "rePassword": "654321"
}
```

你会发现响应结果中并没有输出错误消息

```json
{
  "msg": "接口调用失败",
  "data": "",
  "code": "1"
}
```

那是因为之前写的全局异常处理中只封装了字段的验证错误消息 `getFieldErrors()`

```java
String validateMessage = ex.getBindingResult().getFieldErrors().stream()
        .map(FieldError::getDefaultMessage)
        .collect(Collectors.joining(","));
```

修改为从 `getAllErrors` 方法中获取即可

```java
String validateMessage = ex.getBindingResult().getAllErrors().stream()
        .map(ObjectError::getDefaultMessage)
        .collect(Collectors.joining(","));
```

这样写 `PasswordUniformityValidator` 验证器就只能验证 `UserDTO` 了，我们总不能来个需求就创建一个这样的验证器，最好的方法是可以一劳永逸。我们可以利用反射来将其改造成一个通用的验证器

接下来，新建一个通用比较注解，并在注解中添加一个 `fieldNames` 数组属性，代表所有参与比较的字段名称

```java
@Documented
@Constraint(validatedBy = {FieldsEqualsValidator.class})
@Target({TYPE})
@Retention(RUNTIME)
public @interface FieldsEquals {

    /**
     * 字段名称
     */
    String[] fieldNames();

    String message() default "参数不合法";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

验证器

```java
public class FieldsEqualsValidator implements ConstraintValidator<FieldsEquals, Object> {

    private List<String> fieldNames;

    @Override
    public void initialize(FieldsEquals constraintAnnotation) {
        fieldNames = Arrays.asList(constraintAnnotation.fieldNames());
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        return fieldNames.stream().map(fieldName -> {
            //尝试获取get方法
            String getMethodName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
            Method method = ReflectionUtils.findMethod(value.getClass(), getMethodName);
            Assert.notNull(method, "can't find " + value.getClass().getName() + "." + getMethodName + "() method");
            return ReflectionUtils.invokeMethod(method, value);
        }).distinct().count() == 1;
    }
}
```

使用

```java
@Data
@FieldsEquals(fieldNames = {"password", "rePassword"},message = "密码输入不一致")
public class UserDTO{
    
    //... 省略其他代码
}
```



## 非controller类中使用

大部分情况下的校验都是在contrller中进行的，一般都是在contrller方法参数上使用 `@Validated` 或 `@Valid` 注解表明需要校验 

[@Validated和@Valid区别](https://blog.csdn.net/qq_27680317/article/details/79970590)

有些时候可能要在其他地方进行校验，必须Service相互调用时，在service层校验方法入参、项目启动时校验配置类属性注入，这个时候就要使用

`@Validated` 注解，将该注解标注在类上，就如同 `@Transactional` 注解一样，springboot会为这些方法进行切面处理



**属性配置类中使用**

```java
@Data
@Validated
@ConfigurationProperties(prefix = "xxx")
public class XxxApiProperties {

    /**
     * 网关
     */
    @Size(max = 64,message = "网关长度不能超过1")
    private String gateway;
}
```



**Service相互调用使用**

1. 需要再类上添加 `@Validated` 注解

2. 在方法参数上必须使用 `@Valid` 注解，使用 `@Validated` 无效

   ```java
   @Service
   @Validated
   public class UserService {
   
       public void saveUser(@Valid UserDTO dto) {
           System.out.println("save user success");
       }
   }
   
   
   /**
    * 用户服务测试
    *
    * @author clboy
    * @date 2023/06/05 16:24:12
    */
   @SpringBootTest
   class UserServiceTest {
   
       @Autowired
       private UserService userService;
   
       @Test
       public void test() {
           UserDTO dto = new UserDTO();
           dto.setProvince("1");
           dto.setUsername("张三");
           dto.setGender("1");
           dto.setAge(15);
           userService.saveUser(dto);
       }
   }
   ```

   



## 密码验证框架Passay

有时候我们的密码验证非常复杂，又不想自己写逻辑，可以使用 `Passay` 这个框架

官网地址：[https://www.passay.org](https://www.passay.org)

添加依赖

```xml
<dependency>
    <groupId>org.passay</groupId>
    <artifactId>passay</artifactId>
    <version>1.6.2</version>
</dependency>
```

注解和验证器

```java
@Documented
@Constraint(validatedBy = {PassayPasswordValidator.class})
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
public @interface Password {

    String message() default "密码不符合规则";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
```

```java
public class PassayPasswordValidator implements ConstraintValidator<Password, String> {

    private final SpringMessageResolver springMessageResolver;

    public PassayPasswordValidator(MessageSource messageSource) {
        springMessageResolver = new SpringMessageResolver(messageSource);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        PasswordValidator validator = new PasswordValidator(springMessageResolver,
                //长度在8到16个字符之间
                new LengthRule(8, 16),
                //至少有一个大写字母
                new CharacterRule(EnglishCharacterData.UpperCase, 1),
                //至少有一个小写字母
                new CharacterRule(EnglishCharacterData.LowerCase, 1),
                //至少有一个数字
                new CharacterRule(EnglishCharacterData.Digit, 1),
                //至少有一个特殊字符
                new CharacterRule(EnglishCharacterData.Special, 1),
                //不能是连续的5个字母，类似：abcde123
                new IllegalSequenceRule(EnglishSequenceData.Alphabetical, 5, false),
                //不能是连续的5个数字，类似：12345fgh
                new IllegalSequenceRule(EnglishSequenceData.Numerical, 5, false)
        );
        RuleResult validateResult = validator.validate(new PasswordData(value));
        //禁用掉默认的错误消息，就是注解中的message
        context.disableDefaultConstraintViolation();
        //设置错误消息
        context.buildConstraintViolationWithTemplate(String.join(",", validator.getMessages(validateResult)))
                .addConstraintViolation();
        return validateResult.isValid();
    }
}
```

`PasswordValidator` 构造器接收一个 `org.passay.MessageResolver` 类型的消息解析器，由于我们在spring boot中使用的，可以使用它内置提供的 `org.passay.spring.SpringMessageResolver`

然后在resources目录下的 `messages.properties` 文件中配置中文消息

```properties
email.error.msg=邮箱格式不合法
username.error.msg=用户名不能为空
gender.error.msg=性别只能为0（女）或 1（男）
age.error.msg=年龄必须在16到65岁之间
salary.error.msg=工资最多可以保留到小数点后两位
INSUFFICIENT_UPPERCASE=密码至少包含{0}个大写字母
INSUFFICIENT_LOWERCASE=密码至少包含{0}个小写字母
INSUFFICIENT_DIGIT=密码至少包含{0}个数字
INSUFFICIENT_SPECIAL=密码至少包含{0}个特殊字符
ILLEGAL_QWERTY_SEQUENCE=密码不能包含连续的字母：{0}
ILLEGAL_NUMERICAL_SEQUENCE=密码不能包含连续的数字：{0}
TOO_LONG=密码不能超过{1}个字符
TOO_SHORT=密码最少{0}个字符
```

其中有 `{}` 包围起来的是占位符，会被消息解析器替换成调用时传递的参数数组对应的下标中的值。具体参数数组中有哪些值我们可以debug查看

![录屏_jetbrains-idea_20221122174634](https://cdn.tencentfs.clboy.cn/images/2022/20221123090200795.gif)

测试

```http
POST http://localhost:8080/users/register
Content-Type: application/json
Accept-Language: zh-CN

{
  "username": "clboy",
  "gender": "1",
  "province": "1",
  "age": 18,
  "salary": 3131.00,
  "email": "44141@qq.com",
  "password": "123456",
  "rePassword": "654321"
}
```

响应结果

```json
{
  "msg": "接口调用失败",
  "data": "密码输入不一致,密码最少8个字符,密码至少包含1个大写字母,密码至少包含1个小写字母,密码至少包含1个特殊字符,密码不能包含连续的数字：123456",
  "code": "1"
}
```

