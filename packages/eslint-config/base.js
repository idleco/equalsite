import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: process.cwd(),
            },
        },
        rules: {
            /** General */
            'no-console': 'off',
            'no-debugger': 'warn',
            // 'no-duplicate-imports': 'error',
            'no-unreachable': 'error',
            'prefer-const': 'error',
            'object-shorthand': ['error', 'always'],
            /** Typescript */
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/ban-ts-comment': [
                'warn',
                {
                    'ts-ignore': 'allow-with-description',
                },
            ],
            /** Code Quality */
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'dot-notation': 'error',
            /** Imports */
            'sort-imports': [
                'warn',
                {
                    ignoreDeclarationSort: true,
                },
            ],
            /** Disabled Noisy Rules */
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
        },
    },

    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '.turbo/**',
            'coverage/**',

            '*.config.js',
            '*.config.ts',

            'eslint.config.js',
        ],
    },
];
