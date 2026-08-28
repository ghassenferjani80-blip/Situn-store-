import { useState } from "react";
import { ChevronDown, Globe2 } from "lucide-react";

const languages = [
  ["ar", "العربية"],
  ["fr", "FR"],
  ["en", "EN"],
  ["es", "ES"],
  ["it", "IT"],
  ["de", "DE"],
  ["pt", "PT"],
  ["tr", "TR"],
  ["nl", "NL"],
] as const;

export default function LanguageDock() {
  const [open, setOpen] = useState(false);
  const current = window.localStorage.getItem("situn-language") ?? "fr";
  const currentLabel = languages.find(([value]) => value === current)?.[1] ?? "FR";

  const choose = (language: string) => {
    window.localStorage.setItem("situn-language", language);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="language-dock" dir="ltr">
      <button className="language-dock-trigger" type="button" aria-label="تغيير اللغة" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Globe2 size={17} />
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={open ? "language-dock-chevron open" : "language-dock-chevron"} />
      </button>
      {open && <div className="language-dock-menu" role="menu">{languages.map(([value, label]) => <button key={value} type="button" role="menuitem" className={current === value ? "active" : ""} onClick={() => choose(value)}>{label}</button>)}</div>}
    </div>
  );
}
