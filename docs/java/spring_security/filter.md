# 过滤器和过滤器链



## 过滤器

> 学过java web基础应该都会知道servlet和filter
>
> Servlet 过滤器可以动态地拦截请求和响应，可以将一个或多个 Servlet 过滤器附加到一个 Servlet 或一组 Servlet，调用 Servlet 前调用所有附加的 Servlet 过滤器
>
> spring web应用本质上也只是一个servlet

![img](https://cdn.tencentfs.clboy.cn/images/2022/20221103113254285.png)



![20221031162707](https://cdn.tencentfs.clboy.cn/images/2022/20221103113257832.png)



## spring security filter

一个请求到达了spring security资源服务器，会经过以下过滤流程

1. 过滤器需要从请求中提取用户名/密码。你可以将参数由 `HTTP请求头` 、`表单字段` 或者 `cookie` 等携带到服务器。
2. 过滤器将从参数中提取出的用户名密码与服务端存储的进行校验（认证）
3. 用户名密码验证成功后就需要检查用户对所访问的路径资源是否有权限（授权）
4. 一系列验证流程都通过后就将请求交给后续filter处理，最终请求会到达 `DispatcherServlet` 和你写的 `Controller`



以下是 spring security filter 的伪代码，实际上security的一系列验证流程是由 **多个filter组成的过滤器链** 完成

![mpv-shot0001](https://cdn.tencentfs.clboy.cn/images/2022/20221103113301968.jpg)

![mpv-shot0002](https://cdn.tencentfs.clboy.cn/images/2022/20221103113306238.jpg)

将security的日志开启为 `debug` 模式，重启查看控制台日志，搜索 `DefaultSecurityFilterChain` 可以看到日志中输出的默认过滤器链

```yaml
logging:
  level:
    org.springframework.security: debug
```



Spring Security的入口是 `FilterChainProxy`  过滤器，这个过滤器处理所有请求，根据请求路径匹配该路径应该执行的过滤器链

```java
package org.springframework.security.web;

public class FilterChainProxy extends GenericFilterBean {
    
    private List<SecurityFilterChain> filterChains;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
          throws IOException, ServletException {

       try {
          doFilterInternal(request, response, chain);
       }
        
    }

    private void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain)
          throws IOException, ServletException {
       // 包装请求和响应
       FirewalledRequest firewallRequest = this.firewall.getFirewalledRequest((HttpServletRequest) request);
       HttpServletResponse firewallResponse = this.firewall.getFirewalledResponse((HttpServletResponse) response);
       // 根据请求匹配过滤器链
       List<Filter> filters = getFilters(firewallRequest);
       if (filters == null || filters.size() == 0) {
          firewallRequest.reset();
          chain.doFilter(firewallRequest, firewallResponse);
          return;
       }

       // 执行过滤器链
       VirtualFilterChain virtualFilterChain = new VirtualFilterChain(firewallRequest, chain, filters);
       virtualFilterChain.doFilter(firewallRequest, firewallResponse);
    }

    // 调用过滤器链的matches方法判断此过滤器链是否匹配该请求
    private List<Filter> getFilters(HttpServletRequest request) {
       for (SecurityFilterChain chain : this.filterChains) {
          if (chain.matches(request)) {
             return chain.getFilters();
          }
       }
       return null;
    }
}
```