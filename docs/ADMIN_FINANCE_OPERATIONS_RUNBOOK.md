# Xoài Go — Admin and Finance Operations Runbook

Status: Preview implementation guide; not production authorization.

## Access
- Admin Preview is protected by Vercel SSO and then Supabase Auth.
- Only active profiles with assigned platform roles may access Admin routes.
- Role grants are persisted in `user_role_grants`; browser role selectors are not an authorization source.
- The initial Platform Owner account is the only known administrator at this stage. Do not treat one-user tests as maker-checker acceptance.

## Governance workflow
1. Create a policy set with a unique code and a descriptive name.
2. Save a policy version draft using a JSON object.
3. Submit a policy proposal with a mandatory reason.
4. A different authorized reviewer reviews it and records a reason.
5. Approval currently records a decision only. It does not update the policy version status or activate the configuration.
6. Marketing budget proposals follow the same maker-checker queue but require the budget reviewer permission.

## Merchant/member operations
- Merchant creation creates a draft record and audit event.
- Merchant and member directories are currently read-only except for the merchant draft creation command.
- No automated merchant approval, KYC verification, member suspension or role provisioning is implied.

## Ledger and reconciliation
- Ledger and reconciliation routes are read-only.
- No client-side insert/update/delete grants exist for ledger records.
- Posted journal lines are immutable; database deferred constraints require at least two lines and equal debit/credit totals before posting.
- Do not create accounts or post entries until the chart of accounts, event recognition, merchant obligations, fee/tax treatment and reversal policy are approved.
- Reconciliation currently has no external bank/payment connector or import pipeline.

## Incident and security notes
- Security Advisor reports leaked password protection disabled. This remains an open hardening item.
- Health Advisor has no current lints.
- Preview deployments are SSO-protected. Do not disable SSO to simplify testing.
- Never paste secrets, service-role keys, access tokens or raw environment values into source, issues or Notion.

## Release checklist
- [ ] Independent maker and checker accounts created and verified.
- [ ] Runtime tests completed for each permission family.
- [ ] Database migration and rollback procedure reviewed.
- [ ] Backup/restore drill completed.
- [ ] Security settings and MFA reviewed and approved.
- [ ] Business policy and finance/legal rules approved.
- [ ] Preview accepted by product owner.
- [ ] Production release separately authorized with rollback plan.


## Merchant catalog and campaign drafts
- `/admin/catalog` lists merchant products and locations visible under RLS. Authorized users can create a product in draft state and add a merchant location through audited database commands.
- Product prices are stored as integer VND amounts. Creating a product does not publish it or make it orderable.
- `/admin/campaigns` lists campaigns and allows scoped users to create campaign drafts. Campaign creation does not activate the campaign or allocate a marketing budget.
- Budget requests are submitted separately through `/admin/budgets` and must be reviewed by a different user with the budget review permission.
- Merchant onboarding status transitions and product activation remain intentionally unavailable until review criteria and business rules are approved.


## Additional admin modules
- `/admin/orders` is a read-only order monitor. It does not accept, cancel, collect payment or refund.
- `/admin/access` is a read-only RBAC and account inventory, guarded by `access.manage`. Role grant/revoke is intentionally not exposed until an approved access-change maker-checker command and a second administrator account are available.
- `/admin/catalog` supports scoped draft product creation and merchant location creation. Products remain draft; no automatic publication.
- `/admin/campaigns` supports scoped campaign draft creation only.
- The dashboard shows live counts for merchants, pending approvals, members, active campaigns, orders in process and merchant onboarding items. It intentionally does not show fabricated revenue or wallet balances.

## Idempotency
- Policy and budget approval submission RPCs require a caller-supplied idempotency key.
- Repeating the same command with the same key and same payload returns the original request ID. Reusing the key with a different payload is rejected.
- The idempotency record and approval request are written in the same database transaction.
- The idempotency table is private to privileged database commands and has no client read/write grants.
