# Frontend Release Readiness Checklist

Use this checklist before promoting the frontend to a production-like
environment (preview deploy, staging, or `main` → prod). It complements
[CONTRIBUTOR_CHECKLIST.md](./CONTRIBUTOR_CHECKLIST.md), which gates a
single PR; this gates a *release*.

The owner of the release MUST tick every item, paste the completed list
into the release PR or release notes, and link to the run that produced
the evidence (CI job, dashboard URL, or screenshot). If an item cannot
be ticked, file a "Release blocker" issue and pause the rollout.

---

## 1. Build and type safety

- [ ] `npm ci` succeeds on a clean clone (no lockfile drift)
- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0 — production build completes
- [ ] `npx tsc --noEmit` reports no errors in files changed since the last release
- [ ] Bundle size delta from the last release reviewed via `npm run analyze` — no unexplained > 10% growth in any chunk

## 2. Tests

- [ ] `npm run test` (vitest) — all unit tests pass
- [ ] `npm run test:e2e` (Playwright smoke) — green against the mocked treasury build
- [ ] If new transaction paths were added, at least one e2e covering the happy path exists
- [ ] No `.skip` / `.only` in committed test files (`grep -RE "(it|describe)\.(skip|only)" src e2e`)

## 3. Security

- [ ] `npm audit --omit=dev` — no high or critical advisories without an opened issue
- [ ] CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP headers emitted on the deploy URL (verify with `curl -I` against the preview URL)
- [ ] No `dangerouslySetInnerHTML` introduced this release without a sanitization comment
- [ ] No secrets (API keys, mnemonics, RPC tokens) in `NEXT_PUBLIC_*` env vars
- [ ] `.env.docker` and `next.config.js` reviewed — no leaked credentials in source

## 4. Configuration and environment

- [ ] All `NEXT_PUBLIC_*` env vars used by the new build are declared in the deploy environment (treasury & governance contract IDs, RPC URL, network passphrase)
- [ ] `NEXT_PUBLIC_USE_MOCK_TREASURY` is **unset** in the production environment
- [ ] Soroban RPC URL points to the intended network (testnet for staging, mainnet for prod)
- [ ] Diagnostics panel does not render in production (`isDev` gate verified)

## 5. Wallet and on-chain integration

- [ ] Connect / disconnect with Freighter works against the deploy
- [ ] At least one read-only contract call (treasury config / get balance) returns the expected value from the deploy
- [ ] Network mismatch surfaces a user-visible error (test with Freighter set to a different network)
- [ ] Transaction submission goes through `useTxLifecycle.run()` — no direct `signAndSubmit` from components

## 6. Performance

- [ ] Lighthouse run on the deploy URL — no new "performance" or "accessibility" regressions of more than 5 points
- [ ] No client-side route in the new code blocks first paint on a Soroban RPC call (network calls are fired in `useEffect`, not at render)
- [ ] Images served from `/public` use `next/image` where above the fold

## 7. Accessibility

- [ ] Tab traversal reaches every interactive element on changed routes
- [ ] Focus styles visible on `:focus-visible`
- [ ] Modal close buttons reachable via keyboard (`Esc` and tabbed focus)
- [ ] Forms have associated `<label htmlFor>` or `aria-label`

## 8. Observability

- [ ] User-visible errors classified through `classifyError()` — no raw `Error.message` strings in UI
- [ ] DiagnosticsPanel snapshot exposes the deployed contract IDs, network, and build version
- [ ] Backend `/api/health` returns `ok` from the deploy (`curl <api>/api/health`)

## 9. Rollback plan

- [ ] Previous release SHA recorded in the release notes
- [ ] Rollback procedure verified — the deploy host can be reverted to the prior SHA without a manual data migration
- [ ] Owner identified for the first 24h of the release window

## 10. Documentation and changelog

- [ ] `frontend/QUALITY.md` reviewed — no stale references to removed scripts or env vars
- [ ] Release notes drafted with: user-facing changes, breaking changes (if any), known issues, and the SHA under deploy
- [ ] If contract IDs changed, `docs/SMARTCONTRACT_GUIDE.md` is in sync

---

## Sign-off

```
Release: <commit SHA>
Date (UTC): YYYY-MM-DD HH:MM
Owner: @<github-handle>
Verified preview URL: <url>
All sections complete: yes / no
Outstanding blockers: <issue links or "none">
```

Paste the above into the release PR description before merging to
`main`, or into the release notes before tagging.
