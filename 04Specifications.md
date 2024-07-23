# 规范

规范就像合同, 部署函数的人需要负责达到预期, 客户则要规范使用

## 行为等效

```typescript
function find(arr: Array<number>, val: number): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
}
```

```typescript
function find(arr: Array<number>, val: number): number {
    for (let i = 0, j = arr.length-1; i <= j; i++, j--) {
        if (arr[i] === val) return i;
        if (arr[j] === val) return j;
    }
    return -1;
}
```

假设对函数进行如上的改进, 想要不影响先前的“客户”, 实际上就需要规范来使得两个函数行为等效. 否则可能会返回不一样的index. 

```typescript
find(arr: Array<number>, val: number): number
requires:
val occurs exactly once in arr
effects:
returns index i such that arr[i] = val
```

## 为何需要规范?

- 不同程序员对同一个函数的规范可能有不同的理解
- 规范能使在编写程序时略过复杂的输入检查
- 规范能够在不阅读代码的前提下使用函数, 如同防火墙, 编写者可以随意地调整具体的实现细节‘

## 规范的结构

规范具体包括:
- 函数的签名
- requires语句, 描述输入参数的额外限制
- effects语句, 描述函数返回的结果和预期

实际上可以具体合并为 先决的条件 与 处理后的情况. 需要注意, 函数只有当输入满足先决条件时, 才需要返回合适的处理后情况, 否则函数可以随便输出.

## TypeScript中的规范

除去TS可以静态检查的量(如输入参数类型和返回值类型), 其它规范需要以文档方式记载, 通常记录在函数的前面.

一些例子和改进:
```typescript
/**
 * Find a value in an array.
 * @param arr array to search, requires that val occurs exactly once
 *            in arr
 * @param val value to search for
 * @returns index i such that arr[i] = val
 */
function find(arr: Array<number>, val: number): number
```

反例和改进:
```typescript
/* -《 细节: 错误的标记!
 * Check if a word is a palindrome.
 * A palindrome is a sequence of characters
 * that reads the same forwards and backwards.
 * @param string word
 * @requires word contains only alphanumeric characters
 * @effects returns true if and only if word is a palindrome
 * @returns boolean
 */

/**
 * Check if a word is a palindrome.
 * A palindrome is a sequence of characters
 * that reads the same forwards and backwards.
 * @param word word to check, must contain only alphanumeric characters
 * @returns true if and only if word is a palindrome
 */
```

实际上@param需要充当描述变量和额外限制的作用, @returns同理.

## 避免null值

Null和None值通常在语言中充当变量或者返回的默认值. 但是带有这些值的变量并不是合法的, 比如值为null的字符串无法调用对应的length函数.(这与值为""的字符串不同). 实际上, null的值可能会导致指代不明的问题, 并且导致无法fail fast. 比如Map.get(key)在Java中会返回null, 此时可能是Map本身不存在, 也可能是key不存在.

因此, 好的程序应当尽量避免使用Null和None. 在函数中, 这两者充当参数和返回值应当被避免, 除非显式的在规范中注明. 在TS中, 可以使用[严格的null检查](https://www.typescriptlang.org/tsconfig/#strictNullChecks)来避免变量值为null或者数据结构内部带有null.

### 包括空缺值

既然null值不能被使用, 作为代替的情况就是空缺值, 比如python中的 "", [], {}. 这些值默认可以作为函数的输入和输出, 除非在规范中特别注明.

## 测试和规范

无论在黑盒还是白盒测试中, 都应该**遵循规范**来设计测试, 保证输入和输出的值测试与规范一致.

### 测试单元

在02谈到单元测试时, 一个单元测试应当负责一个函数, 且其它函数的单元测试失败时, 也不会影响到这个函数的单元测试.

集成测试则测试多个函数. 但是集成测试无法代替系统地单元测试. 比如有时更底层的函数可能有更广的规范, 而集成测试只在上层函数的规范基础上进行测试, 就可能会藏下一些bug.

## 对于非纯函数的规范

某些函数不仅仅返回值, 还会修改输入参数(引用变量)或者全局变量, 这种行为叫做**副作用**(side-effects), 函数叫做**非纯函数**(mutating functions, 变异). 

>
> addAll(array1: Array<string>, array2: Array<string>): boolean
> requires: array1 and array2 are not the same object
> effects: modifies array1 by adding the elements of array2 to the end of it, and returns true if and only if array1 changed as a result of call
>

可以看到, effect中清晰的写出了array1会被修改. 

与null的规范类似, 非纯函数需要特别注明具体的副作用是什么, 如果不提到就默认作为纯函数.

TS中通常在@param中描述副作用的效果.

## 异常

### 对于signaling bugs

这类异常通常包括:
- IndexError
- KeyError
- TypeError

无需在规范中申明这类异常, 因为它们已经被包括在了规范中.

### 预估失败的异常

这类异常通常在设计函数时会预估到发生, 比如开平方的输入值并非完美的平方数. 此时需要在规范中的`@throws`中记录异常.

```ts
/**
 * Compute the integer square root.
 * @param x integer value to take square root of
 * @returns square root of x
 * @throws NotPerfectSquareError if x is not a perfect square
 */
function integerSquareRoot(x: number): number
```

当记录下这种异常时, `@param`中就不需要强调`x`需要是完美平方数了.

用异常配合 try catch 指令, 可以达到在catch中**预处理错误**或者及时反馈错误信息, 但**不会中断**程序的执行.

### 特殊结果

尽管在程序中设置异常的抛出可以避免一些意外情况, 但是这要求客户在使用时必须注意try catch, 否则可能会直接中断程序的执行. TS中并没有针对异常抛出的静态检查, 可能会让人忽略try catch的使用.

因此在TS中的一个代替方案是利用联合类型(union type)做函数的输出.

```ts
/**
 * Compute the integer square root.
 * @param x integer value to take square root of
 * @returns square root of x if x is a perfect square, undefined otherwise
 */
function integerSquareRoot(x: number): number|undefined
```

undefined和null很像, 但是未定义 更多带有“这里没有值”, 而非null的“这个值是没有值的”. ts中就算开启了严格null检查, 返回带有未定义的联合类型也是合法的. 

```ts
let twice = integerSquareRoot(input) * 2; // static error
if (integerSquareRoot(input) > 4) { ... } // static error
```

但是此时这些代码会发生静态报错, 因为返回值可能是undefined, 无法直接运算. 需要!或者unwrap.(类似swift的?可选类型)

在TS中, Map返回的值就可能是undefined或实际对应值; 打开noUncheckedIndexedAccess时, 会允许数组越界, 因此数组返回的值也会变成undefined或实际对应值的联合类型.