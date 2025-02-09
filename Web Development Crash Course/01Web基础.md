# Web 基础

对应课程单元:

- Kickoff
- Intro to HTML/CSS
- W0 workshop 实战
- 11 APIs / Promises

## 访问网页的简单流程

1. 用户发起*请求*(Request) GET facebook.com
2. 服务器接受, 返回(Respond)_网页文件_
3. 用户在浏览器中显示网页

其中网页文件包括:

- HTML 组织内容
- CSS 组织风格
- JS 实现交互的代码文件
- 一些 Assets, 如图片

每次发起的请求实际是 HTTP(Hypertext Transfer Protocol) Request, 包含:

- 请求目标(URL)和参数, 比如目标(https://www.youtube.com/results?)参数(search_query=web+lab)
- Http 方法, 描述希望的行动, 包括 **GET/POST**(获取/发送数据), PUT(代替数据), DELETE
- Headers, 提供 http 请求的背景, 比如使用的语言、浏览器、host 等等
- Body

服务器的 Respond 包括:

- status code, 404😭(4xx 你有一些 wrong), 500👎(5xx 服务器有一些 wrong), 200👌(成功), 3xx 重定向 等
- headers, content-length、type 等关于返回的信息
- body, 通常是 json 格式, 如果请求是用户提交的数据, 则为与之相关的信息

### APIs

即 Application Program Interface, 为允许发送请求的端口(endpoints)的集合

API 有着如下目的:

- 提供数据访问
- 直接访问服务器的数据会导致不方便和安全问题
- 提供结构化端口
- 分工

一个 API 接收(**URL, 序列参数**)和返回的例子:

- GET /api/add
  - Input: {a: number, b: number}
  - Output: {result: number}
- GET /api/add?a=5&b=8
  - {result: 13}

Endpoints

- 访问 URL 实际是发送请求给端口
- 一个 URL 可以支持多个端口
- 很多外部的 API 提供商会要求 key/token 来提供收费服务, 密钥存储在请求中

一些 debug API 请求的工具, 如 postman, REQBIN.

JS 中在发起 GET 请求后, 可能会返回一个**Promise**, 代表 JS 异步操作的对象:

- 包含 pending, fulfill, reject 三种状态
- 代表异步操作的最终结果
- 引入异步操作作为结果, 实际是因为 API 的处理需要时间, 此时 JS 可以继续执行

一个 Promise 的处理例子, fulfill 则执行 then, 否则抛出错误并 catch

```js
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
```

当有**一组 Promise** 时, (比如多个 get), 可以用数组将其整合, 并调用 Promise.race 处理第一个 fulfill/.all 处理所有/.any 处理任意一个成功的.

设计异步操作的变量, 无法直接执行, 可以使用 await 来等待异步函数执行 如:

```js
const a = slowNumber(10);
const b = slowNumber(20); // two promises

const c = a + b; // fail!!!!

const a = await slowNumber(10); // spend 5s  注意必须用在异步函数里
const b = await slowNumber(20); // spend 3s

const c = a + b; // Pass, spend 8s totally
```

只有异步函数能够使用 await, 用 async 标识, ❌ 不能直接写在 main 函数中:

```js
const myFunction = async () => {
  //...
};

// Rewrite the GET.then() with await
useEffect(() => {
  const getStories = async () => {
    const storyObjs = await get("/api/stories");
    setStories(storyObjs);
  };
  getStories();
});
```

### 网页路由(routing)

路由是一种将 URL 路径映射到对应页面内容的机制, 具有以下特点, 实现页面之间的无刷新跳转.

比如使用 Reach Router library 可以实现:

```jsx
<Router>
  <Home path="/" />
  <Dashboard path="dashboard" />
  <Team path="/team" />
</Router>
```

对应 URL `"/" "/dashboard" "/team"`下的不同渲染内容. 其中`dashboard`前没有`/`, 代表相对路径, 直接加在当前 URL 后方, 而带有`/`则为绝对路径, 接在根路径下.

实现跳转功能时, 使用`<Link to="..."></Link>`, 会被渲染为 html 的链接跳转形式.

### Next.js

Next.js 是一种全栈语言, 对比先前使用的 React+Express.js 的区别有:

- 自带 routing 方法(类似 svelte)
- 渲染方式为 Multi-page application(MPA), 而 React 为单页应用
- 对网页的图片和 script 等有优化
- 自带 middleware

其中渲染方面, Next.js 引入服务器侧渲染(SSR), 而 React+Express 为客户端侧渲染(CSR).

- 使用 CSR 时, 客户端下载 HTML 和 Javascript 并完成渲染, 期间客户端会向服务器和数据库请求数据来填充网页.
- 使用 SSR 时, 只有渲染好的 HTML 会直接发送给客户端, 服务器完成数据的提取和处理.

SSR 的优点包括, 更接近数据, 提升了可持续性和可读性, 同时性能更有保证, 并且能够避免对客户端的信任.

Next.js 中整合了 SSR 和 CSR(React Server Components, RSC), 将代码分割为服务器部分和客户端部分, 两者同时进行渲染, 从而实现资源的充分利用.

使用`npx create-next-app@latest`来快速创建 Next.js 环境. 具体文件结构如下:

- node_modules
- public -> public assets, like images/PDFs/...
- src -> our code
- next.config.js -> config for next

See example [here](https://github.com/weblab-workshops/bank-statement-viewer) 和 React 几乎一样.

## HTML

= Hypertext Markup Language, 用于描述网页的**内容和结构**

= Nested Boxes, 实际上是多个框的嵌套和组合

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Title!</title>
    <!-- 网页标题meta信息 -->
  </head>
  <body>
    <h1>Heading!</h1>
    <p>Paragraph!</p>
  </body>
</html>
```

### Tags

| Tag                   | 作用                       |
| --------------------- | -------------------------- |
| `<html>`              | Root of HTML Document      |
| `<head>`              | Info about Document        |
| `<body>`              | Document Body              |
| `<h1>, <h2>, <h3>, …` | Header tags                |
| `<p> `                | Paragraph tag              |
| `<div> `              | Generic block section tag  |
| `<span>`              | Generic inline section tag |

#### 属性

`<tagname abc="xyz"> </tagname>` 其中`abc`为属性, `"xyz"`为属性的值.

如插入链接:

`<a href="http://weblab.mit.edu"> Content </a>`

插入图片:

`<img src="pusheen.gif"></img>`

或者无需文字版本 `<img src="pusheen.gif" />`

#### Lists

- `<ol>` 有序
- `<ul>` 无序
- `<li>` Item

```html
<ol>
  <li>Test</li>
  <li>A List Created by HTML</li>
</ol>
```

#### div & span

主要用于将内容归类成一个组, div 用于大段, span 为行间.

<img src="images/divAndSpan.png" width="70%" />

对于各种 tag 的使用和细节, 查一查 MDN 或者问 GPT~

为什么不直接广泛的使用 div ?

- MDN 给出的建议 `只有在其它语义内容(<article> / <nav>)都不合适时才使用`
- 语义内容的使用有助于机器更容易读懂网页的内容, 有助于人的理解和维护

## CSS

= Cascading Style Sheets, 告诉浏览器内容长什么样

= A list of description, for makeup

下面的例子装饰 div 内容的风格

```css
div {
  color: red;
  font-family: Arial;
  font-size: 24pt;
}
```

可以使用 id 或者 class 来指定特定的 tag 被 css 装饰.

```css
.classInfo {
  ...;
}

#idName {
  ...;
}
```

### ID and Class

| 特性               | ID                  | Class                     |
| ------------------ | ------------------- | ------------------------- |
| 唯一性             | 在页面中必须唯一    | 可以重复使用              |
| 用途               | 标识特定元素        | 分组相似元素              |
| 每个元素可使用数量 | 只能使用一个        | 可以使用多个              |
| CSS 权重           | 较高 (100)          | 较低 (10)                 |
| 示例               | `<div id="header">` | `<div class="container">` |

CSS 中, 优先级从上到下为:

- Inline style (ignore)
- ID (#myID)
- Classes (.info)
- Elements (div)

通常**只使用 classes**来配合 css 文件.

### 结合 CSS 到 HTML

```html
<head>
  <title>Title!</title>
  <link rel="stylesheet" href="style.css" />
</head>
```

link 指定 rel(relationship)和文件地址.

### 字体导入

结合谷歌字体实现字体更改

```css
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap");

body {
  font-family: "Open Sans", sans-serif;
}
```

### Margin/Padding

具体的 margin 和 padding 关系如下:

<img src="images/margin.png" width="80%">

- 浏览器默认给 body 预留 8pt 的 margin, 需要手动设置为 0
- 8pt grid system: 通常将 margin 等数值设置为 8px 的倍数, 便于判断

在 css 文件中, 可以预设置变量并使用:

```css
:root {
  --primary: #396dff;
  --grey: #f7f7f7;
  --white: #fff;

  --xs: 4px;
  --s: 8px;
  --m: 16px;
  --l: 24px;
}

.exp {
  --backgroud: var(--white);
  margin: var(--xs);
}
```

#### 使用 Padding 划分显示区域

- 使用百分比, 可以在窗口缩放时仍然保持相对的显示位置
- 利用左右的等比例的 padding 来实现居中效果

```css
.avatarContainer {
  padding: 0 35%;
}
```

### 元素排列方式

**flex** 用于横向或纵向组织内容块.

```css
.u-flex {
  display: flex; /* 还有其它方式, 如block */
  flex-direction: row;
  align-items: center; /* 实现对齐 */
}

.u-grow {
  flex-grow: 1;
  flex-basis: 0; /* basis需要设置为0使得块的宽度可以被设置为相同 */
}
```

**grid** 用于网格方式排列内容块.

```css
.container {
  display: grid;
  grid-auto-flow: row; /* 如何处理末尾的元素, row为优先增加一行 */
  grid-template-rows: 100px 100px; /* 设置单元格大小, 两个为前两行大小100px */
}
```

### 元素显示

visibility: hidden 隐藏元素, 但保持占位符;
display: none 隐藏元素;
overflow: visible/hidden/scroll/auto 如何显示溢出的元素

### 动画

keyframes 用于定义动画的关键帧

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Call the animation */
.container {
  animation: fadeIn;
  animation-duration: 5s;
  animation-delay: 2s;
}
```

### [CSS Combinators](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Child_combinator)

一共有四种组合方式:

- 后代选择器(space), 匹配所有子、子子等元素
- 子组合器(>), 匹配直接的子元素
- 接续兄弟组合器(+), 匹配紧跟在第二个元素后的第一个元素
- 后续兄弟选择器(~), 匹配跟在第二个元素后面的所有第一个元素
