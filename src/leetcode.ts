import { BaseLeetCode } from './base-leetcode';
import { Cache } from './cache';
import { BASE_URL, USER_AGENT } from './constants';
import { Credential } from './credential';
import fetch from './fetch';
import CONTEST from './graphql/contest.graphql?raw';
import DAILY from './graphql/daily.graphql?raw';
import PROBLEM from './graphql/problem.graphql?raw';
import PROBLEMS from './graphql/problems.graphql?raw';
import PROFILE from './graphql/profile.graphql?raw';
import RECENT_SUBMISSIONS from './graphql/recent-submissions.graphql?raw';
import WHOAMI from './graphql/whoami.graphql?raw';
import type {
	DailyChallenge,
	Problem,
	ProblemList,
	QueryParams,
	Submission,
	SubmissionDetail,
	SubmissionsDump,
	UserContestInfo,
	UserProfile,
	UserSubmission,
	Whoami,
} from './leetcode-types';
import { parse_cookie } from './utils';

export class LeetCode extends BaseLeetCode {
	protected readonly baseUrl = BASE_URL;

	/**
	 * The credential this LeetCode instance is using.
	 */
	public declare credential: Credential;

	/**
	 * If a credential is provided, the LeetCode API will be authenticated. Otherwise, it will be anonymous.
	 * @param credential
	 * @param cache
	 */
	constructor(credential: Credential | null = null, cache = new Cache()) {
		super(credential, () => new Credential(), cache);
	}

	/**
	 * Get public profile of a user.
	 * @param username
	 * @returns
	 *
	 * ```javascript
	 * const leetcode = new LeetCode();
	 * const profile = await leetcode.user("codewithsathya");
	 * ```
	 */
	public async user(username: string): Promise<UserProfile> {
		await this.initialized;
		const { data } = await this.graphql({
			variables: { username },
			query: PROFILE,
			cacheTime: 300_000, // 5 minutes
		});
		return data as UserProfile;
	}

	/**
	 * Get public contest info of a user.
	 * @param username
	 * @returns
	 *
	 */
	public async user_contest_info(username: string): Promise<UserContestInfo> {
		await this.initialized;
		const { data } = await this.graphql({
			variables: { username },
			query: CONTEST,
			cacheTime: 300_000, // 5 minutes
		});
		return data as UserContestInfo;
	}

	/**
	 * Get recent submissions of a user. (max: 20 submissions)
	 * @param username
	 * @param limit
	 * @returns
	 *
	 * ```javascript
	 * const leetcode = new LeetCode();
	 * const submissions = await leetcode.recent_user_submissions("codewitsathya");
	 * ```
	 */
	public async recent_user_submissions(username: string, limit = 20): Promise<UserSubmission[]> {
		await this.initialized;
		const { data } = await this.graphql({
			variables: { username, limit },
			query: RECENT_SUBMISSIONS,
			cacheTime: 30_000, // 30 seconds
		});
		return (data.recentSubmissionList as UserSubmission[]) || [];
	}

	/**
	 * Get submissions of the credential user. Need to be authenticated.
	 *
	 * @returns
	 *
	 * ```javascript
	 * const credential = new Credential();
	 * await credential.init("SESSION");
	 * const leetcode = new LeetCode(credential);
	 * const submissions = await leetcode.submissions({ limit: 100, offset: 0 });
	 * ```
	 */
	public async submissions({
		limit = 20,
		offset = 0,
	}: { limit?: number; offset?: number; slug?: string } = {}): Promise<Submission[]> {
		let allSubmissions: Submission[] = [];
		let cursor = offset;
		while (allSubmissions.length < limit) {
			const { submissions_dump: submissions, has_next } = await this.submissionsApi({
				offset: cursor,
				limit: limit <= 20 ? limit : 20,
			});
			allSubmissions = [...allSubmissions, ...submissions];
			if (!has_next) {
				break;
			}
			cursor += 20;
		}
		return allSubmissions.slice(0, limit);
	}

	private async submissionsApi({ offset = 0, limit = 20 }) {
		await this.initialized;
		if (limit > 20) limit = 20;
		await this.limiter.lock();
		try {
			const res = await fetch(`${BASE_URL}/api/submissions/?offset=${offset}&limit=${limit}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					origin: BASE_URL,
					referer: BASE_URL,
					cookie: `csrftoken=${this.credential.csrf || ''}; LEETCODE_SESSION=${
						this.credential.session || ''
					};`,
					'x-csrftoken': this.credential.csrf || '',
					'user-agent': USER_AGENT,
				},
			});
			if (!res.ok) {
				throw new Error(`HTTP ${res.status} ${res.statusText}: ${await res.text()}`);
			}
			if (res.headers.has('set-cookie')) {
				const cookies = parse_cookie(res.headers.get('set-cookie') || '');

				if (cookies['csrftoken']) {
					this.credential.csrf = cookies['csrftoken'];
					this.emit('update-csrf', this.credential);
				}
			}
			return (await res.json()) as Promise<SubmissionsDump>;
		} finally {
			this.limiter.unlock();
		}
	}

	/**
	 * Get detail of a submission, including the code and percentiles.
	 * Need to be authenticated.
	 * @param id Submission ID
	 * @returns
	 * @deprecated
	 *
	 */
	public async submission(id: number): Promise<SubmissionDetail> {
		await this.initialized;

		await this.limiter.lock();
		try {
			const res = await fetch(`${BASE_URL}/submissions/detail/${id}/`, {
				headers: {
					origin: BASE_URL,
					referer: BASE_URL,
					cookie: `csrftoken=${this.credential.csrf || ''}; LEETCODE_SESSION=${
						this.credential.session || ''
					};`,
					'user-agent': USER_AGENT,
				},
			});
			const raw = await res.text();
			const data = raw.match(/var pageData = ({[^]+?});/)?.[1];
			if (!data) {
				throw new Error('Failed to parse submission page data');
			}
			// Convert JS object literal to valid JSON by quoting unquoted keys
			const jsonStr = data
				.replace(/'/g, '"')
				.replace(/(\w+)\s*:/g, '"$1":')
				.replace(/,\s*}/g, '}')
				.replace(/,\s*]/g, ']');
			const json = JSON.parse(jsonStr);
			const result = {
				id: parseInt(json.submissionId),
				problem_id: parseInt(json.questionId),
				runtime: parseInt(json.runtime),
				runtime_distribution: json.runtimeDistributionFormatted
					? (JSON.parse(json.runtimeDistributionFormatted).distribution.map(
							(item: [string, number]) => [+item[0], item[1]],
						) as [number, number][])
					: [],
				runtime_percentile: 0,
				memory: parseInt(json.memory),
				memory_distribution: json.memoryDistributionFormatted
					? (JSON.parse(json.memoryDistributionFormatted).distribution.map(
							(item: [string, number]) => [+item[0], item[1]],
						) as [number, number][])
					: [],
				memory_percentile: 0,
				code: json.submissionCode,
				details: json.submissionData,
			};

			result.runtime_percentile = result.runtime_distribution.reduce(
				(acc, [usage, p]) => acc + (usage >= result.runtime ? p : 0),
				0,
			);
			result.memory_percentile = result.memory_distribution.reduce(
				(acc, [usage, p]) => acc + (usage >= result.memory / 1000 ? p : 0),
				0,
			);

			return result;
		} finally {
			this.limiter.unlock();
		}
	}

	/**
	 * Get a list of problems by tags and difficulty.
	 * @param option
	 * @param option.category
	 * @param option.offset
	 * @param option.limit
	 * @param option.filters
	 * @returns
	 */
	public async problems({
		category = '',
		offset = 0,
		limit = 100,
		filters = {},
	}: QueryParams = {}): Promise<ProblemList> {
		await this.initialized;

		const variables = { categorySlug: category, skip: offset, limit, filters };

		const { data } = await this.graphql({
			variables,
			query: PROBLEMS,
			cacheTime: 600_000, // 10 minutes
		});

		return data.problemsetQuestionList as ProblemList;
	}

	/**
	 * Get information of a problem by its slug.
	 * @param slug
	 * @returns
	 */
	public async problem(slug: string): Promise<Problem> {
		await this.initialized;
		const { data } = await this.graphql({
			variables: { titleSlug: slug.toLowerCase().replace(/\s/g, '-') },
			query: PROBLEM,
			cacheTime: 600_000, // 10 minutes
		});

		return data.question as Problem;
	}

	/**
	 * Get daily challenge.
	 * @returns
	 *
	 * @example
	 * ```javascript
	 * const leetcode = new LeetCode();
	 * const daily = await leetcode.daily();
	 * ```
	 */
	public async daily(): Promise<DailyChallenge> {
		await this.initialized;
		const { data } = await this.graphql({
			query: DAILY,
			cacheTime: 0,
		});

		return data.activeDailyCodingChallengeQuestion as DailyChallenge;
	}

	/**
	 * Check the information of the credential owner.
	 * @returns
	 */
	public async whoami(): Promise<Whoami> {
		await this.initialized;
		const { data } = await this.graphql({
			operationName: 'globalData',
			variables: {},
			query: WHOAMI,
		});

		return data.userStatus as Whoami;
	}
}

export default LeetCode;
