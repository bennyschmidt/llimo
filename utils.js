const baseUtils = require('next-token-prediction/utils');

const Tagger = require('wink-pos-tagger');

// See: https://winkjs.org/wink-pos-tagger/

const tagger = Tagger();

const PARTS_OF_SPEECH_CODES = {
  CC:	"Coordinating conjunction",
  CD:	"Cardinal number",
  DT:	"Determiner",
  EX:	"Existential there",
  FW:	"Foreign word",
  IN:	"Preposition or subordinating conjunction",
  JJ:	"Adjective",
  JJR: "Adjective, comparative",
  JJS: "Adjective, superlative",
  LS: "List item marker",
  MD: "Modal",
  NN: "Noun, singular or mass",
  NNS: "Noun, plural",
  NNP: "Proper noun, singular",
  NNPS: "Proper noun, plural",
  PDT: "Predeterminer",
  POS: "Possessive ending",
  PRP: "Personal pronoun",
  PRP$: "Possessive pronoun",
  RB: "Adverb",
  RBR: "Adverb, comparative",
  RBS: "Adverb, superlative",
  RP: "Particle",
  SYM: "Symbol",
  TO: "to",
  UH: "Interjection",
  VB: "Verb, base form",
  VBD: "Verb, past tense",
  VBG: "Verb, gerund or present participle",
  VBN: "Verb, past participle",
  VBP: "Verb, non-3rd person singular present",
  VBZ: "Verb, 3rd person singular present",
  WDT: "Wh-determiner",
  WP: "Wh-pronoun",
  WP$: "Possessive wh-pronoun",
  WRB: "Wh-adverb"
};

module.exports = {
  ...baseUtils,

  getPartsOfSpeech: text => {
    const tags = tagger.tagSentence(text);
    const parts = [];

    for (const tag of tags) {
      const { pos } = tag;

      parts.push({
        ...tag,

        label: `${PARTS_OF_SPEECH_CODES[pos]}`
      });
    }

    return parts;
  },

  toSentenceCase: string => (
    string.replace(string.charAt(0), string.charAt(0).toUpperCase())
  )
};
