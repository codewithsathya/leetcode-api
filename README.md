# @leetnotion/leetcode-api

A TypeScript library for interacting with LeetCode's API. Supports both LeetCode.com and LeetCode.cn, with authenticated and unauthenticated access, rate limiting, caching, and custom GraphQL queries.

## Installation

```bash
npm install @leetnotion/leetcode-api
# or
pnpm add @leetnotion/leetcode-api
```

## Features

### Without Authentication

- Get public user profile
- Get user's recent submissions (max: 20)
- Get user contest records
- Get problem list with optional filters (difficulty, tags)
- Get problem detail by slug
- Get daily challenge
- Get problem types for all questions
- Get title slug to question number mapping
- Get topic tags for all questions
- Get company tags

### With Authentication

- Get all submissions of the authenticated user
- Get submission details (code, percentiles)
- Check in to collect a coin
- Get and collect easter eggs
- Get user's LeetCode lists and questions within a list
- Get company tags per question (premium)

### Advanced

- `LeetCodeAdvanced` class with detailed problem fetching, custom problem properties, and batch operations
- `LeetCodeCN` class for LeetCode.cn
- Customizable GraphQL query API
- Customizable rate limiter (default: 20 req / 10 sec)
- Customizable fetcher (e.g., use Playwright for browser-based requests)
- In-memory TTL cache (replaceable)

## Usage

### Get a User's Public Profile

```typescript
import { LeetCode } from '@leetnotion/leetcode-api';

const leetcode = new LeetCode();
const user = await leetcode.user('username');
```

### Get Daily Challenge

```typescript
import { LeetCode } from '@leetnotion/leetcode-api';

const leetcode = new LeetCode();
const daily = await leetcode.daily();
```

### Get Problem Detail

```typescript
import { LeetCode } from '@leetnotion/leetcode-api';

const leetcode = new LeetCode();
const problem = await leetcode.problem('two-sum');
```

### Get Problems with Filters

```typescript
import { LeetCode } from '@leetnotion/leetcode-api';

const leetcode = new LeetCode();
const problems = await leetcode.problems({
    category: 'algorithms',
    offset: 0,
    limit: 50,
    filters: { difficulty: 'MEDIUM' },
});
```

### Get All Submissions (Authenticated)

```typescript
import { LeetCode, Credential } from '@leetnotion/leetcode-api';

const credential = new Credential();
await credential.init('YOUR-LEETCODE-SESSION-COOKIE');

const leetcode = new LeetCode(credential);
const submissions = await leetcode.submissions({ limit: 100, offset: 0 });
```

### Get Problem Types

```typescript
import { LeetCodeAdvanced } from '@leetnotion/leetcode-api';

const leetcode = new LeetCodeAdvanced();
const problemTypes = await leetcode.getProblemTypes();
// { "1": "algorithms", "595": "database", ... }
```

### Get Title Slug to Question Number Mapping

```typescript
import { LeetCodeAdvanced } from '@leetnotion/leetcode-api';

const leetcode = new LeetCodeAdvanced();
const mapping = await leetcode.getTitleSlugQuestionNumberMapping();
// { "two-sum": "1", "add-two-numbers": "2", ... }
```

### Use Custom Fetcher

You can use your own fetcher, for example, fetch through a real browser.

```typescript
import { LeetCode, fetcher } from '@leetnotion/leetcode-api';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

const _browser = chromium.use(stealth()).launch();
const _page = _browser
    .then((browser) => browser.newPage())
    .then(async (page) => {
        await page.goto('https://leetcode.com');
        return page;
    });

fetcher.set(async (...args) => {
    const page = await _page;
    const res = await page.evaluate(async (args) => {
        const res = await fetch(...args);
        return {
            body: await res.text(),
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers),
        };
    }, args);
    return new Response(res.body, res);
});

const lc = new LeetCode();
const daily = await lc.daily();
console.log(daily);
await _browser.then((browser) => browser.close());
```

## Links

- NPM Package: <https://www.npmjs.com/package/@leetnotion/leetcode-api>
- GitHub Repository: <https://github.com/codewithsathya/leetcode-api>
