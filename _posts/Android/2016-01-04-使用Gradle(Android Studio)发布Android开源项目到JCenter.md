---
layout: post
title: 使用Gradle(Android Studio)发布Android开源项目到JCenter
categories: Android
tags: [Gradle, Jcenter, 发布]
---

使用Android Studio进行Android开发的时候，有些第三方库的引用只需要一句话

`compile 'com.squareup.picasso:picasso:2.3.2'`

第一次用的时候感觉很神奇，等到自己参与到开源组件的开发的时候，也想实现这种效果，应该怎么操作呢？本文就介绍一下如何使用Gradle发布到jCenter。

## 一、注册账号及获取API Key

首先，我们需要一个Bintray的账号，在[https://bintray.com](https://bintray.com)进行注册。

网站会分配个每个注册账号一个唯一的API Key，作为身份标识，所以注册完毕之后我们需要找到API Key，进入[https://bintray.com](https://bintray.com)并登录，鼠标移至右上角你的用户名处，点击**Your Profile**，如图

![01]({{ site.postimage }}2016010401.png)

然后点击头像旁边的Edit，

![02]({{ site.postimage }}2016010402.png)

最后点击API Key切换到该页面，点击Show查看你的API Key并复制保存下来，接下来要用到。

![03]({{ site.postimage }}2016010403.png)

## 二、配置Gradle

### 1、配置全局Gradle

找到Gradle的目录，根据你的操作系统的不同，该目录位于

**Windows XP**：`C:\Documents and Settings\用户名\.gradle`  
**Windows 7及以上**：`C:\Users\用户名\.gradle`  
**Mac OS**：`/Users/用户名/.gradle`  

打开目录下的`gradle.properties`文件（如果文件不存在则新建），添加Bintray信息到文件末尾
{% highlight Bash %}
BINTRAY_USER=celerysoft
BINTRAY_KEY=********************
{% endhighlight%}

BINTRAY_USER为你在Bintray注册的用户名，BINTRAY_KEY则为刚才获取到的API Key。

当然，你也可以选择在每个项目中的`gradle.properties`文件添加上述Bintray信息，但这样做十分繁琐，还需要将该文件添加到.gitignore中，防止泄露了个人信息。

### 2、配置项目Gradle

我们开发开源控件时，一般都会包含两个module，`library`和`demo`，demo为控件的使用示例，library才是控件的实际源码，上传到jCenter时只需要上传library模块就行。

#### 修改项目根目录的build.gradle文件

在dependencies下添加两行

{% highlight Bash %}
classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.2'
classpath "org.jfrog.buildinfo:build-info-extractor-gradle:3.1.1"
{% endhighlight%}

添加完之后`gradle.properties`文件的内容大概如下

{% highlight Bash %}
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.3.0'
        classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.2'
        classpath "org.jfrog.buildinfo:build-info-extractor-gradle:3.1.1"

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        jcenter()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
{% endhighlight%}

#### 修改项目library目录的build.gradle文件

在文件末尾添加一行：`apply from: 'bintray.gradle'`

`bintray.gradle`暂时还不存在，我们需要在library目录下创建它，并修改它的内容如下

{% highlight Bash linenos %}
group = PROJ_GROUP
version = PROJ_VERSION
project.archivesBaseName = PROJ_ARTIFACTID

apply plugin: 'com.jfrog.bintray'
apply plugin: "com.jfrog.artifactory"
apply plugin: 'maven-publish'

task sourcesJar(type: Jar) {
    from android.sourceSets.main.java.srcDirs
    classifier = 'sources'
}

task javadoc(type: Javadoc) {
    source = android.sourceSets.main.java.srcDirs
    classpath += configurations.compile
    classpath += project.files(android.getBootClasspath().join(File.pathSeparator))
}

task javadocJar(type: Jar, dependsOn: javadoc) {
    classifier = 'javadoc'
    from javadoc.destinationDir
}

javadoc {
    options{
        encoding "UTF-8"
        charSet 'UTF-8'
        author true
        version true
        links "http://docs.oracle.com/javase/7/docs/api"
        title PROJ_ARTIFACTID
    }
}


def pomConfig = {
    licenses {
        license {
            name PROJ_LICENSE
            url PROJ_LICENSE_URL
            distribution "repo"
        }
    }
    developers {
        developer {
            id DEVELOPER_ID
            name DEVELOPER_NAME
            email DEVELOPER_EMAIL
        }
    }
}

publishing {
    publications {
        mavenJava(MavenPublication) {
            artifactId PROJ_ARTIFACTID
            artifact javadocJar
            artifact sourcesJar

            pom.withXml {
                def root = asNode()
                root.appendNode('description', PROJ_DESCRIPTION)
                root.children().last() + pomConfig

                def dependenciesNode = root.appendNode('dependencies')
                configurations.compile.allDependencies.each {
                    if (it.group && it.name && it.version) {
                        def dependencyNode = dependenciesNode.appendNode('dependency')
                        dependencyNode.appendNode('groupId', it.group)
                        dependencyNode.appendNode('artifactId', it.name)
                        dependencyNode.appendNode('version', it.version)
                    }
                }
            }
        }
    }
}

afterEvaluate {
    publishing.publications.mavenJava.artifact(bundleRelease)
}

bintray {
    user = hasProperty("bintrayUser")?getProperty("bintrayUser"):getProperty("BINTRAY_USER")
    key = hasProperty("bintrayKey")?getProperty("bintrayKey"):getProperty("BINTRAY_KEY")

    publications = ['mavenJava']
    publish = true

    pkg {
        repo = 'maven'
        name = PROJ_NAME
        desc = PROJ_DESCRIPTION
        websiteUrl = PROJ_WEBSITEURL
        issueTrackerUrl = PROJ_ISSUETRACKERURL
        vcsUrl = PROJ_VCSURL
        licenses = [PROJ_LICENSE]
        publicDownloadNumbers = true
    }
}

artifactory {
    contextUrl = 'http://oss.jfrog.org/artifactory'
    resolve {
        repository {
            repoKey = 'libs-release'
        }
    }
    publish {
        repository {
            repoKey = 'oss-snapshot-local' //The Artifactory repository key to publish to
            username = bintray.user
            password = bintray.key
            maven = true
        }
        defaults {
            publications('mavenJava')
            publishArtifacts = true
        }
    }
}
{% endhighlight%}

113行和114行用到的就是刚才设置的全局gradle变量，Bintray的用户名和API Key，然后第1行的`PROJ_GROUP`和第2行的`PROJ_VERSION`又是啥？请继续往下看。

#### 修改项目根目录的gradle.properties文件

在文件末尾添加如下内容

{% highlight Bash %}
PROJ_GROUP=com.celerysoft
PROJ_VERSION=1.0.0
PROJ_NAME=MaterialDesignDialog
PROJ_WEBSITEURL=https://github.com/celerysoft/MaterialDesignDialog
PROJ_ISSUETRACKERURL=
PROJ_VCSURL=git@github.com:celerysoft/MaterialDesignDialog.git
PROJ_DESCRIPTION=Android dialog that follows the Google Material Design.
PROJ_ARTIFACTID=materialdesigndialog
PROJ_LICENSE=MIT
PROJ_LICENSE_URL=https://raw.githubusercontent.com/celerysoft/MaterialDesignDialog/master/LICENSE

DEVELOPER_ID=celerysoft
DEVELOPER_NAME=Celery Qin
DEVELOPER_EMAIL=celerysoft@gmail.com
{% endhighlight%}

最终项目的引用方式为

{% highlight Bash %}
dependencies {
    compile 'com.celerysoft:materialdesigndialog:1.0.0'
}
{% endhighlight%}

可以发现，引用形式是`PROJ_GROUP:PROJ_ARTIFACTID:PROJ_VERSION`。

## 三、上传到Bintray

由于在Windows和Mac OS下使用命令行的方法不一样，就不介绍命令行的方式，说说怎么在Android Studio里上传吧。上面的步骤执行完之后，先同步一下项目，即`Sync Project with Gradle Files`，然后点击Gradle，找到library的Task下的publishing里的bintrayUpload，双击执行上传，等待上传完成即可。

![04]({{ site.postimage }}2016010404.png)

## 四、包含项目到jCenter

进入[https://bintray.com](https://bintray.com)并登录，找到你刚才上传的项目点进去，点击右下角的

![05]({{ site.postimage }}2016010405.png)

然后写几句你的项目的介绍，然后Send，之后等待jCenter的审核，审核通过之后就可以使用

`compile 'com.celerysoft:materialdesigndialog:1.0.0'`

来引用你的项目了。
