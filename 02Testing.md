# 测试(Testing)

测试属于验证(Validation)的一部分. 验证包括:
- 形式推理 Formal reasoning
- 代码检查 Code review
- 测试

## 软件测试的难点

- 完全测试(Exhaustive testing), 即对所有的情况进行测试不可能实现
- 随意测试(Haphazard testing)难以找到bug
- 随机或统计学测试(Random or statistical testing)在软件测试中行不通, 更适合物理系统.

因此, 在软件测试中更需要关注系统地进行测试(systematic testing), 其中测试用例(test cases)很重要.

## 测试先行(Test-first)的编程

- 模块(Module)是软件系统的一部分 - 模块是构成整个软件系统的组成部分
- Specification描述模块的行为, 可以理解为函数的输入和return的类型和限制
- implementation为模块的部署, clients则是使用模块的对象
- 测试用例为实际的测试输入内容, 测试套件(test suite)是测试用例的集合

测试先行编程指的是先定义spec和测试, 然后再进行实际的部署

## 通过分割选择测试样例

思路: 通过分割将输入的集合分割为几个子域, 每个子域之需要提供一个测试样例

> Example  
> abs()  
> 需要考虑大于等于0和小于0两个子域即可  
> Max(a,b)  
> 需要考虑a > b, a < b, a = b三个子域即可

总的来说 子域需要满足:
- 不相交
- 完整
- 非空

### 分割时还需要特别考虑边界条件

bug通常存在于边界中

> Example  
> abs()  
> 需要考虑大于0, 等于0和小于0两个子域即可

考虑 multiply : BigInt × BigInt → BigInt:
- a b 同号(又能分为同正, 同负)
- a b 异号
- a b 某个为0
- a b 某个为1

此时, 如果考虑具体a和b组合, 有36种情况, 这将为设置测试样例的复杂性大大增加

因此我们需要**转换思路**,  先分开来分析. 对于a来说, 其实只要设计以下 6 种情况即可, b亦相同. 也就是说, 只要设计 6 个 (a,b) 元组, 即可单独满足a或b的测试样例的需求.

```
//   partition on a:
//   a = 0
//   a = 1
//   a is small integer > 1
//   a is small integer < 0
//   a is large positive integer
//   a is large negative integer
```

当然我们还需要考虑a和b的交互(interaction). 在这个问题中, a和b的符号是否相同, 以及有一个或者两个都为0, 可以分割出 5 种子域.

此时我们一共分割出了 6, 6, 5 种子域. 通过合适的选点, 可以只用 6 个 (a,b) 元组同时满足上述的子域.

### 自动单元测试 (Automated unit testing)

**单元测试**对一个模组进行测试, 而自动测试即能够自动完成单元测试并验证结果.

不同的编程语言都有自己的自动单元测试库. 

> JUnit for Java and unittest for Python. For JavaScript and TypeScript, a popular choice is Mocha.

这里介绍Mocha, 其包含单元测试函数 `it()`. 第一个输入参数为测试名称, 第二个输入为测试主体(即函数表达式).

```typescript
it("covers a < b", function() {
  assert.strictEqual(Math.max(1, 2), 2);
});
```

而`describe()`函数则一次可以包括多个`it()`, 同时进行多个单元测试

对于array的验证, 可以使用`assert.deepStrictEqual`.

#### 测试策略的记录

通常将partitions和subdomains记录在describe函数的后面.

### 黑盒和白盒测试

- 黑盒测试指仅仅考虑spec来设计测试样例
- 白盒测试需要进一步考虑实际的应用场景, 此时可能会产生新的边界条件和分区

例如排序算法在输入数组长度超过10时会选用快速排序, 此时长度10的数组则为新的边界条件

### 覆盖

可以根据测试套件的覆盖程度来判断其性能

- statement coverage 语句的覆盖程度
- 分支的覆盖程度
- 路径, 即分支的组合的覆盖程度

最基本的目标就是实现尽可能多的语句覆盖

code/ex02给出了typescript下使用 coverage tool的例子, 其能够显示各个语句被执行的次数

## 单元测试和集成测试

单元测试便于找到哪一个模块出现问题, 而集成测试同时对几个模块进行测试.

## 回归测试

在对代码进行修bug等一些变动时, 程序可能会发生**回归**, 即引入了新的bug. 因此需要利用回归测试来规避这个问题, 即每次变动后都运行所有的测试.

每次出现bug时, 需要将引发这个bug的输入作为测试样例加入到测试套件中.

## 迭代的测试先行编程

在前面介绍的基础上, 迭代spec和测试, 对两者进行补充.

对于复杂的spec和测试套件, 可以先从重要、简单的部分开始设计; 对于复杂的部署, 可以从暴力算法开始写并验证测试的正确性, 然后再进行升级.

从简单到复杂的部署其实是很有效的, 特别是当问题困难且解决思路未知时.