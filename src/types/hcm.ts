export type Language = 'id' | 'en';
export type ThemeMode = 'light' | 'dark';
export type WorkspaceMode = 'admin' | 'ess';

export type ActorRole =
  | 'hr_operations'
  | 'payroll_maker'
  | 'payroll_checker'
  | 'manager'
  | 'employee';

export type AdminTab =
  | 'dashboard'
  | 'employees'
  | 'recruitment'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'expense'
  | 'performance'
  | 'operations'
  | 'settings';

export type EssTab =
  | 'ess_home'
  | 'ess_attendance'
  | 'ess_leave'
  | 'ess_payroll'
  | 'ess_expense'
  | 'ess_performance'
  | 'ess_helpdesk'
  | 'ess_profile';

export type EmploymentRelationship = 'PKWTT' | 'PKWT';
export type TimeCapacity = 'full_time' | 'part_time';
export type WorkLocationMode = 'WFO' | 'WFH' | 'hybrid' | 'field';
export type PaymentBasis = 'monthly' | 'hourly' | 'daily';

export interface LegalEntity {
  id: string;
  name: string;
  npwp: string;
  city: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  geofenceRadiusMeters: number;
  timezone: string;
}

export interface PersonProfile {
  personId: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  country: string;
  cityState: string;
  postalCode: string;
  npwp: string;
  ptkpStatus: 'TK/0' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

export interface EmploymentRecord {
  employmentId: string;
  employeeCode: string;
  legalEntityId: string;
  relationship: EmploymentRelationship;
  timeCapacity: TimeCapacity;
  paymentBasis: PaymentBasis;
  schedulePattern: string;
  joinDate: string;
  probationEndDate?: string;
  contractEndDate?: string;
  status: 'active' | 'probation' | 'offboarding' | 'terminated';
  baseSalary: number;
  allowances: number;
}

export interface AssignmentRecord {
  assignmentId: string;
  department: string;
  costCenter: string;
  roleTitle: string;
  grade: string;
  locationId: string;
  locationName: string;
  workMode: WorkLocationMode;
  managerName: string;
  effectiveDate: string;
}

export interface EffectiveHistoryRecord {
  id: string;
  effectiveDate: string;
  category: 'promotion' | 'mutation' | 'compensation' | 'contract' | 'bank_change';
  summary: string;
  oldValue: string;
  newValue: string;
  actor: string;
  reason: string;
}

export interface EmployeeDocument {
  id: string;
  title: string;
  category: 'contract' | 'identity' | 'tax' | 'certificate';
  expiryDate: string | null;
  uploadedAt: string;
  classification: 'confidential' | 'restricted' | 'internal';
}

export interface EmployeeRecord {
  id: string;
  person: PersonProfile;
  employment: EmploymentRecord;
  assignment: AssignmentRecord;
  history: EffectiveHistoryRecord[];
  documents: EmployeeDocument[];
  performanceBreakdown: {
    taskCompleted: number;
    presence: number;
    completedMeeting: number;
  };
}

export interface BankChangeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  oldBankName: string;
  oldAccountNumber: string;
  newBankName: string;
  newAccountNumber: string;
  newAccountHolder: string;
  requestedAt: string;
  requestedBy: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reason: string;
}

export type AttendanceSummaryStatus =
  | 'on_time'
  | 'late'
  | 'early_leave'
  | 'unknown'
  | 'field_work'
  | 'leave'
  | 'wfh';

export interface AttendanceRawEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  eventType: 'check_in' | 'check_out';
  deviceTime: string;
  serverTime: string;
  timezone: string;
  source: 'mobile' | 'web' | 'kiosk';
  workMode: WorkLocationMode;
  locationName: string;
  gpsAccuracyMeters: number;
  verificationStatus: 'verified' | 'pending_approval' | 'flagged';
}

export interface AttendanceDailySummary {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workMode: WorkLocationMode;
  status: AttendanceSummaryStatus;
  overtimeCandidateMinutes: number;
  exceptionNote?: string;
}

export interface ShiftScheduleItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  crossDay: boolean;
  workMode: WorkLocationMode;
  swapStatus?: 'none' | 'swap_requested' | 'swapped';
}

export type LeaveLedgerEntryType =
  | 'opening'
  | 'accrual'
  | 'usage'
  | 'adjustment'
  | 'expiry'
  | 'reversal';

export interface LeaveLedgerEntry {
  id: string;
  employeeId: string;
  date: string;
  type: LeaveLedgerEntryType;
  days: number; // positive for opening/accrual/reversal, negative for usage/expiry
  note: string;
  referenceId?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'unpaid' | 'special';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  approverName?: string;
}

export type PayrollRunStatus =
  | 'draft'
  | 'input_locked'
  | 'calculated'
  | 'reviewed'
  | 'approved'
  | 'payment_prepared'
  | 'reconciled';

export interface PayrollLineItem {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  relationship: EmploymentRelationship;
  ptkpStatus: string;
  baseSalary: number;
  allowances: number;
  overtimeApprovedPay: number;
  bpjsEmployee: number;
  bpjsEmployer: number;
  pph21Ter: number;
  loanDeduction: number;
  netPay: number;
}

export interface PayrollRun {
  id: string;
  periodLabel: string;
  periodCode: string;
  legalEntityName: string;
  status: PayrollRunStatus;
  makerName: string;
  checkerName: string | null;
  approverName: string | null;
  employeeCount: number;
  totalGross: number;
  totalEmployerCost: number;
  totalTaxPph21: number;
  totalNetPay: number;
  createdAt: string;
  updatedAt: string;
  lines: PayrollLineItem[];
}

export interface TravelExpenseItem {
  id: string;
  category: 'transport' | 'hotel' | 'per_diem' | 'client_meal';
  description: string;
  amount: number;
  paidBy: 'employee' | 'company_direct';
  approved: boolean;
}

export interface TravelSettlementRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  destinationCategory: 'domestic_tier_1' | 'domestic_tier_2' | 'international';
  startDate: string;
  endDate: string;
  cashAdvance: number;
  items: TravelExpenseItem[];
  consentDeductionSigned: boolean;
  status: 'submitted' | 'reviewed' | 'approved' | 'reconciled';
}

export interface ReimbursementClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  category: 'medical' | 'field_fuel_toll' | 'internet_wfh' | 'equipment';
  costCenter: string;
  date: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
}

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'scheduled' | 'reserved_in_payroll' | 'reconciled_paid';
}

export interface LoanRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  loanType: 'emergency' | 'housing' | 'education';
  principalAmount: number;
  tenorMonths: number;
  status: 'active' | 'pending_approval' | 'settled';
  approvedAt: string;
  installments: LoanInstallment[];
}

export interface ManpowerPlan {
  id: string;
  department: string;
  location: string;
  costCenter: string;
  positionTitle: string;
  planType: 'replacement' | 'new_headcount' | 'backfill' | 'seasonal';
  plannedHeadcount: number;
  actualHeadcount: number;
  budgetApproved: boolean;
  status: 'approved' | 'pending_finance';
}

export interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  appliedPosition: string;
  source: string;
  stage: 'screening' | 'interview' | 'assessment' | 'offer' | 'hired';
  aiRecommendationScore: number;
  humanReviewerNote: string;
  consentSigned: boolean;
}

export interface ClearanceCase {
  id: string;
  employeeName: string;
  caseType: 'onboarding' | 'resign' | 'contract_end' | 'retirement';
  effectiveDate: string;
  items: {
    id: string;
    team: 'HR' | 'IT' | 'GA' | 'Finance' | 'Manager';
    task: string;
    completed: boolean;
    riskCritical?: boolean;
  }[];
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cycle: string;
  title: string;
  weightPercent: number;
  progressPercent: number;
  individualRating: number;
  companyFundingFactor: number;
  calibrationStatus: 'draft' | 'self_reviewed' | 'manager_reviewed' | 'calibrated';
}

export interface LearningCourse {
  id: string;
  title: string;
  category: string;
  mandatory: boolean;
  durationMinutes: number;
  enrolledCount: number;
  completionRate: number;
  myProgressPercent: number;
}

export interface VisitorEntry {
  id: string;
  visitorName: string;
  company: string;
  hostName: string;
  purpose: string;
  expectedExit: string;
  status: 'pre_registered' | 'checked_in' | 'checked_out' | 'overdue';
  badgeCode: string;
}

export interface VehicleLog {
  id: string;
  plateNumber: string;
  vehicleModel: string;
  driverName: string;
  odometerOut: number;
  odometerIn: number | null;
  status: 'available' | 'in_use' | 'maintenance';
  licenseExpiry: string;
}

export interface HelpdeskTicket {
  id: string;
  subject: string;
  category: 'payroll' | 'leave' | 'it_access' | 'ethics_confidential';
  channel: 'in_app' | 'email' | 'whatsapp';
  requesterName: string;
  isConfidential: boolean;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved';
  slaHoursRemaining: number;
  createdAt: string;
  publicReplies: { sender: string; message: string; time: string }[];
  internalNotes: { agent: string; note: string; time: string }[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  publishedAt: string;
  pinned: boolean;
  readCount: number;
  totalTargetCount: number;
  acknowledgedByMe: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  domain: 'employee' | 'payroll' | 'attendance' | 'leave' | 'security' | 'expense';
  action: string;
  target: string;
  classification: 'confidential' | 'restricted' | 'internal';
}
