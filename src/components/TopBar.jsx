import { useState } from "react";
import {
  Bell,
  Download,
  Menu,
  Moon,
  Plus,
  Search,
  Sun
} from "lucide-react";
import { translations } from "../i18n/translations";
function TopBar({
  pageTitle,
  breadcrumbParent,
  searchQuery,
  onSearchChange,
  language,
  onChangeLanguage,
  theme,
  onToggleTheme,
  unreadNotifications,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
  onOpenMobileMenu
}) {
  const t = translations[language];
  const [notifOpen, setNotifOpen] = useState(false);
  return <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-7 flex items-center justify-between gap-4 shrink-0">
      {
    /* Left: Mobile Trigger & Breadcrumb Title */
  }
      <div className="flex items-center gap-3 min-w-0">
        <button
    type="button"
    onClick={onOpenMobileMenu}
    aria-label="Open navigation menu"
    className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
  >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">{breadcrumbParent}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
              {pageTitle}
            </span>
          </div>
          <h1 className="text-base lg:text-lg font-display font-semibold text-slate-900 dark:text-white truncate leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {
    /* Center/Right: Search + Controls + Primary CTA */
  }
      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
        <div className="hidden md:flex items-center relative w-56 xl:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
    type="search"
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    placeholder={t.quickSearch}
    aria-label={t.quickSearch}
    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
  />
        </div>

        {
    /* Language Toggle (ID / EN) */
  }
        <div
    role="group"
    aria-label="Language Switcher"
    className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700"
  >
          <button
    type="button"
    onClick={() => onChangeLanguage("id")}
    className={`px-1.5 sm:px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${language === "id" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
  >
            ID
          </button>
          <button
    type="button"
    onClick={() => onChangeLanguage("en")}
    className={`px-1.5 sm:px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${language === "en" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
  >
            EN
          </button>
        </div>

        {
    /* Light / Dark Mode Toggle */
  }
        <button
    type="button"
    onClick={onToggleTheme}
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
  >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {
    /* Notifications Popover */
  }
        <div className="relative">
          <button
    type="button"
    onClick={() => setNotifOpen((prev) => !prev)}
    aria-label="Notifications"
    aria-expanded={notifOpen}
    className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center relative transition-colors"
  >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {unreadNotifications.length}
              </span>}
          </button>

          {notifOpen && <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-40 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {language === "id" ? "Notifikasi & Pengingat" : "Notifications & Alerts"}
                </span>
                <button
    type="button"
    onClick={() => setNotifOpen(false)}
    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
  >
                  {language === "id" ? "Tutup" : "Close"}
                </button>
              </div>
              <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {unreadNotifications.map((n) => <li
    key={n.id}
    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
  >
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {n.time}
                    </p>
                  </li>)}
              </ul>
            </div>}
        </div>

        {
    /* Optional Secondary Action */
  }
        {onSecondaryAction && secondaryActionLabel && <button
    type="button"
    onClick={onSecondaryAction}
    className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
  >
            <Download className="w-3.5 h-3.5" />
            <span>{secondaryActionLabel}</span>
          </button>}

        {
    /* Primary Action */
  }
        <button
    type="button"
    onClick={onPrimaryAction}
    aria-label={primaryActionLabel}
    className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
  >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{primaryActionLabel}</span>
        </button>
      </div>
    </header>;
}
export {
  TopBar
};
