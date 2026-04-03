import { cache as default_cache } from './cache';
import { BASE_URL, PROBLEM_CATEGORIES, USER_AGENT } from './constants';
import Credential from './credential';
import fetch from './fetch';
import CHECKIN from './graphql/checkin.graphql?raw';
import COLLECT_EASTER_EGG from './graphql/collect-easter-egg.graphql?raw';
import COMPANY_TAGS from './graphql/company-tags.graphql?raw';
import LEETCODE_PROBLEMS_QUERY from './graphql/custom-problem.graphql?raw';
import IS_EASTER_EGG_COLLECTED from './graphql/is-easter-egg-collected.graphql?raw';
import LISTS from './graphql/lists.graphql?raw';
import MINIMAL_COMPANY_TAGS from './graphql/minimal-company-tags.graphql?raw';
import NO_OF_QUESTIONS from './graphql/no-of-problems.graphql?raw';
import PAST_CONTESTS from './graphql/past-contests.graphql?raw';
import QUESTION_DETAIL from './graphql/question-detail.graphql?raw';
import QUESTIONS_OF_LIST from './graphql/questions-of-list.graphql?raw';
import TOPIC_TAGS from './graphql/topic-tags.graphql?raw';
import { LeetCode } from './leetcode';
import {
	AllCompanyTags,
	CompanyTagDetail,
	ContestQuestion,
	ContestQuestions,
	DetailedProblem,
	EasterEggStatus,
	LeetcodeProblem,
	List,
	MinimalCompanyTagDetail,
	PastContests,
	ProblemFieldDetails,
	QueryParams,
	QuestionDetail,
	Submission,
	TopicTagDetails,
	UserSubmission,
} from './leetcode-types';
import problemProperties from './problem-properties';
import { QuestionOfList } from './types';

interface CategoryStatPair {
	stat: {
		frontend_question_id: number;
		question__title_slug: string;
	};
}

interface CategoryQuestionsResponse {
	stat_status_pairs: CategoryStatPair[];
}

export class LeetCodeAdvanced extends LeetCode {
	problemProperties = problemProperties;
	uniquePropertyOfProblem = 'questionFrontendId';

	constructor(credential: Credential | null = null, cache = default_cache) {
		super(credential, cache);
	}

	public setUniquePropertyOfProblem(property: string): void {
		this.uniquePropertyOfProblem = property;
	}

	public setCustomProblemProperties(problemProperties: ProblemFieldDetails[]): void {
		this.problemProperties = problemProperties;
	}

	/**
	 * Checks if easter egg is already collected.
	 * Need to be authenticated.
	 * @returns boolean
	 */
	public async isEasterEggCollected(): Promise<boolean> {
		await this.initialized;
		const { data } = await this.graphql({
			query: IS_EASTER_EGG_COLLECTED,
		});
		return (data as EasterEggStatus).isEasterEggCollected;
	}

	/**
	 * Collects easter egg if available.
	 * Need to be authenticated.
	 */
	public async collectEasterEgg(): Promise<boolean> {
		await this.initialized;
		const easterEggCollected = await this.isEasterEggCollected();
		if (easterEggCollected) {
			return false;
		}
		await this.graphql({
			operationName: 'collectContestEasterEgg',
			variables: {},
			query: COLLECT_EASTER_EGG,
		});
		return true;
	}

	/**
	 * Get all topic tags for each question with question frontend id as key
	 * @returns
	 */
	public async topicTags({
		limit = 10000,
		problemsPerRequest = 100,
		skip = 0,
	}: { limit?: number; problemsPerRequest?: number; skip?: number } = {}): Promise<
		Record<string, string[]>
	> {
		await this.initialized;
		const questionIdToTopicTags: Record<string, string[]> = {};
		const noOfProblems = Math.min(skip + limit, await this.noOfProblems());
		for (let offset = skip; offset < noOfProblems; offset += problemsPerRequest) {
			const { data } = await this.graphql({
				query: TOPIC_TAGS,
				variables: {
					categorySlug: '',
					filters: {},
					skip: offset,
					limit: problemsPerRequest,
				},
			});
			const problems = data.problemsetQuestionList.questions as TopicTagDetails[];
			for (const problem of problems) {
				questionIdToTopicTags[problem.questionFrontendId] = problem.topicTags.map(
					({ name }) => name,
				);
			}
		}
		return questionIdToTopicTags;
	}

	/**
	 * Get all company tags with their details.
	 * For company wise question details, need to be authenticated and should be premium user.
	 * @returns
	 */
	public async companyTags(): Promise<CompanyTagDetail[]> {
		await this.initialized;
		const { data } = await this.graphql({
			query: COMPANY_TAGS,
		});
		return (data as AllCompanyTags).companyTags;
	}

	/**
	 * Get question frontend id to company tags mapping.
	 * Need to be authenticated and should be premium user
	 * @returns
	 */
	public async getQuestionIdCompanyTagsMapping(): Promise<Record<string, string[]>> {
		await this.initialized;
		const { data } = await this.graphql({
			query: MINIMAL_COMPANY_TAGS,
		});
		const companyTags = data.companyTags as MinimalCompanyTagDetail[];
		if (companyTags === null) {
			throw new Error(`You should have leetcode premium to access company tags information`);
		}
		const questionIdToCompanyTags: Record<string, string[]> = {};
		for (const companyTag of companyTags) {
			for (const { questionFrontendId: id } of companyTag.questions) {
				if (!questionIdToCompanyTags[id]) {
					questionIdToCompanyTags[id] = [];
				}
				questionIdToCompanyTags[id].push(companyTag.name);
			}
		}
		return questionIdToCompanyTags;
	}

	/**
	 * Checkin to collect a coin
	 * Need to be authenticated
	 */
	public async checkIn(): Promise<boolean> {
		await this.initialized;
		const { data } = await this.graphql({
			query: CHECKIN,
		});
		return data.checkin.checkedIn as boolean;
	}

	/**
	 * Get recent submission of current user.
	 * Need to be authenticated
	 * @returns Submission
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmission(): Promise<Submission | null> {
		const submissions = await this.submissions({ limit: 1, offset: 0 });
		if (submissions.length == 0) return null;
		return submissions[0];
	}

	/**
	 * Get recent submission of a user by username
	 * Need to be authenticated
	 * @param username
	 * @returns Submission
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmissionOfUser(username: string): Promise<UserSubmission | null> {
		const recentSubmissions = await this.recent_user_submissions(username, 1);
		if (recentSubmissions.length == 0) return null;
		return recentSubmissions[0];
	}

	/**
	 * Get no of total problems in leetcode right now.
	 * @returns number
	 */
	public async noOfProblems(): Promise<number> {
		await this.initialized;
		const { data } = await this.graphql({
			query: NO_OF_QUESTIONS,
			variables: {
				categorySlug: '',
				filters: {},
			},
		});
		return data.problemsetQuestionList.total as number;
	}

	/**
	 * Get leetcode lists of the user
	 * Need to be authenticated
	 * @returns array of leetcode lists
	 */
	public async getLists(): Promise<Array<List>> {
		await this.initialized;
		const { data } = await this.graphql({
			query: LISTS,
		});
		return data.myCreatedFavoriteList.favorites as Array<List>;
	}

	/**
	 * Get all questions of a leetcode list
	 * Need to be authenticated
	 * @param slug slug id of the leetcode list
	 * @returns array of questions
	 */
	public async getQuestionsOfList(slug: string): Promise<Array<QuestionOfList>> {
		await this.initialized;
		const { data } = await this.graphql({
			query: QUESTIONS_OF_LIST,
			variables: {
				favoriteSlug: slug,
			},
		});
		return data.favoriteQuestionList.questions as Array<QuestionOfList>;
	}

	/**
	 * Get problem types for all questions.
	 * @returns Record<string, string> - A mapping of question frontend IDs to their problem type.
	 */
	public async getProblemTypes(): Promise<Record<string, string>> {
		const problemTypes: Record<string, string> = {};
		for (const category of PROBLEM_CATEGORIES) {
			const pairs = await this.fetchCategoryQuestions(category);
			for (const pair of pairs) {
				const id = String(pair.stat.frontend_question_id);
				problemTypes[id] = category;
			}
		}
		return problemTypes;
	}

	/**
	 * Get leetcode problems with optional parameters.
	 * @param option
	 * @param option.limit - Total number of problems to fetch. Default is 10000.
	 * @param option.problemsPerRequest - Number of problems to fetch per request. Default is 100.
	 * @param option.skip - Number of problems to skip from the start. Default is 0.
	 * @param option.callbackFn - Optional callback function that will be called after each request with the currently fetched problems.
	 * @returns Array of LeetcodeProblem
	 */
	public async getLeetcodeProblems({
		limit = 10000,
		problemsPerRequest = 100,
		skip = 0,
		callbackFn = null,
	}: {
		limit?: number;
		problemsPerRequest?: number;
		skip?: number;
		callbackFn?: ((problems: LeetcodeProblem[]) => void) | null;
	} = {}): Promise<LeetcodeProblem[]> {
		await this.initialized;
		const noOfProblems = Math.min(skip + limit, await this.noOfProblems());
		let problems: LeetcodeProblem[] = [];
		for (let offset = skip; offset < noOfProblems; offset += problemsPerRequest) {
			const { data } = await this.graphql({
				query: LEETCODE_PROBLEMS_QUERY,
				variables: {
					categorySlug: '',
					filters: {},
					skip: offset,
					limit: problemsPerRequest,
				},
			});
			const consolidatedProblems = data.problemsetQuestionList.questions as LeetcodeProblem[];
			problems = [...problems, ...consolidatedProblems];
			if (callbackFn) {
				await callbackFn(problems);
			}
		}
		return this.parseProblems(problems);
	}

	private async parseProblems(problems: LeetcodeProblem[]) {
		const parsingDetails: Record<string, boolean> = {};
		for (const fieldDetails of problemProperties) {
			parsingDetails[fieldDetails.property] = fieldDetails.needParsing;
		}
		for (const problem of problems) {
			for (const field of Object.keys(problem)) {
				if (parsingDetails[field]) {
					problem[field as keyof LeetcodeProblem] = JSON.parse(
						problem[field as keyof LeetcodeProblem] as string,
					) as never;
				}
			}
		}
		return problems;
	}

	/**
	 * Get list of detailed problems by tags and difficulty.
	 * This will collect details according to the problemProperties configuration and this is slow.
	 * @param option
	 * @param option.category
	 * @param option.offset
	 * @param option.limit
	 * @param option.filters
	 * @returns DetailedProblem[]
	 */
	public async detailedProblems({
		category = '',
		offset = 0,
		limit = 100000,
		filters = {},
	}: QueryParams = {}): Promise<DetailedProblem[]> {
		await this.initialized;
		let problems: DetailedProblem[] = [];
		for (const problemProperty of this.problemProperties.filter(({ enable }) => enable)) {
			const consolidatedProblems = await this.problemsOfProperty(problemProperty, {
				category,
				offset,
				limit,
				filters,
			});
			if (problems.length === 0) {
				problems = consolidatedProblems;
			} else {
				problems = this.combineProperties(problems, consolidatedProblems);
			}
		}
		return problems;
	}

	/**
	 * Get problems with a particular property and requests are sent according to the configuration.
	 * @param problemProperty
	 * @param QueryParams
	 * @returns DetailedProblem[]
	 */
	public async problemsOfProperty(
		problemProperty: ProblemFieldDetails,
		{ category = '', offset = 0, limit = 100000, filters = {} }: QueryParams = {},
	): Promise<DetailedProblem[]> {
		if (!problemProperty.enable) {
			throw new Error(`${problemProperty.title} is not enabled.`);
		}

		await this.initialized;

		const variables = { categorySlug: category, skip: offset, limit, filters };
		let problems: DetailedProblem[] = [];

		if (!problemProperty.needRequestChunking) {
			const chunkSize = 100;
			const noOfProblems = Math.min(offset + limit, await this.noOfProblems());
			variables.limit = Math.min(chunkSize, limit);
			while (variables.skip < noOfProblems) {
				const { data } = await this.graphql({
					variables,
					query: this.getProblemsQuery({ requiredProperty: problemProperty.graphql }),
				});
				problems = [...problems, ...(data.problemsetQuestionList.questions as DetailedProblem[])];
				variables.skip += variables.limit;
				variables.limit = Math.min(chunkSize, noOfProblems - variables.skip);
			}
		} else {
			variables.limit = problemProperty.problemsPerRequest;
			const noOfProblems = await this.noOfProblems();
			while (variables.skip < noOfProblems) {
				const { data } = await this.graphql({
					variables,
					query: this.getProblemsQuery({ requiredProperty: problemProperty.graphql }),
				});
				problems = [...problems, ...(data.problemsetQuestionList.questions as DetailedProblem[])];
				variables.skip += variables.limit;
			}
		}

		if (problemProperty.needParsing) {
			const property = problemProperty.property;
			problems.forEach((problem) => {
				problem[property] = JSON.parse(problem[property] as string);
			});
		}

		return problems;
	}

	/**
	 * Get title slug question number mapping for all leetcode questions
	 * @returns Mapping
	 */
	public async getTitleSlugQuestionNumberMapping(): Promise<Record<string, string>> {
		const mapping: Record<string, string> = {};
		for (const category of PROBLEM_CATEGORIES) {
			const pairs = await this.fetchCategoryQuestions(category);
			for (const pair of pairs) {
				const slug = pair.stat.question__title_slug;
				const id = String(pair.stat.frontend_question_id);
				if (!mapping[slug]) {
					mapping[slug] = id;
				}
			}
		}
		return mapping;
	}

	public async getQuestionDetailsByTitleSlug(titleSlug: string): Promise<QuestionDetail> {
		await this.initialized;
		const { data } = await this.graphql({
			query: QUESTION_DETAIL,
			variables: { titleSlug },
			cacheTime: 600_000, // 10 minutes
		});
		return data as QuestionDetail;
	}

	/**
	 * Get questions of a contest by its slug.
	 * @param contestSlug - The slug of the contest (e.g., "weekly-contest-495").
	 * @returns ContestQuestions
	 */
	public async getContestQuestions(contestSlug: string): Promise<ContestQuestions> {
		await this.initialized;
		await this.limiter.lock();
		try {
			const res = await fetch(`${BASE_URL}/contest/api/info/${contestSlug}/`, {
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
			const data = (await res.json()) as {
				questions: (ContestQuestion & { id: number; question_id: number })[];
			};
			const questions: ContestQuestion[] = data.questions.map(
				({ credit, title, title_slug, category_slug, difficulty }) => ({
					credit,
					title,
					title_slug,
					category_slug,
					difficulty,
				}),
			);
			return { questions };
		} finally {
			this.limiter.unlock();
		}
	}

	/**
	 * Get past contests history.
	 * @param option
	 * @param option.limit - Number of contests to fetch. Default is 30.
	 * @param option.skip - Number of contests to skip. Default is 0.
	 * @returns PastContests
	 */
	public async getPastContests({
		limit = 30,
		skip = 0,
	}: { limit?: number; skip?: number } = {}): Promise<PastContests> {
		await this.initialized;
		const { data } = await this.graphql({
			query: PAST_CONTESTS,
			variables: { limit, skip },
		});
		return data.contestV2HistoryContests as PastContests;
	}

	private async fetchCategoryQuestions(category: string): Promise<CategoryStatPair[]> {
		await this.initialized;
		await this.limiter.lock();
		try {
			const res = await fetch(`${BASE_URL}/api/problems/${category}/`, {
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
			const rawText = await res.text();
			const sanitized = rawText.replace(/[\n\r\t]/g, '');
			const data = JSON.parse(sanitized) as CategoryQuestionsResponse;
			return data.stat_status_pairs;
		} finally {
			this.limiter.unlock();
		}
	}

	private combineProperties(arr1: DetailedProblem[], arr2: DetailedProblem[]) {
		const uniquePropertyOfProblem = this.uniquePropertyOfProblem as keyof DetailedProblem;
		const arr1Map = arr1.reduce(
			(map, item) => {
				const uniqueValue = item[uniquePropertyOfProblem] as string;
				map[uniqueValue] = item;
				return map;
			},
			{} as Record<string, DetailedProblem>,
		);
		return arr2.map((item) => ({
			...item,
			...arr1Map[item[uniquePropertyOfProblem] as string],
		}));
	}

	private getProblemsQuery({
		uniqueProperty = this.uniquePropertyOfProblem,
		requiredProperty = '',
	}): string {
		return `query problemsetQuestionList(
      $categorySlug: String
      $limit: Int
      $skip: Int
      $filters: QuestionListFilterInput
    ) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
            ${uniqueProperty}
            ${requiredProperty}
        }
      }
    }
    `;
	}
}

export default LeetCodeAdvanced;
