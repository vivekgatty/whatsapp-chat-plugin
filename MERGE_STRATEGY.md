# Merge Strategy (Sandbox-Safe)

The Codex sandbox environment does not have a configured Git remote (`origin`).
As a result, remote Git commands such as `git fetch`, `git rebase origin/main`,
and `git push origin` are unreliable in this environment.

## Required Approach
All PR conflict resolution and branch syncing must be done with GitHub CLI (`gh`),
not raw git remote commands.

Use:
- `gh repo sync`
- `gh pr update-branch <PR_NUMBER>`
- `gh pr merge <PR_NUMBER> --merge`
- `gh pr create --base main --fill`

## Task Workflow
At the start of every task:

```bash
gh repo sync
```

At the end of every task, before creating a PR:

```bash
gh pr create --base main --fill
```
