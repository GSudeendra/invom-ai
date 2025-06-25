const globals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  JSX: 'readonly',
  React: 'readonly',
  jest: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react: require('eslint-plugin-react'),
    },
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always']
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
  },
]; 