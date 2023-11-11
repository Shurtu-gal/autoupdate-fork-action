/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { setupEnvironment } from './environment';
import { updatePullRequest } from './events/updatePullRequest';
import { RestPullRequest } from './types';
import { updatePullRequestsOnBranch } from './events/updateBranchPullRequest';
import { updateAllBranches } from './events/updateAllBranches';

const triggerEventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;
let eventPayload: Record<string, unknown> = {};

if (eventPath) {
  // Get the JSON webhook payload for the event that triggered the workflow
  eventPayload = require(eventPath);
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  if (
    [
      'pull_request',
      'pull_request_target',
      'push',
      'workflow_dispatch',
      'schedule',
    ].includes(triggerEventName || '')
  ) {
    core.info(`Triggered by ${triggerEventName} event`);
  } else {
    core.setFailed(`Unsupported event: ${triggerEventName}`);
    return;
  }

  core.debug(`Event payload: ${JSON.stringify(eventPayload, null, 2)}`);

  try {
    const environment = setupEnvironment();
    const octokit = github.getOctokit(
      environment.githubToken,
      {
        baseUrl: environment.githubGraphqlApiUrl,
        previews: ['merge-info-preview'],
      },
      retry
    );

    const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
    const branch = process.env.GITHUB_HEAD_REF!;

    switch (triggerEventName) {
      case 'pull_request':
      case 'pull_request_target':
        if (!eventPayload.pull_request)
          throw new Error('No pull request found in payload');
        core.debug(
          `Pull request payload: ${JSON.stringify(
            eventPayload.pull_request,
            null,
            2
          )}`
        );

        await updatePullRequest(
          octokit,
          eventPayload.pull_request as RestPullRequest,
          environment
        );
        break;

      case 'push':
        await updatePullRequestsOnBranch(
          octokit,
          owner,
          branch,
          repo,
          environment
        );
        break;

      case 'workflow_dispatch':
      case 'schedule':
        if (!owner || !repo)
          throw new Error('No owner or repo found in payload');
        await updateAllBranches(octokit, owner, repo, environment);
        break;
    }

    core.info('Done');
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else if (!error) core.setFailed('An unknown error occurred');
    else if ((error as { request: unknown })?.request) {
      core.setFailed(
        `Request failed: ${(error as { request: unknown })?.request}`
      );
    } else core.setFailed('An unknown error occurred');
  }
}

run();
