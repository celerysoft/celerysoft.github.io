---
layout: post
title: App版本升级时对SQLite数据库的处理方法
categories: Android
tags: [Android, 开发, SQLite, 升级]
---

开发App时，随着功能的扩充，最开始设计的数据库肯定会捉襟见肘，原有的数据库结构可能已经不再适应新的功能，这时候，就需要对原有的数据库进行改进了。

## 数据库版本升级

我们知道，当用户更新完App启动后，发现新版本的App的数据库版本要高于旧版本的，就会调用`onUpgrade`方法，在数据库版本升级时，我们可能会遇到下面几种情况：

* 新建表
* 删除表
* 删除某个表上的字段
* 给某个表添加新字段

数据库版本升级时，推荐采用迭代升级的方式，保证数据库的完整性和升级过程的安全性，例如

{% highlight Java %}
@Override
public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
  for (int i = oldVersion; i <= newVersion; ++i) {
    switch(i) {
      case 1:
        upgradeDatabaseFrom1To2(db);
        break;
      case 2:
        upgradeDatabaseFrom2To3(db);
        break;
      case 3:
        upgradeDatabaseFrom3To4(db);
        break;
      case 4:
        upgradeDatabaseFrom4To5(db);
        break;
      ...
      default:
        break;
    }
  }
}
{% endhighlight %}

我们假设，
版本1升级到版本2是新建表操作，
版本2升级到版本3是删除表操作，
版本3升级到版本4是给某个表添加新字段操作，
版本4升级到版本5是删除某个表上的字段操作，
下面分别说说这几种情况的处理方法。

### 1、新建表

{% highlight Java %}
private void upgradeDatabaseFrom1To2(SQLiteDatabase db) {
  db.execSQL("CREATE TABLE person(name TEXT, sex TEXT);");
  db.execSQL("CREATE TABLE android(name TEXT, verson TEXT);");
}
{% endhighlight %}

### 2、删除表

{% highlight Java %}
private void upgradeDatabaseFrom1To2(SQLiteDatabase db) {
  db.execSQL("DROP TABLE IF EXISTS android;");
}
{% endhighlight %}

### 3、给某个表添加新字段

{% highlight Java %}
private void upgradeDatabaseFrom1To2(SQLiteDatabase db) {
  db.execSQL("ALTER TABLE person ADD COLUMN age TEXT");
  db.execSQL("ALTER TABLE person ADD COLUMN weight TEXT");
}
{% endhighlight %}

SQLite对ALTER TABLE的支持比较有限，可以更改表名，或者往表的末尾添加一个新字段。

### 4、删除某个表上的字段

假设原person表有name, sex, age, weight四个字段，需要删除weight字段
删除一个表上已有的字段，需要重新创建这个表并完成数据迁移

{% highlight Java %}
private void upgradeDatabaseFrom1To2(SQLiteDatabase db) {
  // 创建person的临时表
  db.execSQL("CREATE TEMPORARY TABLE personBackup (name, sex, age);");
  // 储存现有数据到临时表
  db.execSQL("INSERT INTO personBackup SELECT name, sex, age FROM person;");
  // 删除现有的person表
  db.execSQL("DROP TABLE person;");
  // 创建没有weight字段的person表
  db.execSQL("CREATE TABLE person(name TEXT, sex TEXT, age TEXT);");
  // 导入储存在临时表的数据到新person表
  db.execSQL("INSERT INTO person SELECT name, sex, age FROM personBackup;");
  // 删除临时表
  db.execSQL("DROP TABLE personBackup;");
}
{% endhighlight %}

### 扩展阅读：按照删除某个表上的字段的方法来实现给某个表添加新字段

假设原person表有name, sex, age三个字段，需要增加一个weight字段

{% highlight Java %}
private void upgradeDatabaseFrom1To2(SQLiteDatabase db) {
  // 创建person的临时表
  db.execSQL("CREATE TEMPORARY TABLE personBackup (name, sex, age);");
  // 储存现有数据到临时表
  db.execSQL("INSERT INTO personBackup SELECT name, sex, age FROM person;");
  // 删除原有的person表
  db.execSQL("DROP TABLE person;");
  // 创建新增weight字段之后的person表
  db.execSQL("CREATE TABLE person(name TEXT, sex TEXT, weight TEXT, age TEXT, );");
  // 导入储存在临时表的数据到新person表，中间空数据是给weight字段插入空数据
  db.execSQL("INSERT INTO person SELECT name, sex, \"\", age,  FROM personBackup;");
  // 删除临时表
  db.execSQL("DROP TABLE personBackup;");
}
{% endhighlight %}

## 数据库版本降级

### 1、舍弃已有的数据并重建表结构

数据库版本升级时，我采用迭代的方法将保证跨版本升级的用户不会在升级时发生错误，但是降级时，假如有三个用户，他们的数据库版本分别处于10，15，20，这三个版本跨度很大，数据库结构大相径庭。我们现在要将数据库版本降级到5，要想完整保留用户数据，只能分别写出从版本10降级到版本5的操作、版本15降级到版本5的操作、版本20降级到版本5的操作，这样非常繁琐，工作量非常大，而且说实话，你除非用文档记录着每个数据库版本的结构，否则根本无法实现精准的数据库降级。

所以，我认为在数据库版本降级时最稳妥的方法就是，**舍弃已有的数据并重建表结构**

{% highlight Java %}
@Override
public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
  db.execSQL("DROP TABLE IF EXISTS table1;");
  db.execSQL("DROP TABLE IF EXISTS table2;");
  db.execSQL("DROP TABLE IF EXISTS table3;");
  db.execSQL("DROP TABLE IF EXISTS table4;");
  ....
  onCreate(db); // 重建所有表
}
{% endhighlight %}

### 2、不进行降级操作，把所有降级操作都按升级处理

这个很好理解吧，需要废弃什么表，删除什么字段，都按数据库版本升级来处理，还能保留数据。
