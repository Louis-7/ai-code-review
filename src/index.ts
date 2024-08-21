import { Context, Probot } from "probot";
import { CodeReview } from './services/core/code-review';

export = (app: Probot) => {
  app.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.labeled'], async (context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>) => {
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
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
