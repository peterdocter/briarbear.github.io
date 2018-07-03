---
title: Spring-AOP核心原理及手写实现
date: 2018-07-03 18:43:21
toc: true
tags: AOP
categories: Spring
---

## 1. 基本原理

> Spring AOP构建在动态代理基础之上，因此，Spring对AOP的支持局限于方法拦截（AspectJ静态代理框架能够实现更为高级的功能，本文不做介绍）
>
> Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是在内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法 

Spring AOP中的动态代理主要有两种方式 :

1. **JDK动态代理**：JDK动态代理通过反射来接收被代理的类，并且要求被代理的类必须实现一个接口。JDK动态代理的核心是`InvocationHandler`接口和`Proxy`类 
2. **CGLIB动态代理**： 如果目标类没有实现接口，那么Spring AOP会选择使用CGLIB来动态代理目标类。CGLIB（Code Generation Library），是一个代码生成的类库，可以在运行时动态的生成某个类的子类，注意，CGLIB是通过继承的方式做的动态代理，因此如果某个类被标记为final，那么它是无法使用CGLIB做动态代理的
3. 下面将手动实现一个AOP功能（完整代码见文末）

<!--more-->

---

## 2. 基本类

```java
/**
 * Greeding 接口
 */
public interface Greeding {
    public void say();
}

/**
 * 实现Greeding接口，
 */
@Component
public class Hello implements Greeding {
    @Override
    public void say() {
        System.out.println("say hello");
    }
}

/**
 * 定义切面
 */
@Component
public class MyAOP {

    public void before(){
        System.out.println("before...");
    }

    public void after(){
        System.out.println("after...");
    }
}

/**
 * 代理工厂
 */
@Component
public class ProxyFactory {

    //目标对象
    private static Object target;
    private static MyAOP myAOP;

    //生成代理对象的方法
//    @Autowired
    public static Object getProxyInstance(Object object,MyAOP aop){
        target = object;
        myAOP  = aop;

        return Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), (proxy, method, args) -> {
            myAOP.before(); //执行before方法
            //指向目标对象的方法
            Object returnValue = method.invoke(target,args);
            myAOP.after(); //执行afer方法
            return returnValue;
        });
    }
}



```

---

## 3. 注入配置文件

- xml配置文件，由于是静态方法，所以采用xml配置的方式注入

```xml
    <context:component-scan base-package="aop.myaop"/>

    <!--静态工厂方法注入 Spring注入四种方法之一-->
    <bean id="proxy" class="aop.myaop.ProxyFactory" factory-method="getProxyInstance">
        <constructor-arg index="0" ref="hello"/>
        <constructor-arg index="1" ref="myAOP"/>
    </bean>
```

---

## 4. 测试验证

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Config.class)
public class HelloTest {

    ApplicationContext ac =  new ClassPathXmlApplicationContext("aopbeans.xml");

//    @Autowired
//    ProxyFactory proxyFactory;

    @Test
    public void say() {
        System.out.println("");
        Object o = ac.getBean("proxy");
        Greeding hello = (Greeding)o;
        hello.say();
        System.out.println(hello.getClass());
    }
}
```

运行结果为：

```shel
before...
say hello
after...
class com.sun.proxy.$Proxy19
```

可以看到这里使用了JDK动态代理

---

## 相关链接

- [完整代码，喜欢点个Star](https://github.com/briarbear/SpringDemo/tree/master/src/main/java/aop/myaop) 
- [手写实现AOP框架](https://blog.csdn.net/scgaliguodong123_/article/details/49763409)
- [Spring AOP实现原理](http://listenzhangbin.com/post/2016/09/spring-aop-cglib/)