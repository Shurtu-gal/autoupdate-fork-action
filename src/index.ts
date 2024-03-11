/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { setupEnvironment } from './environment';
import { updatePullRequestNode } from './events/update-pull-request';
import { EnumPRFilter, RestIssue, RestPullRequest } from './types';
import { updatePullRequestsOnBranch } from './events/update-branch-pull-request';
import { updateAllBranches } from './events/update-all-branches';

const triggerEventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;
let eventPayload: Record<string, unknown> = {};

if (eventPath) {
  // Get the JSON webhook payload for the event that triggered the workflow
  // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-require-imports
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
      'issue_comment',
    ].includes(triggerEventName || '')
  ) {
    core.info(`Triggered by ${triggerEventName} event`);
  } else {
    core.setFailed(`Unsupported event: ${triggerEventName}`);
    return;
  }
  core.debug(`Process env: ${JSON.stringify(process.env, null, 2)}`);
  core.debug(`Event payload: ${JSON.stringify(eventPayload, null, 2)}`);

  try {
    const environment = setupEnvironment();
    const octokit = github.getOctokit(
      environment.githubToken,
      {
        baseUrl: environment.githubRestApiUrl,
        previews: ['merge-info-preview'],
      },
      retry
    );

    if (!process.env.GITHUB_REPOSITORY)
      throw new Error('No repository found in payload');
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    if (!owner || !repo) throw new Error('No owner or repo found in payload');
    if (!process.env.GITHUB_REF_NAME)
      throw new Error('No branch found in payload');
    const branch = process.env.GITHUB_REF_NAME;

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

        await updatePullRequestNode(
          octokit,
          eventPayload.pull_request as RestPullRequest,
          environment
        );
        break;

      case 'issue_comment':
        if (!eventPayload.issue) throw new Error('No issue found in payload');
        core.debug(
          `Issue payload: ${JSON.stringify(eventPayload.issue, null, 2)}`
        );
        // Currently issue doesn't have all the fields we need. Hence have to make a separate call to get the pull request.
        // https://github.com/actions/checkout/issues/331#issuecomment-897456260
        core.debug('Getting pull request from issue');
        {
          const pull_request = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: (eventPayload.issue as RestIssue).number,
          });
          core.debug(`Pull request: ${JSON.stringify(pull_request, null, 2)}`);
          await updatePullRequestNode(
            octokit,
            pull_request.data as RestPullRequest,
            { ...environment, prFilter: EnumPRFilter.All }
          );
        }
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
