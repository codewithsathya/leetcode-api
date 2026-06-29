import type { ICredential } from './types';

export abstract class BaseCredential implements ICredential {
	/**
	 * The authentication session.
	 */
	public session?: string;

	/**
	 * The csrf token.
	 */
	public csrf?: string;

	constructor(data?: ICredential) {
		if (data) {
			this.session = clean(data.session);
			this.csrf = clean(data.csrf);
		}
	}

	/**
	 * Fetch the CSRF token from the respective LeetCode endpoint.
	 */
	protected abstract fetchCsrf(): Promise<string | undefined>;

	/**
	 * Init the credential with or without leetcode session cookie.
	 * @param session
	 * @returns
	 */
	public async init(session?: string): Promise<this> {
		this.csrf = clean(await this.fetchCsrf());
		if (session) this.session = clean(session);
		return this;
	}
}

// ponytail: cookie tokens are printable ASCII; strip any char illegal in an HTTP header
// value (whitespace, control chars, stray unicode like a copy-pasted "…") so a bad
// .env value fails auth gracefully instead of crashing node-fetch with a TypeError.
function clean(value?: string): string | undefined {
	return value?.replace(/[^\t\x20-\x7e\x80-\xff]/g, '');
}
