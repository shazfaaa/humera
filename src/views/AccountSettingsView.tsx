import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  History,
  KeyRound,
  Landmark,
  Pencil,
  Shield,
  UserCheck,
} from 'lucide-react';
import type {
  AuditLogEntry,
  BankChangeRequest,
  EmployeeRecord,
  Language,
} from '../types/hcm';
import { translations } from '../i18n/translations';
import { Avatar } from '../components/Avatar';
import { formatIDR, getDocumentExpiryTier } from '../utils/hcmRules';

type SettingsSubTab =
  | 'profile'
  | 'employment'
  | 'bank_tax'
  | 'documents'
  | 'history'
  | 'security'
  | 'audit';

interface AccountSettingsViewProps {
  language: Language;
  employee: EmployeeRecord;
  isAdminContext: boolean;
  bankChangeRequests: BankChangeRequest[];
  auditLogs: AuditLogEntry[];
  onUpdatePersonalInfo: (updates: {
    phone: string;
    bio: string;
    cityState: string;
    postalCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }) => void;
  onRequestBankChange: (payload: {
    newBankName: string;
    newAccountNumber: string;
    newAccountHolder: string;
    reason: string;
  }) => void;
}

export function AccountSettingsView({
  language,
  employee,
  isAdminContext,
  bankChangeRequests,
  auditLogs,
  onUpdatePersonalInfo,
  onRequestBankChange,
}: AccountSettingsViewProps) {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');

  // Personal Info inline editing state (matching Image 2 Edit cards)
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [phone, setPhone] = useState(employee.person.phone);
  const [bio, setBio] = useState(employee.person.bio);
  const [editingAddress, setEditingAddress] = useState(false);
  const [cityState, setCityState] = useState(employee.person.cityState);
  const [postalCode, setPostalCode] = useState(employee.person.postalCode);
  const [emergencyName, setEmergencyName] = useState(employee.person.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(employee.person.emergencyContactPhone);

  // Bank Account Change Form (FSD Employee Core AC #1: Pending Verification)
  const [showBankForm, setShowBankForm] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState(employee.person.fullName);
  const [bankReason, setBankReason] = useState('');
  const [bankError, setBankError] = useState('');

  // Security / MFA session state
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [revokedDeviceIds, setRevokedDeviceIds] = useState<string[]>([]);

  const myPendingBankReq = bankChangeRequests.find(
    (r) => r.employeeId === employee.id && r.status === 'pending_verification'
  );

  const subNavItems: { id: SettingsSubTab; label: string; icon: typeof UserCheck }[] = [
    { id: 'profile', label: t.myProfile, icon: UserCheck },
    { id: 'employment', label: t.employmentContract, icon: Landmark },
    { id: 'bank_tax', label: t.bankTax, icon: Landmark },
    { id: 'documents', label: t.documentsExpiry, icon: FileText },
    { id: 'history', label: t.careerHistory, icon: History },
    { id: 'security', label: t.securityMfa, icon: KeyRound },
    ...(isAdminContext ? [{ id: 'audit' as const, label: t.auditTrail, icon: Shield }] : []),
  ];

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePersonalInfo({
      phone,
      bio,
      cityState,
      postalCode,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
    });
    setEditingPersonal(false);
    setEditingAddress(false);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccountNumber.trim() || !bankReason.trim()) {
      setBankError(
        language === 'id'
          ? 'Nama bank, nomor rekening, dan alasan perubahan wajib diisi.'
          : 'Bank name, account number, and reason are required.'
      );
      return;
    }
    setBankError('');
    onRequestBankChange({
      newBankName: newBankName.trim(),
      newAccountNumber: newAccountNumber.trim(),
      newAccountHolder: newAccountHolder.trim() || employee.person.fullName,
      reason: bankReason.trim(),
    });
    setShowBankForm(false);
    setNewBankName('');
    setNewAccountNumber('');
    setBankReason('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
          {t.accountSettings}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {employee.person.personId} · {employee.employment.employeeCode}
        </span>
      </div>

      {/* Main White Card Container matching Image 2's Two-Column Split */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Inner Left Sub-Navigation (3 cols) */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 space-y-1 bg-slate-50/40 dark:bg-slate-900/50">
          {subNavItems.map((item) => {
            const active = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Detail Panel (9 cols) */}
        <div className="lg:col-span-9 p-5 sm:p-7 space-y-6">
          {activeSubTab === 'profile' && (
            <>
              <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                {t.myProfile}
              </h3>

              {/* Header Identity Card (Image 2 Card 1) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={employee.person.fullName}
                    src={employee.person.avatarUrl}
                    size="xl"
                  />
                  <div>
                    <div className="text-base font-display font-semibold text-slate-900 dark:text-white">
                      {employee.person.fullName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {employee.assignment.roleTitle} · {employee.assignment.department}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {employee.assignment.locationName}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPersonal((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors self-start sm:self-center"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{editingPersonal ? t.cancel : t.edit}</span>
                </button>
              </div>

              {/* Personal Information Card (Image 2 Card 2) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Informasi Pribadi' : 'Personal Information'}
                  </h4>
                  {!editingPersonal && (
                    <button
                      type="button"
                      onClick={() => setEditingPersonal(true)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{t.edit}</span>
                    </button>
                  )}
                </div>

                {editingPersonal ? (
                  <form onSubmit={handleSavePersonal} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Telepon
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Bio / Ringkasan Peran
                        </label>
                        <input
                          type="text"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingPersonal(false)}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      >
                        {t.save}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Nama Lengkap</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {employee.person.fullName}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Person ID</div>
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.personId}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Email Korporat</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Nomor Telepon</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                        {employee.person.phone}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Bio</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.bio}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address & Emergency Contact Card (Image 2 Card 3) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Alamat & Kontak Darurat' : 'Address & Emergency Contact'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingAddress((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{editingAddress ? t.cancel : t.edit}</span>
                  </button>
                </div>

                {editingAddress ? (
                  <form onSubmit={handleSavePersonal} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Kota / Provinsi
                        </label>
                        <input
                          type="text"
                          value={cityState}
                          onChange={(e) => setCityState(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Kode Pos
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Nama Kontak Darurat
                        </label>
                        <input
                          type="text"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Telepon Darurat
                        </label>
                        <input
                          type="text"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      >
                        {t.save}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Negara</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.country}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Kota / Provinsi</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.cityState}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Kode Pos</div>
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.postalCode}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500 mb-1">Kontak Darurat</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.person.emergencyContactName} ({employee.person.emergencyContactRelation}) ·{' '}
                        <span className="tabular-nums">{employee.person.emergencyContactPhone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSubTab === 'employment' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                  {t.employmentContract}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pemisahan entitas Person, Employment (hubungan kerja), dan Assignment (penempatan).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Employment ({employee.employment.employmentId})
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Hubungan</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {employee.employment.relationship}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kapasitas Waktu</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.employment.timeCapacity === 'full_time' ? 'Penuh Waktu' : 'Paruh Waktu'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basis Pembayaran</span>
                    <span className="font-medium text-slate-900 dark:text-white capitalize">
                      {employee.employment.paymentBasis}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pola Jadwal</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.employment.schedulePattern}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal Bergabung</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {employee.employment.joinDate}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Assignment ({employee.assignment.assignmentId})
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departemen &amp; Cost Center</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.assignment.department} · {employee.assignment.costCenter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Posisi &amp; Grade</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.assignment.roleTitle} ({employee.assignment.grade})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lokasi Penempatan</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.assignment.locationName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode Kerja</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {employee.assignment.workMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atasan Langsung</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {employee.assignment.managerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'bank_tax' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                    {t.bankTax}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Perubahan rekening tidak aktif sebelum verifikasi &amp; approval HR/Finance (Acceptance Criteria #1).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankForm((prev) => !prev)}
                  className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap"
                >
                  {showBankForm ? t.cancel : 'Ajukan Ubah Rekening'}
                </button>
              </div>

              {/* Active Bank Account */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Status Rekening Payroll</div>
                  <div className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.activeAccount}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Bank &amp; Nomor Rekening</div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white">
                    {employee.person.bankName} · {employee.person.bankAccountNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">NPWP</div>
                  <div className="font-mono font-medium text-slate-900 dark:text-white">
                    {employee.person.npwp}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Status PTKP &amp; Gaji Pokok</div>
                  <div className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {employee.person.ptkpStatus} · {formatIDR(employee.employment.baseSalary)}
                  </div>
                </div>
              </div>

              {/* Pending Verification Banner if any */}
              {myPendingBankReq && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                    <Clock className="w-4 h-4" />
                    <span>{t.pendingVerification}</span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300/90">
                    Permintaan ubah ke <span className="font-mono font-semibold">{myPendingBankReq.newBankName} ({myPendingBankReq.newAccountNumber})</span> belum menggantikan rekening aktif hingga disetujui oleh HR/Finance.
                  </p>
                </div>
              )}

              {/* Bank Change Request Form */}
              {showBankForm && (
                <form
                  onSubmit={handleBankSubmit}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Formulir Pengajuan Perubahan Rekening (Step-Up Verification)
                  </h4>
                  {bankError && (
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {bankError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nama Bank Baru</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bank Mandiri"
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nomor Rekening Baru</label>
                      <input
                        type="text"
                        placeholder="Contoh: 124-00-991827-1"
                        value={newAccountNumber}
                        onChange={(e) => setNewAccountNumber(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        value={newAccountHolder}
                        onChange={(e) => setNewAccountHolder(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Alasan Perubahan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Pembaruan rekening payroll"
                        value={bankReason}
                        onChange={(e) => setBankReason(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      Kirim untuk Verifikasi
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSubTab === 'documents' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                  {t.documentsExpiry}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dokumen privat diakses melalui signed URL berdurasi singkat dengan pengingat H-90 / H-60 / H-30 / H-7.
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                {employee.documents.map((doc) => {
                  const tier = getDocumentExpiryTier(doc.expiryDate, '2026-11-17');
                  return (
                    <div
                      key={doc.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {doc.title}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Kategori: {doc.category} · Klasifikasi: {doc.classification} · Diunggah{' '}
                          <span className="font-mono">{doc.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.expiryDate ? (
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-semibold ${
                              tier === 'H-7' || tier === 'expired'
                                ? 'text-red-600 dark:text-red-400'
                                : tier === 'H-30' || tier === 'H-60'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {(tier === 'H-7' || tier === 'H-30') && (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {tier} ({doc.expiryDate})
                          </span>
                        ) : (
                          <span className="text-slate-400">Berlaku Permanen</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                  {t.careerHistory}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Histori lama tidak ditimpa setelah perubahan efektif; perubahan mencatat nilai lama, baru, aktor, dan alasan.
                </p>
              </div>
              {employee.history.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                  Belum ada riwayat perubahan efektif tercatat sejak tanggal bergabung ({employee.employment.joinDate}).
                </div>
              ) : (
                <div className="space-y-3">
                  {employee.history.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {h.summary}
                        </span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          Efektif {h.effectiveDate}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Sebelum:</span> {h.oldValue}{' '}
                        <span className="mx-1.5 text-slate-400">→</span>{' '}
                        <span className="text-slate-400">Sesudah:</span>{' '}
                        <span className="font-medium">{h.newValue}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Aktor: {h.actor} · Alasan: {h.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                  {t.securityMfa}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  MFA wajib untuk peran sensitif; step-up authentication aktif untuk perubahan rekening dan ekspor payroll.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Multi-Factor Authentication (Authenticator App)
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Status saat ini: {mfaEnabled ? 'Aktif & Terverifikasi' : 'Nonaktif'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnabled((p) => !p)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold ${
                    mfaEnabled
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mfaEnabled ? 'MFA Aktif' : 'Aktifkan MFA'}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[
                  { id: 'sess-1', device: 'Chrome Desktop · macOS (Sesi Ini)', ip: '103.144.82.19 · Jakarta', current: true },
                  { id: 'sess-2', device: 'Humera Mobile · Android 15', ip: '182.1.44.92 · Jakarta', current: false },
                ].map((sess) => {
                  const revoked = revokedDeviceIds.includes(sess.id);
                  return (
                    <div key={sess.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {sess.device}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                          {sess.ip}
                        </div>
                      </div>
                      {sess.current ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Sesi Aktif
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={revoked}
                          onClick={() => setRevokedDeviceIds((p) => [...p, sess.id])}
                          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-red-600 dark:text-red-400 disabled:opacity-40"
                        >
                          {revoked ? 'Dicabut' : 'Logout Perangkat'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSubTab === 'audit' && isAdminContext && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                  {t.auditTrail}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Catatan append-only untuk seluruh perubahan kritis, otorisasi, ekspor, dan akses data sensitif.
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Aktor</th>
                      <th className="py-2.5 px-3">Domain</th>
                      <th className="py-2.5 px-3">Aksi</th>
                      <th className="py-2.5 px-3">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {log.actor} ({log.actorRole})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 capitalize">
                          {log.domain}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {log.target}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
