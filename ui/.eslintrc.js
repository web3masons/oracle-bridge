module.exports = {
  env: {
    browser: true
  },
  extends: ['plugin:react/recommended', 'airbnb', 'nextjs'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    'no-use-before-define': [0],
    'new-cap': [0],
    'no-await-in-loop': [0],
    'no-alert': [0]
  }
};
