import { PullRequest } from '../../types';

/**
 * @description The graphql query to get all pull requests for a branch in a repository.
 * @see https://docs.github.com/en/graphql/overview/schema-previews#merge-info-preview-more-detailed-information-about-a-pull-requests-merge-state-preview
 * @since merge-info-preview is in preview, we need to pass the custom media type header to the graphql api.
 */
export const getPullRequestsQuery = `
  query getPullRequest($owner: String!, $repo: String!, $branch: String!, $headRef: String!, labels: [String!]) {
    repository(owner: $owner, name: $repo, followRenames: true) {
      pullRequests(states: OPEN, first: 100, baseRefName: $branch, labels: $labels, orderBy: {field: CREATED_AT, direction: DESC}) {
        edges {
          node {
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
    }
  }
`;

/**
 * @description The graphql query to get all pull requests for a repository.
 * @see https://docs.github.com/en/graphql/overview/schema-previews#merge-info-preview-more-detailed-information-about-a-pull-requests-merge-state-preview
 * @since merge-info-preview is in preview, we need to pass the custom media type header to the graphql api.
 */
export const getAllPullRequestsQuery = `
  query getPullRequest($owner: String!, $repo: String!, $headRef: String!, labels: [String!]) {
    repository(owner: $owner, name: $repo, followRenames: true) {
      pullRequests(states: OPEN, first: 100, labels: $labels, orderBy: {field: CREATED_AT, direction: DESC}) {
        edges {
          node {
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
    }
  }
`;

export type GetPullRequestsQueryResponse = {
  repository: {
    pullRequests: {
      edges: {
        node: PullRequest;
      }[];
    };
  };
};
