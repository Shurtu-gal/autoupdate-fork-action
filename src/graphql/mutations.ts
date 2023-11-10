export const updatePullRequestBranchMutation = `
  mutation update($input: UpdatePullRequestBranchInput!) {
    updatePullRequestBranch(input: $input) {
      pullRequest {
        mergeable
      }
    }
  }
`
export type UpdatePullRequestBranchMutationResponse = {
  updatePullRequestBranch: {
    pullRequest: {
      mergeable: string
    }
  }
}
