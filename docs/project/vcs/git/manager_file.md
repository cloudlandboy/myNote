# 使用Git管理项目文件

## 创建项目

> 创建一个文件夹，该文件夹就相当于你项目的根路径

## 新建文件

> 我们在项目文件夹创建一个a.txt文件，然后右键菜单打开git命令行

![image-20210528225959906](/home/clboy/.config/Typora/typora-user-images/image-20210528225959906.png)

## 查看目录状态(git status)

> 在git命令行中用`git status`命令，输入如下结果：

```shell
fatal: not a git repository (or any of the parent directories): .git
```

告诉我们这不是一个git储存库



## 初始化Git存储库(git init)

> 由git status的显示结果知道当前目录不是一个git储存库，也就是没有与git建立关联，只是一个普通的文件夹。
>
> 可以使用`git init` 命令使其与git关联

![image-20210528231155028](/home/clboy/.config/Typora/typora-user-images/image-20210528231155028.png)

执行命令之后目录下会生成一个`.git`文件夹，此时这个目录就与git建立关联了，至于`.git`文件夹有什么用，暂时先不用管。可以再次使用`git status`查看当前目录状态

```shell
......

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        a.txt

nothing added to commit but untracked files present (use "git add" to track)
```

命令结果大致是告诉我们有`未跟踪`的文件并且告诉我们使用`git add 文件`命令建立跟踪，下面还列举出了相应的文件，接着我们就按照它提示的做

## 跟踪文件(git add)

> 使用 `git add a.txt`，然后再次查看目录状态

```shell
$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   a.txt

```

## 取消跟踪(git rm --cached)

> 使用`git add` 跟踪文件之后git给出使用`git rm --cached 文件`的命令取消跟踪
>
> 取消跟踪之后的文件就相当于没有被git监视，你所做的操作对git而言它是不知道的
>
> 我们这里就先不取消跟踪了，按照如下步骤做个测试

1. 修改`a.txt`的内容(原来是没内容的)

   ```txt
   1111111111111111
   ```

   ```shell
   $ cat a.txt
   1111111111111111
   ```

   

2. `git rm --cached a.txt` 再取消跟踪

   ```
   error: the following file has staged content different from both the
   file and the HEAD:
       a.txt
   (use -f to force removal)
   ```

   提示出错，如下文件其暂存的内容和工作区及 HEAD 中的都不一样，HEAD先不管是啥，工作区我们知道是指当前项目目录，因为我们在上次使用`git add`文件之后又修改了文件的内容，再次使用`git status` 命令查看是否有什么提示

   ![image-20210528234520538](/home/clboy/.config/Typora/typora-user-images/image-20210528234520538.png)

   上面那一块刚刚已经试过了，下面提示的意思是

   ```
   尚未暂存以备提交的变更：
     （使用 "git add <文件>..." 更新要提交的内容）
     （使用 ""git restore <file>..." 丢弃工作区的改动）
   ```

   并且可以看到，一个是绿色字体，标识为`new file`，下面的是红色字体，标识是`modified`。由此知道，一个文件第一次使用`git add`命令进行跟踪之后，以后对文件的修改git都是可以察觉到的。并且每次修改完需要再次使用`git add`去更新跟踪记录，根据提示

   使用 `git add a.txt`进行更新，然后再查看状态就没有`modified`标识了

   

## 丢弃工作区的改动(git restore file)

可以看到上面修改文件之后，未提交更新之前，查看状态下面还有一条命令`git restore file`，说是丢弃`工作区`的改动，猜测一下是不是说把文件直接恢复到最后一次 `git add`的状态，我们再来修改`a.txt`内容

```txt
$ cat a.txt
111111111111
222222222222
```

1. 使用`git status` 命令查看工作区状态，很明显提示修改了a.txt

   ```shell
   $ git status
   On branch master
   
   No commits yet
   
   Changes to be committed:
     (use "git rm --cached <file>..." to unstage)
           new file:   a.txt
   
   Changes not staged for commit:
     (use "git add <file>..." to update what will be committed)
     (use "git restore <file>..." to discard changes in working directory)
           modified:   a.txt
   ```

   

2. 然后使用`git restore a.txt`之后，再查看a.txt文件的内容，以及使用`git status` 命令查看工作区状态

   ```shell
   $ cat a.txt
   111111111111
   
   $ git status
   On branch master
   
   No commits yet
   
   Changes to be committed:
     (use "git rm --cached <file>..." to unstage)
           new file:   a.txt
   ```

3. 果不其然，刚刚对a.txt所做的修改都没了，恢复成上次`git add`时候的状态

4. 这个命令直接放弃对工作区的修改，一旦执行是没有后悔药可以吃的，因为你本次对文件的修改git是没有保存的，比如你又新建一个b.txt，并没有使用`git add` 去暂存跟踪这个b.txt，然后把它直接删除掉了，这个没有让git对其跟踪，自然没办法帮你恢复。`b.txt`在git那里根本没有记录

   ![image-20210529002447841](/home/clboy/.config/Typora/typora-user-images/image-20210529002447841.png)

5. 由于我们之前修改`a.txt`文件内容为`111111111111`之后使用`git add`进行跟踪更新了，现在即使我们删除a.txt也可以恢复到上次修改的状态

   ![image-20210529002757018](/home/clboy/.config/Typora/typora-user-images/image-20210529002757018.png)

   ![image-20210529002832632](/home/clboy/.config/Typora/typora-user-images/image-20210529002832632.png)

### 老版本命令

> 如果使用的老版本的git，与之对应的命令是`git checkout -- file`





