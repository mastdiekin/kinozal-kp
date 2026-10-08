import { readFileSync } from "fs";
import { join } from "path";
import { fetchRatings, parseRatings } from "../src/api";
import { CloudflareChallengeError } from "../src/errors";

// Реальный фрагмент страницы раздачи.
const detailsPage = readFileSync(join(__dirname, "fixtures", "details.html"), "utf-8");

// заменяет фрагмент и падает, если его в фикстуре не нашлось
function replaceOnce(html: string, from: string, to: string): string {
	if (!html.includes(from)) throw new Error(`В фикстуре нет фрагмента: ${from}`);
	return html.replace(from, to);
}

// убирает строки фикстуры, содержащие фрагмент
function withoutLine(html: string, part: string): string {
	const lines = html.split("\n");
	const result = lines.filter((line) => !line.includes(part));
	if (result.length === lines.length) throw new Error(`В фикстуре нет строки с: ${part}`);
	return result.join("\n");
}

// кодирует строку в windows-1251 (кириллица и ASCII, остальное считаем ошибкой теста)
function toWin1251(str: string): Uint8Array {
	return Uint8Array.from(str, (ch) => {
		const c = ch.charCodeAt(0);
		if (c < 0x80) return c;
		if (c >= 0x410 && c <= 0x44f) return c - 0x410 + 0xc0; // А-я
		if (c === 0x401) return 0xa8; // Ё
		if (c === 0x451) return 0xb8; // ё
		throw new Error(`Символ ${JSON.stringify(ch)} не поддерживается в toWin1251`);
	});
}

describe("parseRatings на реальной странице раздачи", () => {
	test("достаёт Кинопоиск и IMDb", () => {
		// не должен подхватывать Оценку сайта (7.5) и числа из ссылок (id раздачи, id фильма)
		expect(parseRatings(detailsPage)).toEqual({ kp: "7.7", imdb: "6.9" });
	});

	test("если IMDb на странице нет, возвращает n/a", () => {
		const html = withoutLine(detailsPage, "imdb.com/title");
		expect(parseRatings(html)).toEqual({ kp: "7.7", imdb: "n/a" });
	});

	test("если рейтингов нет вообще, возвращает n/a для обоих", () => {
		const html = withoutLine(withoutLine(detailsPage, "imdb.com/title"), 'film/7036356"');
		expect(parseRatings(html)).toEqual({ kp: "n/a", imdb: "n/a" });
	});

	test("если подпись есть, а числа нет, возвращает прочерк", () => {
		const html = replaceOnce(detailsPage, ">7.7<", "><");
		expect(parseRatings(html)).toEqual({ kp: "-", imdb: "6.9" });
	});

	test("понимает целый рейтинг без дробной части", () => {
		const html = replaceOnce(detailsPage, ">7.7<", ">10<");
		expect(parseRatings(html)).toEqual({ kp: "10", imdb: "6.9" });
	});

	test("бросает исключение, если списка рейтингов нет (например, капча)", () => {
		expect(() => parseRatings("<html><body><p>Введите капчу</p></body></html>")).toThrow("Не найден список рейтингов");
	});

	test("первый пункт списка не учитывается (на сайте это постер)", () => {
		const html = `<ul class="men w200"><li>Кинопоиск<span>9.9</span></li><li>IMDb<span>7.3</span></li></ul>`;
		expect(parseRatings(html)).toEqual({ kp: "n/a", imdb: "7.3" });
	});
});

describe("fetchRatings", () => {
	const url = "https://kinozal.tv/details.php?id=2147441";

	type MockInit = { ok?: boolean; status?: number; headers?: Record<string, string> };

	const response = (body: string, { headers = {}, ...init }: MockInit = {}) => ({
		ok: true,
		status: 200,
		headers: new Headers(headers),
		arrayBuffer: async () => toWin1251(body).buffer,
		...init,
	});

	test("декодирует windows-1251 и возвращает рейтинги", async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(response(detailsPage));

		await expect(fetchRatings(url)).resolves.toEqual({ kp: "7.7", imdb: "6.9" });
		expect(globalThis.fetch).toHaveBeenCalledWith(url, { credentials: "include" });
	});

	test("при HTTP-ошибке бросает исключение", async () => {
		jest.spyOn(console, "error").mockImplementation(() => {});
		globalThis.fetch = jest.fn().mockResolvedValue(response("Сервис недоступен", { ok: false, status: 503 }));

		await expect(fetchRatings(url)).rejects.toThrow("HTTP 503");
	});

	test("пробрасывает сетевую ошибку", async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

		await expect(fetchRatings(url)).rejects.toThrow("Failed to fetch");
	});

	describe("Cloudflare-челлендж", () => {
		test("определяет по заголовку cf-mitigated", async () => {
			globalThis.fetch = jest
				.fn()
				.mockResolvedValue(
					response("<html>что угодно</html>", { ok: false, status: 403, headers: { "cf-mitigated": "challenge" } }),
				);

			await expect(fetchRatings(url)).rejects.toBeInstanceOf(CloudflareChallengeError);
		});

		test.each([
			["Just a moment", "<html><head><title>Just a moment...</title></head></html>"],
			["Attention Required", "<html><head><title>Attention Required! | Cloudflare</title></head></html>"],
			["cf-chl-opt", "<html><script>window._cf_chl_opt = {};</script></html>"],
			["cf-browser-verification", '<html><div id="cf-browser-verification"></div></html>'],
			["Checking your browser", "<html><body>Checking your browser before accessing</body></html>"],
		])("определяет по телу страницы: %s", async (_name, body) => {
			globalThis.fetch = jest.fn().mockResolvedValue(response(body, { ok: false, status: 503 }));

			await expect(fetchRatings(url)).rejects.toBeInstanceOf(CloudflareChallengeError);
		});

		test("челлендж с кодом 200 тоже распознаётся", async () => {
			globalThis.fetch = jest.fn().mockResolvedValue(response("<title>Just a moment...</title>"));

			await expect(fetchRatings(url)).rejects.toBeInstanceOf(CloudflareChallengeError);
		});

		test("заголовок cf-mitigated с другим значением не считается челленджем", async () => {
			globalThis.fetch = jest.fn().mockResolvedValue(response(detailsPage, { headers: { "cf-mitigated": "other" } }));

			await expect(fetchRatings(url)).resolves.toEqual({ kp: "7.7", imdb: "6.9" });
		});

		test("обычная HTTP-ошибка без признаков челленджа не превращается в CloudflareChallengeError", async () => {
			jest.spyOn(console, "error").mockImplementation(() => {});
			globalThis.fetch = jest.fn().mockResolvedValue(response("Сервис недоступен", { ok: false, status: 503 }));

			const promise = fetchRatings(url);
			await expect(promise).rejects.toThrow("HTTP 503");
			await expect(promise).rejects.not.toBeInstanceOf(CloudflareChallengeError);
		});
	});
});
