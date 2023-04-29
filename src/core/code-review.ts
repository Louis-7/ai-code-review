import { Context } from "probot";
import { PullRequest } from "../pull-request/pull-request";
import { OpenAI } from './openai-helper';
import { minimatch } from 'minimatch';
import { components } from '@octokit/openapi-types/'

enum CodeReviewType {
  CodeReview,
  Message,
}

type CodeReviewResponse = {
  type: CodeReviewType,
  message: string;
  file: components["schemas"]["diff-entry"];
  position: number;
}

export class CodeReview {
  PATH_TO_EXCLUDE: string = process.env.PATH_TO_EXCLUDE || '';
  MAX_FILE_PER_PR: number = Number(process.env.MAX_FILE_PER_PR) || 20;
  MAX_PATCH_PER_FILE: number = Number(process.env.MAX_PATCH_PER_FILE) || Number.MAX_VALUE;
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async review(context: Context<'pull_request.opened' | 'pull_request.synchronize'>) {
    const pullRequest = new PullRequest(context as any);

    if (!await this.openai.test()) {
      await pullRequest.comment('🤖 Failed to initialize OPENAI. Please check whether `OPENAI_API_KEY` is set in your repository variables.');
      return;
    }

    let { welcomeMessage, baseRef, headRef } = this.preProcessPullRequestContext(context);

    if (welcomeMessage == undefined) {
      console.log('🤖 pull request type is not recognized.');
      await pullRequest.comment('🤖pull request type is not recognized.');
      return;
    } else {
      await pullRequest.comment(welcomeMessage);
    }

    console.log('baseRef: ', baseRef);
    console.log('headRef: ', headRef);

    const files = await this.getDiffFiles(baseRef, headRef, context);

    if (files == null || files.length <= 0) {
      console.log('CodeReview::review - no diff files.')
      await pullRequest.comment(`🤖 No code change detected. 🤖`);
      return;
    }

    if (files.length > this.MAX_FILE_PER_PR) {
      console.log('CodeReview::review - The number of files exceeds the maximum limit.');
      await pullRequest.comment(`🤖 The number of files exceeds the maximum limit (${this.MAX_FILE_PER_PR}).\n > You can change this setting by update the \`MAX_FILE_PER_PR\` of your repository variable.`);
      return;
    }

    let promise: Promise<CodeReviewResponse>[] = this.getCodeReviewResponseFromAI(files);

    let success = await this.addCodeReviewToPullRequest(promise, pullRequest);

    if (success) {
      console.log(`Code review is done. PR: ${context.payload.pull_request.url}`)
    } else {
      console.log(`Code review is not end properly. PR: ${context.payload.pull_request.url}`)
    }

  }

  private generatePrompt(code: string | string[]): string[] {
    if (!Array.isArray(code)) {
      code = [code];
    }

    let prompt = [];

    const opening: string =
      `You're a code reviewer in a software development team. Your responsibility is:
        - read through the code patch I give you.
        - give suggestions for improvements.
        - identify bugs and risks in the code patch.
        - do not introduce your self in the code review, just give me review comments.
      `;

    prompt.push(opening);

    const codePatch: string =
      `Below is the code patch:
        ${code}
      `

    return [opening, codePatch];
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

  private preProcessPullRequestContext(context: Context<'pull_request.opened' | 'pull_request.synchronize'>): { welcomeMessage: string | undefined, baseRef: string, headRef: string } {
    const action = context.payload.action;
    const contextPullRequest = context.payload.pull_request;

    let welcomeMessage: string | undefined = '';
    let baseRef: string = '';
    let headRef: string = '';

    switch (action) {
      case "opened":
        welcomeMessage = `🤖 Thanks for your pull request! AI reviewers will be checking it soon. Please make sure it follows our contribution guidelines and has passed our automated tests. 🤖💻`;
        baseRef = contextPullRequest.base.ref;
        headRef = contextPullRequest.head.ref;
        break;
      case "synchronize":
        welcomeMessage = `🤖 New commit(s) detected! 🤖`;
        baseRef = context.payload['before'];
        headRef = context.payload['after'];
        break;
      default:
        welcomeMessage = undefined;
        baseRef = ''
        headRef = ''
    }

    return { welcomeMessage, baseRef, headRef };

  }

  private async getDiffFiles(baseRef: string, headRef: string, context: Context<'pull_request.opened' | 'pull_request.synchronize'>): Promise<components["schemas"]["diff-entry"][] | undefined> {
    const repo = context.repo();
    const diff = await context.octokit.repos.compareCommitsWithBasehead({
      owner: repo.owner,
      repo: repo.repo,
      basehead: `${baseRef}...${headRef}`,
    });

    return diff.data.files;
  }

  private getCodeReviewResponseFromAI(files: components["schemas"]["diff-entry"][]): Promise<CodeReviewResponse>[] {
    let promise: Promise<CodeReviewResponse>[] = [];

    for (let file of files) {
      let filename = file.filename;
      let patch = file.patch;

      try {
        if (this.isExcluded(filename)) {
          continue;
        }

        if (patch == null) {
          continue;
        }

        const position = patch.split('\n').length - 1;


        if (patch.length > this.MAX_PATCH_PER_FILE) {
          promise.push(
            Promise.resolve({
              type: CodeReviewType.Message,
              message: `🤖 The code patch for \`${filename}\` exceeds the maximum limit (${this.MAX_PATCH_PER_FILE}).\n > You can change this setting by update the \`MAX_PATCH_PER_FILE\` of your repository variable.`,
              file,
              position
            })
          )
          continue;
        }

        const prompt = this.generatePrompt(patch);

        promise.push(
          this.openai.chat(prompt)
            .then((message: string) => ({
              type: CodeReviewType.CodeReview,
              message,
              file,
              position
            }))
        )
      } catch (err) {
        // continue when code review for single file is failed
        console.log(`CodeReview::review - failed to review ${filename}. Skipping it.`);
        console.error(err);
        continue;
      }
    }

    return promise;
  }

  private async addCodeReviewToPullRequest(promise: Promise<CodeReviewResponse>[], pullRequest: PullRequest): Promise<boolean> {
    await Promise.all(promise)
      .then(async (responses: CodeReviewResponse[]) => {
        for (let response of responses) {
          if (response.type == CodeReviewType.CodeReview) {
            const { message, file, position } = response;

            await pullRequest.reviewComment(message, file, position);
          } else if (response.type == CodeReviewType.Message) {
            await pullRequest.comment(response.message);
          }
        }
      })
      .catch(err => {
        console.log(err);
        return Promise.resolve(false);
      })

    return Promise.resolve(true);
  }
}
