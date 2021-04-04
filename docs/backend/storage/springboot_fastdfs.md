# Springboot整合FastDfs

> 余庆先生提供了一个Java客户端，但是已经很久不维护了。
>
> 这里推荐一个开源的FastDFS客户端，支持SpringBoot2.0。
>
> 配置使用极为简单，支持连接池，支持自动生成缩略图
>
> 地址：https://github.com/tobato/FastDFS_Client



## 添加依赖

```xml
<dependency>
    <groupId>com.github.tobato</groupId>
    <artifactId>fastdfs-client</artifactId>
    <version>1.27.2</version>
</dependency>
```

## 配置

```yaml
fdfs:
  so-timeout: 1501 # 超时时间
  connect-timeout: 601 # 连接超时时间
  thumb-image: # 缩略图
    width: 60
    height: 60
  tracker-list: # tracker地址：你的tracker服务器地址+端口（默认是22122）
    - 192.168.46.99:22122
server:
  port: 8080
spring:
  application:
    name: demo-springboot-file-upload-fastdfs
  servlet:
    multipart:
      max-file-size: 4MB #限制文件上传的大小
```

## 测试

```java
package cn.cbloy.demo.springboot.file.upload.fastdfs.service;

import cn.cbloy.demo.springboot.file.upload.fastdfs.utils.UploadFileUtil;
import cn.hutool.core.io.FileUtil;
import com.github.tobato.fastdfs.domain.fdfs.MetaData;
import com.github.tobato.fastdfs.domain.fdfs.StorePath;
import com.github.tobato.fastdfs.domain.fdfs.ThumbImageConfig;
import com.github.tobato.fastdfs.service.FastFileStorageClient;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Set;

import static org.junit.Assert.assertEquals;

/**
 * FastFileStorageClient客户端
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class FastFileStorageClientTest {

    @Autowired
    protected FastFileStorageClient storageClient;

    @Autowired
    private ThumbImageConfig thumbImageConfig;
    protected static Logger LOGGER = LoggerFactory.getLogger(FastFileStorageClientTest.class);

    /**
     * 上传文件，并且设置MetaData
     */
    @Test
    public void testUploadFileAndMetaData() throws IOException {

        File file = new ClassPathResource("images/001.jpg").getFile();
        Set<MetaData> metaData = UploadFileUtil.fileMetaData(file);

        //inputStream，文件大小，文件后缀，MetaData
        StorePath path = storageClient.uploadFile(new FileInputStream(file), file.length(), FileUtil.extName(file), metaData);
        LOGGER.info("上传文件路径{}", path);

        // 验证获取MetaData
        LOGGER.info("##获取Metadata##");
        Set<MetaData> fetchMetaData = storageClient.getMetadata(path.getGroup(), path.getPath());
        assertEquals(fetchMetaData, metaData);

        LOGGER.info(metaData.toString());
    }

    /**
     * 不带MetaData也应该能上传成功
     */
    @Test
    public void testUploadFileWithoutMetaData() throws IOException {
        File file = new ClassPathResource("images/002.jpg").getFile();

        // 上传文件和Metadata
        StorePath path = storageClient.uploadFile(new FileInputStream(file), file.length(), FileUtil.extName(file), null);
        LOGGER.info(path.getFullPath());
    }


    /**
     * 删除文件
     */
    @Test
    public void testDeleteFile() {
        String filePath = "group1/M00/00/00/wKguY2BhiZ2ARX3DAALhXg-WaKI549.jpg";
        storageClient.deleteFile(filePath);
    }


    /**
     * 上传图片，并且生成缩略图
     * 
     * 缩略图为上传文件名+缩略图后缀 _150x150,如 xxx.jpg,缩略图为 xxx_150x150.jpg
     * 
     * 实际样例如下
     *     http://192.168.46.99/group1/M00/00/17/rBEAAl33pQaAWNQNAAHYvQQn-YE374.jpg
     *     http://192.168.46.99/group1/M00/00/17/rBEAAl33pQaAWNQNAAHYvQQn-YE374_150x150.jpg
     *	
     */
    @Test
    public void testUploadImageAndCrtThumbImage() throws IOException {
        File imgFile = new ClassPathResource("images/002.jpg").getFile();
        StorePath storePath = storageClient.uploadImageAndCrtThumbImage(new FileInputStream(imgFile), imgFile.length(), FileUtil.extName(imgFile), null);
        LOGGER.info("上传文件路径：{}", storePath.getFullPath());

        // 这里需要一个获取从文件名的能力，所以文件名配置以后就最好不要改了
        String slavePath = thumbImageConfig.getThumbImagePath(storePath.getPath());
        LOGGER.info("缩略图路径：{}", slavePath);
    }

}
```

