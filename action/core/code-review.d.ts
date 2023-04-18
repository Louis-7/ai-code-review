import { Context } from "probot";
import { OpenAI } from './openai-helper';
export declare class CodeReview {
    PATH_TO_EXCLUDE: string;
    openai: OpenAI;
    constructor();
    review(context: Context<'pull_request.opened' | 'pull_request.synchronize'>): Promise<void>;
    private generatePrompt;
    private isExcluded;
}
