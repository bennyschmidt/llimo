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
const MATCH_FIRST_WH = new RegExp(/WHO|WHAT|WHEN|HOW|WHERE|WHY/);
const MATCH_FIRST_WHERE = new RegExp(/WHERE/);
const MATCH_FIRST_WHY = new RegExp(/WHY/);
const MATCH_FIRST_MODAL = new RegExp(/IS|AM|ARE|WAS|HAS|HAVE|HAD|MUST|MAY|MIGHT|WERE|WILL|SHALL|CAN|COULD|WOULD|SHOULD|OUGHT|DOES|DID/);
const MATCH_FIRST_YOU = new RegExp(/YOU/);
const MATCH_FIRST_ARTICLE = new RegExp(/THE|AN/);
const MATCH_POS_FOCUS = new RegExp(/JJ|VBP|VBN/);
const POS_NOUN = "NN";
const POS_PROPER_NOUN = "NNP";
const POS_PRONOUN = "PRP"
const LOCATED = "located";
const BECAUSE = "because";
const HOW = "how";
const COME = "come";
const ARE = "are";
const YOU = "you";
const AM = "am";
const IT = "It";
const A = "A";
const I = "I";

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
    const tokens = query.split(' ');
    const firstWord = tokens[0].trim();
    const secondWord = tokens[1]?.trim?.() || '';
    const partsOfSpeech = getPartsOfSpeech(query);

    if (!partsOfSpeech?.length) return;

    let result = '';

    // Find proper noun

    let isPrevNNP = true;

    for (const part of partsOfSpeech) {
      if (part.pos === POS_PROPER_NOUN) {
        const properNoun = `${part.value} `;

        if (isPrevNNP) {
          result += prependArticle(query, properNoun);
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
        if (part.pos.match(POS_NOUN)) {
          const noun = `${part.value} `;

          if (isPrevNN) {
            result += prependArticle(query, noun);
          } else {
            result = prependArticle(query, noun);
          }

          isPrevNN = true;
        } else {
          isPrevNN = false;
        }
      }
    }

    // Find pronoun

    if (!result) {
      for (const part of partsOfSpeech) {
        if (part.pos.match(POS_PRONOUN)) {
          const pronoun = `${part.normal} `;

          result += pronoun;

          if (MATCH_FIRST_YOU.test(result.toUpperCase())) {
            return '';
          }
        }
      }
    }

    // Default noun

    if (!result) {
      result = IT;
    }

    if (
      result.trim().toUpperCase() === I ||
      firstWord === AM || secondWord === AM
    ) {
      result = YOU;
    }

    return result.trim();
  };

  const getPositionalPhrase = query => {
    const tokens = query.split(' ');
    const firstWord = tokens[0].trim();
    const secondWord = tokens[1]?.trim?.() || '';
    const partsOfSpeech = getPartsOfSpeech(query);

    if (!partsOfSpeech?.length) return '';

    let cursor = '';

    const isWhWord = MATCH_FIRST_WH.test(firstWord.toUpperCase());
    const isVerb = MATCH_FIRST_MODAL.test(firstWord.toUpperCase());

    if (isWhWord) {
      cursor = `${secondWord}`
    } else if (isVerb) {
      cursor = `${firstWord}`
    }

    if (firstWord === AM || secondWord === AM || secondWord === I) {
      cursor = ARE;
    }

    // If where, append "located"

    if (MATCH_FIRST_WHERE.test(firstWord.toUpperCase())) {
      cursor += ` ${LOCATED}`;
    }

    return cursor || '';
  };

  const getFocus = query => {
    const noun = getNounPhrase(query);
    const partsOfSpeech = getPartsOfSpeech(query.slice(query.indexOf(noun)));

    if (!partsOfSpeech?.length) return;

    const nextNoun = getNounPhrase(query.slice(query.indexOf(noun) + noun.length));

    if (nextNoun && nextNoun !== IT) {
      return nextNoun;
    }

    const word = partsOfSpeech.find(({ pos }) => pos.match(MATCH_POS_FOCUS))?.value;

    return word || '';
  };

  const prependArticle = (sequence, token) => {
    const leadingPhrase = sequence.slice(0, sequence.indexOf(token.trim()));
    const leadingWord = leadingPhrase.split(' ').filter(Boolean).pop();

    if (!leadingWord) {
      return token;
    }

    if (leadingWord === A || MATCH_FIRST_ARTICLE.test(leadingWord.toUpperCase())) {
      token = `${leadingWord} ${token}`;
    }

    return token;
  };

  /**
   * querify
   * Convert a raw input to a query
   */

  const querify = input => {
    const query = input.replace(MATCH_PUNCTUATION, '');
    const tokens = query.split(' ');

    let firstWord = tokens[0].trim();

    if (MATCH_FIRST_MODAL.test(firstWord.toUpperCase())) {
      return query;
    }

    // TODO: Route queries from natural language

    if (MATCH_FIRST_WH.test(firstWord.toUpperCase())) {
      const secondWord = tokens[1].trim();

      if (
        firstWord.toLowerCase() === HOW &&
        secondWord.toLowerCase() === COME
      ) {
        const thirdWord = tokens[2].trim();

        if (thirdWord === A || MATCH_FIRST_ARTICLE.test(thirdWord.toUpperCase())) {
          return querify(`Why is ${query.slice(9)}`);
        }

        return querify(`Why are ${query.slice(9)}`);
      }

      // TODO: Store Wh-word for focus context
      //       For now just return the whole query

      return query;
    }

    // TODO: Optimize router

    if (
      input.toLowerCase().slice(0, 8).trim() === 'show me' ||
      input.toLowerCase().slice(0, 8).trim() === 'tell me'
    ) {
      return querify(`What is ${query.slice(8)}`);
    }

    if (input.toLowerCase().slice(0, 9).trim() === 'identify') {
      return querify(`What is ${query.slice(9)}`);
    }

    if (input.toLowerCase().slice(0, 14).trim() === 'tell me about') {
      return querify(`What is ${query.slice(14)}`);
    }

    if (input.toLowerCase().slice(0, 17).trim() === 'talk to me about') {
      return querify(`What is ${query.slice(17)}`);
    }

    if (MATCH_FIRST_WH.test(query.toUpperCase())) {
      // TODO: Store preface for focus context
      //       For now just remove it

      const whWord = tokens[
        tokens.findIndex(token => MATCH_FIRST_WH.test(token.toUpperCase()))
      ];

      if (!whWord) return false;

      // TODO: If there's a noun in the preface,
      //       Replace the positional word with the
      //       noun for noun context

      const question = tokens.slice(tokens.indexOf(whWord)).join(' ').trim();

      console.log('PREFACE', question, '...');

      return querify(question);
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

    const nounPhrase = getNounPhrase(query).trim();
    const positionalPhrase = getPositionalPhrase(query).trim();

    if (!nounPhrase) {
      return "I'm not able to respond to questions about myself because I only train on external information.";
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

    const firstWord = query.split(' ')[0].trim();

    let completions, sample;

    console.log('COMPLETE', result.trim(), '...');

    sample = getCompletions(result.trim())?.completions;
    completions = sample && sample.filter(Boolean);

    // If none and not a location, fallback to just completing
    // the noun phrase

    if (!completions?.length && !MATCH_FIRST_WHERE.test(firstWord.toUpperCase())) {
      sample = getCompletions(nounPhrase)?.completions;
      completions = sample && sample.filter(Boolean);
      result = result.replace(positionalPhrase, '').trim();
      console.log('FALLBACK', nounPhrase, '...');

      // If none and the query is just 1 word, fallback to completing
      // the first word of the query

      if (!completions?.length && firstWord.trim() === query.trim()) {
        sample = getCompletions(firstWord)?.completions;
        completions = sample && sample.filter(Boolean);
        result = firstWord.trim();
        console.log('FALLBACK', firstWord, '...');
      }
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
      return "I don't know, sorry.";
    }

    // If why, append "because"

    if (MATCH_FIRST_WHY.test(firstWord.toUpperCase())) {
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
    // Handle insufficient input

    if (input.split(' ').length < 2) {
      return "Can you clarify or rephrase?";
    }

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