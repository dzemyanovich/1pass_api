module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  root: true,
  rules: {
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false,
        },
      },
    ],
    'max-len': [ 'error', { code: 120 }],
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off',
    'arrow-parens': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-plusplus': 'warn',
    'no-bitwise': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    'import/no-import-module-exports': 'warn',
    'import/no-relative-packages': 'warn',
    'spaced-comment': 'warn',
    '@typescript-eslint/indent': 'warn',
  },
  ignorePatterns: [
    'lambda/dist',
  ],
};
