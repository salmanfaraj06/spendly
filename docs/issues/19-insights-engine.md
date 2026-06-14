# 19 — InsightsEngine (pure)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
Pure module computing the 6 structured facts from cycle totals, spend-by-category, budget report, and previous-cycle data: budget pacing (time-vs-spend), top category mover, biggest expense, cycle-over-cycle change, over/near-budget count, net savings signal.

## Acceptance criteria
- [ ] 6 facts computed correctly from representative inputs
- [ ] Edge cases: no previous cycle, zero budget, negative net, empty data
- [ ] Pure (no I/O, no AI); unit-tested (Vitest)

## Blocked by
None — can start immediately.
