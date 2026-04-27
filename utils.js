const { dirname } = require('path');
const __root = dirname(require.main.filename);
const fs = require('fs').promises;

const Tagger = require('wink-pos-tagger');

// See: https://winkjs.org/wink-pos-tagger/

const tagger = Tagger();

const partsOfSpeech = [
  'CC',
  'CD',
  'DT',
  'EX',
  'FW',
  'IN',
  'JJ',
  'JJR',
  'JJS',
  'LS',
  'MD',
  'NN',
  'NNS',
  'NNP',
  'NNPS',
  'PDT',
  'POS',
  'PRP',
  'PRP$',
  'RB',
  'RBR',
  'RBS',
  'RP',
  'SYM',
  'TO',
  'UH',
  'VB',
  'VBD',
  'VBG',
  'VBN',
  'VBP',
  'VBZ',
  'WDT',
  'WP',
  'WP$',
  'WRB'
];

module.exports = {
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&',
  vowels: 'aeiou',
  y: 'y',
  x: 'x',
  w: 'w',
  k: 'k',
  j: 'j',

  partsOfSpeech,

  getPartsOfSpeech: text => (
    tagger.tagSentence(text)
  ),

  isLowerCase: letter => (
    letter === letter.toLowerCase() &&
    letter !== letter.toUpperCase()
  ),

  toSentenceCase: string => (
    string.replace(string.charAt(0), string.charAt(0).toUpperCase())
  ),

  tokenize: input => (
    input
      .trim()
      .replace(/[\p{P}$+<=>^`(\\\n)|~]/gu, ' ')
      .split(' ')
  )
};
