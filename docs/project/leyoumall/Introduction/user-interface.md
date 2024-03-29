# 用户中心接口说明



## 1.数据校验

### 功能说明

实现用户数据的校验，主要包括对：手机号、用户名的唯一性校验。

### 接口路径

``` http
GET /check/{data}/{type}
```

### 参数说明：

| 参数 | 说明                                   | 是否必须 | 数据类型 | 默认值 |
| ---- | -------------------------------------- | -------- | -------- | ------ |
| data | 要校验的数据                           | 是       | String   | 无     |
| type | 要校验的数据类型：1，用户名；2，手机； | 否       | Integer  | 无     |

### 返回结果：

返回布尔类型结果：

- true：可用
- false：不可用

状态码：

- 200：校验成功
- 400：参数有误
- 500：服务器内部异常



## 2.生成短信验证码

### 功能说明

根据用户输入的手机号，生成随机验证码，长度为6位，纯数字。并且调用短信服务，发送验证码到用户手机。

### 接口路径

``` http
POST /code
```

### 参数说明：

| 参数  | 说明           | 是否必须 | 数据类型 | 默认值 |
| ----- | -------------- | -------- | -------- | ------ |
| phone | 用户的手机号码 | 是       | String   | 无     |

### 返回结果：

无

状态码：

- 204：请求已接收
- 400：参数有误
- 500：服务器内部异常



## 3.用户注册

### 功能说明

实现用户注册功能，需要对用户密码进行加密存储，使用MD5加密，加密过程中使用随机码作为salt加盐。另外还需要对用户输入的短信验证码进行校验。

### 接口路径

``` http
POST /register
```

### 参数说明：

form表单格式

| 参数     | 说明                                     | 是否必须 | 数据类型 | 默认值 |
| -------- | ---------------------------------------- | -------- | -------- | ------ |
| username | 用户名，格式为4~30位字母、数字、下划线   | 是       | String   | 无     |
| password | 用户密码，格式为4~30位字母、数字、下划线 | 是       | String   | 无     |
| phone    | 手机号码                                 | 是       | String   | 无     |
| code     | 短信验证码                               | 是       | String   | 无     |

### 返回结果：

无返回值。

状态码：

- 201：注册成功
- 400：参数有误，注册失败
- 500：服务器内部异常，注册失败



## 4.根据用户名和密码查询用户

### 功能说明

查询功能，根据参数中的用户名和密码查询指定用户

### 接口路径

``` http
GET /query
```

### 参数说明：

form表单格式

| 参数     | 说明                                     | 是否必须 | 数据类型 | 默认值 |
| -------- | ---------------------------------------- | -------- | -------- | ------ |
| username | 用户名，格式为4~30位字母、数字、下划线   | 是       | String   | 无     |
| password | 用户密码，格式为4~30位字母、数字、下划线 | 是       | String   | 无     |

### 返回结果：

用户的json格式数据

```json
{
    "id": 6572312,
    "username":"test",
    "phone":"13688886666",
    "created": 1342432424
}
```



状态码：

- 200：返回查询数据
- 400：用户名或密码错误
- 500：服务器内部异常，查询失败



## 5.查询用户物流地址

待开发

## 6.新增用户物流地址

待开发

## 7.修改用户物流地址

待开发

## 8.删除用户物流地址

待开发

## 9.修改地址为默认地址



