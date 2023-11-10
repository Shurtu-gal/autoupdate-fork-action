import {
  EnumMergeConflictAction,
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
  enumeration?: any
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
    const prReadyState = getValueFromInput<EnumPRReadyState>(
      'pr_ready_state',
      false,
      EnumPRReadyState.All,
      undefined,
      EnumPRReadyState
    );
    const prLabels = getValueFromInput<string[]>(
      'pr_label',
      false,
      [],
      commaSeparatedStringToArray
    );
    const excludePrLabels = getValueFromInput<string[]>(
      'exclude_pr_label',
      false,
      [],
      commaSeparatedStringToArray
    );
    const mergeConflictAction = getValueFromInput<EnumMergeConflictAction>(
      'merge_conflict_action',
      false,
      EnumMergeConflictAction.Fail,
      undefined,
      EnumMergeConflictAction
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
    const githubApiUrl = process.env.GITHUB_API_URL || 'https://api.github.com';

    return {
      githubApiUrl,
      githubToken,
      prFilter,
      prReadyState,
      prLabels,
      excludePrLabels,
      mergeConflictAction,
      mergeMethod,
      mergeCommitMessage,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    else
      throw new Error(`Unknown error while setting up environment: ${error}`);
  }
}
