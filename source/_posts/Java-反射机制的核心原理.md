---
title: Java-反射机制的核心原理
date: 2018-07-09 16:24:07
toc: true
tags:
 - 反射
 - JVM
categories:
 - Java
---

## 0. 说明

> 由于最近被一个同学问到Java的反射，我给它讲了反射，可是发现，我只是讲了什么是反射，别人却说，反射的实现原理是啥，这才发现我答非所问。后来去网上查了资料，大部分都只是讲到反射的使用，关于原理的这部分，却很少涉及，这是又拿起了《深入理解Java虚拟机》，尝试从中找答案。

<!--more-->

## 1. 概述

> 引述下百度百科关于反射的定义：Java反射机制就是在运行状态中，对于任意一个类，都能够知道这个类的属性和方法。对于任意一个对象能够调用它的任意一个属性和方法。这种动态获取的信息和动态调用对象的方法的功能称为Java语言的**反射机制**
>
> 关于反射，阿里的一位工程师总结为6个字: **自描述、自控制**，
>
> - 自描述：通过反射动态获取类、属性、方法的信息 ；
> - 自控制：构建对象并控制对象的属性和行为 

-----

## 2. 实例

```java
public class T4 {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InstantiationException, InvocationTargetException {
        Class clazz = Class.forName("test.T");  //test.t 这是类的全名 test是包名
        //Class clazz = test.T.class;
        Object object = clazz.newInstance();
        Method method = clazz.getMethod("hello");
        method.invoke(object);
    }
}
 
class T{
    public void hello(){
        System.out.println("hello world!");
    }
}
 
```

- 这里只是演示了一个反射的简单使用实例，下文将针对这个实例做详细的解释

## 3. 核心概念

#### 1. Class类

- 在反射中有一个核心的类型，那就是Class类型，可以理解为Java中类的类型， 它是类的访问入口，也是反射的关键点，它是在类加载时创建，不能够显式创建，后面的类加载会详细讲到
- `java.lang.Class`对象，它也是一个对象，也是Object的子类。获得Class对象，可以通过三种方式：
  - 通过类的全名:`className.class`：
  - 通过类的实例：`t.getClass()`，其中t为某个类的实例
  - 通过`Class.forName()`方法,参数为类的全名，见示例
- 获得类的类类型（Class类型），是获得类的访问入口，才有后续的反射操作

#### 2. 运行时状态

- 对于对象的使用，我们的操作经常是这样的：`T t = new T()`,T为某个类名，运行步骤大体为：

  ![](http://p7dzmubvx.bkt.clouddn.com/201807090934_227.png)

- 在Java中，程序中一般的对象的类型都是在编译器就确定下来，而Java反射机制可以动态的创建对象并调用其属性，即使这个对象的类型在编译器是未知的

- 反射的核心就是JVM在运行时才动态加载类或者调用方法/访问属性。

#### 3. 类加载

- 类加载主要包括3个步骤：加载、连接（验证、准备、解析）、初始化；这里我们重点讨论加载过程：
- **加载** 是 **类加载** （Class Loading）过程中的一个阶段，在加载阶段中，虚拟机需要完成以下三件事情：
  1. 通过一个类的全限定名来获取定义此类的二进制字节流
  2. 将该字节流所代表的静态存储结构转化为方法区的运行时数据结构
  3. 在内存（Java内存模型）中生成一个代表这个类的`java.lang.Class`对象，作为方法区这个类的各种数据的访问入口，Class对象比较特殊，它虽然是对象，但是存放在方法区里面
- 这里生成的Class对象，对于反射而言，至关重要

#### 4. 方法区

- 方法区是Java运行时数据区的划分的一部分，它与Java堆一样，是各个线程共享的内存区域，它用来存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。
- 方法区存放着Class对象，它是反射的入口

---

## 4. 原理

- 讲完了上面的核心概念，下面对反射的基本原理做一下总结：

  > JVM在运行时通过类的全限定名、实例的`getClass()`方法等获取Class对象信息，然后从方法区中匹配到该类的Class对象，它保存了类的类型、方法信息，构造器、字段等。然后从Class对象中动态获取类信息或者构造类对象，完成反射过程

- 以上为个人理解，如有错误，还望指出