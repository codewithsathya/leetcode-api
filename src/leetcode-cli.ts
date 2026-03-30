// src/leetcode-cli.ts
import { BASE_URL, PROBLEM_CATEGORIES, USER_AGENT } from './constants';
import fetch from './fetch';
import ADD_QUESTION_TO_FAVORITE from './graphql/add-question-to-favorite.graphql?raw';
import REMOVE_QUESTION_FROM_FAVORITE from './graphql/remove-question-from-favorite.graphql?raw';
import SOLUTION_BY_ID from './graphql/solution-by-id.graphql?raw';
import TOP_VOTED_SOLUTION_ID from './graphql/top-voted-solution-id.graphql?raw';
import { LeetCode } from './leetcode';
import type {
	CategoryProblem,
	CategoryProblemsResponse,
	FavoritesResponse,
	InterpretResponse,
	JudgeCheckResponse,
	JudgeResult,
	LeetCodeSession,
	ProblemSubmission,
	SolutionArticle,
	SubmitCodeOptions,
	SubmitResponse,
	TestCodeOptions,
	TopVotedSolutionIdResult,
} from './leetcode-cli-types';
import { parse_cookie } from './utils';

interface RestRequestOptions {
	url: string;
	method?: string;
	headers?: Record<string, string>;
	body?: Record<string, unknown>;
}

export class LeetCodeCLI extends LeetCode {
	/**
	 * Build standard auth headers for REST API calls.
	 */
	private authHeaders(extra: Record<string, string> = {}): Record<string, string> {
		return {
			'content-type': 'application/json',
			origin: BASE_URL,
			referer: BASE_URL,
			cookie: `csrftoken=${this.credential.csrf || ''}; LEETCODE_SESSION=${this.credential.session || ''};`,
			'x-csrftoken': this.credential.csrf || '',
			'x-requested-with': 'XMLHttpRequest',
			'user-agent': USER_AGENT,
			...extra,
		};
	}

	/**
	 * Handle CSRF update from response cookies.
	 */
	private handleCsrf(res: Response): void {
		if (res.headers.has('set-cookie')) {
			const cookies = parse_cookie(res.headers.get('set-cookie') || '');
			if (cookies['csrftoken']) {
				this.credential.csrf = cookies['csrftoken'];
				this.emit('update-csrf', this.credential);
			}
		}
	}

	/**
	 * Make a rate-limited REST request with automatic CSRF handling.
	 */
	private async restRequest<T>(options: RestRequestOptions): Promise<T> {
		const { url, method = 'GET', headers = {}, body } = options;
		await this.limiter.lock();
		try {
			const res = await fetch(url, {
				method,
				headers: this.authHeaders(headers),
				...(body ? { body: JSON.stringify(body) } : {}),
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}
			this.handleCsrf(res);
			return (await res.json()) as T;
		} finally {
			this.limiter.unlock();
		}
	}

	/**
	 * Poll /submissions/detail/$id/check/ until state is SUCCESS.
	 * @param id - The submission or interpret ID to check
	 * @param maxAttempts - Maximum number of polling attempts (default: 60)
	 */
	private async pollJudgeResult(
		id: string | number,
		maxAttempts = 60,
	): Promise<JudgeCheckResponse> {
		const url = `${BASE_URL}/submissions/detail/${id}/check/`;
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const result = await this.restRequest<JudgeCheckResponse>({ url });
			if (result.state === 'SUCCESS') {
				return result;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		throw new Error(`Judge result polling timed out after ${maxAttempts} attempts for id: ${id}`);
	}

	/**
	 * Collect error messages from a judge check response.
	 */
	private collectErrors(result: JudgeCheckResponse): string[] {
		const errors: string[] = [];
		for (const [key, value] of Object.entries(result)) {
			if (/_error$/.test(key) && typeof value === 'string' && value.length > 0) {
				errors.push(value);
			}
		}
		return errors;
	}

	/**
	 * Format raw judge check response into a JudgeResult.
	 */
	private formatResult(result: JudgeCheckResponse, isTest: boolean): JudgeResult {
		const errors = this.collectErrors(result);

		const { answer, expectedAnswer, stdout } = isTest
			? this.formatTestOutput(result)
			: this.formatSubmitOutput(result);

		const passed = result.total_correct || 0;
		const total = result.total_testcases || 0;
		const ok =
			(result.run_success ?? false) &&
			passed === total &&
			result.status_msg === 'Accepted' &&
			errors.length === 0;

		return {
			ok,
			lang: result.lang || '',
			runtime: result.status_runtime || '',
			runtime_percentile: result.runtime_percentile || '',
			memory: result.status_memory || '',
			memory_percentile: result.memory_percentile || '',
			state: result.status_msg || '',
			testcase: result.input || result.last_testcase || '',
			passed,
			total,
			error: errors,
			stdout,
			answer,
			expected_answer: expectedAnswer,
		};
	}

	private formatTestOutput(result: JudgeCheckResponse) {
		let output = result.code_output || [];
		if (Array.isArray(output)) {
			output = output.join('\n');
		}
		return {
			stdout: output as string,
			answer: result.code_answer || '',
			expectedAnswer: result.expected_code_answer || '',
		};
	}

	private formatSubmitOutput(result: JudgeCheckResponse) {
		return {
			stdout: result.std_output || '',
			answer: (result.code_output as string) || '',
			expectedAnswer: result.expected_output || '',
		};
	}

	/**
	 * Test code against sample or custom test cases.
	 */
	public async testCode(options: TestCodeOptions): Promise<JudgeResult[]> {
		await this.initialized;

		const { slug, lang, questionId, typedCode, dataInput } = options;
		const interpretResult = await this.restRequest<InterpretResponse>({
			url: `${BASE_URL}/problems/${slug}/interpret_solution/`,
			method: 'POST',
			headers: { referer: `${BASE_URL}/problems/${slug}/description/` },
			body: {
				lang,
				question_id: questionId,
				test_mode: false,
				typed_code: typedCode,
				data_input: dataInput,
			},
		});

		if (!interpretResult.interpret_id) {
			throw new Error('No interpret_id returned. Code may have been submitted too soon.');
		}

		const ids = [interpretResult.interpret_id];
		if (interpretResult.interpret_expected_id) {
			ids.push(interpretResult.interpret_expected_id);
		}

		const results: JudgeResult[] = [];
		for (const id of ids) {
			const raw = await this.pollJudgeResult(id);
			results.push(this.formatResult(raw, true));
		}
		return results;
	}

	/**
	 * Submit code for full judging.
	 */
	public async submitCode(options: SubmitCodeOptions): Promise<JudgeResult> {
		await this.initialized;

		const { slug, lang, questionId, typedCode } = options;
		const submitResult = await this.restRequest<SubmitResponse>({
			url: `${BASE_URL}/problems/${slug}/submit/`,
			method: 'POST',
			headers: { referer: `${BASE_URL}/problems/${slug}/description/` },
			body: {
				lang,
				question_id: questionId,
				test_mode: false,
				typed_code: typedCode,
				judge_type: 'large',
			},
		});

		if (!submitResult.submission_id) {
			throw new Error('No submission_id returned.');
		}

		const raw = await this.pollJudgeResult(submitResult.submission_id);
		return this.formatResult(raw, false);
	}

	/**
	 * Get user's favorite lists.
	 */
	public async getFavorites(): Promise<FavoritesResponse> {
		await this.initialized;
		return this.restRequest<FavoritesResponse>({
			url: `${BASE_URL}/list/api/questions`,
		});
	}

	/**
	 * Star (favorite) a problem.
	 */
	public async star(questionId: string, favoriteIdHash: string): Promise<void> {
		await this.initialized;
		await this.graphql({
			query: ADD_QUESTION_TO_FAVORITE,
			variables: { favoriteIdHash, questionId },
		});
	}

	/**
	 * Unstar (unfavorite) a problem.
	 */
	public async unstar(questionId: string, favoriteIdHash: string): Promise<void> {
		await this.initialized;
		await this.graphql({
			query: REMOVE_QUESTION_FROM_FAVORITE,
			variables: { favoriteIdHash, questionId },
		});
	}

	/**
	 * Helper for session management REST calls.
	 */
	private async sessionRequest(
		method: string,
		data: Record<string, unknown>,
	): Promise<LeetCodeSession[]> {
		await this.initialized;
		const body = await this.restRequest<{ sessions: LeetCodeSession[] }>({
			url: `${BASE_URL}/session/`,
			method,
			body: data,
		});
		return body.sessions;
	}

	/**
	 * List all coding sessions.
	 */
	public async getSessions(): Promise<LeetCodeSession[]> {
		return this.sessionRequest('POST', {});
	}

	/**
	 * Create a new coding session.
	 */
	public async createSession(name: string): Promise<LeetCodeSession[]> {
		return this.sessionRequest('PUT', { func: 'create', name });
	}

	/**
	 * Activate a coding session.
	 */
	public async activateSession(sessionId: number): Promise<LeetCodeSession[]> {
		return this.sessionRequest('PUT', { func: 'activate', target: sessionId });
	}

	/**
	 * Delete a coding session.
	 */
	public async deleteSession(sessionId: number): Promise<LeetCodeSession[]> {
		return this.sessionRequest('DELETE', { target: sessionId });
	}

	private static DIFFICULTY_MAP: Record<number, string> = {
		1: 'Easy',
		2: 'Medium',
		3: 'Hard',
	};

	/**
	 * Get problems for a category via the REST API.
	 * Categories: 'algorithms', 'database', 'shell', 'concurrency'
	 */
	public async categoryProblems(category: string): Promise<CategoryProblem[]> {
		await this.initialized;

		const json = await this.restRequest<CategoryProblemsResponse>({
			url: `${BASE_URL}/api/problems/${category}/`,
		});

		return json.stat_status_pairs
			.filter((p) => !p.stat.question__hide)
			.map((p) => ({
				id: p.stat.question_id,
				fid: p.stat.frontend_question_id,
				name: p.stat.question__title,
				slug: p.stat.question__title_slug,
				link: `${BASE_URL}/problems/${p.stat.question__title_slug}/description/`,
				locked: p.paid_only,
				percent: (p.stat.total_acs * 100) / p.stat.total_submitted,
				level: LeetCodeCLI.DIFFICULTY_MAP[p.difficulty.level] || 'Unknown',
				state: p.status || 'None',
				starred: p.is_favor,
				category,
			}));
	}

	/**
	 * Get problems from all categories.
	 */
	public async allCategoryProblems(): Promise<CategoryProblem[]> {
		const results = await Promise.all(PROBLEM_CATEGORIES.map((cat) => this.categoryProblems(cat)));
		return results.flat();
	}

	/**
	 * Get submissions for a specific problem by its slug.
	 * Returns the first 20 submissions.
	 */
	public async problemSubmissions(slug: string): Promise<ProblemSubmission[]> {
		await this.initialized;

		const json = await this.restRequest<{ submissions_dump: ProblemSubmission[] }>({
			url: `${BASE_URL}/api/submissions/${slug}`,
			headers: { referer: `${BASE_URL}/problems/${slug}/` },
		});

		return json.submissions_dump.map((s) => ({
			...s,
			id: s.url.split('/').filter(Boolean).pop() || s.id,
		}));
	}

	/**
	 * Get the topic ID of the top voted solution article for a problem.
	 */
	public async getTopVotedSolutionId(
		slug: string,
		lang: string[] = [],
	): Promise<TopVotedSolutionIdResult> {
		await this.initialized;

		const res = await this.graphql({
			query: TOP_VOTED_SOLUTION_ID,
			variables: {
				questionSlug: slug,
				skip: 0,
				first: 1,
				orderBy: 'MOST_VOTES',
				userInput: '',
				tagSlugs: lang,
			},
			cacheTime: 60 * 60 * 1000, // Cache for 1 hour
		});

		const data = res?.data?.ugcArticleSolutionArticles;
		const totalNum = data?.totalNum ?? 0;
		if (totalNum === 0 || !data?.edges?.length) {
			return { totalNum: 0 };
		}

		return {
			totalNum,
			topicId: data.edges[0].node.topic.id,
		};
	}

	/**
	 * Get a solution article by its topic ID.
	 */
	public async getSolutionById(topicId: number): Promise<SolutionArticle> {
		await this.initialized;

		const res = await this.graphql({
			query: SOLUTION_BY_ID,
			variables: { topicId: String(topicId) },
			cacheTime: 60 * 60 * 1000, // Cache for 1 hour
		});

		return res?.data?.ugcArticleSolutionArticle;
	}

	/**
	 * Get the top voted solution for a problem.
	 */
	public async getTopVotedSolution(
		slug: string,
		lang: string[] = [],
	): Promise<SolutionArticle | null> {
		await this.initialized;

		const result = await this.getTopVotedSolutionId(slug, lang);
		if (result.totalNum === 0 || !('topicId' in result)) {
			return null;
		}

		return this.getSolutionById(result.topicId);
	}
}
