import { CLASS, svg } from "./styles";

export function wrap(toWrap, wrapper) {
    wrapper = wrapper || document.createElement("div");
    toWrap.parentNode.appendChild(wrapper);
    wrapper.classList.add(CLASS.wrapper);
    return wrapper.appendChild(toWrap);
}

export function createPreloaderElement() {
    const preloader = document.createElement("div");
    preloader.className = CLASS.preloader;
    preloader.innerHTML = svg;
    return preloader;
}