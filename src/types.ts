import * as github from '@actions/github';
import { GraphQLError } from 'graphql';

export type Octokit = ReturnType<typeof github.getOctokit>;

/**
 * @see https://docs.github.com/en/graphql/reference/enums#mergestatestatus
 */
export enum mergeStateStatus {
  BEHIND = 'BEHIND',
  BLOCKED = 'BLOCKED',
  CLEAN = 'CLEAN',
  DIRTY = 'DIRTY',
  DRAFT = 'DRAFT',
  HAS_HOOKS = 'HAS_HOOKS',
  UNKNOWN = 'UNKNOWN',
  UNSTABLE = 'UNSTABLE',
}

/**
 * @see https://docs.github.com/en/graphql/reference/enums#mergeablestate
 */
export enum mergeableState {
  CONFLICTING = 'CONFLICTING',
  MERGEABLE = 'MERGEABLE',
  UNKNOWN = 'UNKNOWN',
}

export type PullRequest = {
  id: string;
  number: number;
  headRefOid: string;
  mergeable: mergeableState;
  mergeStateStatus: mergeStateStatus;
  baseRefName: string;
  baseRepository: {
    name: string;
    owner: {
      login: string;
    };
  };
  labels: {
    nodes: {
      name: string;
    }[];
  };
  headRef: {
    compare: {
      aheadBy: number;
    };
  };
};

export type RestPullRequest = Awaited<
  ReturnType<Octokit['rest']['pulls']['list']>
>['data'][0];

export type RestIssue = Awaited<
  ReturnType<Octokit['rest']['issues']['get']>
>['data'];

export enum EnumPRFilter {
  All = 'all',
  Labelled = 'labelled',
  Base = 'base',
  Protected = 'protected',
  AutoMerge = 'auto_merge',
}

export enum EnumPRReadyState {
  All = 'all',
  Draft = 'draft',
  ReadyForReview = 'ready_for_review',
}

export enum EnumMergeFailAction {
  Fail = 'fail',
  Ignore = 'ignore',
  Comment = 'comment',
}

export enum EnumMergeMethod {
  Merge = 'merge',
  Squash = 'squash',
  Rebase = 'rebase',
}

export interface IEnvironment {
  githubRestApiUrl: string;
  githubGraphqlApiUrl: string;
  githubToken: string;
  prFilter: EnumPRFilter;
  baseBranches: string[];
  prReadyState: EnumPRReadyState;
  prLabels: string[];
  excludePrLabels: string[];
  mergeFailAction: EnumMergeFailAction;
  mergeMethod: EnumMergeMethod;
  mergeCommitMessage: string;
  ignoreConflicts: boolean;
}

export interface IGraphQLErrors {
  request: {
    query: string;
    variables: Record<string, unknown>;
    baseUrl: string;
  };
  headers: Record<string, string>;
  response: {
    data: Record<string, unknown>;
    errors: (GraphQLError & { type: string })[];
  };
  errors: (GraphQLError & { type: string })[];
  name: string;
}
