# W1-JS

完成贪吃蛇的小游戏设计, 主要涉及 JS 代码的编写

- 学习如何将代码按功能分块, 整理到不同的 js 文件中
- 不需要节省代码量, 尽可能的按功能写函数, 比如某些调用基础函数的函数(`snakeOutOfBounds`)
- JS 中除了原始类型外, object 都是引用类型, 需要小心赋值

## game.js

- 通过 setInterval()结合 main(), 非常像 unity 的 update()的思路
- 通过 draw()更新前端 html 的内容

## snakeUtils.js

- 存放相关计算和判断函数, 不涉及 snake 的实际状态, 类似工具箱的功能
- 很多函数包括一个基础函数, 如`outOfBounds`和 `snakeOutOfBounds`, 提升代码复用的效果

## input.js

- window.addEventListener("keydown", function) 实现全局监听键盘输入
