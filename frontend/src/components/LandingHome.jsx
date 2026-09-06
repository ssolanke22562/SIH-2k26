import React from 'react';
import { translations } from '../i18n';

export default function LandingHome({ lang, onStartDemo, onExploreArchitecture, onNavigateTab }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Value Proposition Banner */}
      <div className="hero-soft p-8 lg:p-10 border border-[#1E293B]">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-accent text-xs">
              Smart India Hackathon 2026 • SIH26101
            </span>
            <span className="badge badge-default text-xs">
              Ministry of Statistics and Programme Implementation (MoSPI)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
            {isHi 
              ? "मूल्यांकन डेटा से व्यक्तिगत शिक्षण बुद्धिमत्ता तक" 
              : "From Assessment Data to Personalized Learning Intelligence"}
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-3xl">
            {isHi
              ? "यह मंच सांख्यिकी अधिकारियों के कौशल की निरंतर जांच करता है, दक्षता अंतराल की पहचान करता है, परीक्षण कठिनाई को स्वचालित रूप से समायोजित करता है और iGOT कर्मयोगी पाठ्यक्रमों की सटीक सिफारिश करता है।"
              : "A national-scale psychometric and RAG platform that continuously assesses statistical officers, diagnoses competency gaps with Item Response Theory (IRT), dynamically adjusts assessment difficulty, and generates verifiable training pathways aligned with iGOT Karmayogi."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button onClick={onStartDemo} className="btn-accent text-sm py-2.5 px-5">
              <span>{isHi ? "लाइव जज डेमो शुरू करें (2-3 मिनट)" : "Start Live Judge Demo (2-3 Min)"}</span>
              <span>→</span>
            </button>
            <button onClick={onExploreArchitecture} className="btn-secondary text-sm py-2.5 px-5">
              <span>{isHi ? "तकनीकी वास्तुकला देखें" : "Explore Technical Architecture"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Compact Problem → Solution → Impact Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Problem */}
        <div className="data-card p-5 space-y-2 border-t-2 border-t-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              {isHi ? "01. समस्या" : "01. The Problem"}
            </span>
            <span className="badge badge-danger text-[10px]">Current Baseline</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            {isHi ? "स्थैतिक और गैर-अनुकूली प्रशिक्षण" : "Static & Non-Adaptive Training"}
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {isHi
              ? "भारत के सांख्यिकी तंत्र में 50,000+ अधिकारी हैं। पारंपरिक प्रशिक्षण सभी के लिए एक समान होता है, जिससे कौशल अंतरालों का समय पर पता नहीं चल पाता।"
              : "India's statistical cadre (NSSO, CSO, State DES) undergoes one-size-fits-all training without objective diagnostics, leading to undetected skill deficits in survey methods."}
          </p>
        </div>

        {/* Solution */}
        <div className="data-card p-5 space-y-2 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {isHi ? "02. समाधान" : "02. The Solution"}
            </span>
            <span className="badge badge-accent text-[10px]">IRT + RAG Triad</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            {isHi ? "मनोवैज्ञानिक CAT और ग्राउंडेड RAG" : "Psychometric CAT & Grounded RAG"}
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {isHi
              ? "2PL IRT मॉडल वास्तविक समय में कठिनाई समायोजित करता है। RAG पाइपलाइन MoSPI नियमावलियों से सटीक संदर्भ के साथ प्रश्न तैयार करती है।"
              : "2-Parameter Logistic (2PL) Item Response Theory measures ability (θ) with Fisher Information, while grounded RAG extracts test items with exact page/section citations."}
          </p>
        </div>

        {/* Impact */}
        <div className="data-card p-5 space-y-2 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {isHi ? "03. परिणाम" : "03. Measured Impact"}
            </span>
            <span className="badge badge-success text-[10px]">Projected Outcome</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            {isHi ? "प्रशिक्षण आरओआई और कौशल सुधार" : "Training ROI & Rapid Gap Closure"}
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {isHi
              ? "परीक्षण समय में 60% की कमी, प्रश्न निर्माण में 68.5% समय की बचत, और पुनः परीक्षण में औसतन +16.4 अंकों का मापा गया सुधार।"
              : "60% reduction in assessment authoring overhead, sub-15 minute diagnostic profiling, and +16.4 pt average score gain upon iGOT module completion."}
          </p>
        </div>
      </div>

      {/* 3. Operational Pillars / Quick Navigation */}
      <div className="data-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isHi ? "प्लेटफ़ॉर्म की मुख्य क्षमताएं" : "Platform Modules & Demonstration Workflows"}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {isHi ? "प्रत्येक मॉड्यूल की कार्यप्रणाली का निरीक्षण करने के लिए क्लिक करें" : "Explore live features across learner diagnostics, AI insights, architecture, and security"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('JUDGE_MODE')}
            className="p-4 rounded bg-[#0F172A] border border-[#1E293B] hover:border-amber-500 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">01. Judge Mode</span>
              <span className="text-xs text-gray-500 group-hover:text-amber-400">→</span>
            </div>
            <div className="text-xs font-semibold text-white">2-3 Min Guided Walkthrough</div>
            <p className="text-[11px] text-[#94A3B8]">Assessment → AI Profile → Adaptive Path → Reassessment loop.</p>
          </button>

          <button
            onClick={() => onNavigateTab('AI_INSIGHTS')}
            className="p-4 rounded bg-[#0F172A] border border-[#1E293B] hover:border-amber-500 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">02. AI Decision Engine</span>
              <span className="text-xs text-gray-500 group-hover:text-indigo-400">→</span>
            </div>
            <div className="text-xs font-semibold text-white">Visible AI Explainability</div>
            <p className="text-[11px] text-[#94A3B8]">Expose raw inputs, mathematical 2PL IRT logic, decisions & rationale.</p>
          </button>

          <button
            onClick={() => onNavigateTab('ARCHITECTURE')}
            className="p-4 rounded bg-[#0F172A] border border-[#1E293B] hover:border-amber-500 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">03. Architecture</span>
              <span className="text-xs text-gray-500 group-hover:text-emerald-400">→</span>
            </div>
            <div className="text-xs font-semibold text-white">End-to-End System Pipeline</div>
            <p className="text-[11px] text-[#94A3B8]">FastAPI microservices, vector retrieval, and iGOT REST/xAPI adapter.</p>
          </button>

          <button
            onClick={() => onNavigateTab('SECURITY')}
            className="p-4 rounded bg-[#0F172A] border border-[#1E293B] hover:border-amber-500 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">04. Security & Scale</span>
              <span className="text-xs text-gray-500 group-hover:text-amber-400">→</span>
            </div>
            <div className="text-xs font-semibold text-white">MeitY Cloud & Sovereign AI</div>
            <p className="text-[11px] text-[#94A3B8]">Air-gapped on-premise execution, immutable audit ledger, and RBAC.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
