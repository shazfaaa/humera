import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckSquare,
  ShieldAlert,
  Square,
  Users
} from "lucide-react";
function RecruitmentTalentView({
  mode,
  isEssMode,
  mppPlans,
  candidates,
  clearanceCases,
  performanceGoals,
  courses,
  onAdvanceCandidateStage,
  onToggleClearanceItem
}) {
  const [recTab, setRecTab] = useState("mpp");
  const [perfTab, setPerfTab] = useState("kpi");
  if (mode === "recruitment") {
    return <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Manpower Planning (MPP), ATS &amp; Onboarding / Offboarding
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              AI scoring hanya rekomendasi (tidak auto-reject); akses berisiko dicabut pada tanggal efektif terminasi.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
            {[
      { id: "mpp", label: "MPP Headcount" },
      { id: "ats", label: "ATS Kandidat" },
      { id: "clearance", label: "Clearance Offboarding" }
    ].map((t) => <button
      key={t.id}
      type="button"
      onClick={() => setRecTab(t.id)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${recTab === t.id ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
    >
                {t.label}
              </button>)}
          </div>
        </div>

        {recTab === "mpp" && <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Posisi &amp; Tipe</th>
                  <th className="py-3 px-4">Departemen · Lokasi</th>
                  <th className="py-3 px-4 text-right">Rencana</th>
                  <th className="py-3 px-4 text-right">Aktual</th>
                  <th className="py-3 px-4 text-right">Vacancy</th>
                  <th className="py-3 px-4">Persetujuan Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mppPlans.map((m) => <tr key={m.id}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {m.positionTitle}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.planType}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {m.department} · {m.location} ({m.costCenter})
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{m.plannedHeadcount}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{m.actualHeadcount}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-indigo-600">
                      {Math.max(m.plannedHeadcount - m.actualHeadcount, 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span
      className={`font-semibold ${m.budgetApproved ? "text-emerald-600" : "text-amber-600"}`}
    >
                        {m.budgetApproved ? "Disetujui (Siap Requisition)" : "Menunggu Finance"}
                      </span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}

        {recTab === "ats" && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.map((cand) => <div
      key={cand.id}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 text-xs"
    >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {cand.name}
                      </div>
                      <div className="text-slate-500">{cand.appliedPosition}</div>
                    </div>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {cand.stage}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                    <div className="font-medium text-slate-700 dark:text-slate-200">
                      Skor Rekomendasi AI (Advisory): <span className="font-mono">{cand.aiRecommendationScore}/100</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Catatan Reviewer: {cand.humanReviewerNote}
                    </p>
                  </div>
                </div>
                <button
      type="button"
      disabled={cand.stage === "hired"}
      onClick={() => onAdvanceCandidateStage(cand.id)}
      className="h-8 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold"
    >
                  {cand.stage === "hired" ? "Selesai (Hired)" : "Lanjut Tahap Berikutnya"}
                </button>
              </div>)}
          </div>}

        {recTab === "clearance" && <div className="space-y-4">
            {clearanceCases.map((c) => <div
      key={c.id}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs"
    >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {c.employeeName}
                    </h3>
                    <p className="text-slate-500 font-mono">
                      Tanggal Efektif Terminasi: {c.effectiveDate}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    <ShieldAlert className="w-4 h-4" />
                    Clearance Paralel
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl border-slate-200 dark:border-slate-800">
                  {c.items.map((item) => <button
      key={item.id}
      type="button"
      onClick={() => onToggleClearanceItem(c.id, item.id)}
      className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40"
    >
                      <div className="flex items-center gap-2.5">
                        {item.completed ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span
      className={item.completed ? "line-through text-slate-400" : "font-medium text-slate-900 dark:text-white"}
    >
                          [{item.team}] {item.task}
                        </span>
                      </div>
                      {item.riskCritical && <span className="text-[11px] font-semibold text-red-600 shrink-0">
                          Prioritas Tanggal Efektif
                        </span>}
                    </button>)}
                </div>
              </div>)}
          </div>}
      </div>;
  }
  return <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {isEssMode ? "KPI / OKR & Pelatihan Saya" : "Performa, Kalibrasi & Learning (LMS)"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Penilaian individu dipisahkan dari faktor pendanaan perusahaan; skor rendah tidak memotong gaji secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          <button
    type="button"
    onClick={() => setPerfTab("kpi")}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${perfTab === "kpi" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
  >
            <Award className="w-3.5 h-3.5" />
            <span>KPI / OKR</span>
          </button>
          <button
    type="button"
    onClick={() => setPerfTab("lms")}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${perfTab === "lms" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
  >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Katalog Belajar</span>
          </button>
        </div>
      </div>

      {perfTab === "kpi" ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceGoals.map((g) => <div
    key={g.id}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs"
  >
              <div className="flex items-center justify-between">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {g.cycle} · Bobot {g.weightPercent}%
                </span>
                <span className="text-slate-500">{g.calibrationStatus}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {g.title}
              </div>
              <div className="text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {g.employeeName} ({g.department})
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Progres</span>
                  <span>{g.progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
    style={{ width: `${g.progressPercent}%` }}
    className="h-full bg-indigo-600 rounded-full"
  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-mono">
                <span>Rating Individu: {g.individualRating}/5.0</span>
                <span>Company Factor: {g.companyFundingFactor}x</span>
              </div>
            </div>)}
        </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((c) => <div
    key={c.id}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs"
  >
              <div className="flex items-center justify-between">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {c.category}
                </span>
                {c.mandatory && <span className="font-semibold text-amber-600">Wajib</span>}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {c.title}
              </div>
              <div className="text-slate-500 font-mono">
                Durasi {c.durationMinutes} menit · {c.enrolledCount} peserta
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>{isEssMode ? "Progres Saya" : "Tingkat Selesai"}</span>
                  <span>{isEssMode ? c.myProgressPercent : c.completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
    style={{ width: `${isEssMode ? c.myProgressPercent : c.completionRate}%` }}
    className="h-full bg-emerald-500 rounded-full"
  />
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}
export {
  RecruitmentTalentView
};
