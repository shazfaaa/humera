import { calculatePayrollLinePreview, generateLoanInstallments } from "../utils/hcmRules";
const AVATARS = {
  hrAdmin: "/src/assets/images/avatar_hr_admin_1794921151287.jpg",
  engLead: "/src/assets/images/avatar_eng_lead_1794921150746.jpg",
  financeMgr: "/src/assets/images/avatar_finance_mgr_1794921150396.jpg",
  designer: "/src/assets/images/avatar_product_designer_1794921151842.jpg"
};
const LEGAL_ENTITIES = [
  { id: "le-1", name: "PT Nusantara Karya Digital", npwp: "01.345.678.9-011.000", city: "Jakarta Selatan" },
  { id: "le-2", name: "PT Nusantara Logistik Terpadu", npwp: "02.884.112.4-609.000", city: "Surabaya" }
];
const OFFICE_LOCATIONS = [
  { id: "loc-jkt", name: "Jakarta HQ (Sudirman)", city: "Jakarta", geofenceRadiusMeters: 150, timezone: "Asia/Jakarta" },
  { id: "loc-bdg", name: "Bandung Tech Hub", city: "Bandung", geofenceRadiusMeters: 120, timezone: "Asia/Jakarta" },
  { id: "loc-sby", name: "Surabaya Operations Center", city: "Surabaya", geofenceRadiusMeters: 200, timezone: "Asia/Jakarta" }
];
const INITIAL_EMPLOYEES = [
  {
    id: "emp-1",
    person: {
      personId: "PER-1001",
      fullName: "Raka Pratama",
      email: "raka.pratama@nusakarya.id",
      phone: "+62 812-8834-1920",
      bio: "Engineering Lead \xB7 Platform & Core Services",
      avatarUrl: AVATARS.engLead,
      country: "Indonesia",
      cityState: "Jakarta Selatan, DKI Jakarta",
      postalCode: "12190",
      npwp: "84.229.104.5-015.000",
      ptkpStatus: "K/1",
      emergencyContactName: "Dian Pratama",
      emergencyContactRelation: "Pasangan",
      emergencyContactPhone: "+62 811-9021-443",
      bankName: "Bank Mandiri",
      bankAccountNumber: "124-00-0948123-4",
      bankAccountHolder: "Raka Pratama"
    },
    employment: {
      employmentId: "EMP-2023-0041",
      employeeCode: "NKD-0041",
      legalEntityId: "le-1",
      relationship: "PKWTT",
      timeCapacity: "full_time",
      paymentBasis: "monthly",
      schedulePattern: "Senin\u2013Jumat (09:00\u201318:00 WIB)",
      joinDate: "2023-02-15",
      status: "active",
      baseSalary: 24e6,
      allowances: 35e5
    },
    assignment: {
      assignmentId: "ASG-881",
      department: "Engineering",
      costCenter: "CC-ENG-01",
      roleTitle: "Engineering Lead",
      grade: "L6",
      locationId: "loc-jkt",
      locationName: "Jakarta HQ (Sudirman)",
      workMode: "hybrid",
      managerName: "Nadira Kusuma",
      effectiveDate: "2025-07-01"
    },
    history: [
      {
        id: "his-1",
        effectiveDate: "2025-07-01",
        category: "promotion",
        summary: "Promosi ke Engineering Lead (L6)",
        oldValue: "Senior Backend Engineer (L5)",
        newValue: "Engineering Lead (L6)",
        actor: "Nadira Kusuma (HR Director)",
        reason: "Annual Talent Calibration & Promotion Cycle"
      },
      {
        id: "his-2",
        effectiveDate: "2024-03-01",
        category: "compensation",
        summary: "Penyesuaian Gaji Tahunan",
        oldValue: "Rp 20.500.000",
        newValue: "Rp 24.000.000",
        actor: "Bima Wijaya (Finance)",
        reason: "Market Benchmark & Performance Review 2024"
      }
    ],
    documents: [
      { id: "doc-1", title: "Perjanjian Kerja PKWTT #0041", category: "contract", expiryDate: null, uploadedAt: "2023-02-15", classification: "confidential" },
      { id: "doc-2", title: "Sertifikat Kompetensi Cloud Security", category: "certificate", expiryDate: "2026-12-10", uploadedAt: "2024-12-10", classification: "internal" },
      { id: "doc-3", title: "Kartu NPWP & E-FIN", category: "tax", expiryDate: null, uploadedAt: "2023-02-16", classification: "restricted" }
    ],
    performanceBreakdown: { taskCompleted: 14, presence: 10, completedMeeting: 12 }
  },
  {
    id: "emp-2",
    person: {
      personId: "PER-1002",
      fullName: "Nadira Kusuma",
      email: "nadira.kusuma@nusakarya.id",
      phone: "+62 811-2241-908",
      bio: "HR Operations Director \xB7 People & Compliance",
      avatarUrl: AVATARS.hrAdmin,
      country: "Indonesia",
      cityState: "Jakarta Selatan, DKI Jakarta",
      postalCode: "12950",
      npwp: "77.110.542.8-011.000",
      ptkpStatus: "K/2",
      emergencyContactName: "Hendra Kusuma",
      emergencyContactRelation: "Pasangan",
      emergencyContactPhone: "+62 813-1122-3344",
      bankName: "BCA",
      bankAccountNumber: "522-0491827",
      bankAccountHolder: "Nadira Kusuma"
    },
    employment: {
      employmentId: "EMP-2021-0008",
      employeeCode: "NKD-0008",
      legalEntityId: "le-1",
      relationship: "PKWTT",
      timeCapacity: "full_time",
      paymentBasis: "monthly",
      schedulePattern: "Senin\u2013Jumat (08:30\u201317:30 WIB)",
      joinDate: "2021-04-01",
      status: "active",
      baseSalary: 32e6,
      allowances: 5e6
    },
    assignment: {
      assignmentId: "ASG-102",
      department: "People & HR",
      costCenter: "CC-HR-01",
      roleTitle: "HR Operations Director",
      grade: "L7",
      locationId: "loc-jkt",
      locationName: "Jakarta HQ (Sudirman)",
      workMode: "WFO",
      managerName: "Dewan Direksi",
      effectiveDate: "2024-01-01"
    },
    history: [
      {
        id: "his-3",
        effectiveDate: "2024-01-01",
        category: "promotion",
        summary: "Penunjukan Direktur HR Operations",
        oldValue: "Head of People Partner (L6)",
        newValue: "HR Operations Director (L7)",
        actor: "CEO Office",
        reason: "Ekspansi multi-lokasi & tata kelola HCM"
      }
    ],
    documents: [
      { id: "doc-4", title: "Kontrak Eksekutif PKWTT #0008", category: "contract", expiryDate: null, uploadedAt: "2021-04-01", classification: "confidential" }
    ],
    performanceBreakdown: { taskCompleted: 16, presence: 11, completedMeeting: 11 }
  },
  {
    id: "emp-3",
    person: {
      personId: "PER-1003",
      fullName: "Bima Wijaya",
      email: "bima.wijaya@nusakarya.id",
      phone: "+62 818-4490-120",
      bio: "Payroll & Finance Compliance Lead",
      avatarUrl: AVATARS.financeMgr,
      country: "Indonesia",
      cityState: "Bandung, Jawa Barat",
      postalCode: "40115",
      npwp: "89.552.310.1-423.000",
      ptkpStatus: "TK/0",
      emergencyContactName: "Ratna Wijaya",
      emergencyContactRelation: "Ibu Kandung",
      emergencyContactPhone: "+62 812-2099-1188",
      bankName: "Bank Mandiri",
      bankAccountNumber: "130-00-4481920-1",
      bankAccountHolder: "Bima Wijaya"
    },
    employment: {
      employmentId: "EMP-2022-0019",
      employeeCode: "NKD-0019",
      legalEntityId: "le-1",
      relationship: "PKWTT",
      timeCapacity: "full_time",
      paymentBasis: "monthly",
      schedulePattern: "Senin\u2013Jumat (09:00\u201318:00 WIB)",
      joinDate: "2022-08-10",
      status: "active",
      baseSalary: 195e5,
      allowances: 25e5
    },
    assignment: {
      assignmentId: "ASG-319",
      department: "Finance & Payroll",
      costCenter: "CC-FIN-02",
      roleTitle: "Payroll Compliance Lead",
      grade: "L5",
      locationId: "loc-bdg",
      locationName: "Bandung Tech Hub",
      workMode: "hybrid",
      managerName: "Nadira Kusuma",
      effectiveDate: "2024-06-01"
    },
    history: [],
    documents: [
      { id: "doc-5", title: "Sertifikasi Brevet A & B Pajak", category: "certificate", expiryDate: "2026-11-22", uploadedAt: "2023-11-22", classification: "internal" }
    ],
    performanceBreakdown: { taskCompleted: 13, presence: 10, completedMeeting: 9 }
  },
  {
    id: "emp-4",
    person: {
      personId: "PER-1004",
      fullName: "Clarissa Tan",
      email: "clarissa.tan@nusakarya.id",
      phone: "+62 819-7730-881",
      bio: "Senior Product Designer \xB7 Design Systems",
      avatarUrl: AVATARS.designer,
      country: "Indonesia",
      cityState: "Jakarta Barat, DKI Jakarta",
      postalCode: "11470",
      npwp: "91.003.882.4-031.000",
      ptkpStatus: "TK/0",
      emergencyContactName: "Kevin Tan",
      emergencyContactRelation: "Saudara Kandung",
      emergencyContactPhone: "+62 817-9910-221",
      bankName: "BCA",
      bankAccountNumber: "488-1920384",
      bankAccountHolder: "Clarissa Tan"
    },
    employment: {
      employmentId: "EMP-2025-0112",
      employeeCode: "NKD-0112",
      legalEntityId: "le-1",
      relationship: "PKWT",
      timeCapacity: "full_time",
      paymentBasis: "monthly",
      schedulePattern: "Fleksibel Hybrid (09:30\u201318:30 WIB)",
      joinDate: "2025-01-15",
      contractEndDate: "2027-01-14",
      status: "active",
      baseSalary: 16e6,
      allowances: 2e6
    },
    assignment: {
      assignmentId: "ASG-512",
      department: "Product & Design",
      costCenter: "CC-PRD-01",
      roleTitle: "Senior Product Designer",
      grade: "L5",
      locationId: "loc-jkt",
      locationName: "Jakarta HQ (Sudirman)",
      workMode: "WFH",
      managerName: "Raka Pratama",
      effectiveDate: "2025-01-15"
    },
    history: [],
    documents: [
      { id: "doc-6", title: "Kontrak PKWT #0112 (24 Bulan)", category: "contract", expiryDate: "2027-01-14", uploadedAt: "2025-01-15", classification: "confidential" }
    ],
    performanceBreakdown: { taskCompleted: 15, presence: 9, completedMeeting: 10 }
  },
  {
    id: "emp-5",
    person: {
      personId: "PER-1005",
      fullName: "Dimas Anggara",
      email: "dimas.anggara@nusakarya.id",
      phone: "+62 815-6612-904",
      bio: "Field Operations & Fleet Coordinator",
      avatarUrl: "",
      country: "Indonesia",
      cityState: "Surabaya, Jawa Timur",
      postalCode: "60271",
      npwp: "82.114.909.2-609.000",
      ptkpStatus: "K/1",
      emergencyContactName: "Sari Anggara",
      emergencyContactRelation: "Pasangan",
      emergencyContactPhone: "+62 815-6612-905",
      bankName: "BNI",
      bankAccountNumber: "0981234512",
      bankAccountHolder: "Dimas Anggara"
    },
    employment: {
      employmentId: "EMP-2024-0087",
      employeeCode: "NLT-0087",
      legalEntityId: "le-2",
      relationship: "PKWT",
      timeCapacity: "full_time",
      paymentBasis: "monthly",
      schedulePattern: "Shift Operasional Pagi (07:00\u201316:00 WIB)",
      joinDate: "2024-06-01",
      contractEndDate: "2026-12-31",
      status: "active",
      baseSalary: 95e5,
      allowances: 18e5
    },
    assignment: {
      assignmentId: "ASG-701",
      department: "Operations & GA",
      costCenter: "CC-OPS-SBY",
      roleTitle: "Field Ops Coordinator",
      grade: "L3",
      locationId: "loc-sby",
      locationName: "Surabaya Operations Center",
      workMode: "field",
      managerName: "Nadira Kusuma",
      effectiveDate: "2024-06-01"
    },
    history: [],
    documents: [
      { id: "doc-7", title: "SIM A Operasional Perusahaan", category: "identity", expiryDate: "2026-11-28", uploadedAt: "2024-06-01", classification: "internal" }
    ],
    performanceBreakdown: { taskCompleted: 12, presence: 11, completedMeeting: 8 }
  }
];
const INITIAL_BANK_REQUESTS = [
  {
    id: "bcr-1",
    employeeId: "emp-4",
    employeeName: "Clarissa Tan",
    oldBankName: "BCA",
    oldAccountNumber: "488-1920384",
    newBankName: "Bank Mandiri",
    newAccountNumber: "124-00-8812039-7",
    newAccountHolder: "Clarissa Tan",
    requestedAt: "2026-11-16T14:20:00Z",
    requestedBy: "Clarissa Tan",
    status: "pending_verification",
    reason: "Pemindahan rekening payroll utama"
  }
];
const INITIAL_RAW_EVENTS = [
  {
    id: "evt-1",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    eventType: "check_in",
    deviceTime: "2026-11-17T08:52:14+07:00",
    serverTime: "2026-11-17T08:52:15+07:00",
    timezone: "Asia/Jakarta",
    source: "mobile",
    workMode: "hybrid",
    locationName: "Jakarta HQ (Sudirman)",
    gpsAccuracyMeters: 14,
    verificationStatus: "verified"
  },
  {
    id: "evt-2",
    employeeId: "emp-2",
    employeeName: "Nadira Kusuma",
    eventType: "check_in",
    deviceTime: "2026-11-17T08:25:02+07:00",
    serverTime: "2026-11-17T08:25:03+07:00",
    timezone: "Asia/Jakarta",
    source: "kiosk",
    workMode: "WFO",
    locationName: "Jakarta HQ Lobby Kiosk #01",
    gpsAccuracyMeters: 5,
    verificationStatus: "verified"
  },
  {
    id: "evt-3",
    employeeId: "emp-5",
    employeeName: "Dimas Anggara",
    eventType: "check_in",
    deviceTime: "2026-11-17T07:18:40+07:00",
    serverTime: "2026-11-17T07:19:01+07:00",
    timezone: "Asia/Jakarta",
    source: "mobile",
    workMode: "field",
    locationName: "Pelabuhan Tanjung Perak (Lokasi Dinas)",
    gpsAccuracyMeters: 22,
    verificationStatus: "pending_approval"
  }
];
const INITIAL_ATTENDANCE_SUMMARIES = [
  {
    id: "att-1",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    department: "Engineering",
    date: "2026-11-17",
    shiftName: "Regular Office (09:00\u201318:00)",
    checkInTime: "08:52",
    checkOutTime: null,
    workMode: "hybrid",
    status: "on_time",
    overtimeCandidateMinutes: 0
  },
  {
    id: "att-2",
    employeeId: "emp-2",
    employeeName: "Nadira Kusuma",
    department: "People & HR",
    date: "2026-11-17",
    shiftName: "Executive Morning (08:30\u201317:30)",
    checkInTime: "08:25",
    checkOutTime: null,
    workMode: "WFO",
    status: "on_time",
    overtimeCandidateMinutes: 0
  },
  {
    id: "att-3",
    employeeId: "emp-3",
    employeeName: "Bima Wijaya",
    department: "Finance & Payroll",
    date: "2026-11-16",
    shiftName: "Regular Office (09:00\u201318:00)",
    checkInTime: "09:19",
    checkOutTime: null,
    workMode: "hybrid",
    status: "unknown",
    overtimeCandidateMinutes: 0,
    exceptionNote: "Missing check-out event (status unknown hingga dikoreksi)"
  },
  {
    id: "att-4",
    employeeId: "emp-4",
    employeeName: "Clarissa Tan",
    department: "Product & Design",
    date: "2026-11-17",
    shiftName: "Flexible Hybrid (09:30\u201318:30)",
    checkInTime: "09:24",
    checkOutTime: null,
    workMode: "WFH",
    status: "wfh",
    overtimeCandidateMinutes: 0
  },
  {
    id: "att-5",
    employeeId: "emp-5",
    employeeName: "Dimas Anggara",
    department: "Operations & GA",
    date: "2026-11-17",
    shiftName: "Field Ops Pagi (07:00\u201316:00)",
    checkInTime: "07:18",
    checkOutTime: null,
    workMode: "field",
    status: "field_work",
    overtimeCandidateMinutes: 45,
    exceptionNote: "Kandidat waktu tambahan 45m di luar shift (menunggu verifikasi)"
  }
];
const INITIAL_SHIFTS = [
  { id: "sh-1", employeeId: "emp-1", employeeName: "Raka Pratama", department: "Engineering", date: "2026-11-17", shiftName: "Regular Office", startTime: "09:00", endTime: "18:00", crossDay: false, workMode: "hybrid", swapStatus: "none" },
  { id: "sh-2", employeeId: "emp-2", employeeName: "Nadira Kusuma", department: "People & HR", date: "2026-11-17", shiftName: "Executive Morning", startTime: "08:30", endTime: "17:30", crossDay: false, workMode: "WFO", swapStatus: "none" },
  { id: "sh-3", employeeId: "emp-4", employeeName: "Clarissa Tan", department: "Product & Design", date: "2026-11-17", shiftName: "Flexible Hybrid", startTime: "09:30", endTime: "18:30", crossDay: false, workMode: "WFH", swapStatus: "none" },
  { id: "sh-4", employeeId: "emp-5", employeeName: "Dimas Anggara", department: "Operations & GA", date: "2026-11-17", shiftName: "Ops Shift Malam", startTime: "22:00", endTime: "06:00", crossDay: true, workMode: "field", swapStatus: "swap_requested" }
];
const INITIAL_LEAVE_LEDGER = [
  { id: "ll-1", employeeId: "emp-1", date: "2026-01-01", type: "opening", days: 12, note: "Saldo cuti tahunan 2026" },
  { id: "ll-2", employeeId: "emp-1", date: "2026-04-14", type: "usage", days: -2, note: "Cuti keluarga pasca Lebaran", referenceId: "lr-old-1" },
  { id: "ll-3", employeeId: "emp-1", date: "2026-08-18", type: "usage", days: -1, note: "Keperluan administrasi pribadi", referenceId: "lr-old-2" },
  { id: "ll-4", employeeId: "emp-1", date: "2026-10-01", type: "adjustment", days: 1, note: "Kompensasi tugas weekend deployment" }
];
const INITIAL_LEAVE_REQUESTS = [
  {
    id: "lr-1",
    employeeId: "emp-4",
    employeeName: "Clarissa Tan",
    department: "Product & Design",
    leaveType: "annual",
    startDate: "2026-11-24",
    endDate: "2026-11-26",
    days: 3,
    reason: "Acara keluarga di Yogyakarta",
    status: "pending",
    submittedAt: "2026-11-16"
  },
  {
    id: "lr-2",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    department: "Engineering",
    leaveType: "annual",
    startDate: "2026-12-28",
    endDate: "2026-12-30",
    days: 3,
    reason: "Cuti akhir tahun",
    status: "approved",
    submittedAt: "2026-11-10",
    approverName: "Nadira Kusuma"
  }
];
function buildPayrollLines() {
  return INITIAL_EMPLOYEES.map((emp) => {
    const loanDeduction = emp.id === "emp-1" ? 833333 : 0;
    const overtimeApprovedPay = emp.id === "emp-5" ? 42e4 : 0;
    const calc = calculatePayrollLinePreview({
      baseSalary: emp.employment.baseSalary,
      allowances: emp.employment.allowances,
      overtimeApprovedPay,
      loanDeduction
    });
    return {
      employeeId: emp.id,
      employeeName: emp.person.fullName,
      employeeCode: emp.employment.employeeCode,
      department: emp.assignment.department,
      relationship: emp.employment.relationship,
      ptkpStatus: emp.person.ptkpStatus,
      baseSalary: emp.employment.baseSalary,
      allowances: emp.employment.allowances,
      overtimeApprovedPay,
      bpjsEmployee: calc.bpjsEmployee,
      bpjsEmployer: calc.bpjsEmployer,
      pph21Ter: calc.pph21Ter,
      loanDeduction,
      netPay: calc.netPay
    };
  });
}
const novemberLines = buildPayrollLines();
const INITIAL_PAYROLL_RUNS = [
  {
    id: "pr-2026-11",
    periodLabel: "November 2026",
    periodCode: "2026-11",
    legalEntityName: "PT Nusantara Karya Digital",
    status: "calculated",
    makerName: "Bima Wijaya",
    checkerName: null,
    approverName: null,
    employeeCount: novemberLines.length,
    totalGross: novemberLines.reduce((s, l) => s + l.baseSalary + l.allowances + l.overtimeApprovedPay, 0),
    totalEmployerCost: novemberLines.reduce((s, l) => s + l.bpjsEmployer, 0),
    totalTaxPph21: novemberLines.reduce((s, l) => s + l.pph21Ter, 0),
    totalNetPay: novemberLines.reduce((s, l) => s + l.netPay, 0),
    createdAt: "2026-11-16T09:00:00Z",
    updatedAt: "2026-11-17T08:30:00Z",
    lines: novemberLines
  },
  {
    id: "pr-2026-10",
    periodLabel: "Oktober 2026",
    periodCode: "2026-10",
    legalEntityName: "PT Nusantara Karya Digital",
    status: "reconciled",
    makerName: "Bima Wijaya",
    checkerName: "Nadira Kusuma",
    approverName: "Nadira Kusuma",
    employeeCount: novemberLines.length,
    totalGross: 1158e5,
    totalEmployerCost: 489e4,
    totalTaxPph21: 824e4,
    totalNetPay: 10345e4,
    createdAt: "2026-10-20T09:00:00Z",
    updatedAt: "2026-10-25T16:15:00Z",
    lines: novemberLines
  }
];
const INITIAL_TRAVEL_SETTLEMENTS = [
  {
    id: "ts-1",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    destination: "Surabaya Operations Center",
    destinationCategory: "domestic_tier_1",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    cashAdvance: 15e5,
    consentDeductionSigned: true,
    status: "reviewed",
    items: [
      { id: "ti-1", category: "hotel", description: "Hotel 2 Malam (Dibayar langsung perusahaan)", amount: 22e5, paidBy: "company_direct", approved: true },
      { id: "ti-2", category: "per_diem", description: "Uang Harian Dinas 3 Hari", amount: 135e4, paidBy: "employee", approved: true },
      { id: "ti-3", category: "transport", description: "Taksi Bandara & Tol", amount: 48e4, paidBy: "employee", approved: true }
    ]
  }
];
const INITIAL_REIMBURSEMENTS = [
  {
    id: "rb-1",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    category: "internet_wfh",
    costCenter: "CC-ENG-01",
    date: "2026-11-05",
    amount: 35e4,
    description: "Tunjangan Internet Fiber WFH November 2026",
    status: "approved"
  },
  {
    id: "rb-2",
    employeeId: "emp-5",
    employeeName: "Dimas Anggara",
    category: "field_fuel_toll",
    costCenter: "CC-OPS-SBY",
    date: "2026-11-15",
    amount: 475e3,
    description: "BBM & Tol Kunjungan Gudang Gresik",
    status: "pending"
  }
];
const INITIAL_LOANS = [
  {
    id: "ln-1",
    employeeId: "emp-1",
    employeeName: "Raka Pratama",
    loanType: "housing",
    principalAmount: 1e7,
    tenorMonths: 12,
    status: "active",
    approvedAt: "2026-09-15",
    installments: generateLoanInstallments(1e7, 12, "2026-09-15").map((inst, idx) => ({
      ...inst,
      status: idx === 0 ? "reconciled_paid" : idx === 1 ? "reserved_in_payroll" : "scheduled"
    }))
  }
];
const INITIAL_MPP_PLANS = [
  { id: "mpp-1", department: "Engineering", location: "Jakarta HQ", costCenter: "CC-ENG-01", positionTitle: "Backend Engineer (Go/TS)", planType: "new_headcount", plannedHeadcount: 4, actualHeadcount: 2, budgetApproved: true, status: "approved" },
  { id: "mpp-2", department: "Operations & GA", location: "Surabaya", costCenter: "CC-OPS-SBY", positionTitle: "Fleet Driver & Field Ops", planType: "replacement", plannedHeadcount: 3, actualHeadcount: 2, budgetApproved: true, status: "approved" },
  { id: "mpp-3", department: "Product & Design", location: "Bandung", costCenter: "CC-PRD-01", positionTitle: "UX Researcher", planType: "backfill", plannedHeadcount: 1, actualHeadcount: 0, budgetApproved: false, status: "pending_finance" }
];
const INITIAL_CANDIDATES = [
  { id: "cand-1", name: "Fajar Nugroho", email: "fajar.nugroho@mail.id", appliedPosition: "Backend Engineer (Go/TS)", source: "Career Portal", stage: "interview", aiRecommendationScore: 86, humanReviewerNote: "Kuat di arsitektur PostgreSQL & concurrency; lanjut wawancara user.", consentSigned: true },
  { id: "cand-2", name: "Maya Putri", email: "maya.putri@mail.id", appliedPosition: "Backend Engineer (Go/TS)", source: "LinkedIn API", stage: "offer", aiRecommendationScore: 91, humanReviewerNote: "Skor teknis sangat baik oleh panel interviewer.", consentSigned: true },
  { id: "cand-3", name: "Bagas Santoso", email: "bagas.santoso@mail.id", appliedPosition: "Fleet Driver & Field Ops", source: "Referral", stage: "screening", aiRecommendationScore: 72, humanReviewerNote: "Perlu verifikasi SIM B1 dan pengalaman rute Jawa Timur.", consentSigned: true }
];
const INITIAL_CLEARANCE_CASES = [
  {
    id: "clr-1",
    employeeName: "Aldo Ramadhan (Offboarding \u2014 Resign)",
    caseType: "resign",
    effectiveDate: "2026-11-30",
    items: [
      { id: "ci-1", team: "IT", task: "Pencabutan akses SSO, VPN & Email korporat pada tanggal efektif", completed: false, riskCritical: true },
      { id: "ci-2", team: "GA", task: "Inspeksi kondisi & pengembalian MacBook Pro + ID Card", completed: true },
      { id: "ci-3", team: "Finance", task: "Rekonsiliasi pinjaman & final settlement snapshot", completed: false },
      { id: "ci-4", team: "Manager", task: "Serah terima dokumentasi proyek & akses repository", completed: true }
    ]
  }
];
const INITIAL_PERFORMANCE_GOALS = [
  { id: "pg-1", employeeId: "emp-1", employeeName: "Raka Pratama", department: "Engineering", cycle: "H2 2026", title: "Peningkatan Reliabilitas API < 120ms P95", weightPercent: 40, progressPercent: 85, individualRating: 4.4, companyFundingFactor: 1.05, calibrationStatus: "manager_reviewed" },
  { id: "pg-2", employeeId: "emp-4", employeeName: "Clarissa Tan", department: "Product & Design", cycle: "H2 2026", title: "Audit Aksesibilitas WCAG 2.2 AA & Design Token", weightPercent: 50, progressPercent: 92, individualRating: 4.6, companyFundingFactor: 1.05, calibrationStatus: "calibrated" },
  { id: "pg-3", employeeId: "emp-5", employeeName: "Dimas Anggara", department: "Operations & GA", cycle: "H2 2026", title: "Kepatuhan Inspeksi Harian Armada Surabaya", weightPercent: 60, progressPercent: 78, individualRating: 4, companyFundingFactor: 1.05, calibrationStatus: "self_reviewed" }
];
const INITIAL_COURSES = [
  { id: "crs-1", title: "Keamanan Data & Isolasi Privasi Karyawan (UU PDP)", category: "Compliance Wajib", mandatory: true, durationMinutes: 45, enrolledCount: 200, completionRate: 94, myProgressPercent: 100 },
  { id: "crs-2", title: "Kepemimpinan & Kalibrasi Penilaian Objektif", category: "Leadership", mandatory: false, durationMinutes: 90, enrolledCount: 48, completionRate: 76, myProgressPercent: 65 },
  { id: "crs-3", title: "Keselamatan Berkendara & Inspeksi Armada", category: "Operations Safety", mandatory: true, durationMinutes: 60, enrolledCount: 35, completionRate: 88, myProgressPercent: 100 }
];
const INITIAL_VISITORS = [
  { id: "vis-1", visitorName: "Hendra Gunawan", company: "PT Mitra Bank Indonesia", hostName: "Bima Wijaya", purpose: "Rekonsiliasi API Disbursement", expectedExit: "15:30", status: "checked_in", badgeCode: "V-084" },
  { id: "vis-2", visitorName: "Siti Aminah", company: "Kantor Akuntan Publik", hostName: "Nadira Kusuma", purpose: "Audit Kepatuhan Payroll Q4", expectedExit: "17:00", status: "pre_registered", badgeCode: "V-085" }
];
const INITIAL_VEHICLES = [
  { id: "veh-1", plateNumber: "B 1924 KZN", vehicleModel: "Toyota Innova Zenix", driverName: "Dimas Anggara", odometerOut: 42180, odometerIn: null, status: "in_use", licenseExpiry: "2027-08-12" },
  { id: "veh-2", plateNumber: "L 1408 DX", vehicleModel: "Daihatsu GranMax Blind Van", driverName: "Taufik Hidayat", odometerOut: 68910, odometerIn: 68984, status: "available", licenseExpiry: "2026-12-05" }
];
const INITIAL_TICKETS = [
  {
    id: "tkt-1",
    subject: "Pertanyaan pemotongan PPh 21 TER bulan November",
    category: "payroll",
    channel: "in_app",
    requesterName: "Raka Pratama",
    isConfidential: false,
    status: "in_progress",
    slaHoursRemaining: 4,
    createdAt: "2026-11-17 09:15",
    publicReplies: [
      { sender: "Raka Pratama", message: "Halo tim Payroll, mohon info rincian dasar pengenaan TER untuk bonus proyek bulan ini.", time: "09:15" },
      { sender: "Bima Wijaya (HR Payroll)", message: "Halo Raka, sedang kami siapkan rincian perhitungannya ya.", time: "09:40" }
    ],
    internalNotes: [
      { agent: "Bima Wijaya", note: "[Internal Note] Cek konsolidasi masa pajak Nov dengan PTKP K/1 \u2014 jangan broadcast ke employee.", time: "09:35" }
    ]
  },
  {
    id: "tkt-2",
    subject: "Laporan Etik / Keluhan Lingkungan Kerja (Confidential)",
    category: "ethics_confidential",
    channel: "in_app",
    requesterName: "Confidential (Pseudonymous #P-402)",
    isConfidential: true,
    status: "open",
    slaHoursRemaining: 12,
    createdAt: "2026-11-16 18:10",
    publicReplies: [
      { sender: "Pelapor (Pseudonymous)", message: "Mohon peninjauan jadwal lembur berulang tanpa jeda istirahat yang memadai di divisi operasional.", time: "18:10" }
    ],
    internalNotes: [
      { agent: "Nadira Kusuma (HR Ethics)", note: "[Restricted] Identitas terlindung. Jadwalkan tinjauan roster tanpa mempublikasikan departemen/grade.", time: "19:00" }
    ]
  }
];
const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Batas Akhir Pengajuan Cuti & Koreksi Absensi Periode November 2026",
    body: "Mohon selesaikan seluruh persetujuan cuti dan koreksi absensi sebelum 22 November 2026 pukul 17:00 WIB sebelum lock payroll dijalankan.",
    targetAudience: "Semua Karyawan \xB7 Jakarta, Bandung, Surabaya",
    publishedAt: "2026-11-16",
    pinned: true,
    readCount: 184,
    totalTargetCount: 200,
    acknowledgedByMe: false
  },
  {
    id: "ann-2",
    title: "Kebijakan Baru: Tracking Lokasi Kontinu Dinonaktifkan Secara Default",
    body: "Sesuai pembaruan privasi FSD v0.1, aplikasi ESS hanya mencatat titik koordinat saat check-in/check-out dengan persetujuan pengguna.",
    targetAudience: "Semua Karyawan & Field Ops",
    publishedAt: "2026-11-12",
    pinned: false,
    readCount: 196,
    totalTargetCount: 200,
    acknowledgedByMe: true
  }
];
const INITIAL_AUDIT_LOGS = [
  { id: "aud-1", timestamp: "2026-11-17 08:30:12", actor: "Bima Wijaya", actorRole: "Payroll Maker", domain: "payroll", action: "TRANSITION_CALCULATED", target: "Payroll Run 2026-11", classification: "restricted" },
  { id: "aud-2", timestamp: "2026-11-16 14:20:05", actor: "Clarissa Tan", actorRole: "Employee", domain: "employee", action: "REQUEST_BANK_CHANGE", target: "PER-1004 (Pending Verification)", classification: "confidential" },
  { id: "aud-3", timestamp: "2026-11-16 10:04:41", actor: "Nadira Kusuma", actorRole: "HR Operations", domain: "leave", action: "APPROVE_LEAVE_REQUEST", target: "LR-2 (Raka Pratama \xB7 3 hari)", classification: "internal" },
  { id: "aud-4", timestamp: "2026-11-15 17:45:00", actor: "System Scheduler", actorRole: "System", domain: "security", action: "DOC_EXPIRY_ALERT_H7", target: "SIM A Operasional (Dimas Anggara)", classification: "internal" }
];
const MONTHLY_PAYROLL_CHART_DATA = [
  { month: "Jan", grossM: 94.2, employerCostM: 11.8 },
  { month: "Feb", grossM: 96, employerCostM: 12.1 },
  { month: "Mar", grossM: 102.5, employerCostM: 13.4 },
  { month: "Apr", grossM: 148, employerCostM: 18.2 },
  // THR spike
  { month: "Mei", grossM: 105.4, employerCostM: 13.8 },
  { month: "Jun", grossM: 108.1, employerCostM: 14 },
  { month: "Jul", grossM: 110.5, employerCostM: 14.3 },
  { month: "Agu", grossM: 112, employerCostM: 14.6 },
  { month: "Sep", grossM: 113.8, employerCostM: 14.9 },
  { month: "Okt", grossM: 115.8, employerCostM: 15.1 },
  { month: "Nov", grossM: 118.5, employerCostM: 15.6 },
  { month: "Des", grossM: 120, employerCostM: 15.9 }
];
export {
  AVATARS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE_SUMMARIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_BANK_REQUESTS,
  INITIAL_CANDIDATES,
  INITIAL_CLEARANCE_CASES,
  INITIAL_COURSES,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_LEDGER,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LOANS,
  INITIAL_MPP_PLANS,
  INITIAL_PAYROLL_RUNS,
  INITIAL_PERFORMANCE_GOALS,
  INITIAL_RAW_EVENTS,
  INITIAL_REIMBURSEMENTS,
  INITIAL_SHIFTS,
  INITIAL_TICKETS,
  INITIAL_TRAVEL_SETTLEMENTS,
  INITIAL_VEHICLES,
  INITIAL_VISITORS,
  LEGAL_ENTITIES,
  MONTHLY_PAYROLL_CHART_DATA,
  OFFICE_LOCATIONS
};
