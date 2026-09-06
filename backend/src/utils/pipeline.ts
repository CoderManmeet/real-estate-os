/**
 * V2.1 Lead pipeline (single source of truth).
 *
 * `Lead.stage` drives the pipeline. `Client.status` is a ONE-DIRECTIONAL derived
 * mirror of it (see `resolveClientStatusFromStages`). Kanban/board/funnel run on
 * `Lead.stage`; nothing derives the pipeline from `Client.status`.
 *
 * WON is intentionally NOT part of the canonical stage set. It is retained as a
 * DORMANT value in the Prisma/Postgres enum because Postgres has no
 * `ALTER TYPE ... DROP VALUE`; removing it would force a destructive recreation of
 * the `LeadStage` type and the `leads.stage` column, which also risks the raw-SQL
 * Python AI service. New writes never produce WON; any residual WON rows are folded
 * into CLOSED at read time (see `displayStage`) until the backfill migration runs,
 * so analytics/board are correct whether or not the backfill has been applied yet.
 */

/** The 10 canonical V2.1 stages, in pipeline order. Board/funnel order comes from here. */
export const LEAD_STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKING',
  'CLOSED',
  'LOST',
] as const;

export type CanonicalLeadStage = (typeof LEAD_STAGES)[number];

/** Any value that may exist on a stored row, including the dormant WON. */
export type StoredLeadStage = CanonicalLeadStage | 'WON';

export type DerivedClientStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST';

/**
 * Progress rank for the "furthest-progress" derivation. LOST = 0 (terminal-lost,
 * handled explicitly). WON shares CLOSED's rank so residual WON rows behave as wins.
 */
const STAGE_PROGRESS_RANK: Record<StoredLeadStage, number> = {
  LOST: 0,
  NEW: 1,
  CONTACTED: 2,
  QUALIFIED: 3,
  PROPERTIES_SHARED: 4,
  INTERESTED: 5,
  SITE_VISIT: 6,
  NEGOTIATION: 7,
  BOOKING: 8,
  CLOSED: 9,
  WON: 9,
};

/** Map a single lead stage to the Client.status bucket it mirrors. */
export function stageToClientStatus(stage: StoredLeadStage): DerivedClientStatus {
  switch (stage) {
    case 'NEW':
      return 'NEW';
    case 'CONTACTED':
      return 'CONTACTED';
    case 'QUALIFIED':
    case 'PROPERTIES_SHARED':
    case 'INTERESTED':
      return 'QUALIFIED';
    case 'SITE_VISIT':
    case 'NEGOTIATION':
    case 'BOOKING':
      return 'NEGOTIATION';
    case 'CLOSED':
    case 'WON':
      return 'CONVERTED';
    case 'LOST':
      return 'LOST';
  }
}

/** Fold the dormant WON value into CLOSED for display (board/funnel). */
export function displayStage(stage: StoredLeadStage): CanonicalLeadStage {
  return stage === 'WON' ? 'CLOSED' : stage;
}

/**
 * Derive a client's mirrored status from ALL of its leads' stages.
 *
 * Rule: the FURTHEST-PROGRESS non-LOST lead wins. If every lead is LOST, the status
 * is LOST. If the client has no leads, returns `null` and the caller leaves the
 * existing status untouched (we never reset an established status back to NEW).
 */
export function resolveClientStatusFromStages(
  stages: StoredLeadStage[]
): DerivedClientStatus | null {
  if (stages.length === 0) return null;

  const nonLost = stages.filter((s) => s !== 'LOST');
  if (nonLost.length === 0) return 'LOST';

  let best: StoredLeadStage = nonLost[0];
  for (const s of nonLost) {
    if (STAGE_PROGRESS_RANK[s] > STAGE_PROGRESS_RANK[best]) best = s;
  }
  return stageToClientStatus(best);
}