import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import typescript from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const nodeGlobals = {
    console: 'readonly',
    process: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    setImmediate: 'readonly',
    clearImmediate: 'readonly',
    global: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    Buffer: 'readonly',
    module: 'readonly',
    require: 'readonly',
};

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**']
    },
    eslint.configs.recommended,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: typescript,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
                ecmaVersion: 2022,
            },
            globals: {
                ...nodeGlobals,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'prettier': prettierPlugin,
        },
        rules: {
            ...tseslint.configs['recommended'].rules,
            ...prettierPlugin.configs.recommended.rules,
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'prettier/prettier': [
                'error',
                {
                    'printWidth': 160,
                    'singleQuote': true,
                    'trailingComma': 'all',
                    'tabWidth': 4,
                    'semi': true,
                    'bracketSpacing': true,
                    'arrowParens': 'avoid',
                    'endOfLine': 'auto',
                    'importOrderSeparation': false,
                    'importOrderSortSpecifiers': true,
                    'singleAttributePerLine': false,
                    'parser': 'typescript',
                    'bracketSameLine': true,
                    'proseWrap': 'preserve',
                    'embeddedLanguageFormatting': 'off'
                }
            ],
        },
    },
    prettierConfig,
];