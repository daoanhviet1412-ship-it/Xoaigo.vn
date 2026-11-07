# Xoài Go Admin Control Center — Repository Audit

Date: 2026-11-07
Repository: daoanhviet1412-ship-it/Xoaigo.vn
Base: preview/policy-approval-admin
Working branch: feature/admin-control-center-foundation

## Confirmed findings

1. The current policy approval page is a client-only React component.
2. Policy state and approval requests are initialized from hard-coded sample values.
3. Persistence uses browser localStorage key `xoai-policy-demo-v1`.
4. The active role is a client-side select (`operator` / `owner`); it is not authenticated identity or server-enforced authorization.
5. Approval and rejection mutate React state and localStorage only.
6. The page explicitly labels itself DEMO / SANDBOX and says it is not connected to Supabase or real transactions.
7. The inspected branch's package.json contains Next.js, React and lucide-react only. No Supabase or Clerk SDK dependency is present.
8. No middleware.ts, proxy.ts, lib/supabase.ts or utils/supabase/server.ts was found at the inspected paths on this branch.
9. The repository default branch is main. Work is isolated on feature/admin-control-center-foundation; production/main has not been changed.

## Consequences

- The current page is not suitable for real policy changes, points, merchant liabilities or financial operations.
- Browser state must never be treated as authoritative for roles, policy values, approval state or balances.
- Authentication, server-side authorization, database persistence, immutable audit history and concurrency-safe approval transitions are not implemented in the inspected feature.
- No live Supabase project/schema/credentials were available through this repository inspection. Do not claim database integration or run production migrations until the project connection and environment are verified.

## Implementation direction

1. Preserve the existing demo as a reference, but replace simulated role switching with authenticated identity and server-side permission checks.
2. Establish database-backed admin roles, policy versions, approval requests/actions and audit events.
3. Enforce Maker/Checker separation in database/server logic, not only in UI.
4. Keep policy configuration separate from the financial ledger. Do not introduce cash custody, wallet or payment execution.
5. Add transaction/points/budget/settlement ledgers only after inspecting the existing app data model to avoid duplicate or conflicting sources of truth.
6. Keep all changes on this feature branch and verify a preview deployment before any production merge.

## Remaining verification

- Inspect full application route tree and existing data model.
- Confirm the actual Supabase project and existing tables/RLS policies.
- Confirm Clerk tenant and environment variables, if Clerk remains the selected auth provider.
- Run install, lint, build and integration tests in a connected build environment.
