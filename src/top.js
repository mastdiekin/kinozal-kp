import { CLASS, SELECTOR } from "./styles";
import { props } from "./props";
import { createPreloaderElement, wrap } from "./dom";
import { requestPage } from "./rating";
import { reGetRating } from "./toggle";

function createButton(a) {
	let button = document.createElement("button");
	button.className = CLASS.ratingButton;
	button.textContent = props.buttonText;
	button.dataset.url = a.href;
	button.setAttribute("title", props.requestText);
	a.parentNode.appendChild(button);
	button.addEventListener("click", function (e) {
		if (!this.classList.contains(CLASS.static) || reGetRating) {
			const skipCache = this.classList.contains(CLASS.static); // повторное нажатие
			//отключаем кнопку
			e.target.disabled = true;
			a.appendChild(createPreloaderElement());
			return requestPage(e.target, a, skipCache);
		}
	});
}

function createWrapper() {
	const content = [...document.querySelectorAll(SELECTOR.topPageLinks)];
	content.forEach((a) => {
		wrap(a);
		createButton(a);
	});
}

export function initTopPageButtons() {
	createWrapper();
}
