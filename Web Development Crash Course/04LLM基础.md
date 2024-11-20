# LLM 基础

简单的讲, LLM 和其他深度学习模型一样, 都是使用训练好的网络来生成结果, LLM 就是对输入的文字生成文字结果.

课程中针对 LLM[众多任务](https://huggingface.co/tasks)中的 RAG(Retrieval Augmented Generation, 也属于 Document Question Answering)进行简单的程序构建.

这里我备份的代码使用了 Google 的 Gemini 来做 LLM, 课程的 anyscale 似乎已无免费额度.

## RAG

RAG 的任务: 已知一些语料信息, 与 LLM 进行对话时, LLM 的常识中会包括这些正确的语料信息.

具体步骤为:

- 准备. 将大段的语料切割成一定范围大小的小句, 具体大小根据经验进行 trade-off, 可以使用 langchain 进行分割.
- Retrieval. 因为信息可能非常的多, 全部喂给 LLM 的效果不一定好的, 因此需要在里面根据对话内容进行挑选(Retrieval)后再喂给 LLM. 具体原理是使用 Embedding(由 LLM 提供)模型进行嵌入, 再使用向量相似性获取最相似的几条语料(由 chroma 等向量数据库完成).
- Augment. 将提取的语料和用户的输入结合一起作为 Prompt, 提交给 LLM. 具体可以参考下图.
- Generate. 利用 API 发送 Prompt 到服务器或者本地 LLM, 获取返回结果.

<img src="./images/promptEngineering.png />

## LLM 的 API

调用 API 非常简单而且各家官网都用详细的 Docs.

**关于 LLM 是如何记忆过去的内容**, 实际上模型并非实时更新的, 因此其实每次发送 chat 都会把过去所有的(一定文本量范围内)对话记录都发送给 LLM, 其中 OpenAI 的指定方式如下:

```js
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: `
            You are a helpful assistant that answers programming questions 
            in the style of a southern belle from the southeast United States.
          `,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Are semicolons optional in JavaScript?",
        },
      ],
    },
  ],
});
```
