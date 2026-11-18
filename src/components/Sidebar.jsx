import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CreditCard,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquareHeart,
  Receipt,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wallet,
  X
} from "lucide-react";
import { translations } from "../i18n/translations";
import { Avatar } from "./Avatar";
function Sidebar({
  workspaceMode,
  onChangeWorkspaceMode,
  activeAdminTab,
  onSelectAdminTab,
  activeEssTab,
  onSelectEssTab,
  language,
  currentUser,
  latestAnnouncement,
  onOpenAnnouncements,
  mobileOpen,
  onCloseMobile
}) {
  const t = translations[language];
  const adminGroups = [
    {
      title: t.navOverview,
      items: [
        { id: "dashboard", label: t.navDashboard, icon: LayoutDashboard },
        { id: "employees", label: t.navEmployees, icon: Users },
        { id: "recruitment", label: t.navRecruitment, icon: Briefcase }
      ]
    },
    {
      title: t.navWorkforce,
      items: [
        { id: "attendance", label: t.navAttendance, icon: CalendarClock },
        { id: "leave", label: t.navLeave, icon: CalendarDays },
        { id: "payroll", label: t.navPayroll, icon: Wallet },
        { id: "expense", label: t.navExpense, icon: Receipt }
      ]
    },
    {
      title: t.navOperations,
      items: [
        { id: "performance", label: t.navPerformance, icon: GraduationCap },
        { id: "operations", label: t.navOperationsOps, icon: Building2 },
        { id: "settings", label: t.navSettings, icon: Settings }
      ]
    }
  ];
  const essItems = [
    { id: "ess_home", label: t.essHome, icon: LayoutDashboard },
    { id: "ess_attendance", label: t.essAttendance, icon: CalendarClock },
    { id: "ess_leave", label: t.essLeave, icon: CalendarDays },
    { id: "ess_payroll", label: t.essPayroll, icon: CreditCard },
    { id: "ess_expense", label: t.essExpense, icon: Receipt },
    { id: "ess_performance", label: t.essPerformance, icon: FileCheck2 },
    { id: "ess_helpdesk", label: t.essHelpdesk, icon: MessageSquareHeart },
    { id: "ess_profile", label: t.essProfile, icon: UserCircle2 }
  ];
  const sidebarContent = <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {
    /* Brand Header */
  }
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-xs">
            HM
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            {t.brandName}
          </span>
        </div>
        <button
    type="button"
    onClick={onCloseMobile}
    aria-label="Close navigation menu"
    className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
  >
          <X className="w-4 h-4" />
        </button>
      </div>

      {
    /* Workspace Mode Switcher: Admin HR vs ESS Saya */
  }
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div
    role="tablist"
    aria-label="Workspace mode"
    className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/70 dark:border-slate-700/60"
  >
          <button
    type="button"
    role="tab"
    aria-selected={workspaceMode === "admin"}
    onClick={() => {
      onChangeWorkspaceMode("admin");
      onCloseMobile();
    }}
    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${workspaceMode === "admin" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
  >
            {t.adminWorkspace}
          </button>
          <button
    type="button"
    role="tab"
    aria-selected={workspaceMode === "ess"}
    onClick={() => {
      onChangeWorkspaceMode("ess");
      onCloseMobile();
    }}
    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${workspaceMode === "ess" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
  >
            {t.essWorkspace}
          </button>
        </div>
      </div>

      {
    /* Navigation Links */
  }
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {workspaceMode === "admin" ? adminGroups.map((group) => <div key={group.title}>
              <div className="px-3 mb-1.5 text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
                {group.title}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
    const Icon = item.icon;
    const active = activeAdminTab === item.id;
    return <li key={item.id}>
                      <button
      type="button"
      onClick={() => {
        onSelectAdminTab(item.id);
        onCloseMobile();
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}`}
    >
                        <Icon
      className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
    />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>;
  })}
              </ul>
            </div>) : <div>
            <div className="px-3 mb-1.5 text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
              {t.essWorkspace}
            </div>
            <ul className="space-y-0.5">
              {essItems.map((item) => {
    const Icon = item.icon;
    const active = activeEssTab === item.id;
    return <li key={item.id}>
                    <button
      type="button"
      onClick={() => {
        onSelectEssTab(item.id);
        onCloseMobile();
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}`}
    >
                      <Icon
      className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
    />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>;
  })}
            </ul>
          </div>}
      </nav>

      {
    /* Bottom Announcements Widget (matching Image 1) & User Card (matching Image 2) */
  }
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 shrink-0">
        {latestAnnouncement && <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {t.announcements}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {latestAnnouncement.title}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <button
    type="button"
    onClick={onOpenAnnouncements}
    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
  >
                {workspaceMode === "admin" ? t.createNow : t.stayUpdated}
              </button>
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                {latestAnnouncement.readCount}/{latestAnnouncement.totalTargetCount}
              </span>
            </div>
          </div>}

        <button
    type="button"
    onClick={() => {
      if (workspaceMode === "admin") {
        onSelectAdminTab("settings");
      } else {
        onSelectEssTab("ess_profile");
      }
      onCloseMobile();
    }}
    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-left"
  >
          <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">{currentUser.role}</span>
            </div>
          </div>
        </button>
      </div>
    </div>;
  return <>
      {
    /* Desktop Sidebar */
  }
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen shrink-0">{sidebarContent}</aside>

      {
    /* Mobile Drawer */
  }
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
    className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
    onClick={onCloseMobile}
    aria-hidden="true"
  />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>}
    </>;
}
export {
  Sidebar
};
