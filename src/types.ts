export enum EnumPRFilter {
  All = 'all',
  Labelled = 'labelled',
  Base = 'base',
  Protected = 'protected',
  AutoMerge = 'auto_merge'
}

export enum EnumPRReadyState {
  All = 'all',
  Draft = 'draft',
  ReadyForReview = 'ready_for_review'
}

export enum EnumMergeConflictAction {
  Fail = 'fail',
  Ignore = 'ignore',
  Comment = 'comment'
}

export enum EnumMergeMethod {
  Merge = 'merge',
  Squash = 'squash',
  Rebase = 'rebase'
}

export interface IEnvironment {
  githubApiUrl: string
  githubToken: string
  prFilter: EnumPRFilter
  prReadyState: EnumPRReadyState
  prLabels: string[]
  excludePrLabels: string[]
  mergeConflictAction: EnumMergeConflictAction
  mergeMethod: EnumMergeMethod
  mergeCommitMessage: string
}
