import type {
  LeaveLedgerEntry,
  LeaveRequest,
  LoanInstallment,
  PayrollRunStatus,
  TravelExpenseItem,
} from '../types/hcm';

/**
 * FSD Rule 12: Integer Rupiah installment division.
 * Example: Rp10,000,000 / 12 = 11 x Rp833,333 + final Rp833,337 (sum exact).
 */
export function generateLoanInstallments(
  principalAmount: number,
  tenorMonths: number,
  startIsoDate: string
): LoanInstallment[] {
  if (principalAmount <= 0 || tenorMonths <= 0 || !Number.isInteger(tenorMonths)) {
    throw new Error('Principal amount and tenor months must be positive integers.');
  }

  const baseInstallment = Math.floor(principalAmount / tenorMonths);
  const remainder = principalAmount - baseInstallment * tenorMonths;
  const start = new Date(startIsoDate);
  const installments: LoanInstallment[] = [];

  for (let i = 0; i < tenorMonths; i++) {
    const due = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i + 1, 25));
    const amount = i === tenorMonths - 1 ? baseInstallment + remainder : baseInstallment;
    installments.push({
      installmentNumber: i + 1,
      dueDate: due.toISOString().slice(0, 10),
      amount,
      status: 'scheduled',
    });
  }

  return installments;
}

/**
 * FSD Rule 11: Business travel settlement calculation.
 * Excludes items paid directly by the company/vendor.
 * - payable_to_employee = max(actual_approved - advance, 0)
 * - refundable_to_company = max(advance - actual_approved, 0)
 */
export function calculateTravelSettlement(
  cashAdvance: number,
  items: TravelExpenseItem[]
): {
  actualApprovedEmployeePaid: number;
  companyDirectPaid: number;
  payableToEmployee: number;
  refundableToCompany: number;
} {
  const actualApprovedEmployeePaid = items
    .filter((item) => item.approved && item.paidBy === 'employee')
    .reduce((sum, item) => sum + item.amount, 0);

  const companyDirectPaid = items
    .filter((item) => item.paidBy === 'company_direct')
    .reduce((sum, item) => sum + item.amount, 0);

  const payableToEmployee = Math.max(actualApprovedEmployeePaid - cashAdvance, 0);
  const refundableToCompany = Math.max(cashAdvance - actualApprovedEmployeePaid, 0);

  return {
    actualApprovedEmployeePaid,
    companyDirectPaid,
    payableToEmployee,
    refundableToCompany,
  };
}

/**
 * FSD Leave Ledger: Sum of immutable ledger entries gives current balance.
 */
export function calculateLeaveBalance(entries: LeaveLedgerEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.days, 0);
}

/**
 * FSD Leave Validation: Checks balance sufficiency and overlapping active requests.
 */
export function validateLeaveSubmission(params: {
  availableBalance: number;
  requestedDays: number;
  startDate: string;
  endDate: string;
  existingRequests: LeaveRequest[];
  employeeId: string;
}): { valid: boolean; errorKey?: string } {
  const { availableBalance, requestedDays, startDate, endDate, existingRequests, employeeId } =
    params;

  if (!startDate || !endDate || endDate < startDate) {
    return { valid: false, errorKey: 'invalid_date_range' };
  }
  if (requestedDays <= 0) {
    return { valid: false, errorKey: 'invalid_days' };
  }
  if (requestedDays > availableBalance) {
    return { valid: false, errorKey: 'insufficient_balance' };
  }

  const hasOverlap = existingRequests.some(
    (req) =>
      req.employeeId === employeeId &&
      (req.status === 'pending' || req.status === 'approved') &&
      !(endDate < req.startDate || startDate > req.endDate)
  );

  if (hasOverlap) {
    return { valid: false, errorKey: 'overlapping_leave' };
  }

  return { valid: true };
}

/**
 * FSD Payroll State Machine & Maker-Checker Guard.
 * Enforces sequential transitions and forbids self-approval on reviewed/approved stages.
 */
const PAYROLL_TRANSITIONS: Record<PayrollRunStatus, PayrollRunStatus | null> = {
  draft: 'input_locked',
  input_locked: 'calculated',
  calculated: 'reviewed',
  reviewed: 'approved',
  approved: 'payment_prepared',
  payment_prepared: 'reconciled',
  reconciled: null,
};

export function getNextPayrollStatus(current: PayrollRunStatus): PayrollRunStatus | null {
  return PAYROLL_TRANSITIONS[current];
}

export function canTransitionPayrollRun(params: {
  currentStatus: PayrollRunStatus;
  makerName: string;
  actorName: string;
  actorRole: string;
}): { allowed: boolean; nextStatus: PayrollRunStatus | null; reasonKey?: string } {
  const nextStatus = getNextPayrollStatus(params.currentStatus);
  if (!nextStatus) {
    return { allowed: false, nextStatus: null, reasonKey: 'already_reconciled' };
  }

  // Maker-checker rule: maker cannot review or approve their own payroll calculation
  if (
    (nextStatus === 'reviewed' || nextStatus === 'approved') &&
    params.makerName === params.actorName
  ) {
    return { allowed: false, nextStatus, reasonKey: 'self_approval_forbidden' };
  }

  if (nextStatus === 'approved' && params.actorRole !== 'payroll_checker' && params.actorRole !== 'hr_operations') {
    return { allowed: false, nextStatus, reasonKey: 'checker_role_required' };
  }

  return { allowed: true, nextStatus };
}

/**
 * Configurable PPh 21 TER + BPJS Estimator (preview helper; rates are parameterized).
 */
export function calculatePayrollLinePreview(params: {
  baseSalary: number;
  allowances: number;
  overtimeApprovedPay: number;
  loanDeduction: number;
  terEffectiveRate?: number;
  bpjsEmployeeRate?: number;
  bpjsEmployerRate?: number;
}): {
  gross: number;
  bpjsEmployee: number;
  bpjsEmployer: number;
  pph21Ter: number;
  netPay: number;
} {
  const gross = params.baseSalary + params.allowances + params.overtimeApprovedPay;
  const bpjsCapBase = Math.min(params.baseSalary, 12000000);
  const bpjsEmployee = Math.round(bpjsCapBase * (params.bpjsEmployeeRate ?? 0.03));
  const bpjsEmployer = Math.round(bpjsCapBase * (params.bpjsEmployerRate ?? 0.0824));
  const terRate = params.terEffectiveRate ?? (gross > 25000000 ? 0.11 : gross > 12000000 ? 0.06 : 0.025);
  const pph21Ter = Math.round(gross * terRate);
  const netPay = Math.max(gross - bpjsEmployee - pph21Ter - params.loanDeduction, 0);

  return { gross, bpjsEmployee, bpjsEmployer, pph21Ter, netPay };
}

/**
 * FSD Employee Core AC #6: Document Expiry Reminder Tier (H-90 / H-60 / H-30 / H-7).
 */
export function getDocumentExpiryTier(
  expiryDate: string | null,
  referenceIsoDate: string
): 'no_expiry' | 'expired' | 'H-7' | 'H-30' | 'H-60' | 'H-90' | 'valid' {
  if (!expiryDate) return 'no_expiry';
  const exp = new Date(expiryDate).getTime();
  const ref = new Date(referenceIsoDate).getTime();
  const diffDays = Math.ceil((exp - ref) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'H-7';
  if (diffDays <= 30) return 'H-30';
  if (diffDays <= 60) return 'H-60';
  if (diffDays <= 90) return 'H-90';
  return 'valid';
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildCsvContent(headers: string[], rows: (string | number)[][]): string {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}
