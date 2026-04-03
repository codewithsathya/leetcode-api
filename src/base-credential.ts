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
			this.session = data.session;
			this.csrf = data.csrf;
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
		this.csrf = await this.fetchCsrf();
		if (session) this.session = session;
		return this;
	}
}
