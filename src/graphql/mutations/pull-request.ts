import { mergeableState } from '../../types';

export const updatePullRequestBranchMutation = `
  mutation update($input: UpdatePullRequestBranchInput!) {
    updatePullRequestBranch(input: $input) {
      pullRequest {
        mergeable
      }
    }
  }
`;

export type UpdatePullRequestBranchMutationResponse = {
  updatePullRequestBranch: {
    pullRequest: {
      mergeable: mergeableState;
    };
  };
};
