import { Context } from "probot";
import { PullRequest } from "../pull-request/pull-request";
import { OpenAI } from './openai-helper';
import { minimatch } from 'minimatch';

export class CodeReview {
  PATH_TO_EXCLUDE: string = process.env.PATH_TO_EXCLUDE || '';
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async review(context: Context<'pull_request.opened' | 'pull_request.synchronize'>) {
    const pullRequest = new PullRequest(context as any);

    if (!await this.openai.test()) {
      await pullRequest.comment('Failed to initialize OPENAI. Please check whether OPENAI_API_KEY is set in your environment variables.');
      return;
    }

    const repo = context.repo();
    const contextPullRequest = context.payload.pull_request;
    const action = context.payload.action;

    let welcomeMessage: string = '';
    let baseRef: string = '';
    let headRef: string = '';

    switch (action) {
      case "opened":
        welcomeMessage = `🤖 Thanks for your pull request! Our robot reviewers will be checking it soon. Please make sure it follows our contribution guidelines and has passed our automated tests. 🤖💻`;
        baseRef = contextPullRequest.base.ref;
        headRef = contextPullRequest.head.ref;
        break;
      case "synchronize":
        welcomeMessage = `🤖 New commit(s) detected! 🤖`;
        baseRef = context.payload['before'];
        headRef = context.payload['after'];
        break;
      default:
        console.log('pull request type is not recognized.');
        return;
    }

    await pullRequest.comment(welcomeMessage);

    console.log('baseRef: ', baseRef);
    console.log('headRef: ', headRef);

    const diff = await context.octokit.repos.compareCommitsWithBasehead({
      owner: repo.owner,
      repo: repo.repo,
      basehead: `${baseRef}...${headRef}`,
    });

    const files = diff.data.files;

    if (files == null || files.length <= 0) {
      return;
    }

    for (let file of files) {
      let patch = file.patch;
      let filename = file.filename;

      if (this.isExcluded(filename)) {
        continue;
      }

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
      `You're a code reviewer in a software development team. Your responsibility is:
        - read through the code patch I give you.
        - give suggestions for improvements.
        - identify bugs and risks in the code patch.
      `;

    const codePatch: string =
      `Below is the code patch:
        ${code}
      `

    return [openning, codePatch];
  }

  private isExcluded(filepath: string) {
    const globs: string[] = this.PATH_TO_EXCLUDE.split(',').map(g => g.trim());

    for (let glob of globs) {
      if (minimatch(filepath, glob)) {
        return true;
      }
    }

    return false;
  }
}
