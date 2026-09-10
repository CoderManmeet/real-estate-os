/**
 * V2.2 deal lifecycle (deterministic).
 *
 * Stage order: BOOKING -> AGREEMENT -> (LOAN) -> REGISTRATION -> COMPLETED.
 * CANCELLED is reachable from any non-terminal stage. LOAN is optional (cash
 * deals skip straight to REGISTRATION). Transitions are validated, not free-form.
 */
export const DEAL_STAGES = [
  'BOOKING',
  'AGREEMENT',
  'LOAN',
  'REGISTRATION',
  'COMPLETED',
  'CANCELLED',
] as const;

export type DealStageValue = (typeof DEAL_STAGES)[number];

/** Allowed forward transitions. Terminal stages (COMPLETED, CANCELLED) have none. */
export const ALLOWED_DEAL_TRANSITIONS: Record<DealStageValue, DealStageValue[]> = {
  BOOKING: ['AGREEMENT', 'CANCELLED'],
  AGREEMENT: ['LOAN', 'REGISTRATION', 'CANCELLED'],
  LOAN: ['REGISTRATION', 'CANCELLED'],
  REGISTRATION: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidDealTransition(from: DealStageValue, to: DealStageValue): boolean {
  return ALLOWED_DEAL_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * The lifecycle date column stamped when a deal ENTERS a stage. Used to auto-fill
 * the timestamp when the caller does not pass one explicitly.
 */
export const STAGE_DATE_FIELD: Partial<Record<DealStageValue, string>> = {
  AGREEMENT: 'agreementDate',
  LOAN: 'loanApprovalDate',
  REGISTRATION: 'registrationDate',
  COMPLETED: 'completedDate',
  CANCELLED: 'cancelledAt',
};