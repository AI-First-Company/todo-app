# CLAUDE.md — Todo App

## Project Overview

A full-featured todo app built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Storage:** localStorage (MVP, no database)
- **Package manager:** npm

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

## Git Workflow

**IMPORTANT: Never commit directly to main.**

1. Always create a feature branch: `ai/issue-{N}` (where N is the **GitHub** issue number, NOT the Paperclip AIC-N number)
2. To find the GitHub issue number, run: `gh issue list --repo AI-First-Company/todo-app --label ai-task`
3. Make commits on the feature branch with clear, imperative commit messages (max 72 chars)
4. Push the branch and **open a Pull Request** targeting `main`
5. PR body **must** include `Closes #{GitHub issue number}` to auto-link and auto-close the GitHub issue when merged
6. **Use the GitHub issue number, not the Paperclip issue number.** For example, if the GitHub issue is #3, write `Closes #3` (not `Closes #19`)
7. All AI commits must include: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

Example workflow:
```bash
# First, find the GitHub issue number
gh issue list --repo AI-First-Company/todo-app --label ai-task

# Create branch using the GitHub issue number
git checkout -b ai/issue-3
# ... make changes ...
git add <files>
git commit -m "feat: add category filtering

Closes #3
Co-Authored-By: Paperclip <noreply@paperclip.ing>"
git push -u origin ai/issue-3
gh pr create --title "feat: add category filtering" --body "Closes #3"
```

## Conventions

- Use TypeScript for all files (no plain JS)
- Use App Router (`src/app/`) for pages and API routes
- Components go in `src/components/`
- Types/interfaces go in `src/types/` or co-located with components
- Use Tailwind CSS for all styling — no CSS modules or styled-components
- Prefer `const` over `let`; avoid `var`
- Use async/await over callbacks

## PR Review Feedback Loop

When the QA Engineer requests changes on your PR:

1. **Check for review feedback** on your open PRs before starting new work:
   ```bash
   gh pr list --repo AI-First-Company/todo-app --author @me --json number,title,reviewDecision
   ```
2. For any PR with `CHANGES_REQUESTED`:
   ```bash
   gh pr view <NUMBER> --repo AI-First-Company/todo-app --json reviews --jq '.reviews[-1].body'
   ```
3. Read the QA feedback carefully and fix every issue mentioned
4. Run `npm run build` and `npm run lint` to verify fixes
5. Commit the fixes to the **same branch** and push:
   ```bash
   git add <files>
   git commit -m "fix: address QA review feedback"
   git push
   ```
6. Post a comment on the PR:
   ```bash
   gh pr comment <NUMBER> --repo AI-First-Company/todo-app --body "Fixes pushed — ready for re-review."
   ```

## Merge Conflict Resolution

Before starting new work, check if any of your open PRs have merge conflicts:

1. **Check PR status:**
   ```bash
   gh pr list --repo AI-First-Company/todo-app --author @me --json number,title,mergeable
   ```
2. For any PR with conflicts:
   ```bash
   git fetch origin
   git checkout <branch>
   git rebase origin/main
   # Resolve any conflicts in the files
   git add <resolved-files>
   git rebase --continue
   npm run build && npm run lint   # verify nothing broke
   git push --force-with-lease
   gh pr comment <NUMBER> --repo AI-First-Company/todo-app --body "Conflicts resolved — ready for re-review."
   ```

**Priority: Fix review feedback and merge conflicts before starting new issues.**

## Never Do This

- Do not commit or push directly to `main` — always use a feature branch + PR
- Do not hardcode secrets or API keys
- Do not commit `node_modules/` or `.env` files
- Do not use `require()` — this is an ESM/TypeScript project
