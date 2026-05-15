import base from './base.js';

export default [
    ...base,

    {
        files: ['**/*.{ts,tsx}'],

        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
        },
    },

    {
        ignores: [
            'eslint.config.js',
            'dist/**',
            'node_modules/**',
        ],
    },
];
