import { Context } from "probot";
import { PullRequest } from "../pull-request/pull-request";
import { OpenAI } from './openai-helper';

export class CodeReview {
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async review(context: Context<'pull_request.opened'>) {
    const repo = context.repo();
    const contextPullRequest = context.payload.pull_request;

    const diff = await context.octokit.repos.compareCommitsWithBasehead({
      owner: repo.owner,
      repo: repo.repo,
      basehead: `${contextPullRequest.base.ref}...${contextPullRequest.head.ref}`,
    });

    const files = diff.data.files;

    if (files == null || files.length <= 0) {
      return;
    }

    for (let file of files) {
      let patch = file.patch;

      if (patch == null) {
        continue;
      }

      const prompt = this.generatePrompt(patch);
      const message = await this.openai.chat(prompt);
      const position = patch.split('\n').length - 1;

      const pullRequest = new PullRequest(context as any);
      await pullRequest.reviewComment(message, file, position);
    }
  }

  private generatePrompt(code: string): string[] {
    const openning: string =
      `You're a code reviewer in a software development team. Your responsiablity is:
        - read through the code patch I give you.
        - give suggestion of the improvments.
        - identify bug and risk in the code patch.
      `;

    const codePatch: string =
      `Below is the code patch:
        ${code}
      `

    return [openning, codePatch];
  }
}