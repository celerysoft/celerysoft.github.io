---
layout: post
title: Shadowsocks-GUI For Mac OS使用指南
categories: MacOS
tags: [Shadowsocks, MacOS, Google]
---

之前介绍了[使用亚马逊AWS搭建免费的Shadowsocks服务器](http://celerysoft.github.io/2016-01-15.html)，但是关于[Shadowsocks-GUI For Mac OS](http://sourceforge.net/projects/shadowsocksgui/files/dist/)的使用指南只是一笔带过，今天就来探讨一下其的具体使用方法。

# 下载安装

首先到[Shadowsocks-GUI For Mac OS](http://sourceforge.net/projects/shadowsocksgui/files/dist/)页面下载，选择`.dmg`格式的下载，当然是下最新版啦，安装完成之后运行，在菜单栏就能看到Shadowsocks的图标了。

![01]( {{ site.postimage }}2016011801.png)

点击图标，可以看到，Shadowsocks的各项功能都集成在这了，任何相关操作和设置都要在这进行。

![02]( {{ site.postimage }}2016011802.png)

# 添加服务器

从菜单里选择`服务器->打开服务器设定...`来添加Shadowsocks服务器，你可以寻找免费的服务器，或者自己动手，按照[使用亚马逊AWS搭建免费的Shadowsocks服务器](http://celerysoft.github.io/2016-01-15.html)里面写的内容搭建属于自己的Shadowsocks服务器。

地址分别填上**服务器公网IP地址**和服务器上配置的**服务端口号**，

加密方法选择和服务器相同的**加密方法**，

密码为服务器上配置的**密码**，

最后备注就是服务器的备注信息，我一般是写服务器的类型。

![03]( {{ site.postimage }}2016011803.png)

# 创建自定义规则

从菜单可以看到，代理模式有两种：

1. 全局模式
2. 自动代理模式

顾名思义，**全局模式** 就是所有流量都走服务器，而 **自动代理模式** 是通过 **代理自动配置** （英语：Proxy auto-config，简称PAC）文件来配置走服务器的流量。使用自动代理模式可以实现国内网站直连，国外网站使用代理连接，即加速了浏览国内网站的速度，又节省了服务器的流量，一石二鸟。

那么，如何修改代理自动配置文件呢？菜单上有三个选项和这个相关：

1. 编辑自动模式的PAC...
2. 从GFWList更新PAC
3. 编辑GFWList的用户规则...

1的功能是定位PAC文件`gfwlist.js`的位置，2的功能是在线更新PAC文件，3的功能是定位用户规则文件`user-rule.txt`的位置。

直接修改PAC文件`gfwlist.js`并保存后，会自动通知浏览器重新加载。推荐用 Xcode 等代码编辑器来编辑。如果用系统自带的文本编辑器，引号可能自动半角变全角，需要撤销一下回到半角。但是这样有个问题，每次在线更新PAC文件后，手动修改的内容就会被覆盖掉，所以我们的自定义规则应该写到用户规则文件`user-rule.txt`里面。用户规则文件里网站的写法可以参考(Adblock Plus filters explained)[https://adblockplus.org/en/filter-cheatsheet]，两者的写法完全相同，下面是我的用户规则文件`user-rule.txt`的内容：

{% highlight JavaScript %}
! Put user rules line by line in this file.
! See https://adblockplus.org/en/filter-cheatsheet

||aws.amazon.com^
||amazonwebservices.com^
||cloudfront.net^
||google.com^

{% endhighlight %}

保存之后，兴冲冲地打开Google.com，发现还是漫长的加载，这是什么情况？别急，你只是把规则写到了用户规则文件`user-rule.txt`，但是并没有写到PAC文件`gfwlist.js`文件里呀，那要如何才能写到PAC文件里呢？简单，在线更新一次PAC文件即可，每次在线更新PAC文件，都会把用户规则文件的内容，写入PAC规则的末尾。

# 找出非常隐蔽的被墙掉的地址

好了，既然学会了自定义PAC文件，那么，想必应该是配置完毕了吧？当然不是，你有没有遇到过这种情况，明明把指定网址加到PAC里面了，但是打开该网址还是非常缓慢，或者只能看到部分控件，而网页主体始终刷不出来？但是将代理模式切到全局模式，又能正常打开该网页。

这又是为何？

其实，虽然目标网址是走了代理，但是目标网址上的一些资源（可能是某些JavaScript、CSS文件），可能是储存在某些被墙掉的地方，但是又没有添加到PAC文件里，所以使用全局代理模式时能轻松打开，但是使用自动代理模式时却又显示不出来，那么，如何解决呢？

## 使用日志来查找

从菜单里点击`显示日志...`，其实就是打开系统应用`控制台`，系统日志中所有以 **ShadowsocksX:** 开头的是Shadowsocks的日志，我们再右上角输入`ShadowsocksX`，即可只显示Shadowsocks的日志。我们在全局模式下，刷新一次在自动代理模式下打不开的网页，然后马上切到控制台查看Shadowsocks的日志，看看是否有遗漏没有添加到PAC文件的网址，如图中的`***.cloudfront.net`。

![04]( {{ site.postimage }}2016011804.png)

我们在用户规则文件`user-rule.txt`添加一行

{% highlight JavaScript %}
! Put user rules line by line in this file.
! See https://adblockplus.org/en/filter-cheatsheet

...

||cloudfront.net^

{% endhighlight %}

并执行一遍`从GFWList更新PAC文件`，即可。

## 使用浏览器来查找

当然，可以使用浏览器的开发者工具来查看目标网址所需的网络请求，然后将可以的地址加入到PAC文件即可。

![05]( {{ site.postimage }}2016011805.png)

# 扩展阅读

[Shadowsocks-GUI作者为用户写的使用说明](https://github.com/shadowsocks/shadowsocks-iOS/wiki/Shadowsocks-for-OSX-帮助)

关于Shadowsocks-GUI For Mac OS的使用指南就是以上这些，Windows的我没用过，所以无法对此妄写些什么，不过应该也是大同小异吧，而且可以预见的是，Windows版的肯定比Mac OS版的功能要多，用起来应该更趁手才是。
