// src/leetcode-cli-types.ts

/** Result from /submissions/detail/$id/check/ polling */
export interface JudgeResult {
	ok: boolean;
	lang: string;
	runtime: string;
	runtime_percentile: number | string;
	memory: string;
	memory_percentile: number | string;
	state: string;
	testcase: string;
	passed: number;
	total: number;
	error: string[];
	stdout: string;
	answer: string | string[];
	expected_answer: string | string[];
}

/** Raw response from /submissions/detail/$id/check/ */
export interface JudgeCheckResponse {
	state: 'PENDING' | 'STARTED' | 'SUCCESS';
	run_success?: boolean;
	status_msg?: string;
	status_runtime?: string;
	runtime_percentile?: number;
	status_memory?: string;
	memory_percentile?: number;
	lang?: string;
	input?: string;
	last_testcase?: string;
	code_output?: string | string[];
	code_answer?: string | string[];
	expected_code_answer?: string | string[];
	expected_output?: string;
	std_output?: string;
	total_correct?: number;
	total_testcases?: number;
	runtime_error?: string;
	compile_error?: string;
	syntax_error?: string;
	submission_id?: string;
}

/** Options for testing code */
export interface TestCodeOptions {
	slug: string;
	lang: string;
	questionId: number;
	typedCode: string;
	dataInput: string;
}

/** Options for submitting code */
export interface SubmitCodeOptions {
	slug: string;
	lang: string;
	questionId: number;
	typedCode: string;
}

/** Response from interpret_solution endpoint */
export interface InterpretResponse {
	interpret_id: string;
	interpret_expected_id?: string;
}

/** Response from submit endpoint */
export interface SubmitResponse {
	submission_id: number;
}

/** LeetCode session object */
export interface LeetCodeSession {
	id: number;
	name: string;
	is_active: boolean;
	ac_questions: number;
	submitted_questions: number;
	total_acs: number;
	total_submitted: number;
}

/** User favorites response */
export interface FavoritesResponse {
	user_name: string;
	favorites: {
		private_favorites: FavoriteList[];
		public_favorites: FavoriteList[];
	};
}

export interface FavoriteList {
	id_hash: string;
	name: string;
	is_public_favorite: boolean;
	questions: number[];
}

/** Problem from the REST /api/problems/$category/ endpoint */
export interface CategoryProblem {
	id: number;
	fid: number;
	name: string;
	slug: string;
	link: string;
	locked: boolean;
	percent: number;
	level: string;
	state: string;
	starred: boolean;
	category: string;
}

/** Raw response from /api/problems/$category/ */
export interface CategoryProblemsResponse {
	user_name: string;
	num_solved: number;
	num_total: number;
	ac_easy: number;
	ac_medium: number;
	ac_hard: number;
	stat_status_pairs: {
		stat: {
			question_id: number;
			frontend_question_id: number;
			question__title: string;
			question__title_slug: string;
			question__hide: boolean;
			total_acs: number;
			total_submitted: number;
		};
		status: string | null;
		difficulty: { level: number };
		paid_only: boolean;
		is_favor: boolean;
	}[];
	category_slug: string;
}

/** Problem submission from REST /api/submissions/$slug */
export interface ProblemSubmission {
	id: string;
	url: string;
	status_display: string;
	lang: string;
	title: string;
	timestamp: number;
	runtime: string;
	memory: string;
}

/** Top voted solution from discussions */
export interface TopVotedSolution {
	id: string;
	title: string;
	content: string;
	author: string;
	votes: number;
	link: string;
}
