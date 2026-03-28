import EventEmitter from 'eventemitter3';
import type { BaseCredential } from './base-credential';
import { Cache } from './cache';
import { USER_AGENT } from './constants';
import fetch from './fetch';
import { RateLimiter } from './mutex';
import type { LeetCodeGraphQLQuery, LeetCodeGraphQLResponse } from './types';
import { parse_cookie } from './utils';

export abstract class BaseLeetCode extends EventEmitter {
	/**
	 * The credential this instance is using.
	 */
	public credential: BaseCredential;

	/**
	 * The internal cache.
	 */
	public cache: Cache;

	/**
	 * Used to ensure the instance is initialized.
	 */
	protected initialized: Promise<boolean>;

	/**
	 * Rate limiter
	 */
	public limiter = new RateLimiter();

	/**
	 * The base URL for API requests.
	 */
	protected abstract readonly baseUrl: string;

	constructor(
		credential: BaseCredential | null,
		createCredential: () => BaseCredential,
		cache: Cache,
	) {
		super();
		let initialize!: () => void;
		this.initialized = new Promise<boolean>((resolve) => {
			initialize = () => resolve(true);
		});

		this.cache = cache;

		if (credential) {
			this.credential = credential;
			setImmediate(() => initialize());
		} else {
			this.credential = createCredential();
			this.credential.init().then(() => initialize());
		}
	}

	/**
	 * Use GraphQL to query LeetCode API.
	 * @param query
	 * @param endpoint The GraphQL endpoint path. Default is `/graphql`.
	 * @returns
	 */
	public async graphql(
		query: LeetCodeGraphQLQuery,
		endpoint = '/graphql',
	): Promise<LeetCodeGraphQLResponse> {
		await this.initialized;

		const { cacheTime, headers: queryHeaders, ...queryBody } = query;

		if (cacheTime) {
			const cacheKey = JSON.stringify({
				query: queryBody.query,
				variables: queryBody.variables,
				endpoint,
			});
			const cached = this.cache.get(cacheKey);
			if (cached) {
				return cached as LeetCodeGraphQLResponse;
			}
		}

		await this.limiter.lock();
		try {
			const BASE = this.baseUrl;
			const res = await fetch(`${BASE}${endpoint}`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					origin: BASE,
					referer: BASE,
					cookie: `csrftoken=${this.credential.csrf || ''}; LEETCODE_SESSION=${
						this.credential.session || ''
					};`,
					'x-csrftoken': this.credential.csrf || '',
					'user-agent': USER_AGENT,
					...queryHeaders,
				},
				body: JSON.stringify(queryBody),
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}

			this.emit('receive-graphql', res);

			if (res.headers.has('set-cookie')) {
				const cookies = parse_cookie(res.headers.get('set-cookie') || '');

				if (cookies['csrftoken']) {
					this.credential.csrf = cookies['csrftoken'];
					this.emit('update-csrf', this.credential);
				}
			}

			const result = (await res.json()) as LeetCodeGraphQLResponse;

			if (cacheTime) {
				const cacheKey = JSON.stringify({
					query: queryBody.query,
					variables: queryBody.variables,
					endpoint,
				});
				this.cache.set(cacheKey, result, cacheTime);
			}

			return result;
		} finally {
			this.limiter.unlock();
		}
	}

	emit(event: 'receive-graphql', res: Response): boolean;
	emit(event: 'update-csrf', credential: BaseCredential): boolean;
	emit(event: string, ...args: unknown[]): boolean;
	emit(event: string, ...args: unknown[]): boolean {
		return super.emit(event, ...args);
	}

	on(event: 'receive-graphql', listener: (res: Response) => void): this;
	on(event: 'update-csrf', listener: (credential: BaseCredential) => void): this;
	on(event: string, listener: (...args: unknown[]) => void): this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(event: string, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	once(event: 'receive-graphql', listener: (res: Response) => void): this;
	once(event: 'update-csrf', listener: (credential: BaseCredential) => void): this;
	once(event: string, listener: (...args: unknown[]) => void): this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	once(event: string, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}
}
