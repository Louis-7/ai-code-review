import { Context } from "probot";
import { components } from '@octokit/openapi-types/types';

export type PullRequestContext = Context<'pull_request.opened'>;
export class PullRequest {
  context: PullRequestContext;

  constructor(context: PullRequestContext) {
    this.context = context;
  }

  async comment(comment: string, context?: PullRequestContext) {
    if (context == null) {
      context = this.context;
    }

    const repo = context.repo();
    const pullRequest = context.payload.pull_request;

    await context.octokit.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: pullRequest.number,
      body: comment
    });
  }

  async reviewComment(comment: string, file: components["schemas"]["diff-entry"], context?: PullRequestContext) {
    if (context == null) {
      context = this.context;
    }

    const repo = context.repo();
    const pullRequest = context.payload.pull_request;

    await context.octokit.pulls.createReviewComment({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: pullRequest.number,
      body: comment,
      commit_id: pullRequest.head.sha,
      path: file.filename,
      subject_type: 'file'
    });
  }
}