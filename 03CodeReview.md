# 代码审查

代码审查指去系统地学习别人的代码.

关于风格标准:
公司会有自己的风格标准; 在合作项目中, 需要注重原有的风格.

## 避免重复内容 (DRY)

Don’t repeat yourself. 如果两段代码的内容是重复的, 那么当存在bug时, 就会难以进行同时修复.

下面是一个经典的例子:
```typescript
function dayOfYear(month: number, dayOfMonth: number, year: number): number {
    if (month === 2) {
        dayOfMonth += 31;
    } else if (month === 3) {
        dayOfMonth += 59;
    } else if (month === 4) {
        dayOfMonth += 90;
    } 
    ...... { ......
    } else if (month === 11) {
        dayOfMonth += 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31;
    } else if (month === 12) {
        dayOfMonth += 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 31;
    }
    return dayOfMonth;
}
```

## 注释的写法

一种重要的注释是函数或类的spec, 应当包含
- 具体的行为
- 输入参数
- 返回
- 例子

```typescript
/**
 * Compute the hailstone sequence.
 * See https://en.wikipedia.org/wiki/Collatz_conjecture#Statement_of_the_problem
 * @param n starting number of sequence; requires integer n > 0.
 * @returns the hailstone sequence starting at n and ending with 1.
 *         For example, hailstone(3) = [3, 10, 5, 16, 8, 4, 2, 1].
 */
function hailstoneSequence(n: number): Array<number> {
    ...
}
```

另一种注释是表明某段代码的引用, 比如附带stackoverflow的链接, 这有助于其他人找到更高效的代码或者修复bug

**不要写直接解释代码行为的注释**
```typescript
while (n !== 1) { // test whether n is 1   (don't write comments like this!)
   ++i; // increment i
   l.push(n); // add n to l
}
```

更需要注明的是某些复杂的代码, 比如其实应用了某**个数学公式或者近似**

对同一函数内的代码进行适当的分段, 这也有助于将某些代码抽象成函数

## 快速报错

编写代码时, 应该让一些非法情况(比如输入非法)更快的报错:
- 静态报错: 指定更合适的参数类型等, 比如把月份改为string, 避免误输入成 日期
- 动态报错: 在运行时, 通过if/else判断并抛出错误

## 避免魔法数字

对于程序中定义的数字量, 应该尽量使用如下思路:
1. 数字的可读性不如**名称**, 比如月份单词比1~12更清晰
1. 常量数字应该**被定义**以便未来的修改
1. 定义**新的常量**时, 应该考虑其与已定义常量之间的关系并尝试建立关系

当程序中出现大量的魔法数字时, 就需要考虑用一些方法将它们归类为一种**数据**

这里给出一个常见的魔法数字例子和改进思路
```typescript
for (let i = 0; i < 5; ++i) {
    turtle.forward(36);
    turtle.turn(72);
}
```
没有注释情况下, 很难读懂这个代码(ETU), 而且容易出bug(SFB), 亦难以使用(RFC)

```typescript
const oneRevolution = 360.0;
const numSides = 5;
const sideLength = 36;
for (let i = 0; i < numSides; ++i) {
    turtle.forward(sideLength);
    turtle.turn(oneRevolution / numSides);
}
```
通过参数的命名来增加表明数字的意义(ETU)并且常量的设置提供了方便的修改(RFC), 并且通过除法来提供角度, 避免算错夹角而引发bug(SFB)

## 一个变量, 一个目的

每次定义变量时, 应该保持其原有的目的来使用. 不要将变量复用到多个地方. 特别是对于函数的输入参数, 不要直接在其基础上修改, 因为可能后续的修改需要用到原有的输入值.

比如上述例子中的dayOfMonth, 就被复用作为return的内容.

## 使用优秀的名称

1. 使用好的函数和变量名能够让人一目了然, 而无需使用注释进行讲解. 形如`tmp, data, temp`的名称是经典的反例. 应该使用更加具体的表述.
1. 应当选用短的词汇, 但是避免使用缩写
1. 可以在典型的位置使用单个字母的变量, 比如循环的ij, 坐标的xy. 其它位置应当避免使用.

## 使用空格和标点

1. 对于多个||和===, 可以使用换行使之对齐而方便阅读
1. C-like语言保持大括号的使用, 即使是单行的for循环, 因为可能会导致bug; Typescript中保持分号的使用
1. tab键的输入内容最好在所有编辑器中设置为插入空格, 而不是真正的缩进. (VSode和pycharm等都为空格)

## 避免全局变量

- 全局**变量**定义为可以在程序中任意位置访问和修改的变量; 实际情况中, 应当把全局变量转化为参数和返回值, 或者将他们放到函数调用的objects中
- 但全局**常量**是安全且有用的

### 快照图中表示不同类型的变量

- 局部变量: 位于函数内部
- 实例变量: 跟随实例, 如类的属性
- 全局变量

课程使用snapdown绘制快照图.
```
i -> 5
f -> (MyFloat 5.0)
lst -> (ArrayList 0->1000 1->2000)
main(){
    ...
}
```

## 函数应当返回结果, 而不是打印

- 只有最顶层的函数需要与用户或console交互
- 更底层的函数更需要返回值
  - 有debug需求时是例外

返回结果包括多个类型时, 实际数据的组织方法也有优劣之分. 比如需要返回n和string时, tpyescript中最优先采用object类型`{ count: number, longestWord: string }`; 其次是元组`[string, number`.

## 避免为特殊情况写代码

比如当输入数组长度为 0 时, 可能会这么写:
```typescript
if (words.length === 0) {
    console.log("0");
    return;
}
```

这通常是没有必要的, 因为可能循环函数会直接略过这种情况, 实际并不会发生错误. 但如果手动写了, 可能会导致return的内容不一致的问题.

因此当你想为特殊情况写一个if时, 请考虑代码本身其实是否已经解决了这个问题, 或者去改进代码让其兼容这一特殊情况.

有时可能会编写一些特殊情况来提升性能, 但是需要考虑这种特殊情况出现的频率, 低频率下应该优先保证代码的整洁和易读.
