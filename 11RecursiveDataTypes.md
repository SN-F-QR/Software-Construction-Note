# 递归数据类型

## 递归

[递归*计算*](https://web.mit.edu/6.102/www/sp24/classes/11-recursive-data-types/recursion-and-iteration-review.html)的模式包含三种类型:

- list-like, 即递归的对象类似数组
- tree-like, 即递归对象类似树, 在遇到特定条件时(如叶子结点)才 return
- graph-like

本课集中使用 list- 和 tree-like 的模式. 递归数据类型和递归函数一样, 有基础值(base case, 即递归结束最后返回的值)和递归值(recursive case, 递归中间返回的值)的分类.

## 例子 不可修改 lists

不可修改 lists 是一个经典的递归数据类型, 现在将其定义为 `ImList<E>`, 包含下列 4 种基础运算:

- empty: void -> ImList // 返回空 list
- cons: E × ImList -> ImList  // 新增一个元素到另一个 list 的前面并返回一个新的 list
- first: ImList -> E // 返回第一个元素, 要求 list 非空
- rest: ImList -> ImList // 返回除了第一个元素以外的元素组成的 list, 要求 list 非空

易得如下现象:

```
empty() → [ ]
cons(0, empty()) → [ 0 ]
cons(0, cons(1, cons(2, empty()))) → [ 0, 1, 2 ]

x = cons(0, cons(1, cons(2, empty())))  → [ 0, 1, 2 ]
first(x) → 0
rest(x) → [ 1, 2 ]

first(rest(x)) → 1
rest(rest(x)) → [ 2 ]
first(rest(rest(x)) → 2
rest(rest(rest(x))) → [ ]
```

在 ts 中, 利用接口来定义不可修改 list 如下:

```ts
// todo: empty() returning ImList<E>
interface ImList<E> {
  cons(first: E): ImList<E>;
  readonly first: E;
  readonly rest: ImList<E>;
}
```

其中 Cons 和 Empty 定义为两个类:

```ts
class Empty<E> implements ImList<E> {
  public constructor() {}
  public cons(first: E): ImList<E> {
    return new Cons<E>(first, this);
  }
  public get first(): E {
    throw new Error("unsupported operation");
  }
  public get rest(): ImList<E> {
    throw new Error("unsupported operation");
  }
}

class Cons<E> implements ImList<E> {
  public readonly first: E;
  public readonly rest: ImList<E>;

  public constructor(first: E, rest: ImList<E>) {
    this.first = first;
    this.rest = rest;
  }
  public cons(first: E): ImList<E> {
    return new Cons<E>(first, this);
  }
}
```

然而直接使用 Empty 类作为 empty()方法会牺牲抽象数据类型的表示独立, 用户必须知道 Empty 这个类, 因此可以设计如下工厂函数:

```ts
function empty<E>(): ImList<E> {
  return new Empty<E>();
}

// 此时可以进行一些运算
const x = nil.cons(2).cons(1).cons(0); // get [0, 1 ,2]
const y = x.rest.cons(4); // get [4, 1, 2]
```

这些运算的一个关键点是, 内存中**只存在一个**不可修改列表[1,2], 基于此分化出了新的两个列表 x 和 y.

上面在写构造函数时, ts 提供更方便的方法直接将表示值的属性(private 等)直接写在构造函数中(Parameter Properties):

```ts
class Cons<E> implements ImList<E> {
  public constructor(
    public readonly first: E,
    public readonly rest: ImList<E>
  ) {
    this.first = first;
    this.rest = rest;
  }
  public cons(first: E): ImList<E> {
    return new Cons<E>(first, this);
  }
}
```

## 递归数据类型定义

在上面对 Cons 类的定义中, 其继承了 ImList 的接口, 而成员 rest 也为一种 ImList 类型的变量, 这就是一种递归. 对于 ImList 集合而言, 元素要么是 Empty 类, 要么是 Cons 类.

如果将数据类型定义为等式的话, 左边为 ADT 右边则为表示值的组合, 此时递归数据类型将会在左右都出现, 即定义本身包含自己.

- `ImList<E> = Empty + Cons(first: E, rest: ImList<E>)`
- `Tree<E> = Empty + Node(e: E, left: Tree<E>, right: Tree<E>)`

当编写递归数据类型时, 可以在代码中做上述的等式的注释来帮助理解.

## 递归数据类型的函数

在定义递归数据类型的函数时, 通常也为递归的函数设计. 这类运算操作的使用模式为:

- 在 ADT 接口中进行定义
- 在每一个具体的变量(即实现接口的类)中部署实际操作

这种模式非常常见, 又叫做 _interpreter pattern_.

比如在先前的 ImList 中新增 size 运算.

```ts
interface ImList<E> {
  // ...
  readonly size: number;
}

class Empty<E> implements ImList<E> {
  // ...
  public readonly size = 0;
}

class Cons<E> implements ImList<E> {
  // ...
  public get size(): number {
    return 1 + this.rest.size;
  }
}
```

还可以新增一下运算方法:

```
isEmpty : ImList → boolean
isEmpty(Empty) = true
isEmpty(Cons(first: E, rest: ImList)) = false

contains : ImList × E → boolean
contains(Empty, e: E) = false
contains(Cons(first: E, rest: ImList), e: E) = (first=e) or contains(rest, e)

append: ImList × ImList → ImList
append(Empty, that: ImList) = that
append(Cons(first: E, rest: ImList), that: ImList) = cons(first, append(rest, that))

reverse: ImList → ImList
reverse(Empty) = empty()
reverse(Cons(first: E, rest: ImList)) = append(reverse(rest), cons(first, empty()))
```

### Tuning the rep

由于 size 这种方法调用时时间复杂度为 O(n), 比较低效, 因此可以在递归数据类型中新增一个 cache 的可变量, 如:

```ts
class Cons<E> implements ImList<E> {
  private readonly first: E;
  private readonly rest: ImList<E>;
  private cachedSize: number | undefined = undefined;
  // rep invariant:
  //   cachedSize is either a positive integer, equal to 1 + the number of E instances
  //   found in this.rest, or undefined

  // ...
  public get size(): number {
    if (this.cachedSize === undefined) this.cachedSize = 1 + this.rest.size;
    return this.cachedSize;
  }
}
```

此时可以将运算过一次的 size 存储起来, 后续直接返回. 但这样的话不可变的 list 就包含了可变量, 似乎破坏了不变性. 实际上这种现象就是 温和的副作用, 即不影响递归变量类型的抽象值表示, 其仍为不可修改的.

## 表示独立和表示暴露的重访问(revisited)

尽管递归数据类型有一些运算操作, 比如 size, isEmpty, 但他们不会导致表示暴露. 在设计这些操作时, 它们的 spec 都只包括抽象值的内容, 不包括表示值 (e.g., return true if this is an instance of the Empty concrete class), 因此无论表示值是什么都不会被返回到用户.

## Null vs. empty

本课使用了 Empty 类而不是 undefined 或 null 作为空的 ImList, 这样的好处是可以对空 ImList 同样调用该数据类的操作, 如 size, 简化了代码操作(不需要先进行空值的判断). 这种设计模式也叫做: 哨兵对象 (sentinel objects).

## 静态类型 vs. 动态类型

对于静态检查的面向对象语言中, 共有两次类型检查: 编译时, 程序运行时.

在编译时, 每一个变量有自己的静态类型, 由定义或者推断产生. 比如 定义`s:string`, 则 s 为字符串, `s.length`为 number. ts 也支持推断, 如`n=5`推断 n 为 number.

运行时, 每一个对象有动态类型, 也叫实际类型和运行时类型. 比如 `new String(), new Empty()` 都是在运行时分配的动态类型 `String Empty`.

因此, 对于一个变量, 如`const hello="Hello"`, 其在编译时属于 string 的静态类型, 而在运行时属于 string 的动态类型.

## 动态类型检查

动态分派使得可以在运行时检查变量的类型, 然后针对特定的类型执行代码. 但是这种方法很可能会引发 bug, 特别是当数据类型的结构或 rep 发生改变时, 因此应当避免使用这种方法.

比如新增一个 last 运算到 ImList, 可以用:

```ts
class Cons<E> implements ImList<E> {
  // ...
  public last(): E {
    if (this.rest instanceof Empty) {
      return this.first;
    } // do not do this
    return this.rest.last();
  }
}
```

尽管看似合理, 但如果我们新增一个 wrapper 类(一种常见的设计模式, 又叫做修饰模式), 用来包装 ImList 时, 这个 last 运算就会失效. 此时 Empty 的 ImList 有两种表示方法, 空的 CachingList 或者 Empty.

```ts
class CachingList<E> implements ImList<E> {
  private readonly wrappedList: ImList<E>;
  private readonly cachedSize: number;
  // rep invariant:
  //   cachedSize === wrappedList.size

  // ... constructor and other operations omitted

  public get first(): E {
    return wrappedList.first;
  }
  public get rest(): ImList<E> {
    return wrappedList.rest;
  }
  public get size(): number {
    return cachedSize;
  }
}
```

## 相等

instanceof 的常见用法是在比较两个对象是否值相等的时候, 此时 equalValue()的比较对象为任意类型, 所以有必要先进行类型的判断.

有两种实现 equalValue 的方法:

```ts
// 直接逐个对比
interface ImList<E> {
  // ... includes size and get(..) ...
  equalValue(that: ImList<E>): boolean;
}
class Empty<E> implements ImList<E> {
  public equalValue(that: ImList<E>): boolean {
    return that.size === 0;
  }
}
class Cons<E> implements ImList<E> {
  public equalValue(that: ImList<E>): boolean {
    if (this.size !== that.size) {
      return false;
    }
    for (let ii = 0; ii < this.size; ii++) {
      if (this.get(ii) !== that.get(ii)) {
        return false;
      }
    }
    return true;
  }
}

// 或者递归进行对比
class Empty<E> implements ImList<E> {
  public equalValue(that: ImList<E>): boolean {
    return that instanceof Empty;
  }
}
class Cons<E> implements ImList<E> {
  public equalValue(that: ImList<E>): boolean {
    if (!(that instanceof Cons)) {
      return false;
    }
    return this.first === that.first && this.rest.equalValue(that.rest);
  }
}
```

第二种方法更加简单易懂, 但相对也容易出 bug.

## 另一个递归数据类型的例子: 布尔公式

```
(P ∨ Q) ∧ (¬P ∨ R) 可以表示为

Formula = Variable(name: String)
          + Not(formula: Formula)
          + And(left: Formula, right: Formula)
          + Or(left: Formula, right: Formula)

有
And( Or(Variable("P"), Variable("Q")),
     Or(Not(Variable("P")), Variable("R")) )
```

## 回溯查找 与 不可变性

ImList 中的多个列表, 他们的末端才能共享, 如果开头相同而中间发生了分歧, 这些部分都必须单独存储.

**在这种结构下**, 回溯查找是很好的应用场景, 当搜索遇到死路时, 可以返回上一个节点再进行其他路径的判断. 而可变数据类型在回溯时需要撤销当前路径的变量绑定, 比较麻烦. 完全不共享的不可修改类型则会因为每次搜索新路径都要复制一份到内存, 导致存储空间平方级增长.

这种末端共享的结构还能直接提供并行化, 允许给不同的处理器分配不同路径来并行搜索.

## 不可变性 与 性能

不可修改与可修改的选择在于多少数据能被共享使用. 如果数据频繁的需要修改小部分内容, 那么可修改通常来讲更加高效. 但事实不常常如此, 比如对于一个不可修改的 string, 当有少部分字符被修改并返回新值时, 可以不需要全部重新在内存中复制未修改的部分, 而是只重新写入被修改的部分.

git object graph 也是一个不可修改性带来好处的例子. 新的 commits 可以指向 parent commits 因为它们不会被修改.
