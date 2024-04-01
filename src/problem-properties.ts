import type { ProblemFieldDetails } from "./leetcode-types";

const problemProperties: ProblemFieldDetails[] = [
    {
        title: "Question ID",
        field: "questionId",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Question Number",
        field: "questionFrontendId",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Bound Topic Id",
        field: "boundTopicId",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Title",
        field: "title",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Title Slug",
        field: "titleSlug",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Translated Title",
        field: "translatedTitle",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Content",
        field: "content",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Translated Content",
        field: "translatedContent",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Question is paid or not?",
        field: "isPaidOnly",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Likes",
        field: "likes",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Dislikes",
        field: "dislikes",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Liked",
        field: "isLiked",
        enable: false,
        private: true,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Difficulty",
        field: "difficulty",
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Similar questions",
        field: "similarQuestions",
        enable: true,
        private: false,
        needParsing: true,
        needRequestChunking: false,
    },
    {
        title: "Sample test case",
        field: "sampleTestCase",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: true,
    },
    {
        title: "Example test cases",
        field: "exampleTestcases",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: true,
    },
    {
        title: "Contributors",
        field: `contributors {
        username
        profileUrl
        avatarUrl
      }`,
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Topic tags",
        field: `topicTags {
      name
      slug
      translatedName
    }`,
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Company tag stats",
        field: "companyTagStats",
        enable: true,
        private: false,
        needParsing: true,
        needRequestChunking: false,
    },
    {
        title: "Code snippets",
        field: `codeSnippets {
      lang
      langSlug
      code
    }`,
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: true,
    },
    {
        title: "Stats",
        field: "stats",
        enable: true,
        private: false,
        needParsing: true,
        needRequestChunking: false,
    },
    {
        title: "Hints",
        field: "hints",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Solution",
        field: `solution {
      id
      canSeeDetail
      paidOnly
      hasVideoSolution
      paidOnlyVideo
    }`,
        enable: true,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Status",
        field: "status",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Metadata",
        field: "metaData",
        enable: false,
        private: false,
        needParsing: true,
        needRequestChunking: false,
    },
    {
        title: "Judger",
        field: "judgerAvailable",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Judge type",
        field: "judgeType",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "MySQL Schemas",
        field: "mysqlSchemas",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Code running enabled",
        field: "enableRunCode",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Test mode enabled",
        field: "enableTestMode",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Debugger enabled",
        field: "enableDebugger",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Environment info",
        field: "envInfo",
        enable: false,
        private: false,
        needParsing: true,
        needRequestChunking: false,
    },
    {
        title: "Library URL",
        field: "libraryUrl",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Admin URL",
        field: "adminUrl",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Challenge Question",
        field: `challengeQuestion {
      id
      date
      incompleteChallengeCount
      streakCount
      type
    }`,
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
    {
        title: "Note",
        field: "note",
        enable: false,
        private: false,
        needParsing: false,
        needRequestChunking: false,
    },
];

export default problemProperties;
