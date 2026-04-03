import { describe, expect, it } from 'vitest';
import { Cache } from '../cache';
import { LeetCodeCN } from '../leetcode-cn';

describe('LeetCodeCN', { timeout: 15_000 }, () => {
	describe('General', () => {
		it('should be an instance of LeetCodeCN', () => {
			const lc = new LeetCodeCN();
			expect(lc).toBeInstanceOf(LeetCodeCN);
		});

		it('should be able to use user-specified cache', () => {
			const lc = new LeetCodeCN(null, new Cache());
			expect(lc).toBeInstanceOf(LeetCodeCN);
			expect(lc.cache).toBeInstanceOf(Cache);
		});
	});

	describe('Unauthenticated', () => {
		const lc = new LeetCodeCN();
		lc.on('receive-graphql', async (res) => {
			await res.clone().json();
		});

		it('should be able to get user profile', async () => {
			const user = await lc.user('leetcode');
			expect(user.userProfilePublicProfile).toBeTruthy();
			expect(user.userProfilePublicProfile.username.toLowerCase()).toBe('leetcode');
		});

		it('should be able to use graphql', async () => {
			const { data } = await lc.graphql({
				operationName: 'nojGlobalData',
				variables: {},
				query: `query nojGlobalData { siteRegion chinaHost websocketUrl }`,
			});
			expect(data.siteRegion).toBeTruthy();
		});
	});
});
