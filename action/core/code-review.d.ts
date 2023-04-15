import { Context } from "probot";
import { OpenAI } from './openai-helper';
export declare class CodeReview {
    openai: OpenAI;
    constructor();
    review(context: Context<'pull_request.opened'>): Promise<void>;
    private generatePrompt;
}
