# picgo重命名上传文件名插件

> PicGo: 一个用于快速上传图片并获取图片 URL 链接的工具
>
> [https://picgo.github.io/PicGo-Doc](https://picgo.github.io/PicGo-Doc)



## 源码及使用方法

[https://github.com/cloudlandboy/javaScript-utils/tree/master/picgo-plugin-dynamic-object-name](https://github.com/cloudlandboy/javaScript-utils/tree/master/picgo-plugin-dynamic-object-name)

1. 进入`picgo`  配置目录

   `~/.picgo/`。其中`~`为用户目录。不同系统的用户目录不太一样。

   linux 和 macOS 均为`~/.picgo/`。

   windows 则为`C:\Users\你的用户名\.picgo\`

2. 安装插件

   ```shell
   # 已上传到npm直接安装即可
   npm install picgo-plugin-dynamic-object-name
   ```



配置说明：

```json
{
  "picBed": {
    "current": "tcyun",
    "tcyun": {
      "secretId": "xxx",
      "secretKey": "xxx",
      "bucket": "xxx",
      "appId": "xxx",
      "area": "xxx",
      "path": "",
      "customUrl": "https://xxx.cn",
      "version": "v5"
    }
  },
  "picgoPlugins": {
    "picgo-plugin-dynamic-object-name": true
  },
  "picgo-plugin-dynamic-object-name": [
    {
      "condition": "**",
      "directory": "${YEAR}/",
      "fileNameMode": "FORMAT_TIME"
    }
  ]
}
```

`picgo-plugin-dynamic-object-name` 属性是插件的配置，为数组类型，数组元素为键值对象类型，有三个属性

- condition：glob匹配模式表达式，对上传文件的所在目录或文件名进行匹配，命中后会将文件上传到 `directory` 指定的目录(路径前缀)。
- directory：上传到的目录(路径前缀)，同picgo图床配置中的 `path` 属性，最终结果为 `path`+`directory`，可将`path` 定义为空字符串，完全由 `directory` 掌控。支持以下变量：
  - YEAR：当前年 `YYYY`
  - MONTH：当前月 `MM`
  - DATE：当前日期 `dd`
  - USER：当前操作系统用户
  - GIT_USERNAME：当前git全局配置的用户名  `git config --global user.name`
- fileNameMode：文件重命名模式，支持以下选项：
  - MILLISECONDS：当前毫秒数，1970年1月1日0时0分0 秒（UTC，即协调世界时）距离该日期对象所代表时间的毫秒数。`1662704833045`
  - FORMAT_TIME：当前时间戳。`YYYYMMddHHmmssSSS`
  - UUID：随机UUID，带 `-` 。 `f6510137-21b5-465b-b59f-ccad5f7d2fdf`
  - SIMPLE_UUID：随机UUID，不带 `-` 。 `f651013721b5465bb59fccad5f7d2fdf`
  - MD5：文件计算出的`md5` 值。`e21dc6967fd4285d961ae2b372d92eaf`
  - SHA1：文件计算出的`sha1` 值。`b4e874c165e731974c66003fe91c6b57d391ccfe`
  - SHA256：文件计算出的`sha256` 值。`b199b94d10838d3f286f5665b0a0b480ab4723697446b3e158d04404b6f86ce1`
  - SHA512：文件计算出的`sha512` 值。`e361e6547335987f72a1b578865d48cd724b09d8f0f41b2ad8693910112b6838af2e70343222a60d5df92cc690f30b43cbc13e6fe776dbd75b2877d2032498d6`

```json
{
  "condition": "**/*.png",
  "directory": "images/png/${YEAR}/",
  "fileNameMode": "FORMAT_TIME"
}
```

上面这表达式就会命中所有目录下以 `.png` 结尾的文件，最终会上传到 `images/png/${YEAR}/` 目录下，文件名为当前时间戳

`/home/clboy/Pictures/Wallpapers/abc-123.png`，上传到储存桶后的访问路径则为：`https://xxx.cn/images/png/2022/202201010000000.png`



## typora图片上传服务

> 相信很多人都会使用typora来写笔记，然后使用静态站点生成框架部署到github的pages或者自己的服务器，但是一般服务器的带宽都很小，笔记中如果包含图片之类的大文件会造成查看时图片显示延迟问题，一般都会使用图床或者储存桶的方式，将文件上传到图片服务器拿到访问路径，再将图片引用路径改为访问路径
>
> typora有个好用的功能就是可以配合 `picGo` 直接将插入到文档中图片上传到配置好的图片服务器，自动转换成网络路径



![20220909155729395](https://cdn.tencentfs.clboy.cn/images/2022/20220909155729395.png)

![20220909164259352](https://cdn.tencentfs.clboy.cn/images/2022/20220909164259352.gif)



## 代码实现



### 工具类

> 这里依赖库除了 `uuid` 都是 `nodejs` 自带的模块

- getTimeString：`function` 用于获取当前时间(年月日时分秒毫秒)拼接成的字符串
- getFileHash：`function` 用户获取文件的签名
- fileNameModeHandler：`object` key为支持的文件名模式，value为对应的实现函数，两个参数。
  - input：调用picgo时传入的，要么是文件路径，要么是图片的base64。
  - date：当前日期时间，保证整个代码处理中日期不会出现误差，应使用同一实例

```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * @description:  不足长度前补0
 * @param {number} number 数字
 * @param {number} [length] 长度，默认2
 * @return {string} 补足位数后字符串
 */
export function padStartZero(number: number, length?: number): string {
    if (isNaN(length)) {
        length = 2;
    }
    return (number + '').padStart(length, '0');
}

/**
 * @description: 获取时间字符串：年(2022)月(01)日(02)时(03)分(04)秒(05)毫秒(006)
 * @param {Date} date 日期
 * @return {string} 时间字符串：20220102030405006
 */
export function getTimeString(date: Date): string {
    return padStartZero(date.getFullYear())
        + padStartZero(date.getMonth() + 1)
        + padStartZero(date.getDate())
        + padStartZero(date.getHours())
        + padStartZero(date.getMinutes())
        + padStartZero(date.getSeconds())
        + padStartZero(date.getMilliseconds(), 3)
}

/**
 * @description: 睡眠指定毫秒
 * @param {number} millis 毫秒
 */
export function sleep(millis: number) {
    return new Promise((resolve) => setTimeout(resolve, millis))
}

/**
 * @description: 获取文件hash值
 * @param {string} filePath 文件路径
 * @param {string} algorithm hash算法
 * @return {string} hash后16进制值
 */
export function getFileHash(filePath: string, algorithm: string): string {
    if (!path.isAbsolute(filePath) || !fs.existsSync(filePath)) {
        return '';
    }
    let stat = fs.statSync(filePath);
    if (!stat.isFile()) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash(algorithm);
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

/**
 * @description: 文件名模式对应处理，参数是传入的input和当前时间
 * @return {string} 文件名，不包含后缀
 */
export const fileNameModeHandler = {
    MILLISECONDS(input: string, date: Date) {
        return date.getTime();
    },
    FORMAT_TIME(input: string, date: Date) {
        return getTimeString(date);
    },
    UUID(input: string, date: Date) {
        return uuidv4();
    },
    SIMPLE_UUID(input: string, date: Date) {
        return uuidv4().replace(/\-/g, '');
    },
    MD5(input: string, date: Date) {
        return getFileHash(input, 'md5');
    },
    SHA1(input: string, date: Date) {
        return getFileHash(input, 'sha1');
    },
    SHA256(input: string, date: Date) {
        return getFileHash(input, 'sha256');
    },
    SHA512(input: string, date: Date) {
        return getFileHash(input, 'sha512');
    }
}
```



### 变量解析

> 这里就是使用正则表达式从字符串中提取到 `${}` 符号中变量，变量替换实现和工具类中  `fileNameModeHandler` 对象类似，判断`variableMapping` 对象中是否包含变量对应的属性，有则以函数的形式调用将变量替换成函数返回值

```typescript
import { padStartZero } from "./utils"
import childProcess from "child_process"

export interface IVariableParser {
  parse(text: string): string;
  support(variable: string): boolean;
}

/**
 * @description: 变量解析器，${变量}，支持变量列表：
 * YEAR：当前年
 * MONTH：当前月
 * DATE：当前日期
 * USER：当前操作系统用户
 * GIT_USERNAME：git config user.name
 */
export default class VariableParser implements IVariableParser {
  private date: Date;
  constructor(date: Date) {
    this.date = date || new Date();
  }

  parse(text: string) {
    const regExp = /\$\{(\w+)\}/g;
    let matchResult = null;
    let nextSubStart = 0;
    let result = '';
    while ((matchResult = regExp.exec(text)) != null) {
      if (this.support(matchResult[1])) {
        result = result + text.substring(nextSubStart, matchResult.index)
          + VariableParser.variableMapping[matchResult[1]](this);
        nextSubStart = matchResult.index + matchResult[0].length;
      }
    }

    if (nextSubStart < text.length) {
      result += text.substring(nextSubStart);
    }
    return result;
  }

  support(variable: string) {
    return !!VariableParser.variableMapping[variable];
  }

  private static variableMapping = {
    YEAR(vm: VariableParser) {
      return padStartZero(vm.date.getFullYear());
    },
    MONTH(vm: VariableParser) {
      return padStartZero(vm.date.getMonth() + 1);
    },
    DATE(vm: VariableParser) {
      return padStartZero(vm.date.getDate());
    },
    USER(vm: VariableParser) {
      return process.env.SUDO_USER ||
        process.env.C9_USER ||
        process.env.LOGNAME ||
        process.env.USER ||
        process.env.LNAME ||
        process.env.USERNAME;
    },
    GIT_USERNAME(vm: VariableParser) {
      try {
        return childProcess.execSync('git config user.name');
      } catch (err) {
        return '';
      }
    },
  }
}
```



### beforeUploadPlugins

> picgo的beforeTransformPlugins插件会在文件上传之前调用，可以在这里对上传文件名进行更改
>
> micromatch：glob模式匹配，用来匹配文件路径的。

这里的逻辑就是遍历input数组，如果数组中的元素是文件绝对路径，则从配置中find出一条匹配的 `condition`  将上传路径更改为配置的 `directory` 替换变量后的值，文件名选项如果配置正确则替换为选项实现函数返回的值

```typescript
import picgo from 'picgo'
import micromatch from 'micromatch'
import VariableParser from './variable-parser'
import { sleep, fileNameModeHandler } from './utils'
import { IPicGo } from 'picgo/dist/src/types'


/**
 * @description: 上传前处理插件逻辑
 * @param {object} ctx picgo
 * @return {object} ctx
 */
const handle = async (ctx: IPicGo) => {
  const configList: any[] = ctx.getConfig('picgo-plugin-dynamic-object-name') || [];
  for (let i = 0; i < ctx.input.length; i++) {
    let matchConfig = configList.find(conf => micromatch.isMatch(ctx.input[i], conf.condition));
    if (!matchConfig) {
      continue;
    }
    let now = new Date();
    let directory = (matchConfig.directory && matchConfig.directory.trim()) || '';
    //目录
    if (directory.length > 0) {
      let parser = new VariableParser(now);
      directory = parser.parse(directory);
      if (!directory.endsWith('/')) {
        directory += '/';
      }
    }

    //文件名
    if (matchConfig.fileNameMode && fileNameModeHandler[matchConfig.fileNameMode]) {
      let fileName = fileNameModeHandler[matchConfig.fileNameMode](ctx.input[i], now);
      if (fileName) {
        ctx.output[i].fileName = fileName + ctx.output[i].extname;
      }
    }
    ctx.output[i].fileName = directory + ctx.output[i].fileName;
    //防止时间戳重复
    await sleep(100);
  }
}

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.beforeUploadPlugins.register('dynamic-object-name', { handle })
  }
  return {
    register
  }
}
```
