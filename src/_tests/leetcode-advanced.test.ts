import dotenv from 'dotenv';
import { beforeAll, describe, expect, it } from 'vitest';
import { Cache } from '../cache';
import { Credential } from '../credential';
import { LeetCodeAdvanced } from '../leetcode-advanced';
import { SimilarQuestion } from '../leetcode-types';
import problemProperties from '../problem-properties';

describe('LeetCode Advanced', { timeout: 60_000 * 60 }, () => {
	describe('General', () => {
		it('should be an instance of LeetCodeAdvanced', () => {
			const lc = new LeetCodeAdvanced();
			expect(lc).toBeInstanceOf(LeetCodeAdvanced);
		});

		it('should be able to use user-specified cache', () => {
			const lc = new LeetCodeAdvanced(null, new Cache());
			expect(lc).toBeInstanceOf(LeetCodeAdvanced);
			expect(lc.cache).toBeInstanceOf(Cache);
		});
	});

	describe('Unauthenticated', () => {
		const lc = new LeetCodeAdvanced();
		lc.limiter.limit = 100;
		lc.limiter.interval = 3;
		lc.on('receive-graphql', async (res) => {
			await res.clone().json();
		});

		it('should be able to get company tags', async () => {
			const companyTags = await lc.companyTags();
			expect(companyTags.length).toBeGreaterThan(0);
		});

		it('should be able to get problem types', async () => {
			const problemTypes = await lc.getProblemTypes();
			expect(Object.keys(problemTypes).length).toBeGreaterThan(3000);
		});

		it('should be able to get topic tags', async () => {
			const topicTags = await lc.topicTags();
			expect(Object.keys(topicTags).length).toBeGreaterThan(3000);
			expect(topicTags['1'].length).greaterThanOrEqual(2);
		});

		it('should be able to get leetcode problems', async () => {
			let count = 0;
			const problems = await lc.getLeetcodeProblems(500, (problems) => {
				count = problems.length;
			});
			expect(problems.length).toBeGreaterThan(3000);
			expect(count).greaterThan(3000);
			expect(problems[0].similarQuestions as SimilarQuestion[]).toBeTypeOf('object');
			expect((problems[0].similarQuestions as SimilarQuestion[]).length).toBeGreaterThan(0);
		});

		it('should be able to get problems with property', async () => {
			const problemProperty = problemProperties.filter(
				({ property }) => property === 'titleSlug',
			)[0];
			const problems = await lc.problemsOfProperty(problemProperty);
			expect(problems.length).toBeGreaterThan(3000);
		});

		it('should be able to get problems with requests chunked', async () => {
			const problemProperty = problemProperties.filter(
				({ property }) => property === 'titleSlug',
			)[0];
			problemProperty.needRequestChunking = true;
			problemProperty.problemsPerRequest = 500;
			const problems = await lc.problemsOfProperty(problemProperty);
			expect(problems.length).toBeGreaterThan(3000);
		});

		it('should be able to get title slug question number mapping', async () => {
			const mapping = await lc.getTitleSlugQuestionNumberMapping();
			expect(Object.keys(mapping).length).toBeGreaterThan(3000);
		});

		it('should be able to get detailed problems', async () => {
			const problems = await lc.detailedProblems({
				category: '',
				offset: 0,
				limit: 10,
			});
			expect(problems.length).equals(10);
			expect(problems[0].questionFrontendId).toBeTruthy();
			expect(problems[0].title).toBeTruthy();
			expect(problems[0].difficulty).toBeTruthy();
		});
	});

	describe('Authenticated', () => {
		dotenv.config();
		const credential = new Credential();
		let lc: LeetCodeAdvanced;

		beforeAll(async () => {
			await credential.init(process.env['TEST_LEETCODE_SESSION']);
			lc = new LeetCodeAdvanced(credential);
		});

		it.skipIf(!process.env['TEST_LEETCODE_SESSION'])(
			'should be able to check whether easter is collected or not',
			async () => {
				const easterEggCollected = await lc.isEasterEggCollected();
				expect(easterEggCollected).toBeTruthy();
			},
		);

		it.skipIf(!process.env['TEST_LEETCODE_SESSION'])(
			'should be return false when collectEasterEgg which is already collected',
			async () => {
				const collected = await lc.collectEasterEgg();
				expect(collected).toBe(false);
			},
		);

		it.skipIf(!process.env['TEST_LEETCODE_SESSION'])(
			'should be able to checkin or throw error saying user already checked in',
			async () => {
				const checkedIn = await lc.checkIn();
				expect(checkedIn).toBe(false);
			},
		);

		it.skipIf(!process.env['TEST_LEETCODE_SESSION'])(
			'should be able to get recent submission',
			async () => {
				const recentSubmission = await lc.recentSubmission();
				expect(recentSubmission).not.toBeNull();
				expect(recentSubmission).toBeTruthy();
				expect(recentSubmission?.id).toBeGreaterThan(0);
			},
		);

		it.skipIf(!process.env['TEST_LEETCODE_SESSION'])(
			'should be able to get recent submission of a user',
			async () => {
				const recentSubmission = await lc.recentSubmissionOfUser('jacoblincool');
				expect(recentSubmission).not.toBeNull();
				expect(recentSubmission).toBeTruthy();
				expect(parseInt(recentSubmission?.id as string)).toBeGreaterThan(0);
			},
		);
	});
});
