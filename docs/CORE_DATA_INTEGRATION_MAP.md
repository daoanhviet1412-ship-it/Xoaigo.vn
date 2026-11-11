# XOÀI GO — Core Data Integration Map

**Status:** Implementation contract / Preview-only  
**Date:** 2026-11-11  
**Branch:** `feature/xoai-data-integration-foundation-20261111`  
**Product source of truth:** Notion — [XOÀI GO Product & Admin Control Center](https://app.notion.com/p/4113edffa9a781ddb8fbe076ccc932a8?pvs=204), especially sections 23–25 and the A–I checklist.

## 1. Purpose

This document defines how the existing Xoài Go modules must share identifiers, state, policy snapshots and reporting facts so that Admin pages do not show disconnected or contradictory numbers.

It is an integration contract, not evidence that the workflows are already implemented. All work remains on a feature branch and Preview. No live migration, business posting, production deployment, money custody, payment execution or payout is authorized by this document.

## 2. Verified baseline and discrepancies

### Live Supabase Xoaigovn snapshot

Read-only inspection on 2026-11-11:

- `profiles`: 1; `roles`: 10; `permissions`: 28; `role_permissions`: 84; `user_role_grants`: 1.
- `merchants`: 2; `member_profiles`: 1; `audit_events`: 3.
- `policy_sets`, `policy_versions`, `approval_requests`, `approval_actions`: 0.
- `merchant_locations`, `product_categories`, `merchant_products`, `marketing_campaigns`: 0.
- `commerce_orders`, `commerce_order_items`: 0.
- `ledger_accounts`, `journal_transactions`, `journal_lines`, `idempotency_records`: 0.
- `reconciliation_batches`, `reconciliation_items`: 0.
- `points_accounts`, `points_entries`, `points_holds`: 0.
- `merchant_obligations`, `settlement_batches`, `settlement_lines`: 0.
- All inspected public tables have RLS enabled. This is not a substitute for runtime role/session tests.

### Migration discrepancy to resolve before any DDL

- Live Supabase migration history currently lists 24 migrations, ending at `0024_restrict_client_table_mutations`.
- Notion's progress notes mention migration `0026_audit_integrity_guards` as applied/verified on the feature branch in an earlier audit.
- The repository feature branch contains source for migration 0026, but the live migration history returned by Supabase does not show it.
- Treat 0026 as **not confirmed applied to live** until the exact branch, SQL source, database migration history and resulting constraints are reconciled. Do not apply, replay, skip or mark it applied based on assumption.
- Notion also records an unresolved Production-vs-main commit divergence. Neither main nor Production may be changed as part of this work.

## 3. Canonical module ownership

| Domain | Canonical source | Downstream consumers | Important boundary |
|---|---|---|---|
| Identity | Supabase Auth + `profiles` | Every authenticated admin/member action | Auth identity is not a merchant record |
| Access | `roles`, `permissions`, `role_permissions`, `user_role_grants` | Server actions/RPCs, RLS, Admin navigation | UI visibility never grants authority |
| Merchant | `merchants`, `merchant_locations` | Catalog, campaigns, orders, wallets, obligations, settlement, reports | Merchant scope must be enforced server-side |
| Member | `member_profiles` | Orders, customer points wallet, campaign eligibility | Member profile is linked to Auth user |
| Catalog | `product_categories`, `merchant_products` | Campaign eligibility, order items, merchant storefront | Product price/eligibility snapshot belongs to order line |
| Campaign & policy | `marketing_campaigns`, `policy_sets`, `policy_versions`, approval records | Earn calculation, order preview, transaction audit | Approved version snapshot is immutable per transaction |
| Commerce | `commerce_orders`, `commerce_order_items` | Earn/redeem, GMV, evidence reconciliation | Order is the commercial event; not itself proof of money settlement |
| Points | Existing `points_accounts/entries/holds` plus planned points subledger | Customer/Merchant/App point balances, pending, held, release, reversal | POINTS must remain separate from VND journal |
| VND accounting | `ledger_accounts`, `journal_transactions`, `journal_lines` | Finance reporting, approved money obligations | Do not encode POINTS as a currency in this journal |
| Merchant obligations | `merchant_obligations` | Settlement batches/lines, merchant finance views | Amount/currency are VND/fiat-style fields; not point balances |
| Reconciliation | `reconciliation_batches/items` plus future point reconciliation facts | Exception queues, finance and operations dashboard | A discrepancy is surfaced, never silently auto-corrected |
| Audit | `audit_events` and immutable domain history | Every sensitive Admin action | Actor, timestamp, target, outcome, reason and correlation must be traceable |

## 4. Required relationship and correlation model

Every business flow must carry stable identifiers through its modules. Do not join records by display name, phone number, mutable description or approximate timestamp.

Minimum shared references:

- `merchant_id`: merchant profile, locations, products, campaigns, orders, point wallet, obligations, settlement and audit scope.
- `member_user_id` / customer subject ID: Auth profile, member profile, order, customer point wallet and audit context.
- `order_id`: order header, order items, earn/redeem point transaction, evidence and reconciliation item.
- `campaign_id` + `policy_version_id`: campaign decision and immutable transaction snapshot.
- `point_transaction_id`: all point debit/credit entries, bucket movements, holds, release approvals, reversals and reconciliation.
- `correlation_id`: cross-domain trace for one command/event, including audit and idempotency.
- `approval_request_id`: submitted action, maker, checker, decision, evidence and resulting command.
- `settlement_batch_id` + `obligation_id`: merchant obligation aggregation and settlement trace.
- `journal_transaction_id`: VND journal lines only; never substitute it for a point transaction ID.

Any new FK or unique constraint must be reviewed against existing schema and migration history first. The current schema has a member-only points account relation; it is not yet the Customer/Merchant/App three-subject points ledger required by product policy.

## 5. Authoritative flows and numerical invariants

### 5.1 Order lifecycle

1. Validate authenticated actor, merchant scope, member status, catalog availability and campaign eligibility.
2. Create order header and immutable order-line snapshots.
3. Persist the selected approved campaign/policy version and calculation inputs.
4. Record external payment/evidence separately from order status. A completed order must not automatically be interpreted as verified cash settlement.
5. Invoke a points command only when the relevant transaction and policy conditions are satisfied.
6. Reconcile order, evidence, points and any approved VND journal/obligation by stable references.

Order status, payment/evidence status, point transaction status and reconciliation status are distinct state machines. Never compress them into one generic `status`.

### 5.2 Point Earn — independent policy

Notion sections 23–24 are authoritative:

- Merchant funds 100% of promotional POINTS.
- 70% of total promotional POINTS is allocated to Customer Pending.
- 30% is allocated to App Pending.
- Merchant promotion rate/cap and eligible transaction base remain subject to approved configuration; unresolved details must not be invented.
- Persist the exact approved campaign/policy snapshot used.
- The Point Redeem two-day manual release rule must not be copied onto Point Earn; Earn release timing/conditions remain open unless separately approved.

Invariant per earn transaction:

`Merchant points debit = Customer Pending credit + App Pending credit`

Expected difference is zero after a separately approved rounding rule. Rounding/remainder policy is still open; do not enable posting until resolved.

### 5.3 Point Redeem — separate policy

Notion section 25 is the latest decision:

- Debit the customer's wallet by the full redeemed POINTS amount.
- Merchant Pending credit = 90% by default, or a different approved merchant-specific rate.
- App Pending credit = remainder (100% minus merchant rate).
- Both recipient allocations are Pending for at least 2 days.
- Expiry of 2 days never triggers automatic release. A qualified manual approval after risk/account review is required.
- Flagged transactions/accounts remain Pending/Held until handled.
- Maker cannot approve their own request.

Invariant per redeem transaction:

`Customer points debit = Merchant Pending credit + App Pending credit`

The merchant rate and policy version must be snapshotted per transaction. A later rate change cannot rewrite history.

### 5.4 Pending and reconciliation

Pending is an aggregate view, not a fourth wallet and not an additional ledger posting.

For Earn:

`Variance = Merchant points deducted − (Customer Pending + App Pending)`

For Redeem:

`Variance = Customer points debited − (Merchant Pending + App Pending)`

Expected variance = 0 under the approved rounding rule. Any non-zero variance creates an exception with source references, owner, reason, evidence and audit trail. No auto-adjustment, synthetic compensating entry or silent balance change.

### 5.5 VND / GMV / merchant obligations

- Customer real-money payment is made directly to the merchant under the current product model.
- An order's GMV is a commerce metric, not platform revenue, cash received by Xoài or merchant settlement.
- VND journal, merchant obligations and settlement records must have explicit source references and approved fee/policy snapshots.
- No fee rate, settlement cadence, credit limit, marketing budget source, COA mapping, payout or payment-provider behavior may be invented; these remain open in Notion P31/blockers.
- No real-money custody, transfer or payment service until legal basis and appropriately licensed partner are in place.

## 6. Dashboard and reporting contract

Every KPI must have a named canonical query/source, time window, status filter, currency/unit and permission.

| KPI | Canonical source | Rules |
|---|---|---|
| GMV | Completed `commerce_orders` | Label GMV; never call it Xoài revenue or settled cash |
| Completed orders | `commerce_orders` | Count only approved completed status; use same date window as GMV |
| Active merchants | `merchants` | Explicit status/onboarding filter; document which one |
| Members | `member_profiles` | Distinguish total, active and new-in-period |
| Active campaigns | `marketing_campaigns` | Use campaign status and effective window consistently |
| Customer Pending | Points subledger | POINTS unit; not VND |
| Merchant Pending | Points subledger | POINTS unit; separate from merchant VND obligations |
| App Pending | Points subledger | POINTS unit |
| Consolidated Pending | Aggregate Customer + Merchant/App Pending as applicable by flow | Reporting only; do not post or add twice |
| Earn allocation variance | Point transaction entries | Merchant debit vs Customer + App credits |
| Redeem allocation variance | Point transaction entries | Customer debit vs Merchant + App credits |
| Merchant VND obligations | `merchant_obligations` | Currency explicit; never merge with POINTS |
| Reconciliation exceptions | `reconciliation_batches/items` and point reconciliation | Count by matched/discrepancy/unmatched/resolved, not by UI placeholder |
| Approval queue | `approval_requests/actions` | Pending reviewer action; exclude self-approval |
| Audit activity | `audit_events` and domain audit | Actor/time/action/resource/outcome |

No chart may show a zero merely because a query failed, permission was denied or a result was truncated. Distinguish: zero records, unavailable data, no permission, incomplete query and demo data.

All KPIs must use the same Asia/Ho_Chi_Minh date-window boundaries for the selected period. Do not mix browser-local date boundaries with UTC database filters.

## 7. Admin page integration requirements

- **Overview:** read-only aggregation from canonical domain sources; drill-down links preserve filters and period.
- **Merchant management:** merchant profile is the parent context for location, catalog, campaign, orders, point activity, obligations, settlement and audit.
- **Member management:** member profile is the parent context for orders, points, account status and activity.
- **Campaign/policy:** draft → submitted → approved/scheduled → active/completed; policy snapshots remain immutable; overlapping campaigns cannot silently stack.
- **Orders:** one order detail shows item snapshots, merchant/member, payment/evidence status, applied campaign, point transactions and reconciliation links.
- **Points:** separate Customer/Merchant/App wallets; Available/Pending/Held buckets; immutable transaction explorer; manual redeem release review.
- **Ledger:** VND/accounting journal only.
- **Merchant finance/settlements:** obligations and settlement batches/lines, with no automatic payout.
- **Reconciliation:** order/evidence, Earn allocation, Redeem allocation, wallet projection and VND settlement are separate reconciliation types.
- **Approvals:** maker-checker enforced in database/server command, not just hidden UI controls.
- **Audit:** all sensitive writes are traceable to actor, time, target, request/correlation ID and outcome.

## 8. Implementation gates

### Gate 0 — reconcile current state
- Confirm current branch HEAD and migration files against live Supabase migration history.
- Resolve the 0026 source-vs-live migration discrepancy.
- Inventory all FK, RLS, grants, RPCs, constraints and current UI read paths.
- Do not run DDL against live DB.

### Gate 1 — schema contract
- Design forward-only points subledger migration without creating duplicate customer balance sources.
- Model Customer, Merchant and App subjects; immutable transaction header/entries; Available/Pending/Held buckets; idempotency; reversal; approval request and audit references.
- Add stable order/campaign/policy/correlation links.
- Define RLS and server-only command boundaries.
- Keep POINTS separate from VND journal and merchant VND obligations.

### Gate 2 — command engine
- Implement atomic Point Earn and Point Redeem commands with distinct formulas and snapshots.
- Enforce wallet locking, idempotency, no overspend, immutable postings and reversal-only correction.
- Enforce manual-only redeem release, minimum two-day age, risk/hold guard and maker-checker.
- Keep Earn release behavior disabled until its policy is approved.

### Gate 3 — domain integration
- Connect merchant/member/catalog/campaign/order/policy/approval/points/obligations/reconciliation/audit using stable IDs.
- Use one canonical data source per KPI and one documented state machine per domain.
- Implement order/evidence reconciliation only after evidence acceptance rules are approved.

### Gate 4 — Admin and verification
- Build dashboards from canonical queries with loading/empty/error/permission states.
- Add drill-down from every aggregate to source transactions.
- Test permissions with real independent sessions; maker-checker requires two distinct users.
- Test atomicity, duplicate command, payload mismatch, concurrency, reversal, rounding boundaries, stale Pending, held transactions, cross-merchant isolation and timezone boundaries.
- Run integration/E2E against an isolated database before any live migration.

## 9. Explicit blockers / no-go decisions

1. Supabase project currently has no development branches. Creating one may incur cost; no branch has been created.
2. Live migration history shows 24 migrations, while repository/Notion references migration 0026. Reconcile before schema changes.
3. No second checker account is available for independent maker-checker tests.
4. Preview SSO currently blocks full browser E2E.
5. Vercel Preview daily deployment quota has previously been exceeded; do not trigger repeated deployments until quota/build state is checked.
6. Point Earn rounding, eligible base, cap and release conditions remain open.
7. Point Redeem partial release/refund/reversal and detailed risk rules remain open.
8. Real-money transaction evidence source/acceptance rules remain open.
9. Merchant settlement cadence, credit limits, marketing budget source, COA and legal/accounting treatment remain open.
10. No production/main change, live DDL, live posting, custody, payment execution or payout is authorized.

## 10. Definition of connected

A module is not considered integrated merely because it links to another page or displays a count. It is integrated only when:

- its canonical entity and stable foreign keys exist;
- the command path validates authorization and scope server-side;
- the write is atomic and idempotent;
- the immutable source transaction and audit event are recorded;
- downstream projections are derived from that source, not independently editable totals;
- reconciliation can trace and explain the resulting amount;
- permissions, concurrency, reversal and failure paths pass tests;
- the Admin UI drills through to the exact source records.

**Current status:** This contract is documented for implementation. Existing live data is effectively empty outside identity/merchant seed records; operational workflows are not yet proven. No claim of end-to-end integration is made.
