import * as core from '@actions/core';
import { Octokit, PullRequest, RestPullRequest } from '../types';
import {
  UpdatePullRequestBranchMutationResponse,
  updatePullRequestBranchMutation,
} from '../graphql/mutations/pull-request';
import {
  GetPullRequestsQueryResponse,
  getAllPullRequestsQuery,
  getPullRequestsQuery,
} from '../graphql/queries/pull-request';
import {
  GetPullRequestResponse,
  getPullRequestQuery,
} from 'src/graphql/queries/node';

export async function getPullRequestsOnBranch(
  octokit: Octokit,
  branch: string,
  owner: string,
  repo: string,
  baseUrl: string
): Promise<PullRequest[]> {
  core.debug(
    `Variables in getAllPullRequests: ${JSON.stringify(
      { owner, repo, baseUrl, branch },
      null,
      2
    )}`
  );
  const { repository } = (await octokit.graphql(getPullRequestsQuery, {
    owner,
    repo,
    branch,
    baseUrl,
  })) as GetPullRequestsQueryResponse;

  const pulls = repository.pullRequests.edges.map(
    edge => edge.node
  ) as PullRequest[];

  if (pulls.length === 0) {
    core.info(`No pull requests found on branch ${branch}`);
  }

  if (pulls.length > 1) {
    core.info(`Found ${pulls.length} pull requests on branch ${branch}`);
  }

  return pulls;
}

export async function getAllPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  baseUrl: string
): Promise<PullRequest[]> {
  const { repository } = (await octokit.graphql(getAllPullRequestsQuery, {
    owner,
    repo,
    baseUrl,
  })) as GetPullRequestsQueryResponse;

  const pulls = repository.pullRequests.edges.map(
    edge => edge.node
  ) as PullRequest[];

  if (pulls.length === 0) {
    core.info(`No pull requests found`);
  }

  if (pulls.length > 1) {
    core.info(`Found ${pulls.length} pull requests`);
  }

  return pulls;
}

export async function updatePullRequest(
  octokit: Octokit,
  pullRequest: PullRequest,
  baseUrl: string
): Promise<void> {
  const response = (await octokit.graphql(updatePullRequestBranchMutation, {
    input: {
      pullRequestId: pullRequest.id,
      expectedHeadOid: pullRequest.headRefOid,
    },
    baseUrl,
  })) as UpdatePullRequestBranchMutationResponse;

  if (!response.updatePullRequestBranch.pullRequest) {
    core.error(`Failed to update pull request ${pullRequest.number}`);
    return;
  }

  core.info(`Updated pull request ${pullRequest.number}`);
}

export async function getPullRequest(
  octokit: Octokit,
  pullRequestId: string,
  baseUrl: string
): Promise<PullRequest | undefined> {
  const { node } = (await octokit.graphql(getPullRequestQuery, {
    nodeId: pullRequestId,
    baseUrl,
  })) as GetPullRequestResponse;

  return node;
}

export async function updateRestPullRequest(
  octokit: Octokit,
  pullRequest: RestPullRequest,
  baseUrl: string
): Promise<void> {
  const {
    base: { user, repo },
    head: { sha },
    number,
  } = pullRequest;
  if (!user || !repo || !sha || !number) {
    core.error(
      `Did not find all required fields to update pull request ${number}`
    );
    core.debug(`Pull request: ${JSON.stringify(pullRequest)}`);
    return;
  }

  const { status } = await octokit.rest.pulls.updateBranch({
    owner: user?.login,
    repo: repo?.name,
    pull_number: number,
    expected_head_sha: sha,
    baseUrl,
  });

  if (status !== 202) {
    core.error(`Failed to update pull request ${number}`);
    return;
  }

  core.info(`Updated pull request ${number}`);
}
