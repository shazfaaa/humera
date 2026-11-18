/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import {
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
  INITIAL_VISITORS
} from "./data/seedData";
import { translations } from "./i18n/translations";
import { buildCsvContent, getNextPayrollStatus } from "./utils/hcmRules";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AdminDashboardView } from "./views/AdminDashboardView";
import { EmployeesOrgView } from "./views/EmployeesOrgView";
import { AttendanceLeaveView } from "./views/AttendanceLeaveView";
import { PayrollComplianceView } from "./views/PayrollComplianceView";
import { ExpenseTravelLoanView } from "./views/ExpenseTravelLoanView";
import { RecruitmentTalentView } from "./views/RecruitmentTalentView";
import { OperationsHelpdeskView } from "./views/OperationsHelpdeskView";
import { AccountSettingsView } from "./views/AccountSettingsView";
import { EssDashboardView } from "./views/EssDashboardView";
import {
  AddEmployeeModal,
  CreateAnnouncementModal,
  EmployeeDetailModal
} from "./components/Modals";
function triggerDownloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function App() {
  const [language, setLanguage] = useState("id");
  const [theme, setTheme] = useState("light");
  const [workspaceMode, setWorkspaceMode] = useState("admin");
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [activeEssTab, setActiveEssTab] = useState("ess_home");
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [bankRequests, setBankRequests] = useState(INITIAL_BANK_REQUESTS);
  const [rawEvents, setRawEvents] = useState(INITIAL_RAW_EVENTS);
  const [attendanceSummaries, setAttendanceSummaries] = useState(
    INITIAL_ATTENDANCE_SUMMARIES
  );
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [leaveLedger, setLeaveLedger] = useState(INITIAL_LEAVE_LEDGER);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [payrollRuns, setPayrollRuns] = useState(INITIAL_PAYROLL_RUNS);
  const [reimbursements, setReimbursements] = useState(
    INITIAL_REIMBURSEMENTS
  );
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [clearanceCases, setClearanceCases] = useState(INITIAL_CLEARANCE_CASES);
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [inspectedEmployee, setInspectedEmployee] = useState(null);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [createAnnOpen, setCreateAnnOpen] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  const t = translations[language];
  const adminEmployee = employees.find((e) => e.id === "emp-2") ?? employees[0];
  const essEmployee = employees.find((e) => e.id === "emp-1") ?? employees[0];
  const activePersona = workspaceMode === "admin" ? adminEmployee : essEmployee;
  const appendAudit = (domain, action, target, classification = "internal") => {
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
        actor: activePersona.person.fullName,
        actorRole: workspaceMode === "admin" ? "HR Operations" : "Employee",
        domain,
        action,
        target,
        classification
      },
      ...prev
    ]);
  };
  const handleExportEmployeesCsv = () => {
    const csv = buildCsvContent(
      ["NIK", "Nama", "Email", "Departemen", "Jabatan", "Hubungan Kerja", "Mode Kerja", "Lokasi"],
      employees.map((e) => [
        e.employment.employeeCode,
        e.person.fullName,
        e.person.email,
        e.assignment.department,
        e.assignment.roleTitle,
        e.employment.relationship,
        e.assignment.workMode,
        e.assignment.locationName
      ])
    );
    triggerDownloadCsv("humera-employees-2026.csv", csv);
    appendAudit("employee", "EXPORT_EMPLOYEE_DIRECTORY", `${employees.length} records`, "confidential");
  };
  const handleAddEmployee = (payload) => {
    const newId = `emp-${Date.now()}`;
    const code = `NKD-0${employees.length + 120}`;
    const newEmp = {
      id: newId,
      person: {
        personId: `PER-10${employees.length + 10}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: "+62 812-0000-0000",
        bio: `${payload.roleTitle} \xB7 ${payload.department}`,
        avatarUrl: "",
        country: "Indonesia",
        cityState: "Jakarta Selatan, DKI Jakarta",
        postalCode: "12190",
        npwp: "00.000.000.0-000.000",
        ptkpStatus: "TK/0",
        emergencyContactName: "Belum diisi",
        emergencyContactRelation: "Keluarga",
        emergencyContactPhone: "-",
        bankName: "Bank Mandiri",
        bankAccountNumber: "Menunggu verifikasi",
        bankAccountHolder: payload.fullName
      },
      employment: {
        employmentId: `EMP-2026-${employees.length + 10}`,
        employeeCode: code,
        legalEntityId: "le-1",
        relationship: payload.relationship,
        timeCapacity: "full_time",
        paymentBasis: "monthly",
        schedulePattern: "Senin\u2013Jumat (09:00\u201318:00 WIB)",
        joinDate: "2026-11-17",
        status: "active",
        baseSalary: payload.baseSalary,
        allowances: 15e5
      },
      assignment: {
        assignmentId: `ASG-${employees.length + 900}`,
        department: payload.department,
        costCenter: "CC-GEN-01",
        roleTitle: payload.roleTitle,
        grade: "L4",
        locationId: "loc-jkt",
        locationName: "Jakarta HQ (Sudirman)",
        workMode: payload.workMode,
        managerName: "Nadira Kusuma",
        effectiveDate: "2026-11-17"
      },
      history: [],
      documents: [],
      performanceBreakdown: { taskCompleted: 10, presence: 10, completedMeeting: 8 }
    };
    setEmployees((prev) => [newEmp, ...prev]);
    appendAudit("employee", "CREATE_EMPLOYMENT", `${payload.fullName} (${code})`, "confidential");
  };
  const handleUpdatePersonalInfo = (empId, updates) => {
    setEmployees(
      (prev) => prev.map(
        (e) => e.id === empId ? {
          ...e,
          person: {
            ...e.person,
            phone: updates.phone,
            bio: updates.bio,
            cityState: updates.cityState,
            postalCode: updates.postalCode,
            emergencyContactName: updates.emergencyContactName,
            emergencyContactPhone: updates.emergencyContactPhone
          }
        } : e
      )
    );
    appendAudit("employee", "UPDATE_PERSONAL_PROFILE", empId, "internal");
  };
  const handleRequestBankChange = (emp, payload) => {
    const req = {
      id: `bcr-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.person.fullName,
      oldBankName: emp.person.bankName,
      oldAccountNumber: emp.person.bankAccountNumber,
      newBankName: payload.newBankName,
      newAccountNumber: payload.newAccountNumber,
      newAccountHolder: payload.newAccountHolder,
      requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
      requestedBy: emp.person.fullName,
      status: "pending_verification",
      reason: payload.reason
    };
    setBankRequests((prev) => [req, ...prev]);
    appendAudit("employee", "REQUEST_BANK_CHANGE", `${emp.person.fullName} (Pending Verification)`, "restricted");
  };
  const handleApproveBankChange = (requestId, approved) => {
    const target = bankRequests.find((r) => r.id === requestId);
    if (!target) return;
    setBankRequests(
      (prev) => prev.map(
        (r) => r.id === requestId ? {
          ...r,
          status: approved ? "approved" : "rejected",
          reviewedBy: activePersona.person.fullName,
          reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : r
      )
    );
    if (approved) {
      setEmployees(
        (prev) => prev.map(
          (e) => e.id === target.employeeId ? {
            ...e,
            person: {
              ...e.person,
              bankName: target.newBankName,
              bankAccountNumber: target.newAccountNumber,
              bankAccountHolder: target.newAccountHolder
            },
            history: [
              {
                id: `his-${Date.now()}`,
                effectiveDate: "2026-11-17",
                category: "bank_change",
                summary: "Perubahan Rekening Payroll Terverifikasi",
                oldValue: `${target.oldBankName} (${target.oldAccountNumber})`,
                newValue: `${target.newBankName} (${target.newAccountNumber})`,
                actor: activePersona.person.fullName,
                reason: target.reason
              },
              ...e.history
            ]
          } : e
        )
      );
    }
    appendAudit(
      "employee",
      approved ? "APPROVE_BANK_CHANGE" : "REJECT_BANK_CHANGE",
      target.employeeName,
      "restricted"
    );
  };
  const handleEssCheckInOut = (eventType, workMode) => {
    const now = /* @__PURE__ */ new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newEvt = {
      id: `evt-${Date.now()}`,
      employeeId: essEmployee.id,
      employeeName: essEmployee.person.fullName,
      eventType,
      deviceTime: `2026-11-17T${timeStr}:00+07:00`,
      serverTime: `2026-11-17T${timeStr}:01+07:00`,
      timezone: "Asia/Jakarta",
      source: "web",
      workMode,
      locationName: workMode === "WFH" ? "Registered Home Location" : essEmployee.assignment.locationName,
      gpsAccuracyMeters: 12,
      verificationStatus: workMode === "field" ? "pending_approval" : "verified"
    };
    setRawEvents((prev) => [newEvt, ...prev]);
    setAttendanceSummaries((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.employeeId === essEmployee.id && s.date === "2026-11-17"
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          checkOutTime: eventType === "check_out" ? timeStr : next[existingIdx].checkOutTime,
          checkInTime: eventType === "check_in" ? timeStr : next[existingIdx].checkInTime,
          workMode,
          status: workMode === "WFH" ? "wfh" : workMode === "field" ? "field_work" : "on_time"
        };
        return next;
      }
      return prev;
    });
    appendAudit("attendance", eventType.toUpperCase(), `${essEmployee.person.fullName} (${workMode})`);
  };
  const handleResolveUnknownAttendance = (summaryId, checkOutTime) => {
    setAttendanceSummaries(
      (prev) => prev.map(
        (s) => s.id === summaryId ? {
          ...s,
          checkOutTime,
          status: "on_time",
          exceptionNote: `Dikoreksi oleh ${activePersona.person.fullName}`
        } : s
      )
    );
    appendAudit("attendance", "RESOLVE_MISSING_CHECKOUT", summaryId);
  };
  const handleSubmitLeave = (payload) => {
    const emp = activePersona;
    const newReq = {
      id: `lr-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.person.fullName,
      department: emp.assignment.department,
      leaveType: payload.leaveType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days: payload.days,
      reason: payload.reason,
      status: "pending",
      submittedAt: "2026-11-17"
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    appendAudit("leave", "SUBMIT_LEAVE_REQUEST", `${emp.person.fullName} (${payload.days} hari)`);
  };
  const handleApproveLeave = (requestId, approved) => {
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return;
    setLeaveRequests(
      (prev) => prev.map(
        (r) => r.id === requestId ? {
          ...r,
          status: approved ? "approved" : "rejected",
          approverName: activePersona.person.fullName
        } : r
      )
    );
    if (approved && target.leaveType === "annual") {
      setLeaveLedger((prev) => [
        {
          id: `ll-${Date.now()}`,
          employeeId: target.employeeId,
          date: target.startDate,
          type: "usage",
          days: -target.days,
          note: `Penggunaan cuti disetujui (${target.reason})`,
          referenceId: target.id
        },
        ...prev
      ]);
    }
    appendAudit("leave", approved ? "APPROVE_LEAVE" : "REJECT_LEAVE", target.employeeName);
  };
  const handleAdvancePayrollRun = (runId, actorName) => {
    setPayrollRuns(
      (prev) => prev.map((run) => {
        if (run.id !== runId) return run;
        const nextStatus = getNextPayrollStatus(run.status);
        if (!nextStatus) return run;
        return {
          ...run,
          status: nextStatus,
          checkerName: nextStatus === "reviewed" ? actorName : run.checkerName,
          approverName: nextStatus === "approved" ? actorName : run.approverName,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      })
    );
    appendAudit("payroll", "ADVANCE_PAYROLL_STATE", runId, "restricted");
  };
  const handleExportPayrollCsv = (run) => {
    const csv = buildCsvContent(
      ["NIK", "Nama", "PTKP", "Gaji Pokok", "Tunjangan+Lembur", "BPJS Karyawan", "PPh 21 TER", "Net Pay"],
      run.lines.map((l) => [
        l.employeeCode,
        l.employeeName,
        l.ptkpStatus,
        l.baseSalary,
        l.allowances + l.overtimeApprovedPay,
        l.bpjsEmployee,
        l.pph21Ter,
        l.netPay
      ])
    );
    triggerDownloadCsv(`humera-payroll-${run.periodCode}.csv`, csv);
    appendAudit("payroll", "EXPORT_PAYROLL_REPORT", run.periodLabel, "restricted");
  };
  const handlePublishAnnouncement = (payload) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      targetAudience: payload.targetAudience,
      publishedAt: "2026-11-17",
      pinned: true,
      readCount: 1,
      totalTargetCount: 200,
      acknowledgedByMe: true
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    appendAudit("employee", "PUBLISH_ANNOUNCEMENT", payload.title);
  };
  const adminTitleMap = {
    dashboard: t.navDashboard,
    employees: t.navEmployees,
    recruitment: t.navRecruitment,
    attendance: t.navAttendance,
    leave: t.navLeave,
    payroll: t.navPayroll,
    expense: t.navExpense,
    performance: t.navPerformance,
    operations: t.navOperationsOps,
    settings: t.navSettings
  };
  const essTitleMap = {
    ess_home: t.essHome,
    ess_attendance: t.essAttendance,
    ess_leave: t.essLeave,
    ess_payroll: t.essPayroll,
    ess_expense: t.essExpense,
    ess_performance: t.essPerformance,
    ess_helpdesk: t.essHelpdesk,
    ess_profile: t.essProfile
  };
  const pageTitle = workspaceMode === "admin" ? adminTitleMap[activeAdminTab] : essTitleMap[activeEssTab];
  const unreadNotifications = [
    ...bankRequests.some((b) => b.status === "pending_verification") ? [{ id: "n1", title: "1 pengajuan perubahan rekening menunggu verifikasi HR/Finance", time: "Baru saja" }] : [],
    { id: "n2", title: "Sertifikat / SIM operasional mendekati batas H-30", time: "Hari ini \xB7 08:00 WIB" },
    { id: "n3", title: `Payroll Run ${payrollRuns[0]?.periodLabel} berstatus ${payrollRuns[0]?.status}`, time: "Hari ini \xB7 08:30 WIB" }
  ];
  return <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
    workspaceMode={workspaceMode}
    onChangeWorkspaceMode={setWorkspaceMode}
    activeAdminTab={activeAdminTab}
    onSelectAdminTab={setActiveAdminTab}
    activeEssTab={activeEssTab}
    onSelectEssTab={setActiveEssTab}
    language={language}
    currentUser={{
      name: activePersona.person.fullName,
      role: workspaceMode === "admin" ? "HR Operations Director" : activePersona.assignment.roleTitle,
      email: activePersona.person.email,
      avatarUrl: activePersona.person.avatarUrl
    }}
    latestAnnouncement={announcements[0]}
    onOpenAnnouncements={() => {
      if (workspaceMode === "admin") {
        setCreateAnnOpen(true);
      } else {
        setActiveEssTab("ess_helpdesk");
      }
    }}
    mobileOpen={mobileMenuOpen}
    onCloseMobile={() => setMobileMenuOpen(false)}
  />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
    pageTitle={pageTitle}
    breadcrumbParent={workspaceMode === "admin" ? t.adminWorkspace : t.essWorkspace}
    searchQuery={globalSearch}
    onSearchChange={setGlobalSearch}
    language={language}
    onChangeLanguage={setLanguage}
    theme={theme}
    onToggleTheme={() => setTheme((prev) => prev === "light" ? "dark" : "light")}
    workspaceMode={workspaceMode}
    unreadNotifications={unreadNotifications}
    primaryActionLabel={workspaceMode === "admin" ? t.inviteEmployee : t.submitLeave}
    onPrimaryAction={() => {
      if (workspaceMode === "admin") {
        setAddEmployeeOpen(true);
      } else {
        setActiveEssTab("ess_leave");
      }
    }}
    secondaryActionLabel={workspaceMode === "admin" ? t.exportData : void 0}
    onSecondaryAction={workspaceMode === "admin" ? handleExportEmployeesCsv : void 0}
    onOpenMobileMenu={() => setMobileMenuOpen(true)}
  />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          {workspaceMode === "admin" ? <>
              {activeAdminTab === "dashboard" && <AdminDashboardView
    language={language}
    adminName={adminEmployee.person.fullName}
    employees={employees}
    attendanceSummaries={attendanceSummaries}
    globalSearch={globalSearch}
    onSelectEmployee={setInspectedEmployee}
    onExportEmployeesCsv={handleExportEmployeesCsv}
    onNavigateTab={(tab) => setActiveAdminTab(tab)}
  />}

              {activeAdminTab === "employees" && <EmployeesOrgView
    language={language}
    employees={employees}
    bankChangeRequests={bankRequests}
    onSelectEmployee={setInspectedEmployee}
    onOpenAddEmployee={() => setAddEmployeeOpen(true)}
    onApproveBankChange={handleApproveBankChange}
  />}

              {activeAdminTab === "recruitment" && <RecruitmentTalentView
    language={language}
    mode="recruitment"
    isEssMode={false}
    mppPlans={INITIAL_MPP_PLANS}
    candidates={candidates}
    clearanceCases={clearanceCases}
    performanceGoals={INITIAL_PERFORMANCE_GOALS}
    courses={INITIAL_COURSES}
    onAdvanceCandidateStage={(id) => {
      const order = [
        "screening",
        "interview",
        "assessment",
        "offer",
        "hired"
      ];
      setCandidates(
        (prev) => prev.map((c) => {
          if (c.id !== id) return c;
          const next = order[Math.min(order.indexOf(c.stage) + 1, order.length - 1)];
          return { ...c, stage: next };
        })
      );
    }}
    onToggleClearanceItem={(caseId, itemId) => setClearanceCases(
      (prev) => prev.map(
        (c) => c.id === caseId ? {
          ...c,
          items: c.items.map(
            (it) => it.id === itemId ? { ...it, completed: !it.completed } : it
          )
        } : c
      )
    )}
  />}

              {(activeAdminTab === "attendance" || activeAdminTab === "leave") && <AttendanceLeaveView
    key={activeAdminTab}
    language={language}
    initialSection={activeAdminTab}
    isEssMode={false}
    currentEmployee={activePersona}
    summaries={attendanceSummaries}
    rawEvents={rawEvents}
    shifts={shifts}
    leaveLedger={leaveLedger}
    leaveRequests={leaveRequests}
    onSubmitLeave={handleSubmitLeave}
    onApproveLeave={handleApproveLeave}
    onResolveUnknownAttendance={handleResolveUnknownAttendance}
    onRequestShiftSwap={(shiftId) => setShifts(
      (prev) => prev.map(
        (s) => s.id === shiftId ? { ...s, swapStatus: "swap_requested" } : s
      )
    )}
  />}

              {activeAdminTab === "payroll" && <PayrollComplianceView
    language={language}
    isEssMode={false}
    currentEmployeeId={activePersona.id}
    payrollRuns={payrollRuns}
    onAdvancePayrollRun={handleAdvancePayrollRun}
    onExportPayrollCsv={handleExportPayrollCsv}
  />}

              {activeAdminTab === "expense" && <ExpenseTravelLoanView
    language={language}
    isEssMode={false}
    currentEmployee={activePersona}
    reimbursements={reimbursements}
    travelSettlements={INITIAL_TRAVEL_SETTLEMENTS}
    loans={INITIAL_LOANS}
    onSubmitReimbursement={(payload) => setReimbursements((prev) => [
      {
        id: `rb-${Date.now()}`,
        employeeId: activePersona.id,
        employeeName: activePersona.person.fullName,
        costCenter: activePersona.assignment.costCenter,
        date: "2026-11-17",
        status: "pending",
        ...payload
      },
      ...prev
    ])}
    onApproveReimbursement={(id, approved) => setReimbursements(
      (prev) => prev.map(
        (r) => r.id === id ? { ...r, status: approved ? "approved" : "rejected" } : r
      )
    )}
  />}

              {activeAdminTab === "performance" && <RecruitmentTalentView
    language={language}
    mode="performance"
    isEssMode={false}
    mppPlans={INITIAL_MPP_PLANS}
    candidates={candidates}
    clearanceCases={clearanceCases}
    performanceGoals={INITIAL_PERFORMANCE_GOALS}
    courses={INITIAL_COURSES}
    onAdvanceCandidateStage={() => {
    }}
    onToggleClearanceItem={() => {
    }}
  />}

              {activeAdminTab === "operations" && <OperationsHelpdeskView
    language={language}
    isEssMode={false}
    currentUserName={activePersona.person.fullName}
    visitors={visitors}
    vehicles={INITIAL_VEHICLES}
    tickets={tickets}
    announcements={announcements}
    onAdmitVisitor={(id) => setVisitors(
      (prev) => prev.map((v) => v.id === id ? { ...v, status: "checked_in" } : v)
    )}
    onReplyTicket={(ticketId, message, isInternalNote) => setTickets(
      (prev) => prev.map((tkt) => {
        if (tkt.id !== ticketId) return tkt;
        if (isInternalNote) {
          return {
            ...tkt,
            internalNotes: [
              ...tkt.internalNotes,
              { agent: activePersona.person.fullName, note: message, time: "Baru saja" }
            ]
          };
        }
        return {
          ...tkt,
          publicReplies: [
            ...tkt.publicReplies,
            { sender: `${activePersona.person.fullName} (HR)`, message, time: "Baru saja" }
          ]
        };
      })
    )}
    onCreateTicket={(payload) => setTickets((prev) => [
      {
        id: `tkt-${Date.now()}`,
        subject: payload.subject,
        category: payload.category,
        channel: "in_app",
        requesterName: payload.isConfidential ? "Confidential (Pseudonymous)" : activePersona.person.fullName,
        isConfidential: payload.isConfidential,
        status: "open",
        slaHoursRemaining: 24,
        createdAt: "2026-11-17",
        publicReplies: [
          {
            sender: payload.isConfidential ? "Pelapor" : activePersona.person.fullName,
            message: payload.message,
            time: "Baru saja"
          }
        ],
        internalNotes: []
      },
      ...prev
    ])}
    onOpenCreateAnnouncement={() => setCreateAnnOpen(true)}
    onAcknowledgeAnnouncement={() => {
    }}
  />}

              {activeAdminTab === "settings" && <AccountSettingsView
    language={language}
    employee={adminEmployee}
    isAdminContext={true}
    bankChangeRequests={bankRequests}
    auditLogs={auditLogs}
    onUpdatePersonalInfo={(u) => handleUpdatePersonalInfo(adminEmployee.id, u)}
    onRequestBankChange={(p) => handleRequestBankChange(adminEmployee, p)}
  />}
            </> : <>
              {activeEssTab === "ess_home" && <EssDashboardView
    language={language}
    employee={essEmployee}
    rawEvents={rawEvents}
    leaveLedger={leaveLedger}
    leaveRequests={leaveRequests}
    latestPayrollRun={payrollRuns[0]}
    announcements={announcements}
    onCheckInOut={handleEssCheckInOut}
    onAcknowledgeAnnouncement={(id) => setAnnouncements(
      (prev) => prev.map(
        (a) => a.id === id ? { ...a, acknowledgedByMe: true, readCount: a.readCount + 1 } : a
      )
    )}
    onNavigateEssTab={(tab) => setActiveEssTab(tab)}
  />}

              {(activeEssTab === "ess_attendance" || activeEssTab === "ess_leave") && <AttendanceLeaveView
    key={activeEssTab}
    language={language}
    initialSection={activeEssTab === "ess_leave" ? "leave" : "attendance"}
    isEssMode={true}
    currentEmployee={essEmployee}
    summaries={attendanceSummaries}
    rawEvents={rawEvents}
    shifts={shifts}
    leaveLedger={leaveLedger}
    leaveRequests={leaveRequests}
    onSubmitLeave={handleSubmitLeave}
    onApproveLeave={handleApproveLeave}
    onResolveUnknownAttendance={handleResolveUnknownAttendance}
    onRequestShiftSwap={(shiftId) => setShifts(
      (prev) => prev.map(
        (s) => s.id === shiftId ? { ...s, swapStatus: "swap_requested" } : s
      )
    )}
  />}

              {activeEssTab === "ess_payroll" && <PayrollComplianceView
    language={language}
    isEssMode={true}
    currentEmployeeId={essEmployee.id}
    payrollRuns={payrollRuns}
    onAdvancePayrollRun={handleAdvancePayrollRun}
    onExportPayrollCsv={handleExportPayrollCsv}
  />}

              {activeEssTab === "ess_expense" && <ExpenseTravelLoanView
    language={language}
    isEssMode={true}
    currentEmployee={essEmployee}
    reimbursements={reimbursements}
    travelSettlements={INITIAL_TRAVEL_SETTLEMENTS}
    loans={INITIAL_LOANS}
    onSubmitReimbursement={(payload) => setReimbursements((prev) => [
      {
        id: `rb-${Date.now()}`,
        employeeId: essEmployee.id,
        employeeName: essEmployee.person.fullName,
        costCenter: essEmployee.assignment.costCenter,
        date: "2026-11-17",
        status: "pending",
        ...payload
      },
      ...prev
    ])}
    onApproveReimbursement={() => {
    }}
  />}

              {activeEssTab === "ess_performance" && <RecruitmentTalentView
    language={language}
    mode="performance"
    isEssMode={true}
    mppPlans={INITIAL_MPP_PLANS}
    candidates={candidates}
    clearanceCases={clearanceCases}
    performanceGoals={INITIAL_PERFORMANCE_GOALS.filter(
      (g) => g.employeeId === essEmployee.id
    )}
    courses={INITIAL_COURSES}
    onAdvanceCandidateStage={() => {
    }}
    onToggleClearanceItem={() => {
    }}
  />}

              {activeEssTab === "ess_helpdesk" && <OperationsHelpdeskView
    language={language}
    isEssMode={true}
    currentUserName={essEmployee.person.fullName}
    visitors={visitors}
    vehicles={INITIAL_VEHICLES}
    tickets={tickets}
    announcements={announcements}
    onAdmitVisitor={() => {
    }}
    onReplyTicket={(ticketId, message) => setTickets(
      (prev) => prev.map(
        (tkt) => tkt.id === ticketId ? {
          ...tkt,
          publicReplies: [
            ...tkt.publicReplies,
            { sender: essEmployee.person.fullName, message, time: "Baru saja" }
          ]
        } : tkt
      )
    )}
    onCreateTicket={(payload) => setTickets((prev) => [
      {
        id: `tkt-${Date.now()}`,
        subject: payload.subject,
        category: payload.category,
        channel: "in_app",
        requesterName: payload.isConfidential ? "Confidential (Pseudonymous)" : essEmployee.person.fullName,
        isConfidential: payload.isConfidential,
        status: "open",
        slaHoursRemaining: 24,
        createdAt: "2026-11-17",
        publicReplies: [
          {
            sender: payload.isConfidential ? "Pelapor" : essEmployee.person.fullName,
            message: payload.message,
            time: "Baru saja"
          }
        ],
        internalNotes: []
      },
      ...prev
    ])}
    onOpenCreateAnnouncement={() => {
    }}
    onAcknowledgeAnnouncement={(id) => setAnnouncements(
      (prev) => prev.map(
        (a) => a.id === id ? { ...a, acknowledgedByMe: true, readCount: a.readCount + 1 } : a
      )
    )}
  />}

              {activeEssTab === "ess_profile" && <AccountSettingsView
    language={language}
    employee={essEmployee}
    isAdminContext={false}
    bankChangeRequests={bankRequests}
    auditLogs={auditLogs}
    onUpdatePersonalInfo={(u) => handleUpdatePersonalInfo(essEmployee.id, u)}
    onRequestBankChange={(p) => handleRequestBankChange(essEmployee, p)}
  />}
            </>}
        </main>
      </div>

      {
    /* Overlays */
  }
      <EmployeeDetailModal
    employee={inspectedEmployee}
    onClose={() => setInspectedEmployee(null)}
  />
      <AddEmployeeModal
    open={addEmployeeOpen}
    onClose={() => setAddEmployeeOpen(false)}
    onAdd={handleAddEmployee}
  />
      <CreateAnnouncementModal
    open={createAnnOpen}
    onClose={() => setCreateAnnOpen(false)}
    onPublish={handlePublishAnnouncement}
  />
    </div>;
}
export {
  App as default
};
