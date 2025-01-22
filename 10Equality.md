# 相等

## 引入

先前我们所定义的数据抽象实际由抽象函数定义. 因此抽象函数也将用于定义相等. 本课的第一部分先定义不可修改类型的相等.

## 等价关系(Equivalence relation)

对于类型 $T$ 而言, 相等运算符可以认为是[二元关系](https://zh.wikipedia.org/wiki/二元关系) $E \subseteq T \times T$, 其中值对$(x,y)\in E$, 当且仅当 $x$ 和 $y$ 相等.

即集合 E 由符合`x===y`的值对构成, 其包含如下性质:

- 自反性: t`===`t for all $t \in T$
- 对称性: t`===`u => u`===`t
- 传递性: t`===`u 且 u`===`v => t`===`v

## 不可修改类型的相等

我们使用两种方法定义不可修改类型的相等.

**抽象函数**. AF 将数据实例映射为抽象值, 因此对于两个数据实例 a 和 b, 当且仅当 AF(a) = AF(b)时两者相等.

**观察**. 对于两个对象, 当使用任意观察运算(observer)都产生相同的结果时, 可以证明两者不可区分.对于抽象数据类型, 观察意味着调用任意的运算操作.
_使用 观察 时, 需要具体分析观察能否提供足够的信息供用户进行区分, 单纯的结果相同没有意义, 比如两个集合的大小_

## 引用相等 vs 值相等

许多编程语言有两种不同的运算来测试相等:

- 引用相等. 两个指针是否指向内存的同一空间.
- 值相等. 两个对象的值相同, 也即本课到这为止所探讨的内容.

| Language              | Reference Equality | Value Equality |
| --------------------- | ------------------ | -------------- |
| Python                | `is`               | `==`           |
| Java                  | `==`               | `equals()`     |
| Objective C           | `==`               | `isEqual:`     |
| C#                    | `==`               | `Equals()`     |
| TypeScript/JavaScript | `===`              | _missing_      |

尽管在 TS 和 JS 中`==`也存在, 但是其会自动进行类型转换而`===`是严格相等运算, 不容易引发 bug.

但是这些相等都是针对`object`类型而言. 对于内在的原始类型, 如`string`和`number`, 应用`===`时实际采用的是值相等判断.

对于不可修改的 object 类型, `===`可能导致相等运算不正确. 因此在设计新的 ADT 时, 可能需要设计**值相等**的运算, 如函数 `equalValue()`.

```ts
/** Some immutable type T. */
class T {
    ...

    /**
     * @param that  value to compare `this` with
     * @returns true iff this and that represent the same abstract value.
     *    Must be an equivalence relation (reflexive, symmetric, and transitive).
     */
    public equalValue(that: T): boolean;
}

// 实际需要自行设计equalValue
class Duration {
    ...
    public equalValue(that: Duration): boolean {
        return this.length === that.length;
    }
}
```

### 打破相等关系

`equalValue()`需要保持上述提到的三个相等性质. 以下是一个反例:

```ts
private static readonly CLOCK_SKEW: number = 5; // seconds

// returns true iff this and that represent the same abstract value within a clock-skew tolerance
public equalValue(that: Duration): boolean {
    return Math.abs(this.length - that.length) <= Duration.CLOCK_SKEW;
}
```

这个反例破坏了传递性, 比如`57s===60s, 60s===63s`, 但`57!=63`.

## 可修改类型的相等

对于可修改类型而言, 相等仍然是一种等价关系. 由可修改的性质, 有一下两种基于观察的相等定义:

- **观察相等**意味着在观察时刻的现在两个引用是无法区分的. 通过调用所有的运算方法(不影响类型的值)来进行对比.
- **行为相等**意味着两个引用在*现在*和*将来*都是无法区分的(甚至在仅仅对其中一个引用调用运算的前提下).

对于不可修改类型, 两种相等是等价的, 使用`===`进行判断; 可修改类型可以使用 `===` 提供行为相等并使用 `equalValue()` 来判断观察相等.

```ts
/**
 * Some mutable type T.
 * Use === to compare elements of type T for behavioral equality.
 */
class T {
    ...

    /**
     * @param that  value to compare `this` with
     * @returns true iff this and that are observationally equivalent.
     *    Must be an equivalence relation (reflexive, symmetric, and transitive).
     */
    public equalValue(that: T): boolean;

}
```

## 集合中的“深相等”

在 ts/js 中, 内在的集合类型无法比较观察相等, 只能通过`===`比较行为相等(`strictEqual()`). 实际可以通过一些库中的“深相等”操作来实现观察相等:

- `assert.deepStrictEqual()`
- Underscore.js 中的 `isEqual()`

“深”意味着它们可以展开多级集合. **但是它们都需要小心地使用.** 比如`assert.deepStrictEqual()`会忽略 Map 和 Set 中的顺序, 但是对于其他对象, 它只会简单地比较所有的**表示值**, 不会理解 AF.

因此, 当对比的数据类型是原始类型, 如 `number` 等, 可以安全的使用深相等. 而其它用户定义的 ADT, 如 `Durantion` 和 `Bag`时, 可能会导致预料之外的结果.

## 哈希函数

这里主要探究为何哈希和相等需要保持一致性.

ts 的 Map 和 Set 类型都通过哈希表实现快速查找元素. 哈希表需要每一个集合或字典元素提供哈希函数操作, 将 object 值转换为整型. 由于 ts 不提供自定义的 hash 函数, 所以这里以 python 为例.

```python
def __hash__(self):
    '''
    Called by built-in function hash() and for operations on members of hashed
    collections including set, frozenset, and dict. __hash__() should return an
    integer. The only required property is that objects which compare equal
    have the same hash value.
    '''
```

哈希表为映射的表示, 实际是一种将键映射为值的 ADT. 其原理为: 包括一个合适大小的数组, 用键和值代表插入, 计算键的哈希码并转换为数组的索引, 将值插入到对应的索引处.

尽管哈希码被设计成尽量接近平均分布, 当发生冲突时, 会使用哈希桶来存储这些哈希码相同的值.

在 py 中, 可修改对象无法使用 hash 因为哈希需要键的值为不可修改的. 对于 hash, 一般每次计算对象中每个部分的哈希码然后将结果组合起来. 由于 Python 和 Java 这类语言中所有的对象支持相等比较, 所以默认将哈希和相等保持一致性.

### TS 和 JS 的哈希

TS 和 JS 的哈希函数是 built-in 的, 无法被重写, 且已经设计好与 `===` 保持一致性. 因此使用*行为相等*的类型可以安全的用在 Set 的元素和 Map 的 keys 中, 如内建类型 number、string 等 或**可修改**的对象类型(使用引用相等). 但是不能将不可修改的对象用于 Set 或者 Map 的 keys, 因为无法计算其哈希码 (无法判断相等).

一种解决方法是使用 Interning, 即对于所有相等的不修改对象, 内存中只存在一个地址引用. 此时观察相等与引用相等一致, 对象可以正确的被哈希函数映射.

## 总结

- 相等保持三个等价关系
- 在不可修改类型中, AF 是相等的基础
- 可修改类型包括行为相等(持续的相等)和观察相等(相同 AF)

TS 中, 对于不可修改的内建类型:

- `===` 判断相等, 不使用 `==`
- 注意 Set 的元素和 Map 的 keys 的合理使用

对于不可修改类型:

- 使用 equalValue() 判断相等
- 避免使用 `===` 因为过于严格
- 对于 Set 和 Map 不安全

对于可修改类型:

- 使用 `=== `判断行为相等
- 使用 `equalValue()` 判断观察相等
- 避免使用 ==
- 对于 Set 和 Map 安全
