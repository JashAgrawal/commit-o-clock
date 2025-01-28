import { COMMIT_TYPES, COMMIT_TYPE_DESCRIPTIONS, DEFAULT_FORMAT, PROMPT_SECTIONS } from './strings';

export interface CommitExample {
    title: string;
    description: string;
    footer: string;
}

export class PromptBuilder {
    private systemInstruction: string = '';
    private format: string = DEFAULT_FORMAT;
    private examples: CommitExample[] = [
        PROMPT_SECTIONS.EXAMPLES.AUTH,
        PROMPT_SECTIONS.EXAMPLES.API
    ];

    /**
     * Set a custom format for the commit messages
     */
    setFormat(format: string): this {
        if (format.trim()) {
            this.format = format;
        }
        return this;
    }

    /**
     * Add a custom example to the prompt
     */
    addExample(example: CommitExample): this {
        this.examples = [...this.examples.slice(-1), example];
        return this;
    }

    /**
     * Build the complete system instruction
     */
    buildSystemInstruction(): string {
        const typesList = Object.entries(COMMIT_TYPE_DESCRIPTIONS)
            .map(([type, desc]) => `- ${type}: ${desc}`)
            .join('\n');

        const examplesText = this.examples
            .map((example, index) => `
Example ${index + 1}:
${example.title}

${example.description}

${example.footer}`)
            .join('\n\n');

        this.systemInstruction = `
${PROMPT_SECTIONS.STARTER}

Format:
${this.format}

${PROMPT_SECTIONS.FORMAT_DESCRIPTION}

Types:
${typesList}

${PROMPT_SECTIONS.INSTRUCTIONS}

Examples:
${examplesText}
`;

        return this.systemInstruction;
    }

    /**
     * Build the input prompt with the actual git changes
     */
    buildInputPrompt(lastCommitMessage: string, diffSummary: string): string {
        return PROMPT_SECTIONS.INPUT_TEMPLATE
            .replace('{lastCommitMessage}', lastCommitMessage)
            .replace('{diffSummary}', diffSummary);
    }

    /**
     * Get the complete prompt combining system instruction and input
     */
    buildCompletePrompt(lastCommitMessage: string, diffSummary: string): string {
        return `${this.buildSystemInstruction()}

${this.buildInputPrompt(lastCommitMessage, diffSummary)}

Generate a commit message following the specified format.`;
    }

    /**
     * Get the current system instruction
     */
    getCurrentSystemInstruction(): string {
        return this.systemInstruction || this.buildSystemInstruction();
    }
}