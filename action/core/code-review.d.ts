import { Context } from "probot";
import { OpenAI } from './openai-helper';
export declare class CodeReview {
    PATH_TO_EXCLUDE: string;
    MAX_FILE_PER_PR: number;
    MAX_PATCH_PER_FILE: number;
    openai: OpenAI;
    constructor();
    review(context: Context<'pull_request.opened' | 'pull_request.synchronize'>): Promise<void>;
    private generatePrompt;
    private isExcluded;
    private preProcessPullRequestContext;
    private getDiffFiles;
    private getCodeReviewResponseFromAI;
    private addCodeReviewToPullRequest;
}
