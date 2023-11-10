import { IEnvironment, Octokit } from 'src/types';

export async function updatePullRequestsOnBranch(
  octokit: Octokit,
  owner: string,
  branch: string,
  repo: string,
  environment: IEnvironment
) {}
