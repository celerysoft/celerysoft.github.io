---
layout: post
title: Supervisor使用心得
categories: Linux
tags: [Supervisor, 进程控制]
---

[Supervisor](http://supervisord.org/)是一个运行在UNIX-like操作系统上，允许用户监视及管理进程的C/S系统(client/server system)。

最近终于把自己的网站写好了，需要用到**Supervisor**来监控后台服务进程，在服务不小心挂掉时自动重启服务。

以下的文字是在CentOS 7.3里操作总结出来的，不保证在其他发行版里同样适用。

# 一 安装Supervisor

因为我的网站是用Python写的，我已经装了pip，所以通过pip来安装

```
pip install supervisor
```                 

除了这个安装方法，官方还提供了两种安装方案：
* 使用`easy_install`

```
easy_install supervisor
```

* 下载程序包使用命令自行安装

进入[PyPi](https://pypi.python.org/pypi/supervisor)下载Supervisor，然后进入该目录，输入

```
python setup.py install
```

命令进行安装。

# 二 配置Supervisor

当安装好**Supervisor**之后，使用`echo_supervisord_conf`命令可以打印出**Supervisor**配置文件的模版，在`/etc/`下，应该默认生成了一个配置文件`supervisord.conf`，你可以使用`echo_supervisord_conf > /etc/supervisord_new.conf`命令让**Supervisor**启用新的配置文件，但一般我们不需要这么做。

输入

```
supervisord
```

运行**Supervisord**，当此时**Supervisord**并不包含任何功能，我们还需要配置**Supervisord**需要监视的进程。

查看**Supervisord**是否正在运行：
```
ps aux | grep supervisord
```

# 三 配置监视的进程

**Supervisor**的默认配置文件的最后是以下内容：

```
[include]
files = supervisord.d/*.ini
files = supervisord.d/*.conf
```

所以我们只需要将需要监视的进程的信息写成一个配置文件放到`/etc/susupervisord.d/`下，来看看这个配置文件怎么写。

就拿我的网站本身来说吧，项目代码位于`/var/www/website/`下，当我手动启动网站服务时，需要执行以下命令：

{% highlight Bash%}
cd /var/www/website/
venv/bin/uwsgi uwsgi_config.ini
{% endhighlight %}

那么写成配置文件：

{% highlight Bash%}
[program:website]
 
# 命令程序所在目录
directory = /var/www/website/
# 启动命令
command = /var/www/website/venv/bin/uwsgi uwsgi_config.ini
# 运行命令的用户名
user = nginx
# 在 supervisord 启动的时候也跟随启动
autostart = true
# 进程异常退出后自动重启
autorestart = true
# 启动 5 秒后没有异常退出，就当作已经正常启动了
startsecs = 5
# 进程异常退出后自动重启的次数
startretries = 3
# stdout日志文件，需要注意当指定目录不存在时无法正常启动，所以需要手动创建目录（Supervisord会自动创建日志文件）
stdout_logfile = /var/www/flask/log/out.log
# stderr日志文件，需要注意当指定目录不存在时无法正常启动，所以需要手动创建目录（Supervisord会自动创建日志文件）
stderr_logfile = /var/www/flask/log/err.log
{% endhighlight %}

注意第一行的`[program:website]`，这个**website**表示这个进程的别名，会在**supervisorctl**中有很大用途，马上你就会知道了。

# 四 使用supervisorctl控制进程

这个很简单，在终端执行对应命令即可，我选几个常用的吧。
{% highlight Bash%}
# 查看帮助
supervisorctl help
# 获取所有进程的状态信息
supervisorctl status
# 启动别名为website的进程
supervisorctl start website
# 重启配置文件更改过的进程
supervisorctl update website
{% endhighlight %}

# 最后

所有关于**Supervisor**的信息都可以在其官网找到，我只是介绍了一小部分，更多的还请移步：[http://supervisord.org/index.html](http://supervisord.org/index.html)
