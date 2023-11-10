import { IEnvironment, Octokit } from 'src/types';

export async function updateAllBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
  environment: IEnvironment
) {
  console.log('updateAllBranches');
  console.log(owner);
  console.log(repo);
}
