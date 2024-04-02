//////////////////////////////////////////////////////////////////////////////
// GraphQL
export interface DetailedProblem {
	questionId?: string;
	questionFrontendId?: string;
	boundTopicId?: unknown;
	title?: string;
	titleSlug?: string;
	translatedTitle?: string | null;
	content?: string;
	translatedContent?: string | null;
	isPaidOnly?: boolean;
	difficulty?: ProblemDifficulty;
	likes?: number;
	dislikes?: number;
	isLiked?: boolean | null;
	similarQuestions?: SimilarQuestion[] | string;
	sampleTestCase?: string;
	exampleTestcases?: string;
	contributors?: unknown[];
	topicTags?: TopicTag[];
	companyTagStats?: OfficialCompanyTagStats | CompanyTagStat[] | null;
	frequency?: number;
	codeSnippets?: CodeSnippet[];
	stats?: Stats | string;
	hints?: string[];
	solution?: OfficialSolution;
	status?: unknown;
	metaData?: unknown;
	judgerAvailable?: boolean;
	judgeType?: string;
	mysqlSchemas?: unknown[];
	enableRunCode?: boolean;
	enableTestMode?: boolean;
	enableDebugger?: boolean;
	envInfo?: string;
	libraryUrl?: string | null;
	adminUrl?: string | null;
	challengeQuestion?: ChallengeQuestion;
	note?: string | null;
	type?: string[];
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

export interface ProblemFieldDetails {
	title: string;
	field: string;
	enable: boolean;
	private: boolean;
	needParsing: boolean;
	needRequestChunking: boolean;
}

export interface AllCompanyTags {
	companyTags: CompanyTagDetail[];
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

export interface RecentSubmission {
	id: string;
	isPending: string;
	memory: string;
	runtime: string;
	time: string;
	timestamp: string;
	title: string;
	titleSlug: string;
	statusDisplay: string;
	lang: string;
	url: string;
}

export interface UserProfile {
	allQuestionsCount: AllQuestionsCount[];
	matchedUser: MatchedUser | null;
	recentSubmissionList: RecentSubmission[] | null;
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

export interface Submission {
	id: number;
	lang: string;
	time: string;
	timestamp: number;
	statusDisplay: SubmissionStatus;
	runtime: number;
	url: string;
	isPending: boolean;
	title: string;
	memory: number;
	titleSlug: string;
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
