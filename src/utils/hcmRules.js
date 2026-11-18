function generateLoanInstallments(principalAmount, tenorMonths, startIsoDate) {
  if (principalAmount <= 0 || tenorMonths <= 0 || !Number.isInteger(tenorMonths)) {
    throw new Error("Principal amount and tenor months must be positive integers.");
  }
  const baseInstallment = Math.floor(principalAmount / tenorMonths);
  const remainder = principalAmount - baseInstallment * tenorMonths;
  const start = new Date(startIsoDate);
  const installments = [];
  for (let i = 0; i < tenorMonths; i++) {
    const due = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i + 1, 25));
    const amount = i === tenorMonths - 1 ? baseInstallment + remainder : baseInstallment;
    installments.push({
      installmentNumber: i + 1,
      dueDate: due.toISOString().slice(0, 10),
      amount,
      status: "scheduled"
    });
  }
  return installments;
}
function calculateTravelSettlement(cashAdvance, items) {
  const actualApprovedEmployeePaid = items.filter((item) => item.approved && item.paidBy === "employee").reduce((sum, item) => sum + item.amount, 0);
  const companyDirectPaid = items.filter((item) => item.paidBy === "company_direct").reduce((sum, item) => sum + item.amount, 0);
  const payableToEmployee = Math.max(actualApprovedEmployeePaid - cashAdvance, 0);
  const refundableToCompany = Math.max(cashAdvance - actualApprovedEmployeePaid, 0);
  return {
    actualApprovedEmployeePaid,
    companyDirectPaid,
    payableToEmployee,
    refundableToCompany
  };
}
function calculateLeaveBalance(entries) {
  return entries.reduce((sum, entry) => sum + entry.days, 0);
}
function validateLeaveSubmission(params) {
  const { availableBalance, requestedDays, startDate, endDate, existingRequests, employeeId } = params;
  if (!startDate || !endDate || endDate < startDate) {
    return { valid: false, errorKey: "invalid_date_range" };
  }
  if (requestedDays <= 0) {
    return { valid: false, errorKey: "invalid_days" };
  }
  if (requestedDays > availableBalance) {
    return { valid: false, errorKey: "insufficient_balance" };
  }
  const hasOverlap = existingRequests.some(
    (req) => req.employeeId === employeeId && (req.status === "pending" || req.status === "approved") && !(endDate < req.startDate || startDate > req.endDate)
  );
  if (hasOverlap) {
    return { valid: false, errorKey: "overlapping_leave" };
  }
  return { valid: true };
}
const PAYROLL_TRANSITIONS = {
  draft: "input_locked",
  input_locked: "calculated",
  calculated: "reviewed",
  reviewed: "approved",
  approved: "payment_prepared",
  payment_prepared: "reconciled",
  reconciled: null
};
function getNextPayrollStatus(current) {
  return PAYROLL_TRANSITIONS[current];
}
function canTransitionPayrollRun(params) {
  const nextStatus = getNextPayrollStatus(params.currentStatus);
  if (!nextStatus) {
    return { allowed: false, nextStatus: null, reasonKey: "already_reconciled" };
  }
  if ((nextStatus === "reviewed" || nextStatus === "approved") && params.makerName === params.actorName) {
    return { allowed: false, nextStatus, reasonKey: "self_approval_forbidden" };
  }
  if (nextStatus === "approved" && params.actorRole !== "payroll_checker" && params.actorRole !== "hr_operations") {
    return { allowed: false, nextStatus, reasonKey: "checker_role_required" };
  }
  return { allowed: true, nextStatus };
}
function calculatePayrollLinePreview(params) {
  const gross = params.baseSalary + params.allowances + params.overtimeApprovedPay;
  const bpjsCapBase = Math.min(params.baseSalary, 12e6);
  const bpjsEmployee = Math.round(bpjsCapBase * (params.bpjsEmployeeRate ?? 0.03));
  const bpjsEmployer = Math.round(bpjsCapBase * (params.bpjsEmployerRate ?? 0.0824));
  const terRate = params.terEffectiveRate ?? (gross > 25e6 ? 0.11 : gross > 12e6 ? 0.06 : 0.025);
  const pph21Ter = Math.round(gross * terRate);
  const netPay = Math.max(gross - bpjsEmployee - pph21Ter - params.loanDeduction, 0);
  return { gross, bpjsEmployee, bpjsEmployer, pph21Ter, netPay };
}
function getDocumentExpiryTier(expiryDate, referenceIsoDate) {
  if (!expiryDate) return "no_expiry";
  const exp = new Date(expiryDate).getTime();
  const ref = new Date(referenceIsoDate).getTime();
  const diffDays = Math.ceil((exp - ref) / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "H-7";
  if (diffDays <= 30) return "H-30";
  if (diffDays <= 60) return "H-60";
  if (diffDays <= 90) return "H-90";
  return "valid";
}
function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}
function buildCsvContent(headers, rows) {
  const escape = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}
export {
  buildCsvContent,
  calculateLeaveBalance,
  calculatePayrollLinePreview,
  calculateTravelSettlement,
  canTransitionPayrollRun,
  formatIDR,
  generateLoanInstallments,
  getDocumentExpiryTier,
  getNextPayrollStatus,
  validateLeaveSubmission
};
