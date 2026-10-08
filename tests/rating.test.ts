import { CLASS } from "../src/styles";
import { props } from "../src/props";
import { getCachedRating, setCachedRating } from "../src/cache";
import { fetchRatings, parseRatings } from "../src/api";
import { getRatings, loadAndRenderRating } from "../src/rating";

jest.mock("../src/api", () => ({ fetchRatings: jest.fn(), parseRatings: jest.fn() }));

const fetchRatingsMock = fetchRatings as jest.MockedFunction<typeof fetchRatings>;
const parseRatingsMock = parseRatings as jest.MockedFunction<typeof parseRatings>;

const URL = "https://kinozal.guru/details.php?id=2128508";

// сайт отдаёт страницу, парсер достаёт из неё рейтинги
function mockSite(kp: string, imdb: string) {
	fetchRatingsMock.mockResolvedValue("<page>" as Awaited<ReturnType<typeof fetchRatings>>);
	parseRatingsMock.mockReturnValue({ kp, imdb });
}

// плашка на главной: div внутри ссылки
function makeBadge() {
	const a = document.createElement("a");
	const badge = document.createElement("div");
	badge.className = CLASS.ratingDiv;
	badge.dataset.url = URL;
	a.append(badge);
	return { a, element: badge };
}

// кнопка в топе: button рядом с ссылкой, прелоадер лежит внутри ссылки
function makeButton() {
	const a = document.createElement("a");
	const button = document.createElement("button");
	button.dataset.url = URL;
	const preloader = document.createElement("div");
	preloader.className = CLASS.preloader;
	a.append(button, preloader);
	return { a, element: button };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
	jest.resetAllMocks();
	localStorage.clear();
	jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("getRatings", () => {
	test("берёт рейтинг из кэша и не обращается к сайту", async () => {
		setCachedRating(URL, { kp: "8.1", imdb: "7.9" });

		const result = await getRatings(URL, false);

		expect(result).toEqual({ kp: "8.1", imdb: "7.9" });
		expect(fetchRatings).not.toHaveBeenCalled();
	});

	test("при промахе запрашивает сайт, возвращает и кэширует результат", async () => {
		mockSite("7.5", "7.3");

		const result = await getRatings(URL, false);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(fetchRatings).toHaveBeenCalledWith(URL);
		expect(result).toEqual({ kp: "7.5", imdb: "7.3" });
		expect(getCachedRating(URL)).toEqual({ kp: "7.5", imdb: "7.3" });
	});

	test("второй вызов берёт результат из кэша, а не из сети", async () => {
		mockSite("7.5", "7.3");

		await getRatings(URL, false);
		const second = await getRatings(URL, false);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(second).toEqual({ kp: "7.5", imdb: "7.3" });
	});

	test("skipCache игнорирует кэш и обновляет его", async () => {
		setCachedRating(URL, { kp: "1.0", imdb: "1.0" });
		mockSite("7.5", "7.3");

		const result = await getRatings(URL, true);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ kp: "7.5", imdb: "7.3" });
		expect(getCachedRating(URL)).toEqual({ kp: "7.5", imdb: "7.3" });
	});

	test("не кэширует результат, где нет ни одного рейтинга", async () => {
		mockSite(props.unknownRating, props.unknownRating);

		const result = await getRatings(URL, false);

		expect(result).toEqual({ kp: props.unknownRating, imdb: props.unknownRating });
		expect(getCachedRating(URL)).toBeNull();
	});

	test("кэширует результат, если найден хотя бы один рейтинг", async () => {
		mockSite("7.5", props.unknownRating);

		await getRatings(URL, false);

		expect(getCachedRating(URL)).toEqual({ kp: "7.5", imdb: props.unknownRating });
	});

	test("пробрасывает ошибку сети и ничего не кэширует", async () => {
		fetchRatingsMock.mockRejectedValue(new Error("HTTP 503"));

		await expect(getRatings(URL, false)).rejects.toThrow("HTTP 503");
		expect(getCachedRating(URL)).toBeNull();
	});
});

describe("loadAndRenderRating", () => {
	test("запрашивает рейтинг по url элемента и отрисовывает его", async () => {
		mockSite("7.5", "7.3");
		const { a, element } = makeBadge();

		await loadAndRenderRating(element, a);

		expect(fetchRatings).toHaveBeenCalledWith(URL);
		expect(element.textContent).toContain("КП: 7.5");
		expect(element.textContent).toContain("IMDb: 7.3");
		expect(element.title).toBe("Кинопоиск: 7.5, IMDb: 7.3");
		expect(element.classList.contains(CLASS.static)).toBe(true);
	});

	test("показывает рейтинг из кэша без запроса к сайту", async () => {
		setCachedRating(URL, { kp: "8.1", imdb: "7.9" });
		const { a, element } = makeBadge();

		await loadAndRenderRating(element, a);

		expect(fetchRatings).not.toHaveBeenCalled();
		expect(element.textContent).toContain("КП: 8.1");
	});

	test("skipCache игнорирует кэш и показывает свежий рейтинг", async () => {
		setCachedRating(URL, { kp: "1.0", imdb: "1.0" });
		mockSite("7.5", "7.3");
		const { a, element } = makeButton();

		await loadAndRenderRating(element, a, true);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(element.textContent).toContain("КП: 7.5");
	});

	test("убирает прелоадер и снимает disabled с кнопки", async () => {
		mockSite("7.5", "7.3");
		const { a, element } = makeButton();
		element.disabled = true;

		await loadAndRenderRating(element, a);

		expect(a.querySelector(`.${CLASS.preloader}`)).toBeNull();
		expect(element.disabled).toBe(false);
	});

	test("ничего не делает, если у элемента нет url", async () => {
		const { a, element } = makeBadge();
		delete element.dataset.url;

		await loadAndRenderRating(element, a);

		expect(fetchRatings).not.toHaveBeenCalled();
	});
});

describe("ошибки", () => {
	test("на плашке главной показывает ошибку и делает её кликабельной", async () => {
		fetchRatingsMock.mockRejectedValue(new Error("HTTP 503"));
		const { a, element } = makeBadge();

		await loadAndRenderRating(element, a);

		expect(element.textContent).toBe(props.errorText);
		expect(element.title).toBe(props.errorTitle);
		expect(element.classList.contains(CLASS.error)).toBe(true);
		expect(getCachedRating(URL)).toBeNull();
	});

	test("на кнопке в топе показывает ошибку без класса кликабельной плашки", async () => {
		fetchRatingsMock.mockRejectedValue(new Error("HTTP 503"));
		const { a, element } = makeButton();

		await loadAndRenderRating(element, a);

		expect(element.textContent).toBe(props.errorText);
		expect(element.classList.contains(CLASS.error)).toBe(false);
		expect(element.disabled).toBe(false);
	});

	test("не затирает уже показанный рейтинг", async () => {
		fetchRatingsMock.mockRejectedValue(new Error("Failed to fetch"));
		const { a, element } = makeButton();
		element.classList.add(CLASS.static);
		element.textContent = "КП: 7.5";

		await loadAndRenderRating(element, a, true);

		expect(element.textContent).toBe("КП: 7.5");
	});

	test("клик по плашке с ошибкой повторяет запрос", async () => {
		fetchRatingsMock
			.mockRejectedValueOnce(new Error("HTTP 503"))
			.mockResolvedValueOnce("<page>" as Awaited<ReturnType<typeof fetchRatings>>);
		parseRatingsMock.mockReturnValue({ kp: "7.5", imdb: "7.3" });
		const { a, element } = makeBadge();

		await loadAndRenderRating(element, a);
		element.click();
		await tick();

		expect(fetchRatings).toHaveBeenCalledTimes(2);
		expect(element.textContent).toContain("КП: 7.5");
		expect(element.classList.contains(CLASS.error)).toBe(false);
	});
});
