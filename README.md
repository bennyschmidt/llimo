> This repo is a work in progress. For a more complete solution, please use [next-token-prediction](https://github.com/bennyschmidt/next-token-prediction).

# llimo

Large language and image models in pure JavaScript.

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

  // Predict the next word

  agent.getTokenPrediction('what');

  // Predict the next 5 words

  agent.getTokenSequencePrediction('what is', 5);

  // Chat with LLM

  agent.chat('when is the best time to visit Paris?');
};

MyChatBot();
```

## Demo

Coming soon!
