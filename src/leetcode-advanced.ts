import { cache as default_cache } from './cache';
import Credential from './credential';
import CHECKIN from './graphql/checkin.graphql?raw';
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
	SubmissionDetail,
} from './leetcode-types';
import problemProperties from './problem-properties';

export class LeetCodeAdvanced extends LeetCode {
	problemProperties = problemProperties;

	constructor(credential: Credential | null = null, cache = default_cache) {
		super(credential, cache);
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
	 * Get detailed submission of current user.
	 * Need to be authenticated
	 * @returns SubmissionDetail
	 */
	public async recentSubmission(): Promise<SubmissionDetail> {
		const whoami = await this.whoami();
		const recentSubmissions = await this.recent_submissions(whoami.username);
		const submissionId = parseInt(recentSubmissions[0].id);
		return await this.submission(submissionId);
	}

	/**
	 * Get detail submission of a user by username
	 * Need to be authenticated
	 * @param username
	 * @returns SubmissionDetail
	 */
	public async recentDetailedSubmissionOfUser(username: string): Promise<SubmissionDetail> {
		const recentSubmissions = await this.recent_submissions(username);
		const submissionId = parseInt(recentSubmissions[0].id);
		return await this.submission(submissionId);
	}

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

	public async problemsOfProperty(
		problemProperty: ProblemFieldDetails,
		{ category = '', offset = 0, limit = 100000, filters = {} }: QueryParams = {},
	): Promise<DetailedProblem[]> {
		if (!problemProperty.enable) {
			throw new Error(`${problemProperty.title} is not enabled.`);
		}

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

	private getProblemsQuery({
		uniqueProperty = 'questionFrontendId',
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
