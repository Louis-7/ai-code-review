import { Context } from "probot";

export type IssueContext = Context<'issues.opened' | 'issue_comment.created'>;
export class Issue {
  context: IssueContext;

  constructor(context: IssueContext) {
    this.context = context;
  }

  async comment(comment: string, context?: IssueContext) {
    if (context == null) {
      context = this.context;
    }

    const issueComment = context.issue({
      body: comment,
    });

    await context.octokit.issues.createComment(issueComment);
  }
}