import React from 'react';
import { Globe } from 'lucide-react';
import { translations } from '../i18n';

export default function Navbar({ activeRole, setActiveRole, lang, setLang, activeUser }) {
  const t = translations[lang] || translations.en;

  const roles = [
    { id: 'LEARNER', label: t.roleLearner },
    { id: 'COORDINATOR', label: t.roleCoordinator },
    { id: 'SME_REVIEWER', label: t.roleSme },
    { id: 'MOSPI_ADMIN', label: t.roleAdmin },
  ];

  return (
    <header className="sticky top-0 z-50 nav-glass px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Ministry Branding */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">
                {t.portalTitle}
              </span>
              <span className="badge badge-accent text-[11px] hidden sm:inline-flex">
                MoSPI • SIH26101
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {t.portalSubtitle}
            </p>
          </div>
        </div>

        {/* Center: 4-Role Switcher */}
        <nav className="flex items-center bg-[#0B0F19] p-1 rounded-md border border-[#1E293B] overflow-x-auto max-w-full">
          {roles.map((r) => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1F2937] text-white font-semibold border border-[#334155] shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Exactly ONE Single Language Switcher */}
        <div className="flex items-center">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            aria-label="Toggle language between English and Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{t.langToggle}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
