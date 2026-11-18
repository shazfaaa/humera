import { useState } from 'react';
import {
  Check,
  Plane,
  Plus,
  Receipt,
  WalletCards,
  X,
} from 'lucide-react';
import type {
  EmployeeRecord,
  Language,
  LoanRecord,
  ReimbursementClaim,
  TravelSettlementRecord,
} from '../types/hcm';
import {
  calculateTravelSettlement,
  formatIDR,
  generateLoanInstallments,
} from '../utils/hcmRules';

interface ExpenseTravelLoanViewProps {
  language: Language;
  isEssMode: boolean;
  currentEmployee: EmployeeRecord;
  reimbursements: ReimbursementClaim[];
  travelSettlements: TravelSettlementRecord[];
  loans: LoanRecord[];
  onSubmitReimbursement: (payload: {
    category: ReimbursementClaim['category'];
    amount: number;
    description: string;
  }) => void;
  onApproveReimbursement: (id: string, approved: boolean) => void;
}

export function ExpenseTravelLoanView({
  isEssMode,
  currentEmployee,
  reimbursements,
  travelSettlements,
  loans,
  onSubmitReimbursement,
  onApproveReimbursement,
}: ExpenseTravelLoanViewProps) {
  const [subTab, setSubTab] = useState<'reimbursement' | 'travel' | 'loans'>('reimbursement');

  // New reimbursement form
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimCategory, setClaimCategory] = useState<ReimbursementClaim['category']>('internet_wfh');
  const [claimAmount, setClaimAmount] = useState('350000');
  const [claimDesc, setClaimDesc] = useState('');

  // Loan calculator preview state (FSD Rule 12)
  const [simPrincipal, setSimPrincipal] = useState(10_000_000);
  const [simTenor, setSimTenor] = useState(12);
  const simulatedInstallments = generateLoanInstallments(
    Math.max(simPrincipal, 100_000),
    Math.max(simTenor, 1),
    '2026-11-01'
  );

  const visibleClaims = isEssMode
    ? reimbursements.filter((r) => r.employeeId === currentEmployee.id)
    : reimbursements;
  const visibleTravels = isEssMode
    ? travelSettlements.filter((t) => t.employeeId === currentEmployee.id)
    : travelSettlements;
  const visibleLoans = isEssMode
    ? loans.filter((l) => l.employeeId === currentEmployee.id)
    : loans;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(claimAmount);
    if (!numeric || numeric <= 0 || !claimDesc.trim()) return;
    onSubmitReimbursement({
      category: claimCategory,
      amount: numeric,
      description: claimDesc.trim(),
    });
    setClaimDesc('');
    setShowClaimForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Expense, Business Travel Settlement &amp; Pinjaman
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perhitungan settlement dinas mengecualikan biaya langsung perusahaan dan pembulatan cicilan rupiah bulat.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {[
            { id: 'reimbursement', label: 'Reimbursement', icon: Receipt },
            { id: 'travel', label: 'Travel Settlement', icon: Plane },
            { id: 'loans', label: 'Pinjaman & Cicilan', icon: WalletCards },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                subTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'reimbursement' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowClaimForm((p) => !p)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showClaimForm ? 'Tutup Form' : 'Ajukan Reimbursement'}</span>
            </button>
          </div>

          {showClaimForm && (
            <form
              onSubmit={handleClaimSubmit}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
            >
              <div>
                <label className="block text-slate-500 mb-1">Kategori</label>
                <select
                  value={claimCategory}
                  onChange={(e) => setClaimCategory(e.target.value as ReimbursementClaim['category'])}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="internet_wfh">Tunjangan Internet WFH</option>
                  <option value="field_fuel_toll">BBM &amp; Tol Lapangan</option>
                  <option value="medical">Klaim Kesehatan</option>
                  <option value="equipment">Perlengkapan Kerja</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Nominal (IDR)</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Keterangan</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={claimDesc}
                    onChange={(e) => setClaimDesc(e.target.value)}
                    placeholder="Keterangan klaim..."
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-indigo-600 text-white font-semibold"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Karyawan · Cost Center</th>
                  <th className="py-3 px-4">Kategori &amp; Keterangan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Status / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{claim.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {claim.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{claim.costCenter}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{claim.category}</span> — {claim.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatIDR(claim.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {claim.status === 'pending' && !isEssMode ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApproveReimbursement(claim.id, false)}
                            aria-label="Tolak klaim"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onApproveReimbursement(claim.id, true)}
                            aria-label="Setujui klaim"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-semibold capitalize ${
                            claim.status === 'approved' || claim.status === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : claim.status === 'rejected'
                                ? 'text-red-600'
                                : 'text-amber-600'
                          }`}
                        >
                          {claim.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'travel' && (
        <div className="space-y-4">
          {visibleTravels.map((ts) => {
            const calc = calculateTravelSettlement(ts.cashAdvance, ts.items);
            return (
              <div
                key={ts.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {ts.employeeName} — {ts.destination}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {ts.startDate} s/d {ts.endDate} · Status: {ts.status}
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-500">Uang Muka (Cash Advance)</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatIDR(ts.cashAdvance)}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl border-slate-200 dark:border-slate-800 text-xs">
                  {ts.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.description}
                        </span>
                        <span className="ml-2 text-[11px] text-slate-400">
                          ({item.paidBy === 'company_direct' ? 'Dibayar Langsung Perusahaan — dikecualikan dari settlement' : 'Dibayar Karyawan'})
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                        {formatIDR(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-slate-500">Biaya Eligible Karyawan</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatIDR(calc.actualApprovedEmployeePaid)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
                    <div className="text-emerald-700 dark:text-emerald-300">Payable to Employee</div>
                    <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {formatIDR(calc.payableToEmployee)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
                    <div className="text-amber-700 dark:text-amber-300">Refundable to Company</div>
                    <div className="font-mono font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                      {formatIDR(calc.refundableToCompany)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ledger Pinjaman &amp; Cicilan Aktif
            </h3>
            {visibleLoans.map((loan) => (
              <div key={loan.id} className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {loan.employeeName} · Pinjaman {loan.loanType}
                    </div>
                    <div className="text-slate-500 font-mono">
                      Pokok: {formatIDR(loan.principalAmount)} · Tenor {loan.tenorMonths} bulan
                    </div>
                  </div>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {loan.status}
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto border rounded-xl border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {loan.installments.map((inst) => (
                    <div
                      key={inst.installmentNumber}
                      className="px-3.5 py-2.5 flex items-center justify-between font-mono tabular-nums"
                    >
                      <span>
                        Cicilan #{inst.installmentNumber} · {inst.dueDate}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatIDR(inst.amount)}
                        </span>
                        <span
                          className={`font-sans text-[11px] font-medium ${
                            inst.status === 'reconciled_paid'
                              ? 'text-emerald-600'
                              : inst.status === 'reserved_in_payroll'
                                ? 'text-amber-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Simulator Pembulatan Cicilan (Rule 12)
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Memastikan total seluruh cicilan rupiah bulat sama persis dengan pokok pinjaman (sisa pembagian masuk ke cicilan terakhir).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Pokok Pinjaman (IDR)</label>
                <input
                  type="number"
                  value={simPrincipal}
                  onChange={(e) => setSimPrincipal(Number(e.target.value) || 1000000)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Tenor (Bulan)</label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={simTenor}
                  onChange={(e) => setSimTenor(Number(e.target.value) || 1)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 font-mono">
              <div>
                Cicilan 1–{Math.max(simTenor - 1, 1)}:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatIDR(simulatedInstallments[0]?.amount ?? 0)}
                </span>
              </div>
              <div>
                Cicilan Terakhir (#{simTenor}):{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatIDR(simulatedInstallments[simulatedInstallments.length - 1]?.amount ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
