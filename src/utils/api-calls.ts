import * as core from '@actions/core';

import {
  updatePullRequestBranchMutation,
  UpdatePullRequestBranchMutationResponse,
} from '../graphql/mutations/pull-request';
import {
  getPullRequestQuery,
  GetPullRequestResponse,
} from '../graphql/queries/node';
import {
  getAllPullRequestsQuery,
  getPullRequestsQuery,
  GetPullRequestsQueryResponse,
} from '../graphql/queries/pull-request';
import {
  EnumMergeFailAction,
  IGraphQLErrors,
  Octokit,
  PullRequest,
  RestPullRequest,
} from '../types';
import { PERMISSION_COMMENT } from 'src/constants';

const headRef = (owner: string, branch: string, repo: string): string =>
  `${owner}:${repo}:${branch}`;

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
    headRef: headRef(owner, branch, repo),
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
    headRef: headRef(owner, 'main', repo),
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
  baseUrl: string,
  mergeFailAction: EnumMergeFailAction
): Promise<void> {
  try {
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
  } catch (error) {
    core.debug(`Error: ${JSON.stringify(error, null, 2)}`);
    const GraphQLError = error as unknown as IGraphQLErrors;
    if (
      GraphQLError.name === 'GraphqlResponseError' &&
      GraphQLError.errors.some(
        error => error.type === 'FORBIDDEN' || error.type === 'UNAUTHORIZED'
      )
    ) {
      core.info(
        `Failed to update pull request ${pullRequest.number} due to permissions issue`
      );
      if (mergeFailAction === EnumMergeFailAction.Comment) {
        await addCommentToPullRequest(
          octokit,
          pullRequest,
          PERMISSION_COMMENT,
          baseUrl
        );
      } else if (mergeFailAction === EnumMergeFailAction.Fail) {
        core.setFailed(
          `Failed to update pull request ${pullRequest.number} due to permissions issue`
        );
      } else {
        core.info(
          `Skipping pull request ${pullRequest.number} due to permissions issue`
        );
      }
    }
  }
}

export async function getPullRequest(
  octokit: Octokit,
  pullRequest: RestPullRequest,
  baseUrl: string
): Promise<PullRequest | undefined> {
  const {
    base: { user, repo, ref },
  } = pullRequest;
  const { node } = (await octokit.graphql(getPullRequestQuery, {
    nodeId: pullRequest.node_id,
    headRef: headRef(user?.login || '', ref || '', repo?.name || ''),
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

export async function addCommentToPullRequest(
  octokit: Octokit,
  pullRequest: PullRequest,
  comment: string,
  baseUrl?: string
): Promise<void> {
  if (!pullRequest.id || !pullRequest.number) {
    core.error('Pull request id or number is undefined');
    return;
  }

  if (!comment) {
    core.error('Comment is undefined');
    return;
  }

  const { addComment } = (await octokit.graphql(
    `
    mutation addCommentToPullRequest($input: AddCommentInput!) {
      addComment(input: $input) {
        clientMutationId
      }
    }
  `,
    {
      input: {
        subjectId: pullRequest.id,
        body: comment,
      },
      baseUrl,
    }
  )) as { addComment: { clientMutationId: string } };

  if (!addComment.clientMutationId) {
    core.error('Failed to add comment to pull request');
    return;
  }
}
