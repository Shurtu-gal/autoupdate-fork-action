import { IEnvironment, Octokit, RestPullRequest } from '../types';
import { getPullRequest, updateRestPullRequest } from '../utils/api-calls';
import * as core from '@actions/core';
import { prNeedsUpdate } from '../utils/pr-needs-update';

export async function updatePullRequest(
  octokit: Octokit,
  pullRequest: RestPullRequest,
  environment: IEnvironment
): Promise<void> {
  core.startGroup(`Updating pull request ${pullRequest.number}`);
  const pullRequestNode = await getPullRequest(
    octokit,
    pullRequest,
    environment.githubRestApiUrl
  );
  core.debug(`Pull request payload: ${JSON.stringify(pullRequest, null, 2)}`);
  if (!pullRequestNode) {
    core.error(`Failed to get pull request ${pullRequest.number}`);
    return;
  }

  if (prNeedsUpdate(pullRequestNode, environment)) {
    await updateRestPullRequest(
      octokit,
      pullRequest,
      environment.githubRestApiUrl
    );
  }

  core.endGroup();
  return;
}
