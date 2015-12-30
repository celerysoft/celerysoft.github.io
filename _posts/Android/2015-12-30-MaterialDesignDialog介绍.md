---
layout: post
title: Material Design Dialog简介
categories: Other
tags: [Android, Material Design， Dialog]
---

Material Design的推出，最主要的受益群体，我觉得是广大的独立开发者。无数的独立开发者，坐拥无数的好点子，无奈开发出来的App不够精致，导致无人问津。辛亏，谷歌发布了Material Design，只要按照这个标注来设计自己的App，成品一般都不会难看。

为了让低版本的Android用户也能体会到Material Design，很多开源控件作者制作了很多易用且精美的Material Design风格的Android控件，在GitHub上可以找到很多很多。

好了，废话说完了，本文主要是介绍一下我写的一个符合Material Design风格的Dialog空间，使用方便，体积也小

Material Design中关于Dialog的设计规范：[http://www.google.com/design/spec/components/dialogs.html](http://www.google.com/design/spec/components/dialogs.html)

项目地址：[https://github.com/celerysoft/MaterialDesignDialog](https://github.com/celerysoft/MaterialDesignDialog)

效果大概是这样的，建议右键新标签页打开查看大图：

![2in1row]( {{ site.postimage }}2015123001.png)![2in1row]( {{ site.postimage }}2015123002.png)![2in1row]( {{ site.postimage }}2015123003.png)

使用方法很简单，额，也不算很简单，因为我没上传到jcenter，所以你必须把源码编译之后再集成进你的现有项目里，具体的不多说了，说说怎么用吧。

## 实例

要实现图一的效果，代码如下：

{% highlight Java %}
String message = "This dialog use material-design to design it."
                + " Use it if you really like it,"
                + " make it better if you feel it suck."
                + "\nThis dialog has 2 themes and"
                + " 2 styles, hope you can like it.";
final MaterialDesignDialog dialog = new MaterialDesignDialog(someMethodToGetContext());
dialog.setTitle("Permissions")
    .setMessage(message)
    .setNegativeButton("DECLINE", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            dialog.dismiss();
        }
    })
    .setPositiveButton("ACCEPT", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            dialog.dismiss();
        }
    });
dialog.show();
{% endhighlight %}

要实现图二的效果，代码如下：

{% highlight Java %}
String message = "This dialog use material-design to design it."
                + " Use it if you really like it,"
                + " make it better if you feel it suck."
                + "\nThis dialog has 2 themes and"
                + " 2 styles, hope you can like it.";
final MaterialDesignDialog dialog = new MaterialDesignDialog(someMethodToGetContext(),
                                                             MaterialDesignDialog.Style.STACKED_FULL_WIDTH_BUTTONS);
dialog.setTitle("Permissions")
    .setMessage(message)
    .setNegativeButton("DECLINE", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            dialog.dismiss();
        }
    })
    .setPositiveButton("ACCEPT", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            dialog.dismiss();
        }
    });
dialog.show();
{% endhighlight %}

要实现图三的效果，代码如下：

{% highlight Java %}

String message = "It is a dark theme dialog. Sometimes you need a dark theme dialog to"
                + " fit your own theme, it is."
                + "\nWe offer only 2 themes:"
                + "\nMaterialDesignDialog.Theme.Light"
                + "\nand"
                + "\nMaterialDesignDialog.Theme.Dark";
final MaterialDesignDialog dialog = new MaterialDesignDialog(someMethodToGetContext(),
                                                             MaterialDesignDialog.Theme.DARK);
dialog.setTitle("Dark theme dialog")
    .setMessage(message)
    .setCanceledOnTouchOutside(true)
    .setPositiveButton("OK", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            dialog.dismiss();
        }
    });
dialog.show();

{% endhighlight %}

## 用法

看完上面三个示例，想必你已经对如何使用这个控件有一定了解了，本来我是想按照**Dialog.Builder**的方式来构建控件的，后来觉得这样还要调用**MaterialDesignDialog.Builder**来构建Dialog，不如直接通过**MaterialDesignDialog**类来实现。

使用方法很简单，遵循如下步骤即可：

### 1、创建一个MaterialDesignDialog实例

MaterialDesignDialog的构造函数有以下4种，使用不同的构造函数可以初始化Dialog的风格和主题

{% highlight Java %}

public MaterialDesignDialog(Context context) {
    this(context, Style.SIDE_BY_SIDE_BUTTONS, Theme.LIGHT);
}

public MaterialDesignDialog(Context context, Style style) {
    this(context, style, Theme.LIGHT);
}

public MaterialDesignDialog(Context context, Theme theme) {
    this(context, Style.SIDE_BY_SIDE_BUTTONS, theme);
}

public MaterialDesignDialog(Context context, Style style, Theme theme) {
    mContext = context;
    mStyle = style;
    mTheme = theme;
}

{% endhighlight %}

`MaterialDesignDialog dialog = new MaterialDesignDialog(context);`
这是创建默认风格的Dialog

`MaterialDesignDialog dialog = new MaterialDesignDialog(context, MaterialDesignDialog.Style.STACKED_FULL_WIDTH_BUTTONS);`
这是创建一个按钮占满一行风格的Dialog

`MaterialDesignDialog dialog = new MaterialDesignDialog(context, MaterialDesignDialog.Theme.DARK);`
这是创建默认风格但使用深色主题的Dialog

`MaterialDesignDialog dialog = new MaterialDesignDialog(context, MaterialDesignDialog.Style.STACKED_FULL_WIDTH_BUTTONS, MaterialDesignDialog.Theme.DARK);`
这是创建一个按钮占满一行，并使用深色主题的Dialog

### 2、为Dialog添加样式

为Dialog添加样式有以下几个方法：

1. 为Dialog添加标题
`dialog.setTitle("标题")`，如果没有掉用setTitle，则生成的Dialog为不包含标题栏风格
2. 为Dialog添加内容  
`dialog.setMessage("内容")`，这个是必须添加的。
3. 为Dialog添加确定按钮
`dialog.setPositiveButton("确定", onClickListener);`
4. 为Dialog添加取消按钮
`dialog.setNegativeButton("取消", onClickListener);`
5. 为Dialog设置并排的按钮
`dialog.setItems(strings, onItemClickListener)`，这个会覆盖`setMessage`的效果，同时，使用这种样式时，不建议再添加取消或确定按钮
6. 使用自定义View
`dialog.setContentView(view)`，这会覆盖上面5种方法，让Dialog显示自定义的View
7. 添加点击在Dialog外时是否释放Dialog的设置
`dialog.setCanceledOnTouchOutside(true)`
8. 为Dialog释放后添加监听器
`dialog.setOnDismissListener(onDismissListener)`

以上几种方法的调用没有先后顺序，但需要注意他们的互斥关系，还有一些其他方法，不符合谷歌的设计规范，就不一一说明了，也不建议使用。

### 3、显示Dialog

为Dialog添加完样式之后，通过调用`dialog.show();`即可显示Dialog。

以上，便是MaterialDesignDialog的用法了，本项目欢迎pr，期待你的参与。
