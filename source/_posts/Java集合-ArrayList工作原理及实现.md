---
title: Java集合-ArrayList工作原理及实现
date: 2018-06-25 16:25:37
toc: true
tags: 
 - List
 - 转载
categories: Java
---

> 【转载】 [原文链接](http://yikun.github.io/2015/04/04/Java-ArrayList%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86%E5%8F%8A%E5%AE%9E%E7%8E%B0/)

### 1. 概述

[关于Java集合的小抄](http://calvin1978.blogcn.com/articles/collection.html)中是这样描述的：

> 以数组实现。节约空间，但数组有容量限制。超出限制时会增加50%容量，用System.arraycopy()复制到新的数组，因此最好能给出数组大小的预估值。默认第一次插入元素时创建大小为10的数组。
>
> 按数组下标访问元素--`get(i)/set(i,e)` 的性能很高，这是数组的基本优势。
>
> 直接在数组末尾加入元素--`add(e)`的性能也高，但如果按下标插入、删除元素--`add(i,e), remove(i)`, `remove(e)`，则要用`System.arraycopy()`来移动部分受影响的元素，性能就变差了，这是基本劣势。



<!--more-->

然后再来学习一下官方文档：

> **Resizable-array** implementation of the List interface. Implements all optional list operations, and permits all elements, including null. In addition to implementing the List interface, this class provides methods to manipulate the size of the array that is used internally to store the list. (This class is roughly equivalent to Vector, except that it is unsynchronized.)

ArrayList是一个相对来说比较简单的数据结构，最重要的一点就是它的自动扩容，可以认为就是我们常说的“动态数组”。
来看一段简单的代码：

``` java
ArrayList<String> list = new ArrayList<String>();
list.add("语文: 99");
list.add("数学: 98");
list.add("英语: 100");
list.remove(0);
```

在执行这四条语句时，是这么变化的：

![](http://p7dzmubvx.bkt.clouddn.com/201806251855_100.png)其中，`add`操作可以理解为直接将数组的内容置位，`remove`操作可以理解为删除index为0的节点，并将后面元素移到0处。

### 2. add函数

当我们在`ArrayList`中增加元素的时候，会使用`add`函数。他会将元素放到末尾。具体实现如下：

``` java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

我们可以看到他的实现其实最核心的内容就是`ensureCapacityInternal`。这个函数其实就是**自动扩容机制的核心**。我们依次来看一下他的具体实现

``` java
private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }

    ensureExplicitCapacity(minCapacity);
}

private void ensureExplicitCapacity(int minCapacity) {
    modCount++;

    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}

private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    // 扩展为原来的1.5倍
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    // 如果扩为1.5倍还不满足需求，直接扩为需求值
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

也就是说，当增加数据的时候，如果ArrayList的大小已经不满足需求时，那么就将数组变为原长度的1.5倍，之后的操作就是把老的数组拷到新的数组里面。例如，默认的数组大小是10，也就是说当我们`add`10个元素之后，再进行一次add时，就会发生自动扩容，数组长度由10变为了15具体情况如下所示：
![arraylistadd](https://cloud.githubusercontent.com/assets/1736354/6993129/e892246e-db1c-11e4-9ae8-f9719688a1ca.png)
### 3 set和get函数

`Array`的`put`和`get`函数就比较简单了，先做`index`检查，然后执行赋值或访问操作：

``` java
public E set(int index, E element) {
    rangeCheck(index);

    E oldValue = elementData(index);
    elementData[index] = element;
    return oldValue;
}

public E get(int index) {
    rangeCheck(index);

    return elementData(index);
}
```
### 4 remove函数

``` java
public E remove(int index) {
    rangeCheck(index);

    modCount++;
    E oldValue = elementData(index);

    int numMoved = size - index - 1;
    if (numMoved > 0)
        // 把后面的往前移
        System.arraycopy(elementData, index+1, elementData, index,
                         numMoved);
    // 把最后的置null
    elementData[--size] = null; // clear to let GC do its work

    return oldValue;
}
```

注释很清楚：

> Removes the element at the specified position in this list. Shifts any subsequent elements to the left (subtracts one from their indices).
### 参考资料

[Class ArrayList](http://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html#add-E-)
[ArrayList其实就那么一回事儿之源码浅析](http://www.cnblogs.com/dongying/p/4013271.html)
[关于ArrayList](http://my.oschina.net/tunie/blog/122530)