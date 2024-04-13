/**
 * Conversation
 * A language model for conversational chat
 */

const { Language: LM } = require('next-token-prediction');

const { getPartsOfSpeech } = require('../../utils');

const MATCH_PUNCTUATION = new RegExp(/[.,\/#!$%?“”\^&\*;:{}=\_`~()]/g);

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
   * ask
   * Question/answer transformer
   */

  const ask = query => {
    const {
      getCompletions
    } = languageModel;

    // TODO: Improve with NLP.
    //       This transforms basic inputs into
    //       a cursor to be completed

    const transform = query => {
      // default to the base query
      // Example: "is New York considered a melting pot?"

      let result = '';

      const partsOfSpeech = getPartsOfSpeech(query);

      if (partsOfSpeech?.length > 1) {

        // Find proper noun

        let isPrevNNP = true;

        for (const part of partsOfSpeech) {
          if (part.pos === 'NNP') {
            if (isPrevNNP) {
              result += `${part.value} `;
            } else {
              result = `${part.value} `;
            }

            isPrevNNP = true;
          } else {
            isPrevNNP = false;
          }
        }

        // Find noun

        if (!result) {
          let isPrevNN = true;

          for (const part of partsOfSpeech) {
            if (part.pos.match('NN')) {
              if (isPrevNN) {
                result += `${part.value} `;
              } else {
                result = `${part.value} `;
              }

              isPrevNN = true;
            } else {
              isPrevNN = false;
            }
          }
        }

        // Default noun

        if (!result) {
          result = 'Something ';
        }

        // Transpose with prepositions and verbs
        // Example: "New York is considered"

        result += partsOfSpeech.find(({ pos }) => pos.match(/VB/)).value;

        // TODO: Recursively get subsequent subjects
        // Example: ["New York is considered", "A melting pot is considered"]

        // TODO: Get completions

        // Example A: ["New York is considered to be the melting pot of the world.", "A melting pot is considered to be a figure of speech."]
        // Example B: ["New York is considered to be one of the most ethnically diverse cities in the United States.", "A melting pot is a metaphor for a society where many different types of people blend together as one."]

        // Example answer A (without inference): "New York is considered to be the melting pot of the world. A melting pot is considered to be a figure of speech."
        // Example answer B (without inference): "New York is considered to be one of the most ethnically diverse cities in the United States. A melting pot is a metaphor for a society where many different types of people blend together as one."

        // TODO: Logical inference
        // Example answer A: "New York is considered to be a melting pot which is a figure of speech."
        // Example answer B: "New York is considered to be a melting pot because a melting pot is a metaphor for a diverse place and New York is considered to be one of the most diverse places."
      }

      return result;
    };

    // transform the input to the correct prompt

    query = query.replace(MATCH_PUNCTUATION, '');

    const cursor = transform(query);

    // get completions

    let { completions } = getCompletions(cursor);

    // TODO: Improve with further sentiment analysis
    // for now, pull a random completion from the top ${RANKING_BATCH_SIZE}

    let completion = completions[
      (Math.random() * completions.length) << 0
    ];

    if (!completion) {
      completion = getCompletions(query.split(' ').pop()).completions[0];
    }

    if (!completion) {
      return "I'm not able to answer that question coherently due to lack of training data.";
    }

    return `${cursor.replace(cursor.charAt(0), cursor.charAt(0).toUpperCase())} ${completion}`;
  };

  // Chat API (extends Language)

  return {
    ...languageModel,

    ask
  };
};