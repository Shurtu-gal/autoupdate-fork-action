/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import * as github from '@actions/github'
import { retry } from '@octokit/plugin-retry'
import { setupEnvironment } from './environment'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const environment = setupEnvironment()
    const octokit = github.getOctokit(
      environment.githubToken,
      {
        baseUrl: environment.githubApiUrl
      },
      retry
    )
    console.log(process.env)
    console.log(octokit.rest)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else if ((error as { request: unknown })?.request) {
      core.setFailed(
        `Request failed: ${(error as { request: unknown })?.request}`
      )
    } else core.setFailed('An unknown error occurred')
  }
}

run()
