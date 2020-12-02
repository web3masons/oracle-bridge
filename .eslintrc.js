module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {},
  globals: {
    ethers: 'readonly',
  },
}
