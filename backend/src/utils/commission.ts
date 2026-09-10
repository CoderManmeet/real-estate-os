/**
 * V2.2 commission split (deterministic).
 *
 * The brokerage's gross commission on a deal is split between the owning agent
 * and the company. There is no per-agent commission rate stored on User, so the
 * agent's share percentage is supplied per-deal and defaults to the named
 * constant below. Change it here to shift the org-wide default in one place.
 */
export const DEFAULT_AGENT_COMMISSION_PERCENT = 30;

/** Round to 2 decimals so currency math stays stable and deterministic. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface CommissionSplit {
  grossAmount: number;
  agentPercent: number;
  agentAmount: number;
  companyAmount: number;
}

/**
 * Deterministically split a gross commission amount. agentAmount is
 * gross * agentPercent / 100 (2dp); companyAmount is the remainder, so the two
 * always sum back to gross exactly.
 */
export function computeCommissionSplit(
  grossAmount: number,
  agentPercent: number = DEFAULT_AGENT_COMMISSION_PERCENT
): CommissionSplit {
  const agentAmount = round2((grossAmount * agentPercent) / 100);
  const companyAmount = round2(grossAmount - agentAmount);
  return { grossAmount: round2(grossAmount), agentPercent, agentAmount, companyAmount };
}

/** Gross commission as a percentage of the deal value. */
export function grossFromPercent(dealValue: number, grossPercent: number): number {
  return round2((dealValue * grossPercent) / 100);
}