# 设计规范

在本课中, 我们将比较类似行为下的不同的规范, 探究它们的区别.
- 其决定性如何. 规范定义一个可能的输出还是一个输出的集合?
- 其陈述性如何. 规范是否明确输出是什么或者是如何计算的?
- 其鲁棒性如何. 规范是否允许一个大的集合作为输入?

## 决定(Deterministic)和欠决定(underdetermined)的规范

对于数组的find函数, 我们可以定义查找第一个出现的索引或者查找最后一个出现的索引. 在设计规范时, 只要把第一还是最后这一特点声明, 那么规范就是**决定的**.

相反, 如果find函数随机的返回某一个出现位置的索引, 则规范是**欠决定的**. 但注意欠决定和非决定的(nondeterministic)区别. 后者的输出是完全随机的, 每次同一个输入都可能返回完全不同的结果(结果不仅仅有函数的代码决定).

## 陈述的(Declarative)和运作的(operational)规范

陈述的规范只给出输入和输出的结果, 运作的规范通常类似伪代码, 描述函数具体的操作流程.

陈述的规范通常更好, 因为简洁地给用户提供了用法. 当需要给其它维护者描述函数细节时, **不应该**写在规范里而应该用注释写在函数内部.

## 严格和宽松(stronger and weaker)规范

强和弱两个词来自断言的逻辑. 当满足P的集合是Q的真子集时, 断言P强于断言Q. 因此需要注意stronger其实意味着更加严格, 而非更鲁棒! 

对于规范而言, 更强则意味着让输入或输出的条件更加严格. 将两个规范进行比较时, 当且仅当如下条件满足, 可以认为S2比S1更严格或同等严格:
- S2的输入条件**弱于**或等于S1的
- S2的输出范围强于或等于S1的, 对于原本S1的“输入-输出”pair而言

此时, 可以安全的将S2替换原本的S1规范, 并且不会影响已经部署的用户. 但是并非所有的规范都可以直接比较, 也可能出现部分重叠, 此时没有比较的意义.

## 规范示意图

类似集合的图像表示, 更严格的规范是子集, 规范内部的点为每一个函数.

这里会有一个比较有意思的现象. 当规范更严格时, 会变成图中的子集, 但是实际上接受的输入范围更广. 

## 可变性 (Mutability)

变量的可变性具体回顾第一课的内容.

### 可变带来的风险

相比可变的变量, 只读变量的优势是更不容易出bug, 易懂且方便后续修改.

#### Example 1

```ts
/**
 * @returns the sum of the absolute values of the numbers in the array
 */
function sumAbsolute(arr: Array<number>): number {
    // let's reuse sum(), because DRY, so first we take absolute values
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = Math.abs(arr[i]);
    }
    return sum(arr);
}
```

对于上述例子, 直接传递可变变量可能会导致潜在的bug风险.

#### Example 2

```ts
let groundhogAnswer:Date|undefined = undefined;

/**
 * @returns the first day of spring this year
 */
function startOfSpring():Date {
    if (groundhogAnswer === undefined) {
        groundhogAnswer = askGroundhog();
    }
    return groundhogAnswer;
}
```

这个例子中将可变变量作为return的内容. 这将导致用户在修改return的内容时, 会直接更改`groundhogAnswer`本身, 留下潜在的bug隐患.

但是如果采用常量值的Date, 就可以保证安全. 另一种安全的返回方法是**防御性复制**(Defensive copying), 即返回一个新建的Date值. 但是这类方法会浪费较多的空间, 因此常量值更优先.

#### Exapmle 3

下面是一个改进后, 根据名称查找id的代码
```ts
const cache: Map<string, Array<number>> = new Map();

function getMitId(username: string): Array<number> {        
    // see if it's in the cache already
    if (cache.has(username)) {
        return cache.get(username);
    }

    // ... look up username in MIT's database ...

    // store it in the cache for future lookups
    cache.set(username, id);
    return id;
}
```

当id数组被缓存进cache时, 外部用户对返回值的修改将直接影响缓存. (与Exp 2类似)

如果使用spec来约束用户行为, 是否就可以避免bug呢?

> effects: returns an array containing the 9-digit MIT identifier of username, or throws NoSuchUser­Error if nobody with username is in MIT’s database. **Caller may never modify the returned array.**
> 
> effects: returns **a new array** containing the 9-digit MIT identifier of username, or throws NoSuchUserError if nobody with username is in MIT’s database.

这里两个例子都不合适, effects1极大的限制了整个程序的设计; effects2中new array的描述会限制部署程序的写法. 因此spec来约束行为不是一个合适的思路.

正确的方法是直接使用不可修改的值进行返回, 比如string.

> function getMitId(username: string): **string**
> requires: nothing
> effects: returns a length-9 string containing the 9-digit MIT identifier of username, or throws NoSuchUser­Error if nobody with username is in MIT’s database.
>

### 别名(aliasing)

别名是导致可修改变量变得有风险的原因. 当两个变量名称同时指向一个内存变量时, 就产生了别名.

上述例子中的Date和Array都存在别名.

### TS中的只读集合

对于Array, Set, Map, TS中都有对应的只读接口,  ReadonlyArray, ReadonlySet, and ReadonlyMap.

注意这些只读类型为接口, 所以要先用可变量对其赋值. 要小心这些可变量被修改.

```ts
let yourArray: Array<number> = [ 1, 2, 3 ];
const myArray: ReadonlyArray<number> = yourArray;
```

此时`yourArray = []`将会修改yourArray的引用为空数组, 不影响myArray. 但是对yourArray执行`push/[0]=2`的操作, myArray也会被改变, 需要特别注意.

在TS中, 真正的不可修改量为number, boolean, string, bigint.

## 设计好的规范

### 条理清晰的规范

> function sumFind(a: Array<number>, b: Array<number>, val: number): number
> effects: returns the sum of all indices in arrays a and b at which val appears

这并非一个好的函数, 因为它揉杂了两个功能, 即在数组中查找index和sum.

### 规范必须注意可变性

函数签名中尽量使用string和number等不可变量; 非纯函数需要在规范中注明修改的值; 使用可变值的只读副本.

### 规范必须严格

> function addAll(arr1: Array<T>, arr2: Array<T>): void
> effects: appends the elements from arr2 to arr1 in order, unless it encounters a null element in arr2, at which point it throws a TypeError
>

这个例子揉杂了effects. 更重要的是它会导致在遇到null之前arr1被修改了. 具体修正如下:

> function addAll(arr1: Array<T>, arr2: Array<T>): void
> effects: appends the elements from arr2 to arr1 in order. If arr2 contains null elements, it throws a TypeError and no elements are appended to arr1.
>

### 规范也需要宽松

比如opens a file named filename. 这句表述严格的指出了func必定打开一个文件, 但是实际上由于各种问题(比如权限不足)会打不开, 所以应当采取更宽松的规范. 比如attempt to open.

## 先决条件还是处理后的情况

- 先决条件最广泛的使用情况是 该条件对于函数来说检查过于复杂和昂贵
- 用户通常不喜欢先决条件, 因为需要频繁的检查
- 更好的处理方法是fail fast, 如果无法实现再考虑先决条件(比如二分查找需要输入数组有序, 此时通过代码先检查有序没有意义)
- 总而言之, 先决条件的使用按情况而定.
  - 内部的函数可以通过仔细的检查输入来免去先决条件的规范
  - 暴露到外部, 被频繁使用的函数也最好不使用, 换而采用抛出例外

