import type { Facts } from "./insights-engine";
import { lkr } from "./format";

/**
 * Turn computed Facts into short sentences using a deterministic built-in
 * template. This is the fallback the app always has — see ADR 0002: the model
 * never computes numbers, only rephrases these verified facts.
 */
export function phraseFactsFallback(facts: Facts): string[] {
  const lines: string[] = [];

  switch (facts.pacing.status) {
    case "ahead":
      lines.push(`You're pacing comfortably — ${facts.pacing.spentPct}% of budget used with ${facts.pacing.elapsedPct}% of the cycle gone.`);
      break;
    case "behind":
      lines.push(`Watch your pace — you've used ${facts.pacing.spentPct}% of your budget with only ${facts.pacing.elapsedPct}% of the cycle elapsed.`);
      break;
    case "on-track":
      lines.push(`You're on track — spending is keeping pace with the cycle at ${facts.pacing.spentPct}% used.`);
      break;
    case "no-budget":
      lines.push(`No budgets set yet — add some to track your pacing.`);
      break;
  }

  if (facts.topMover) {
    lines.push(`${facts.topMover.name} is your fastest-growing category, up ${facts.topMover.deltaPct}% from last cycle.`);
  }

  if (facts.spendChangePct !== null) {
    const dir = facts.spendChangePct >= 0 ? "more" : "less";
    lines.push(`You've spent ${Math.abs(facts.spendChangePct)}% ${dir} than last cycle.`);
  }

  if (facts.biggestExpense) {
    lines.push(`Your biggest expense was ${facts.biggestExpense.label} at ${lkr(facts.biggestExpense.amount)}.`);
  }

  if (facts.budgetWarnings.over > 0) {
    lines.push(`${facts.budgetWarnings.over} categor${facts.budgetWarnings.over === 1 ? "y is" : "ies are"} over budget.`);
  } else if (facts.budgetWarnings.near > 0) {
    lines.push(`${facts.budgetWarnings.near} categor${facts.budgetWarnings.near === 1 ? "y is" : "ies are"} close to the limit.`);
  }

  lines.push(
    facts.net.positive
      ? `Net positive so far: you're up ${lkr(facts.net.amount)} this cycle.`
      : `You're running a deficit of ${lkr(Math.abs(facts.net.amount))} this cycle.`,
  );

  return lines;
}

/**
 * Build the prompt facts payload for the language model. Facts are passed as
 * explicit values; the model is instructed to phrase, never to compute.
 */
export function buildPhrasingPrompt(facts: Facts): {
  system: string;
  user: string;
} {
  return {
    system:
      "You are a concise personal-finance copywriter. Rewrite the provided FACTS as 3-5 short, friendly insight sentences. " +
      "Use ONLY the numbers given. Never invent, recompute, or alter any figure. Do not add facts. Currency is LKR. Return one sentence per line.",
    user: `FACTS (JSON):\n${JSON.stringify(facts)}`,
  };
}

/**
 * Phrase facts via OpenAI when a key is present; otherwise (or on any error)
 * fall back to the deterministic template. Insights degrade in tone, never in
 * correctness or availability.
 */
export async function phraseFacts(facts: Facts): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return phraseFactsFallback(facts);

  try {
    const { system, user } = buildPhrasingPrompt(facts);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return phraseFactsFallback(facts);
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) return phraseFactsFallback(facts);
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);
    return lines.length ? lines : phraseFactsFallback(facts);
  } catch {
    return phraseFactsFallback(facts);
  }
}
