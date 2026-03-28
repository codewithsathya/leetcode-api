// src/leetcode-cli.ts
import { BASE_URL, USER_AGENT } from './constants';
import fetch from './fetch';
import { LeetCode } from './leetcode';
import type {
	InterpretResponse,
	JudgeCheckResponse,
	JudgeResult,
	SubmitCodeOptions,
	SubmitResponse,
	TestCodeOptions,
} from './leetcode-cli-types';
import { parse_cookie } from './utils';

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
	 * Poll /submissions/detail/$id/check/ until state is SUCCESS.
	 */
	private async pollJudgeResult(id: string | number): Promise<JudgeCheckResponse> {
		const url = `${BASE_URL}/submissions/detail/${id}/check/`;
		while (true) {
			const res = await fetch(url, {
				method: 'GET',
				headers: this.authHeaders(),
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}
			this.handleCsrf(res);
			const result = (await res.json()) as JudgeCheckResponse;
			if (result.state === 'SUCCESS') {
				return result;
			}
			// Wait 1 second before polling again
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	/**
	 * Format raw judge check response into a JudgeResult.
	 */
	private formatResult(result: JudgeCheckResponse, isTest: boolean): JudgeResult {
		const errors: string[] = [];
		for (const [key, value] of Object.entries(result)) {
			if (/_error$/.test(key) && typeof value === 'string' && value.length > 0) {
				errors.push(value);
			}
		}

		let answer: string | string[];
		let expectedAnswer: string | string[];
		let stdout: string;

		if (isTest) {
			let output = result.code_output || [];
			if (Array.isArray(output)) {
				output = output.join('\n');
			}
			stdout = output as string;
			answer = result.code_answer || '';
			expectedAnswer = result.expected_code_answer || '';
		} else {
			answer = (result.code_output as string) || '';
			expectedAnswer = result.expected_output || '';
			stdout = result.std_output || '';
		}

		const passed = result.total_correct || 0;
		const total = result.total_testcases || 0;
		let ok = result.run_success || false;
		if (passed !== total) ok = false;
		if (result.status_msg !== 'Accepted') ok = false;
		if (errors.length > 0) ok = false;

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

	/**
	 * Test code against sample or custom test cases.
	 * @param options - Test options including slug, lang, questionId, typedCode, and dataInput
	 * @returns Array of JudgeResult (one for actual, optionally one for expected on CN)
	 */
	public async testCode(options: TestCodeOptions): Promise<JudgeResult[]> {
		await this.initialized;

		const { slug, lang, questionId, typedCode, dataInput } = options;
		const url = `${BASE_URL}/problems/${slug}/interpret_solution/`;

		await this.limiter.lock();
		let interpretResult: InterpretResponse;
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: this.authHeaders({
					referer: `${BASE_URL}/problems/${slug}/description/`,
				}),
				body: JSON.stringify({
					lang,
					question_id: questionId,
					test_mode: false,
					typed_code: typedCode,
					data_input: dataInput,
				}),
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}
			this.handleCsrf(res);
			interpretResult = (await res.json()) as InterpretResponse;

			if (!interpretResult.interpret_id) {
				throw new Error('No interpret_id returned. Code may have been submitted too soon.');
			}
		} finally {
			this.limiter.unlock();
		}

		// Poll for results
		const ids: { type: string; id: string }[] = [
			{ type: 'Actual', id: interpretResult.interpret_id },
		];
		if (interpretResult.interpret_expected_id) {
			ids.push({ type: 'Expected', id: interpretResult.interpret_expected_id });
		}

		const results: JudgeResult[] = [];
		for (const { id } of ids) {
			const raw = await this.pollJudgeResult(id);
			results.push(this.formatResult(raw, true));
		}
		return results;
	}

	/**
	 * Submit code for full judging.
	 * @param options - Submit options including slug, lang, questionId, and typedCode
	 * @returns JudgeResult with the submission verdict
	 */
	public async submitCode(options: SubmitCodeOptions): Promise<JudgeResult> {
		await this.initialized;

		const { slug, lang, questionId, typedCode } = options;
		const url = `${BASE_URL}/problems/${slug}/submit/`;

		await this.limiter.lock();
		let submitResult: SubmitResponse;
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: this.authHeaders({
					referer: `${BASE_URL}/problems/${slug}/description/`,
				}),
				body: JSON.stringify({
					lang,
					question_id: questionId,
					test_mode: false,
					typed_code: typedCode,
					judge_type: 'large',
				}),
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}
			this.handleCsrf(res);
			submitResult = (await res.json()) as SubmitResponse;

			if (!submitResult.submission_id) {
				throw new Error('No submission_id returned.');
			}
		} finally {
			this.limiter.unlock();
		}

		const raw = await this.pollJudgeResult(submitResult.submission_id);
		return this.formatResult(raw, false);
	}
}
