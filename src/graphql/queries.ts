export const getPullRequestsQuery = `
  query getPullRequest($owner: String!, $repo: String!, $branch: String!) {
    repository(owner: $owner, name: $repo, followRenames: true) {
      pullRequests(states: OPEN, first: 100, baseRefName: $branch) {
        edges {
          node {
            number
            mergeable
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
    }
  }
`

export type GetPullRequestsQueryResponse = {
  repository: {
    pullRequests: {
      edges: {
        node: {
          number: number
          mergeable: string
          baseRefName: string
          baseRepository: {
            name: string
            owner: {
              login: string
            }
          }
          id: string
          headRefOid: string
        }
      }[]
    }
  }
}
