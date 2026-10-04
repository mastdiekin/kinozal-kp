import { TextDecoder, TextEncoder } from "util";
import { resetGM } from "$";

// в окружении jsdom нет TextDecoder, а api.js использует его для windows-1251
Object.assign(globalThis, { TextDecoder, TextEncoder });

beforeEach(() => {
	resetGM();
});
