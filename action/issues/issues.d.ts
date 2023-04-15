import { Context } from "probot";
export type IssueContext = Context<'issues.opened' | 'issue_comment.created'>;
export declare class Issue {
    context: IssueContext;
    constructor(context: IssueContext);
    comment(comment: string, context?: IssueContext): Promise<void>;
}
