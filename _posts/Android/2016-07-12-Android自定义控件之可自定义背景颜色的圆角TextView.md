---
layout: post
title: Android自定义控件之可自定义背景颜色的圆角TextView
categories: Android
tags: [Android, 自定义控件, 圆角, TextView]
---

## 前言

最近在做一个需求，就是实现一个可以自定义背景颜色，并且是圆角的TextView，如下图：

![01]( {{ site.postimage }}2016071201.png)

这个自定义控件实现起来非常简单，简要说一下思路吧：

1. 最好继承TextView，这样就能继承TextView已有的功能
2. 实现圆角TextView最简单的方法就是写一个包含圆角的Shape然后设置成TextView的背景
3. 自定义TextView的背景颜色，就是要在修改这个Shape的背景颜色而不是修改TextView的背景颜色

第1点和第2点都比较常规，第3点如果对Drawable不太了解的话，不查资料是很难知道怎么解决的，下面来说说如何实现吧。

## 1 新建圆角背景

在res/drawable下新建一个xml，姑且取名为`background_text_view_with_corners.xml`，xml的内容如下：

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" >

    <solid android:color="@android:color/black" />

    <corners android:radius="2.5dp" />

</shape>
{% endhighlight %}

这个color的值只是一个默认样式的值，所以设置一个任意的就好。

## 2 新建自定义TextView

新建一个Java类继承TextView，干脆叫`TextViewWithCorners`，实现如下：

{% highlight Java %}
public class TextViewWithCorners extends TextView {
    public TextViewWithCorners(Context context) {
        super(context);
        init();
    }

    public TextViewWithCorners(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public TextViewWithCorners(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundResource(R.drawable.background_text_view_with_corners);
    }
}
{% endhighlight %}

可见，只是在初始化的时候，将背景设置成了刚才创建的圆角背景。那么，如果改变这个圆角背景的颜色呢？

## 3 实现自定义圆角背景的颜色

这里要用到的是`GradientDrawable`这个类，详细的资料可以自行搜索，我们将`TextViewWithCorners`的`setBackgroundColor(int color)`方法重写，完整代码如下：

{% highlight Java %}
public class TextViewWithCorners extends TextView {
    protected GradientDrawable mGradientDrawable;

    public TextViewWithCorners(Context context) {
        super(context);
        init();
    }

    public TextViewWithCorners(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public TextViewWithCorners(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundResource(R.drawable.background_text_view_with_corners);
    }

    @Override
    public void setBackgroundColor(int color) {
        mGradientDrawable.setColor(color);
    }
}
{% endhighlight %}

这样，这个可以自定义背景颜色并且是圆角的TextView就算完成了。

## 4 实际使用

在实际使用中也很简单，首先看看布局文件：

{% highlight xml %}
<TextViewWithCorners
    android:id="@+id/tv"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:paddingLeft="4dp"
    android:paddingRight="4dp"
    android:textColor="@android:color/white"
    android:text="可自定义背景颜色的圆角TextView"/>
{% endhighlight %}

可见，和TextView的用法没什么差别，为了显示效果，需要给首尾添加一个Padding，然后将textColor设置成和背景色有一定反差的颜色。

然后看看在代码中如何设置背景颜色：

{% highlight Java %}
TextViewWithCorners textViewWithCorners = (TextViewWithCorners) findViewById(R.id.tv);
textViewWithCorners.setBackgroundColor(Color.parseColor("#5EDD9E"));
{% endhighlight %}

这样，就能实现文章开头中图片的效果了。
