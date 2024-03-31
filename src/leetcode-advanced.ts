import { cache as default_cache } from "./cache";
import { BASE_URL, USER_AGENT } from "./constants";
import Credential from "./credential";
import CHECKIN from "./graphql/checkin.graphql?raw";
import COMPANY_TAGS from "./graphql/company-tags.graphql?raw";
import IS_EASTER_EGG_COLLECTED from "./graphql/is-easter-egg-collected.graphql?raw";
import USER_STATUS from "./graphql/user-status.graphql?raw";
import { LeetCode } from "./leetcode";
import {
    AllCompanyTags,
    CodeSubmission,
    CompanyTagDetail,
    EasterEggStatus,
    SubmissionDetail,
    UserStatus,
    UserStatusWrapper,
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
        const userStatus = await this.userStatus();
        if (!userStatus.checkedInToday) {
            await this.graphql({
                query: CHECKIN,
            });
        } else {
            throw new Error(`User already checked in`);
        }
    }

    /**
     * Get user session details.
     * Need to be authenticated
     * @returns
     */
    public async userStatus(): Promise<UserStatus> {
        await this.initialized;
        const { data } = await this.graphql({
            query: USER_STATUS,
        });
        return (data as UserStatusWrapper).userStatus;
    }

    /**
     * Get detailed submission of current user.
     * Need to be authenticated
     * @returns SubmissionDetail
     */
    public async recentSubmission(): Promise<SubmissionDetail> {
        const userStatus = await this.userStatus();
        const recentSubmissions = await this.recent_submissions(userStatus.username);
        const submissionId = parseInt(recentSubmissions[0].id);
        return await this.submission(submissionId);
    }

    /**
     * Get detail submission of a user by username
     * @param username
     * @returns SubmissionDetail
     */
    public async recentSubmissionOfUser(username: string): Promise<SubmissionDetail> {
        const recentSubmissions = await this.recent_submissions(username);
        const submissionId = parseInt(recentSubmissions[0].id);
        return await this.submission(submissionId);
    }

    /**
     * Get all submissions including code of a credential user.
     * Need to be authenticated
     * @returns CodeSubmission[]
     */
    public async submissionsWithCode(): Promise<CodeSubmission[]> {
        await this.initialized;
        let submissions: CodeSubmission[] = [];
        let offset = 0;
        let hasNext = true;
        while (hasNext) {
            try {
                await this.limiter.lock();
                const res = await fetch(`${BASE_URL}/api/submissions?offset=${offset}`, {
                    method: "get",
                    headers: {
                        origin: BASE_URL,
                        referer: BASE_URL,
                        cookie: `csrftoken=${this.credential.csrf || ""}; LEETCODE_SESSION=${
                            this.credential.session || ""
                        };`,
                        "user-agent": USER_AGENT,
                    },
                });
                const data = (await res.json()) as {
                    submissions_dump: CodeSubmission[];
                    has_next: boolean;
                };
                let currentSubmissions: CodeSubmission[] = data.submissions_dump;
                currentSubmissions = currentSubmissions.filter(
                    (submission) => submission.status_display === "Accepted",
                );
                currentSubmissions.forEach((submission) => {
                    submission.timestamp *= 1000;
                });
                submissions = [...submissions, ...currentSubmissions];
                hasNext = data.has_next;
                offset += 20;
                this.limiter.unlock;
            } catch (err) {
                this.limiter.unlock();
                throw err;
            }
        }
        return submissions;
    }
}

export default LeetCodeAdvanced;
