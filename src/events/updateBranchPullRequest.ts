import { IEnvironment, Octokit } from 'src/types';
import {
  getPullRequestsOnBranch,
  updatePullRequest,
} from 'src/utils/api-calls';
import * as core from '@actions/core';
import { prNeedsUpdate } from 'src/utils/pr-needs-update';

export async function updatePullRequestsOnBranch(
  octokit: Octokit,
  owner: string,
  branch: string,
  repo: string,
  environment: IEnvironment
) {
  core.info(`Updating pull requests on branch ${branch}`);
  const pulls = await getPullRequestsOnBranch(
    octokit,
    branch,
    owner,
    repo,
    environment.githubGraphqlApiUrl
  );

  core.debug(`Found ${pulls.length} pull requests on branch ${branch}`);

  pulls.forEach(async pull => {
    core.startGroup(`Updating pull request ${pull.number}`);
    core.debug(`Pull request payload: ${JSON.stringify(pull, null, 2)}`);
    if (prNeedsUpdate(pull, environment)) {
      await updatePullRequest(octokit, pull, environment.githubGraphqlApiUrl);
    }
    core.endGroup();
  });
}
