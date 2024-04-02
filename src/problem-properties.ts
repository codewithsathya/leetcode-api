import type { ProblemFieldDetails } from './leetcode-types';

const problemProperties: ProblemFieldDetails[] = [
	{
		title: 'Allow discussion',
		property: 'allowDiscuss',
		graphql: 'allowDiscuss',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Article',
		property: 'article',
		graphql: 'article',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Category title',
		property: 'categoryTitle',
		graphql: 'categoryTitle',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Code definition',
		property: 'codeDefinition',
		graphql: 'codeDefinition',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Code snippets',
		property: 'codeSnippets',
		graphql: `codeSnippets {
      code
      lang
      langSlug
    }`,
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: true,
		problemsPerRequest: 200,
	},
	{
		title: 'Company tag stats',
		property: 'companyTagStats',
		graphql: 'companyTagStats',
		enable: true,
		private: true,
		isPremium: true,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Content',
		property: 'content',
		graphql: 'content',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: true,
		problemsPerRequest: 500,
	},
	{
		title: 'Difficulty',
		property: 'difficulty',
		graphql: 'difficulty',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Dislikes',
		property: 'dislikes',
		graphql: 'dislikes',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Enable run code',
		property: 'enableRunCode',
		graphql: 'enableRunCode',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Enable submit',
		property: 'enableSubmit',
		graphql: 'enableSubmit',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Enable test mode',
		property: 'enableTestMode',
		graphql: 'enableTestMode',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Frequency',
		property: 'frequency',
		graphql: 'frequency',
		enable: true,
		private: true,
		isPremium: true,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Hints',
		property: 'hints',
		graphql: 'hints',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Info verified',
		property: 'infoVerified',
		graphql: 'infoVerified',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Info verified',
		property: 'infoVerified',
		graphql: 'infoVerified',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Interpret url',
		property: 'interpretUrl',
		graphql: 'interpretUrl',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Is liked',
		property: 'isLiked',
		graphql: 'isLiked',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Is paid only',
		property: 'isPaidOnly',
		graphql: 'isPaidOnly',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Judge type',
		property: 'judgeType',
		graphql: 'judgeType',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Judger available',
		property: 'judgerAvailable',
		graphql: 'judgerAvailable',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Lang to valid playground',
		property: 'langToValidPlayground',
		graphql: 'langToValidPlayground',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Library URL',
		property: 'libraryUrl',
		graphql: 'libraryUrl',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Likes',
		property: 'likes',
		graphql: 'likes',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Metadata',
		property: 'metaData',
		graphql: 'metaData',
		enable: false,
		private: false,
		isPremium: false,
		// This can also be parsed.
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Mysql schemas',
		property: 'mysqlSchemas',
		graphql: 'mysqlSchemas',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Next challenge pairs',
		property: 'nextChallengePairs',
		graphql: 'nextChallengePairs',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: true,
		needRequestChunking: true,
		problemsPerRequest: 500,
	},
	{
		title: 'Note',
		property: 'note',
		graphql: 'note',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question detail URL',
		property: 'questionDetailUrl',
		graphql: 'questionDetailUrl',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question frontend ID',
		property: 'questionFrontendId',
		graphql: 'questionFrontendId',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question ID',
		property: 'questionId',
		graphql: 'questionId',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question title',
		property: 'questionTitle',
		graphql: 'questionTitle',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question title slug',
		property: 'questionTitleSlug',
		graphql: 'questionTitleSlug',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question type',
		property: 'questionType',
		graphql: 'questionType',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Question type',
		property: 'questionType',
		graphql: 'questionType',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Sample testcase',
		property: 'sampleTestCase',
		graphql: 'sampleTestCase',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: true,
		problemsPerRequest: 500,
	},
	{
		title: 'Session ID',
		property: 'sessionId',
		graphql: 'sessionId',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Similar questions',
		property: 'similarQuestions',
		graphql: 'similarQuestions',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Solution',
		property: 'solution',
		graphql: `solution {
        canSeeDetail
        content
        contentTypeId
        id
        rating {
          average
          count
          id
          userRating {
            id
            score
          }
        }
        title
        url
        paidOnly
        hasVideoSolution
        paidOnlyVideo
      }`,
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: true,
		problemsPerRequest: 100,
	},
	{
		title: 'Stats',
		property: 'stats',
		graphql: 'stats',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: true,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Status',
		property: 'status',
		graphql: 'status',
		enable: false,
		private: true,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Submit URL',
		property: 'submitUrl',
		graphql: 'submitUrl',
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Title',
		property: 'title',
		graphql: 'title',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Title slug',
		property: 'titleSlug',
		graphql: 'titleSlug',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Title slug',
		property: 'titleSlug',
		graphql: 'titleSlug',
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Topic tags',
		property: 'topicTags',
		graphql: `topicTags {
        name
        slug
        translatedName
      }`,
		enable: true,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Translated content',
		property: `translatedContent`,
		graphql: `translatedContent`,
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
	{
		title: 'Translated title',
		property: 'translatedTitle',
		graphql: `translatedTitle`,
		enable: false,
		private: false,
		isPremium: false,
		needParsing: false,
		needRequestChunking: false,
		problemsPerRequest: 100000,
	},
];

export default problemProperties;