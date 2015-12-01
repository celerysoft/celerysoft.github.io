---
layout: post
title: Android开发tips
categories: Android
tags: [Android, 开发, tips, 小贴士]
---

一些Android开发过程中的tips，不定时更新，遇到什么写什么：

**1**、使用ExpandableListView时，如果遇到一级目录无法展开时，可能是一级路目录带有Button，CheckBox这些控件，会截获OnClick事件，解决方法很简单，把Button或者CheckBox的`focusable`属性设为false就好了

**2**、程序没有语法错误，运行的时候却提示`finished with non-zero exit value 2`。首先，这可能是因为项目引用了同一个库的不同版本，删除低版本的引用即可。不过，可能你根本就没有引用同一个库的不同版本，但是还是报这个错误，那么，很可能你用的IDE是Android Studio，会自动引用libs下的jar库，所以，请到libs目录下删除你没有引用的jar库
