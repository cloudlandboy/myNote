#   LinkedList原理

[TOC]

LinkedList底层用双向链表实现的存储。特点：查询效率低，增删效率高，线程不安全。

​      双向链表也叫双链表，是链表的一种，它的每个数据节点中都有两个指针，分别指向前一个节点和后一个节点。 所以，从双向链表中的任意一个节点开始，都可以很方便地找到所有节点。

![ LinkedList的存储结构图.png](https://cdn.static.note.zzrfdsn.cn/images/1495616843888130.png)

​      每个节点都应该有3部分内容：

​      我们查看LinkedList的源码，可以看到里面包含了双向链表的相关代码：

![LinkedList的底层源码.png](https://cdn.static.note.zzrfdsn.cn/images/20191030205358.png)  
![ LinkedList的底层源码.png](https://cdn.static.note.zzrfdsn.cn/images/20191030205526.png)

## 自己实现linkedlist

``` java
package cn.clboy.linkedlist;

import java.util.*;

/**
 * @Author cloudlandboy
 * @Since 1.0.0
 */

public class MyLinkedList<E> {


    /**
     * 当前列表中节点数量
     */
    private int size = 0;

    /**
     * 第一个节点
     */
    private MyLinkedList.Node<E> first;

    /**
     * 最后一个节点
     */
    private MyLinkedList.Node<E> last;

    public int size() {
        return this.size;
    }

    public boolean isEmpty() {
        return this.size == 0;
    }

    /**
     * 添加节点
     *
     * @param element
     * @return
     */
    public boolean add(E element) {
        Node<E> temp = last;
        //创建一个新节点
        Node<E> newNode = new Node<E>(last, element, null);
        //新添加的就是最后一个节点
        last = newNode;
        //判断添加前最后的节点是否存在值，不存在说明是第一次添加,那么第一个节点也是新添加的这个节点
        if (temp == null) {
            first = newNode;
        } else {
            //不是null，那么就不是第一次添加，把next链接到新添加的节点
            temp.next = newNode;
        }

        //当前列表中节点数量+1
        size++;
        return true;
    }

    /**
     * 获取节点，内部使用
     *
     * @param index
     * @return
     */
    private Node<E> node(int index) {
        //判断下标是否合法
        if (index < 0 || index > size - 1) {
            throw new IndexOutOfBoundsException("下标不合法");
        }

        //提高效率，如果下标大于size的一半则倒序循环,因为取得是next所以循环到index前一个
        Node<E> node;
        if (index < size / 2) {
            node = first;
            for (int i = 0; i < index; i++) {
                node = node.next;
            }
        } else {
            node = last;
            for (int i = size - 1; i > index; i--) {
                node = node.prev;
            }
        }

        return node;
    }

    /**
     * 获取指定索引的值
     *
     * @param index
     * @return
     */
    public E get(int index) {
        Node<E> node = node(index);
        return node.item;
    }

    /**
     * 设置指定索引处的值
     *
     * @param index
     * @param element
     * @return
     */
    public E set(int index, E element) {
        Node<E> node = node(index);
        //先获取旧值
        E oldValue = node.item;
        //设置新值
        node.item = element;
        //将旧值返回
        return oldValue;
    }

    /**
     * 删除匹配节点
     *
     * @param element
     * @return
     */
    public boolean remove(E element) {
        Node<E> temp = first;
        //循环比较值是否相等
        while (temp != null) {
            //处理null值情况
            if (element == null && temp.item == null) {
                unlink(temp);
                return true;
            } else if (element != null && element.equals(temp.item)) {
                //非null进行equals比较
                unlink(temp);
                return true;
            }
            temp = temp.next;
        }
        return false;
    }

    /**
     * 删除节点内部使用
     *
     * @param node
     */
    private E unlink(Node<E> node) {
        Node<E> prev = node.prev;
        Node<E> next = node.next;

        //是第一个节点
        if (prev == null) {
            //将下一个节点变为第一个节点
            next.prev = null;
            first = next;
        } else {
            //直接将当前节点的上一个节点与当前节点的下一个节点链接，清空当前节点引用
            prev.next = next;
            node.prev = null;
        }
        //是最后一个节点
        if (next == null) {
            //将上一个节点变为最后一个节点
            prev.next = null;
            last = prev;
        } else {
            //直接将当前节点的下一个节点与当前节点的上一个节点链接，清空当前节点引用
            next.prev = prev;
            node.next = null;
        }

        E value = node.item;
        node.item = null;
        //数量减一
        size--;
        return value;
    }

    @Override
    public String toString() {
        StringBuilder console = new StringBuilder("[");
        Node<E> temp = first;
        while (temp != null) {
            console.append(temp.item).append(",");
            temp = temp.next;
        }
        console.setCharAt(console.length() - 1, ']');

        return console.toString();
    }

    private static class Node<E> {
        E item;
        MyLinkedList.Node<E> next;
        MyLinkedList.Node<E> prev;

        Node(MyLinkedList.Node<E> prev, E element, MyLinkedList.Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

}
```

