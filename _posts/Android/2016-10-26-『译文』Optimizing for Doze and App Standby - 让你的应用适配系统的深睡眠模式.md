---
layout: post
title: 『译文』Optimizing for Doze and App Standby - 让你的应用适配系统的深睡眠模式和应用待命状态
categories: Android
tags: [Android, app, Doze, 深睡眠]
---

原文标题：Optimizing for Doze and App Standby  
原文地址：[https://developer.android.com/training/monitoring-device-state/doze-standby.html](https://developer.android.com/training/monitoring-device-state/doze-standby.html)  

> 译者注：最近买了台Nexus 5x来玩，发现以前跑得好好的App里面的一些定时任务有时候会出现一些延迟，查了查资料，发现了这篇官方文章，翻译过来让大家看看。翻译完之后匆匆校对了一下，肯定还有很多错误，还请不吝赐教。
> Doze译为『深睡眠模式』，App Standby译为『应用待命状态』，这两个单词为本文的核心，建议谷歌了解一下。

从Android 6.0(API 23)开始，Android新增了2个关于电池节能的新特性，在设备不处于充电状态下时，通过管理应用程序们的行为，来达到为用户提升电池续航的目的。当设备处于待机状态一定时间后，系统就会进入深睡眠模式，深睡眠模式通过推迟应用程序的网络活动以及对CPU的后台使用，来减少电池消耗。应用待命状态则是推迟那些用户最近没有与之交互的应用程序的后台网络活动。

深睡眠模式和应用待命状态影响着所有运行在Android 6.0及以上设备里的应用程序，不管这些应用程序是否显示地指定他们的目标API为23。为了确保给用户最好的使用体验，最好在深睡眠模式和应用待命状态下测试你的应用程序，适当地调整你的代码，是十分有必要的，接下来我们将详细说明怎么做。

# 了解深睡眠模式(Doze)

如果一台Android设备没有连接充电器、屏幕关闭，并且在很长一段时间里静止不动，那么它就会进入深睡眠模式。在深睡眠模式下，系统通过限制应用程序对网络的访问，以及对CPU的大规模使用，来维持电池电量。同时，帐号同步、标准提醒也会被限制。

> 译者注：帐号同步指[sync adapters](https://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html)的帐号同步机制，标准提醒指的是[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)，下文有详细提及

处于深睡眠模式时，系统会定期退出深睡眠模式一小段时间来让各个应用程序完成它们被推迟的活动。在这一小段时间内(称之为维护窗口，下图中的maintenance window)，系统会运行所有被推迟的同步、工作调度、提醒等等，以及让应用程序们连接到网络。

> 译者注：工作调度指[JobScheduler](https://developer.android.com/reference/android/app/job/JobScheduler.html)

![01]( {{ site.postimage }}2016102601.png)

**图 1** 深睡眠模式采用一种循环的自唤醒机制，以便让应用程序们在维护窗口内使用网络以及处理那些尚未完成的活动。

在维护窗口的结尾，系统再次进入深睡眠模式，暂停网络访问，推迟同步、工作调度、提醒。随着时间的不断推移，系统打开维护窗口的频率会越来越低，以便设备没在充电并且处于长时间的待机状态时，减少电池的消耗。

设备在以下任一情况中就会退出深睡眠模式：被移动，屏幕被手动点亮，连接了充电器。退出深睡眠模式之后，所有的应用程序就会回到正常的工作模式。

# 深睡眠模式会怎么限制你的应用？

在深睡眠模式下，你的应用程序会受到以下限制：

* 暂停网络访问
* 系统忽略你的[Wake Lock](https://developer.android.com/reference/android/os/PowerManager.WakeLock.html)请求
* 标准的[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)提醒（包括`setExact()`和`setWindow()`)会被推迟到下个维护窗口
  * 如果你需要设置在深睡眠模式下仍旧能工作的提醒，请使用`setAndAllowWhileIdle()`或者`setExactAndAllowWhileIdle()`
  * 通过`setAlarmClock()`设置的提醒仍会正常工作，系统会在这些提醒之前短暂地退出深睡眠模式
* 系统不会进行Wi-Fi扫描
* 系统不允许[sync adapters](https://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html)工作
* 系统不允许[JobScheduler](https://developer.android.com/reference/android/app/job/JobScheduler.html)工作

# 为你的应用程序适配深睡眠模式

深睡眠模式对不同的应用程序有着不同的影响，这要看应用程序进行什么样的工作。在不进行适配的情况下，一些应用程序功能可以很完美地兼容深睡眠模式，但另一些功能就不好说了。如果你的应用程序涉及到网络连接，提醒，工作调度，同步等功能，你必须优化你的应用程序，让它在通过维护窗口时，高效地进行那些被推迟以致未完成的工作。

深睡眠模式对需要用到AlarmManager和一些计时器、倒计时相关的应用程序的影响尤其严重，因为那些目标API为22(Android 5.1)及以下编译的应用程序，当系统进入深睡眠模式时，提醒不会被正常响应。

为了帮助一些行程类提醒的正常工作，自Android 6.0(API 23)起，我们为AlarmManager提供了两个新方法：`setAndAllowWhileIdle()`和`setExactAndAllowWhileIdle()`。使用这两个方法来设置的提醒，即便系统处于深睡眠模式，也会被正常响应。

> 注意：不论是`setAndAllowWhileIdle()`还是`setExactAndAllowWhileIdle()`，每个应用程序每9分钟内只能执行一次。

深睡眠模式下限制对网络的访问也很有可能会影响到你的应用程序，尤其是那些即时通讯，如果你的应用程序需要持续地连接互联网以便接收消息，建议你使用[Google Cloud Messaging (GCM)](https://developers.google.com/cloud-messaging/)

> 译者注：国内的系统对此肯定有所修改，具体请查看各大系统商的说明文档。

为了确保你的应用程序的行为按照你的预期，你可以使用adb指令来强制系统进入深睡眠模式以便你进行相关测试，详细的说明请参考**在深睡眠模式或者应用待命状态下测试**章节，在倒数第二节。

# 了解应用待命状态(App Standby)

应用待命状态的意思就是，当用户长时间没用使用某应用程序时，系统可以让该应用进入闲置状态。怎么界定没有使用呢？除了以下几条，都算没有使用：

* 用户打开应用程序
* 应用程序有前台任务在运行（无论是Activity还是前台服务都可以，或者是被其他前台Activity及服务调用也算数）
* 应用程序发送了一条通知，用户在锁屏状态下或者通知栏看见了这条通知

一旦设备开始充电，系统将为所有处于应用待命状态的应用解除待命，允许他们访问网络，执行被推迟导致未完成的工作。如果应用一直处于应用待命状态，系统大约每天只允许应用访问一次互联网。

# 当设备进入闲置状态时，使用GCM来优化你的应用程序的表现

[Google Cloud Messaging (GCM)](https://developers.google.com/cloud-messaging/)是一个从云端到设备的服务，能让你轻松地从后端发送实时消息到Android设备上。GCM提供一个单一的长连接通向云端，所有使用GCM的应用都会共享这个长连接。试想，如果所有应用程序都自己创建和服务端的网络连接，这将无益于电池续航，也是十分没必要的。大家都使用GCM的共享长连接的话，能大大减少电池的消耗。基于这个原因，如果你的应用程序需要通过后台服务端发送消息的话，我们强烈推荐你使用GCM，而不要自行维护一个通向后台的网络连接。

GCM也是在深睡眠模式和应用待命状态下的最优选择，GCM有一个高优先级的消息选项，当你发送[高优先级消息](https://developers.google.com/cloud-messaging/concept-options#setting-the-priority-of-a-message)到设备时，即便设备处于深睡眠模式，或者你的应用处于应用待命状态，应用仍旧能获取这条消息，并且系统会给予你的应用临时访问互联网的权限以及临时唤醒你的应用，之后再让系统回到深睡眠模式(或是你的应用回到应用待命状态)。

高优先级的GCM消息不会改变系统的深睡眠模式，也不会影响其他应用的状态(在应用待命状态的应用不会被唤醒)。这意味着使用高优先级的GCM消息能最大程度的节省电池电量。

如果你的应用需要和服务端交互，使用GCM绝对是最佳实践。如果你的服务端和客户端已经在使用GCM，请确保发送重要消息时开启了高优先级选项，这样就能100%地把消息发送到客户端，即便它们处于深睡眠模式。

# 适配其他例外情况

通常来说，让你的应用适配深睡眠模式，使用高优先级的GCM消息已经足够了。但不可否认的是，有那么一小部分应用，GCM并不能满足它们的需求。对于这样的应用，系统提供了一个可供用户配置的白名单，当你的应用位于这个白名单上时，它将会获得在深睡眠模式或者应用待命状态下的部分豁免权。

在这个白名单上的应用，在系统处于深睡眠模式，或者应用进入应用待命状态时，仍旧能访问网络并[保持唤醒(PARTIAL_WAKE_LOCK)](https://developer.android.com/reference/android/os/PowerManager.html#PARTIAL_WAKE_LOCK)。但是，其他限制仍会被执行，例如，工作调度、同步这些仍旧会被推迟（API 23或更低），常规的AlarmManager提醒不会被响应。应用通过调用[isIgnoringBatteryOptimizations()](https://developer.android.com/reference/android/os/PowerManager.html#isIgnoringBatteryOptimizations(java.lang.String))方法可以自己检查是否处于这个白名单中。

用户可以在**系统设置 > 电池 > 电池优化**里手动配置这个白名单。作为备选方案，系统也提供了几个方法让应用主动向用户请求把自己加入白名单。

* 应用可以打开[ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS](https://developer.android.com/reference/android/provider/Settings.html#ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)Intent来跳转到系统电池优化界面，在这里用户可以手动将应用添加到白名单
* 如果应用申请了[REQUEST_IGNORE_BATTERY_OPTIMIZATIONS](https://developer.android.com/reference/android/Manifest.permission.html#REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)权限，可以不跳转到系统设置界面，而是直接调用一个系统级的对话框，来让用户直接同意添加应用到白名单里。打开[ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS](https://developer.android.com/reference/android/provider/Settings.html#ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)Intent即可显示这个系统对话框
* 如有必要，用户可以自行将应用用白名单上移除

在应用向用户请求添加自己到白名单前，请确保应用符合添加到白名单的情况，详见 **什么应用可以向用户请求将自己添加进电源管理白名单？**章节。

> 注意：Google Play原则上是不允许任何应用在Android6.0及以上的设备里申请免除受到电源管理（即默认添加到白名单上），除非应用的核心功能在电源管理下受到极大的影响。

> 译者注：如果你的确需要将自己的应用添加到白名单了，在做好引导用户进行添加工作的同时，记得随时检查自己是否还处于白名单中。

# 在深睡眠模式或者应用待命状态下测试

为了确保你的用户有最佳用户体验，你需要在深睡眠模式或者应用待命状态下完整测试你的应用的各个功能。

## 在深睡眠模式下测试你的应用

你可以按照如下步骤在测试你的应用在深睡眠模式下的表现：

* 拥有一台运行在Android 6.0或更高系统版本的设备或者虚拟机

* 连接设备到开发环境，安装你的应用到设备上

* 运行你的程序并让它处于运行状态

* 关闭设备的屏幕（应用仍在运行状态）

* 使用adb命令让系统进入深睡眠模式的运行周期

{% highlight Bash %}
$ adb shell dumpsys battery unplug
$ adb shell dumpsys deviceidle step
{% endhighlight %}

* 最后，当你重新打开设备的屏幕时，观察应用的表现，确保它能在系统退出深睡眠模式时完美恢复

## 在应用待命状态下测试你的应用

你可以按照如下步骤在测试你的应用在应用待命状态下的表现：

* 拥有一台运行在Android 6.0或更高系统版本的设备或者虚拟机

* 连接设备到开发环境，安装你的应用到设备上

* 运行你的程序并让它处于运行状态

* 使用adb命令让应用进入应用待命状态

{% highlight Bash %}
$ adb shell dumpsys battery unplug
$ adb shell am set-inactive <packageName> true
{% endhighlight %}

* 使用adb命令模拟唤醒你的应用

{% highlight Bash %}
$ adb shell am set-inactive <packageName> false
$ adb shell am get-inactive <packageName>
{% endhighlight %}

* 观察你的应用被唤醒之后的行为，确保它在退出应用待命状态时完美恢复。特别的，你应该检查你的应用的通知及后台功能是否运行正常。

# 什么应用可以向用户请求将自己添加进电源管理白名单？

下面的表格，高亮了一些允许向用户申请添加进白名单的情况。通常来说，除非应用的核心功能在深睡眠模式或者应用待命状态下受到极大的影响，抑或是一些技术原因，应用无法使用GCM的高优先级消息，你的应用是不应该被添加进这个白名单的。

你可以在**适配其他例外情况**章节查看更多信息。

应用类型 | 运行情况 | 能使用GCM吗？ | 能添加进白名单吗？ | 备注
------ | ------- | ----------- | --------------- | ---
即时通讯，信息或通话 | 在设备处于深睡眠模式或者应用处于应用待命状态时仍旧需要向用户投递消息 | 可以 | **不允许** | 使用GCM的高优先级消息来唤醒应用访问网络
即时通讯，信息或通话 | 在设备处于深睡眠模式或者应用处于应用待命状态时仍旧需要向用户投递消息 | 可以，但没使用GCM的高优先级消息 | **不允许** | 使用GCM的高优先级消息来唤醒应用访问网络
即时通讯，信息或通话，企业级通讯应用 | 在设备处于深睡眠模式或者应用处于应用待命状态时仍旧需要向用户投递消息 | 不可以，因为用了其他消息推送服务，或者心功能在电源管理下受到极大的影响 | 允许 |
任务自动化应用 | 应用的核心功能是规划自动任务，例如短信，通话，照片管理，基于地点的操作等 | 不论 | 允许 |
手机外设配套应用 | 应用的核心功能是桥接外设，以便为外设提供连接到互联网的功能 | 不论 | 允许 |
手机外设配套应用 | 应用建立一个长连接通向其他外设仅仅是为了偶尔同步数据，或者纯粹是为了和外设进行连接，例如通过标准蓝牙协议连接头戴式耳机 | 不论 | **不允许** |

(全文完)
