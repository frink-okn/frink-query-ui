/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  rules: {
    // This rule prevents name collisions between Vue components and standard HTML elements and built-in components.
    // https://eslint.vuejs.org/rules/no-reserved-component-names
    'vue/no-reserved-component-names': 'never',

    // This rule require component names to be always multi-word, preventing conflicts with existing and future HTML elements.
    // https://eslint.vuejs.org/rules/multi-word-component-names.html
    'vue/multi-word-component-names': 'never',
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
