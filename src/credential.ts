import { BaseCredential } from './base-credential';
import { BASE_URL, USER_AGENT } from './constants';
import fetch from './fetch';
import { parse_cookie } from './utils';

class Credential extends BaseCredential {
	protected async fetchCsrf(): Promise<string | undefined> {
		const cookies_raw = await fetch(BASE_URL, {
			headers: {
				'user-agent': USER_AGENT,
			},
		}).then((res) => res.headers.get('set-cookie'));
		if (!cookies_raw) {
			return undefined;
		}

		const csrf_token = parse_cookie(cookies_raw).csrftoken;
		return csrf_token;
	}
}

export default Credential;
export { Credential };
