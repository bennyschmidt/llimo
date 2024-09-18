const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Chat: ChatModel } = require('./models');
const DefaultDataset = require(`${__root}/training/datasets/Default`);
const ParisDataset = require(`${__root}/training/datasets/Paris`);

const delay = ms => new Promise(res => setTimeout(res, ms));

// Run the chat model with a saved dataset

const withDataset = async (dataset, questions) => {
  const agent = await ChatModel({
    dataset
  });

  for (const question of questions) {
    // Log chat response

    console.log(
      '\x1b[35m',
      '\n\nASK >>\n\n',
      `\x1b[32m Question: ${question}\n`,
      `\x1b[36m Answer: ${agent.ask(question)}\n\n`,
      '\x1b[0m'
    );

    await delay(3000);
  }
};

// Run the chat model from the default bootstrap

const withBootstrap = async questions => {
  // Bootstrap with a default dataset

  const agent = await ChatModel({
    bootstrap: true
  });

  for (const question of questions) {
    // Log chat response

    console.log(
      '\x1b[35m',
      '\n\nASK >>\n\n',
      `\x1b[32m Question: ${question}\n`,
      `\x1b[36m Answer: ${agent.ask(question)}\n\n`,
      '\x1b[0m'
    );

    await delay(3000);
  }
};

// Run the chat model with a new dataset from files

const withFiles = async (files, questions) => {
  const agent = await ChatModel({
    files
  });

  for (const question of questions) {
    // Log chat response

    console.log(
      '\x1b[35m',
      '\n\nASK >>\n\n',
      `\x1b[32m Question: ${question}\n`,
      `\x1b[36m Answer: ${agent.ask(question)}\n\n`,
      '\x1b[0m'
    );

    await delay(3000);
  }
};

const runTests = async () => {
  // Unit: Run different chat prompts in isolation
  //       with different datasets

  console.log(
    '\x1b[35m',
    '\n\nDATASET: "Default"\n\n',
    '\x1b[0m'
  );


  await withDataset(DefaultDataset, [
    "What is something unique about the tuatara?",
    "tell me about london",
    "what am I doing?",
    "identify John",
    "what could he have done?"
  ]);

  console.log(
    '\x1b[35m',
    '\n\nDATASET: "Paris"\n\n',
    '\x1b[0m'
  );

  await withDataset(ParisDataset, [
    "where is Paris?",
    "what is paris home to",
    "talk to me about paris",
    "what is Paris known for?",
    "what is paris famous for",
    "what is Paris the capital of?",
    "what was Paris the capital of?",
    "where is London",
    "What is Paris surrounded by?",
    "how is paris referred to?",
    "Why is Paris a popular destination?",
    "When was the Eiffel Tower built?",
    "In Paris, is French the main language?",
    "since we're talking about Paris, what is it famous for?",
    "speaking of paris where is it",
    "tell me about the French language",
    "talk about france",
    "regarding the Eiffel Tower, what was it built for?"
  ]);

  // e2e: Run full training on user provided files then prompt

  await withFiles(
    ['cat-facts'],
    ['talk to me about cats']
  );

  // e2e: Run training from bootstrap then get completions

  await withBootstrap(['what about society?']);
};

runTests();
