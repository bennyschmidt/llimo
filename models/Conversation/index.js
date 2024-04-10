/**
 * Conversation
 * A language model for conversational chat
 */

const { Language: LM } = require('next-token-prediction');

/**
 * Create a language model agent from a
 * dataset or specify a list of files
 */

module.exports = async ({
  dataset,
  files,
  bootstrap = false
} = {}) => {
  const languageModel = await LM({
    dataset,
    files,
    bootstrap
  });

  /**
   * chat
   * Question/answer transformer
   */

  const chat = query => {
    const { getCompletions } = languageModel;

    const transform = query => {
      // default to the base query

      let result = query;

      // TODO: NLP

      return result;
    };

    // transform the input to the correct prompt

    const input = transform(query);

    const { completions } = getCompletions(input);

    // pull a random completion from the top ${RANKING_BATCH_SIZE}

    const completion = completions[(Math.random() * completions.length) << 0];

    return completion;
  };

  // Chat API (extends Language)

  return {
    ...languageModel,

    chat
  };
};