> 🚧 This project is a work in progress. For a more complete solution, please use [next-token-prediction](https://github.com/bennyschmidt/next-token-prediction).

# llimo

Large language and image models in pure JavaScript.

![llimo](https://github.com/bennyschmidt/llimo/assets/45407493/aaec96e4-52ac-498d-9e3f-eded92862ed6)

## Install

`npm i llimo`

## Usage

Put this [`/training/`](https://github.com/bennyschmidt/llimo/tree/master/training) directory in the root of your project.

Now you just need to create your app's index.js file and run it. Your model will start training on the .txt files located in [`/training/documents/`](https://github.com/bennyschmidt/llimo/tree/master/training/documents). After training is complete it will run these 3 queries:

```javascript
const { Conversation: ChatModel } = require('llimo');

const MyChatBot = async () => {
  const agent = await ChatModel({
    bootstrap: true
  });

  // Chat with LLM

  agent.ask('what is Thai food?');
};

MyChatBot();
```

## Demo

LM Chat ([Paris](https://github.com/bennyschmidt/llimo/blob/master/training/datasets/Paris.js) dataset):

https://github.com/bennyschmidt/llimo/assets/45407493/6ba6d0fe-c7b9-47d8-9b81-fa567faa89e0

Benefits:

- Faster than conventional training and inference, thus:
- Instant answers
- No hallucinations

Differences from conventional language models:

- Simpler take on embeddings (just bigrams stored in JSON format), thus:
- Not as generative as conventional LLMs
- Better suited for completion (prediction) type work 
