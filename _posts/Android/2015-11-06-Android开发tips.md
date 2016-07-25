---
layout: post
title: Android开发tips
categories: Android
tags: [Android, 开发, tips, 小贴士]
---

一些Android开发过程中的tips，不定时更新，遇到什么写什么：

**1**、使用AdapterView（例如ExpandableListView, ListView, GridView）时，setOnItemClickListener后没法进入onItemClick方法，可能是Item里带有Button，CheckBox这些控件，会截获OnClick事件，解决方法很简单，把Button或者CheckBox的`focusable`属性设为false就好了，但是如果Item里的Button或者CheckBox很多，不想分别都设置的话，可以给根布局设置属性`android:descendantFocusability=”blocksDescendants”`，如果这个方法无效，那么请检查你的Adapter类，看看isEnable方法返回的是true吗

**2**、程序没有语法错误，运行的时候却提示`finished with non-zero exit value 2`。首先，这可能是因为项目引用了同一个库的不同版本，删除低版本的引用即可。不过，可能你根本就没有引用同一个库的不同版本，但是还是报这个错误，那么，很可能你用的IDE是Android Studio，会自动引用libs下的jar库，所以，请到libs目录下删除你没有引用的jar库

**3**、Fragment第一次通过FragmentTransaction来Add的时候，是不会调用onHiddenChanged的。只有显式的调用show或者hide才会进入onHiddenChanged的方法

**4**、自定义ListView的item的background时，需要设置ListView的`android:listSelector`属性，或者使用代码动态设置`listView.setSelector(int ResId)`
