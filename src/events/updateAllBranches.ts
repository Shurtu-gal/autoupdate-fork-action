import { IEnvironment, Octokit } from 'src/types';
import * as core from '@actions/core';
import { getAllPullRequests, updatePullRequest } from 'src/utils/api-calls';
import { prNeedsUpdate } from 'src/utils/pr-needs-update';

export async function updateAllBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
  environment: IEnvironment
) {
  core.info(`Getting all branches for ${owner}/${repo}`);
  const pulls = await getAllPullRequests(
    octokit,
    owner,
    repo,
    environment.githubRestApiUrl
  );

  core.debug(`Found ${pulls.length} pull requests`);

  pulls.forEach(async pull => {
    core.startGroup(`Updating pull request ${pull.number}`);
    core.debug(`Pull request payload: ${JSON.stringify(pull, null, 2)}`);
    if (prNeedsUpdate(pull, environment)) {
      await updatePullRequest(octokit, pull, environment.githubRestApiUrl);
    }
    core.endGroup();
  });

  core.info('All branches updated');
}
