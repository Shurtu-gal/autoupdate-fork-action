import { PullRequest } from '../../types';

export const getPullRequestQuery = `
  query getPullRequest($nodeId: ID!, $headRef: String!) {
    node(id: $nodeId) {
      ... on PullRequest {
        number
        mergeable
        mergeStateStatus
        baseRefName
        baseRepository {
          name
          owner {
            login
          }
        }
        labels(first: 100) {
          nodes {
            name
          }
        }
        headRef{
          compare(headRef: $headRef) {
            aheadBy
          }
        }
        id
        headRefOid
      }
    }
  }
`;

export type GetPullRequestResponse = {
  node: PullRequest;
};
