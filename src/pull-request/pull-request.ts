import { Context } from "probot";

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

    const repo  = context.repo();
    const pullRequest = context.payload.pull_request;

    // const diff = await context.octokit.repos.compareCommits({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   base: pullRequest.base.sha,
    //   head: pullRequest.head.sha
    // });

    await context.octokit.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: pullRequest.number,
      body: comment
    });
  }
}