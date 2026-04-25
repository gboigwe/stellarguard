# Frontend Contributor Checklist

Use this checklist before opening a pull request against the StellarGuard frontend. Each section maps to a concern that reviewers will check; addressing every item upfront speeds up review.

---

## 1. Code quality

- [ ] No `any` types introduced without a `// eslint-disable` comment explaining why
- [ ] No raw `console.log` / `console.error` left in production code paths
- [ ] All new functions and hooks have clear parameter names (no single-letter generics outside of true generic type parameters)
- [ ] No duplicated logic that should live in `src/lib/`

## 2. Transaction safety

- [ ] Every new transaction submission path goes through `useTxLifecycle.run()` (idempotency guard is then automatic)
- [ ] No direct calls to `signAndSubmit()` from components — always via a hook
- [ ] Buttons that trigger transactions are disabled while `state.stage !== "idle"` or while `isSubmitting()` returns true
- [ ] Optimistic UI updates are rolled back in the `catch` block if the on-chain call fails

## 3. XLM / stroop handling

- [ ] All user-facing amount inputs use `sanitizeXlmInput()` on every keystroke (controlled input)
- [ ] Conversion from input string to on-chain value uses `parseXlmToStroops()` — never `Number()` or `parseFloat()`
- [ ] Display formatting uses `formatXlm()` — never manual `/ 10_000_000` arithmetic
- [ ] Amount fields reject submission when the parsed value is `0n` or negative (unless a negative amount is intentional)

## 4. Error handling

- [ ] All async operations in hooks catch errors and call `classifyError()` before storing in state
- [ ] No raw `Error.message` strings exposed directly in UI — route through `AppError.message`
- [ ] Wallet-not-connected, network-mismatch, and user-rejected paths each surface a distinct, actionable message

## 5. Tests

- [ ] New utility functions in `src/lib/` have a corresponding `.test.ts` file
- [ ] Happy path **and** at least one error path are covered per new function
- [ ] `npm run test` passes with no failures before pushing

## 6. Dependency hygiene

- [ ] No new `dependencies` added without a brief justification in the PR description
- [ ] No new `devDependencies` that duplicate an existing tool (check `package.json` first)
- [ ] `npm run check:deps` exits 0 (no unused or undeclared packages)

## 7. Accessibility & UX

- [ ] Interactive elements (buttons, inputs) have visible focus styles
- [ ] Disabled buttons include a `title` or `aria-label` explaining why they are disabled
- [ ] Loading states show a spinner or skeleton — no silent blank areas

## 8. Docs & issue tracking

- [ ] `docs/ISSUES-FRONTEND.md` checkbox marked `[x]` with your GitHub username and UTC timestamp
- [ ] If a new architectural decision was made, an ADR has been added to `docs/adr/`
- [ ] `docs/FRONTEND_GUIDE.md` updated if the project structure, setup steps, or key patterns changed

## 9. Final checks

- [ ] Branch is up to date with `main` (rebased or merged)
- [ ] PR description references the issue number(s) being closed (e.g. `Closes #166`)
- [ ] No unrelated files changed (check `git diff --stat origin/main`)
