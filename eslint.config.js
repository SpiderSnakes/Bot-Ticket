import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      // Interdiction des embeds classiques : on force l'usage des Components V2
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'discord.js',
              importNames: ['EmbedBuilder', 'MessageEmbed'],
              message:
                "On n'utilise pas les embeds classiques : utiliser les Components V2 (ContainerBuilder, SectionBuilder, etc.).",
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: '*',
          property: 'embeds',
          message:
            "Ne pas utiliser la propriété 'embeds' : utiliser les Components V2 et le flag MessageFlags.IsComponentsV2.",
        },
      ],
    },
  },
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];

