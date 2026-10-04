import { GM_getValue, GM_listValues, GM_setValue, menuCommands } from "$";
import { getCachedRating, pruneExpiredCache, registerCacheMenu, setCachedRating } from "../src/cache";

const HOUR = 60 * 60 * 1000;
const url = (id, host = "kinozal.tv") => `https://${host}/details.php?id=${id}`;
const rating = { kp: "7.5", imdb: "7.3" };

let now;
beforeEach(() => {
	now = 1_700_000_000_000;
	jest.spyOn(Date, "now").mockImplementation(() => now);
});

describe("getCachedRating / setCachedRating", () => {
	test("возвращает сохранённое значение", () => {
		setCachedRating(url(1), rating);
		expect(getCachedRating(url(1))).toEqual(rating);
	});

	test("возвращает null, если записи нет", () => {
		expect(getCachedRating(url(1))).toBeNull();
	});

	test("ключ зависит от id раздачи, а не от домена", () => {
		setCachedRating(url(1, "kinozal.tv"), rating);
		expect(getCachedRating(url(1, "kinozal.guru"))).toEqual(rating);
	});

	test("разные раздачи хранятся отдельно", () => {
		setCachedRating(url(1), rating);
		expect(getCachedRating(url(2))).toBeNull();
	});

	test("по умолчанию запись живёт 24 часа", () => {
		setCachedRating(url(1), rating);

		now += 24 * HOUR - 1;
		expect(getCachedRating(url(1))).toEqual(rating);

		now += 1;
		expect(getCachedRating(url(1))).toBeNull();
	});

	test("учитывает время жизни из настроек", () => {
		GM_setValue("cacheTtlHours", 1);
		setCachedRating(url(1), rating);

		now += HOUR - 1;
		expect(getCachedRating(url(1))).toEqual(rating);

		now += 1;
		expect(getCachedRating(url(1))).toBeNull();
	});

	test("при 0 часов кэш не используется", () => {
		GM_setValue("cacheTtlHours", 0);
		setCachedRating(url(1), rating);
		expect(getCachedRating(url(1))).toBeNull();
	});

	test.each(["abc", -5])("некорректная настройка (%p) заменяется на 24 часа", (bad) => {
		GM_setValue("cacheTtlHours", bad);
		setCachedRating(url(1), rating);

		now += 23 * HOUR;
		expect(getCachedRating(url(1))).toEqual(rating);
	});
});

describe("pruneExpiredCache", () => {
	test("удаляет просроченные и повреждённые записи, остальное не трогает", () => {
		GM_setValue("rating:fresh", { time: now, value: rating });
		GM_setValue("rating:old", { time: now - 25 * HOUR, value: rating });
		GM_setValue("rating:broken", { value: rating }); // нет поля time
		GM_setValue("rating:empty", null);
		GM_setValue("showMainPageRating", false); // настройка, не кэш

		pruneExpiredCache();

		expect(GM_listValues().sort()).toEqual(["lastPruneTime", "rating:fresh", "showMainPageRating"]);
	});

	test("запускается не чаще раза в сутки", () => {
		pruneExpiredCache();

		GM_setValue("rating:old", { time: now - 100 * HOUR, value: rating });
		now += 23 * HOUR;
		pruneExpiredCache();
		expect(GM_listValues()).toContain("rating:old");

		now += 2 * HOUR; // с прошлой очистки прошло 25 часов
		pruneExpiredCache();
		expect(GM_listValues()).not.toContain("rating:old");
	});

	test("если часы ушли назад, очистка всё равно выполняется", () => {
		GM_setValue("lastPruneTime", now + 10 * HOUR);
		GM_setValue("rating:old", { time: now - 100 * HOUR, value: rating });

		pruneExpiredCache();

		expect(GM_listValues()).not.toContain("rating:old");
	});
});

describe("меню кэша", () => {
	const command = (part) => menuCommands.find((c) => c.name.includes(part));

	beforeEach(() => {
		jest.spyOn(window, "alert").mockImplementation(() => {});
		registerCacheMenu();
	});

	test("в названии пункта показано текущее время кэша", () => {
		expect(command("Время кэша").name).toBe("Время кэша рейтингов: 24 ч");
	});

	test("сохраняет введённое число часов, в том числе с запятой", () => {
		jest.spyOn(window, "prompt").mockReturnValue("6,5");

		command("Время кэша").fn();

		expect(GM_getValue("cacheTtlHours")).toBe(6.5);
		expect(window.alert).toHaveBeenCalled();
	});

	test("при отмене ничего не сохраняет", () => {
		jest.spyOn(window, "prompt").mockReturnValue(null);

		command("Время кэша").fn();

		expect(GM_getValue("cacheTtlHours")).toBeUndefined();
		expect(window.alert).not.toHaveBeenCalled();
	});

	test.each(["abc", "-1", ""])("некорректный ввод (%p) не сохраняется", (input) => {
		jest.spyOn(window, "prompt").mockReturnValue(input);

		command("Время кэша").fn();

		expect(GM_getValue("cacheTtlHours")).toBeUndefined();
		expect(window.alert).toHaveBeenCalledWith("Введите число не меньше нуля");
	});

	test("очистка удаляет рейтинги, но не настройки", () => {
		jest.spyOn(window, "confirm").mockReturnValue(true);
		setCachedRating(url(1), rating);
		setCachedRating(url(2), rating);
		GM_setValue("cacheTtlHours", 12);

		command("Очистить").fn();

		expect(GM_listValues()).toEqual(["cacheTtlHours"]);
	});

	test("если пользователь не подтвердил, кэш остаётся", () => {
		jest.spyOn(window, "confirm").mockReturnValue(false);
		setCachedRating(url(1), rating);

		command("Очистить").fn();

		expect(getCachedRating(url(1))).toEqual(rating);
	});

	test("пустой кэш: сообщает об этом и не спрашивает подтверждение", () => {
		jest.spyOn(window, "confirm").mockReturnValue(true);

		command("Очистить").fn();

		expect(window.alert).toHaveBeenCalledWith("Кэш уже пуст");
		expect(window.confirm).not.toHaveBeenCalled();
	});
});
