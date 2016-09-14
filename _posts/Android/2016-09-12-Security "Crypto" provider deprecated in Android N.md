---
layout: post
title: Security "Crypto" provider deprecated in Android N
categories: Android
tags: [Crypto, Android, N]
---

本文转载至：[http://android-developers.blogspot.com/2016/06/security-crypto-provider-deprecated-in.html](http://android-developers.blogspot.com/2016/06/security-crypto-provider-deprecated-in.html)  
转载于：2016-09-12  
[简陋译文](http://celerysoft.github.io/2016-09-13.html)

*Posted by Sergio Giro, software engineer*

If your Android app derives keys using the SHA1PRNG algorithm from the Crypto provider, you must start using a real [key derivation function](https://en.wikipedia.org/wiki/Key_derivation_function) and possibly re-encrypt your data.

The Java Cryptography Architecture allows developers to create an instance of a class like a cipher, or a pseudo-random number generator, using calls like:

`SomeClass.getInstance("SomeAlgorithm", "SomeProvider");`

Or simply:

`SomeClass.getInstance("SomeAlgorithm");`

For instance,

`Cipher.getInstance(“AES/CBC/PKCS5PADDING”); `  
`SecureRandom.getInstance(“SHA1PRNG”);`

On Android, we don’t recommend specifying the provider. In general, any call to the Java Cryptography Extension (JCE) APIs specifying a provider should only be done if the provider is included in the application or if the application is able to deal with a possible ProviderNotFoundException.

Unfortunately, many apps depend on the now removed “Crypto” provider for an anti-pattern of key derivation.

This provider only provided an implementation of the algorithm “SHA1PRNG” for instances of SecureRandom. The problem is that the SHA1PRNG algorithm is not cryptographically strong. For readers interested in the details, [On statistical distance based testing of pseudo random sequences and experiments with PHP and Debian OpenSSL](http://webpages.uncc.edu/yonwang/papers/lilesorics.pdf), Section 8.1, by Yongge Wang and Tony Nicol, states that the “random” sequence, considered in binary form, is biased towards returning 0s, and that the bias worsens depending on the seed.

As a result, **in Android N we are deprecating the implementation of the SHA1PRNG algorithm and the Crypto provider altogether**. We’d previously covered the issues with using SecureRandom for key derivation a few years ago in [Using Cryptography to Store Credentials Safely](http://android-developers.blogspot.com/2013/02/using-cryptography-to-store-credentials.html). However, given its continued use, we will revisit it here.

A common but incorrect usage of this provider was to derive keys for encryption by using a password as a seed. The implementation of SHA1PRNG had a bug that made it deterministic if setSeed() was called before obtaining output. This bug was used to derive a key by supplying a password as a seed, and then using the "random" output bytes for the key (where “random” in this sentence means “predictable and cryptographically weak”). Such a key could then be used to encrypt and decrypt data.

In the following, we explain how to derive keys correctly, and how to decrypt data that has been encrypted using an insecure key. There’s also a [full example](https://android.googlesource.com/platform/development/+/master/samples/BrokenKeyDerivation), including a helper class to use the deprecated SHA1PRNG functionality, with the sole purpose of decrypting data that would be otherwise unavailable.

Keys can be derived in the following way:

* If you're reading an AES key from disk, just store the actual key and don't go through this weird dance. You can get a SecretKey for AES usage from the bytes by doing:

SecretKey key = new SecretKeySpec(keyBytes, "AES");

* If you're using a password to derive a key, follow [Nikolay Elenkov's excellent tutorial](https://nelenkov.blogspot.com/2012/04/using-password-based-encryption-on.html) with the caveat that a good rule of thumb is the salt size should be the same size as the key output. It looks like this:

{% highlight Java %}
// User types in their password:
String password = "password";  

// Store these things on disk used to derive key later:
int iterationCount = 1000;  
int saltLength = 32; // bytes; should be the same size
           as the output (256 / 8 = 32)  
int keyLength = 256; // 256-bits for AES-256, 128-bits for AES-128, etc  
byte[] salt; // Should be of saltLength  

// When first creating the key, obtain a salt with this:
SecureRandom random = new SecureRandom();  
byte[] salt = new byte[saltLength];  
random.nextBytes(salt);  

// Use this to derive the key from the password:
KeySpec keySpec = new PBEKeySpec(password.toCharArray(), salt,  
           iterationCount, keyLength);  
SecretKeyFactory keyFactory = SecretKeyFactory  
           .getInstance("PBKDF2WithHmacSHA1");  
byte[] keyBytes = keyFactory.generateSecret(keySpec).getEncoded();  
SecretKey key = new SecretKeySpec(keyBytes, "AES");  
{% endhighlight %}

That's it. You should not need anything else.

To make transitioning data easier, we covered the case of developers that have data encrypted with an insecure key, which is derived from a password every time. You can use the helper class InsecureSHA1PRNGKeyDerivator [in the example app](https://android.googlesource.com/platform/development/+/master/samples/BrokenKeyDerivation) to derive the key.

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

You can then re-encrypt your data with a securely derived key as explained above, and live a happy life ever after.

Note 1: as a temporary measure to keep apps working, we decided to still create the instance for apps targeting SDK version 23, the SDK version for Marshmallow, or less. Please don't rely on the presence of the Crypto provider in the Android SDK, our plan is to delete it completely in the future.

Note 2: Because many parts of the system assume the existence of a SHA1PRNG algorithm, when an instance of SHA1PRNG is requested and the provider is not specified we return an instance of OpenSSLRandom, which is a strong source of random numbers derived from OpenSSL.
