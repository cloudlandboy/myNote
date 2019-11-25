# IDEA


## 设置

- 快捷键设置：file-->settings-->Keymap
- 字符集设置：file-->settings-->Editor-->File Encodings
- 插件：file-->settings-->Plugins
- 设置JVM运行参数 Help-->Edit Customer VM options 或者(用户目录/.IntelliJIdea2019.2/config/idea64.vmoptions)，编辑安装目录下的idea.vmoptions和idea64.vmoptions好像没什么卵用


## 插件

- `Alibaba java Coding Guidelines` 阿里巴巴java开发规格  帮助我们提高编码规范
- `Free Mybatis plugin` 帮助我们跳转mapper.xml文件和mapper类
- `Grep Console`  设置log的等级颜色  使日志更加显眼
- `Maven Helper` Mavne插件 可以右键 run maven
- `Translation` 翻译插件

## 问题解决

`maven`创建`web`项目`web.xml`版本问题解决，参考连接：[（亲测解决）Idea创建Maven Web工程的web.xml版本问题解决](https://blog.csdn.net/sinat_34104446/article/details/82895337 "Idea创建Maven Web工程的web.xml版本问题解决")

新建`maven`项目显示为灰色，右键没有`maven`菜单，点击File-->settings 搜索`maven`，选中 <mark>Ignored Files</mark>，取消对应的复选框

`Maven Helper` 删除不用的`goal`，找到 用户目录(/home/cloudlandboy)/.IntelliJIdea2019.2/config/options/mavenRunHelper.xml，删掉不要的goal标签，重启idea

## idea 快捷键

- ==Ctrl+Alt+左==：回到上次光标所在处
- ==Ctrl+F3==：向下搜索相同单词
- ==Shift+F3==：向上搜索相同单词
- ==Ctrl+n==：搜索java类名
- ==Ctrl+Shift+N==：搜索文件名
- ==Ctrl+Shift+F==：全局搜索文件内容

