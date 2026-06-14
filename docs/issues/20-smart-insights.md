# 20 — Smart Insights (AI phrasing)

**Type:** HITL
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
InsightsPhraser: pass InsightsEngine facts to OpenAI for friendly phrasing, with a deterministic built-in template fallback when `OPENAI_API_KEY` is missing or the call fails (ADR 0002). Cache prose per cycle, manual refresh. Home insights section. (HITL: needs OPENAI_API_KEY.)

## Acceptance criteria
- [ ] InsightsPhraser calls OpenAI to phrase facts; never computes numbers (ADR 0002)
- [ ] Deterministic fallback template when key absent or call fails
- [ ] Insight prose cached per Finance Cycle; manual refresh
- [ ] Home insights section renders prose as plain text
- [ ] Fallback path unit-tested

## Blocked by
- 19 — InsightsEngine
