import { cache as default_cache } from './cache';
import Credential from './credential';
import CHECKIN from './graphql/checkin.graphql?raw';
import COLLECT_EASTER_EGG from './graphql/collect-easter-egg.graphql?raw';
import COMPANY_TAGS from './graphql/company-tags.graphql?raw';
import IS_EASTER_EGG_COLLECTED from './graphql/is-easter-egg-collected.graphql?raw';
import NO_OF_QUESTIONS from './graphql/no-of-problems.graphql?raw';
import { LeetCode } from './leetcode';
import {
	AllCompanyTags,
	CompanyTagDetail,
	DetailedProblem,
	EasterEggStatus,
	ProblemFieldDetails,
	QueryParams,
	RecentSubmission,
	Submission,
	SubmissionDetail,
} from './leetcode-types';
import problemProperties from './problem-properties';
import { memoryStringToNumber, runtimeStringToNumber } from './utils';

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
	 * Checkin to collect a coin
	 * Need to be authenticated
	 */
	public async checkIn(): Promise<void> {
		await this.initialized;
		const userStatus = await this.whoami();
		if (!userStatus.checkedInToday) {
			await this.graphql({
				query: CHECKIN,
			});
		} else {
			throw new Error(`User already checked in`);
		}
	}

	/**
	 * Get recent submission of current user.
	 * Need to be authenticated
	 * @returns Submission
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmission(): Promise<Submission | null> {
		const whoami = await this.whoami();
		return await this.recentSubmissionOfUser(whoami.username);
	}

	/**
	 * Get detailed submission of current user.
	 * Need to be authenticated
	 * @returns SubmissionDetail
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmissionDetail(): Promise<SubmissionDetail | null> {
		const whoami = await this.whoami();
		const recentSubmission = await this.recentSubmissionOfUser(whoami.username);
		if (recentSubmission === null) return null;
		const submissionId = recentSubmission.id;
		return await this.submission(submissionId);
	}

	/**
	 * Get recent submission of a user by username
	 * Need to be authenticated
	 * @param username
	 * @returns Submission
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmissionOfUser(username: string): Promise<Submission | null> {
		const recentSubmissions = await this.recent_submissions(username, 1);
		if (recentSubmissions.length == 0) return null;
		return this.convertRecentSubmissionToSubmissionType(recentSubmissions[0]);
	}

	/**
	 * Get detail submission of a user by username
	 * Need to be authenticated
	 * @param username
	 * @returns SubmissionDetail
	 * @returns null if there are no recent submissions
	 */
	public async recentSubmissionDetailOfUser(username: string): Promise<SubmissionDetail | null> {
		const recentSubmission = await this.recentSubmissionOfUser(username);
		if (recentSubmission === null) return null;
		return await this.submission(recentSubmission.id);
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
			const { data } = await this.graphql({
				variables,
				query: this.getProblemsQuery({ requiredProperty: problemProperty.graphql }),
			});
			problems = data.problemsetQuestionList.questions as DetailedProblem[];
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

	private convertRecentSubmissionToSubmissionType(recentSubmission: RecentSubmission): Submission {
		return {
			id: parseInt(recentSubmission.id, 10),
			lang: recentSubmission.lang,
			time: recentSubmission.time,
			timestamp: parseInt(recentSubmission.timestamp, 10),
			statusDisplay: recentSubmission.statusDisplay,
			runtime: runtimeStringToNumber(recentSubmission.runtime),
			url: recentSubmission.url,
			isPending: recentSubmission.isPending !== 'Not Pending',
			title: recentSubmission.title,
			memory: memoryStringToNumber(recentSubmission.memory),
			titleSlug: recentSubmission.titleSlug,
		} as Submission;
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
