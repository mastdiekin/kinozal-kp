import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist/", "coverage/", ".vscode"]),

	js.configs.recommended,
	tseslint.configs.recommended,

	{
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
		},
	},

	// код юзерскрипта работает в браузере
	{
		files: ["src/**/*.ts"],
		languageOptions: { globals: globals.browser },
	},

	// тесты: jsdom + jest
	{
		files: ["tests/**/*.ts"],
		languageOptions: {
			globals: { ...globals.browser, ...globals.jest },
		},
		rules: {
			// в моках и тестовых хелперах any допустим
			"@typescript-eslint/no-explicit-any": "off",
		},
	},

	{
		files: ["*.config.{js,cjs,ts}"],
		languageOptions: { globals: globals.node },
		rules: { "@typescript-eslint/no-require-imports": "off" },
	},
]);
