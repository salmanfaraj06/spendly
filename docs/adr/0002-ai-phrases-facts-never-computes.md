# 2. AI phrases facts; it never computes them

Date: 2026-06-15

## Status

Accepted

## Context

We want plain-language Smart Insights on the dashboard ("You're pacing 12% under
budget", "Dining is your fastest-growing category"). An external language model
(OpenAI) is the natural tool for friendly prose.

The tempting approach is to hand the model the user's raw financial data and ask
it to both analyse and narrate. But this is a personal finance app: every number
shown must be correct and trustworthy. Language models can transpose digits,
miscompute percentages, or invent comparisons that look plausible. A wrong
"you saved LKR 47,000 this cycle" silently erodes trust in the entire ledger.

## Decision

The number boundary is hard: **all figures are computed deterministically by our
own code (the `InsightsEngine`); the language model only rewrites already-verified
facts into sentences.**

Concretely:
- `InsightsEngine` produces a fixed set of structured **facts** from data we
  already query (cycle totals, spend-by-category, budget report, previous cycle):
  budget pacing, top category mover, biggest expense, cycle-over-cycle change,
  over/near-budget count, net savings signal.
- Those facts — as numbers and labels — are passed to OpenAI with an instruction
  to phrase them, not to calculate or add anything.
- Insights are cached per Finance Cycle and regenerated only on demand.
- If the API key is absent or the call fails, the app falls back to showing the
  facts in a simple built-in template. Insights degrade in *tone*, never in
  *correctness or availability*.

## Consequences

- Numbers are always correct and free to compute; the paid call is small and
  optional.
- The feature works offline / without a key, just in plainer language.
- The `InsightsEngine` is pure and unit-testable; AI phrasing is a thin,
  swappable layer (a different model or provider changes nothing about the facts).
- Prompts must pass facts as explicit values and forbid the model from
  introducing new figures; phrasing output should be treated as untrusted text
  (rendered as plain text, never used to drive logic).
- Richer "analysis" that genuinely needs the model to reason over raw data is out
  of scope under this ADR — adding it later means revisiting this boundary
  deliberately, not drifting across it.
