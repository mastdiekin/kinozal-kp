export class CloudflareChallengeError extends Error {
	constructor(public readonly url: string) {
		super("Cloudflare challenge");
		this.name = "CloudflareChallengeError";
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
