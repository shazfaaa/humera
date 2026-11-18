import { useState } from 'react';
import {
  Car,
  CheckCircle2,
  Lock,
  Megaphone,
  MessageSquare,
  Plus,
  Send,
  Shield,
  UserCheck,
} from 'lucide-react';
import type {
  AnnouncementItem,
  HelpdeskTicket,
  Language,
  VehicleLog,
  VisitorEntry,
} from '../types/hcm';

interface OperationsHelpdeskViewProps {
  language: Language;
  isEssMode: boolean;
  currentUserName: string;
  visitors: VisitorEntry[];
  vehicles: VehicleLog[];
  tickets: HelpdeskTicket[];
  announcements: AnnouncementItem[];
  onAdmitVisitor: (visitorId: string) => void;
  onReplyTicket: (ticketId: string, message: string, isInternalNote: boolean) => void;
  onCreateTicket: (payload: {
    subject: string;
    category: HelpdeskTicket['category'];
    isConfidential: boolean;
    message: string;
  }) => void;
  onOpenCreateAnnouncement: () => void;
  onAcknowledgeAnnouncement: (id: string) => void;
}

export function OperationsHelpdeskView({
  isEssMode,
  currentUserName,
  visitors,
  vehicles,
  tickets,
  announcements,
  onAdmitVisitor,
  onReplyTicket,
  onCreateTicket,
  onOpenCreateAnnouncement,
  onAcknowledgeAnnouncement,
}: OperationsHelpdeskViewProps) {
  const [subTab, setSubTab] = useState<'helpdesk' | 'announcements' | 'visitor' | 'vehicle'>(
    'helpdesk'
  );
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id ?? '');
  const [replyText, setReplyText] = useState('');
  const [asInternalNote, setAsInternalNote] = useState(false);

  // New ticket form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<HelpdeskTicket['category']>('payroll');
  const [isConfidential, setIsConfidential] = useState(false);
  const [firstMsg, setFirstMsg] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    onReplyTicket(selectedTicket.id, replyText.trim(), isEssMode ? false : asInternalNote);
    setReplyText('');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !firstMsg.trim()) return;
    onCreateTicket({
      subject: subject.trim(),
      category,
      isConfidential,
      message: firstMsg.trim(),
    });
    setSubject('');
    setFirstMsg('');
    setShowTicketForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {isEssMode
              ? 'HR Helpdesk & Pengumuman Perusahaan'
              : 'Operasional Lapangan, Helpdesk & Pengumuman'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Internal notes tidak pernah dikirim ke karyawan (Rule 13); registrasi tamu memerlukan verifikasi masuk (Rule 16).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setSubTab('helpdesk')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${
              subTab === 'helpdesk'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Helpdesk HR</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('announcements')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${
              subTab === 'announcements'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Pengumuman</span>
          </button>
          {!isEssMode && (
            <>
              <button
                type="button"
                onClick={() => setSubTab('visitor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${
                  subTab === 'visitor'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Visitor Gate</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('vehicle')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 ${
                  subTab === 'vehicle'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Armada</span>
              </button>
            </>
          )}
        </div>
      </div>

      {subTab === 'helpdesk' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowTicketForm((p) => !p)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showTicketForm ? 'Tutup Form' : 'Buat Tiket HR Baru'}</span>
            </button>
          </div>

          {showTicketForm && (
            <form
              onSubmit={handleCreateTicketSubmit}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Subjek Tiket</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Klarifikasi tunjangan dinas"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HelpdeskTicket['category'])}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="payroll">Payroll &amp; Pajak</option>
                    <option value="leave">Cuti &amp; Absensi</option>
                    <option value="it_access">Akses IT</option>
                    <option value="ethics_confidential">Laporan Etik (Confidential)</option>
                  </select>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                />
                <span>Kirim sebagai Confidential / Pseudonymous (identitas disamarkan dari agen lini pertama)</span>
              </label>
              <textarea
                rows={2}
                value={firstMsg}
                onChange={(e) => setFirstMsg(e.target.value)}
                placeholder="Jelaskan detail pertanyaan atau laporan Anda..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Ticket List */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((tkt) => (
                <button
                  key={tkt.id}
                  type="button"
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedTicket?.id === tkt.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {tkt.id} · {tkt.channel}
                    </span>
                    <span className="text-slate-400 font-mono">SLA {tkt.slaHoursRemaining}j</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {tkt.subject}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    {tkt.isConfidential && <Lock className="w-3 h-3 text-amber-500" />}
                    <span>{tkt.requesterName}</span>
                    <span>· {tkt.status}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Ticket Thread */}
            {selectedTicket && (
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pelapor: {selectedTicket.requesterName} · Dibuat {selectedTicket.createdAt}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs max-h-64 overflow-y-auto pr-1">
                    {selectedTicket.publicReplies.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          <span>{r.sender}</span>
                          <span className="font-mono text-slate-400">{r.time}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{r.message}</p>
                      </div>
                    ))}

                    {/* Internal Notes: STRICTLY hidden in ESS mode per FSD Rule 13 */}
                    {!isEssMode &&
                      selectedTicket.internalNotes.map((n, i) => (
                        <div
                          key={`note-${i}`}
                          className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60"
                        >
                          <div className="flex justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            <span>Internal Note (HR Only — Tersembunyi dari Employee): {n.agent}</span>
                            <span className="font-mono">{n.time}</span>
                          </div>
                          <p className="text-amber-900 dark:text-amber-200">{n.note}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <form onSubmit={handleSendReply} className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {!isEssMode && (
                    <label className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                      <input
                        type="checkbox"
                        checked={asInternalNote}
                        onChange={(e) => setAsInternalNote(e.target.checked)}
                      />
                      <span>Simpan sebagai Internal Note (tidak dikirim ke {currentUserName})</span>
                    </label>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        asInternalNote && !isEssMode
                          ? 'Tulis catatan internal HR...'
                          : 'Tulis balasan publik...'
                      }
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'announcements' && (
        <div className="space-y-4">
          {!isEssMode && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onOpenCreateAnnouncement}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Terbitkan Pengumuman Baru</span>
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {ann.title}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {ann.publishedAt}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ann.body}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ann.targetAudience}</span>
                  {isEssMode ? (
                    ann.acknowledgedByMe ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terkonfirmasi
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAnnouncement(ann.id)}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Tandai Dibaca
                      </button>
                    )
                  ) : (
                    <span className="font-mono font-semibold">
                      Read Audit: {ann.readCount}/{ann.totalTargetCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'visitor' && !isEssMode && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4">Tamu &amp; Instansi</th>
                <th className="py-3 px-4">Host &amp; Tujuan</th>
                <th className="py-3 px-4">Estimasi Keluar</th>
                <th className="py-3 px-4 text-right">Admission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{v.badgeCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{v.visitorName}</div>
                    <div className="text-[11px] text-slate-400">{v.company}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    Host: {v.hostName} · {v.purpose}
                  </td>
                  <td className="py-3 px-4 font-mono">{v.expectedExit} WIB</td>
                  <td className="py-3 px-4 text-right">
                    {v.status === 'pre_registered' ? (
                      <button
                        type="button"
                        onClick={() => onAdmitVisitor(v.id)}
                        className="h-7 px-3 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Verifikasi &amp; Check-In</span>
                      </button>
                    ) : (
                      <span className="font-semibold text-emerald-600">{v.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'vehicle' && !isEssMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {veh.plateNumber}
                </span>
                <span
                  className={`font-semibold ${
                    veh.status === 'available' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {veh.status}
                </span>
              </div>
              <div className="font-medium text-slate-700 dark:text-slate-300">
                {veh.vehicleModel} · Driver: {veh.driverName}
              </div>
              <div className="text-slate-500 font-mono">
                Odometer Keluar: {veh.odometerOut.toLocaleString('id-ID')} km · SIM Berlaku s/d{' '}
                {veh.licenseExpiry}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
