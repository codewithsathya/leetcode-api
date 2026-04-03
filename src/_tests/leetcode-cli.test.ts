import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { PROBLEM_CATEGORIES } from '../constants';
import { LeetCodeCLI } from '../leetcode-cli';

dotenv.config();

describe('LeetCodeCLI', { timeout: 30_000 }, () => {
	describe('categoryProblems', () => {
		const cli = new LeetCodeCLI();
		cli.limiter.limit = 100;
		cli.limiter.interval = 3;

		it('should return problems with correct category for algorithms', async () => {
			const problems = await cli.categoryProblems('algorithms');
			expect(problems.length).toBeGreaterThan(0);
			expect(problems[0].category).toBe('algorithms');
			expect(problems[0].fid).toBeGreaterThan(0);
			expect(problems[0].name).toBeTruthy();
			expect(problems[0].slug).toBeTruthy();
			expect(problems[0].level).toMatch(/Easy|Medium|Hard|Unknown/);
		});

		it('should return problems with correct category for database', async () => {
			const problems = await cli.categoryProblems('database');
			expect(problems.length).toBeGreaterThan(0);
			expect(problems[0].category).toBe('database');
		});

		it('should return problems with correct category for each category', async () => {
			for (const cat of PROBLEM_CATEGORIES) {
				const problems = await cli.categoryProblems(cat);
				expect(problems.length).toBeGreaterThan(0);
				for (const p of problems.slice(0, 3)) {
					expect(p.category).toBe(cat);
				}
			}
		});
	});

	describe('allCategoryProblems', () => {
		const cli = new LeetCodeCLI();
		cli.limiter.limit = 100;
		cli.limiter.interval = 3;

		it('should return problems from all categories with correct category field', async () => {
			const problems = await cli.allCategoryProblems();
			expect(problems.length).toBeGreaterThan(0);

			const categories = new Set(problems.map((p) => p.category));
			for (const cat of PROBLEM_CATEGORIES) {
				expect(categories.has(cat)).toBe(true);
			}

			// Every problem should have a non-empty category
			for (const p of problems) {
				expect(p.category).toBeTruthy();
				expect(PROBLEM_CATEGORIES).toContain(p.category);
			}
		});
	});
});
