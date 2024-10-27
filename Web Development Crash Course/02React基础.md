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

#### Sharing state

React 中经常需要共享 state 来切换页面的内容, 比如在子组件中触发 state 的改变, 并联动另一个同级子组件.

此时需要将 state 转移到它们共同的 parent 组件中, parent 组件将 state 本身和 setState 函数作为 props
传递到子组件中, 实现共享. (同级间直接传递是不行的)

### 生命周期

组件的生命周期和餐馆一样, 包含:

- Trigger 第一次被调用(Mounting) 或 状态改变
- Render 运行 js 代码并调用子组件
- Commit 返回 JSX 到 HTML DOM(显示给用户)

不希望再使用组件时, 结束(Dismount)生命周期

React 使用 Hooks 来允许访问组件的生命周期, 比如上述的`useState`, 实现类似功能的还有`useEffect`, 即在特定变量改变后运行. 对比**异步**进行的`useState`, `useEffect`实现同步, 比如读取外部数据到 state, 调用 API 等.

`useEffect(function, optional dependency array)`, 检测 array 中的值改变则调用 function

```js
const myFunc = () => {
  ...
}

useEffect(myFunc, [var1, var2])  // var1和var2改变后调用

useEffect(myFunc, [])  // mount时调用

useEffect(myFunc, [var1, var2])  // mount和任意state改变时调用

useEffect(( => {
  ...
  return () => {
    // 这里返回的函数实际用于cleanup, 仅在dismount时使用
  }
}), [...dependency])
```

利用 hooks, react 可以实现一些常见模式:

1. fetch 和 send 数据, 配合 api 和`then()`
2. 按条件渲染 html
3. 渲染一组数据

```js
// 1

useEffect(() => {
  get("api/packages").then((packageList) => {
    setPackages(packageList);
  });
}, []);

// 2
const title = <h1>"My page"</h1>;
return (
  <div>
    {title}
    <p> {loading ? "Loading..." : "Finished"}</p>
  </div>
);

// 3, 这里在ItemComponent里设置了key, JSX会因此被追踪, 下次渲染只会渲染被修改内容
const data =[ {id: 0, text:"test"}, ... ]

return data.map((item) => {
  return <ItemComponent key={item.id}>item.text</ItemComponent>
})
```
