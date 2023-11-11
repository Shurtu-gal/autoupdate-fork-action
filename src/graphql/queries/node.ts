import { PullRequest } from 'src/types';

export const getPullRequestQuery = `
  query getPullRequest($nodeId: ID!) {
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
        id
        headRefOid
      }
    }
  }
`;

export type GetPullRequestResponse = {
  node: PullRequest;
};
