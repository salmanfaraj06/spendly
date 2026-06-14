# 07 — Goals (monthly targets + annual rollup)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — Goal model; create goal via sheet; current-cycle list with progress; annual rollup by calendar year; tap a goal to update saved amount or mark Achieved/Missed.

## What to build

The Goals tab. The user creates monthly savings/investment goals with a name and target amount. Progress is measured against the user's net balance change within the Finance Cycle (no dedicated pot). The current cycle's goals show with progress indicators. An annual rollup view aggregates goal performance across all cycles in the year. Goals can be marked achieved or missed.

## Acceptance criteria

- [ ] `Goal` model: id, user_id, cycle_id, name, target_amount_lkr, achieved_amount_lkr, status (ACTIVE | ACHIEVED | MISSED)
- [ ] Create a monthly goal (name, target amount LKR)
- [ ] Progress tracked vs net balance change within the cycle
- [ ] Current-cycle goals list with progress indicators
- [ ] Annual rollup view across all cycles in the year
- [ ] Mark goal achieved or missed
- [ ] All amounts display as `LKR X,XXX.XX`

## Blocked by

- 05 — Transactions end-to-end
