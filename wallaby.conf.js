module.exports = () => ({
  files: [
    'index.js',
      { pattern: '**/*.test.js', ignore: true }
  ],

  tests: [
    'index.test.js'
  ],

  env: {
    type: 'node',
    runner: 'node',
    params: {
      runner: '--harmony --trace-warnings'
    }
  },

  testFramework: 'jest'
});
