import { BaseLeetCode } from './base-leetcode';
import { Cache } from './cache';
import { BASE_URL_CN } from './constants';
import { CredentialCN as Credential } from './credential-cn';

export class LeetCodeCN extends BaseLeetCode {
	protected readonly baseUrl = BASE_URL_CN;

	/**
	 * The credential this LeetCodeCN instance is using.
	 */
	public declare credential: Credential;

	/**
	 * If a credential is provided, the LeetCodeCN API will be authenticated. Otherwise, it will be anonymous.
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
	 * const leetcode = new LeetCodeCN();
	 * const profile = await leetcode.user("codewithsathya");
	 * ```
	 */
	public async user(username: string): Promise<CNUserResult> {
		await this.initialized;
		const { data } = await this.graphql({
			operationName: 'getUserProfile',
			variables: { username },
			cacheTime: 300_000, // 5 minutes
			query: `
            query getUserProfile($username: String!) {
                userProfileUserQuestionProgress(userSlug: $username) {
                    numAcceptedQuestions { difficulty count }
                    numFailedQuestions { difficulty count }
                    numUntouchedQuestions { difficulty count }
                }
                userProfilePublicProfile(userSlug: $username) {
                    username haveFollowed siteRanking
                    profile {
                        userSlug realName aboutMe userAvatar location gender websites skillTags contestCount asciiCode
                        medals { name year month category }
                        ranking {
                            currentLocalRanking currentGlobalRanking currentRating totalLocalUsers totalGlobalUsers
                        }
                        socialAccounts { provider profileUrl }
                    }
                }
            }
            `,
		});
		return data;
	}

	/**
	 * Use GraphQL to query LeetCodeCN API.
	 * @param query
	 * @param endpoint Maybe you want to use `/graphql/noj-go/` instead of `/graphql/`.
	 * @returns
	 */
	public override async graphql(
		...args: Parameters<BaseLeetCode['graphql']>
	): ReturnType<BaseLeetCode['graphql']> {
		// Default endpoint for CN is /graphql/ (with trailing slash)
		if (args.length < 2 || args[1] === undefined) {
			args[1] = '/graphql/';
		}
		return super.graphql(...args);
	}
}

export default LeetCodeCN;

export interface CNNumAcceptedQuestion {
	difficulty: string;
	count: number;
}

export interface CNNumFailedQuestion {
	difficulty: string;
	count: number;
}

export interface CNNumUntouchedQuestion {
	difficulty: string;
	count: number;
}

export interface CNUserProfileUserQuestionProgress {
	numAcceptedQuestions: CNNumAcceptedQuestion[];
	numFailedQuestions: CNNumFailedQuestion[];
	numUntouchedQuestions: CNNumUntouchedQuestion[];
}

export interface CNMedal {
	name: string;
	year: number;
	month: number;
	category: string;
}

export interface CNRanking {
	currentLocalRanking: number;
	currentGlobalRanking: number;
	currentRating: string;
	totalLocalUsers: number;
	totalGlobalUsers: number;
}

export interface CNSocialAccount {
	provider: string;
	profileUrl: string;
}

export interface CNProfile {
	userSlug: string;
	realName: string;
	aboutMe: string;
	userAvatar: string;
	location: string;
	gender: string;
	websites: unknown[];
	skillTags: string[];
	contestCount: number;
	asciiCode: string;
	medals: CNMedal[];
	ranking: CNRanking;
	socialAccounts: CNSocialAccount[];
}

export interface CNUserProfilePublicProfile {
	username: string;
	haveFollowed?: unknown;
	siteRanking: number;
	profile: CNProfile;
}

export interface CNUserResult {
	userProfileUserQuestionProgress: CNUserProfileUserQuestionProgress;
	userProfilePublicProfile: CNUserProfilePublicProfile;
}
