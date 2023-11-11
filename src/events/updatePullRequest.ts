import { IEnvironment, Octokit, RestPullRequest } from 'src/types';
import { getPullRequest, updateRestPullRequest } from 'src/utils/api-calls';
import * as core from '@actions/core';
import { prNeedsUpdate } from 'src/utils/pr-needs-update';

export async function updatePullRequest(
  octokit: Octokit,
  pullRequest: RestPullRequest,
  environment: IEnvironment
) {
  core.startGroup(`Updating pull request ${pullRequest.number}`);
  const { node_id } = pullRequest;
  const pullRequestNode = await getPullRequest(
    octokit,
    node_id,
    environment.githubApiUrl
  );
  core.debug(`Pull request payload: ${JSON.stringify(pullRequest, null, 2)}`);
  if (!pullRequestNode) {
    core.error(`Failed to get pull request ${pullRequest.number}`);
    return;
  }

  if (prNeedsUpdate(pullRequestNode, environment)) {
    await updateRestPullRequest(octokit, pullRequest, environment.githubApiUrl);
  }

  core.endGroup();
  return;
}
