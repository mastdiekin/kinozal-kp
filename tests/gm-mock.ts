// Мок виртуального модуля "$" из vite-plugin-monkey: хранилище GM_* в памяти.

const store = new Map<string, string>();

interface MenuCommand {
	name: string;
	fn: () => void;
}

// пункты меню, зарегистрированные через GM_registerMenuCommand: { name, fn }
export const menuCommands: MenuCommand[] = [];

// значения сериализуются, как в настоящем GM_setValue
export const GM_getValue = <T = any>(key: string, defaultValue?: T): T =>
	store.has(key) ? (JSON.parse(store.get(key)!) as T) : (defaultValue as T);

export const GM_setValue = (key: string, value: unknown): void => {
	store.set(key, JSON.stringify(value));
};

export const GM_deleteValue = (key: string): void => {
	store.delete(key);
};

export const GM_listValues = (): string[] => [...store.keys()];

export const GM_registerMenuCommand = (name: string, fn: () => void): void => {
	menuCommands.push({ name, fn });
};

export const GM_addStyle = (_css: string): void => {};

export function resetGM(): void {
	store.clear();
	menuCommands.length = 0;
}
