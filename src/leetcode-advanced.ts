import { cache as default_cache } from "./cache";
import Credential from "./credential";
import CHECKIN from "./graphql/checkin.graphql?raw";
import COMPANY_TAGS from "./graphql/company-tags.graphql?raw";
import IS_EASTER_EGG_COLLECTED from "./graphql/is-easter-egg-collected.graphql?raw";
import { LeetCode } from "./leetcode";
import {
    AllCompanyTags,
    CompanyTagDetail,
    EasterEggStatus,
    SubmissionDetail,
} from "./leetcode-types";

export class LeetCodeAdvanced extends LeetCode {
    constructor(credential: Credential | null = null, cache = default_cache) {
        super(credential, cache);
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
}

export default LeetCodeAdvanced;
