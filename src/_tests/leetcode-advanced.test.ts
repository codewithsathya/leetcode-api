import dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";
import { Cache } from "../cache";
import { Credential } from "../credential";
import { LeetCodeAdvanced } from "../leetcode-advanced";

describe("LeetCode Advanced", { timeout: 15_000 }, () => {
    describe("General", () => {
        it("should be an instance of LeetCodeAdvanced", () => {
            const lc = new LeetCodeAdvanced();
            expect(lc).toBeInstanceOf(LeetCodeAdvanced);
        });

        it("should be able to use user-specified cache", () => {
            const lc = new LeetCodeAdvanced(null, new Cache());
            expect(lc).toBeInstanceOf(LeetCodeAdvanced);
            expect(lc.cache).toBeInstanceOf(Cache);
        });
    });

    describe("Unauthenticated", () => {
        const lc = new LeetCodeAdvanced();
        lc.limiter.limit = 100;
        lc.limiter.interval = 3;
        lc.on("receive-graphql", async (res) => {
            await res.clone().json();
        });

        it("should be able to get company tags", async () => {
            const companyTags = await lc.companyTags();
            expect(companyTags.length).toBeGreaterThan(0);
        });
    });

    describe("Authenticated", () => {
        dotenv.config();
        const credential = new Credential();
        let lc: LeetCodeAdvanced;

        beforeAll(async () => {
            await credential.init(process.env["TEST_LEETCODE_SESSION"]);
            lc = new LeetCodeAdvanced(credential);
        });

        it.skipIf(!process.env["TEST_LEETCODE_SESSION"])(
            "should be able to check whether easter is collected or not",
            async () => {
                const easterEggCollected = await lc.isEasterEggCollected();
                expect(easterEggCollected).toBeTruthy();
            },
        );

        it.skipIf(!process.env["TEST_LEETCODE_SESSION"])(
            "should be able to get recent submission",
            async () => {
                const recentSubmission = await lc.recentSubmission();
                expect(recentSubmission).toBeTruthy();
                expect(recentSubmission.code.length).toBeGreaterThan(0);
                expect(recentSubmission.id).toBeGreaterThan(0);
            },
        );

        it.skipIf(!process.env["TEST_LEETCODE_SESSION"])(
            "should be able to get recent detailed submission of a user",
            async () => {
                const recentSubmission = await lc.recentDetailedSubmissionOfUser("jacoblincool");
                expect(recentSubmission).toBeTruthy();
                expect(recentSubmission.code.length).toBeGreaterThan(0);
                expect(recentSubmission.id).toBeGreaterThan(0);
            },
        );
    });
});
