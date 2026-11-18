import { useState } from 'react';
import { X } from 'lucide-react';
import type {
  EmployeeRecord,
  EmploymentRelationship,
  WorkLocationMode,
} from '../types/hcm';
import { Avatar } from './Avatar';
import { formatIDR } from '../utils/hcmRules';

export function EmployeeDetailModal({
  employee,
  onClose,
}: {
  employee: EmployeeRecord | null;
  onClose: () => void;
}) {
  if (!employee) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail karyawan ${employee.person.fullName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={employee.person.fullName} src={employee.person.avatarUrl} size="lg" />
            <div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                {employee.person.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {employee.person.personId} · {employee.employment.employeeCode} ·{' '}
                {employee.assignment.roleTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal detail"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Employment (Hubungan Kerja)
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Kontrak</span>
                <span className="font-semibold">{employee.employment.relationship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kapasitas</span>
                <span>{employee.employment.timeCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gaji Pokok</span>
                <span className="font-mono font-semibold">
                  {formatIDR(employee.employment.baseSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PTKP</span>
                <span className="font-mono">{employee.person.ptkpStatus}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Assignment (Penempatan)
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Departemen</span>
                <span className="font-semibold">{employee.assignment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cost Center</span>
                <span className="font-mono">{employee.assignment.costCenter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi &amp; Mode</span>
                <span>
                  {employee.assignment.locationName} ({employee.assignment.workMode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Atasan</span>
                <span>{employee.assignment.managerName}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white">
              Rekening Payroll &amp; Kontak Darurat
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rekening Aktif</span>
              <span className="font-mono">
                {employee.person.bankName} · {employee.person.bankAccountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kontak Darurat</span>
              <span>
                {employee.person.emergencyContactName} ({employee.person.emergencyContactPhone})
              </span>
            </div>
          </div>

          {employee.history.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Effective-Dated History
              </div>
              {employee.history.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between font-semibold">
                    <span>{h.summary}</span>
                    <span className="font-mono text-indigo-600">{h.effectiveDate}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {h.oldValue} → {h.newValue} (oleh {h.actor})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AddEmployeeModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: {
    fullName: string;
    email: string;
    department: string;
    roleTitle: string;
    relationship: EmploymentRelationship;
    workMode: WorkLocationMode;
    baseSalary: number;
  }) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [roleTitle, setRoleTitle] = useState('');
  const [relationship, setRelationship] = useState<EmploymentRelationship>('PKWTT');
  const [workMode, setWorkMode] = useState<WorkLocationMode>('hybrid');
  const [baseSalary, setBaseSalary] = useState('14000000');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !roleTitle.trim()) {
      setError('Nama lengkap, email korporat, dan jabatan wajib diisi.');
      return;
    }
    setError('');
    onAdd({
      fullName: fullName.trim(),
      email: email.trim(),
      department,
      roleTitle: roleTitle.trim(),
      relationship,
      workMode,
      baseSalary: Number(baseSalary) || 10_000_000,
    });
    setFullName('');
    setEmail('');
    setRoleTitle('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah atau Rehire Karyawan"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
            Tambah Karyawan / Employment Baru
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form karyawan"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Arif Rahman"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Email Korporat</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arif.rahman@nusakarya.id"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Departemen</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Engineering">Engineering</option>
                <option value="People & HR">People &amp; HR</option>
                <option value="Finance & Payroll">Finance &amp; Payroll</option>
                <option value="Product & Design">Product &amp; Design</option>
                <option value="Operations & GA">Operations &amp; GA</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Jabatan</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Contoh: Backend Engineer"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Hubungan Kerja</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as EmploymentRelationship)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="PKWTT">PKWTT (Tetap)</option>
                <option value="PKWT">PKWT (Kontrak)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Mode Lokasi</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkLocationMode)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="WFO">WFO</option>
                <option value="hybrid">Hybrid</option>
                <option value="WFH">WFH</option>
                <option value="field">Field</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Gaji Pokok (IDR)</label>
            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Simpan Karyawan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateAnnouncementModal({
  open,
  onClose,
  onPublish,
}: {
  open: boolean;
  onClose: () => void;
  onPublish: (payload: { title: string; body: string; targetAudience: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('Semua Karyawan · Seluruh Lokasi');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onPublish({
      title: title.trim(),
      body: body.trim(),
      targetAudience: targetAudience.trim(),
    });
    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buat Pengumuman Baru"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
            Buat Pengumuman Baru
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal pengumuman"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Judul Pengumuman</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Townhall Q4 2026"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Target Penerima</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Isi Pengumuman</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis informasi kebijakan atau jadwal..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Terbitkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
