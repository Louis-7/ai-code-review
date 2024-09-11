import { Context } from "probot";
export declare class ReviewController {
    static reviewCodeOnPullRequestUpdates(context: Context<'pull_request.opened' | 'pull_request.synchronize' | 'pull_request.labeled'>): Promise<void>;
}
