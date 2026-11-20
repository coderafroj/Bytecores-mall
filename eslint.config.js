import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": "off",
      "no-empty": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off"
    }
  },
  {
    // server-side files run on Node (Vercel functions / CLI scripts), not in the browser
    files: ['vite.config.js', 'api/**/*.js', 'scripts/**/*.{js,mjs}', 'update-schema.js', 'scratch/**/*.js', 'src/pos/sync/serverCore.js', 'src/pos/sync/appwriteRest.js', 'src/pos/sync/fakeAppwrite.js', 'src/pos/sync/*.test.js', 'src/pos/ui/layout.test.js', 'api/*.test.js'],
    languageOptions: { globals: globals.node },
  },
])
