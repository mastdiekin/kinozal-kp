import { GM_deleteValue, GM_getValue, GM_listValues, GM_registerMenuCommand, GM_setValue } from "$";
import type { CacheEntry, Ratings } from "./types";

const DEFAULT_CACHE_TTL_HOURS = 24; //время хранения рейтинга в кэше по умолчанию
const CACHE_PREFIX = "rating:"; //префикс ключей кэша, по нему отличаем кэш от настроек
const PRUNE_INTERVAL = 24 * 60 * 60 * 1000; //как часто чистить просроченные записи (раз в сутки)

function cacheKey(url: string): string {
	try {
		const id = new URL(url).searchParams.get("id");
		return CACHE_PREFIX + (id || url);
	} catch {
		return CACHE_PREFIX + url;
	}
}

function getCacheKeys(): string[] {
	return GM_listValues().filter((key) => key.startsWith(CACHE_PREFIX));
}

function getCacheTtlHours(): number {
	const hours = Number(GM_getValue<number>("cacheTtlHours", DEFAULT_CACHE_TTL_HOURS));
	return Number.isFinite(hours) && hours >= 0 ? hours : DEFAULT_CACHE_TTL_HOURS;
}

export function getCachedRating(url: string): Ratings | null {
	const entry = GM_getValue<CacheEntry | undefined>(cacheKey(url));
	const ttl = getCacheTtlHours() * 60 * 60 * 1000;
	return entry && Date.now() - entry.time < ttl ? entry.value : null;
}

export function setCachedRating(url: string, value: Ratings): void {
	const entry: CacheEntry = { time: Date.now(), value };
	GM_setValue(cacheKey(url), entry);
}

// удаляет просроченные и повреждённые записи, не чаще раза в PRUNE_INTERVAL
export function pruneExpiredCache(): void {
	const elapsed = Date.now() - Number(GM_getValue<number>("lastPruneTime", 0));
	if (elapsed >= 0 && elapsed < PRUNE_INTERVAL) return;

	const ttl = getCacheTtlHours() * 60 * 60 * 1000;
	getCacheKeys().forEach((key) => {
		const entry = GM_getValue<CacheEntry | undefined>(key);
		if (!entry || !entry.time || Date.now() - entry.time >= ttl) {
			GM_deleteValue(key);
		}
	});

	GM_setValue("lastPruneTime", Date.now());
}

// пункты меню Tampermonkey для управления кэшем
export function registerCacheMenu(): void {
	GM_registerMenuCommand(`Время кэша рейтингов: ${getCacheTtlHours()} ч`, () => {
		const input = prompt("Сколько часов хранить рейтинги в кэше? (0 — не кэшировать)", String(getCacheTtlHours()));
		if (input === null) return; // нажали отмену

		const hours = parseFloat(input.replace(",", "."));
		if (!Number.isFinite(hours) || hours < 0) {
			alert("Введите число не меньше нуля");
			return;
		}

		GM_setValue("cacheTtlHours", hours);
		alert(`Сохранено: ${hours} ч. Применится сразу, а название пункта обновится после перезагрузки страницы.`);
	});

	GM_registerMenuCommand("Очистить кэш рейтингов", () => {
		const keys = getCacheKeys();
		if (!keys.length) {
			alert("Кэш уже пуст");
			return;
		}
		if (!confirm(`Удалить сохранённые рейтинги (${keys.length} шт.)?`)) return;

		keys.forEach((key) => GM_deleteValue(key));
		alert("Кэш очищен. Уже показанные рейтинги на странице останутся до перезагрузки.");
	});
}
