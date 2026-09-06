import React from 'react';
import { Globe, Award, Sparkles } from 'lucide-react';
import { translations } from '../i18n';

export default function Navbar({ activeTab, setActiveTab, lang, setLang, activeUser }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const navItems = [
    { id: 'OVERVIEW', label: t.tabOverview || "Overview", highlight: false },
    { id: 'JUDGE_MODE', label: t.tabJudgeMode || "Judge Mode (Live Demo)", highlight: true },
    { id: 'LEARNER', label: t.tabLearner || "Statistical Officer", highlight: false },
    { id: 'AI_INSIGHTS', label: t.tabAiInsights || "AI Decisions & IRT", highlight: false },
    { id: 'COORDINATOR', label: t.tabCoordinator || "Training Coordinator", highlight: false },
    { id: 'SME_REVIEWER', label: t.tabSme || "Content Reviewer (SME)", highlight: false },
    { id: 'MOSPI_ADMIN', label: t.tabAdmin || "MoSPI Admin", highlight: false },
    { id: 'ARCHITECTURE', label: t.tabArchitecture || "Architecture", highlight: false },
    { id: 'SECURITY', label: t.tabSecurity || "Security & Privacy", highlight: false },
    { id: 'SCALE', label: t.tabScale || "Scale & Impact", highlight: false },
  ];

  return (
    <header className="sticky top-0 z-50 nav-glass px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Ministry Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('OVERVIEW')} 
              className="text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  {t.portalTitle}
                </span>
                <span className="badge badge-accent text-[11px] hidden sm:inline-flex">
                  MoSPI • SIH26101
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                {t.portalSubtitle}
              </p>
            </button>
          </div>

          {/* Right: Exactly ONE Language Switcher */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              aria-label="Toggle language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{t.langToggle}</span>
            </button>
          </div>
        </div>

        {/* Bottom Nav: Clean Horizontal Tab Bar */}
        <nav className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-[#1E293B] overflow-x-auto gap-1 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1F2937] text-white font-bold border border-amber-500/50 shadow-sm text-amber-300'
                    : item.highlight
                    ? 'text-amber-400 font-semibold bg-amber-500/10 hover:bg-amber-500/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                }`}
              >
                {item.highlight && <Sparkles className="w-3 h-3 text-amber-400" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
