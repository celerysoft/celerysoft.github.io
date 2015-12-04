---
layout: post
title: JavaScript和Flex的互相调用
categories: Flex
tags: [JavaScript, Flex, 互相调用]
---

最近的工作要在JS中调用Flex的函数，同时也要求在Flex中调用JS的函数，JS和Flex相互间如何进行通信呢？这里需要用到Flex中的ExternalInterface类。

关于ExternalInterface类，Adobe的官方介绍如下：

> ExternalInterface类是用来支持在 ActionScript 和 SWF 容器（例如，含有 JavaScript 的 HTML 页或使用 Flash Player 播放 SWF 文件的桌面应用程序）之间进行直接通信的应用程序编程接口。通过 ExternalInterface 类，您可以在 Flash 运行时中使用 HTML 页面中的 JavaScript 调用 ActionScript 函数。ActionScript 函数可以返回一个值，JavaScript 会立即接收它作为该调用的返回值。

先不说废话，看看如何使用ExternalInterface类吧。

## 一、在Flex中调用JavaScript函数
我不是很懂HTML和JS，所以我是直接在Flex工程中编译生成的bin-debug文件夹下，修改工程生成的html文件，在body标签页之间添加一段JS代码：

```JavaScript
<script lang="javascript">
  function jsFunction()
  {
    return 12345;
  }
</script>
```

同时，在Flex中，添加一段AS代码来调用该函数：

{% highlight ActionScript linenos %}
// Flex 代码
{% endhighlight %}
```ActionScript
private function callJS():void
{
  var numFromJS:Number = ExternalInterface.call("jsFunction");
}
```

`numFromJS`的值就是12345，这就实现了在Flex中调用JS函数。

## 二、在JavaScript中调用Flex函数
首先，在Flex中为将要被调用的Flex函数添加CallBack，建议在Application的creationComplete事件中添加：

```ActionScript
private function creationCompleteHandler(event:FlexEvent):void
{
  ExternalInterface.addCallback("flexFunction", functionInFlex);
  //flexFunction为在JS中调用的名称，functionInFlex为函数在Flex中的名称
}
private function functionInFlex():void
{
  return Number(54321);
}
```

在JS中，要调用这个函数，也是很简单，还是直接在Flex工程中编译生成的bin-debug文件夹下，修改工程生成的html文件，在body标签页之间添加一段JS代码：

```JavaScript
<script lang="javascript">
  function callFlex()
  {
    var numFromFlex = document.getElementById("FlexID").functionInFlex();
  }
</script>
```

很显然，这个`numFromFlex`的值是54321。需要注意的是，这个FlexID，在工程自动生成的html文件里，在body标签里有个noscript标签，里面有个object标签，object里就有id这个值，这个id的值应该和Flex工程名是一样的。至于怎么在HTML中嵌入swf文件，研究一下Flex工程自动生成的这个html文件就能得到答案。
