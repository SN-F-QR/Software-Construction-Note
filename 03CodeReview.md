# 代码审查

代码审查指去系统地学习别人的代码.

关于风格标准:
公司会有自己的风格标准; 在合作项目中, 需要注重原有的风格.

## 避免重复内容 (DRY)

Don’t repeat yourself. 如果两段代码的内容是重复的, 那么当存在bug时, 就会难以进行同时修复.

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
