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

    console.log('PATH_TO_EXCLUDE: ', process.env.PATH_TO_EXCLUDE);
    console.log('MAX_FILE_PER_PR: ', process.env.MAX_FILE_PER_PR);
    console.log('MAX_PATCH_PER_FILE: ', process.env.MAX_PATCH_PER_FILE);
    console.log('LANGUAGE: ', process.env.LANGUAGE);
    console.log('CUSTOMIZED_PROMPT: ', process.env.CUSTOMIZED_PROMPT);  
    
    const codeReview = new CodeReview();
    await codeReview.review(context as any);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
