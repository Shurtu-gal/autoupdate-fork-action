import {
  EnumMergeFailAction,
  EnumMergeMethod,
  EnumPRFilter,
  EnumPRReadyState,
  IEnvironment,
} from './types';
import * as core from '@actions/core';
import { isValueInEnum } from './utils';

/**
 *
 * @description Gets a value from an input and parses it. Also checks if the value is in an enumeration.
 * @returns {Type} The parsed value from the input. Or the default value if the input is not required and not set.
 * @throws {Error} If the input is required and not set, or if the value is not in the enumeration.
 */
function getValueFromInput<Type>(
  inputName: string,
  required: boolean,
  defaultValue?: Type,
  parse?: (value: string) => Type,
  enumeration?: unknown
): Type {
  try {
    const value = core.getInput(inputName, { required });
    if (!value) {
      if (required) throw new Error(`Input ${inputName} is required`);
      else return defaultValue as Type;
    } else if (
      typeof enumeration === 'object' &&
      !isValueInEnum(value, enumeration)
    )
      throw new Error(`Invalid value for input ${inputName}: ${value}`);
    else if (parse) return parse(value);
    else return value as unknown as Type;
  } catch (error) {
    throw new Error(
      `Unknown error while getting value from input ${inputName}: ${error}`
    );
  }
}

function commaSeparatedStringToArray(value: string): string[] {
  return value.split(',').map(item => item.trim());
}

/**
 * @description Sets up the environment for the action.
 * @returns {IEnvironment | Error} The environment variables for the action, or an error if one occurred.
 */
export function setupEnvironment(): IEnvironment {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const prFilter = getValueFromInput<EnumPRFilter>(
      'pr_filter',
      false,
      EnumPRFilter.All,
      undefined,
      EnumPRFilter
    );
    const baseBranches = getValueFromInput<string[]>(
      'base_branch',
      false,
      [],
      commaSeparatedStringToArray
    );
    const prReadyState = getValueFromInput<EnumPRReadyState>(
      'pr_ready_state',
      false,
      EnumPRReadyState.All,
      undefined,
      EnumPRReadyState
    );
    const prLabels = getValueFromInput<string[] | undefined>(
      'pr_label',
      false,
      undefined,
      commaSeparatedStringToArray
    );
    const excludePrLabels = getValueFromInput<string[]>(
      'exclude_pr_label',
      false,
      [],
      commaSeparatedStringToArray
    );
    const mergeFailAction = getValueFromInput<EnumMergeFailAction>(
      'merge_fail_action',
      false,
      EnumMergeFailAction.Fail,
      undefined,
      EnumMergeFailAction
    );
    const mergeMethod = getValueFromInput<EnumMergeMethod>(
      'merge_method',
      false,
      EnumMergeMethod.Merge,
      undefined,
      EnumMergeMethod
    );
    const mergeCommitMessage = getValueFromInput<string>(
      'merge_commit_message',
      false,
      ''
    );
    const ignoreConflicts = getValueFromInput<boolean>(
      'ignore_conflicts',
      false,
      true,
      value => value === 'true'
    );

    const githubRestApiUrl =
      process.env.GITHUB_API_URL || 'https://api.github.com';
    const githubGraphqlApiUrl =
      process.env.GITHUB_GRAPHQL_URL || 'https://api.github.com/graphql';

    return {
      githubRestApiUrl,
      githubGraphqlApiUrl,
      githubToken,
      baseBranches,
      prFilter,
      prReadyState,
      prLabels,
      excludePrLabels,
      mergeFailAction,
      mergeMethod,
      mergeCommitMessage,
      ignoreConflicts,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    else
      throw new Error(`Unknown error while setting up environment: ${error}`);
  }
}
