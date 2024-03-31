import { cache as default_cache } from "./cache";
import Credential from "./credential";
import COMPANY_TAGS from "./graphql/company-tags.graphql?raw";
import IS_EASTER_EGG_COLLECTED from "./graphql/is-easter-egg-collected.graphql?raw";
import { LeetCode } from "./leetcode";
import { AllCompanyTags, CompanyTagDetail, EasterEggStatus } from "./leetcode-types";

export class LeetCodeAdvanced extends LeetCode {
    constructor(credential: Credential | null = null, cache = default_cache) {
        super(credential, cache);
    }

    public async isEasterEggCollected(): Promise<boolean> {
        await this.initialized;
        const { data } = await this.graphql({
            query: IS_EASTER_EGG_COLLECTED,
        });
        return (data as EasterEggStatus).isEasterEggCollected;
    }

    public async companyTags(): Promise<CompanyTagDetail[]> {
        await this.initialized;
        const { data } = await this.graphql({
            query: COMPANY_TAGS,
        });
        return (data as AllCompanyTags).companyTags;
    }
}

export default LeetCodeAdvanced;
