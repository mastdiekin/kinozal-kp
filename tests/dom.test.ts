import { CLASS } from "../src/styles";
import { createPreloaderElement, wrap } from "../src/dom";

// родитель с дочерними ссылками, как блок со списком раздач
function makeParent(count = 3) {
	const parent = document.createElement("div");
	const links = Array.from({ length: count }, (_, i) => {
		const a = document.createElement("a");
		a.textContent = `link-${i + 1}`;
		parent.append(a);
		return a;
	});
	return { parent, links };
}

describe("wrap", () => {
	test("кладёт элемент в обёртку с нужным классом и возвращает его", () => {
		const { parent, links } = makeParent(1);

		const result = wrap(links[0]);

		expect(result).toBe(links[0]);
		expect(links[0].parentElement!.classList.contains(CLASS.wrapper)).toBe(true);
		expect(links[0].parentElement!.parentElement).toBe(parent);
	});

	test("по умолчанию создаёт div", () => {
		const { links } = makeParent(1);

		wrap(links[0]);

		expect(links[0].parentElement!.tagName).toBe("DIV");
	});

	test("использует переданную обёртку и добавляет ей класс", () => {
		const { links } = makeParent(1);
		const custom = document.createElement("section");

		wrap(links[0], custom);

		expect(links[0].parentElement).toBe(custom);
		expect(custom.classList.contains(CLASS.wrapper)).toBe(true);
	});

	test("ставит обёртку в конец родителя, а не на место элемента (так работает исходный код)", () => {
		const { parent, links } = makeParent(3);

		wrap(links[0]);

		expect(parent.children[0]).toBe(links[1]);
		expect(parent.children[1]).toBe(links[2]);
		expect(parent.children[2].contains(links[0])).toBe(true);
	});

	test("если оборачивать ссылки по очереди, порядок сохраняется", () => {
		const { parent, links } = makeParent(3);

		links.forEach((a) => wrap(a));

		const order = [...parent.children].map((wrapper) => wrapper.firstElementChild);
		expect(order).toEqual(links);
	});
});

describe("createPreloaderElement", () => {
	test("создаёт div с классом прелоадера и svg внутри", () => {
		const preloader = createPreloaderElement();

		expect(preloader.tagName).toBe("DIV");
		expect(preloader.classList.contains(CLASS.preloader)).toBe(true);
		expect(preloader.querySelector("svg")).not.toBeNull();
	});

	test("каждый раз возвращает новый элемент", () => {
		expect(createPreloaderElement()).not.toBe(createPreloaderElement());
	});
});
