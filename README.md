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

Q & A Demo ([Paris](https://github.com/bennyschmidt/llimo/blob/master/training/datasets/Paris.js) dataset):

https://github.com/bennyschmidt/llimo/assets/45407493/df8e9627-ff48-41ed-8714-a880beb8680a

A work in progress. Things needed:

1) A lot more training data - this directly translates to what it accurately "knows"

2) Better parts-of-speech parsing - to allow for more flexible, even misspelled inputs
