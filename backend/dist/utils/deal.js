"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGE_DATE_FIELD = exports.ALLOWED_DEAL_TRANSITIONS = exports.DEAL_STAGES = void 0;
exports.isValidDealTransition = isValidDealTransition;
/**
 * V2.2 deal lifecycle (deterministic).
 *
 * Stage order: BOOKING -> AGREEMENT -> (LOAN) -> REGISTRATION -> COMPLETED.
 * CANCELLED is reachable from any non-terminal stage. LOAN is optional (cash
 * deals skip straight to REGISTRATION). Transitions are validated, not free-form.
 */
exports.DEAL_STAGES = [
    'BOOKING',
    'AGREEMENT',
    'LOAN',
    'REGISTRATION',
    'COMPLETED',
    'CANCELLED',
];
/** Allowed forward transitions. Terminal stages (COMPLETED, CANCELLED) have none. */
exports.ALLOWED_DEAL_TRANSITIONS = {
    BOOKING: ['AGREEMENT', 'CANCELLED'],
    AGREEMENT: ['LOAN', 'REGISTRATION', 'CANCELLED'],
    LOAN: ['REGISTRATION', 'CANCELLED'],
    REGISTRATION: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
function isValidDealTransition(from, to) {
    return exports.ALLOWED_DEAL_TRANSITIONS[from]?.includes(to) ?? false;
}
/**
 * The lifecycle date column stamped when a deal ENTERS a stage. Used to auto-fill
 * the timestamp when the caller does not pass one explicitly.
 */
exports.STAGE_DATE_FIELD = {
    AGREEMENT: 'agreementDate',
    LOAN: 'loanApprovalDate',
    REGISTRATION: 'registrationDate',
    COMPLETED: 'completedDate',
    CANCELLED: 'cancelledAt',
};
