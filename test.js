const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Chat: ChatModel } = require('./models');
const OpenSourceBooksDataset = require(`${__root}/training/datasets/OpenSourceBooks`);

const withDataset = async query => {
  const agent = await ChatModel({
    dataset: OpenSourceBooksDataset
  });

  // Log chat response

  console.log(
    '\n\nchat >>',
    `You: ${query}\n`,
    `LLM: ${agent.ask(query)}\n\n`
  );
};

const withTraining = async query => {
  // Bootstrap with a default dataset

  const agent = await ChatModel({
    bootstrap: true
  });

  // Log completions

  console.log(
    '\n\ngetCompletions >>',
    `query: ${query}`,
    agent.getCompletions(query)
  );
};

const withFiles = async query => {
  const agent = await ChatModel({
    files: ['brave-new-world']
  });

  // Log chat response

  console.log(
    '\n\nchat >>',
    `You: ${query}\n`,
    `LLM: ${agent.ask(query)}\n\n`
  );
};

const runTests = async () => {
  // Unit: Run different chat prompts in isolation

  await withDataset('what is something nice about Paris');

  await withDataset('should I travel by car, train, or airplane?');

  await withDataset('What is something you recognize?');

  await withDataset('which forests are the most beautiful?');

  // e2e: Run full training then get completions

  await withTraining('what about society?');

  // e2e: Run full training on user provided files then prompt

  await withFiles('what does it do');
};

runTests();
