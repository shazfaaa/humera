import { useState } from "react";
const SIZE_CLASSES = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-lg"
};
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
function Avatar({ name, src, size = "md" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div
      aria-label={name}
      className={`${SIZE_CLASSES[size]} rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center font-semibold shrink-0 select-none`}
    >
        {getInitials(name)}
      </div>;
  }
  return <img
    src={src}
    alt={name}
    referrerPolicy="no-referrer"
    onError={() => setFailed(true)}
    className={`${SIZE_CLASSES[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800`}
  />;
}
export {
  Avatar
};
