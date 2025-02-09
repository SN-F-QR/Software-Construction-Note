# (避免)Debug

## 第一道防线: 让 bug 无处遁形

- 一种避免 bug 的方法就是静态检查, 其在编译时捕捉 bugs. 另一种先前接触过的方法是动态检查. 比如 Python 检测数组越界时自动报错. 但有的语言, 如 JS 会返回 undefined, 减弱了动态检查的效力, C/C++问题更大, 它们允许越界后的错误内存写入, 直接导致 bugs 和缓冲区溢出.
- 不可修改性是另一种避免 bug 的设计, 包括不可修改类型 (e.g. `string`) 和不可再分配类型(常量, `const`). 但仍然需要数组等引用变量的问题, 尽管分配了`const`但依然可以被修改.

## 第二道防线: 让 bug 容易显形

让 bug 容易显形的思路是能够将其定位在程序代码中的一小部分.

```ts
/**
 * @param x  requires x >= 0
 * @returns approximation to square root of x
 */
function sqrt(x: number): number {
    if ( ! (x >= 0)) throw new Error("required x >= 0, but was: " + x);
    ...
}

```

这个例子使用了**防御性编程**, 对输入的先决条件进行判断, 并在不符合规范时返回有用信息给调用者.

### 断言 (Assertions)

断言可以用于防御性检查, 这种抽象方法在实际的断言失败时可以导致多种后果, 比如报错和记录错误事件等等. JS/TS 中没有内置的 assert, 通过 [Node 库](https://nodejs.org/api/assert.html) 实现. 断言失败时抛出`AssertionError`:

`assert(x >= 0);`

也可以增加额外的 message 参数, 在断言失败时返回:

`assert(x >= 0, "x is " + x);`

:warning: 有的语言(如 Java)会默认禁用断言, 即断言相关代码不会被执行. 这是出于性能考虑, 特别是对于一些算法而言(如排序), 因此可能要显示的允许断言执行.

#### 断言什么

- 方法的参数, 如刚刚的函数输入参数
- 方法的返回值要求, 比如`sqrt`可能需要检查返回值的精度`assert(Math.abs(r*r - x) < .0001);`
- 表示不变量, 如之前课中使用的 checkRep 方法

断言最好在写代码的过程中就有所意识然后写下来, 而不是在完成代码之后, 这样能最大程度避免忽略重要的断言.

#### 不要断言什么

- 无效信息, 比如`x = y + 1; assert(x === y+1);`
- 程序的外部条件, 比如文件是否存在于目录, 断言是用于判断程序内部错误的, 外部的信息应当使用 exceptions 来捕捉
- 避免成为程序执行的必要部分(小心副效应), 因为在程序 release 时通常需要关闭所有断言, 如`assert(list.pop());`会导致程序无法执行 pop

### 迭代式开发 (Incremental development)

每次只部署一小块新代码并测试, 因为新的 bugs 很可能就出在这一小块代码中, 本课程已介绍过几种方法来配合迭代式开发使用:

- 单元测试
- 回归测试
- 版本控制(git), 对比当前版本和先前正常运作的版本

### 模块和封装 (Modularity & encapsulation)

**模块化**意味着将程序分割为组件或模组, 每一个可以被整个系统的剩余部分设计、部署、测试、推理、复用. 模块化对应**单层系统**(monolithic), 即各个模块被整合到一起, 它只包含一个程序且非常长, 从而导致难以理解、定位 bugs.

**封装**意味着在模块上建立围墙, 让模块只负责自己内部的部分, 其他代码的 bugs 不会影响到该模块的执行. 一种封装的思路是访问控制, 即定义 public 和 private. 另外一种方法则是变量的范围. 变量的范围由变量在定义时的位置决定, 函数参数的范围在函数体, 局部变量在对应大括号内. 应当保证变量的范围尽可能的小, 便于推理.

比如当循环值定义在循环外部时, 其可能在循环开始前就被修改, 即下面这种情况:

```TS
let i: number;
...
for (i = 0; i < 100; ++i) {
    ...
    doSomeThings();
    ...
}
```

其他位置或线程的`doSomeThings();`可能修改了`i`.

对于 TS, 这些规则有助于限制变量范围:

- 将循环变量定义在循环初始化的时候, 即`for (let i = 0; i < 100; ++i) {`
- 使用`const`、`let`而不是`var`, 前两个定义局限在大括号之内, 而`var`范围扩展至整个函数
- 只在初次需要变量的时候才定义(即尽可能内层的位置), 而不是直接定义在函数开始的时候
- 避免全局变量. 对于需要在不同部分传递的参数, 最好直接进行传递而不是放在全局的位置; 当需要全局时, 可以考虑使用 ADT 来包括这一状态

## 复现 Bug

假设现在有函数:

```TS
/**
 * Find the most common word in a string.
 * @param text string containing zero or more words, where a word
 *     is a string of alphanumeric characters bounded by nonalphanumerics.
 * @returns a word that occurs maximally often in text, ignoring alphabetic case.
 */
function mostCommonWord(text: string): string {
    ...
}
```

当用户输入了 Shakespeare's plays, 得到的结果为`"e"`而不是`"the"` or `"a"`. Shakespeare's plays 超过了 100,000 行, 因此有必要减少输入量来测试程序并定位 bug:

- 是否该输入的前半段导致同样的 bug?
- 是否一个 play 导致 bug?
- 是否一个 soliloquy 导致 bug?

在修复了小测试样例的 bug 后, 再返回原本的输入来查看 bug 是否被修复. 同时在回归测试套件中, 如果小测试样例一开始能够复现同样的 bug, 则优先将小测试样例加入到回归测试套件中即可.

## 利用科学方法查找 bug

1. 研究数据的内容. 查看那些数据导致 bug 并测试这些不正确的数据
1. 假设. 提出假设, 根据完整的数据内容, 判断哪里可能有 bug, 哪里不可能有 bug
1. 实验. 通过观察、设计和运行代码来检验假设
1. 重复. 更新假设, 缩小 bug 可能的范围

当然通常来说, 应用了快速失败和 stack trace 等方法, 可以更快的找到 bug 而无需上述的步骤. 只有当 10 分钟都查不出 bug 时, 就可以考虑系统的来分析 bug 了, 这些步骤可以伴随着用笔记来整理思路. 记录如下内容:

- 假说. 哪里发生的?
- 实验. 如何测试假说?
- 预测. 基于假设, 期望的结果是什么?
- 观察. 实际的实验结果是什么?

下面我们将介绍每一个部分的具体细节.

### 1. 研究数据的内容

一个重要的数据是栈追踪 (stack trace). 在经典的栈追踪里, 最新的调用会在顶部, 而最先的调用在底部. 但顶部(可能为具体的库)或底部的栈(可能为框架)可能并不是你写的代码部分, 因此 bug 最可能位于栈的中间部分.

### 2. 假设

程序报错的位置不一定就是 bug 的位置. Bug 可能在此前就生成了错误的值进而导致报错. 假说有助于思考程序的 **数据流** 并排除不可能的部分.

```TS
/**
 * Find the most common word in a string.
 * ...
 */
function mostCommonWord(text: string): string {
    let words: Array<string> = splitIntoWords(text);
    let frequencies: Map<string,number> = countOccurrences(words);
    let winner: string = findMostFrequent(frequencies);
    return winner;
}
```

这个程序的数据流为:

`"cccb" -> (mostCommonWord) -> "b"; `
`mostCommonWord = splitIntoWords() -> countOccurrences() ->  findMostFrequent()`

当`countOccurrences()`报错时, 可以直接排除后续的所有未执行程序, 并提出如下几种假说:

- bug 在`countOccurrences()`, 输入有效但异常发生
- bug 在`splitIntoWords`和`countOccurrences()`之间, 前者的处理后结果不满足后者的先决条件
- bug 在`splitIntoWords`, 输入值有效但生成了坏的输出
- bug 在最开始的输入值, `"cccb"`不满足先决条件

哪个应该先尝试呢? 实际上 debug 就是查找的过程, 因此可以利用二分查找, 先从中间开始, 每次排除一半位置.

#### Delta debugging

Delta 调试是指通过观察和对比两个十分类似、关联的测试样例来判断 bug 位置的方法. 比如输入`ccb`和`cc, b`时, 一个通过了测试另一个失败了, 就可以思考两者的区别来确定哪些部分导致 bug. 另一种 Delta 调试是对比不同版本的代码, 比如老版本没有 bug, 对比区别来确定新版本代码的问题.

#### 假说优先级

思考不同的假说的优先级, 先验证最可能出错的部分, 比如你的代码而不是 ts 的库, 新写的代码而不是之前跑通过的代码.

### 3. 实验

假说应当导向一个预测, 例如“我认为变量 x 在这个时候结果不对”. 实验实则是对这些预测的验证, 最好的实验就是探针(probe).

#### 断言, 重返问

断言的好处是自动化的判断过程, 不需要人工的去监视输出, 甚至可以在 debug 完成之后留着代码里.

#### Print & Logging

- Print 的好处是对于所有的编程语言都有效, 但会显式的改变程序的输出, 所以需要在 Debug 后进行恢复. 并且在 Print 时需要记录足够多有用的信息.
- Logging 是另一种更加详细的 Print 方法, 其永久的在代码中保留 Print 的功能, 并通过全局设置如`boolean DEBUG`来控制记录与否. 比如 JS 中的`console.log(), console.info(), console.warn(), console.error()`. 一个更复杂的 Logging 框架, 如 winston 可以直接将 log 输出到文件或服务器. 对于大型的系统来说 Logging 是刚需.

与断言类似, print 时也要注意副效应:

```TS
function recursiveHelper(arr: Array<number>): number {
  // base case
  ...
  console.log("recursiveHelper returning:", recursiveHelper(arr)); // BAD BAD BAD
  return recursiveHelper(arr);
}

// Correct One 将输出的结果存储到常量中能够有效防止副效应
function recursiveHelper(arr: Array<number>): number {
  // base case
  ...
  const output = recursiveHelper(arr);
  console.log("recursiveHelper returning:", output);
  return output;
}
```

另外对于 TS/JS 而言, 默认对 Map 和 Set 进行 Print 输出时, 其自带的`ToString()`没有实际作用, 比如`console.log("map is " + map)`会输出“map is [object Map]”. 解决方法如下:

- 直接把 map 作为 log 的参数
  ```TS
  // 避免调用map的ToString(),
  console.log("map is", map);
  ```
- 使用`util.inspect()`把 object 转换为 string
  ```TS
  import util from 'util';
  console.log("map is " + util.inspect(map));
  ```

#### Debugger 调试工具

第三种方法是利用断点, 其在特定位置中断程序执行. 调试工具提供对程序的监视, 能够观察程序的中间执行状态, 其包含如下可执行状态:

- 步进 (Step in) 为执行暂停位置所处函数的下一步, 如果遇到子函数, 则进入子函数的下一步
- 步出 (Step out) 为完全执行暂停位置所处函数, 返回调用者处并暂停
- 步过 (Step over) 为执行暂停位置所处函数的下一步, 如果遇到子函数不会进入, 直接执行完子函数, 因此像是 in 和 out 的组合
- 继续执行 (Continue) 为执行到下一个断点处

尽管调试工具有时可以允许直接修改变量的值, 但实际操作时不建议使用.

#### 替换模块

当你假设某个模块存在 bugs, 同时又有一些其他实现的方法时, 可以替换成另一种实现来验证 bug 是否还存在, 比如:

- 假设二分查找存在问题, 那么改为线性查找
- JS runtime 有问题, 那么尝试其他浏览器或 Node 版本

但是替换模块实际比较浪费时间, 因此最好作为最后手段.

### 每次专注于一个 bug

在 debug 过程中发现新的 bug 是很常见的. 此时可以用文本把存在 bug 列出来, 但不要立马转入修复新的 bug 或者随意的修改代码, 因为 debug 的过程通常需要建立 mental stack, 跳转新的 bug 后又需要重新回顾原来的 stack. 修复 bug 时要注意 bug 的核心问题和原因, 而不是表面上仅仅针对某个情况进行修复(即避免 premature fix).

### 4. 重复

实验完成后观察实验结果与假说是否一致, 不一致则否决假说并测试下一个, 一直重复该过程.

#### 保持数据轨迹 (Audit trail)

如果一个 bug 需要多次验证假说或者超过了几分钟的工作量, 那么最好将其记录成文字, 以防止短期记忆容易失去对内容的追踪, 记录的内容包括:

- 正在探索的假说
- 正准备尝试的实验
- 实验的观察结果
  - 测试通过与否
  - 程序输出
  - 栈追踪

#### 检查插头 (Check the plug)

当多次查找后依然无法定位 bug, 此时可以考虑检查插头, 即质疑你的猜想. 就像日常生活中, 当打开电器开关而没有运作时, 也许我们应当检查插头是否插入而不是考虑电器本身的故障.

比如考虑是否当前代码版本不正确, 或者 double-check 测试样例是否正确.

#### 如果没修 bug, 那么大概率 bug 还存在

在复杂系统中, 有时 bug 会突然消失, 那么其实大概率 bug 还存在. 所以系统性的 debug 能够有效帮助确认 bug 真正被修复了, 也即为何我们需要首先复现 bug, 然后理解什么原因导致 bug, 最后再去修复它.

## 修复 Bug

- 查看相关 bugs. 思考是否会有相似的 bugs 发生, 尝试避免程序的其他位置再发生同样的 bug.
- 使用回归测试.
- Add, Commit, Push, and Reflect. 思考未来如何避免这类 bug, debug 后应当对系统有更深入的理解, 否则就只是肤浅的修复了一个特例而已.

### 其他 Tips

- Get a fresh view, 橡皮鸭 Debug 法, 口头解释你的代码和 bug, 在这一过程中可以帮助你意识到问题所在
- 把 bug 写下来, 记录现象、正常运作时的输出, 记录实验和假说, 最后重读和修改, 这些记录也能够在后续向他人寻求帮助时使用
- 寻求帮助
- 睡觉 😴, 脑子好才能 Debug!
