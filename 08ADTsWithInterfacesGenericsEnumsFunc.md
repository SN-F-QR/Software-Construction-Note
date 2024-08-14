# 用接口、泛型、枚举和函数定义ADTs

## 接口(interface)

TS的`interface`可以用于实现ADTs, 类通过`implements`对接口进行调用. 接口的一大优势是只和用户建立契约(contract)关系, 但本身不包含表示值. 同时, 因为接口可以被多个类调用, 所以它允许多个ADT的多种不同表示共存.

### TS中的接口

接口包括ADT的规范, 即公共函数签名和公共实例方法. 接口不包括表示值, 故不会定义private变量和函数主体, 也不会包括虚拟函数、表示值、或避免表示暴露的方法.

## 子类型(subtypes)

子类型是超类型的子集, 如string和Array是超类ArrayLike的子集. 对应到规范中则为“每一个子类型满足超类型的规范“. 因此子类型的规范应当等于或强于超类型的规范.

TS通过编译检查来强制这一要求的实现, 比如调用了接口的类需要实现接口中所有定义的方法. 但是这一检查无法检出其它弱化规范的可能, 比如子类型实际上的先决条件更加严格等.

### 如何在TS中定义子类型

```ts
class MyArray<T> implements ArrayLike<T> {
    ...
}
```

这里定义MyArray类为超类型ArrayLike的子类型, 需要实现超类型中的所有操作. 但是需要人为保证规范的相同或更严格.

不同接口之间也可以定义为子类型, 使用extends:

```ts
interface ReversibleArrayLike<T> extends ArrayLike<T> {
    // inherits signatures and specs of existing ArrayLike operations, and adds new ones:

    /** Reverse this array, mutating it in place. */
    public reverse(): void;
}
```

ReversibleArrayLike在超类型操作的基础上, 通过增加了reverse()操作, 使得规范更加严格.

### TS中结构化子类型

可以通过让B实现超类型A中的所有运算来变为A的子类型. 这种方法无需显式的定义. 尽管结构化子类型提供了便利, 但也存在一定的漏洞, 使得B可以成为A的子类型尽管两者的规范是不兼容的. 

比如Array是ReadonlyArray的结构化子类型(包含了所有的运算), 因此可以`const readonlyArr: ReadonlyArray<number> = [ 1, 2, 3 ];`. 但是如果Array本身存在别名, 就会有漏洞:

```ts
const arr: Array<number> = [ 1, 2, 3 ];
const readonlyArr: ReadonlyArray<number> = arr;

arr.push(4);
console.log(readonlyArr); // prints  1,2,3,4
```

此时readonlyArray这一超类型的**不可修改性被破坏了**, 所以尽管Array是结构化子类型, 其并非真正的子类型, 因为Array**不提供**不可修改性.

## 例子: MyString

```ts
/**
 * MyString represents an immutable sequence of characters.
 */
interface MyString { 

    // We'll skip this creator operation for now
    // /**
    //  * @param s 
    //  * @returns MyString representing the sequence of characters in s
    //  */
    // public constructor(s: string) { ... }

    /**
     * @returns number of characters in this string
     */
    length(): number;

    /**
     * @param i character position (requires 0 <= i < string length)
     * @returns character at position i
     */
    charAt(i: number): string;

    /**
     * Get the substring between start (inclusive) and end (exclusive).
     * @param start starting index
     * @param end ending index.  Requires 0 <= start <= end <= string length.
     * @returns string consisting of charAt(start)...charAt(end-1)
     */
    substring(start: number, end: number): MyString;
}
```

一个简单的部署

```ts
class SimpleMyString implements MyString {

    private a: Uint16Array;

    public constructor(s: string) {
        this.a = new Uint16Array(s.length);
        for (let i = 0; i < s.length; ++i) {
           this.a[i] = s.charCodeAt(i);
        }
    }

    public length(): number {
        return this.a.length;
    }

    public charAt(i: number): string {
        return String.fromCharCode(this.a[i]);
    }

    public substring(start: number, end: number): MyString {
        const that = new SimpleMyString("");  // make a temporarily-empty object
        that.a = this.a.slice(start, end);    // ... and immediately replace its array
        return that;
    }
}
```
或者一个升级版

```ts
class FastMyString implements MyString {

    private a: Uint16Array;
    private start: number;
    private end: number;

    // !缺少了RI和AF的描述
    public constructor(s: string) {
        this.a = new Uint16Array(s.length);
        for (let i = 0; i < s.length; ++i) {
            this.a[i] = s.charCodeAt(i);
        }
        this.start = 0;
        this.end = this.a.length;
    }

    public length(): number {
        return this.end - this.start;
    }

    // 可改进, 注意当i超出substring但仍在a.length范围内
    public charAt(i: number): string {
        return String.fromCharCode(this.a[this.start + i]);
    }

    public substring(start: number, end: number): MyString {
        const that = new FastMyString(""); // make a temporarily-empty object
        that.a = this.a;                   // ... and immediately replace its instance variables 
        that.start = this.start + start;
        that.end = this.start + end;
        return that;
    }
}
```

当用户想使用MyString时, 需要具体知道FastMyString或者SimpleMyString的名字, 而这明显破坏了抽象的本意.

此时我们可以使用工厂函数(factory function), 工厂通常是一个用来创建其他对象的对象:

```ts
/**
 * @param s 
 * @returns MyString representing the sequence of characters in s
 */
function makeMyString(s: string): MyString {
    return new FastMyString(s);
}

const s: MyString = makeMyString("good morning");
console.log("The first character is: " + s.charAt(0));
```

但隐藏部署也有一定的缺陷, 比如当用户想使用其他的部署时.

## 为何使用接口?

- 为编译器和人提供说明的文档.
- 允许性能的平衡. 接口允许ADT的多种表示, 而不同表示之间独立且有不同的性能区别, 可以根据实际情况使用.
- 允许带有欠决定规范的方法.
- 允许一个类的多种看法(view). 一个类可以部署多个接口, 比如一个UI widget可以看作widget或者list.
- 更多或更少的可信任部署. 可以用接口先进行简单部署, 再同时放到更复杂更容易出bug的部署中.

## 子类

子类继承自超类:
- 继承了所有实例方法, **包括方法体**
  - 可以重载这些方法
- 继承了**私有表示值**
- 可以增加新的方法和表示域

加粗部分为子类和接口部署类的区别. 与接口类似的是, 子类同样需要有与超类相同或更严格的规范.

子类继承表示值可能会带来这些问题:
- 继承同样的表示暴露
- 超类和子类之间的表示值依赖
- 超类和子类之间不经意的破坏了相互的表示不变量

### 重载和动态分派(dynamic dispatch)

在TS中, 所有的类都自动继承自Object超类, 会包含如toString()的方法. 通常我们需要将这类方法进行重载来方便使用. 因此toString这样的方法会有多种实际的部署. 而TS会自动的决定哪一种部署被调用, 这个过程就是分派(dispatching), TS的规则是动态分派——使用对象的动态类型中的部署.

比如在下面这个例子:

```ts
class FastMyString {
    ...
    public toString(): string {
      let s = "";
      for (let i = 0; i < this.length(); ++i) {
          s += this.charAt(i);
      }
      return s;
    }
}

const fms: FastMyString = new FastMyString("hello");
fms.toString() → "hello"

const obj: Object = new FastMyString("hello");
obj.toString() → "hello" // not [object Object] from superclass's method
```

## 泛型

泛型即在规范中使用占位符来指代一种数据类型并在后续再具体补充. 比如集合类型`Set<T>`. 在设计接口时, 可以不需要特定的指代string/Integer等:

```ts
/**
 * A mutable set.
 * @param <T> type of elements in the set
 */
interface MySet<T> {

    // example observer operations

    /**
     * Get size of the set.
     * @returns the number of elements in this set
     */
     size(): number;

    /**
     * Test for membership.
     * @param e an element
     * @returns true iff this set contains e
     */
    has(e: T): boolean;

    // example mutator operations

    /**
     * Modifies this set by adding e to the set.
     * @param e element to add
     */
    add(e: T): void;

    /**
     * Modifies this set by removing e, if found.
     * If e is not found in the set, has no effect.
     * @param e element to remove
     */
    delete(e: T): void;

}
```

在描述规范时, 不应该提到任何实际的部署(及内部的私有成员). 这些规范应当能被套用到所有有效的部署中. 实例方法中不需要带有<>, 因为它们使用与接口和类定义的泛型.

```ts
// example creator operation
/**
 * Make an empty set.
 * @param <U> type of elements in the set
 * @returns a new set instance, initially empty
 */
 function makeMySet<U>(): MySet<U> { ... }

 const strings: MySet<string> = makeMySet();
 ```

对应的工厂函数如上, 实际调用时TS可以推断出函数所需的泛型类型.

### 部署泛型接口

实际部署时, 可以使用泛型或者替代为某一具体类型, 如`class DigitSet implements MySet<number>`, 此时需要替换所有接口中的T. 又如`class HashSet<T> implements MySet<T>`.

## 枚举

ADT为小的有限集, 如月份、星期、方向等, 此时可以定义为枚举类型.

```ts
enum Month { JANUARY, FEBRUARY, MARCH, ..., DECEMBER };
const thisMonth = Month.MARCH;
const firstMonth: Month = Day.MONDAY; // static error: MONDAY has type Day, not type Month 
```

可以像原始的number一样使用枚举类型, TS支持枚举类型的相等比较和switch操作. 默认会使用数字作为枚举的表示值, 如上述的JANUARY实际为0. 而定义为字符串则显示的指定:

```ts
enum Direction {
  NORTH = "north",
  SOUTH = "south",
  EAST = "east",
  WEST = "west"
}
```

在完成定义后, 用户无法修改枚举内部成员.

## 获取和设置方法

之前我们使用observer如length()来提供ADT的属性. 如果想用一个实例变量来表示(如Array.length), 一种方法是直接在接口中定义观察者属性:

```ts
interface MyString {
    /**
     * the number of characters in this string
     */
    readonly length: number;

    // ...
}
```

这*看起来*会牺牲表示独立、限制表示值(因为包含了public的成员), 但实际使用getter方法可以回避这个问题. 通过继承类中函数标记get或者采用公共成员, 都可以实现这一效果.

```ts
class FastMyString implements MyString {

    public get length(): number {
        return this.end - this.start;
    }

    // ... 
}

class SimpleMyString implements MyString {

    public readonly length;

    // ...
}
```

而在设置setter后, 这一变量可以被后续修改.

## 在非面向对象中的ADTs

由于这类编程中没有类、方法之类的概念, 可以使用一组全局可访问的函数来运算某一类不透明的数据类型(即ADT). 如:

```c
FILE* f = fopen("out.txt", "w"); // open a file for writing
fputs("hello", f); // write to the file
fclose(f);  // close the file
```

ADT为FILE, 而fopen、fputs、fclose都为实际的运算操作. 尽管如此, 用户仍然无法看到FILE的内部表示值, 只能通过暴露的运算来操作, 因此保留了表示独立性.

## 总结

接口帮助实现仅定义运算的ADT:
- SFB. 接口可以保证用户只能使用被接口定义好的方法, 同时允许一个ADT的多种不同部署.
- ETU. 由于不含表示值, 因此维护和使用都更容易理解.
- RFC. 通过类来增加新的部署, 配合工厂函数可以避免构造器让用户无需更改代码.

枚举可以:
- SFB. 静态检查确保能够使用的集合范围.
- ETU. 可以用更好的名字来解释, 而不是实际的表示值(number或string)
- RFC. 直接搜索枚举的名字可以方便找到具体的集合并修改.