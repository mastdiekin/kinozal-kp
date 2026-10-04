import { CLASS, SELECTOR } from "./styles";
import { props } from "./props";
import { createPreloaderElement, wrap } from "./dom";
import { requestPage } from "./rating";
import { reGetRating } from "./toggle";

function createButton(a: HTMLAnchorElement): void {
	const button = document.createElement("button");
	button.className = CLASS.ratingButton;
	button.textContent = props.buttonText;
	button.dataset.url = a.href;
	button.setAttribute("title", props.requestText);
	a.parentNode!.appendChild(button);
	button.addEventListener("click", () => {
		if (!button.classList.contains(CLASS.static) || reGetRating) {
			const skipCache = button.classList.contains(CLASS.static); // повторное нажатие
			//отключаем кнопку
			button.disabled = true;
			a.appendChild(createPreloaderElement());
			return requestPage(button, a, skipCache);
		}
	});
}

function createWrapper(): void {
	const content = [...document.querySelectorAll<HTMLAnchorElement>(SELECTOR.topPageLinks)];
	content.forEach((a) => {
		wrap(a);
		createButton(a);
	});
}

export function initTopPageButtons(): void {
	createWrapper();
}
