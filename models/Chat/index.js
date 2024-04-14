/**
 * Conversation
 * A language model for conversational chat
 */

const { Language: LM } = require('next-token-prediction');

const {
  getPartsOfSpeech,
  toSentenceCase
} = require('../../utils');


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

  const getNounPhrase = query => {
    const partsOfSpeech = getPartsOfSpeech(query);

    if (!partsOfSpeech?.length) return;

    let result = '';

    // Find proper noun

    let isPrevNNP = true;

    for (const part of partsOfSpeech) {
      if (part.pos === 'NNP') {
        const properNoun = `${part.value} `;

        if (isPrevNNP) {
          result += properNoun;
        } else {
          result = prependArticle(query, properNoun);
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
          const noun = `${part.value} `;

          if (isPrevNN) {
            result += noun;
          } else {
            result = prependArticle(query, noun);
          }

          isPrevNN = true;
        } else {
          isPrevNN = false;
        }
      }
    }

    // Default noun

    if (!result) {
      result = 'It';
    }

    return result.trim();
  };

  const getPositionalPhrase = query => {
    const firstWord = query.split(' ')[0].trim();
    const partsOfSpeech = getPartsOfSpeech(query);

    if (!partsOfSpeech?.length) return;

    let phrase = partsOfSpeech.find(({ pos }) => pos.match(/VB/))?.value;

    if (firstWord.toUpperCase().match('WHERE')) {
      phrase += ` located`;
    }

    return phrase || '';
  };

  const getFocus = query => {
    const noun = getNounPhrase(query);
    const partsOfSpeech = getPartsOfSpeech(query.slice(query.indexOf(noun)));

    if (!partsOfSpeech?.length) return;

    const nextNoun = getNounPhrase(query.slice(query.indexOf(noun) + noun.length));

    if (nextNoun && nextNoun !== 'It') {
      return nextNoun;
    }

    const word = partsOfSpeech.find(({ pos }) => pos.match(/JJ|VBP/))?.value;

    return word || '';
  };

  const prependArticle = (sequence, token) => {
    const leadingPhrase = sequence.slice(0, sequence.indexOf(token.trim()));
    const leadingWord = leadingPhrase.split(' ').filter(Boolean).pop();

    if (leadingWord === 'a' || leadingWord.match(/the|an/)) {
      token = `${leadingWord} ${token}`;
    }

    return token;
  };

  /**
   * ask
   * Question/answer transformer
   */

  const ask = query => {
    if (!query) return;

    const {
      getCompletions
    } = languageModel;

    // Transforms a query into a combined completion

    const transform = query => {
      // Example query: "is New York considered a melting pot?"

      const firstWord = query.split(' ')[0].trim();
      const nounPhrase = getNounPhrase(query).trim();
      const positionalPhrase = getPositionalPhrase(query).trim();

      // Handle inference query

      if (
        firstWord.toUpperCase() === 'IF' ||
        firstWord.toUpperCase() === 'WHEN' ||
        !isNaN(firstWord)
      ) {
        return "I'm not yet able to infer logic.";
      }

      // Get the first subject of the sentence
      // Example: "New York"

      let result = nounPhrase;

      // Transpose with prepositions and verbs
      // Example: "New York is considered"

      result += ` ${positionalPhrase}`;

      // Get completions
      // Example A: ["New York is considered to be the melting pot of the world."]
      // Example B: ["New York is considered to be one of the most ethnically diverse cities in the United States."]

      let completions, sample;

      sample = getCompletions(result.trim())?.completions;
      completions = sample && sample.filter(Boolean);

      console.log('COMPLETE', result.trim(), '...');

      // If none and not a location, fallback to just completing
      // the noun phrase

      if (!completions?.length && !firstWord.toUpperCase().match('WHERE')) {
        sample = getCompletions(nounPhrase)?.completions;
        completions = sample && sample.filter(Boolean);
        result = result.replace(positionalPhrase, '').trim();
        console.log('FALLBACK', nounPhrase, '...');
      }

      // If none and the query is just 1 word, fallback to completing
      // the first word of the query

      if (!completions?.length && firstWord.trim() === query.trim()) {
        sample = getCompletions(firstWord)?.completions;
        completions = sample && sample.filter(Boolean);
        result = firstWord.trim();
        console.log('FALLBACK', firstWord, '...');
      }

      const keyword = getFocus(query);

      console.log('MATCH', keyword);

      completions.sort((a, b) => (
        a.match(keyword) && !b.match(keyword)
          ? -1
          : 1
      ));

      console.log(completions);
      completion = completions[0];

      // Or pull a random completion from the top ${RANKING_BATCH_SIZE}

      if (!completion) {
        completion = completions[
          (Math.random() * completions.length) << 0
        ];
      }

      // Handle no data

      if (!completion) {
        return "I'm not able to respond to that coherently due to lack of training data.";
      }

      // Append completion
      // Example: "New York is considered to be the melting pot of the world."

      result = result.trim() + ` ${completion}`;

      return result;
    };

    // transform the input to the correct prompt

    query = query.replace(MATCH_PUNCTUATION, '');

    const answer = transform(query);

    // Format and return the answer

    return toSentenceCase(answer);
  };

  // Chat API (extends Language)

  return {
    ...languageModel,

    ask
  };
};