import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig(({ mode }) => ({
	plugins: [
		monkey({
			entry: "src/main.js",
			userscript: {
				name: "Рейтинг кинопоиска для kinozal.tv",
				namespace: pkg.repository.url,
				description: pkg.description,
				version: pkg.version,
				author: pkg.author.name,
				icon: "https://www.google.com/s2/favicons?sz=64&domain=kinozal.guru",
				license: pkg.license,
				match: [
					"*kinozal.tv/*",
					"*kinozal-tv.appspot.com/*",
					"*kinozal.me/*",
					"*kinozal.guru/*",
				],
			},
			build: {
				fileName: "kinozal_kp.user.js",
			},
		}),
	],
	build: {
		// npm run build - минифицированный файл
		// npm run build:readable - читаемый
		minify: mode !== "readable",
	},
}));