# XOÀI GO — Phase 2: POINTS Subledger Schema

**Status:** Schema source drafted on feature branch; isolated database verification pending  
**Date:** 2026-11-11  
**Working branch:** `feature/xoai-phase2-points-subledger-20261111`  
**Parent:** Phase 1 audit commit `3f2198593de8ba92581b5c05c07d10666321af9d`  
**Product source:** Notion Product & Admin Control Center, sections 23–25.

> This phase adds database structure and integrity guards only. It does not implement or enable Earn/Redeem posting, wallet funding, release execution, payouts, automatic Pending release, or POINTS-to-VND conversion.

## 1. Scope delivered

Migration `0027_points_subledger_schema.sql` introduces:

- `points_wallets`: one canonical wallet per Customer, Merchant or App subject. `program_code` is descriptive metadata and does not create a second wallet/balance partition.
- `points_transactions`: immutable posted transaction header, correlation ID, idempotency key, request hash, order/merchant/customer references and policy snapshot.
- `points_ledger_entries`: balanced debit/credit POINTS entries, each assigned to Available, Pending or Held bucket.
- `points_release_requests` and request lines: manual review scope for posted Redeem allocations.
- `points_release_decisions`: append-only decision history.

The VND journal remains unchanged. POINTS are integer units in a separate subledger; no `POINTS` currency is inserted into `journal_transactions.currency CHAR(3)`.

## 2. Product rules preserved

### Point Earn

- Merchant funds 100% of total promotional POINTS.
- Customer allocation is 70%; App allocation is 30%.
- Both allocations begin in Pending under the current Earn reconciliation specification.
- The merchant debit must equal Customer Pending + App Pending.
- Eligible base, campaign cap, rounding and Earn release conditions remain OPEN; the schema does not calculate or infer them.

### Point Redeem

- Customer is debited the full POINTS amount used.
- The App share is the effective discount rate actually applied in the active sales session/shift at payment time; the Merchant share is the remainder. The merchant's default discount is only a baseline configuration and must not override the active session/shift rate.
- Example: merchant default 10%, active session/shift discount 20%, customer uses 100,000 POINTS → App Pending 20,000 POINTS and Merchant Pending 80,000 POINTS.
- A posted Redeem snapshot must include `redeem.effective_discount_rate` as a decimal fraction (0.20 = 20%), `redeem.discount_context_type` (`session` or `shift`) and the non-empty `redeem.discount_context_id`. Later configuration/campaign changes must not recalculate an existing transaction.
- Both allocations begin Pending.
- A release request records the eligible time as **posted_at + 2 days**. Approval before that time is rejected.
- Passing the two-day minimum never releases a balance by itself. The schema stores manual review requests and checker decisions only; a later command must create an explicit ledger movement.
- The request maker cannot approve/reject/hold their own request.
- Flagged items can remain Held/under review; no scheduler or webhook can release them.

### Shared controls

- Pending is a bucket on a wallet entry, not a fourth wallet.
- A posted transaction must contain at least two entries and debit total must equal credit total.
- Posted transaction headers and ledger entries are immutable; corrections use new linked reversal/adjustment transactions.
- A release request line must reference a Pending credit from a posted Redeem transaction and cannot reserve more than the originating allocation.
- POINTS and VND remain separate in all tables and reports.
- The migration enforces the effective session/shift discount snapshot for every posted Redeem transaction; it does not infer the rate from merchant defaults.

## 3. Existing schema compatibility

The old `points_accounts`, `points_entries` and `points_holds` tables remain untouched as legacy member-only structures. They do not become a second active balance source for the new model.

Migration 0027 deliberately fails closed if any of those three legacy tables contain rows. It also enforces one canonical wallet per Customer, Merchant and App subject in the current Xoai Go program. The old signed `points_delta` entries do not record Available/Pending/Held buckets, so an automatic conversion would invent bucket history. If legacy rows appear before rollout, stop and define an explicit, reviewed backfill/reconciliation plan before applying 0027.

No legacy table is dropped or rewritten.

## 4. Migration ordering and environment blocker

Repository migration files include 0025, 0026 and the new 0027. The latest read-only Supabase migration-history query for project `Xoaigovn` returned 24 applied migrations and ended at 0024.

Therefore:

1. 0025 is present in source but not confirmed applied to live.
2. 0026 is present in source but not confirmed applied to live.
3. 0027 is a forward migration after both source migrations.
4. Do not apply 0027 to live, and do not mark earlier migrations applied by hand.
5. Reconcile and test the full sequence 0025 → 0026 → 0027 in an isolated database first. The owner has not approved creation of a cost-bearing Supabase development branch.

The migration source is committed for review only. No Supabase DDL was run.

## 5. Current session/shift source gap

A read-only audit of the current live `public` schema found no session or shift table. `commerce_orders` currently has `campaign_id` and `discount_amount`, but no session/shift reference or effective discount-rate field. `marketing_campaigns` has campaign status and start/end timestamps, but no discount-rate field. Therefore the existing database cannot yet resolve the actual active session/shift discount at payment time.

Migration 0027 validates that a posted Redeem stores the resolved rate and opaque session/shift context reference in its immutable policy snapshot. It deliberately does not invent a foreign key to a session/shift table that does not exist. Before implementing the Redeem command, the product/database must define the canonical session/shift entity, how the active discount is determined, and how the transaction captures that exact context atomically.

## 5. Security boundary

- All six new tables have RLS enabled.
- Authenticated access is SELECT-only; anon/authenticated INSERT, UPDATE and DELETE grants are revoked.
- Customer reads are scoped to their own wallet; merchant workspace reads are scoped through the existing merchant permission helper; platform finance/points visibility uses the existing `points.read` permission.
- Writes are reserved for future server-side command implementations. No client-side write path is introduced.
- Append-only protections cover posted transaction history and release decisions, including TRUNCATE guards for the new append-only tables.

The current database schema still needs isolated runtime testing for RLS and trigger behavior. Static policy definitions are not proof that every role/session works correctly.

## 6. Explicitly not implemented

- Earn command and approved campaign eligibility calculation.
- Redeem command and runtime resolution of the active session/shift discount at payment time (the schema only validates that the resolved value and context are snapshotted).
- Wallet funding/top-up and insufficient Merchant Wallet handling.
- Available balance projections and concurrency-safe debit execution.
- Pending release ledger movement.
- Hold/flag command and risk engine.
- Reversal/adjustment command execution.
- Reconciliation engine and order/POS/QR evidence matching.
- Admin UI changes.
- Permission catalog additions for command execution/release.
- Legal, accounting or bank-backing model.

## 7. Open product decisions preserved

No schema default is intended to settle these open decisions:

- Earn eligible transaction base, product eligibility and discount treatment.
- Earn campaign maximum and store cap.
- POINTS rounding/remainder allocation.
- Earn Pending duration and release criteria.
- Redeem release granularity and partial-release policy.
- Risk signals and mandatory hold criteria.
- Partial refund/cancel behavior for Earn and Redeem.
- Merchant POINTS wallet funding source and insufficient-balance treatment.
- POINTS expiry/dormant account policy.
- Evidence sources and matching keys.
- Legal/accounting treatment and backing coverage rules.

The release request line model can describe one or more recipient allocations, but it does not authorize a partial-release business policy.

## 8. Verification plan

The structural SQL contract test is at `supabase/tests/0027_points_subledger_schema_test.sql`. It is intended to run only after 0025–0027 are applied to a disposable database.

Required isolated tests before any live decision:

1. Migration sequence 0025 → 0026 → 0027 applies cleanly.
2. Migration 0027 aborts if legacy points rows exist.
3. One wallet per subject/program uniqueness and owner-shape constraints.
4. Draft transaction can receive entries; posting rejects fewer than two entries or unbalanced debit/credit.
5. Posted headers/entries cannot be updated, deleted or truncated.
6. Idempotency and single-reversal uniqueness hold under concurrent requests.
7. A posted Redeem without an effective discount rate and session/shift reference is rejected; a 20% session/shift rate is preserved as 0.20 even if the merchant default is 10%.
8. Release request requires a posted Redeem transaction.
9. Release cannot be approved before posted_at + 2 days.
10. Request maker cannot be checker.
11. Release lines cannot exceed the Pending Redeem credit allocation, including concurrent requests.
12. RLS matrix for Customer, Merchant Owner, Finance Operator, Platform Owner and anon.
13. No authenticated client write grants exist.

No test is marked passed until it has run in an isolated database with captured output. Phase 2 is therefore **source drafted / runtime verification blocked**, not Done/Verified.
