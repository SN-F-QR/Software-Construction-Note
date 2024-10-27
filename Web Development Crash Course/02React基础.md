# React

对应课程单元:

- 8 Intro to React

## 组件 Component

一个基于 React 的网页可以看做多个重复利用的组件的组合, 即 Components of Components. 比如一个 Facebook 主页可以拆分多个组件为:

- Facebook
  - NavBar
  - Feed
  - Post
    - Comment
  - InfoBar
  - Friends

对于某一个组件, 比如 Post, 实际对应 HTML、CSS、JS 三种文件的*抽象*组合. 组件类似于一个自定义的 HTML tag.

### 属性 Props

对于每个组件显示的内容, 需要通过属性来确定.

属性指代从 Parent **单向传递**到 Child 组件的不可修改数据. 以 Comment 为例.

Post 传递如下 Props:

- author name
- content
- date posed
- profile picture

```js
import React, { useState } from "react";
import Post from "xxx/post.js"  // 引入Post组件
// get some data
...
// pass data as prop
return (
  <div>
    <Post userName={data.name} content={data.text} ... />
  </div>
)
```

### 状态 State

Props 允许组件渲染不同的数据, 但是该渲染何种数据则由状态确定.

- 状态由组件维持
- 状态可被 用户输入 或 组件 修改

```js
import React, { useState } from "react";

// commentReply is a component
const commentReply = (props) => {
  // JS function logic

  // isLiked为State, setIsLiked为设置isLiked的函数
  const [isLiked, setIsLiked] = useState(false); // State设置, 回复是否被喜欢的状态

  // return JSX to render
  return (
    <div className="xxx">
      <h5>{props.name}</h5>
      <p>{props.content}</p>
      <button
        //  也可以先将函数赋到变量, 更清晰, 注意onClick是作为button的参数
        onClick={() => {
          setIsLiked(!isLiked);
        }}
      >
        {isLiked ? "Liked" : "Like"}
      </button>
    </div>
  );
};

export default commentReply;
```

JSX 是 HTML 更加严格的版本, 语法上有一定的区别(如 `className`), 可以将 JS 整合到其中(通过`{}`使用 React 组件中的变量).

对于 props, 可以在 parent 组件中定义 `<Post name="Kenneth" text="Welcome to web lab!" />`
