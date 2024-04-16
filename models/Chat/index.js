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
const MATCH_ARTICLES = new RegExp(/the|an/g);
const MATCH_WH_REGULAR = new RegExp(/WHO|WHAT|WHEN|HOW/g);
const MATCH_WHERE = new RegExp(/WHERE/g);
const MATCH_WHY = new RegExp(/WHY/g);
const MATCH_MODAL_REGULAR = new RegExp(/IS|ARE|WAS|HAS|HAVE|HAD|MUST|MAY|MIGHT|WERE|WILL|SHALL|CAN|COULD|WOULD|SHOULD|OUGHT/g);
const MATCH_MODAL_DOES = new RegExp(/DOES/g);
const MATCH_MODAL_DID = new RegExp(/DID/g);
const LOCATED = "located";
const BECAUSE = "because";

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
    const tokens = query.split(' ');
    const firstWord = tokens[0].trim();
    const secondWord = tokens[1]?.trim?.() || '';
    const partsOfSpeech = getPartsOfSpeech(query);

    if (!partsOfSpeech?.length) return;

    let cursor = secondWord;

    // If where, append "located"

    if (MATCH_WHERE.test(firstWord.toUpperCase())) {
      cursor += ` ${LOCATED}`;
    }

    return cursor || '';
  };

  const getFocus = query => {
    const noun = getNounPhrase(query);
    const partsOfSpeech = getPartsOfSpeech(query.slice(query.indexOf(noun)));

    console.log(partsOfSpeech);

    if (!partsOfSpeech?.length) return;

    const nextNoun = getNounPhrase(query.slice(query.indexOf(noun) + noun.length));

    if (nextNoun && nextNoun !== 'It') {
      return nextNoun;
    }

    const word = partsOfSpeech.find(({ pos }) => pos.match(/JJ|VBP|VBN/))?.value;

    return word || '';
  };

  const prependArticle = (sequence, token) => {
    const leadingPhrase = sequence.slice(0, sequence.indexOf(token.trim()));
    const leadingWord = leadingPhrase.split(' ').filter(Boolean).pop();

    if (leadingWord === 'a' || leadingWord.toUpperCase().match(MATCH_ARTICLES)) {
      token = `${leadingWord} ${token}`;
    }

    return token;
  };

  /**
   * querify
   * Convert a raw input to a query
   */

  const querify = input => {
    const tokens = input.split(' ');
    const query = input.replace(MATCH_PUNCTUATION, '');

    let firstWord = tokens[0].trim();

    if (
      MATCH_MODAL_REGULAR.test(firstWord) ||
      MATCH_MODAL_DOES.test(firstWord) ||
      MATCH_MODAL_DID.test(firstWord)
    ) {
      return query;
    }

    if (
      MATCH_WH_REGULAR.test(firstWord) ||
      MATCH_WHERE.test(firstWord) ||
      MATCH_WHY.test(firstWord)
    ) {
      // TODO: Store Wh-word for focus context
      //       For now just return the whole query

      return query;
    }

    if (
      MATCH_WH_REGULAR.test(query) ||
      MATCH_WHERE.test(query) ||
      MATCH_WHY.test(query)
    ) {
      // TODO: Store preface for focus context
      //       For now just remove it

      const whWord = (
        query.indexOf(MATCH_WH_REGULAR) ||
        query.indexOf(MATCH_WHERE) ||
        query.indexOf(MATCH_WHY)
      );

      if (!whWord) return false;

      // TODO: If there's a noun in the preface,
      //       Replace the positional word with the
      //       noun for noun context

      return querify(query.slice(whWord).trim());
    }

    return query;
  };

  /**
   * transform
   * Transform a prompt to an answer
   */

  const transform = query => {
    if (!query) return;

    const { getCompletions } = languageModel;

    // Example query: "is New York considered a melting pot?"

    const firstWord = query.split(' ')[0].trim();
    const nounPhrase = getNounPhrase(query).trim();
    const positionalPhrase = getPositionalPhrase(query).trim();

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

    const keyword = (getFocus(query) || '').trim();

    let completion = '';

    const matchedPhrases = completions.filter(phrase => keyword && phrase.match(keyword));
    const isMatch = !!matchedPhrases?.length;

    console.log('MATCH', keyword, isMatch);

    if (isMatch) {
      // Filter to keyword matches

      completions = matchedPhrases;
    }

    // Pull a ranked completion from the top ${RANKING_BATCH_SIZE}

    completion = completions[
      (Math.random() * completions.length) << 0
    ];

    console.log(completions);

    // Handle no data

    if (!completion) {
      return "I'm not able to respond to that coherently due to lack of training data.";
    }

    // If why, append "because"

    if (MATCH_WHY.test(firstWord.toUpperCase())) {
      result += ` ${keyword} ${BECAUSE}`;
    }

    // Append completion
    // Example: "New York is considered to be the melting pot of the world."

    result = result.trim() + ` ${completion}`;

    return result;
  };

  /**
   * ask
   * Question/answer transformer
   */

  const ask = input => {
    if (!input) return;

    // Convert the user input to a query

    const query = querify(input);

    if (!query) {
      return "I can't respond to commands yet.";
    }

    // Transform the query to an answer

    const answer = transform(query);

    // Format and return the answer

    return answer && toSentenceCase(answer);
  };

  // Chat API (extends Language)

  return {
    ...languageModel,

    ask
  };
};