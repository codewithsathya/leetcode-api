import { cache as default_cache } from "./cache";
import Credential from "./credential";
import CHECKIN from "./graphql/checkin.graphql?raw";
import COMPANY_TAGS from "./graphql/company-tags.graphql?raw";
import IS_EASTER_EGG_COLLECTED from "./graphql/is-easter-egg-collected.graphql?raw";
import USER_STATUS from "./graphql/user-status.graphql?raw";
import { LeetCode } from "./leetcode";
import {
    AllCompanyTags,
    CompanyTagDetail,
    EasterEggStatus,
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
}

export default LeetCodeAdvanced;
