const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Chat: ChatModel } = require('./models');
const OpenSourceBooksDataset = require(`${__root}/training/datasets/OpenSourceBooks`);

const delay = ms => new Promise(res => setTimeout(res, ms));

// Run the chat model with a saved dataset

const withDataset = async questions => {
  const agent = await ChatModel({
    dataset: OpenSourceBooksDataset
  });

  for (const question of questions) {
    // Log chat response

    console.log(
      '\n\nchat >>\n\n',
      `You: ${question}\n`,
      `LLM: ${agent.ask(question)}\n\n`
    );

    await delay(2000);
  }
};

// Run the chat model from the default bootstrap

const withTraining = async query => {
  // Bootstrap with a default dataset

  const agent = await ChatModel({
    bootstrap: true
  });

  for (const question of questions) {
    // Log completions

    console.log(
      '\n\ngetCompletions >>\n\n',
      `query: ${question}`,
      agent.getCompletions(question)
    );

    await delay(2000);
  }
};

// Run the chat model with a new dataset from files

const withFiles = async questions => {
  const agent = await ChatModel({
    files: ['brave-new-world']
  });

  for (const question of questions) {
    // Log chat response

    console.log(
      '\n\nchat >>\n\n',
      `You: ${question}\n`,
      `LLM: ${agent.ask(question)}\n\n`
    );

    await delay(2000);
  }
};

const runTests = async () => {
  // Unit: Run different chat prompts in isolation

  await withDataset([
    'What is a fact about grass?',
    'what is london',
    'what happened in the morning',
    'should I travel by car, train, or airplane?',
    'what was the sun like then?',
    'what does Paris represent?',
    'what did paris used to represent'
  ]);

  // // e2e: Run full training then get completions

  await withTraining(['what about society?']);

  // // e2e: Run full training on user provided files then prompt

  await withFiles(['what does it do']);
};

runTests();
