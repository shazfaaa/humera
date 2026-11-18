import { useState } from "react";
import { MONTHLY_PAYROLL_CHART_DATA } from "../../data/seedData";
import { formatIDR } from "../../utils/hcmRules";
function AttendanceSegmentedBar({
  onTimePct,
  wfhPct,
  leavePct,
  labels
}) {
  return <div>
      <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-1 bg-slate-100 dark:bg-slate-800">
        <div
    style={{ width: `${leavePct}%` }}
    className="h-full bg-amber-400 rounded-full"
    title={`${labels.leave}: ${leavePct}%`}
  />
        <div
    style={{ width: `${wfhPct}%` }}
    className="h-full bg-sky-400 rounded-full"
    title={`${labels.wfh}: ${wfhPct}%`}
  />
        <div
    style={{ width: `${onTimePct}%` }}
    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
    title={`${labels.onTime}: ${onTimePct}%`}
  />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {labels.leave} ({leavePct}%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          {labels.wfh} ({wfhPct}%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
          {labels.onTime} ({onTimePct}%)
        </span>
      </div>
    </div>;
}
function WorkModeRadialGauge({
  totalActive,
  overallLabel,
  breakdown
}) {
  return <div className="flex items-center justify-between gap-4">
      {
    /* Semi-circle SVG gauge matching Image 1 */
  }
      <div className="relative w-32 h-20 shrink-0 flex items-end justify-center">
        <svg viewBox="0 0 140 80" className="w-full h-full overflow-visible" aria-hidden="true">
          <path
    d="M 16 70 A 54 54 0 0 1 124 70"
    fill="none"
    stroke="currentColor"
    className="text-slate-100 dark:text-slate-800"
    strokeWidth="12"
    strokeLinecap="round"
  />
          <path
    d="M 16 70 A 54 54 0 0 1 42 24"
    fill="none"
    stroke="#4F46E5"
    strokeWidth="12"
    strokeLinecap="round"
  />
          <path
    d="M 48 21 A 54 54 0 0 1 104 29"
    fill="none"
    stroke="#F59E0B"
    strokeWidth="12"
    strokeLinecap="round"
  />
          <path
    d="M 110 35 A 54 54 0 0 1 124 70"
    fill="none"
    stroke="#0EA5E9"
    strokeWidth="12"
    strokeLinecap="round"
  />
        </svg>
        <div className="absolute bottom-0 text-center">
          <div className="text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums leading-none">
            {totalActive}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {overallLabel}
          </div>
        </div>
      </div>

      {
    /* Right breakdown list */
  }
      <div className="flex-1 space-y-2 min-w-0">
        {breakdown.map((item) => <div key={item.label} className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1 h-3 rounded-full shrink-0 ${item.colorClass}`} />
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {item.count}
              </span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 truncate">{item.label}</span>
          </div>)}
      </div>
    </div>;
}
function PerformanceStackedBars({
  employees,
  labels
}) {
  const maxScale = 40;
  return <div>
      <div className="space-y-3.5">
        {employees.slice(0, 5).map((emp) => {
    const { taskCompleted, presence, completedMeeting } = emp.performanceBreakdown;
    const tW = Math.min(taskCompleted / maxScale * 100, 100);
    const pW = Math.min(presence / maxScale * 100, 100);
    const cW = Math.min(completedMeeting / maxScale * 100, 100);
    return <div key={emp.id} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-4 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {emp.person.fullName}
              </div>
              <div className="col-span-8 flex items-center gap-1 h-3">
                <div
      style={{ width: `${tW}%` }}
      className="h-full rounded-sm bg-indigo-600 dark:bg-indigo-500 transition-all"
      title={`${labels.tasks}: ${taskCompleted}`}
    />
                <div
      style={{ width: `${pW}%` }}
      className="h-full rounded-sm bg-sky-500 transition-all"
      title={`${labels.presence}: ${presence}`}
    />
                <div
      style={{ width: `${cW}%` }}
      className="h-full rounded-sm bg-emerald-400 transition-all"
      title={`${labels.collab}: ${completedMeeting}`}
    />
              </div>
            </div>;
  })}
      </div>

      {
    /* X Axis Scale */
  }
      <div className="grid grid-cols-12 gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="col-span-4" />
        <div className="col-span-8 flex justify-between text-[11px] text-slate-400 tabular-nums">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      {
    /* Legend */
  }
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
          {labels.tasks}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          {labels.presence}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          {labels.collab}
        </span>
      </div>
    </div>;
}
function PayrollMonthlyChart({
  grossLabel,
  employerCostLabel
}) {
  const [hoveredIdx, setHoveredIdx] = useState(10);
  const maxVal = 175;
  return <div className="relative">
      {
    /* Y-Axis + Bars */
  }
      <div className="flex gap-3 items-end h-56 pt-8">
        {
    /* Y-Axis labels */
  }
        <div className="flex flex-col justify-between h-full text-[11px] text-slate-400 tabular-nums pr-1 select-none">
          <span>175jt</span>
          <span>140jt</span>
          <span>105jt</span>
          <span>70jt</span>
          <span>35jt</span>
          <span>0</span>
        </div>

        {
    /* Columns */
  }
        <div className="flex-1 grid grid-cols-12 gap-1.5 sm:gap-2.5 h-full items-end relative">
          {
    /* Background horizontal dashed gridlines */
  }
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4, 5].map((line) => <div
    key={line}
    className="w-full border-b border-dashed border-slate-100 dark:border-slate-800"
  />)}
          </div>

          {MONTHLY_PAYROLL_CHART_DATA.map((d, idx) => {
    const grossHeight = d.grossM / maxVal * 100;
    const empHeight = d.employerCostM / maxVal * 100;
    const isHovered = hoveredIdx === idx;
    return <div
      key={d.month}
      onMouseEnter={() => setHoveredIdx(idx)}
      onFocus={() => setHoveredIdx(idx)}
      tabIndex={0}
      role="button"
      aria-label={`${d.month} 2026: ${grossLabel} ${d.grossM}jt, ${employerCostLabel} ${d.employerCostM}jt`}
      className="relative h-full flex flex-col justify-end items-center group cursor-pointer focus:outline-none"
    >
                {
      /* Floating Tooltip for Active Column */
    }
                {isHovered && <div
      className={`absolute -top-9 z-20 whitespace-nowrap px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-[11px] pointer-events-none ${idx <= 1 ? "left-0" : idx >= 9 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
    >
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                      {d.month} 2026
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        Gross
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatIDR(d.grossM * 1e6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        BPJS/Tax
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatIDR(d.employerCostM * 1e6)}
                      </span>
                    </div>
                  </div>}

                {
      /* Stacked Bar */
    }
                <div className="w-full max-w-[30px] flex flex-col justify-end gap-0.5 h-full">
                  {
      /* Top Hatched Segment (Employer Cost) */
    }
                  <div
      style={{
        height: `${empHeight}%`,
        backgroundImage: "repeating-linear-gradient(-45deg, #38BDF8, #38BDF8 3px, #E0F2FE 3px, #E0F2FE 6px)"
      }}
      className={`w-full rounded-t-md transition-opacity ${isHovered ? "opacity-100 ring-2 ring-sky-400/50" : "opacity-85 group-hover:opacity-100"}`}
    />
                  {
      /* Base Solid Indigo Segment (Gross Payroll) */
    }
                  <div
      style={{ height: `${grossHeight}%` }}
      className={`w-full rounded-t-xs rounded-b-md transition-colors ${isHovered ? "bg-indigo-600 dark:bg-indigo-500" : "bg-indigo-500/80 dark:bg-indigo-600/80 group-hover:bg-indigo-600"}`}
    />
                </div>
              </div>;
  })}
        </div>
      </div>

      {
    /* X-Axis Labels */
  }
      <div className="flex gap-3 mt-2">
        <div className="w-8 pr-1" />
        <div className="flex-1 grid grid-cols-12 gap-1.5 sm:gap-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
          {MONTHLY_PAYROLL_CHART_DATA.map((d, idx) => <span
    key={d.month}
    className={hoveredIdx === idx ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}
  >
              {d.month}
            </span>)}
        </div>
      </div>

      {
    /* Legend */
  }
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
          {grossLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          {employerCostLabel}
        </span>
      </div>
    </div>;
}
export {
  AttendanceSegmentedBar,
  PayrollMonthlyChart,
  PerformanceStackedBars,
  WorkModeRadialGauge
};
