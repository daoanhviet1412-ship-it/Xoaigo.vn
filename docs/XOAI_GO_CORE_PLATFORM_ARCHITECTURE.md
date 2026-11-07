# XOÀI GO — Core Platform Architecture Blueprint

Status: Draft for implementation under the product owner's end-to-end authorization  
Date: 2026-11-07  
Repository: `daoanhviet1412-ship-it/Xoaigo.vn`  
Implementation branch: `feature/xoai-core-platform`  
Baseline: `main` at `e6e6255feaabfa23e42d598aceeda7eeec362f55`

## 1. Executive decision

The current `main` branch is a public-facing marketing website, not an operational application. The full recursive Git tree contains 14 entries and no application backend, API routes, database migrations, authentication middleware, or Supabase configuration. The separate policy-admin prototype exists only on the preview/feature branches and is browser-state demo code.

Build the operational platform as a separate, authenticated application surface inside the same Next.js repository. Preserve the existing public landing page. Keep all work on `feature/xoai-core-platform` and deploy only Preview until the product owner explicitly authorizes a production release.

## 2. Architecture principles

1. Server is authoritative: identity, permissions, policy, balances, approval state and financial calculations are never trusted from the browser.
2. Database is authoritative: durable business state is stored in PostgreSQL; browser storage is limited to harmless UI preferences.
3. Separate identity, authorization, business workflow and financial records.
4. Maker-checker is enforced server-side and in database constraints/transactions; an actor cannot approve their own request.
5. Financial history is append-only. Corrections use reversal/adjustment entries with a reason and actor; original entries are not edited or deleted.
6. Every command that may be retried has an idempotency key and a durable result.
7. Demo fixtures are isolated from production data and clearly labelled.
8. No custody, transfer, payout or payment execution is introduced without verified legal basis and an appropriately licensed provider.
9. Business rules that have not been approved remain configurable/disabled and are not silently invented.
10. Every privileged action is attributable and auditable.

## 3. Target system topology

```text
Public Xoài Go website
  └── Existing Next.js landing page (preserve)

Authenticated Xoài Go application
  ├── Member experience
  ├── Merchant workspace
  └── Admin Control Center
       ├── Overview / work queues
       ├── Merchants and members
       ├── Policy and maker-checker approvals
       ├── Marketing budgets and campaigns
       ├── Orders / points / merchant receivables & payables
       ├── Reconciliation and reports
       └── Audit, roles and security administration

Next.js server boundary
  ├── Authentication/session verification
  ├── Authorization and scope checks
  ├── Input validation and command handlers
  ├── Domain services / transaction orchestration
  └── Structured audit and security events

PostgreSQL (Supabase target, connection not yet verified)
  ├── Identity mapping and role grants
  ├── Merchant/member master data
  ├── Policies, versions and approval requests
  ├── Campaigns and marketing budgets
  ├── Orders and fulfillment records
  ├── Points accounts and immutable entries
  ├── Merchant receivables/payables and settlement batches
  └── Audit events and idempotency records

External providers
  ├── Identity provider (selection subject to access and MFA requirements)
  ├── Delivery provider adapters
  └── Licensed bank/payment partner only if/when legally approved
```

## 4. Technology direction

- Web: preserve Next.js App Router, React and TypeScript already used by the repository.
- Runtime: Vercel Preview for review; production remains untouched.
- Data: PostgreSQL through Supabase is the preferred target because it supports relational transactions, constraints, row-level security and migrations. No Supabase project, credentials, schema or RLS policies have yet been verified.
- Identity: evaluate the existing tenant before choosing. If no identity system exists, compare Supabase Auth MFA with Clerk MFA and select one provider; do not build parallel identity stores. The repository currently contains neither SDK.
- Validation: server-side schemas for every command; reject unknown fields and invalid state transitions.
- Tests: unit tests for domain rules, integration tests against a disposable PostgreSQL/Supabase test project, and E2E tests for privileged workflows.
- Secrets: Vercel encrypted environment variables or the provider's secret manager; never commit values or print them in logs.

## 5. Application boundaries and modules

### Public surface
Keep `app/page.tsx` and its current brand/marketing purpose. Do not turn the landing page into the admin dashboard.

### Authenticated surface
Create protected route groups for:
- `/app` — member-facing application
- `/merchant` — merchant workspace
- `/admin` — administrative control center

Route protection is only a first layer. Every server action/API command must independently verify the session, role, scope and resource ownership.

### Core domains
- Identity and access: user mapping, roles, permissions, merchant scope, MFA state, sessions.
- Merchant: business profile, locations, staff, status and compliance evidence.
- Member: profile, status, membership and consent.
- Policy: versioned policy drafts, review, approval, effective date and immutable history.
- Campaign/budget: funding source, campaign allocation, consumption and remaining budget.
- Commerce: catalog, offer, group-buy campaign, order, fulfillment and refund/cancellation states.
- Points: earn/redeem/expire/adjust events, account projection and merchant obligations.
- Settlement: merchant receivable/payable, reconciliation batch, discrepancy and resolution.
- Audit: actor, action, target, timestamp, request/correlation ID, before/after summary and outcome.

## 6. Initial data model (logical, not yet migrated)

| Domain | Candidate tables |
| --- | --- |
| Access | `profiles`, `roles`, `permissions`, `role_permissions`, `user_role_grants`, `merchant_user_scopes`, `sessions_security_events` |
| Merchant/member | `merchants`, `merchant_locations`, `merchant_staff`, `members`, `memberships` |
| Policy | `policy_sets`, `policy_versions`, `approval_requests`, `approval_actions` |
| Marketing | `campaigns`, `marketing_budget_accounts`, `budget_entries`, `campaign_allocations` |
| Commerce | `products`, `offers`, `group_buy_campaigns`, `orders`, `order_items`, `fulfillments` |
| Points | `points_accounts`, `points_entries`, `points_holds`, `points_redemptions` |
| Settlement | `merchant_obligations`, `settlement_batches`, `settlement_lines`, `reconciliation_items` |
| Platform | `idempotency_records`, `audit_events`, `outbox_events`, `webhook_events` |

This is a proposed domain map only. Before migrations, inspect the connected database and reconcile any existing entities to avoid duplicate sources of truth.

## 7. Security and authorization baseline

- Deny by default; least privilege; permissions are explicit and scoped.
- Separate platform admin, operations, finance, reviewer, merchant owner, merchant staff and member capabilities.
- No client-side role switcher. Role grants are managed by a privileged server workflow and persisted.
- MFA required for privileged accounts; step-up authentication for sensitive actions where supported.
- Maker-checker: the requester cannot review/approve their own request; enforce using actor IDs inside a database transaction.
- RLS enabled on user/merchant-scoped tables. Service credentials never reach the browser.
- Validate authorization in server handlers even when middleware protects the route.
- Rate-limit login, sensitive commands and webhook endpoints.
- Audit security events and all policy, role, budget, points and settlement mutations.
- Use signed/verified webhooks, replay protection, idempotency and strict event schemas.
- Backups, restore drills, session revocation and incident response are release requirements.

## 8. Financial and points model

The data model must distinguish:
- customer cash paid directly to the merchant;
- merchant-funded marketing budget;
- customer points as a promotional liability/benefit under approved terms;
- merchant receivables and payables;
- platform fees/commissions;
- settlement/reconciliation status.

Never treat points as cash by default. Never infer a bank balance from a points balance. The platform should not receive or hold customer purchase funds in the initial model.

If double-entry accounting is required for obligations and internal balances, implement immutable journal transactions and lines with balanced debit/credit constraints, atomic posting, reversal entries, period controls and reconciliation. Do not create financial postings until account mapping, event recognition, fees, expiry/refund rules and merchant settlement terms are approved.

## 9. Business decisions intentionally not hard-coded

The following remain configurable/blocked pending confirmation:
- membership price, renewal, cancellation and benefit eligibility;
- discount funding and merchant cost-sharing;
- points earn/redeem ratio, caps, expiry, holds and reversal;
- marketing budget funding, ownership, allocation and refund treatment;
- merchant commission, platform fee, tax treatment and settlement cadence;
- group-buy minimum quantity, deadline, cancellation and refund policy;
- merchant onboarding/KYC requirements and suspension rules;
- any cash custody, wallet, payout or payment-provider flow.

Previously discussed example numbers are not treated as approved production policy.

## 10. Delivery plan and exit criteria

### Phase 0 — audit and access
- Full route and branch inventory (completed for main and current admin demo branches).
- Verify Supabase project, schema, migrations and RLS with read-only access.
- Verify identity provider tenant and MFA capabilities.
- Verify Vercel project settings, branch previews and environment-variable metadata without exposing secrets.
- Exit: evidence-backed system map and no unknown existing source of truth.

### Phase 1 — secure foundation
- Select and connect identity provider.
- Establish database migration workflow, RLS, role grants and audit events.
- Protected server commands and permission tests.
- Exit: unauthorized requests denied in integration tests; no client-controlled role elevation.

### Phase 2 — admin and merchant/member
- Admin overview, queues, merchant/member CRUD and scoped staff access.
- Exit: CRUD, audit and permission matrix tests pass.

### Phase 3 — policies and marketing budgets
- Versioned policy workflow, maker-checker, scheduled effective dates, budget allocation.
- Exit: self-approval and duplicate/replay tests pass; all rules are approved.

### Phase 4 — commerce, points and settlement
- Orders, points, obligations, immutable journal and reconciliation.
- Exit: invariant, concurrency, idempotency, reversal and reconciliation tests pass.

### Phase 5 — operational readiness
- E2E, security tests, backup/restore drill, monitoring, runbooks and handover.
- Exit: preview accepted; production rollout plan and rollback path reviewed.

## 11. Current blockers and access requirements

1. No Supabase connector or direct project/database access is available in the connected tools. Vercel environment metadata returned an empty list when queried without decrypting values; this does not prove that no external project exists.
2. No Clerk connector or tenant access is available in the connected tools.
3. No existing database schema, migration history or RLS policies could be inspected.
4. Vercel project `xoaigo` is linked to this repository. The feature branch preview builds successfully, but the project currently has SSO protection enabled for deployments except custom domains. Keep preview protected.
5. Build/test commands cannot be run from the GitHub file API alone. CI or a connected build environment is required to verify lint/typecheck/build.

## 12. Repository facts verified on 2026-11-07

- `main` recursive tree: 14 entries; the only application files are `app/page.tsx`, `app/layout.tsx`, `app/globals.css`; remaining entries are package/config/assets.
- `main` `package.json`: Next.js 15.5, React 19.1, lucide-react; no Supabase or Clerk SDK.
- `preview/policy-approval-admin` adds a policy page and CSS prototype; it is not a backend.
- The prototype uses hard-coded initial values, React state and browser `localStorage`; the role picker is client-side.
- The full main tree contains no API routes, middleware/proxy, Supabase config or migration files.
- Vercel project `xoaigo` is linked to the repository. The latest production deployment is on `main`; this implementation branch is Preview only.

## 13. Definition of done

A feature is complete only when its server-side behavior, database constraints/RLS, permission checks, audit events, error/empty/loading states, automated tests and Preview behavior are verified. A visual prototype alone is not complete. No financial feature is enabled with unapproved rules or unverified legal/provider arrangements.
