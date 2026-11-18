import { useState } from 'react';
import {
  Building2,
  Check,
  Eye,
  MapPin,
  Plus,
  ShieldAlert,
  X,
} from 'lucide-react';
import type {
  BankChangeRequest,
  EmployeeRecord,
  Language,
} from '../types/hcm';
import { LEGAL_ENTITIES, OFFICE_LOCATIONS } from '../data/seedData';
import { Avatar } from '../components/Avatar';
import { formatIDR } from '../utils/hcmRules';

interface EmployeesOrgViewProps {
  language: Language;
  employees: EmployeeRecord[];
  bankChangeRequests: BankChangeRequest[];
  onSelectEmployee: (emp: EmployeeRecord) => void;
  onOpenAddEmployee: () => void;
  onApproveBankChange: (requestId: string, approved: boolean) => void;
}

export function EmployeesOrgView({
  language,
  employees,
  bankChangeRequests,
  onSelectEmployee,
  onOpenAddEmployee,
  onApproveBankChange,
}: EmployeesOrgViewProps) {
  const [subTab, setSubTab] = useState<'directory' | 'org' | 'bank_approvals'>('directory');
  const pendingBankCount = bankChangeRequests.filter(
    (b) => b.status === 'pending_verification'
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {language === 'id'
              ? 'Employee Core & Hierarki Organisasi'
              : 'Employee Core & Organization Hierarchy'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pemisahan Person, Employment (PKWTT/PKWT), dan Assignment multi-badan hukum &amp; lokasi.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddEmployee}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah / Rehire Karyawan</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setSubTab('directory')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            subTab === 'directory'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Direktori Karyawan ({employees.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('org')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            subTab === 'org'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Badan Hukum &amp; Lokasi
        </button>
        <button
          type="button"
          onClick={() => setSubTab('bank_approvals')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            subTab === 'bank_approvals'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Verifikasi Rekening ({pendingBankCount})
        </button>
      </div>

      {subTab === 'directory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama &amp; Person ID</th>
                <th className="py-3 px-4">Hubungan Kerja &amp; Jadwal</th>
                <th className="py-3 px-4">Penempatan &amp; Cost Center</th>
                <th className="py-3 px-4 text-right">Gaji Pokok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {emp.employment.employeeCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.person.fullName} src={emp.person.avatarUrl} size="sm" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {emp.person.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {emp.person.personId} · {emp.person.ptkpStatus}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {emp.employment.relationship} ·{' '}
                      {emp.employment.timeCapacity === 'full_time' ? 'Full-time' : 'Part-time'}
                    </div>
                    <div className="text-[11px] text-slate-400">{emp.employment.paymentBasis}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {emp.assignment.department} ({emp.assignment.costCenter})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {emp.assignment.locationName} · {emp.assignment.workMode}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatIDR(emp.employment.baseSalary)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspeksi</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'org' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Badan Hukum (Legal Entities)</span>
            </h3>
            <div className="space-y-3">
              {LEGAL_ENTITIES.map((le) => (
                <div
                  key={le.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{le.name}</div>
                  <div className="text-slate-500 font-mono">NPWP: {le.npwp}</div>
                  <div className="text-slate-500">Domisili Pajak: {le.city}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Lokasi Kerja &amp; Geofence</span>
            </h3>
            <div className="space-y-3">
              {OFFICE_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{loc.name}</div>
                    <div className="text-slate-500 mt-0.5">
                      {loc.city} · {loc.timezone}
                    </div>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    Radius {loc.geofenceRadiusMeters}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'bank_approvals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Rekening baru tidak aktif untuk disbursement payroll hingga verifikasi &amp; approval selesai.
            </span>
          </div>

          {bankChangeRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada pengajuan perubahan rekening.
            </div>
          ) : (
            <div className="space-y-3">
              {bankChangeRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {req.employeeName} ·{' '}
                      <span className="font-normal text-slate-500">{req.reason}</span>
                    </div>
                    <div className="font-mono text-slate-600 dark:text-slate-300">
                      {req.oldBankName} ({req.oldAccountNumber}) →{' '}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {req.newBankName} ({req.newAccountNumber})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Status: <span className="font-semibold">{req.status}</span>
                    </div>
                  </div>

                  {req.status === 'pending_verification' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onApproveBankChange(req.id, false)}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveBankChange(req.id, true)}
                        className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verifikasi &amp; Aktifkan</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
