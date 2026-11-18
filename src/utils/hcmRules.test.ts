import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLeaveBalance,
  calculatePayrollLinePreview,
  calculateTravelSettlement,
  canTransitionPayrollRun,
  generateLoanInstallments,
  getDocumentExpiryTier,
  validateLeaveSubmission,
} from './hcmRules';
import type { LeaveLedgerEntry, LeaveRequest, TravelExpenseItem } from '../types/hcm';

test('Loan installment generator matches FSD Rule 12 exact integer division', () => {
  const installments = generateLoanInstallments(10_000_000, 12, '2026-11-01');
  assert.equal(installments.length, 12);
  for (let i = 0; i < 11; i++) {
    assert.equal(installments[i].amount, 833_333);
  }
  assert.equal(installments[11].amount, 833_337);
  const total = installments.reduce((sum, item) => sum + item.amount, 0);
  assert.equal(total, 10_000_000);
});

test('Business travel settlement excludes company-paid items and computes payable/refundable', () => {
  const items: TravelExpenseItem[] = [
    { id: '1', category: 'hotel', description: 'Hotel Surabaya (Corporate Card)', amount: 2_400_000, paidBy: 'company_direct', approved: true },
    { id: '2', category: 'per_diem', description: 'Uang Harian 3 Hari', amount: 1_200_000, paidBy: 'employee', approved: true },
    { id: '3', category: 'transport', description: 'Taksi Bandara', amount: 350_000, paidBy: 'employee', approved: true },
    { id: '4', category: 'client_meal', description: 'Struk Belum Disetujui', amount: 500_000, paidBy: 'employee', approved: false },
  ];

  // Advance 1,000,000 vs Employee-paid approved 1,550,000 => payable 550,000
  const payableCase = calculateTravelSettlement(1_000_000, items);
  assert.equal(payableCase.actualApprovedEmployeePaid, 1_550_000);
  assert.equal(payableCase.companyDirectPaid, 2_400_000);
  assert.equal(payableCase.payableToEmployee, 550_000);
  assert.equal(payableCase.refundableToCompany, 0);

  // Advance 2,000,000 vs Employee-paid approved 1,550,000 => refundable 450,000
  const refundCase = calculateTravelSettlement(2_000_000, items);
  assert.equal(refundCase.payableToEmployee, 0);
  assert.equal(refundCase.refundableToCompany, 450_000);
});

test('Leave ledger and overlap validation prevent negative balance and overlapping dates', () => {
  const ledger: LeaveLedgerEntry[] = [
    { id: 'l1', employeeId: 'e1', date: '2026-01-01', type: 'opening', days: 12, note: 'Saldo awal' },
    { id: 'l2', employeeId: 'e1', date: '2026-06-10', type: 'usage', days: -4, note: 'Cuti keluarga' },
  ];
  const balance = calculateLeaveBalance(ledger);
  assert.equal(balance, 8);

  const existing: LeaveRequest[] = [
    {
      id: 'r1',
      employeeId: 'e1',
      employeeName: 'Budi',
      department: 'Engineering',
      leaveType: 'annual',
      startDate: '2026-12-20',
      endDate: '2026-12-22',
      days: 3,
      reason: 'Liburan',
      status: 'approved',
      submittedAt: '2026-11-10',
    },
  ];

  const overlapResult = validateLeaveSubmission({
    availableBalance: balance,
    requestedDays: 2,
    startDate: '2026-12-21',
    endDate: '2026-12-23',
    existingRequests: existing,
    employeeId: 'e1',
  });
  assert.equal(overlapResult.valid, false);
  assert.equal(overlapResult.errorKey, 'overlapping_leave');

  const validResult = validateLeaveSubmission({
    availableBalance: balance,
    requestedDays: 2,
    startDate: '2026-11-25',
    endDate: '2026-11-26',
    existingRequests: existing,
    employeeId: 'e1',
  });
  assert.equal(validResult.valid, true);
});

test('Payroll state machine enforces maker-checker segregation of duties', () => {
  const selfReview = canTransitionPayrollRun({
    currentStatus: 'calculated',
    makerName: 'Raka Pratama',
    actorName: 'Raka Pratama',
    actorRole: 'payroll_maker',
  });
  assert.equal(selfReview.allowed, false);
  assert.equal(selfReview.reasonKey, 'self_approval_forbidden');

  const validReview = canTransitionPayrollRun({
    currentStatus: 'calculated',
    makerName: 'Raka Pratama',
    actorName: 'Siti Rahma',
    actorRole: 'payroll_checker',
  });
  assert.equal(validReview.allowed, true);
  assert.equal(validReview.nextStatus, 'reviewed');
});

test('Document expiry reminder tiers evaluate H-7, H-30, H-60, H-90 accurately', () => {
  assert.equal(getDocumentExpiryTier('2026-11-20', '2026-11-17'), 'H-7');
  assert.equal(getDocumentExpiryTier('2026-12-10', '2026-11-17'), 'H-30');
  assert.equal(getDocumentExpiryTier('2027-01-10', '2026-11-17'), 'H-60');
  assert.equal(getDocumentExpiryTier('2027-02-10', '2026-11-17'), 'H-90');
  assert.equal(getDocumentExpiryTier('2026-11-01', '2026-11-17'), 'expired');
  assert.equal(getDocumentExpiryTier(null, '2026-11-17'), 'no_expiry');
});

test('Payroll line calculation produces consistent non-negative net pay', () => {
  const line = calculatePayrollLinePreview({
    baseSalary: 15_000_000,
    allowances: 2_500_000,
    overtimeApprovedPay: 500_000,
    loanDeduction: 833_333,
  });
  assert.equal(line.gross, 18_000_000);
  assert.ok(line.netPay > 0);
  assert.equal(line.netPay, line.gross - line.bpjsEmployee - line.pph21Ter - 833_333);
});
