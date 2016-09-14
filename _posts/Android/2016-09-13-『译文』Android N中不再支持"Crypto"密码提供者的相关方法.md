---
layout: post
title: 『译文』Android N中不再支持“Crypto”安全供应商的相关方法
categories: Android
tags: [Crypto, Android, N]
---

原文：[http://android-developers.blogspot.com/2016/06/security-crypto-provider-deprecated-in.html](http://android-developers.blogspot.com/2016/06/security-crypto-provider-deprecated-in.html)  
翻译自：2016年9月12日的[英文版本](http://celerysoft.github.io/2016-09-12.html)

> 译者注：最近的项目把compileSdkVersion和targetSdkVersion升到24之后，在Android 7.0及以上版本的机器上，AES加密相关的方法遇到了新问题，按照提示找到了这篇官方博文，特地翻译过来方便国内开发者。如果你也遇到了这个问题，这里提供了一个[解决方案]((http://celerysoft.github.io/2016-09-12.html))，你可以看看。还有，我把provider译成安全供应商，你肯定觉得我想搞个大新闻:D

*作者：Sergio Giro，软件工程师*

如果你的安卓应用程序使用`SHA1PRNG`算法通过`Crypto`安全供应商(provider)获得加密密钥，那么你必须开始使用真正的[密钥生成方法(key derivation function)](https://en.wikipedia.org/wiki/Key_derivation_function)来生成密钥，可能你还需要重新加密你的数据。

`Java密码架构学(Java Cryptography Architecture, JCA)`允许开发者使用以下代码生成密码，或者创建伪随机生成器：

`SomeClass.getInstance("SomeAlgorithm", "SomeProvider");`

甚至使用更简单的代码就能创造出来：

`SomeClass.getInstance("SomeAlgorithm");`

对应的例子如下：

`Cipher.getInstance(“AES/CBC/PKCS5PADDING”); `  
`SecureRandom.getInstance(“SHA1PRNG”);`

在Android中，我们不建议指定一个安全供应商。通常来说，任何调用`Java密码扩展(Java Cryptography Extension, JCE)`API来指定一个安全供应商都需要满足以下两个条件中的一个：安全供应商的实现包含在应用程序内，或者应用程序处理了潜在的`ProviderNotFoundException`。

不幸的是，很多应用程序通过已经被Android放弃的安全供应商`Crypto`来获得密钥，真是一个个教科书级别的**反例**。

这个安全供应商所提供的，仅仅是利用`SHA1PRNG`算法来实现`SecureRandom`类。问题是，`SHA1PRNG`算法的加密强度很一般，如果你感兴趣，可以看看Yongge Wang和Tony Nicol写的论文[『用数据说话：在Debian上使用OpenSSL和PHP对伪随机序列进行的相关实验』](http://webpages.uncc.edu/yonwang/papers/lilesorics.pdf)中的8.1节，里面提到，随机二进制序列中0的数量远多于1的数量，并且，当你依靠种子生成随机序列时，这种误差就更大了。

> 译者注：来来来，我们看看这个Crypto到底能干啥，嗯，就这么一句：  
> `SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG", "Crypto");`  
> 讲道理，称之为『一点微小的工作』一点儿都不过分吧？过分的是，凭什么这么多人用它？  
>   
> 上述论文的8.1节我看了一下，大概是说使用Java SHA1PRNG API生成的『伪』随机二进制序列的误差问题，生成的0远多于生成的1，感兴趣的可以自行查看。

所以，**在Android N中，我们不再支持SHA1PRNG算法的实现以及Crypto这个安全供应商**。我们在几年前的文章[使用密码学来安全地储存证书](http://android-developers.blogspot.com/2013/02/using-cryptography-to-store-credentials.html)中就有涉及到使用SecureRandom生成密钥可能会导致的问题。

一种常见但是并不正确的生成密钥的方法是，通过一个密码来充当生成密钥的`种子(Seed)`。`SHA1PRNG`的实现有一个bug，就是如果你在获得密钥之前执行`setSeed()`操作，那么生成的密钥是具有某种确定性的。这个bug被广泛应用在使用一个密码来充当种子，然后为密钥『随机』(当然，随机在这里指的是可预测并且加密强度很弱)生成字节流，然后这样的密钥被用来加密和解密数据。

在下面的内容中，我们会说明如何正确地生成密钥，以及如何解密那些被不安全地密钥加密过的数据。这里有一个[完整示例](https://android.googlesource.com/platform/development/+/master/samples/BrokenKeyDerivation)，里面包含了一个助手类，这个类中使用了不再受到支持的`SHA1PRNG`算法，不过我们用它仅仅是为了解密那些被不安全地密钥加密过的数据，毕竟没有其他办法能达到这个目的。

密钥可以按照以下的方法生成：

* 如果你是从磁盘读取AES密钥，那么请不要直接保存真实的密钥，你可以通过以下代码从字节流中获取一个SecretKey实例来进行AES相关的操作：

`SecretKey key = new SecretKeySpec(keyBytes, "AES");`

* 如果你是通过一个密码来生成密钥，请遵循[Nikolay Elenkov的这篇极为优秀的教程](https://nelenkov.blogspot.com/2012/04/using-password-based-encryption-on.html)，需要注意的是，盐(Salt)的大小必须和生成的密钥的大小一致，就像这样：

{% highlight Java %}
// 假设这是用户输入的密码：
String password = "password";  

// 待会儿储存下面这些数据，这些数据用来生成密钥
int iterationCount = 1000;  
int saltLength = 32; // 字节，必须和生成的密钥的长度一致(256位等于32字节)
int keyLength = 256; // 使用AES-256方法就是256位，使用AES-128方法就是128位，等等  
byte[] salt; // 长度必须等于saltLength

// 第一次生成密钥时，通过下面的方法获得盐(Salt)
SecureRandom random = new SecureRandom();  
byte[] salt = new byte[saltLength];  
random.nextBytes(salt);  

// 通过下面的方法来使用密码生成密钥
KeySpec keySpec = new PBEKeySpec(password.toCharArray(), salt,  
           iterationCount, keyLength);  
SecretKeyFactory keyFactory = SecretKeyFactory  
           .getInstance("PBKDF2WithHmacSHA1");  
byte[] keyBytes = keyFactory.generateSecret(keySpec).getEncoded();  
SecretKey key = new SecretKeySpec(keyBytes, "AES");  
{% endhighlight %}

就以上这些，没什么额外需要做的事情了。

我们还考虑过这种情形，为了让数据传输更方便，开发者可能会使用一个不安全的密钥来加密数据。这个所谓的不安全的密钥每次都通过一个密码来生成，你可以通过[示例程序](https://android.googlesource.com/platform/development/+/master/samples/BrokenKeyDerivation)中的[InsecureSHA1PRNGKeyDerivator类](https://android.googlesource.com/platform/development/+/master/samples/BrokenKeyDerivation/src/com/example/android/brokenkeyderivation/InsecureSHA1PRNGKeyDerivator.java)来生成这个密钥。

{% highlight Java %}
private static SecretKey deriveKeyInsecurely(String password, int
keySizeInBytes) {  
   byte[] passwordBytes = password.getBytes(StandardCharsets.US_ASCII);  
   return new SecretKeySpec(  
           InsecureSHA1PRNGKeyDerivator.deriveInsecureKey(  
                    passwordBytes, keySizeInBytes),  
           "AES");  
}
{% endhighlight %}

通过这个不安全的密钥解密你的数据之后，你可以通过前文所诉生成一个安全的密钥来重新加密你的数据，然后就能幸福快乐地生活了。

说明一：这里有一个保证应用程序照常工作的临时方案，指定应用程序的`targetSdkVersion`为23，即Android6.0(棉花糖)对应的SDK版本，或者比23更低的版本。不过，请不要再用`Crypto`这个安全供应商来配合Android SDK使用，我们的计划是在将来完全移除它。

说明二：因为系统的很多部分都使用了`SHA1PRNG`算法，所以当你需要创建一个`SHA1PRNG`实例，但又没有指定安全供应商时，我们会给你提供一个`OpenSSLRandom`实例，它派生自`OpenSSL`，在生成随机数方面相当强大。

> 译者注：所以说，择日不如撞日，赶紧升级你的App，把`Crypto`相关的东西都移除掉吧，一劳永逸哟。
