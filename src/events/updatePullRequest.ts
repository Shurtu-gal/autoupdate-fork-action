import { IEnvironment, Octokit, PullRequest } from 'src/types';

export async function updatePullRequest(
  octokit: Octokit,
  pullRequest: PullRequest,
  environment: IEnvironment
) {
  console.log('updatePullRequest');
  console.log(pullRequest);
}
