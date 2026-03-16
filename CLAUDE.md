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

1. Always create a feature branch: `ai/issue-{N}` (where N is the GitHub issue number)
2. Make commits on the feature branch with clear, imperative commit messages (max 72 chars)
3. Push the branch and **open a Pull Request** targeting `main`
4. PR title should be concise; PR body must include `Closes #{issue}` to auto-close the GitHub issue
5. All AI commits must include: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

Example workflow:
```bash
git checkout -b ai/issue-2
# ... make changes ...
git add <files>
git commit -m "feat: add todo CRUD operations

Closes #2
Co-Authored-By: Paperclip <noreply@paperclip.ing>"
git push -u origin ai/issue-2
gh pr create --title "feat: add todo CRUD" --body "Closes #2"
```

## Conventions

- Use TypeScript for all files (no plain JS)
- Use App Router (`src/app/`) for pages and API routes
- Components go in `src/components/`
- Types/interfaces go in `src/types/` or co-located with components
- Use Tailwind CSS for all styling — no CSS modules or styled-components
- Prefer `const` over `let`; avoid `var`
- Use async/await over callbacks

## Never Do This

- Do not commit or push directly to `main` — always use a feature branch + PR
- Do not hardcode secrets or API keys
- Do not commit `node_modules/` or `.env` files
- Do not use `require()` — this is an ESM/TypeScript project
