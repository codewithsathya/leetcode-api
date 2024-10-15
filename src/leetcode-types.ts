//////////////////////////////////////////////////////////////////////////////
// GraphQL
export interface QueryParams {
	category?: string;
	offset?: number;
	limit?: number;
	filters?: {
		difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
		tags?: string[];
	};
}

export interface LeetcodeProblem {
	title: string;
	difficulty: ProblemDifficulty;
	topicTags: TopicTag[];
	companyTagStats: OfficialCompanyTagStats | null;
	frequency: number;
	similarQuestions: SimilarQuestion[] | string;
	questionFrontendId: string;
	isPaidOnly: boolean;
	solution: LeetcodeSolution;
	questionId: string;
	likes: number;
	dislikes: number;
	stats: Stats | string;
	titleSlug: string;
}

export interface LeetcodeSolution {
	url: string;
	paidOnly: boolean;
	hasVideoSolution: boolean;
}

export interface DetailedProblem {
	allowDiscuss?: boolean;
	article?: Article;
	categoryTitle?: string;
	codeDefinition?: CodeDefinition[];
	codeSnippets?: CodeSnippet[];
	companyTagStats?: OfficialCompanyTagStats | null;
	content?: string;
	difficulty?: ProblemDifficulty;
	dislikes?: number;
	enableRunCode?: boolean;
	enableSubmit?: boolean;
	enableTestMode?: boolean;
	frequency?: number;
	hints?: string[];
	infoVerified?: boolean;
	interpretUrl?: string;
	isLiked?: true | null;
	isPaidOnly?: boolean;
	judgeType?: string;
	judgerAvailable?: boolean;
	langToValidPlayground?: Record<string, boolean>;
	libraryUrl?: string | null;
	likes?: number;
	metaData?: string;
	mysqlSchemas?: string[];
	nextChallengePairs?: NextChallengePair[] | null;
	note?: string | null;
	questionDetailUrl?: string;
	questionFrontendId?: string;
	questionId?: string;
	questionTitle?: string;
	questionTitleSlug?: string;
	questionType?: string;
	sampleTestCase?: string;
	sessionId?: string;
	similarQuestions?: SimilarQuestion[];
	solution?: OfficialSolution;
	stats?: Stats;
	status?: string | null;
	submitUrl?: string;
	title?: string;
	titleSlug?: string;
	topicTags?: TopicTag[];
	translatedContent?: string | null;
	translatedTitle?: string | null;
}

export interface NextChallengePair {
	question_title: string;
	question_title_slug: string;
	difficulty: 'E' | 'M' | 'H';
}

export interface CodeDefinition {
	value: string;
	text: string;
	defaultCode: string;
}

export interface Article {
	id: number;
	url: string;
	topicId: number;
}

export interface SimilarQuestion {
	title: string;
	titleSlug: string;
	difficulty: ProblemDifficulty;
	translatedTitle: string | null;
}

export interface CompanyTagStat {
	company: string;
	frequency: number;
}

export interface OfficialCompanyTagStats {
	[type: string]: {
		taggedByAdmin: boolean;
		name: string;
		slug: string;
		timesEncountered: number;
	}[];
}

export interface Stats {
	totalAccepted: string;
	totalSubmission: string;
	totalAcceptedRaw: number;
	totalSubmissionRaw: number;
	acRate: string;
}

export interface CodeSnippet {
	lang: string;
	langSlug: string;
	code: string;
}

export interface OfficialSolution {
	canSeeDetail: boolean;
	content: string | null;
	contentTypeId: string;
	id: string;
	rating: {
		average: string;
		count: number;
		id: string;
		userRating: {
			id: string;
			score: number;
		} | null;
	};
	title: string;
	url: string;
	paidOnly: boolean;
	hasVideoSolution: boolean;
	paidOnlyVideo: boolean;
}

export interface ChallengeQuestion {
	id: string;
	date: string;
	incompleteChallengeCount: number;
	streakCount: number;
	type: string;
}

export interface ProblemFieldDetails {
	title: string;
	property: keyof DetailedProblem;
	graphql: string;
	enable: boolean;
	private: boolean;
	isPremium: boolean;
	needParsing: boolean;
	needRequestChunking: boolean;
	problemsPerRequest: number;
}

export interface AllCompanyTags {
	companyTags: CompanyTagDetail[];
}

export interface MinimalCompanyTagDetail {
	name: string;
	questions: { questionFrontendId: string }[];
}

export interface TopicTagDetails {
	questionFrontendId: string;
	topicTags: { name: string }[];
}

export interface CompanyTagDetail {
	id: string;
	imgUrl: string;
	name: string;
	slug: string;
	questionCount: number;
	questionIds: number[];
	frequencies: string;
}

export interface EasterEggStatus {
	isEasterEggCollected: boolean;
}

export interface AllQuestionsCount {
	difficulty: string;
	count: number;
}

export interface Contributions {
	points: number;
	questionCount: number;
	testcaseCount: number;
}

export interface Profile {
	realName: string;
	websites: string[];
	countryName: string | null;
	skillTags: string[];
	company: string | null;
	school: string | null;
	starRating: number;
	aboutMe: string;
	userAvatar: string;
	reputation: number;
	ranking: number;
}

export interface AcSubmissionNum {
	difficulty: string;
	count: number;
	submissions: number;
}

export interface TotalSubmissionNum {
	difficulty: string;
	count: number;
	submissions: number;
}

export interface SubmitStats {
	acSubmissionNum: AcSubmissionNum[];
	totalSubmissionNum: TotalSubmissionNum[];
}

export interface Badge {
	id: string;
	displayName: string;
	icon: string;
	creationDate?: string;
}

export interface MatchedUser {
	username: string;
	socialAccounts: unknown;
	githubUrl: null;
	contributions: Contributions;
	profile: Profile;
	submissionCalendar: string;
	submitStats: SubmitStats;
	badges: Badge[];
	upcomingBadges: Badge[];
	activeBadge: Badge | null;
}

export interface UserProfile {
	allQuestionsCount: AllQuestionsCount[];
	matchedUser: MatchedUser | null;
	recentSubmissionList: UserSubmission[] | null;
}

export interface Contest {
	title: string;
	startTime: number;
}

export interface ContestInfo {
	attended: boolean;
	trendDirection: string;
	problemsSolved: number;
	totalProblems: number;
	finishTimeInSeconds: number;
	rating: number;
	ranking: number;
	contest: Contest;
}
export interface ContestRanking {
	attendedContestsCount: number;
	rating: number;
	globalRanking: number;
	totalParticipants: number;
	topPercentage: number;
	badge: null | {
		name: string;
	};
}

export interface UserContestInfo {
	userContestRanking: ContestRanking;
	userContestRankingHistory: ContestInfo[];
}

export interface TopicTag {
	name: string;
	slug: string;
	translatedName: string | null;
}

export interface CodeSnippet {
	lang: string;
	langSlug: string;
	code: string;
}

export interface OfficialSolution {
	id: string;
	canSeeDetail: boolean;
	paidOnly: boolean;
	hasVideoSolution: boolean;
	paidOnlyVideo: boolean;
}

export interface ChallengeQuestion {
	id: string;
	date: string;
	incompleteChallengeCount: number;
	streakCount: number;
	type: string;
}

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
	questionId: string;
	questionFrontendId: string;
	boundTopicId: unknown;
	title: string;
	titleSlug: string;
	content: string;
	translatedTitle: string | null;
	translatedContent: string | null;
	isPaidOnly: boolean;
	difficulty: ProblemDifficulty;
	likes: number;
	dislikes: number;
	isLiked: boolean | null;
	similarQuestions: string;
	exampleTestcases: string;
	contributors: unknown[];
	topicTags: TopicTag[];
	companyTagStats: unknown;
	codeSnippets: CodeSnippet[];
	stats: string;
	hints: string[];
	solution: OfficialSolution;
	status: unknown;
	sampleTestCase: string;
	metaData: string;
	judgerAvailable: boolean;
	judgeType: string;
	mysqlSchemas: unknown[];
	enableRunCode: boolean;
	enableTestMode: boolean;
	enableDebugger: boolean;
	envInfo: string;
	libraryUrl: string | null;
	adminUrl: string | null;
	challengeQuestion: ChallengeQuestion;
	/** null if not logged in */
	note: string | null;
}

//////////////////////////////////////////////////////////////////////////////
// API
export type SubmissionStatus =
	| 'Accepted'
	| 'Wrong Answer'
	| 'Time Limit Exceeded'
	| 'Memory Limit Exceeded'
	| 'Output Limit Exceeded'
	| 'Compile Error'
	| 'Runtime Error';

export interface UserSubmission {
	id: string;
	isPending: string;
	memory: string;
	runtime: string;
	time: string;
	timestamp: string;
	title: string;
	titleSlug: string;
	statusDisplay: SubmissionStatus;
	lang: string;
	url: string;
}

export interface Submission {
	id: number;
	question_id: number;
	lang: string;
	lang_name: string;
	time: string;
	timestamp: number;
	status: number;
	status_display: SubmissionStatus;
	runtime: string;
	url: string;
	is_pending: boolean;
	title: string;
	memory: number;
	code: string;
	compare_result: string;
	title_slug: string;
	has_notes: boolean;
	flat_type: number;
}

export interface SubmissionsDump {
	submissions_dump: Submission[];
	has_next: string;
	last_key: string;
}

export interface Whoami {
	userId: number | null;
	username: string;
	avatar: string | null;
	isSignedIn: boolean;
	isMockUser: boolean;
	isPremium: boolean | null;
	isAdmin: boolean;
	isSuperuser: boolean;
	isTranslator: boolean;
	activeSessionId: string;
	checkedInToday: string;
	permissions: string[];
}

export interface SubmissionDetail {
	id: number;
	problem_id: number;
	runtime: number;
	runtime_distribution: [number, number][];
	runtime_percentile: number;
	memory: number;
	memory_distribution: [number, number][];
	memory_percentile: number;
	code: string;
	details: {
		status_code: number;
		runtime: string;
		memory: string;
		total_correct: string;
		total_testcases: string;
		compare_result: string;
		input_formatted: string;
		input: string;
		expected_output: string;
		code_output: string;
		last_testcase: string;
	};
}

export interface ProblemList {
	total: number;
	questions: {
		acRate: number;
		difficulty: 'Easy' | 'Medium' | 'Hard';
		freqBar: null;
		questionFrontendId: string;
		isFavor: boolean;
		isPaidOnly: boolean;
		status: string | null;
		title: string;
		titleSlug: string;
		topicTags: {
			name: string;
			id: string;
			slug: string;
		}[];
		hasSolution: boolean;
		hasVideoSolution: boolean;
	}[];
}

export interface DailyChallenge {
	date: string;
	link: string;
	question: Problem;
}
