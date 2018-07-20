---
title: Java并发-控制并发线程数的Semaphore
date: 2018-07-17 10:26:46
toc: true
tags:
 - 并发
 - Semaphore
 - 转载
categories:
 - Java
---

> 【转载】-本文摘自《Java并发编程的艺术-方腾飞》（少许更正修改）

&nbsp;&nbsp;Semaphore(信号量)用来龙之同时访问特定资源的线程数量，它通过协调各个线程，以保证合理使用公共资源

&nbsp;&nbsp; 多年以来，我都觉得从字面上很难理解Semaphore所表达的含义，只能把它比作是控制流量的红绿灯。比如××马路要限制流量，只允许同时有一百辆车在这条路上行使，其他的都必须在路口等待，所以前一百辆车会看到绿灯，可以开进这条马路，后面的车会看到红灯，不能驶入××马路，但是如果前一百辆中有5辆车已经离开了××马路，那么后面就允许有5辆车驶入马路，这个例子里说的车就是线程，驶人马路就表示线程在执行，离开马路就表示线程执行完成，看见红灯就表示线程被阻塞，不能执行。

<!--more-->

----

## 1. 应用场景

&nbsp;&nbsp;`Semaphore`可以用于做流量控制，特别是公用资源有限的应用场景，比如数据库连接。假如有一个需求，要读取几万个文件的数据，因为都是IO密集型任务，我们可以启动几十个线程并发地读取，但是如果读到内存后，还需要存储到数据库中，而数据库的连接数只有10个，这时我们必须控制只有10个线程同时获取数据库连接保存数据，否则会报错无法获取数据库连接。这个时候，就可以使用`Semaphore`来做流量控制，如代码所示。

```java
public class SemophoreTest {

    private static final int THREAD_COUNT = 30;
    private static ExecutorService threadPool = Executors.newFixedThreadPool(THREAD_COUNT);  //新建线程池
    private static Semaphore s= new Semaphore(10);  //最多10个线程获得许可证

    public static void main(String[] args) {
        for (int i = 0; i < THREAD_COUNT; i++) {
            threadPool.execute(()->{
                try {
                    s.acquire();  //获取一个许可证
                    System.out.println("save data");
                    s.release(); //释放一个许可证
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }

        threadPool.shutdown();
    }

}
```

在代码中，虽然有30个线程在执行，但是只允许10个并发执行。`Semaphore`的构造方法`Semaphore(int permits)`接受一个整型的数字，表示可用的许可证数量。`Semaphore(10)`表示允许10个线程获取许可证，也就是最大并发数是10。`Semaphore`的用法也很简单，首先线程使用`Semaphore`的`acquire()`方法获取一个许可证，使用完之后调用`release()`方法归还许可证。还可以用`tryAcquire()`方法尝试获取许可证。

----

## 2. 其他方法

`Semaphore`还提供一些其他方法：

- `int availablePermits()` ：返回此信号量中当前可用的许可证数。
- `int getQueueLength()`：返回正在等待获取许可证的线程数。
- `boolean hasQueuedThreads()` ：是否有线程正在等待获取许可证。
- `void reducePermits(int reduction)` ：减少reduction个许可证。是个protected方法。
- `Collection getQueuedThreads()` ：返回所有等待获取许可证的线程集合。是个protected方法

----

## 其他链接

- [完整代码-Github](https://github.com/briarbear/Java_core/blob/master/src/main/java/concurrent/semaphore/SemophoreTest.java)
- [并发编程网-ifeve-控制并发线程数量的Semaphore](http://ifeve.com/concurrency-semaphore/)