# 20 — Smart Insights (AI phrasing)

**Type:** HITL
**Triage:** ready-for-agent
**Status:** ✅ DONE — InsightsPhraser (OpenAI + deterministic fallback, ADR 0002), per-cycle cache + manual refresh, Home section. Works without OPENAI_API_KEY.

## What to build
InsightsPhraser: pass InsightsEngine facts to OpenAI for friendly phrasing, with a deterministic built-in template fallback when `OPENAI_API_KEY` is missing or the call fails (ADR 0002). Cache prose per cycle, manual refresh. Home insights section. (HITL: needs OPENAI_API_KEY.)

## Acceptance criteria
- [x] InsightsPhraser calls OpenAI to phrase facts; never computes numbers (ADR 0002)
- [x] Deterministic fallback template when key absent or call fails
- [x] Insight prose cached per Finance Cycle; manual refresh
- [x] Home insights section renders prose as plain text
- [x] Fallback path unit-tested

## Blocked by
- 19 — InsightsEngine
