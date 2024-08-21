import { Context } from "probot";
import { PullRequest } from "../pull-request/pull-request";
import { OpenAIHelper } from './openai-helper';
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
  REPLY_TO_IGNORE: string | null = process.env.REPLY_TO_IGNORE || null;
  MAX_FILE_PER_PR: number = Number(process.env.MAX_FILE_PER_PR) || 20;
  MAX_PATCH_PER_FILE: number = Number(process.env.MAX_PATCH_PER_FILE) || Number.MAX_VALUE;
  LANGUAGE: string = process.env.LANGUAGE || 'English';
  CUSTOMIZED_PROMPT:string = process.env.CUSTOMIZED_PROMPT || '';

  openAIHelper: OpenAIHelper;

  constructor() {
    this.openAIHelper = new OpenAIHelper();
  }

  async review(context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>) {
    const pullRequest = new PullRequest(context as any);

    if (!await this.openAIHelper.test()) {
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

    let opening: string = '';

    if (this.CUSTOMIZED_PROMPT === '') {
      opening = `
        You're a code reviewer in a software development team. Your responsibility is:
          - read through the code patch I give you.
          - give suggestions for improvements.
          - identify bugs and risks in the code patch.
          - only response with code review comments, don't rely the code patch again.

        Give me your comments in ${this.LANGUAGE}.

        Below is the code patch:

      `
    } else {
      opening = this.CUSTOMIZED_PROMPT;
    }

    prompt.push(opening);

    const codePatch: string = `${code}`

    console.log(`Prompt generated:\n${opening}\n${codePatch}`);

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

  private preProcessPullRequestContext(context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>): { welcomeMessage: string | undefined, baseRef: string, headRef: string } {
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
      case "labeled":
        welcomeMessage = `🤖 Label detected! 🤖`;
        baseRef = contextPullRequest.base.ref;
        headRef = contextPullRequest.head.ref;
        break;
      default:
        welcomeMessage = undefined;
        baseRef = ''
        headRef = ''
    }

    return { welcomeMessage, baseRef, headRef };

  }

  private async getDiffFiles(baseRef: string, headRef: string, context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>): Promise<components["schemas"]["diff-entry"][] | undefined> {
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
          this.openAIHelper.chatCompletion(prompt)
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
    let allSettled:boolean = true;

    await Promise.allSettled(promise)
      .then(async (responses: any) => {
        for (let response of responses) {
          if (response['status'] == 'fulfilled') {
            const value = response['value'];
            if (value.type == CodeReviewType.CodeReview) {
              const { message, file, position } = value;

              if (message === this.REPLY_TO_IGNORE) {
                return Promise.resolve('This reply is ignored');
              }

              return await pullRequest.reviewComment(message, file, position);
            } else if (value.type == CodeReviewType.Message) {
              return await pullRequest.comment(value.message);
            }
          } else if (response['status'] == 'rejected') {
            allSettled = false;
            return Promise.reject(response['reason']);
          }
        }
      })
      .catch(err => {
        console.log(err);
        allSettled = false;
      })

    return allSettled;
  }
}
