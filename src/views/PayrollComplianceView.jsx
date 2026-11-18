import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  Lock,
  ShieldCheck
} from "lucide-react";
import { translations } from "../i18n/translations";
import { canTransitionPayrollRun, formatIDR } from "../utils/hcmRules";
const ORDERED_STAGES = [
  "draft",
  "input_locked",
  "calculated",
  "reviewed",
  "approved",
  "payment_prepared",
  "reconciled"
];
function PayrollComplianceView({
  language,
  isEssMode,
  currentEmployeeId,
  payrollRuns,
  onAdvancePayrollRun,
  onExportPayrollCsv
}) {
  const t = translations[language];
  const [selectedRunId, setSelectedRunId] = useState(payrollRuns[0]?.id ?? "");
  const [activeOperator, setActiveOperator] = useState({
    name: "Bima Wijaya",
    role: "payroll_maker"
  });
  const [transitionError, setTransitionError] = useState("");
  const [exportNotice, setExportNotice] = useState("");
  const selectedRun = payrollRuns.find((r) => r.id === selectedRunId) ?? payrollRuns[0];
  if (!selectedRun) return null;
  const visibleLines = isEssMode ? selectedRun.lines.filter((l) => l.employeeId === currentEmployeeId) : selectedRun.lines;
  const checkResult = canTransitionPayrollRun({
    currentStatus: selectedRun.status,
    makerName: selectedRun.makerName,
    actorName: activeOperator.name,
    actorRole: activeOperator.role
  });
  const handleAdvance = () => {
    if (!checkResult.allowed) {
      setTransitionError(
        checkResult.reasonKey === "self_approval_forbidden" ? t.selfApprovalBlocked : checkResult.reasonKey === "checker_role_required" ? "Tahap persetujuan akhir membutuhkan peran Payroll Checker." : "Payroll run sudah final (reconciled)."
      );
      return;
    }
    setTransitionError("");
    onAdvancePayrollRun(selectedRun.id, activeOperator.name, activeOperator.role);
  };
  return <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {isEssMode ? "Slip Gaji, PPh 21 & Bukti Potong 1721-A1" : "Payroll Run, PPh 21 TER, BPJS & Rekonsiliasi"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEssMode ? "Akses riwayat gaji pribadi dan unduh rincian pajak tahunan." : "Run final bersifat immutable; pemisahan tugas Maker-Checker mencegah self-approval."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
    aria-label="Pilih periode payroll"
    value={selectedRun.id}
    onChange={(e) => {
      setSelectedRunId(e.target.value);
      setTransitionError("");
    }}
    className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
  >
            {payrollRuns.map((run) => <option key={run.id} value={run.id}>
                {run.periodLabel} ({run.status})
              </option>)}
          </select>

          <button
    type="button"
    onClick={() => {
      onExportPayrollCsv(selectedRun);
      setExportNotice(
        isEssMode ? `Ringkasan slip gaji ${selectedRun.periodLabel} siap diunduh.` : `Ekspor CSV & format e-Bupot/SIPP ${selectedRun.periodLabel} dicatat ke Audit Log.`
      );
    }}
    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
  >
            <Download className="w-3.5 h-3.5" />
            <span>{isEssMode ? "Unduh Ringkasan" : "Ekspor e-Bupot / CSV"}</span>
          </button>
        </div>
      </div>

      {exportNotice && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span>{exportNotice}</span>
          <button
    type="button"
    onClick={() => setExportNotice("")}
    className="text-xs underline font-medium"
  >
            Tutup
          </button>
        </div>}

      {
    /* Admin Maker-Checker & State Machine Bar */
  }
      {!isEssMode && <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>State Machine &amp; Maker-Checker Control</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maker: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRun.makerName}</span> ·{" "}
                Checker: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRun.checkerName ?? "Menunggu Review"}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <label className="text-xs text-slate-500">Aktor Aktif:</label>
              <select
    aria-label="Simulasi aktor payroll"
    value={activeOperator.name}
    onChange={(e) => {
      const name = e.target.value;
      setTransitionError("");
      setActiveOperator(
        name === "Bima Wijaya" ? { name: "Bima Wijaya", role: "payroll_maker" } : { name: "Nadira Kusuma", role: "payroll_checker" }
      );
    }}
    className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
  >
                <option value="Bima Wijaya">Bima Wijaya (Payroll Maker)</option>
                <option value="Nadira Kusuma">Nadira Kusuma (Payroll Checker)</option>
              </select>

              {selectedRun.status !== "reconciled" ? <button
    type="button"
    onClick={handleAdvance}
    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
  >
                  <span>Lanjut ke {checkResult.nextStatus}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  Final &amp; Immutable
                </span>}
            </div>
          </div>

          {transitionError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{transitionError}</span>
            </div>}

          {
    /* 7-step State Machine Stepper */
  }
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {ORDERED_STAGES.map((stage, idx) => {
    const currentIdx = ORDERED_STAGES.indexOf(selectedRun.status);
    const done = idx < currentIdx;
    const active = idx === currentIdx;
    return <div
      key={stage}
      className={`px-2.5 py-2 rounded-lg border text-[11px] font-mono text-center ${active ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold" : done ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-400"}`}
    >
                  {stage}
                </div>;
  })}
          </div>
        </div>}

      {
    /* Summary KPI Row */
  }
      {!isEssMode && <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
    { label: "Total Gross Payroll", val: formatIDR(selectedRun.totalGross) },
    { label: "Biaya Perusahaan (BPJS)", val: formatIDR(selectedRun.totalEmployerCost) },
    { label: "Total PPh 21 (TER)", val: formatIDR(selectedRun.totalTaxPph21) },
    { label: "Total Net Disbursement", val: formatIDR(selectedRun.totalNetPay) }
  ].map((kpi) => <div
    key={kpi.label}
    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
  >
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.label}</div>
              <div className="text-lg font-display font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {kpi.val}
              </div>
            </div>)}
        </div>}

      {
    /* Payroll Breakdown Table */
  }
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4">Karyawan</th>
              <th className="py-3 px-4">PTKP · Status</th>
              <th className="py-3 px-4 text-right">Gaji Pokok</th>
              <th className="py-3 px-4 text-right">Tunjangan + Lembur</th>
              <th className="py-3 px-4 text-right">BPJS Karyawan</th>
              <th className="py-3 px-4 text-right">PPh 21 TER</th>
              <th className="py-3 px-4 text-right">Pot. Pinjaman</th>
              <th className="py-3 px-4 text-right">Take-Home Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
            {visibleLines.map((line) => <tr key={line.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {line.employeeName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {line.employeeCode} · {line.department}
                  </div>
                </td>
                <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                  {line.ptkpStatus} · {line.relationship}
                </td>
                <td className="py-3 px-4 text-right text-slate-800 dark:text-slate-200">
                  {formatIDR(line.baseSalary)}
                </td>
                <td className="py-3 px-4 text-right text-slate-800 dark:text-slate-200">
                  {formatIDR(line.allowances + line.overtimeApprovedPay)}
                </td>
                <td className="py-3 px-4 text-right text-amber-700 dark:text-amber-400">
                  -{formatIDR(line.bpjsEmployee)}
                </td>
                <td className="py-3 px-4 text-right text-amber-700 dark:text-amber-400">
                  -{formatIDR(line.pph21Ter)}
                </td>
                <td className="py-3 px-4 text-right text-slate-500">
                  {line.loanDeduction > 0 ? `-${formatIDR(line.loanDeduction)}` : "\u2014"}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatIDR(line.netPay)}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {
    /* Compliance Footer Note (FSD Rule 3 & 4) */
  }
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Catatan Kepatuhan Pajak &amp; BPJS:</span>{" "}
          SIPP digunakan khusus untuk pelaporan BPJS Ketenagakerjaan (bukan pelaporan pajak DJP). Bukti potong resmi 1721-A1/e-Bupot mengikuti format tervalidasi yang disahkan ahli pajak.
        </div>
      </div>
    </div>;
}
export {
  PayrollComplianceView
};
