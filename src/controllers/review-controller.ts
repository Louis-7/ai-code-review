import { Context } from "probot";
import { CodeReview } from '../services/core/code-review';

export class ReviewController {

  static async reviewCodeOnPullRequestUpdates(context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>) {
    switch (context.payload.action) {
      case 'opened':
        console.log('pull request opened!');
        break;
      case 'synchronize':
        console.log('pull request synchronize!');
        break;
      case 'labeled':
        console.log('pull request labeled')
        break;
      default:
        break;
    }
    const codeReview = new CodeReview();
    await codeReview.review(context as any);
  }
}