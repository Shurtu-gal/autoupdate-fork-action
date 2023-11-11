import { IEnvironment, PullRequest, mergeStateStatus, mergeableState } from "src/types";
import * as core from '@actions/core';

export const prNeedsUpdate = (
  pullRequest: PullRequest,
  environment: IEnvironment,
) : boolean => {
  if (pullRequest.mergeable === mergeableState.UNKNOWN || pullRequest.mergeable === mergeableState.CONFLICTING) {
    core.error(`Pull request ${pullRequest.number} mergeable state is unknown or conflicting. Try again later`);
    return false;
  }

  switch (pullRequest.mergeStateStatus) {
    case mergeStateStatus.BEHIND:
    case mergeStateStatus.CLEAN:
    case mergeStateStatus.HAS_HOOKS:
      return true;
    case mergeStateStatus.BLOCKED:
      core.error(`Pull request ${pullRequest.number} is blocked`);
      return false;
    case mergeStateStatus.DIRTY:
      core.error(`Pull request ${pullRequest.number} is dirty, merge-commit cannot be cleanly created`);
      return false;
    case mergeStateStatus.DRAFT:
      core.error(`Pull request ${pullRequest.number} is a draft`);
      return false;
    case mergeStateStatus.UNKNOWN:
    case mergeStateStatus.UNSTABLE: 
      core.error(`Pull request ${pullRequest.number} merge state is unknown or unstable. Try again later`);
      return false;
  }
};
