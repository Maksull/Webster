import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'prettier'
  ),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'prettier/prettier': ['error', {
        printWidth: 80,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 4,
        semi: true,
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'auto',
        importOrderSeparation: false,
        importOrderSortSpecifiers: true,
        singleAttributePerLine: false,
        parser: 'typescript',
        bracketSameLine: true,
        proseWrap: 'preserve',
        embeddedLanguageFormatting: 'off'
      }],
    },
    plugins: {
      prettier: prettier
    },
  },
];

export default eslintConfig;
