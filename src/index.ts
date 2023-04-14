import { Context, Probot } from "probot";
import { PullRequest } from "./pull-request/pull-request";

export = (app: Probot) => {
  app.on("pull_request.opened", async (context: Context<'pull_request.opened'>) => {
    const pullRequest = new PullRequest(context as any);
    await pullRequest.comment("Thanks for opening this pull request. Code reviewer is on the way.");
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
