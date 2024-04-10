const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Conversation: ChatModel } = require('./models');
const OpenSourceBooksDataset = require(`${__root}/training/datasets/OpenSourceBooks`);

const withDataset = async query => {
  const agent = await ChatModel({
    dataset: OpenSourceBooksDataset
  });

  // Log chat response

  console.log(
    'chat >>',
    `query: ${query}`,
    agent.chat(query)
  );
};

const withTraining = async query => {
  // Bootstrap with a default dataset

  const agent = await ChatModel({
    bootstrap: true
  });

  // Log completions

  console.log(
    'getCompletions >>',
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
    'chat >>',
    `query: ${query}`,
    agent.chat(query)
  );
};

const runTests = async () => {
  // Unit: Run different queries in isolation

  await withDataset('what');

  await withDataset('What is');

  await withDataset('what is the');

  await withDataset('hopefully');

  await withDataset('where is');

  // e2e: Run full training then query

  await withTraining('The sun');

  // e2e: Run full training on user provided files

  await withFiles('Society');
};

runTests();
