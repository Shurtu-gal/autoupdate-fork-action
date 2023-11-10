import * as core from '@actions/core'
import { Octokit, PullRequest } from './types'
import {
  UpdatePullRequestBranchMutationResponse,
  updatePullRequestBranchMutation
} from './graphql/mutations'
import {
  GetPullRequestsQueryResponse,
  getPullRequestsQuery
} from './graphql/queries'

export async function getPullRequestsOnBranch(
  octokit: Octokit,
  branch: string,
  owner: string,
  repo: string,
  baseUrl: string
): Promise<PullRequest[]> {
  const { repository } = (await octokit.graphql(getPullRequestsQuery, {
    owner,
    repo,
    branch,
    baseUrl
  })) as GetPullRequestsQueryResponse

  const pulls = repository.pullRequests.edges.map(
    edge => edge.node
  ) as PullRequest[]

  if (pulls.length === 0) {
    core.info(`No pull requests found on branch ${branch}`)
  }

  if (pulls.length > 1) {
    core.info(`Found ${pulls.length} pull requests on branch ${branch}`)
  }

  return pulls
}

export async function updatePullRequest(
  octokit: Octokit,
  pullRequest: PullRequest,
  baseUrl: string
): Promise<void> {
  const response = (await octokit.graphql(updatePullRequestBranchMutation, {
    input: {
      pullRequestId: pullRequest.id,
      expectedHeadOid: pullRequest.headRefOid
    },
    baseUrl
  })) as UpdatePullRequestBranchMutationResponse

  if (!response.updatePullRequestBranch.pullRequest) {
    core.error(`Failed to update pull request ${pullRequest.number}`)
    return
  }

  core.info(`Updated pull request ${pullRequest.number}`)
}
