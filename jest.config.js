const {defaults} = require('jest-config');

module.exports = {
  bail: false,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  roots: ['src'],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  "coverageReporters": [
    "json-summary"
  ],
  verbose: true,
};