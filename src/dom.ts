import { CLASS, svg } from "./styles";

export function wrap<T extends HTMLElement>(toWrap: T, wrapper?: HTMLElement): T {
	const target = wrapper ?? document.createElement("div");
	toWrap.parentNode!.appendChild(target);
	target.classList.add(CLASS.wrapper);
	return target.appendChild(toWrap);
}

export function createPreloaderElement(): HTMLDivElement {
	const preloader = document.createElement("div");
	preloader.className = CLASS.preloader;
	preloader.innerHTML = svg;
	return preloader;
}
