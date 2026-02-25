# Repository workflow rules

## Branching
- Before starting work:
  1. `git checkout main`
  2. `git pull origin main`
  3. `git checkout -b codex/<task-name>`

## Before opening a PR
- Rebase the feature branch on top of latest main:
  1. `git fetch origin`
  2. `git rebase origin/main`
- If rebase conflicts appear and the task owner requests taking incoming changes:
  1. `git checkout --theirs <file>`
  2. `git add <file>`
  3. `git rebase --continue`
- Push rebased branch:
  1. `git push --force origin HEAD`
