import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Calendar,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  TrendingUp,
} from 'lucide-react';
import type {
  AttendanceDailySummary,
  EmployeeRecord,
  Language,
} from '../types/hcm';
import { translations } from '../i18n/translations';
import { Avatar } from '../components/Avatar';
import {
  AttendanceSegmentedBar,
  PayrollMonthlyChart,
  PerformanceStackedBars,
  WorkModeRadialGauge,
} from '../components/charts/DashboardCharts';

interface AdminDashboardViewProps {
  language: Language;
  adminName: string;
  employees: EmployeeRecord[];
  attendanceSummaries: AttendanceDailySummary[];
  globalSearch: string;
  onSelectEmployee: (emp: EmployeeRecord) => void;
  onExportEmployeesCsv: () => void;
  onNavigateTab: (tab: 'employees' | 'attendance' | 'payroll' | 'leave') => void;
}

export function AdminDashboardView({
  language,
  adminName,
  employees,
  attendanceSummaries,
  globalSearch,
  onSelectEmployee,
  onExportEmployeesCsv,
  onNavigateTab,
}: AdminDashboardViewProps) {
  const t = translations[language];
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PKWTT' | 'PKWT'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('01 Nov - 17 Nov 2026');
  const [sortAsc, setSortAsc] = useState(true);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.assignment.department))),
    [employees]
  );

  const pkwttCount = employees.filter((e) => e.employment.relationship === 'PKWTT').length;
  const pkwtCount = employees.filter((e) => e.employment.relationship === 'PKWT').length;

  const wfoCount = employees.filter((e) => e.assignment.workMode === 'WFO').length;
  const hybridWfhCount = employees.filter(
    (e) => e.assignment.workMode === 'hybrid' || e.assignment.workMode === 'WFH'
  ).length;
  const fieldCount = employees.filter((e) => e.assignment.workMode === 'field').length;

  const onTimeCount = attendanceSummaries.filter(
    (a) => a.status === 'on_time' || a.status === 'wfh' || a.status === 'field_work'
  ).length;
  const attendancePct = attendanceSummaries.length
    ? Math.round((onTimeCount / attendanceSummaries.length) * 100)
    : 92;

  const filteredEmployees = useMemo(() => {
    const q = (tableSearch || globalSearch).trim().toLowerCase();
    return employees
      .filter((emp) => {
        if (statusFilter !== 'all' && emp.employment.relationship !== statusFilter) return false;
        if (deptFilter !== 'all' && emp.assignment.department !== deptFilter) return false;
        if (!q) return true;
        return (
          emp.person.fullName.toLowerCase().includes(q) ||
          emp.person.email.toLowerCase().includes(q) ||
          emp.employment.employeeCode.toLowerCase().includes(q) ||
          emp.assignment.roleTitle.toLowerCase().includes(q) ||
          emp.assignment.department.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        sortAsc
          ? a.person.fullName.localeCompare(b.person.fullName)
          : b.person.fullName.localeCompare(a.person.fullName)
      );
  }, [employees, tableSearch, globalSearch, statusFilter, deptFilter, sortAsc]);

  return (
    <div className="space-y-6">
      {/* Greeting Header Row (matching Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            {t.goodMorning}, {adminName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PT Nusantara Karya Digital · Multi-Lokasi (Jakarta, Bandung, Surabaya)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              aria-label="Filter periode"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="01 Nov - 17 Nov 2026">01 Nov - 17 Nov 2026</option>
              <option value="01 Okt - 31 Okt 2026">01 Okt - 31 Okt 2026</option>
              <option value="Q4 2026">Q4 2026 (Okt–Des)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column KPI Summary Row (matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Employees (PKWTT vs PKWT) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.totalEmployees}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('employees')}
              aria-label="Kelola karyawan"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
                  {pkwttCount * 38}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <TrendingUp className="w-3 h-3" />
                  +12
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.fulltimeLabel}
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
                  {pkwtCount * 24}
                </span>
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                  {employees.length} sampel aktif
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.contractLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.attendanceOverview}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              aria-label="Lihat detail absensi"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <span className="text-3xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
              {attendancePct}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                +4.2%
              </span>{' '}
              {t.sinceLastMonth}
            </span>
          </div>

          <AttendanceSegmentedBar
            onTimePct={68}
            wfhPct={22}
            leavePct={10}
            labels={{
              onTime: t.onTime,
              wfh: t.wfhHybrid,
              leave: t.sickLeave,
            }}
          />
        </div>

        {/* Card 3: Work Mode Distribution Gauge */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.workModeDistribution}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              aria-label="Detail mode kerja"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <WorkModeRadialGauge
            totalActive={162}
            overallLabel={t.overallActive}
            breakdown={[
              {
                label: 'WFO (Kantor)',
                count: wfoCount * 86,
                colorClass: 'bg-indigo-600',
                strokeColor: '#4F46E5',
              },
              {
                label: 'Hybrid / WFH',
                count: hybridWfhCount * 20,
                colorClass: 'bg-amber-400',
                strokeColor: '#F59E0B',
              },
              {
                label: 'Field / Dinas',
                count: fieldCount * 16,
                colorClass: 'bg-sky-500',
                strokeColor: '#0EA5E9',
              },
            ]}
          />
        </div>
      </div>

      {/* 2-Column Middle Analytics Row (matching Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Employee Performance Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.employeePerformance}
              </h3>
              <span className="text-xs text-slate-400">H2 2026</span>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <span className="text-3xl font-display font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                94%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.performanceSub}
              </p>
            </div>
          </div>

          <PerformanceStackedBars
            employees={employees}
            labels={{
              tasks: t.taskCompleted,
              presence: t.presenceScore,
              collab: t.completedMeeting,
            }}
          />
        </div>

        {/* Right: Payroll & Employer Cost Monthly Statistics (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.payrollStatistics}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('payroll')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              {t.advanceFilter} →
            </button>
          </div>

          <PayrollMonthlyChart
            grossLabel={t.grossPayroll}
            employerCostLabel={t.employerCost}
          />
        </div>
      </div>

      {/* Bottom Full-Width Employee Directory Table (matching Image 1) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.allEmployees}{' '}
            <span className="text-slate-400 font-normal tabular-nums ml-1">
              ({filteredEmployees.length})
            </span>
          </h3>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={t.searchEmployee}
                aria-label={t.searchEmployee}
                className="h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-52"
              />
            </div>

            <select
              aria-label={t.allStatus}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PKWTT' | 'PKWT')}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">{t.allStatus}</option>
              <option value="PKWTT">PKWTT (Tetap)</option>
              <option value="PKWT">PKWT (Kontrak)</option>
            </select>

            <select
              aria-label={t.allRole}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">{t.allRole}</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onExportEmployeesCsv}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5">NIK / ID</th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => setSortAsc((prev) => !prev)}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Karyawan</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Jabatan &amp; Grade</th>
                <th className="py-3 px-4">Departemen · Mode</th>
                <th className="py-3 px-4">Hubungan Kerja</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data karyawan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-5 font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {emp.employment.employeeCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={emp.person.fullName}
                          src={emp.person.avatarUrl}
                          size="sm"
                        />
                        <span className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {emp.person.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {emp.person.email}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {emp.assignment.roleTitle}{' '}
                      <span className="text-slate-400">· {emp.assignment.grade}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {emp.assignment.department}{' '}
                      <span className="text-slate-400">· {emp.assignment.workMode}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          emp.employment.relationship === 'PKWTT'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {emp.employment.relationship} ·{' '}
                        {emp.employment.timeCapacity === 'full_time' ? 'Full-time' : 'Part-time'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(emp)}
                        aria-label={`Lihat detail ${emp.person.fullName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
