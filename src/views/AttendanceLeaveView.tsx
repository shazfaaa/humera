import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  CalendarPlus,
  Check,
  Clock,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import type {
  AttendanceDailySummary,
  AttendanceRawEvent,
  EmployeeRecord,
  Language,
  LeaveLedgerEntry,
  LeaveRequest,
  ShiftScheduleItem,
} from '../types/hcm';
import { calculateLeaveBalance, validateLeaveSubmission } from '../utils/hcmRules';

interface AttendanceLeaveViewProps {
  language: Language;
  initialSection: 'attendance' | 'leave';
  isEssMode: boolean;
  currentEmployee: EmployeeRecord;
  summaries: AttendanceDailySummary[];
  rawEvents: AttendanceRawEvent[];
  shifts: ShiftScheduleItem[];
  leaveLedger: LeaveLedgerEntry[];
  leaveRequests: LeaveRequest[];
  onSubmitLeave: (payload: {
    leaveType: LeaveRequest['leaveType'];
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => void;
  onApproveLeave: (requestId: string, approved: boolean) => void;
  onResolveUnknownAttendance: (summaryId: string, checkOutTime: string) => void;
  onRequestShiftSwap: (shiftId: string) => void;
}

export function AttendanceLeaveView({
  initialSection,
  isEssMode,
  currentEmployee,
  summaries,
  rawEvents,
  shifts,
  leaveLedger,
  leaveRequests,
  onSubmitLeave,
  onApproveLeave,
  onResolveUnknownAttendance,
  onRequestShiftSwap,
}: AttendanceLeaveViewProps) {
  const [section, setSection] = useState<'daily' | 'raw' | 'shifts' | 'leave'>(
    initialSection === 'leave' ? 'leave' : 'daily'
  );

  // Leave form state
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('annual');
  const [startDate, setStartDate] = useState('2026-11-27');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('');
  const [leaveError, setLeaveError] = useState('');

  // Resolve missing checkout state
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixTime, setFixTime] = useState('18:05');

  const myLedger = leaveLedger.filter((l) => l.employeeId === currentEmployee.id);
  const myBalance = calculateLeaveBalance(myLedger);

  const visibleSummaries = isEssMode
    ? summaries.filter((s) => s.employeeId === currentEmployee.id)
    : summaries;
  const visibleRawEvents = isEssMode
    ? rawEvents.filter((r) => r.employeeId === currentEmployee.id)
    : rawEvents;
  const visibleShifts = isEssMode
    ? shifts.filter((s) => s.employeeId === currentEmployee.id)
    : shifts;
  const visibleLeaveRequests = isEssMode
    ? leaveRequests.filter((r) => r.employeeId === currentEmployee.id)
    : leaveRequests;

  const handleLeaveFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLeaveSubmission({
      availableBalance: myBalance,
      requestedDays: days,
      startDate,
      endDate,
      existingRequests: leaveRequests,
      employeeId: currentEmployee.id,
    });

    if (!validation.valid) {
      const msgMap: Record<string, string> = {
        invalid_date_range: 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        invalid_days: 'Jumlah hari cuti harus lebih dari 0.',
        insufficient_balance: `Saldo cuti tidak mencukupi (tersedia ${myBalance} hari).`,
        overlapping_leave: 'Tanggal pengajuan bertabrakan dengan pengajuan cuti lain yang aktif.',
      };
      setLeaveError(msgMap[validation.errorKey ?? ''] ?? 'Pengajuan tidak valid.');
      return;
    }

    if (!reason.trim()) {
      setLeaveError('Alasan pengajuan cuti wajib diisi.');
      return;
    }

    setLeaveError('');
    onSubmitLeave({ leaveType, startDate, endDate, days, reason: reason.trim() });
    setReason('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {section === 'leave'
              ? 'Cuti, Izin & Immutable Leave Ledger'
              : 'Absensi, Raw Event & Roster Shift'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Raw event terpisah dari ringkasan harian; missing check-out berstatus unknown hingga dikoreksi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {[
            { id: 'daily', label: 'Ringkasan Harian' },
            { id: 'raw', label: 'Raw Event Log' },
            { id: 'shifts', label: 'Roster Shift' },
            { id: 'leave', label: 'Cuti & Ledger' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id as typeof section)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                section === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'daily' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Shift · Mode</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Status &amp; Eksepsi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleSummaries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{row.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {row.employeeName}
                    <div className="text-[11px] font-normal text-slate-400">{row.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {row.shiftName} · <span className="font-medium">{row.workMode}</span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-900 dark:text-white">
                    {row.checkInTime ?? '—'}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-900 dark:text-white">
                    {row.checkOutTime ?? <span className="text-amber-600">Belum ada</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        row.status === 'unknown'
                          ? 'text-amber-600 dark:text-amber-400'
                          : row.status === 'on_time' || row.status === 'wfh'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {row.status}
                    </span>
                    {row.exceptionNote && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
                        {row.exceptionNote}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.status === 'unknown' && (
                      fixingId === row.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="time"
                            value={fixTime}
                            onChange={(e) => setFixTime(e.target.value)}
                            className="h-7 px-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onResolveUnknownAttendance(row.id, fixTime);
                              setFixingId(null);
                            }}
                            className="h-7 px-2.5 rounded bg-indigo-600 text-white text-[11px] font-semibold"
                          >
                            Simpan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFixingId(row.id)}
                          className="h-7 px-2.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[11px] font-semibold"
                        >
                          Koreksi Check-Out
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'raw' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Tipe &amp; Sumber</th>
                <th className="py-3 px-4">Device Time</th>
                <th className="py-3 px-4">Lokasi &amp; Akurasi GPS</th>
                <th className="py-3 px-4">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleRawEvents.map((ev) => (
                <tr key={ev.id}>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{ev.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {ev.employeeName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {ev.eventType} · {ev.source} ({ev.workMode})
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {ev.deviceTime}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {ev.locationName} <span className="font-mono text-[11px] text-slate-400">(±{ev.gpsAccuracyMeters}m)</span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <span
                      className={
                        ev.verificationStatus === 'verified'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {ev.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'shifts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Mendukung shift lintas hari (cross-day), rest period, dan shift swap tanpa mengubah raw event.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleShifts.map((sh) => (
              <div
                key={sh.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {sh.employeeName} · {sh.shiftName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {sh.date} · {sh.startTime}–{sh.endTime}{' '}
                    {sh.crossDay && <span className="text-indigo-600">(Lintas Hari)</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRequestShiftSwap(sh.id)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{sh.swapStatus === 'swap_requested' ? 'Swap Diminta' : 'Tukar Shift'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Leave Submission + Immutable Ledger */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-indigo-600" />
                  <span>Ajukan Cuti / Izin</span>
                </h3>
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  Saldo: {myBalance} hari
                </span>
              </div>

              {leaveError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{leaveError}</span>
                </div>
              )}

              <form onSubmit={handleLeaveFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Jenis Cuti</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="annual">Cuti Tahunan</option>
                    <option value="sick">Cuti Sakit (Dokumen Pendukung)</option>
                    <option value="special">Izin Khusus</option>
                    <option value="unpaid">Cuti Di luar Tanggungan</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Jumlah Hari Kerja</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Alasan</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Keperluan keluarga"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Kirim Pengajuan Cuti
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Immutable Leave Ledger ({currentEmployee.person.fullName})</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {myLedger.map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{entry.note}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {entry.date} · {entry.type}
                      </div>
                    </div>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        entry.days >= 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {entry.days >= 0 ? `+${entry.days}` : entry.days}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Requests & Approval Queue */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar Pengajuan &amp; Persetujuan Cuti
            </h3>
            <div className="space-y-3">
              {visibleLeaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {req.employeeName} ·{' '}
                      <span className="font-normal text-slate-500">{req.department}</span>
                    </div>
                    <div className="font-mono text-slate-600 dark:text-slate-300">
                      {req.startDate} s/d {req.endDate} ({req.days} hari · {req.leaveType})
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">{req.reason}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'pending' && !isEssMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApproveLeave(req.id, false)}
                          className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveLeave(req.id, true)}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold capitalize ${
                          req.status === 'approved'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : req.status === 'rejected'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
