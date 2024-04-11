const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Conversation: ChatModel } = require('../../models');
const OpenSourceBooksDataset = require(`${__root}/training/datasets/OpenSourceBooks`);

const rl = readline.createInterface({ input, output });

const MyChatBot = async () => {
  const agent = await ChatModel({
    dataset: OpenSourceBooksDataset
  });

  const print = input => {
    if (
      input.toLowerCase() === 'bye' ||
      input.toLowerCase() === 'exit'
    ) {
      console.log('Bye!');
      rl.close();
      process.exit();
    }

    const answer = agent.chat(input);

    console.log(`${answer}`, '\n');

    prompt();
  };

  const prompt = () => {
    rl.question('Type something... (press ENTER to chat) ', print);
  };

  prompt();
};

MyChatBot();
