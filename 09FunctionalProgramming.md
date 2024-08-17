# 函数式编程

## 头等函数

头等函数, 即函数作为第一公民, 可以像一个变量一样被传递和存储. 比如Math.sqrt是对sqrt函数对象的引用, 该变量类型为`(x: number) => number`.

也可以用一个新的变量来赋值:

```ts
const mySquareRoot: (x: number) => number = Math.sqrt;
mySquareRoot(16.0); // returns 4.0
```

定义在mySquareRoot上的是**函数类型表达式**. 同样的, 可以将函数的引用作为输入参数传入到另一个函数中. 这也是头等函数本身的定义, 即与其它变量类型一致.

### TS中的函数表达式

在之前的课已经用过了函数表达式:
```ts
it("covers a < b", function() {
    assert.strictEqual(Math.max(1, 2), 2);
  });
```

可以将function替换为箭头符号, 在函数内容只有一行时可以忽略大括号(类似lambda):
```ts
it("covers a < b", () => {
    assert.strictEqual(Math.max(1, 2), 2);
  });

it("covers a < b", () => assert.strictEqual(Math.max(1, 2), 2) );
```

function和箭头符号的区别是
- function定义的函数在类的方法上, 可能会重新定义this, 因此丢失原有类的变量
- 箭头符号直接从周围的内容获取this, 因此应被用在实例方法中

## 抽象控制

这里介绍map/filter/reduce的设计模式, 用于简化函数的部署. 比如处理文本文件时, 可以用于减少for和if的使用.

下面这个两个函数使用常规循环写法, 读出某地址下所有的文件到Array, 只提取带有特定后缀的文件

```ts
import fs from 'fs';
import path from 'path';

/**
 * Find names of all files in the filesystem subtree rooted at folder.
 * @param folder root of subtree, requires fs.lstatSync(folder).isDirectory() === true
 * @returns array of names of all ordinary files (not folders) that have folder as
 *          their ancestor
 */
function allFilesIn(folder: string): Array<string> {
    let files: Array<string> = [];
    for (const child of fs.readdirSync(folder)) {
        const fullNameOfChild = path.join(folder, child);
        if (fs.lstatSync(fullNameOfChild).isDirectory()) {
            files = files.concat(allFilesIn(fullNameOfChild));
        } else if (fs.lstatSync(fullNameOfChild).isFile()) {
            files.push(fullNameOfChild);
        }
    }
    return files;
}

/**
 * Filter an array of files to those that end with suffix.
 * @param filenames array of filenames
 * @param suffix string to test
 * @returns a new array consisting of only those files whose names end with suffix
 */
function onlyFilesWithSuffix(filenames: Array<string>, suffix: string): Array<string> {
    const result: Array<string> = [];
    for (const f of filenames) {
        if (f.endsWith(suffix)) {
            result.push(f);
        }
    }
    return result;
}
```

## 迭代器

迭代器是一个步进一序列元素并逐个返回元素的*对象*. 比如用for...of循环步进某个数组.

一个`Iterator<E>`在带有类型E的集合中通常包含方法:
- next() 返回对象`{done: boolean, value?: E}`
  - value为下一个元素, 当done为false
  - done为true表示没有更多元素了

即一个for of循环实际在TS中的部署如下:
```ts
let filenames: Array<string> = ...;
let iter: Iterator<string> = filenames.iterator();
for (let result = iter.next(); ! result.done; result = iter.next()) {
    const f: string = result.value;
    console.log(f);
}
```

next()实际是一个mutator, 修改下一次返回值. 迭代器的存在允许只用单一一个形式就能对接不同的数据结构, 即for...of, 否则只能采取下列的for循环`for (let i = 0; i < filenames.length; i++)`. 显然有的数据结构甚至不包含length属性, 迭代器为访问数据提供了方便.

### 可迭代 vs 迭代器

可迭代代表一个元素序列可以被迭代. TS中使用`Iterator<E>`接口, 需要实现iterator方法为序列返回Iterator对象. Python中类似, 需要实现`__iter__`.

迭代器不代表一整个元素序列, 而是在一个序列迭代中的某一具体点(可以理解为序列的剩余量指标). 迭代器是mutator, next会移动到下一个元素且先前元素不可再被迭代器访问. 因此迭代器是一个**一次性的对象**.

故在存储序列变量、返回、传递时, 应该使用可迭代iterable. 当只需要遍历序列, 就考虑使用iterable.


### MyIterator

一个简单的迭代器🌰, 可修改对象, next函数返回有效对象或undefined.

```ts
/**
 * A MyIterator is a mutable object that iterates over
 * the elements of a Array<string>, from first to last.
 * This is just an example to show how an iterator works.
 * In practice, you should use the Array's own iterator
 * object, returned by its iterator() method.
 */
class MyIterator {

    private readonly array: Array<string>;
    private index: number;
    // AF(array, index) = the sequence of elements array[index]...array[array.length-1]
    // RI: index is a nonnegative integer

    /**
     * Make an iterator.
     * @param array array to iterate over
     */
    public constructor(array: Array<string>) {
        this.array = array;
        this.index = 0;
    }

    /**
     * Get the next element of the array.
     * Modifies: this iterator to advance it to the element 
     *           following the returned element.
     * @returns the next element in the array, 
     *          or undefined if there are no more elements
     */
    public next(): string|undefined {
        if (this.index >= this.array.length) {
            return undefined;
        } else {
            const value = this.array[this.index];
            ++this.index;
            return value;
        }
    }
}
```

### 可修改性导致的迭代器bug

```ts
/**
 * Remove filenames with a given extension.
 * Modifies the filenames array by removing filenames that end with the extension.
 * 
 * @param filenames array of filenames
 * @param extension must start with ".", e.g. ".txt"
 */
function removeFilesWithExtension(filenames: Array<string>, extension: string): void {
    let iter: MyIterator = new MyIterator(filenames);
    for (let filename = iter.next(); filename !== undefined; filename = iter.next()) {
        if (filename.endsWith(extension)) {
            // remove the filename from the array
            filenames.splice(filenames.indexOf(filename), 1);
        }
    }
}
```

该例子中, 函数中的循环直接对数组进行修改, 而迭代器的array为该数组的别名, 因此删除后会引起index的指向改变, 引起bug.

### 可修改性会导致简单的协议(contracts)复杂化

因为在使用Array等类型时都是全局可修改的, 很容易产生别名, 进而埋下潜在的bug. 如果在规范中加以限制, 实际很难找到合适的地方记录(Array? Iterator?). 故基本靠用户和设计者之间的良好习惯来避免bug发生.

基于上述情况, 就需要map/filter/reduce一类的纯函数来修改这类变量, 依靠返回而不是直接在上面进行修改.

## map/filter/reduce抽象

三者可以简化代码, 不再需要for/if/临时变量等内容.

### Map

Map对每个元素应用一元函数并返回一个包含结果的新序列.

```
map : Array<‍E> × (E → F) → Array<‍F>
```

比如
```ts
const array: Array<number> = [1, 4, 9, 16];
const result = array.map(Math.sqrt);

// 简化版
[1, 4, 9, 16].map(Math.sqrt);
```

其中
- E: number 
- F: number

其他的函数形式(需要匿名函数):
`["A", "b", "C"].map(s => s.toLocaleLowerCase())`

有时我们不需要获取修改后的新序列, 而只需要修改元素, 则可以套用**forEach**: `itemsToRemove.forEach(item => mySet.delete(item));`

### Filter

Filter使用一元函数(从元素类型到boolen)测试序列中的每一个元素并保留符合预期的元素.
```
filter : Array<‍E> × (E → boolean) → Array<‍E>
```

Examples:
```ts
[1, 2, 3, 4]
   .filter(x => x%2 === 1);
// returns [1, 3]

["x", "y", "2", "3", "a"]
   .filter(s => "abcdefghijklmnopqrstuvwxyz".includes(s)));
// returns ["x", "y", "a"]

const isNonempty = (s: string) => s.length > 0;
["abc", "", "d"]
   .filter(isNonempty);
// returns ["abc", "d"]
```

### Reduce(多对一)

Reduce使用一元函数混合各个元素, 其使用init作为第一个初始结果, 随后将该结果传入下一个函数中作为一个自变量, 序列的下一个元素作为第二个自变量, 函数计算的结果返回作为第二个结果. 一直重复直到所有元素参与计算.

`reduce : Array<‍E> × (E × E → E) × E → E`

`arr.reduce(f, init)`

> result0 = init
> result1 = f(result0, arr[0])
> result2 = f(result1, arr[1])
> ...
> resultn = f(resultn-1, arr[n-1])

resultn为长度为n序列的最终结果.

比如:
```ts
[1,2,3].reduce( (x,y) => x+y,  0)
// result0 = 0
// result1 = (0+1) = 1
// result2 = (1+2) = 3
// result3 = (3+3) = 6
```

#### 初始值

在TS中初始值可以省略, 此时默认序列第一个元素为初始值. 省略初始值在使用像max之类的reducer会很好用. 注意当序列为空时, 将抛出TypeError异常. 有非默认初始值时不会抛出typeError异常, 直接返回该init.

#### Reduction到其它类型

实际上Reduction的结果可以为其它类型, 此时有公式:

`reduce : Array<‍E> × (F × E → F) × F → F`

这里将init设置为F, 如:

```ts
[1,2,3].reduce( (s: string, n: number) => s + n, "" );
// returns "123"
```

这种情况下, 需要注明匿名函数中的输入变量的类型, 否则默认推断为同一类型.


#### 操作顺序

默认TS会从左到右遍历序列中的元素来执行reduce, 使用`reduceRight`可实现逆向遍历, 即

> result0 = init
> result1 = f(result0, arr[n-1])
> result2 = f(result1, arr[n-2])
> ...
> resultn = f(resultn-1, arr[0])

## 回到最初的例子

这里设计一个过滤文件后缀的抽象:
```ts
const endsWith = (suffix: string) => {
    return (filename: string) => filename.endsWith(suffix);
}
```

endsWith wrapper会返回可以用于filters的函数. 比如需要过滤.ts文件, 则会生成检测.ts的函数, 即`filenames.filter(endsWith(".ts"))`

注意endsWith与一般的函数不同, 称为**高阶函数**(higher-order function), 这类函数将其他函数作为输入参数或返回值. 本课中的map/filter/reduce都是高阶函数.

```ts
function allFilesIn(folder: string): Array<string> {
    const children: Array<string> = fs.readdirSync(folder)
                                    .map(f => path.join(folder, f));
    const descendants: Array<string> = children
                                       .filter(f => fs.lstatSync(f).isDirectory())
                                       .map(allFilesIn)
                                       .flat();
    return [
        ...descendants,
        ...children.filter(f => fs.lstatSync(f).isFile())
    ];
}
```

这个例子先用map将所有文件加上完整路径, 随后filter筛选所有文件夹, 对文件夹再递归allFilesIn, 结果全部flat成一维数组.

接着再筛选所有.ts后缀:

```ts
const filenames: Array<string> = allFilesIn(".")
                                 .filter(endsWith(".ts"));
```

对每一个文件, 按行分割返回`Array<string>`:

```ts
const fileContents: Array<Array<string>> = filenames.map(f => {
    try {
        const data = fs.readFileSync(f, { encoding: "utf8", flag: "r" });
        return data.split("\n");
    } catch (e) {
        console.error(e);
    }
});
```

随后利用正则表达式提取非空string:
```ts
const lines: Array<string> = fileContents.flat();
const words: Array<string> = lines.map(line => line.split(/\W+/)
                                               .filter(s => s.length > 0))
                             .flat();
```

这些代码都利用到了方法链, 即在map/filter返回的基础上再次调用map/filter.

## 抽象控制的好处

Map/filter/reduce使得代码更佳精简, 程序员可以更专注于其它核心计算.

### 在TS中避免循环

python中的列表推导式`doubleOdds = [ x*2 for x in arr if x % 2 == 1 ]`在ts中通过filter+map实现`const doubleOdds = arr.filter(x => x % 2 === 1).map(x => x*2)`

```py
arr = [ 4, 7, 5, 6, 7, 4 ]  # given a list
{ x for x in arr if x > 5 } # ... create a set of values greater than 5:
# => a set { 6, 7 }

input = { 'apple': 'red', 'banana': 'yellow' } # given a dictionary
{ value: key for key, value in input.items() } # ... create a dictionary with
                                               #     key-value pairs inverted
# => a dictionary { 'red': 'apple', 'yellow': 'banana' }
```

python中列表推导式也可对集合字典生效, 在ts中由于只能对array操作, 因此需要先转化为array:

```ts
const arr = [ 4, 7, 5, 6, 7, 4 ];
new Set(arr.filter(x => x > 5));
// => a Set { 6, 7 }

const input = new Map([ ['apple','red'], ['banana','yellow'] ]);
new Map([ ...input.entries() ].map(entry => entry.reverse()));
// => a Map { 'red' => 'apple', 'yellow' => 'banana' }
```

其中
- `input.entries()`产生key-value对的可迭代对象
- `...`将多个对象的arrays转化为单个array

总而言之, 每次在思考进行loop的书写时, 首先思考能否使用map/filter/reduce并搭配`Array.entries, .some, and .every`.