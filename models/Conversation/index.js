/**
 * Conversation
 * A language model for conversational chat
 */

const { Language: LM } = require('next-token-prediction');
const NLP = require('wink-nlp-utils');

const { getPartsOfSpeech } = require('../../utils');

const NOUN = 'noun';

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
    const {
      getCompletions,
      getTokenSequencePrediction
    } = languageModel;

    // TODO: Improve with NLP.
    //       This transforms basic inputs into a
    //       subject-first statement to be completed

    const transform = query => {
      // default to the base query

      let result = query;

      const partsOfSpeech = getPartsOfSpeech(query);

      if (partsOfSpeech?.length > 1) {
        const subject = partsOfSpeech
          .map(({ label, value }) => (
            label.toLowerCase().match(NOUN)) && (
              value
            )
          )
          .filter(Boolean)
          .pop()

        if (subject) {
          result = subject;
        }
      }

      return result;
    };

    // transform the input to the correct prompt

    const subject = transform(query);

    // get completions

    const { completions } = getCompletions(subject);

    // TODO: Improve with further sentiment analysis
    // for now, pull a random completion from the top ${RANKING_BATCH_SIZE}

    const completion = completions[(Math.random() * completions.length) << 0];

    return `${subject} ${completion}`;
  };

  // Chat API (extends Language)

  return {
    ...languageModel,

    chat
  };
};