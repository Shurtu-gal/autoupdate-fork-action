# Autoupdate Fork Action Test

[![GitHub Super-Linter](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/ci.yml/badge.svg)
[![Check dist](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Shurtu-gal/autoupdate-fork-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Action that automatically updates a forked repository with the latest changes from its upstream. It is useful for cases like:-
- You want to keep the forked repository up to date with the upstream repository to have the most recent version of the code and tests.
- Especially useful for forks of repositories that are actively developed and maintained.
- You have a branch rule that requires all branches to be up to date with the base branch before merging.

## Table of Contents
- [Motivation](#motivation)
- [Supported Scenarios](#supported-scenarios)
  - [Push to Base Branch](#push-to-base-branch)
  - [Scheduled Updates](#scheduled-updates)
  - [Update on comments](#update-on-comments)
  - [Workflow Dispatch](#workflow-dispatch)
- [Action Flow](#action-flow)
- [Configuration](#configuration)
- [Examples](#examples)
  - [Push to Base Branch](#push-example)
  - [Scheduled Updates](#scheduled-example)
  - [Update on comments](#comment-example)
  - [Advanced Example](#advanced-example)
  <!-- - [Super Advanced Example](#super-advanced-example) -->
- [Debugging](#debugging)
- [Future Plans](#future-plans)


## Motivation

When you fork a repository, it is usually to make changes to it. However, if the upstream repository is actively developed and maintained, your fork will quickly become out of date. This action helps you keep your fork up to date with the upstream repository. It does so by automatically merging the latest changes from the upstream repository into your fork.

It becomes helpful when the Pull Request is not merged for a long time and you want to keep your fork up to date with the upstream repository.

Needed when there is a branch rule that requires all branches to be up to date with the base branch before merging.

## Supported Scenarios

### Push to Base Branch

This is the most common scenario. When a push is made to the base branch, the action will automatically merge the latest changes from the upstream repository in the PRs pointing to the base branch.

### Scheduled Updates

You can schedule the action to run at a specific time. This is useful when you want to keep all PRs up to date with the upstream repository.

### Update on comments

You can trigger the action by commenting on a PR. This is useful when you want to update a specific PR with the latest changes from the upstream repository.

Advantage of this approach is that anyone can trigger the action by commenting on the PR whether he be a collaborator/maintainer or not. Eases the review process.

### Workflow Dispatch

You can trigger the action by manually dispatching the workflow. This is useful when you have infrequent usage with varying parameters.


## Action Flow

This makes a GraphQL request to GitHub API to get all the PRs acc. to parameters and updates them if they are behind the base branch.

<!-- ![Action Flow](./images/action-flow.png) -->

## Configuration

| Parameter | Description | Required | Default |
| --- | --- | --- | --- |
| `github_token` | Token used to authenticate with the GitHub API. It should belong to a user with write/maintain permissions to the repository. It also must have "repository" and "workflow" scopes so it can push to repository and edit workflows. Suggestions: Create a bot user and give it write access to the repos. | Yes | - |
| `base_branch` | The comma-separated list of base branches on which pull requests should be updated. | No | `master, main` |
| `pr_filter` | Controls how autoupdate chooses which pull requests to operate on. Possible values are `all`, `labelled`. | No | `all` |
| `pr_label` | The comma-separated list of labels to filter pull requests on. Only pull requests one of with these labels will be updated. **Only works if `pr_filter` is labelled** | No | `autoupdate` |
| `exclude_pr_label` | The comma-separated list of labels to filter pull requests on. Pull requests with any of these labels will not be updated. | No | - |
| `merge_fail_action` | The action to take when a merge fails. Possible values are `fail`, `ignore`, `comment`. | No | `comment` |
| `ignore_conflicts` | Whether to ignore merge conflicts or fail the workflow. Possible values are `true`, `false`. | No | `true` |


## Examples

### Push Example

```yaml
name: Update Fork
on:
  push:
    branches:
      - master
      - main

jobs:
  update-fork:
    runs-on: ubuntu-latest
    steps:
      - uses: Shurtu-gal/autoupdate-fork-action@v1
        with:
          github_token: ${{ secrets.BOT_TOKEN }}       
          pr_filter: labelled
          pr_label: fork-update
```

### Scheduled Example

```yaml
name: Update Fork
on:
  schedule:
    # Runs at 12:00am UTC every day
    - cron: '0 0 * * *'

jobs:
  update-fork:
    runs-on: ubuntu-latest
    steps:
      - uses: Shurtu-gal/autoupdate-fork-action@v1
        with:
          github_token: ${{ secrets.BOT_TOKEN }}
          pr_filter: labelled
          pr_label: fork-update
          # Only update PRs on master branch
          base_branch: master
```

### Comment Example

```yaml
name: Update Fork
on:
  issue_comment:
    types: [created]

jobs:
  update-fork:
    if: ${{ github.event.comment.body == '/update' }}
    runs-on: ubuntu-latest
    steps:
      - uses: Shurtu-gal/autoupdate-fork-action@v1
        with:
          github_token: ${{ secrets.BOT_TOKEN }}
```

### Advanced Example

```yaml
name: Update Fork
on:
  push:
    branches:
      - master
      - main
  schedule:
    # Runs at 12:00am UTC every day
    - cron: '0 0 * * *'
  issue_comment:
    types: [created]

jobs:
  update-fork:
    if: ${{ github.event.comment.body == '/update' }}
    runs-on: ubuntu-latest
    steps:
      - uses: Shurtu-gal/autoupdate-fork-action@v1
        with:
          github_token: ${{ secrets.BOT_TOKEN }}
          pr_filter: labelled
          pr_label: fork-update
          # Only update PRs on master branch
          base_branch: master
          ignore_conflicts: false
```

### Workflow Dispatch Example

```yaml
name: Update Fork
on:
  workflow_dispatch:
    inputs:
      pr_filter:
        description: 'Filter PRs'
        required: true
        type: choice
        options:
          - 'all'
          - 'labelled'
          - 'error'

jobs:
  update-fork:
    if: ${{ github.event.comment.body == '/update' }}
    runs-on: ubuntu-latest
    steps:
      - uses: Shurtu-gal/autoupdate-fork-action@v1
        with:
          github_token: ${{ secrets.BOT_TOKEN }}
          pr_filter: labelled
          pr_label: fork-update
          # Only update PRs on master branch
          base_branch: master
          ignore_conflicts: false
```

## Debugging

In case something ain't right, the action doesn't work as expected, enable debugging. Add to **Secrets** of the repository a secret called `ACTIONS_STEP_DEBUG` with value `true`. Now, once you run the action again, there will be additional logs visible that start with `DEBUG:`.

## Future Plans

- [ ] Add support for custom commit message
- [ ] Add support for custom merge method
- [ ] Add support for better filtering of PRs
- [ ] Add support for removing very old PRs from the list
- [ ] Add support for outputs