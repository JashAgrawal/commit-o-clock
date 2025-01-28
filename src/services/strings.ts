export const COMMIT_TYPES = {
    FEAT: 'feat',
    FIX: 'fix',
    DOCS: 'docs',
    STYLE: 'style',
    REFACTOR: 'refactor',
    PERF: 'perf',
    TEST: 'test',
    CHORE: 'chore'
} as const;

export const COMMIT_TYPE_DESCRIPTIONS = {
    [COMMIT_TYPES.FEAT]: 'A new feature',
    [COMMIT_TYPES.FIX]: 'A bug fix',
    [COMMIT_TYPES.DOCS]: 'Documentation changes',
    [COMMIT_TYPES.STYLE]: 'Code style changes (formatting, missing semi colons, etc)',
    [COMMIT_TYPES.REFACTOR]: 'Code changes that neither fixes a bug nor adds a feature',
    [COMMIT_TYPES.PERF]: 'Code changes that improve performance',
    [COMMIT_TYPES.TEST]: 'Adding missing tests',
    [COMMIT_TYPES.CHORE]: 'Changes to the build process or auxiliary tools'
} as const;

export const DEFAULT_FORMAT = `
<type>(<scope>): <title>

<description>

<footer>
BreakingChange
Before / After
</footer>`;

export const PROMPT_SECTIONS = {
    STARTER: `You are an git veteran working as a Commit Message Generator. 
Your task is to analyze the given details and generate a commit message that follows the provided format.
Analyze the given Last Commit Message and the Current Changes (git diff of the changes) 
to generate a concise and meaningful commit message.`,

    INSTRUCTIONS: `Instructions:
1. Keep the type and scope concise
2. Write clear, actionable descriptions
3. Provide detailed explanations in the body
4. Highlight breaking changes and effects
5. Use bullet points for key changes (max 4 points)
6. Avoid jargon and maintain clarity
7. Focus on the current changes, not the last commit`,

    FORMAT_DESCRIPTION: `
type: Type of change (e.g., feat, fix, docs, style, refactor, perf, test, chore)
scope: Scope of the change (e.g., auth, api, ui)
title: A short summary of the changes
description: Bullet points summarizing key changes (max 4 points)
footer: Contains breaking changes and before/after effects`,

    EXAMPLES: {
        AUTH: {
            title: 'feat(auth): implement JWT authentication',
            description: `- Add JWT token generation and validation
- Create middleware for protected routes
- Add refresh token mechanism
- Implement token blacklisting`,
            footer: 'BREAKING CHANGE: Authentication header now requires Bearer token'
        },
        API: {
            title: 'fix(api): handle rate limit errors',
            description: `- Implemented exponential backoff
- Added retry mechanism
- Improved error messages
- Added rate limit monitoring`,
            footer: `Before: Errors crash the app
After: Handle errors gracefully with retries`
        }
    },

    INPUT_TEMPLATE: `
Last Commit Message (for reference):
{lastCommitMessage}

Current Changes (git diff):
{diffSummary}
`
} as const;