const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { dirname } = require('path');
const __root = dirname(require.main.filename);

const { Chat: ChatModel } = require('../../models');
const ParisDataset = require(`${__root}/training/datasets/Paris`);

const rl = readline.createInterface({ input, output });

const ParisChat = async () => {
  const agent = await ChatModel({
    dataset: ParisDataset
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

    const answer = agent.ask(input);

    if (answer) {
      console.log(
        '\n',
        `\x1b[36m ${answer}`,
        '\n',
        '\x1b[0m'
      );
    }

    prompt();
  };

  const prompt = () => {
    rl.question('Ask me something about Paris... (press ENTER to chat) ', print);
  };

  prompt();
};

ParisChat();
