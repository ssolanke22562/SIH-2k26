import React, { useState, useEffect } from 'react';
import RadarChart from './RadarChart';
import { translations, cadreTranslations, competencyTranslations } from '../i18n';
import { API_BASE } from '../config';

export default function LearnerPortal({ lang, activeUser }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [testState, setTestState] = useState('IDLE');
  const [sessionId, setSessionId] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [itemResult, setItemResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [report, setReport] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLatestReportAndRecommendations();
  }, [activeUser]);

  const fetchLatestReportAndRecommendations = async () => {
    try {
      const repRes = await fetch(`${API_BASE}/diagnostic/user/${activeUser.id}/latest-report`);
      if (repRes.ok) {
        const repData = await repRes.json();
        setReport(repData);
      }
      const recRes = await fetch(`${API_BASE}/recommendations/user/${activeUser.id}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.learning_pathway || []);
      }
    } catch (err) {
      console.error('Error fetching learner data:', err);
    }
  };

  const startTest = async () => {
    setIsLoading(true);
    setItemResult(null);
    setSelectedOption(null);
    try {
      const startRes = await fetch(`${API_BASE}/diagnostic/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeUser.id, session_type: 'DIAGNOSTIC' })
      });
      const startData = await startRes.json();
      setSessionId(startData.session_id);
      setTestState('RUNNING');
      await fetchNextItem(startData.session_id);
    } catch (err) {
      console.error('Error starting test:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextItem = async (sId) => {
    setIsLoading(true);
    setItemResult(null);
    setSelectedOption(null);
    try {
      const res = await fetch(`${API_BASE}/diagnostic/${sId}/next-item`);
      const data = await res.json();
      if (data.status === 'COMPLETED' || !data.item) {
        finishTest(sId);
      } else {
        setCurrentItem(data.item);
      }
    } catch (err) {
      console.error('Error fetching item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedOption === null || !currentItem || !sessionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/diagnostic/submit-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentItem.id,
          selected_option: selectedOption,
          response_time_ms: 10000
        })
      });
      const data = await res.json();
      setItemResult(data);

      if (data.is_session_completed) {
        setTimeout(() => finishTest(sessionId), 2000);
      }
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const finishTest = async (sId) => {
    try {
      const repRes = await fetch(`${API_BASE}/diagnostic/${sId}/report`);
      if (repRes.ok) {
        const repData = await repRes.json();
        setReport(repData);
      }
      const recRes = await fetch(`${API_BASE}/recommendations/user/${activeUser.id}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.learning_pathway || []);
      }
      setTestState('IDLE');
    } catch (err) {
      console.error('Error finishing test:', err);
      setTestState('IDLE');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await fetch(`${API_BASE}/recommendations/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeUser.id, course_id: courseId })
      });
      fetchLatestReportAndRecommendations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateCompletion = async (courseId) => {
    try {
      await fetch(`${API_BASE}/recommendations/xapi-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeUser.id, course_id: courseId, score_pct: 90 })
      });
      fetchLatestReportAndRecommendations();
    } catch (err) {
      console.error(err);
    }
  };

  const getCompetencyName = (comp) => {
    if (!comp) return '';
    if (isHi) {
      if (comp.id && competencyTranslations[comp.id]) return competencyTranslations[comp.id].hi;
      if (comp.code) {
        const matchKey = Object.keys(competencyTranslations).find(k => comp.code.toLowerCase().includes(k.replace('comp_', '')));
        if (matchKey) return competencyTranslations[matchKey].hi;
      }
    }
    return comp.name || comp.competency_name || comp.code;
  };

  const cadreLabel = isHi && cadreTranslations[activeUser.cadre] ? cadreTranslations[activeUser.cadre] : activeUser.cadre;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-soft p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{activeUser.full_name}</h2>
            <span className="badge badge-accent">{cadreLabel}</span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            {t.employeeIdLabel}: {activeUser.official_id} • {t.divisionLabel}: {activeUser.division_id} ({t.stateLabel}: {activeUser.state_code})
          </p>
        </div>

        {testState !== 'RUNNING' && (
          <button onClick={startTest} className="btn-accent text-xs">
            {report ? t.retestBtn : t.startDiagnosticBtn}
          </button>
        )}
      </div>

      {/* ADAPTIVE TEST RUNNER */}
      {testState === 'RUNNING' && currentItem && (
        <div className="data-card p-6 border-amber-500/40 space-y-5">
          {/* Question Telemetry Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B] text-xs">
            <div className="flex items-center gap-2">
              <span className="badge badge-default">
                {t.questionOf} {(currentItem.items_completed || 0) + 1} {t.of} {currentItem.total_target_items || 5}
              </span>
              <span className="badge badge-accent">
                {getCompetencyName(currentItem)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[#94A3B8] text-xs font-mono">
              <span>{t.discriminationParam}: {currentItem.irt_a_discrimination}</span>
              <span>{t.difficultyParam}: {currentItem.irt_b_difficulty}</span>
            </div>
          </div>

          {/* Question Stem */}
          <div>
            <h3 className="text-base font-semibold text-white leading-relaxed">
              {isHi && currentItem.stem_hi ? currentItem.stem_hi : currentItem.stem}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {(currentItem.options || []).map((opt) => {
              const isSelected = selectedOption === opt.id;
              const optText = isHi && opt.text_hi ? opt.text_hi : opt.text;
              return (
                <button
                  key={opt.id}
                  disabled={itemResult !== null}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left p-3.5 rounded border text-xs transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white font-medium'
                      : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155] text-[#CBD5E1]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                    isSelected ? 'bg-amber-500 text-black shadow-sm' : 'bg-[#1E293B] text-[#94A3B8]'
                  }`}>
                    {String.fromCharCode(65 + opt.id)}
                  </span>
                  <span className="leading-relaxed">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation & Source Reference */}
          {itemResult && (
            <div className={`p-4 rounded border text-xs space-y-2 ${
              itemResult.is_correct ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span>{itemResult.is_correct ? t.correctMsg : t.incorrectMsg}</span>
                <span className="text-xs text-[#94A3B8] font-mono">{t.yourAbility}: {itemResult.theta_after}</span>
              </div>

              <p className="text-xs text-[#E2E8F0] leading-relaxed">
                {isHi && itemResult.explanation_hi ? itemResult.explanation_hi : itemResult.explanation}
              </p>

              {itemResult.citation_text && (
                <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded text-[11px] text-amber-300 font-mono">
                  <div className="text-[10px] text-[#64748B] uppercase mb-0.5">
                    {t.sourceProvenance} ({t.pageRef} {itemResult.citation_page || 1})
                  </div>
                  "{itemResult.citation_text}"
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-end pt-2">
            {!itemResult ? (
              <button
                disabled={selectedOption === null || isLoading}
                onClick={submitAnswer}
                className="btn-accent text-xs disabled:opacity-50"
              >
                {isLoading ? t.submitting : t.submitAnswer}
              </button>
            ) : (
              <button
                onClick={() => fetchNextItem(sessionId)}
                className="btn-secondary text-xs"
              >
                {t.nextQuestion} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD VIEWS */}
      {testState !== 'RUNNING' && report && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'overview'
                  ? 'bg-[#1F2937] text-white border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t.competencyRadarTitle}
            </button>
            <button
              onClick={() => setActiveTab('pathway')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === 'pathway'
                  ? 'bg-[#1F2937] text-white border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>{t.igotRoadmapTitle}</span>
              <span className="badge badge-accent text-[10px]">
                {recommendations.length}
              </span>
            </button>
          </div>

          {/* TAB 1: Competency Breakdown & Radar */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar Chart Card */}
              <div className="lg:col-span-5 data-card p-5 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase">
                    {t.radarTitle}
                  </span>
                  <span className="badge badge-success">
                    {report.overall_readiness === 'HIGH_READINESS' ? (isHi ? 'उच्च तत्परता' : 'High Readiness') : (isHi ? 'विकासशील' : 'Developing')}
                  </span>
                </div>

                <RadarChart competencies={report.competency_breakdown || []} size={280} lang={lang} />

                <div className="w-full mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">{t.overallProficiency}:</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {report.overall_proficiency_score} / 100
                  </span>
                </div>
              </div>

              {/* Table Card */}
              <div className="lg:col-span-7 data-card p-5 space-y-3">
                <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
                  {t.gapSummaryTitle}
                </h3>

                <div className="space-y-2">
                  {(report.competency_breakdown || []).map((comp) => {
                    const badgeClass = comp.gap <= 5 ? 'badge-success' : comp.gap <= 18 ? 'badge-accent' : 'badge-danger';
                    return (
                      <div key={comp.code} className="p-3 rounded bg-[#0F172A] border border-[#1E293B] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-xs text-white">{getCompetencyName(comp)}</div>
                            <div className="text-[11px] text-[#64748B] font-mono">{comp.code}</div>
                          </div>
                          <span className={`badge ${badgeClass} text-[10px]`}>
                            {comp.gap <= 5 ? t.proficientStatus : comp.gap <= 18 ? t.moderateGap : t.criticalGap}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-[#94A3B8] font-mono">
                            <span>{t.scoreLabel}: <strong className="text-white">{comp.assessed_score}</strong></span>
                            <span>{t.targetLabel}: <strong className="text-[#94A3B8]">{comp.target_score}</strong></span>
                            <span>{t.gapDetected}: <strong className={comp.gap > 0 ? "text-rose-400" : "text-emerald-400"}>-{comp.gap}</strong></span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${comp.assessed_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: iGOT Courses */}
          {activeTab === 'pathway' && (
            <div className="data-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t.igotRoadmapTitle}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {t.igotRoadmapSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((course) => {
                  const priorityClass = course.priority_tag === 'MANDATORY' ? 'badge-danger' : 'badge-accent';
                  return (
                    <div key={course.id} className="p-4 rounded bg-[#0F172A] border border-[#1E293B] flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`badge ${priorityClass} text-[10px]`}>
                            {course.priority_tag === 'MANDATORY' ? t.mandatoryPriority : t.recommendedPriority}
                          </span>
                          <span className="text-xs text-[#94A3B8] font-mono">
                            {course.estimated_hours} {t.estimatedHours}
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs text-white">
                          {isHi && course.course_name_hi ? course.course_name_hi : course.course_name}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {t.providerLabel}: {course.provider} • {t.levelLabel}: {course.difficulty_level}
                        </p>

                        <div className="mt-2 text-[11px] text-[#94A3B8] font-mono">
                          {t.gapAddressedLabel}: <span className="text-rose-400 font-bold">-{course.gap_addressed} pts</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B]">
                        {course.is_completed ? (
                          <span className="text-emerald-400 text-xs font-semibold">
                            ✓ {t.completedBadge}
                          </span>
                        ) : course.is_enrolled ? (
                          <button
                            onClick={() => handleSimulateCompletion(course.id)}
                            className="btn-secondary text-xs w-full justify-center py-1.5"
                          >
                            {t.simulateCompletionBtn}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="btn-accent text-xs w-full justify-center py-1.5"
                          >
                            {t.enrollBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
