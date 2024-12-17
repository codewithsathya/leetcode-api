import type { UserProfile, UserSubmission } from './leetcode-types';

///////////////////////////////////////////////////////////////////////////////
// Cache
export interface CacheItem {
	/**
	 * The key of the item.
	 */
	key: string;

	/**
	 * The value of the item.
	 */
	value: unknown;

	/**
	 * The expiration time of the item in milliseconds since the Unix epoch.
	 */
	expires: number;
}

/**
 * A simple in-memory cache table.
 */
export interface CacheTable {
	[key: string]: CacheItem;
}

///////////////////////////////////////////////////////////////////////////////
// Credential
export interface ICredential {
	/**
	 * The authentication session.
	 */
	session?: string;

	/**
	 * The csrf token.
	 */
	csrf?: string;
}

///////////////////////////////////////////////////////////////////////////////
// LeetCode GraphQL
export interface LeetCodeGraphQLQuery {
	operationName?: string;
	variables?: { [key: string]: unknown };
	query: string;
	headers?: { [key: string]: string };
}

export interface LeetCodeGraphQLResponse {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: UserProfile | UserSubmission[] | any;
}

export interface QuestionOfList {
	difficulty: string;
	id: number;
	paidOnly: boolean;
	questionFrontendId: string;
	status: string;
	title: string;
	titleSlug: string;
	topicTags: Array<{
		title: string;
		slug: string;
	}>;
	isInMyFavorites: boolean;
	frequency: number | null;
	acRate: number | null;
	__typename: string;
}
