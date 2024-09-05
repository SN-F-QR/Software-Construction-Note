# Web 基础

对应课程单元:

- Kickoff
- Intro to HTML/CSS
- W0 workshop 实战

## 访问网页的简单流程

1. 用户发起*请求*(Request) GET facebook.com
2. 服务器接受, 返回(Respond)_网页文件_
3. 用户在浏览器中显示网页

其中网页文件包括:

- HTML 组织内容
- CSS 组织风格
- JS 实现交互的代码文件
- 一些 Assets, 如图片

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

### flex

flex 用于横向或纵向组织内容块.

```css
.u-flex {
  display: flex; /* 还有其它方式, 如block */
  flex-direction: row;
}

.u-grow {
  flex-grow: 1;
  flex-basis: 0; /* basis需要设置为0使得块的宽度可以被设置为相同 */
}
```
