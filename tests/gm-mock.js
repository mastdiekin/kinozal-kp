// Мок виртуального модуля "$" из vite-plugin-monkey: хранилище GM_* в памяти.

const store = new Map();

// пункты меню, зарегистрированные через GM_registerMenuCommand: { name, fn }
export const menuCommands = [];

// значения сериализуются, как в настоящем GM_setValue
export const GM_getValue = (key, defaultValue) =>
	store.has(key) ? JSON.parse(store.get(key)) : defaultValue;

export const GM_setValue = (key, value) => {
	store.set(key, JSON.stringify(value));
};

export const GM_deleteValue = (key) => {
	store.delete(key);
};

export const GM_listValues = () => [...store.keys()];

export const GM_registerMenuCommand = (name, fn) => {
	menuCommands.push({ name, fn });
};

export const GM_addStyle = () => {};

export function resetGM() {
	store.clear();
	menuCommands.length = 0;
}
