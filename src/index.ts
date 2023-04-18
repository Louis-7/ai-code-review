import { Context, Probot } from "probot";
import { CodeReview } from './core/code-review';

export = (app: Probot) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context: Context<'pull_request.opened' | 'pull_request.synchronize'>) => {
    switch (context.payload.action) {
      case 'opened':
        console.log('pull request opened!');
        break;
      case 'synchronize':
        console.log('pull request synchronize!');
        break;
      default:
        break;
    }
    const foo = new CodeReview();
    await foo.review(context as any);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
