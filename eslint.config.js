import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // 可根据需要添加规则
    }
  }
]

