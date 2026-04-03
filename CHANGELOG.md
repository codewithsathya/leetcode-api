# Changelog

All notable changes to `@leetnotion/leetcode-api` are documented in this file.

## [3.0.0] - 2026-04-03

### Breaking Changes

- Extracted `BaseLeetCode` and `BaseCredential` abstract base classes — `LeetCode` and `LeetCodeCN` now extend `BaseLeetCode` instead of `EventEmitter` directly
- Renamed CN credential class from `Credential` to `CredentialCN` (exported from `credential-cn.ts`)
- Renamed CN-specific types with `CN` prefix (`UserResult` → `CNUserResult`, `Profile` → `CNProfile`, etc.)
- `LeetCodeCN.user()` now returns `CNUserResult` instead of `UserResult`
- Constructor `cache` parameter now defaults to `new Cache()` instead of a shared singleton `default_cache`
- Removed `src/problem-properties.ts` (superseded by new type definitions)

### Added

- **`LeetCodeCLI` class** (`src/leetcode-cli.ts`) — extends `LeetCode` with REST API methods for code execution:
  - `testCode()` — run code against test cases
  - `submitCode()` — submit code for judging
  - `pollJudgeResult()` — poll submission/interpret results with rate limiting and timeout
  - `categoryProblems()` — fetch problems by category via REST API
  - `problemSubmissions()` — fetch submissions for a specific problem
  - `getSessions()` / `changeSession()` / `createSession()` — session management
  - `getFavorites()` / `star()` / `unstar()` — favorites management
  - `getTopVotedSolution()` — fetch top voted solution for a problem
- **`LeetCodeAdvanced` new methods:**
  - `getQuestionDetailsByTitleSlug()` — detailed question info with 10-minute cache
  - `getContestQuestions()` — fetch contest questions via REST API
  - `getPastContests()` — paginated past contest history
- New GraphQL queries: `past-contests`, `question-detail`, `add-question-to-favorite`, `remove-question-from-favorite`, `solution-by-id`, `top-voted-solution-id`
- New type definitions in `leetcode-cli-types.ts` (JudgeResult, TestCodeOptions, SubmitCodeOptions, etc.)
- New type definitions in `leetcode-types.ts` (QuestionDetail, LanguageListItem, ContestQuestions, PastContests, etc.)
- Exported `BaseCredential`, `BaseLeetCode`, `CredentialCN`, `LeetCodeCLI`, and CLI types from package index
- New tests for `LeetCodeCLI`, `LeetCodeCN`, `RateLimiter`, and extended tests for `LeetCode`

### Changed

- Unified `graphql()` method in `BaseLeetCode` — eliminates duplicate GraphQL handling across `LeetCode` and `LeetCodeCN`
- Added default cache times to frequently called methods (profiles: 5min, problems: 10min, recent submissions: 30s)
- Rate limiter `lock()`/`unlock()` now uses `try/finally` pattern consistently instead of `try/catch`
- `submissions()` now correctly slices results to requested `limit`
- `submission()` detail parsing uses `JSON.parse` instead of `new Function()` for safer evaluation
- `daily.graphql` query now includes `userStatus` field

## [2.0.0] - 2026-03-28

### Breaking Changes

- Renamed package from `leetcode-query` to `@leetnotion/leetcode-api`
- Changed `getLeetcodeProblems` and `topicTags` method signatures to use an options object instead of positional parameters
- `getProblemTypes` now returns `Record<string, string>` instead of `Record<string, string[]>`

### Changed

- Replaced GraphQL-based `getProblemTypes` and `getTitleSlugQuestionNumberMapping` with REST API (`/api/problems/{category}/`) for faster single-request fetching
- Adapted APIs to work with new LeetCode API changes
- Switched CI/CD from self-hosted runners to GitHub-hosted runners (`ubuntu-latest`)
- Upgraded npm package dependencies

## [1.10.0] - 2024-12-17

### Added

- `getLists` method to fetch user's LeetCode lists (authenticated)
- `getQuestionsOfList` method to fetch questions within a list (authenticated)

## [1.9.0] - 2024-10-15

### Changed

- Refactored submission retrieval methods for improved reliability

## [1.8.4] - 2024-10-13

### Added

- `getTitleSlugQuestionNumberMapping` method to get title slug to question number mapping

## [1.8.3] - 2024-09-21

### Changed

- Updated dependency versions

## [1.8.2] - 2024-04-10

### Fixed

- Fixed `checkIn` method

## [1.8.1] - 2024-04-10

### Fixed

- Fixed `checkIn` method

## [1.8.0] - 2024-04-09

### Added

- `topicTags` method to get topic tags per question
- `companyTags` method to get all company tag details
- `getQuestionIdCompanyTagsMapping` method (premium, authenticated)

## [1.7.1] - 2024-04-07

### Fixed

- Fixed type definitions

## [1.7.0] - 2024-04-07

### Added

- `getLeetcodeProblems` method for fetching custom problems with configurable properties
- `detailedProblems` and `problemsOfProperty` methods in `LeetCodeAdvanced`

## [1.6.0] - 2024-04-03

### Changed

- `submissions` method now returns `Submission` type instead of `RecentSubmission`
- Added changeset configuration for version management

## [1.5.0] - 2024-04-02

### Added

- `recentSubmission` method to get the most recent submission of the authenticated user
- `recentSubmissionOfUser` method to get the most recent submission of any user
- `collectEasterEgg` method
- `isEasterEggCollected` method

## [1.4.0] - 2024-04-02

### Added

- `detailedProblems` method with configurable problem properties
- `problemsOfProperty` method for granular problem data fetching
- Configurable problem properties system

## [1.3.0] - 2024-03-31

### Added

- `whoami` method to check authenticated user info
- `checkIn` method to collect daily coin
- `isEasterEggCollected` method
- JSDoc comments across the API
- `noOfProblems` method

### Fixed

- Removed unnecessary dependencies
- Fixed `whoami` implementation

## [1.2.3] - 2024-03-30

### Added

- Initial release of `@leetnotion/leetcode-api` (forked from `leetcode-query`)
- Core `LeetCode` class with user profiles, submissions, problems, and daily challenge
- `LeetCodeCN` class for LeetCode.cn support
- `Credential` management for authenticated access
- Rate limiter (20 req / 10 sec default)
- Customizable fetcher and cache
- GraphQL query API
