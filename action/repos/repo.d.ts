import { OctokitResponse } from "@octokit/types";
import { Context } from "probot";
export type RepoContext = Context<'issues.opened' | 'issue_comment.created'>;
export declare class Repo {
    context: RepoContext;
    constructor(context: RepoContext);
    getContent(filepath: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    getRef(branch: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    updateRef(branch: string, commitSha: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    getCommit(commitSha: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    getCurrentCommit(branch?: string, context?: RepoContext): Promise<{
        commitSha: any;
        treeSha: any;
    }>;
    createTree(tree: any, base_tree: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    createNewTree(blobs: OctokitResponse<any, number>[], paths: string[], parentTreeSha: string, context?: RepoContext): Promise<any>;
    createCommit(message: string, currentTreeSha: string, currentCommitSha: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
    createBlob(content: string, encoding: string, context?: RepoContext): Promise<OctokitResponse<any, number>>;
}
