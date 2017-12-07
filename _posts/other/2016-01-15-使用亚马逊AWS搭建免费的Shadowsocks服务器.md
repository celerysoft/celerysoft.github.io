---
layout: post
title: 使用亚马逊AWS搭建免费的Shadowsocks服务器
categories: Other
tags: [亚马逊, AWS, 长城]
---

作为研究学术和技术的，必须得使用Google，但是国家为了阻止天朝喷子为害天下，就架起了一道长城困住他们。作为被误伤的我们，想要走出长城，就得自己搭建梯子爬出去。购买VPN是非常危险的，很容易就被误伤，所以最好的方法是购买小众VPS搭建自己的海外服务器，防止被误伤。作为第一次捣鼓这些的人，我是十分不建议上来就花个几十美金购买VPS的，最好的方案是找一个免费的服务器来练练手，那么，亚马逊就站出来了，他家的Amazon Web Services，在一定条件下能免费使用一年。

当然，你必须有一张信用卡，没有的话，真是无能为力。

# 一、注册AWS

首先，到[http://aws.amazon.com/cn/](http://aws.amazon.com/cn/)注册，如果你以前有亚马逊账号，直接登录就好。一路下来资料照填，用中文即可。需要注意的是，注册过程需要绑定信用卡，说好是免费的，怎么还要绑定信用卡扣费呢？所谓免费，就是在你没有用超的情况下（作为Shadowsocks服务器，唯一能超限使用的就是网络流量，每月15G流量）。绑定信用卡应该会扣两笔钱，都是1美元，一笔是预授权，一笔应该是押金，1年后会返还，如果超限使用，顺便用着1美金抵扣。

注册完会需要输入你的手机号，AWS会拨通你的手机号，让你输入一个数字完成注册，我第一次没接到电话，重试了一遍就好了。

# 二、创建AWS实例

用刚才注册好的账号登录[AWS控制台](https://ap-northeast-1.console.aws.amazon.com/console/)，点击EC2（云中的虚拟服务器）

![01]( {{ site.postimage }}2016011501.png)

## 定制服务器类型

点击启动实例

![02]( {{ site.postimage }}2016011502.png)

勾选**仅免费套餐**，我选择了Amazon Linux AMI，我对Linux没什么研究（有什么说错的地方请斧正），就选了这个，你可以选择Ubuntu什么的，但接下来的教程都是按照Amazon Linux AMI为蓝本介绍的。

![03]( {{ site.postimage }}2016011503.png)

定制实例类型总共有7个项目，一个一个来，实例类型选择**t2 micro**，

![04]( {{ site.postimage }}2016011504.png)

然后下一步，接下来的都不用修改，直接下一步，到第五步标签和实例，这个可以按图这样设置，

![05]( {{ site.postimage }}2016011505.png)

配置安全组的时候，建议先允许所有流量，开放所有端口，这个可以稍后再修改，你可以自己配置适合自己的防火墙设置。

最后确定开始审核。这时候会提示生成密钥对，这个很重要，一定要保存好，没有这个密钥对是无法远程登录管理你的服务器的，所以一定要保存好。

![06]( {{ site.postimage }}2016011506.png)

## 连接到服务器

定制完成后等几分钟，一般是在给你的服务器进行开发，等初始化完成后，就可以进行远程连接了，右键你的实例，点击连接。会弹出连接提示，如果你使用的是Windows，可以查看[使用 PuTTY 从 Windows 连接到 Linux 实例](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/putty.html?console_help=true)，如果你是Linux或者Mac OS，可以直接通过SSH连接到你的服务器，具体可以查看亚马逊给出的文档[使用 SSH 连接到 Linux 实例](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)。

**记住下图中所示位置这个公有IP，它是你的Shadowssocks的服务器IP。**

![07]( {{ site.postimage }}2016011507.png)

![08]( {{ site.postimage }}2016011508.png)

主要说说使用Mac OS系统通过SSH连接到服务器

首先，打开终端，使用**chmod**命令确保私有密钥不是公开可见的：

{% highlight Bash%}
chmod 400 /Users/Celery/.ssh/celerysoft.pem
{% endhighlight %}

**/Users/Celery/.ssh/celerysoft.pem** 是刚才下载的密钥对.pem文件的路径。

{% highlight Bash%}
{% endhighlight %}

然后，通过**ssh**命令连接到服务器

{% highlight Bash%}
ssh -i /Users/Celery/.ssh/celerysoft.pem ec2-user@ec2-11-111-11-111.ap-northeast-1.compute.amazonaws.com
{% endhighlight %}

**ec2-user** 是用户名，Amazon Linux AMI默认的是ec2-user，

**ec2-11-111-11-111.ap-northeast-1.compute.amazonaws.com** 是你的服务器的公有DNS，这些信息右键点击你的实例，点击连接，弹出的提示框里都写着。

登录成功后，你能看到如下响应信息：

{% highlight Bash%}
The authenticity of host 'ec2-198-51-100-1.compute-1.amazonaws.com (10.254.142.33)'
can't be established.
RSA key fingerprint is 1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f.
Are you sure you want to continue connecting (yes/no)?
{% endhighlight %}

输入yes，然后按回车。

遇到任何问题，都可以查阅亚马逊的[帮助文档](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/AccessingInstances.html?console_help=true)。

# 三、在服务器安装及配置Shadowsocks

任何关于配置和安装Shadowsocks的说明，可以查阅[Shadowsocks的项目Wiki](https://github.com/shadowsocks/shadowsocks/wiki)。

## 安装Shadowsocks

以此输入以下命令来安装Shadowsocks

{% highlight Bash%}
sudo yum install -y python-setuptools
{% endhighlight %}

{% highlight Bash%}
sudo easy_install pip
{% endhighlight %}

{% highlight Bash%}
sudo pip install git+https://github.com/shadowsocks/shadowsocks.git@master
{% endhighlight %}

仔细看看有没有错误，如无错误即可继续

## 配置Shadowsocks

在终端输入

{% highlight Bash%}
ssserver -h
{% endhighlight %}

查看**Shadowsocks**的帮助，适合进阶玩家。

如果提示没有**ssserver**这个命令，可以通过

{% highlight Bash%}
which ssserver
{% endhighlight %}

查看Shadowsocks的路径，一般是在**/usr/local/bin**目录下，我们只需要把/usr/local/bin加入到/etc/profile文件中即可。

也可以通过

{% highlight Bash%}
/usr/local/bin/ssserver
{% endhighlight %}

来执行相应的命令。

例如查看帮助为

{% highlight Bash%}
/usr/local/bin/ssserver -h
{% endhighlight %}

接下来创建shadowsocks目录，用于存放配置文件

{% highlight Bash%}
mkdir /etc/shadowsocks
{% endhighlight %}

创建其配置文件

{% highlight Bash%}
sudo vim /etc/shadowsocks/config.json
{% endhighlight %}

配置文件的内容如下

{% highlight Bash%}
{

"server": "0.0.0.0",

"server_port": 443,

"local_address": "127.0.0.1",

"local_port": 1080,

"password": "celerysoft.github.io",

"timeout": 300,

"method": "aes-256-cfb",

"fast_open": false,

"workers": 1

}
{% endhighlight %}

配置文件说明 |
---------- | ----
server | 服务端监听地址(IPv4或IPv6)
server_port | 服务端端口，一般为443
local_address | 本地监听地址，缺省为127.0.0.1
local_port | 本地监听端口，一般为1080
password | 用以加密的密匙
timeout | 超时时间（秒）
method | 加密方法，默认为aes-256-cfb，更多请查阅[Encryption](https://github.com/shadowsocks/shadowsocks/wiki/Encryption)
fast_open | 是否启用[TCP-Fast-Open](https://github.com/shadowsocks/shadowsocks/wiki/TCP-Fast-Open)，true或者false
workers | [worker数量](https://github.com/shadowsocks/shadowsocks/wiki/Workers)，如果不理解含义请不要改（这个只在Unix和Linux下有用）

## 启动Shadowsocks服务器

依次输入以下命令来启动Shadowsocks

{% highlight Bash%}
sudo ssserver -c /etc/shadowsocks/config.json -d start
{% endhighlight %}

如果想停止Shadowsocks服务，可以这样停止

{% highlight Bash%}
sudo ssserver -c /etc/shadowsocks/config.json -d stop
{% endhighlight %}

如果更改了Shadowsocks的配置文件，可以通过restart命令来重启Shadowsocks服务

{% highlight Bash%}
sudo ssserver -c /etc/shadowsocks/config.json -d restart
{% endhighlight %}

## 设置Shadowsocks开机启动

服务器运行久了，偶尔需要重启一下，重启时每次都要手动启动hadowsocks的话就太麻烦了，可以将其加到开机启动项。

{% highlight Bash%}
sudo vi /etc/rc.local
{% endhighlight %}

将带有**ssserver**内容的行删除，最后加入

{% highlight Bash%}
sudo ssserver -c /etc/shadowsocks.json -d start
{% endhighlight %}

然后保存退出，这样，服务器上的操作就算完成了，接下来改对本地计算机进行操作了。

## 在AWS控制台开启相应的端口

需要在安全组里把相应的端口打开，这个自己处理吧。

# 四、本地连接至Shadowsocks服务器

下载[Shadowsocks-GUI客户端](http://sourceforge.net/projects/shadowsocksgui/files/dist/)

当然你也可以到GitHub下载最新的客户端：  
[Windows客户端下载地址](https://github.com/shadowsocks/shadowsocks-windows/releases)  
[macOS客户端下载地址](https://github.com/shadowsocks/shadowsocks-iOS/releases)  
[Linux客户端下载地址](https://github.com/shadowsocks/shadowsocks-qt5/releases)  

安装之后，添加服务器，地址为AWS的外网地址，登录[AWS控制台](https://ap-northeast-1.console.aws.amazon.com/ec2/)，查看正在运行中的实例，找到公有ip。
端口号为刚才配置Shadowsocks服务器时的端口号，密码也是刚才配置的，设置完之后保存。
由于Shadowsocks-GUI For Mac OS已经集成了系统Pac，所以无需任何额外设置，即可畅游互联网啦。

![09]( {{ site.postimage }}2016011509.png)

更详细的使用方法，请查看[Shadowsocks-GUI For Mac OS使用指南](http://celerysoft.github.io/2016-01-17.html)。

关于Windows下使用Shadowsocks的方法，还请自行搜索，想必也不复杂。

# 五、取消AWS服务防止到期后正确扣费的正确姿势

一言以蔽之，把你账户下所有AWS实例关闭并销毁。
如果你因为忘记销毁实例而导致一年之后额外扣费，也可以找客服反应你已经很久没有使用AWS服务了，只是忘记关闭了，客服核实之后会把费用返还你的。

> 参考：
>
> 1. [archlinux的Shadowsocks词条](https://wiki.archlinux.org/index.php/Shadowsocks)
> 2. [Shadowsocks的项目Wiki](https://github.com/shadowsocks/shadowsocks/wiki)
