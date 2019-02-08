'use strict';

// Inspired at https://github.com/akameco/jest-yaml-transform/blob/master/index.js
// But without flattening the json and without json compatibility mode

const yaml = require('js-yaml');

module.exports = {
  process(src) {
    const json = yaml.safeLoad(src);
    return `module.exports = ${JSON.stringify(json)};`;
  },
};
