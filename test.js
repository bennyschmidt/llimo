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
    '\n\nDATASET: "open-source-books"\n\n',
    '\x1b[0m'
  );


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
    "how come the sky is blue"
  ]);

  console.log(
    '\x1b[35m',
    '\n\nDATASET: "paris"\n\n',
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
