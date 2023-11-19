import {
  EnumPRFilter,
  IEnvironment,
  Octokit,
  PullRequest,
  mergeStateStatus,
  mergeableState,
} from '../types';
import * as core from '@actions/core';
import { addCommentToPullRequest } from './api-calls';

export const prNeedsUpdate = (
  pullRequest: PullRequest,
  environment: IEnvironment,
  octokit: Octokit
): boolean => {
  // Checks if the pull_request base branch is ahead of the head branch a.k.a. if the pull_request needs to be updated
  if (pullRequest.headRef.compare.aheadBy === 0) {
    core.info(`Pull request ${pullRequest.number} is up to date`);
    return false;
  }

  if (pullRequest.mergeable === mergeableState.CONFLICTING) {
    core.error(`Pull request ${pullRequest.number} has conflicts`);
    addCommentToPullRequest(
      octokit,
      pullRequest,
      `Pull request ${pullRequest.number} has conflicts`,
      environment.githubRestApiUrl
    );
    return false;
  }

  if (pullRequest.mergeable === mergeableState.UNKNOWN) {
    core.error(
      `Pull request ${pullRequest.number} mergeable state is unknown. Try again later`
    );
    return false;
  }

  const { excludePrLabels, prFilter, prLabels } = environment;

  if (prFilter === EnumPRFilter.Base) {
    if (!environment.baseBranches.includes(pullRequest.baseRefName)) {
      core.info(
        `Pull request ${pullRequest.number} is not based on any of the specified base branches`
      );
      return false;
    }
  } else if (prFilter === EnumPRFilter.Labelled) {
    if (
      !prLabels.some(label =>
        pullRequest.labels.nodes.some(node => node.name === label)
      )
    ) {
      core.info(
        `Pull request ${pullRequest.number} does not have any of the specified labels`
      );
      return false;
    }
  } else if (
    excludePrLabels.some(label =>
      pullRequest.labels.nodes.some(node => node.name === label)
    )
  ) {
    core.info(
      `Pull request ${pullRequest.number} has one of the specified excluded labels`
    );
    return false;
  }

  let comment;

  switch (pullRequest.mergeStateStatus) {
    case mergeStateStatus.BEHIND:
    case mergeStateStatus.CLEAN:
    case mergeStateStatus.HAS_HOOKS:
    case mergeStateStatus.UNSTABLE:
      return true;
    case mergeStateStatus.BLOCKED:
      core.error(`Pull request ${pullRequest.number} is blocked`);
      comment = `Pull request ${pullRequest.number} is blocked`;
      break;

    case mergeStateStatus.DIRTY:
      core.error(
        `Pull request ${pullRequest.number} is dirty, merge-commit cannot be cleanly created`
      );
      comment = `Pull request ${pullRequest.number} is dirty, merge-commit cannot be cleanly created`;
      break;
    case mergeStateStatus.DRAFT:
      core.error(`Pull request ${pullRequest.number} is a draft`);
      return false;
    case mergeStateStatus.UNKNOWN:
      return false;
    default:
      return false;
  }

  if (comment) {
    addCommentToPullRequest(
      octokit,
      pullRequest,
      comment,
      environment.githubRestApiUrl
    );
  }
  return false;
};
