const baseUtils = require('next-token-prediction/utils');

module.exports = {
  ...baseUtils,

  toSentenceCase: string => (
    string.replace(string.charAt(0), string.charAt(0).toUpperCase())
  )
};
