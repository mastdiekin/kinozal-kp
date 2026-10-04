import { CLASS } from "../src/styles";
import { props } from "../src/props";
import { getCachedRating, setCachedRating } from "../src/cache";
import { fetchRatings } from "../src/api";
import { requestPage } from "../src/rating";

jest.mock("../src/api", () => ({ fetchRatings: jest.fn() }));

const URL = "https://kinozal.tv/details.php?id=1";

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
	jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("requestPage", () => {
	test("берёт рейтинг из кэша и не обращается к сайту", async () => {
		setCachedRating(URL, { kp: "8.1", imdb: "7.9" });
		const { a, element } = makeBadge();

		await requestPage(element, a);

		expect(fetchRatings).not.toHaveBeenCalled();
		expect(element.textContent).toContain("КП: 8.1");
		expect(element.textContent).toContain("IMDb: 7.9");
		expect(element.classList.contains(CLASS.static)).toBe(true);
	});

	test("при промахе запрашивает сайт, показывает и кэширует результат", async () => {
		fetchRatings.mockResolvedValue({ kp: "7.5", imdb: "7.3" });
		const { a, element } = makeBadge();

		await requestPage(element, a);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(fetchRatings).toHaveBeenCalledWith(URL);
		expect(element.textContent).toContain("КП: 7.5");
		expect(getCachedRating(URL)).toEqual({ kp: "7.5", imdb: "7.3" });
	});

	test("skipCache игнорирует кэш и обновляет его", async () => {
		setCachedRating(URL, { kp: "1.0", imdb: "1.0" });
		fetchRatings.mockResolvedValue({ kp: "7.5", imdb: "7.3" });
		const { a, element } = makeButton();

		await requestPage(element, a, true);

		expect(fetchRatings).toHaveBeenCalledTimes(1);
		expect(element.textContent).toContain("КП: 7.5");
		expect(getCachedRating(URL)).toEqual({ kp: "7.5", imdb: "7.3" });
	});

	test("не кэширует результат, где нет ни одного рейтинга", async () => {
		fetchRatings.mockResolvedValue({ kp: "n/a", imdb: "n/a" });
		const { a, element } = makeBadge();

		await requestPage(element, a);

		expect(element.textContent).toContain("КП: n/a");
		expect(getCachedRating(URL)).toBeNull();
	});

	test("убирает прелоадер и снимает disabled с кнопки", async () => {
		fetchRatings.mockResolvedValue({ kp: "7.5", imdb: "7.3" });
		const { a, element } = makeButton();
		element.disabled = true;

		await requestPage(element, a);

		expect(a.querySelector(`.${CLASS.preloader}`)).toBeNull();
		expect(element.disabled).toBe(false);
	});
});

describe("ошибки", () => {
	test("на плашке главной показывает ошибку и делает её кликабельной", async () => {
		fetchRatings.mockRejectedValue(new Error("HTTP 503"));
		const { a, element } = makeBadge();

		await requestPage(element, a);

		expect(element.textContent).toBe(props.errorText);
		expect(element.classList.contains(CLASS.error)).toBe(true);
		expect(getCachedRating(URL)).toBeNull();
	});

	test("на кнопке в топе показывает ошибку без класса кликабельной плашки", async () => {
		fetchRatings.mockRejectedValue(new Error("HTTP 503"));
		const { a, element } = makeButton();

		await requestPage(element, a);

		expect(element.textContent).toBe(props.errorText);
		expect(element.classList.contains(CLASS.error)).toBe(false);
		expect(element.disabled).toBe(false);
	});

	test("не затирает уже показанный рейтинг", async () => {
		fetchRatings.mockRejectedValue(new Error("Failed to fetch"));
		const { a, element } = makeButton();
		element.classList.add(CLASS.static);
		element.textContent = "КП: 7.5";

		await requestPage(element, a, true);

		expect(element.textContent).toBe("КП: 7.5");
	});

	test("клик по плашке с ошибкой повторяет запрос", async () => {
		fetchRatings.mockRejectedValueOnce(new Error("HTTP 503")).mockResolvedValueOnce({ kp: "7.5", imdb: "7.3" });
		const { a, element } = makeBadge();

		await requestPage(element, a);
		element.click();
		await tick();

		expect(fetchRatings).toHaveBeenCalledTimes(2);
		expect(element.textContent).toContain("КП: 7.5");
		expect(element.classList.contains(CLASS.error)).toBe(false);
	});
});
