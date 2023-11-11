import { PullRequest } from "src/types";

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
        id
        headRefOid
      }
    }
  }
`;

export type GetPullRequestResponse = {
  node: PullRequest;
}