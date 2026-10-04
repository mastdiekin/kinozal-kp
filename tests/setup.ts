import { TextDecoder, TextEncoder } from "util";
import { resetGM } from "./gm-mock";

// в окружении jsdom нет TextDecoder, а api.ts использует его для windows-1251
Object.assign(globalThis, { TextDecoder, TextEncoder });

beforeEach(() => {
	resetGM();
});
