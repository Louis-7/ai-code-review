import { Probot } from "probot";
import {ReviewController} from "./controllers/review-controller";

export = (app: Probot) => {
  app.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.labeled'], ReviewController.reviewCodeOnPullRequestUpdates);

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
