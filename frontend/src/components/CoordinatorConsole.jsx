import React, { useState, useEffect } from 'react';
import { translations, cadreTranslations } from '../i18n';
import { API_BASE } from '../config';

export default function CoordinatorConsole({ lang, activeUser }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [cohortData, setCohortData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedComp, setSelectedComp] = useState('comp_sampling');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  useEffect(() => {
    fetchCoordinatorData();
    fetchDocuments();
  }, []);

  const fetchCoordinatorData = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/coordinator`);
      if (res.ok) {
        const data = await res.json();
        setCohortData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc(data.documents[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedDoc) return;
    setIsGenerating(true);
    setGenResult(null);
    try {
      const res = await fetch(`${API_BASE}/documents/generate-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: selectedDoc,
          competency_id: selectedComp,
          num_questions: 2,
          difficulty: 'MEDIUM'
        })
      });
      const data = await res.json();
      setGenResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMandateCourse = async (officerId) => {
    try {
      await fetch(`${API_BASE}/recommendations/coordinator-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinator_id: activeUser.id,
          target_user_id: officerId,
          course_id: 'igot_crs_01',
          mandatory_due_date: '2026-10-31'
        })
      });
      alert(t.trainingAssignedAlert);
      fetchCoordinatorData();
    } catch (err) {
      console.error(err);
    }
  };

  const divisionName = isHi ? "पश्चिमी क्षेत्रीय इकाई (महाराष्ट्र एवं गोवा)" : (cohortData?.division_name || "Western Regional Unit");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hero-soft p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{t.coordinatorTitle}</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">{t.coordinatorSubtitle}</p>
          </div>
          <span className="badge badge-default">
            {divisionName}
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.totalCadre}</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{cohortData?.total_cadre_strength || 84}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{t.officersInDivision}</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.diagnosticsTaken}</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{cohortData?.diagnostics_completed_count || 68}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{t.completedDiagnostics}</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.completionRate}</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{cohortData?.completion_rate_pct || 80.9}%</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{t.divisionCompletionRate}</div>
        </div>
      </div>

      {/* Grid: Officer Table & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Officer List Table */}
        <div className="lg:col-span-6 data-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
              {t.atRiskTitle}
            </h3>
            <span className="badge badge-danger text-[10px]">
              {(cohortData?.at_risk_officers || []).length} {t.incompleteCount}
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {(cohortData?.active_cohort || []).slice(0, 5).map((officer) => {
              const cadreLabel = isHi && cadreTranslations[officer.cadre] ? cadreTranslations[officer.cadre] : officer.cadre;
              return (
                <div key={officer.id} className="p-3 rounded bg-[#0F172A] border border-[#1E293B] flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-white">{officer.full_name}</div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      {officer.official_id} • {cadreLabel}
                    </div>
                  </div>

                  <div>
                    {officer.has_completed_diagnostic ? (
                      <span className="badge badge-success text-[10px]">
                        {t.completedBadge}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMandateCourse(officer.id)}
                        className="btn-accent text-[11px] py-1 px-2.5"
                      >
                        {t.mandateTrainingBtn}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Generator */}
        <div className="lg:col-span-6 data-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
              {t.ragAuthoringTitle}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                {t.docSelectLabel}
              </label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full form-control"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.document_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                {t.compSelectLabel}
              </label>
              <select
                value={selectedComp}
                onChange={(e) => setSelectedComp(e.target.value)}
                className="w-full form-control"
              >
                <option value="comp_sampling">{isHi ? "प्रतिचयन सिद्धांत एवं स्तरीकरण (एनएसएस 78वां दौर)" : "Sampling Theory & Stratification (NSS 78th)"}</option>
                <option value="comp_plfs">{isHi ? "पीएलएफएस गतिविधि स्थिति (अनुसूची 10.4)" : "PLFS Activity Status (Schedule 10.4)"}</option>
                <option value="comp_index">{isHi ? "मूल्य सूचकांक संकलन (सीपीआई हैंडबुक)" : "Price Index Compilation (CPI Handbook)"}</option>
                <option value="comp_asi">{isHi ? "उद्योगों का वार्षिक सर्वेक्षण (एएसआई)" : "Annual Survey of Industries (ASI)"}</option>
                <option value="comp_natacc">{isHi ? "राष्ट्रीय लेखा प्रणाली (एसएनए-2008)" : "National Accounts (SNA-2008)"}</option>
              </select>
            </div>

            <button
              disabled={isGenerating || !selectedDoc}
              onClick={handleGenerateQuestions}
              className="btn-accent w-full text-xs justify-center py-2 disabled:opacity-50"
            >
              {isGenerating ? t.generatingNotice : t.generateBtn}
            </button>
          </div>

          {genResult && (
            <div className="p-3 rounded bg-[#0F172A] border border-emerald-500/40 text-xs text-emerald-300">
              <div className="font-semibold mb-0.5">✓ {genResult.message}</div>
              <p className="text-[11px] text-[#94A3B8]">
                {t.sentToReviewQueue}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
