> 🚧 Do not use this library. This project is a work in progress. For a more complete solution, please use [next-token-prediction](https://github.com/bennyschmidt/next-token-prediction).

# llimo

Large language and image models in pure JavaScript.

![limo](https://github.com/bennyschmidt/llimo/assets/45407493/be0f481f-7b5c-431b-966d-f430e9bd5829)

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

  agent.ask('what is Thai food?');
};

MyChatBot();
```

## Demo

A work in progress. Things needed:

1) A lot more training data - this directly translates to what it accurately "knows"

2) Better parts-of-speech parsing - to allow for more flexible, even misspelled inputs

https://github.com/bennyschmidt/llimo/assets/45407493/7d2a6936-7243-45e8-a9fc-9a64172673b7
