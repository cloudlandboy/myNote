# 支付宝支付(沙箱)

## 注册

首先要去[支付宝开放平台](https://open.alipay.com/)注册账号，然后登录



## 创建应用

登录后选择开发者中心->研发中心

![1576975701986](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323055.png)



由于使用的是沙箱环境，已经创建好了沙箱测试应用，接下来只需要设置RSA2密钥即可，具体参考[官方文档](https://docs.open.alipay.com/200/105311)，官方有提供生成密钥的[工具](https://docs.open.alipay.com/291/105971)

密钥生成后将公钥(yuè)配置到沙箱，然后保存生成的支付宝公钥(yuè)

![1576919593220](https://cdn.tencentfs.clboy.cn/images/2021/20210911203322727.png)



## 电脑网站支付接入

具体参考官方[文档](https://docs.open.alipay.com/270/)，官方有提供[demo](https://docs.open.alipay.com/270/106291/)，但却是jsp版的，需要对其进行更改



## 项目接入

### 添加依赖

```xml
<!--支付宝支付-->
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.8.73.ALL</version>
</dependency>
```



### 配置文件

在`resources`目录下创建`alipay.properties`配置文件

```
#应用ID,您的APPID
alipay.appId=2016093000629372
#商户私钥，您的PKCS8格式RSA2私钥
alipay.privateKey=MIIEvQIB......
#支付宝公钥
alipay.alipayPublicKey=MIIBIjANBgkqhkiG9w0BAQEFA......
#服务器异步通知页面路径  需http=//格式的完整路径，不能加参数，必须外网可以正常访问
alipay.notifyUrl=http://leyou.free.idcfengye.com/akipayNotify
#页面跳转同步通知页面路径 需http=//格式的完整路径，不能加参数，必须外网可以正常访问
alipay.returnUrl=http://www.leyou.com/paysuccess.html
#签名方式
alipay.signType=RSA2
#字符编码格式
alipay.charset=utf-8
#支付宝网关(这里配置的是沙箱环境的网关)
alipay.gatewayUrl=https://openapi.alipaydev.com/gateway.do
#日志文件路径
alipay.logPath=/home/cloudlandboy/Project/leyou/aliPayLog
```



### 配置类

```
package com.leyou.order.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;

@Component
@PropertySource({"classpath:alipay.properties"})
@ConfigurationProperties(prefix = "alipay")
public class AlipayProperties {

    /**
     * 应用ID,您的APPID，收款账号既是您的APPID对应支付宝账号
     */
    private String appId = "";

    /**
     * 商户私钥，您的PKCS8格式RSA2私钥
     */
    private String privateKey = "";

    /**
     * 支付宝公钥
     */
    private String alipayPublicKey = "";

    /**
     * 服务器异步通知页面路径  需http://格式的完整路径，不能加?id=123这类自定义参数，必须外网可以正常访问
     */
    private String notifyUrl = "";

    /**
     * 页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，必须外网可以正常访问
     */
    private String returnUrl = "";

    /**
     * 签名方式
     */
    private String signType = "RSA2";

    /**
     * 字符编码格式
     */
    private String charset = "utf-8";

    /**
     * 支付宝网关
     */
    private String gatewayUrl = "https://openapi.alipay.com/gateway.do";

    /**
     * 支付宝网关
     */
    private String logPath = "/home/cloudlandboy/Project/leyou/aliPayLog";
    
    //getter,setter略

    /**
     * 记录日志
     *
     * @param sWord
     */
    private void logResult(String sWord) {
        FileWriter writer = null;
        try {
            writer = new FileWriter(logPath + "alipay_log_" + System.currentTimeMillis() + ".txt");
            writer.write(sWord);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (writer != null) {
                try {
                    writer.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```



### 工具类

```java
package com.leyou.order.utils;

@Component
public class AliPayHelper {

    @Autowired
    private AlipayProperties properties;

    /**
     * @param orderId
     * @param actualPay
     * @return
     * @throws
     */
    public String pay(String orderId, String actualPay) throws Exception {
        //获得初始化的AlipayClient
        AlipayClient alipayClient = new DefaultAlipayClient(properties.getGatewayUrl(), properties.getAppId(), properties.getPrivateKey(),
                "json", properties.getCharset(), properties.getAlipayPublicKey(), properties.getSignType());

        //设置请求参数
        AlipayTradePagePayRequest alipayRequest = new AlipayTradePagePayRequest();
        alipayRequest.setReturnUrl(properties.getReturnUrl());
        alipayRequest.setNotifyUrl(properties.getNotifyUrl());

        //请求参数
        Map<String, String> data = new HashMap<>(5);
        //商户订单号，商户网站订单系统中唯一订单号，必填
        data.put("out_trade_no", orderId);
        //付款金额，必填
        data.put("total_amount", actualPay);
        //订单名称，必填
        data.put("subject", "乐优商城测试订单");
        //商品描述，可空
        data.put("body", "乐优商城的订单");
        //该数据不要修改
        data.put("product_code", "FAST_INSTANT_TRADE_PAY");
        alipayRequest.setBizContent(JsonUtils.serialize(data));
        //请求
        String result = alipayClient.pageExecute(alipayRequest).getBody();

        //返回的是一个html源码，里面是个表单然后用js提交的
        return result;
    }


    /**
     * 调用SDK验证签名
     *
     * @param params
     * @return
     * @throws AlipayApiException
     */
    public boolean rsaCheckV1(Map<String, String> params) throws AlipayApiException {
        boolean signVerified = AlipaySignature.rsaCheckV1(params, properties.getAlipayPublicKey(), properties.getCharset(), properties.getSignType());
        return signVerified;
    }

    /**
     * 交易状态
     */
    public static class TradeStatus {
        /**
         * 交易关闭 0
         */
        public static final String TRADE_CLOSED = "TRADE_CLOSED";
        /**
         * 交易完结 0
         */
        public static final String TRADE_FINISHED = "TRADE_FINISHED";
        /**
         * 支付成功	1
         */
        public static final String TRADE_SUCCESS = "TRADE_SUCCESS";
        /**
         * 交易创建	0
         */
        public static final String WAIT_BUYER_PAY = "WAIT_BUYER_PAY";
    }
}
```



### 关于异步和同步通知

> 异步通知

参数中的异步通知是在用户付款成功之后支付宝会发送一个post请求给你的服务器，该请求中包含一些数据，由于是支付宝发的请求，所以这个请求地址要能被支付宝访问到，而我们是本机测试没有外网ip，所写的controlelr外网是不能访问到的，这里需要使用内网穿透工具，我这里使用的是 [Ngrok](http://www.ngrok.cc/)

> 同步通知

同步通知是用户付款成功后，支付宝将用户客户端重定向到配置的同步Url，同样会在url后添加一些参数



### Ngrok

注册后登录隧道管理>开通隧道，选择免费服务器

![1576920387603](https://cdn.tencentfs.clboy.cn/images/2021/20210911203322786.png)

填写需要转发到的本机端口地址，我的订单服务端口是`7009`

![1576920563097](https://cdn.tencentfs.clboy.cn/images/2021/20210911203322836.png)

记下生成的隧道id和域名，然后[下载客户端](http://www.ngrok.cc/download.html)

![1576920661551](https://cdn.tencentfs.clboy.cn/images/2021/20210911203322889.png)

下载后解压，进入解压后的目录运行，windows是`sunny.exe`

```shell
./sunny clientid 隧道id
```

![1576921124660](https://cdn.tencentfs.clboy.cn/images/2021/20210911203322946.png)

启动完成后访问域名测试能否成功访问 ，以debug启动应用，然后在登录拦截器中打上断店，访问域名看看能不能进入断点

?> 免费的产品速度可能不理想，耐心等待即可



### controller

修改`OrderController`添加支付宝支付接口

```
/**
 * 支付宝支付
 *
 * @param orderId
 * @return
 */
@GetMapping("alipay/{id}")
@ApiOperation(value = "支付宝支付，跳转到支付页面", notes = "支付宝支付")
@ApiImplicitParams({
        @ApiImplicitParam(name = "id", value = "订单编号", type = "Long"),
        @ApiImplicitParam(name = "actualPay", value = "应付金额", type = "Integer")
})
@ApiResponses({
        @ApiResponse(code = 200, message = "写出支付页面"),
        @ApiResponse(code = 404, message = "生成支付页面失败"),
        @ApiResponse(code = 500, message = "服务器异常")
})
public String alipay(@PathVariable("id") String orderId, Integer actualPay, HttpServletResponse response) throws Exception {
    DecimalFormat df = new DecimalFormat("0.00");
    String money = df.format(actualPay / 100.00);
    String form = this.aliPayHelper.pay(orderId, money);

    if (StringUtils.isBlank(form)) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND).toString();
    }
    response.setContentType("text/html;charset=utf-8");
    response.getWriter().write(form);
    response.getWriter().flush();
    response.getWriter().close();
    return null;
}
```

> 支付宝回调方法

```
/**
 * 获取支付宝POST过来反馈信息
 */
@PostMapping("/akipayNotify")
public void akipayNotify(HttpServletRequest request) throws AlipayApiException {
    Map<String, String[]> parameterMap = request.getParameterMap();
    Map<String, String> params = new HashMap<String, String>(parameterMap.size());
    for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
        params.put(entry.getKey(), StringUtils.join(entry.getValue(), ","));
    }
    System.out.println(params);
    boolean signVerified = this.aliPayHelper.rsaCheckV1(params);
    //验证成功
    if (signVerified) {
        //商户订单号orderId
        String out_trade_no = params.get("out_trade_no");

        //支付宝交易号
        String trade_no = params.get("trade_no");

        //交易状态
        String trade_status = params.get("trade_status");

        if (TradeStatus.TRADE_FINISHED.equals(trade_status)) {
            //退款日期超过可退款期限后（如三个月可退款），支付宝系统发送该交易状态通知
        } else if (TradeStatus.TRADE_SUCCESS.equals(trade_status)) {
            //付款完成后，支付宝系统发送该交易状态通知
            //更改订单状态
            this.orderService.updateStatus(Long.valueOf(out_trade_no), 2);
        }

    } else {
        //验证失败
        //调试用，写文本函数记录程序运行情况是否正常
        //String sWord = AlipaySignature.getSignCheckContentV1(params);
        //AlipayConfig.logResult(sWord);
    }

}
```

### 修改页面

> 修改getOrderInfo.html，添加支付宝支付

```html
<ul class="payType">
    <li :class="{selected: order.paymentType==1}" @click="order.paymentType=1">微信付款<span
            title="点击取消选择"></span></li>
    <li :class="{selected: order.paymentType==3}" @click="order.paymentType=3">支付宝付款<span
            title="点击取消选择"></span></li>
    <li :class="{selected: order.paymentType==2}" @click="order.paymentType=2">货到付款<span
            title="点击取消选择"></span></li>
</ul>
```

```java
submit() {


		//.....
		
		
        // 提交订单
        ly.http.post("/order", this.order, {
            transformResponse: [
                function (data) {
                    //不进行转换，依然当做字符串来使用,避免精度丢失
                    return data;
                }
            ]
        }).then(({data}) => {
            //删除掉下单的购物车
            ly.store.del("selectedCarts");
            //把redis购物车中下单的商品删除掉
            let skuIds = this.carts.map((item) => item.skuId).join(',');
            ly.http.delete("/cart/" + skuIds).then(() => {
                // 在线支付，需要到付款页
                switch (this.order.paymentType) {
                    case 1:
                        //微信支付
                        window.location = "pay.html?orderId=" + data + "&actualPay=" + this.actualPay;
                        break;
                    case 3:
                        //支付宝支付
                        window.location = ly.http.defaults.baseURL + "/order/alipay/" + data + "?actualPay=" + this.actualPay;
                        break;
                }
            });
        }).catch((resp) => {
            alert("订单提交失败，可能是缺货!")
        })
    }).catch(() => {
        alert("登录失效!");
        window.location.href = "/login.html?returnUrl=" + window.location.href;
    });
}
```



> 启动项目测试



交易成功后支付宝会将客户端重定向到配置的同步url，后面会添加上参数，其中有交易金额，修改支付成功页面更改支付金额显示

![1576974677100](https://cdn.tencentfs.clboy.cn/images/2021/20210911203323001.png)

```html
<div class="paysuccess" id="paysuccess">
    <div class="success">
        <h3><img src="img/_/right.png" width="48" height="48">　恭喜您，支付成功啦！</h3>
        <div class="paydetail">
            <p>支付方式：微信支付</p>
            <p>支付金额：￥{{total_amount}}元</p>
            <p class="button"><a href="home-index.html" class="sui-btn btn-xlarge btn-danger">查看订单</a>&nbsp;&nbsp;&nbsp;&nbsp;<a
                    href="index.html" class="sui-btn btn-xlarge ">继续购物</a></p>
        </div>
    </div>

</div>
```

```javascript
<script src="./js/vue/vue.js"></script>
<script src="./js/axios.min.js"></script>
<script src="./js/common.js"></script>
<script>
    const paysuccessVm = new Vue({
        el: "#paysuccess",
        data: {
            total_amount: 0,
        },
        created() {
            this.total_amount = ly.getUrlParam("total_amount") || 0;
        }
    })
</script>
```

同样修改微信的支付页面，成功后也给地址后面加上交易金额参数

> pay.html

```javascript
// 开启定时任务，查询付款状态
const taskId = setInterval(() => {
    ly.http.get("/order/state/" + this.orderId)
        .then(resp => {
            let i = resp.data;
            if (i === 1) {
                // 付款成功
                clearInterval(taskId);
                // 跳转到付款成功页
                location.href = "/paysuccess.html?orderId=" + this.orderId + "&total_amount=" + ly.formatPrice(this.actualPay);
            } else if (i === 2) {
                // 付款失败
                clearInterval(taskId);
                // 跳转到付款失败页
                location.href = "/payfail.html";
            }
        })
}, 3000);
```



### 演示

<video src="https://cdn.tencentfs.clboy.cn/videos/2021/20210911203323220.mp4" controls="controls" width="100%">
your browser does not support the video tag
</video>