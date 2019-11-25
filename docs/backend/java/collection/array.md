# 数组复习

[TOC]

## 数组的copy

 <mark>src：</mark> copy的源数组  
 <mark>srcPos：</mark>从哪个索引处开始  
 <mark>dest：</mark>拷贝到的目标数据  
 <mark>destPos：</mark>从目标数据的哪个位置开始放  
 <mark>length：</mark>复制几个元素  
 ``` java
    public static void copy() throws Exception {
        String[] src = {"a", "b", "c", "d"};
        String[] dest = new String[4];

        //将src中的b和c复制到dest的[1]和[2]位置
        
        System.arraycopy(src, 1, dest, 1, 2);

        System.out.println(Arrays.toString(dest));
    }
 ```
输出结果：  
```
[null, b, c, null]
```
## 从数组中删除某个元素  

本质上还是数组的拷贝  

``` java
    public static void remove() throws Exception {
        int[] src = {1, 2, 88, 3, 4, 5};

        //删除88,就应该从88的下一个元素的下标开始复制到结尾，复制到的数组还是src，从88的下标处开始放
        System.arraycopy(src, 3, src, 2, src.length - 3);

        //然后删除最后一个元素
        src[src.length - 1] = 0;
        System.out.println(Arrays.toString(src));
    }
```
输出结果：
```
[1, 2, 3, 4, 5, 0]
```
封装成方法：
``` java
    public static void remove(String[] array, int index) throws Exception {
        System.arraycopy(array, index + 1, array, index, array.length - index - 1);
        array[array.length - 1] = null;
        System.out.println(Arrays.toString(array));
    }
```

## 数组的扩容  

本质上是：先定义一个更大的数组，然后将原数组内容原封不动拷贝到新数组中  
``` java
    public static void main(String[] args) throws Exception {
        String[] arr = {"a", "b", "c"};
        System.out.println(Arrays.toString(arr));
        arr = enlarge(arr, 10);
        System.out.println(Arrays.toString(arr));
    }

    public static String[] enlarge(String[] array, int num) throws Exception {


//        String[] newArray = new String[array.length + num];
//
//        System.arraycopy(array, 0, newArray, 0, array.length);
//
//        return newArray;

        return Arrays.copyOf(array,num);
    }
```
输出结果：  
```
[a, b, c]
[a, b, c, null, null, null, null, null, null, null]
```
## 冒泡排序

![](https://cdn.static.note.zzrfdsn.cn/images/1258817-20190325093445247-432584102.gif)
``` java
    public static void main(String[] args) throws Exception {
        int[] arr = {3, 1, 6, 2, 9, 0, 7, 4, 5, 8};
        bubbleSort(arr);
    }

    public static void bubbleSort(int[] array) throws Exception {
        int temp;
        //两两比较减去一次多余的
        for (int k = 0; k < array.length - 1; k++) {
            boolean done = true;
            //循环一轮找出最大值，每一轮就会找出一个最大值就没有必要再循环全部，只需要循环到上一个最大值前即可
            for (int i = 0; i < array.length - 1 - k; i++) {
                if (array[i] > array[i + 1]) {
                    temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    done = false;
                }
                System.out.println(Arrays.toString(array));
            }

            //如果一轮循环完毕没有一个位置对换，就说明排序完毕，跳出循环
            if (done) {
                break;
            }
            System.out.println("------------------------------");
        }
    }
```
## 二分法查找

二分法查找原理：  

1. 只要低位下标不大于高位下标，就进行二分查找

2. 先在有序的数组中对半查找中间的坐标，如果中标和要查找的下标相等时，找到目标数，那二分结束。

3. 如果步骤2没有找到，那就会出现先2种情况：a、中标大于find值；b、中标小于find值；

   a. 如果中标大于find值，说明find值在中标的左边，那么高位就是此时的中标，然后继续二分

   b. 如果中标小于find值，说明find值在中标的右边，那么低位就是此时的中标，然后继续二分

4. 如果低位下标大于高位下标：那就是没有这个想要查找的find值


``` java
    public static void main(String[] args) throws Exception {
        int[] arr = {3, 1, 6, 2, 9, 0, 7, 4, 5, 8};
        //需要先对数据进行排序
        Arrays.sort(arr);
        System.out.println(Arrays.toString(arr));
        int index = binarySearch(arr, 0);
        System.out.println(index);
    }

    public static int binarySearch(int[] array, int key) throws Exception {
        int start = 0;
        int end = array.length - 1;

        while (start <= end) {
            //取中间数
            int middle = (start + end) / 2;
            if (key < array[middle]) {
                //要查找的数比中间数小，那就把查找结尾值变为中间值减去一
                end = middle - 1;
            } else if (key > array[middle]) {
                //要查找的数比中间数大，那就把查找开始位置变为中间值加一
                start = middle + 1;
            } else {
                //等于中间值
                return middle;
            }
        }

        //没有查到
        return -1;

//       return Arrays.binarySearch(array,key);
    }
```
