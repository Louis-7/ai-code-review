import { OctokitResponse } from "@octokit/types";
import { Context } from "probot";

export type RepoContext = Context<'issues.opened' | 'issue_comment.created'>;

export class Repo {
  context: RepoContext;

  constructor(context: RepoContext) {
    this.context = context;
  }

  async getContent(filepath: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.repos
      .getContent({
        owner: process.env.DATA_REPO_OWNER || '',
        repo: process.env.DATA_REPO || '',
        path: filepath,
      });
  }

  async getRef(branch: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.getRef({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      ref: `heads/${branch}`
    })
  }

  async updateRef(branch:string, commitSha:string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.updateRef({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      ref: `heads/${branch}`,
      sha: commitSha,
    })
  }

  async getCommit(commitSha: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.getCommit({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      commit_sha: commitSha,
    })
  }

  async getCurrentCommit(branch: string = 'main', context?: RepoContext) {
    if (context == null) {
      context = this.context;
    }

    const { data: refData } = await this.getRef(branch);
    const commitSha = refData.object.sha;
    const { data: commitData } = await this.getCommit(commitSha);

    return { commitSha, treeSha: commitData.tree.sha }
  }

  async createTree(tree: any, base_tree: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.createTree({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      tree,
      base_tree,
    })
  }

  async createNewTree(blobs: OctokitResponse<any, number>[], paths: string[], parentTreeSha: string, context?: RepoContext): Promise<any> {
    if (context == null) {
      context = this.context;
    }

    const tree = blobs.map((blob, index) => ({
      path: paths[index],
      mode: '100644',
      type: 'blob',
      sha: blob.data.sha
    }))

    const { data } = await this.createTree(tree, parentTreeSha)

    return data;
  }

  async createCommit(message: string, currentTreeSha: string, currentCommitSha: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.createCommit({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha]
    })
  }

  async createBlob(content: string, encoding: string, context?: RepoContext): Promise<OctokitResponse<any, number>> {
    if (context == null) {
      context = this.context;
    }

    return await context.octokit.git.createBlob({
      owner: process.env.DATA_REPO_OWNER || '',
      repo: process.env.DATA_REPO || '',
      content,
      encoding,
    })
  }
}