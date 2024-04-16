const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Chat: ChatModel } = require('./models');
const OpenSourceBooksDataset = require(`${__root}/training/datasets/OpenSourceBooks`);
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
      '\n\nask >>\n\n',
      `You: ${question}\n`,
      `LLM: ${agent.ask(question)}\n\n`
    );

    await delay(2000);
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
      '\n\nask >>\n\n',
      `You: ${question}\n`,
      `LLM: ${agent.ask(question)}\n\n`
    );

    await delay(2000);
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
      '\n\nask >>\n\n',
      `You: ${question}\n`,
      `LLM: ${agent.ask(question)}\n\n`
    );

    await delay(2000);
  }
};

const runTests = async () => {
  // Unit: Run different chat prompts in isolation
  //       with different datasets

  await withDataset(OpenSourceBooksDataset, [
    "What is a fact about grass?",
    "tell me about london",
    "what happened in the morning",
    "should I travel by car, train, or airplane?",
    "how was the sun then?",
    "what's Thai food?",
    "identify John",
    "when was the night dark?",
    "Where were the keys?",
    "how would he have known?",
    "Why is the sky blue?",
    "how come the sky is blue"
  ]);

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
    "when did Paris become so popular?",
    "Why is Paris a popular destination?",
    "Of all cities, why was Paris significant?",
    "In what year was the Eiffel Tower constructed?",
    "In Paris, is French the main language?"
  ]);

  // e2e: Run training from bootstrap then get completions

  await withBootstrap(['what about society?']);

  // e2e: Run full training on user provided files then prompt

  await withFiles(
    ['brave-new-world'],
    ['what is The Nile?']
  );
};

runTests();
