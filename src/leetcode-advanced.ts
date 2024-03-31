import { cache as default_cache } from "./cache";
import Credential from "./credential";
import IS_EASTER_EGG_COLLECTED from "./graphql/is-easter-egg-collected.graphql?raw";
import { LeetCode } from "./leetcode";
import { EasterEggStatus } from "./leetcode-types";

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
}

export default LeetCodeAdvanced;
