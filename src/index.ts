/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import { setupEnvironment } from './environment'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run(): Promise<void> {
  try {
    const environment = setupEnvironment()
    console.log(environment)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
