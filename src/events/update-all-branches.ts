import { IEnvironment, Octokit } from '../types';
import * as core from '@actions/core';
import { getAllPullRequests, updatePullRequest } from '../utils/api-calls';
import { prNeedsUpdate } from '../utils/pr-needs-update';

export async function updateAllBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
  environment: IEnvironment
): Promise<void> {
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
    if (prNeedsUpdate(pull, environment, octokit)) {
      await updatePullRequest(
        octokit,
        pull,
        environment.githubRestApiUrl,
        environment.mergeFailAction
      );
    }
    core.endGroup();
  });

  core.info('All branches updated');
}
