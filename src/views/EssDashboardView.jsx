import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  Megaphone,
  Sparkles
} from "lucide-react";
import { translations } from "../i18n/translations";
import { calculateLeaveBalance, formatIDR } from "../utils/hcmRules";
function EssDashboardView({
  language,
  employee,
  rawEvents,
  leaveLedger,
  leaveRequests,
  latestPayrollRun,
  announcements,
  onCheckInOut,
  onAcknowledgeAnnouncement,
  onNavigateEssTab
}) {
  const t = translations[language];
  const [selectedMode, setSelectedMode] = useState(employee.assignment.workMode);
  const [pinInput, setPinInput] = useState("");
  const [payslipUnlocked, setPayslipUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");
  const myEvents = rawEvents.filter((e) => e.employeeId === employee.id);
  const lastEvent = myEvents[0];
  const isCheckedIn = lastEvent?.eventType === "check_in";
  const myLedger = leaveLedger.filter((l) => l.employeeId === employee.id);
  const availableLeave = calculateLeaveBalance(myLedger);
  const myRequests = leaveRequests.filter((r) => r.employeeId === employee.id);
  const myPayLine = latestPayrollRun?.lines.find((l) => l.employeeId === employee.id);
  const handleUnlockPayslip = (e) => {
    e.preventDefault();
    if (pinInput === "1234") {
      setPayslipUnlocked(true);
      setPinError("");
    } else {
      setPinError(
        language === "id" ? "PIN salah (gunakan PIN demo: 1234)" : "Invalid PIN (demo PIN: 1234)"
      );
    }
  };
  return <div className="space-y-6">
      {
    /* Personal Greeting */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            {t.goodMorning}, {employee.person.fullName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {employee.assignment.roleTitle} · {employee.assignment.department} ·{" "}
            {employee.assignment.locationName}
          </p>
        </div>

        <button
    type="button"
    onClick={() => onNavigateEssTab("ess_leave")}
    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
  >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{t.submitLeave}</span>
        </button>
      </div>

      {
    /* Top Row: Clock-In/Out + Leave Balance + Latest Payslip */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {
    /* Card 1: Check-In / Check-Out (FSD Rule 14: No continuous GPS tracking) */
  }
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {language === "id" ? "Presensi Harian" : "Daily Attendance"}
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Asia/Jakarta
              </span>
            </div>

            <div className="mb-4">
              <label
    htmlFor="ess-work-mode"
    className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5"
  >
                {language === "id" ? "Mode Lokasi Kerja" : "Work Location Mode"}
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {["WFO", "WFH", "hybrid", "field"].map((mode) => <button
    key={mode}
    type="button"
    onClick={() => setSelectedMode(mode)}
    className={`py-1.5 text-[11px] font-semibold rounded-md transition-colors ${selectedMode === mode ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
  >
                    {mode}
                  </button>)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>
                  {lastEvent ? `Event terakhir: ${lastEvent.eventType === "check_in" ? "Check-In" : "Check-Out"} (${lastEvent.workMode})` : "Belum ada event hari ini"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                {lastEvent ? `${lastEvent.locationName} \xB7 ${lastEvent.deviceTime.slice(11, 16)} WIB` : "Tracking lokasi kontinu nonaktif secara default (privasi terjaga)."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
    type="button"
    onClick={() => onCheckInOut(isCheckedIn ? "check_out" : "check_in", selectedMode)}
    className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-colors ${isCheckedIn ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
  >
              {isCheckedIn ? t.checkOut : t.checkIn}
            </button>
          </div>
        </div>

        {
    /* Card 2: Immutable Leave Balance Ledger */
  }
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.leaveBalance}
              </h3>
              <button
    type="button"
    onClick={() => onNavigateEssTab("ess_leave")}
    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
  >
                Ledger →
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
                {availableLeave}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.daysRemaining}
              </span>
            </div>

            <div className="space-y-2">
              {myLedger.slice(0, 3).map((entry) => <div
    key={entry.id}
    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
                  <span className="text-slate-600 dark:text-slate-300 truncate pr-2">
                    {entry.note}
                  </span>
                  <span
    className={`font-mono font-semibold tabular-nums shrink-0 ${entry.days >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
  >
                    {entry.days >= 0 ? `+${entry.days}` : entry.days} hr
                  </span>
                </div>)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Pengajuan aktif</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {myRequests.length} pengajuan
            </span>
          </div>
        </div>

        {
    /* Card 3: PIN-Protected Latest Payslip */
  }
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.latestPayslip}
              </h3>
              <button
    type="button"
    onClick={() => onNavigateEssTab("ess_payroll")}
    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
  >
                Semua Slip →
              </button>
            </div>

            {!payslipUnlocked ? <form onSubmit={handleUnlockPayslip} className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Slip Gaji Dilindungi PIN</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Masukkan PIN (demo: <span className="font-mono font-semibold">1234</span>) untuk melihat Take-Home Pay.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
    type="password"
    value={pinInput}
    onChange={(e) => setPinInput(e.target.value)}
    placeholder="PIN (1234)"
    aria-label="Payslip PIN"
    className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
  />
                  <button
    type="submit"
    className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1"
  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka</span>
                  </button>
                </div>
                {pinError && <p className="text-[11px] text-red-600 dark:text-red-400">{pinError}</p>}
              </form> : <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Periode Terkini</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {latestPayrollRun?.periodLabel ?? "Oktober 2026"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Take-Home Pay (Net)</span>
                  <span className="text-lg font-display font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {formatIDR(myPayLine?.netPay ?? 2345e4)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>PPh 21 TER + BPJS</span>
                  <span className="font-mono tabular-nums">
                    -{formatIDR((myPayLine?.pph21Ter ?? 0) + (myPayLine?.bpjsEmployee ?? 0))}
                  </span>
                </div>
                <button
    type="button"
    onClick={() => {
      setPayslipUnlocked(false);
      setPinInput("");
    }}
    className="mt-2 w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center justify-center gap-1.5"
  >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{t.lockPayslip}</span>
                </button>
              </div>}
          </div>
        </div>
      </div>

      {
    /* Bottom Row: Announcements + Celebrations & Quick Links */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t.announcements}</span>
            </h3>
            <button
    type="button"
    onClick={() => onNavigateEssTab("ess_helpdesk")}
    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
  >
              Tiket &amp; Info HR →
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => <div
    key={ann.id}
    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
  >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {ann.title}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {ann.publishedAt}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.body}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">{ann.targetAudience}</span>
                  {ann.acknowledgedByMe ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Dibaca
                    </span> : <button
    type="button"
    onClick={() => onAcknowledgeAnnouncement(ann.id)}
    className="h-7 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
  >
                      Konfirmasi Baca
                    </button>}
                </div>
              </div>)}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Momen &amp; Pengingat Saya</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">
                Work Anniversary · Clarissa Tan (2 Tahun)
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Berikan ucapan selamat kepada rekan tim Product &amp; Design.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Pengingat Masa Berlaku Dokumen (H-30)</span>
              </div>
              <p className="text-amber-700 dark:text-amber-300/90 mt-0.5">
                Sertifikat Kompetensi Cloud Security berakhir 10 Des 2026.
              </p>
              <button
    type="button"
    onClick={() => onNavigateEssTab("ess_profile")}
    className="mt-2 text-[11px] font-semibold text-amber-900 dark:text-amber-200 underline"
  >
                Perbarui di Profil &amp; Dokumen →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  EssDashboardView
};
