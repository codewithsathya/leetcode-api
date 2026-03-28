import { BaseCredential } from './base-credential';
import { BASE_URL_CN, USER_AGENT } from './constants';
import fetch from './fetch';
import { parse_cookie } from './utils';

class CredentialCN extends BaseCredential {
	protected async fetchCsrf(): Promise<string | undefined> {
		const res = await fetch(`${BASE_URL_CN}/graphql/`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'user-agent': USER_AGENT,
			},
			body: JSON.stringify({
				operationName: 'nojGlobalData',
				variables: {},
				query: 'query nojGlobalData {\n  siteRegion\n  chinaHost\n  websocketUrl\n}\n',
			}),
		});
		const cookies_raw = res.headers.get('set-cookie');
		if (!cookies_raw) {
			return undefined;
		}

		const csrf_token = parse_cookie(cookies_raw).csrftoken;
		return csrf_token;
	}
}

export default CredentialCN;
export { CredentialCN };
