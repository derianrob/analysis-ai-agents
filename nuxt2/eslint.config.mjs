// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import * as tsParser from '@typescript-eslint/parser'
import * as vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'
import prettierPlugin from 'eslint-plugin-prettier'

export default withNuxt([
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        defineNuxtConfig: 'readonly',
      },
    },
    plugins: {
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // Reglas de Prettier
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          useTabs: false,
          trailingComma: 'es5',
          bracketSpacing: true,
          arrowParens: 'always',
          vueIndentScriptAndStyle: true,
        },
      ],

      // Reglas de Vue - Mejores prácticas
      'vue/script-setup-uses-vars': 'error', // Requiere que las variables en `script setup` se usen
      'vue/no-unused-vars': 'error', // Detecta variables no usadas en el script
      'vue/multi-word-component-names': 'off', // Desactiva la regla de nombres de componentes
      'vue/no-v-html': 'error',
      'vue/require-default-prop': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/html-indent': ['error', 2, { baseIndent: 1 }],
      // 'vue/singleline-html-element-content-newline': 'error',
      'vue/mustache-interpolation-spacing': ['error', 'always'],
      'vue/no-multiple-template-root': 'off',
      'vue/no-template-shadow': 'error',
      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION', // is, v-for, v-if, etc.
            'LIST_RENDERING', // v-for
            'CONDITIONALS', // v-if, v-else-if, v-else
            'RENDER_MODIFIERS', // v-once, v-pre
            'GLOBAL', // id, ref
            'UNIQUE', // key
            'TWO_WAY_BINDING', // v-model
            'OTHER_DIRECTIVES', // Custom directives
            'OTHER_ATTR', // src, alt, etc.
            'EVENTS', // @click, @submit
            'CONTENT', // innerHTML, textContent
          ],
        },
      ], // Enforce order of attributes
      'vue/order-in-components': [
        'error',
        {
          order: [
            'el',
            'name',
            'key',
            'parent',
            'functional',
            ['delimiters', 'comments'],
            ['components', 'directives', 'filters'],
            'extends',
            'mixins',
            ['provide', 'inject'],
            'ROUTER_GUARDS',
            'props',
            'propsData',
            'emits',
            'setup',
            'data',
            'computed',
            'methods',
            'watch',
            'LIFECYCLE_HOOKS',
            ['template', 'render'],
            'renderError',
          ],
        },
      ], // Ordena elementos dentro de componentes

      // Reglas adicionales para TypeScript
      // '@typescript-eslint/explicit-function-return-type': [
      //   'error',
      //   { allowExpressions: true },
      // ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
])
