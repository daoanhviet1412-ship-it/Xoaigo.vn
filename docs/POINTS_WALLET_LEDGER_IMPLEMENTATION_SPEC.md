# XOÀI GO — Points, Wallet, Ledger & Reconciliation Implementation Spec

Status: Product rules confirmed; technical design baseline for Preview implementation  
Date: 2026-11-10  
Repository: daoanhviet1412-ship-it/Xoaigo.vn  
Branch: feature/xoai-core-platform  
Source of truth: Notion — XOÀI GO Product & Admin Control Center, sections 23–25

## 1. Scope and safety boundary

Build the points and finance-control foundation for:
- point earning (Point Earn);
- point redemption (Point Redeem);
- customer, merchant and Xoài point wallets;
- pending/held/release approval;
- immutable transaction history;
- wallet and allocation reconciliation;
- Admin review queues and audit.

This is a points-ledger and internal obligation-control system, not a cash wallet or payment processor. Customers pay merchants directly. POINTS are not VND and must never be added to VND balances, revenue or bank balances. Do not introduce custody, transfer, payout or payment execution.

Implementation is Preview/feature-branch only. Do not change main/Production. Do not apply migrations to live Supabase or write live business data without separate explicit authorization.

## 2. Confirmed product rules

### 2.1 Point Earn — promotional points issued from merchant-funded promotion

- Merchant funds 100% of the promotional points.
- The merchant's approved campaign/store promotion rate determines total points, subject to the approved eligible transaction base and cap.
- Allocate total promotional points: 70% to Customer Wallet and 30% to Xoài App Wallet.
- The 70/30 split is fixed; merchants cannot configure it.
- Use the policy/campaign snapshot effective at transaction time.
- Point Earn Pending timing/release remains governed by the approved Point Earn policy. Do not infer a new duration or manual approval rule for Point Earn from the Point Redeem rule.

Example: 20,000 POINTS funded by a merchant -> Customer Pending 14,000; App Pending 6,000; Merchant debit 20,000.

### 2.2 Point Redeem — customer spends points at a merchant

- Debit the customer's wallet by the full number of POINTS redeemed.
- Credit the merchant's point wallet with the merchant share: 90% by default, or the merchant-specific rate configured and approved for that merchant.
- Credit the Xoài App point wallet with the remainder: 100% minus the merchant rate.
- Both recipient allocations enter Pending for at least 2 days.
- Reaching 2 days does NOT automatically release either allocation.
- Release requires an explicit manual approval command from an authorized reviewer after risk/account review.
- Suspicious transactions/accounts remain Pending/Held until investigated and resolved.
- Persist the merchant rate, policy version and effective configuration in an immutable transaction snapshot.
- Total merchant allocation + App allocation must equal the customer's full redeemed points.

Example: 100,000 POINTS redeemed at 90% merchant share -> Merchant Pending 90,000; App Pending 10,000. At a configured merchant share of 85% -> Merchant Pending 85,000; App Pending 15,000.

### 2.3 Separation of the two policies

- Point Earn Policy = merchant-funded 70% Customer / 30% App.
- Point Redeem Policy = 90% Merchant by default or approved merchant-specific rate / remainder App.
- Never reuse one percentage field or one calculation function for both policies.
- The old 7% / 3% / 10% model is canceled and must not appear in active calculations, UI, reports or tests.

### 2.4 Wallet and pending semantics

- Wallets are separate by subject: customer, merchant and platform/App.
- POINTS balances are separate from VND accounting.
- Balance buckets: Available, Pending and Held.
- Pending overview is an aggregate/reporting view, not another wallet and not another ledger posting.
- No negative available balance unless a separately approved policy explicitly permits it; default is reject and alert.
- Held means risk or dispute restriction. A held transaction cannot be released by the normal pending approval action until the hold is resolved.

## 3. Ledger invariants

1. Every point transaction has one immutable transaction header and correlated entries.
2. For every transaction, sum of point credits equals sum of point debits.
3. A redeem transaction has one customer debit and two recipient credits (merchant and App), with pending bucket allocation for both credits.
4. An earn transaction has one merchant debit and two pending credits (customer and App) in 70/30 proportions.
5. Use integer POINTS. Rounding policy is still open; do not silently choose floor/ceil/round or hard-code a remainder rule.
6. Idempotency key is unique per command scope; same key + same payload returns original result; same key + different payload is rejected.
7. All entries for one command commit atomically. No partial transaction is visible.
8. Concurrent commands must lock the affected wallet/account rows in deterministic order and prevent overspending/double-spend.
9. Posted history is append-only. Corrections use linked reversal/adjustment transactions; never edit/delete original entries.
10. Every command records actor/system, source order, merchant, customer, campaign/policy snapshot, correlation ID and audit outcome.
11. POINTS never enter the VND journal as a numeric currency amount. If financial/accounting recognition is required, use a separately approved mapping and do not equate points with cash.

## 4. Pending release and maker-checker

Point Redeem Pending release rules:
- Minimum age: 2 days from the relevant transaction's committed timestamp.
- Release is manual only; no scheduled job, webhook or timer may release it automatically.
- The reviewer must have the relevant release permission and cannot be the requester/creator.
- Review screen must show customer and merchant history, transaction amount, policy snapshot, order reference, account flags and available risk signals.
- Support outcomes: approve release, keep held/pending for investigation, reject/void via linked reversal where appropriate.
- Store reviewer, timestamp, reason, decision and evidence/reference. Audit trail is immutable.
- If either recipient allocation is held, release must be blocked for that allocation; system must not silently release the other side if it would break the transaction's approved settlement semantics. The exact partial-release policy remains to be approved.

## 5. Reconciliation requirements

### 5.1 Earn reconciliation
For each earn transaction:
Merchant debit = Customer Pending credit + App Pending credit.
Expected variance = 0, subject to a rounding rule that must be approved before posting is enabled.

### 5.2 Redeem reconciliation
For each redeem transaction:
Customer debit = Merchant Pending credit + App Pending credit.
Expected variance = 0.

### 5.3 Wallet reconciliation
For each wallet and bucket:
Closing = Opening + credits - debits.
Compare wallet projection with sum of immutable ledger entries. Any variance creates an exception; never auto-correct.

### 5.4 Order and external evidence reconciliation
Compare order/receipt/POS/QR evidence against the point transaction and its policy snapshot. Merchant self-report alone is not automatically sufficient proof. Source-of-truth and evidence acceptance rules remain open for real-money transaction verification.

### 5.5 Exceptions
Mismatch, duplicate, stale pending, suspicious activity, insufficient merchant points, reversal and partial refund must enter an exception/review queue with owner, reason, evidence and resolution audit. No silent balance mutation.

## 6. Existing implementation baseline verified on 2026-11-10

Working branch: feature/xoai-core-platform  
Latest inspected branch HEAD: 49d08955fa9eaf004064f82ace2d7f3d2f7481ef  
Latest inspected Preview: READY, commit 49d08955fa9eaf004064f82ace2d7f3d2f7481ef.

Existing database migrations on the branch:
- 0018_ledger_and_reconciliation_foundation.sql: ledger_accounts, journal_transactions, journal_lines, idempotency_records, reconciliation_batches/items; balanced journal constraints and read-only grants.
- 0020_points_obligations_settlement_foundation.sql: points_accounts, points_entries, points_holds, merchant_obligations, settlement_batches/lines; points entries are append-only; points accounts currently model member accounts only.
- 0026_audit_integrity_guards.sql: additional journal, audit, approval and settlement integrity guards.

Existing Admin:
- /admin/points: read-only member points accounts; no earn/redeem commands.
- /admin/ledger: read-only chart of accounts and journal transactions.
- /admin/reconciliation: read-only reconciliation batches.
- /admin/settlements: read-only merchant obligations and settlement batches.
- No live point wallet balances, no Point Earn/Redeem commands, no manual Point Redeem release workflow, no actual point posting, no reconciliation execution.

Important schema gap:
- Existing points_accounts is member-only and points_entries is a per-member delta record; it does not yet represent merchant and platform point wallets or enforce a cross-wallet double-entry transaction.
- Existing journal_transactions.currency is CHAR(3), intended for conventional currencies; do not force the POINTS asset into that VND-oriented journal.
- The next migration must extend/replace the points-domain model carefully without creating a second customer balance source of truth. Reconcile existing points_accounts/entries/holds and all foreign keys before changing them.
- Existing ledger foundation is a VND/accounting journal foundation, not a completed points ledger or posting engine.

## 7. Proposed implementation architecture

Keep separate but linked ledgers:
1. Points subledger: integer POINTS, wallets by subject, immutable point transaction header/entries, bucket movements, holds, releases and reversals.
2. VND/accounting journal: VND and other approved fiat/accounting currencies only; no implicit point conversion.
3. Reconciliation layer: links point transactions, orders, merchant obligations and independent evidence, while keeping POINTS and VND measures separate.

Recommended domain command boundaries:
- create_point_earn (merchant debit, 70/30 pending credits);
- create_point_redeem (customer debit, merchant-rate pending credit, App remainder pending credit);
- request_point_redeem_release;
- approve_point_redeem_release (maker-checker, age >= 2 days, risk checks);
- hold_point_transaction / resolve_point_hold;
- reverse_point_transaction;
- reconcile_point_transaction / reconcile_wallet;
- create_manual_adjustment (dual approval, reason and evidence).

The database transaction must perform authorization, idempotency reservation, wallet locking, policy snapshot resolution, invariant checks, entry writes, projection update and audit event atomically.

## 8. Admin Control Center requirements

- Points overview: issued, redeemed, available, pending, held; separate Customer, Merchant and App wallet summaries.
- Wallet detail: subject, program, available/pending/held totals, ledger history and linked transactions.
- Point transaction explorer: earn/redeem/refund/reversal/adjustment, source order, merchant/customer, policy snapshot, all entries, status and audit.
- Redeem review queue: pending age, risk flags, customer history, merchant history, manual approve/hold/reject actions subject to permissions.
- Reconciliation center: matched/mismatched transactions, wallet variance, stale pending, missing order/evidence and resolution trail.
- All aggregate cards drill down into underlying transactions.
- Show clear labels: Preview, connected data vs demo data, POINTS vs VND.
- Never display fabricated revenue, cash balance or point-to-VND conversion.

## 9. Permissions and audit

Minimum permission families to design and seed:
- points.read
- points.earn.execute
- points.redeem.execute
- points.redeem.release.request
- points.redeem.release.approve
- points.hold.manage
- points.reverse
- points.adjust.request
- points.adjust.approve
- points.reconcile.read
- points.reconcile.resolve
- wallets.read
- wallets.admin.read

Sensitive actions require maker-checker and explicit server/database authorization. Do not rely on hidden buttons or client-side role selectors.

## 10. Open decisions — do not hard-code

- Point Earn eligible transaction base (before/after discounts, item eligibility, mixed baskets).
- Point Earn campaign cap and merchant maximum rate.
- Rounding/remainder allocation for non-divisible POINTS.
- Point Earn Pending duration and release conditions.
- Whether Point Redeem release is per transaction or per recipient allocation; exact policy for partial release.
- Risk rules/flags and which require mandatory hold.
- Partial refund/cancel rules for both earn and redeem.
- Merchant point-wallet top-up/funding and insufficient-balance treatment.
- Exact point expiry and dormant-account policy.
- Independent evidence sources and reconciliation matching keys.
- Merchant settlement cadence, limits, fees, tax/accounting treatment and chart of accounts.
- Legal/accounting model for point backing and any bank-coverage calculation.
- Whether any App Wallet points can be used for internal campaigns, expiry or other purposes.

## 11. Delivery sequence and acceptance gates

P0 — Product rules and source reconciliation
- Confirm Notion sections 23–25 and mark any contradictions as superseded by section 25.
- Confirm no conflict with current database schema and permissions.
- Exit: product rules and open decisions documented.

P1 — Points subledger schema
- Design and review forward-only migration extending the current member-only points schema.
- Support customer/merchant/platform wallets, immutable transactions/entries, pending/available/held buckets, idempotency, reversal links and release approvals.
- Add RLS, server-only command boundary and audit.
- Exit: migration applies only in isolated test database; integrity/concurrency tests pass.

P2 — Point command engine
- Implement earn/redeem commands with distinct policies and immutable snapshots.
- Add age-gated, manual-only redeem release with maker-checker.
- Exit: atomicity, idempotency, concurrency, no self-approval and no automatic release tests pass.

P3 — Wallet projections and Admin
- Build wallet summaries and drill-down views from the points subledger.
- Add review queue and explicit release controls.
- Exit: projections reconcile to immutable entries; role matrix passes.

P4 — Reconciliation
- Earn/redeem allocation checks, wallet projection checks, order evidence and exception workflow.
- Exit: injected mismatches surface and are never auto-corrected.

P5 — Integration and operational readiness
- Integrate order/QR/POS only after command engine and evidence rules are approved.
- E2E, security, backup/restore, runbook and Preview acceptance.
- Production remains blocked pending separate authorization, legal/provider review and unresolved financial policy decisions.
