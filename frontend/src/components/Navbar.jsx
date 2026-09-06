import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import MoSpiLogo from './MoSpiLogo';
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
        {/* Top Header Row with High-Visibility Logo & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Ministry Branding & Official Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('OVERVIEW')} 
              className="text-left group flex items-center gap-3 transition-transform hover:scale-[1.01]"
            >
              <MoSpiLogo size="md" showText={false} lang={lang} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base sm:text-lg group-hover:text-amber-400 transition-colors tracking-tight flex items-center gap-1.5">
                    <span>{t.portalTitle}</span>
                    <span className="text-amber-400 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      AI
                    </span>
                  </span>
                  <span className="badge badge-accent text-[11px] hidden sm:inline-flex animate-glow">
                    SIH26101
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  {t.portalSubtitle}
                </p>
              </div>
            </button>
          </div>

          {/* Right: National Status Badge + Language Switcher */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-[11px] text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHi ? "सिस्टम सक्रिय (लाइव)" : "System Active (Live)"}</span>
            </div>

            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm hover:border-amber-500/50"
              aria-label="Toggle language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{t.langToggle}</span>
            </button>
          </div>
        </div>

        {/* Bottom Nav: Clean Horizontal Tab Bar with Subtle Animations */}
        <nav className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-[#1E293B] overflow-x-auto gap-1 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1F2937] text-white font-bold border border-amber-500/50 shadow-sm text-amber-300 transform scale-[1.02]'
                    : item.highlight
                    ? 'text-amber-400 font-semibold bg-amber-500/10 hover:bg-amber-500/20 animate-glow'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                }`}
              >
                {item.highlight && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
