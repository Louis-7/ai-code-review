import { Context } from "probot";
import { components } from '@octokit/openapi-types/types';
export type PullRequestContext = Context<'pull_request.opened'>;
export declare class PullRequest {
    context: PullRequestContext;
    constructor(context: PullRequestContext);
    comment(comment: string, context?: PullRequestContext): Promise<void>;
    reviewComment(comment: string, file: components["schemas"]["diff-entry"], context?: PullRequestContext): Promise<void>;
}
