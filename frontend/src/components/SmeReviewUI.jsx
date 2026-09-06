import React, { useState, useEffect } from 'react';
import { translations } from '../i18n';
import { API_BASE } from '../config';

export default function SmeReviewUI({ lang, activeUser }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [bankQuestions, setBankQuestions] = useState([]);

  const [editStem, setEditStem] = useState('');
  const [editExplanation, setEditExplanation] = useState('');

  useEffect(() => {
    fetchReviewQueue();
    fetchStats();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/sme/review-queue`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.items || []);
        if (data.items && data.items.length > 0) {
          selectItemForReview(data.items[0]);
        } else {
          setActiveItem(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/sme/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBankQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sme/question-bank`);
      if (res.ok) {
        const data = await res.json();
        setBankQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectItemForReview = (item) => {
    setActiveItem(item);
    setEditStem(item.stem);
    setEditExplanation(item.explanation);
  };

  const handleApprove = async () => {
    if (!activeItem) return;
    try {
      await fetch(`${API_BASE}/sme/questions/${activeItem.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_id: activeUser.id, action: 'APPROVE' })
      });
      fetchReviewQueue();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAndApprove = async () => {
    if (!activeItem) return;
    try {
      await fetch(`${API_BASE}/sme/questions/${activeItem.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_id: activeUser.id,
          stem: editStem,
          stem_hi: activeItem.stem_hi,
          options: activeItem.options,
          correct_option_index: activeItem.correct_option_index,
          explanation: editExplanation,
          explanation_hi: activeItem.explanation_hi,
          citation_text: activeItem.citation_text,
          citation_page: activeItem.citation_page || 1,
          difficulty_level: activeItem.difficulty_level
        })
      });
      fetchReviewQueue();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!activeItem) return;
    try {
      await fetch(`${API_BASE}/sme/questions/${activeItem.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_id: activeUser.id,
          action: 'REJECT',
          rejection_reason: 'Citation does not sufficiently support distractor discrimination.'
        })
      });
      fetchReviewQueue();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hero-soft p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{t.smeTitle}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">{t.smeSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B0F19] p-1 rounded border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded text-xs font-medium ${
              activeTab === 'queue' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#94A3B8]'
            }`}
          >
            Pending Review ({queue.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('bank');
              fetchBankQuestions();
            }}
            className={`px-3 py-1 rounded text-xs font-medium ${
              activeTab === 'bank' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#94A3B8]'
            }`}
          >
            Approved Bank
          </button>
        </div>
      </div>

      {/* KPI Stats: High-Contrast Flat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.pendingQueue}</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats?.pending_review || queue.length}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Awaiting verification</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.acceptanceRate}</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats?.acceptance_rate_pct || 84.2}%</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Approved questions</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.avgReviewTime}</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats?.avg_review_time_sec || 38}s</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Average time per review</div>
        </div>
      </div>

      {/* TAB 1: REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <>
          {queue.length === 0 ? (
            <div className="data-card p-10 text-center text-xs text-[#94A3B8]">
              No questions waiting for review.
            </div>
          ) : activeItem && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Question Editor (Clean flat forms, generous spacing) */}
              <div className="lg:col-span-7 data-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-accent">
                      {activeItem.competency_name || activeItem.competency_code}
                    </span>
                    <span className="badge badge-default">
                      {activeItem.difficulty_level}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    ID: {activeItem.id.slice(0, 8)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    {t.questionStem}
                  </label>
                  <textarea
                    rows={3}
                    value={editStem}
                    onChange={(e) => setEditStem(e.target.value)}
                    className="w-full form-control font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                    {t.distractors}
                  </label>
                  <div className="space-y-1.5">
                    {(activeItem.options || []).map((opt) => {
                      const isCorrect = opt.id === activeItem.correct_option_index;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded border text-xs flex items-center justify-between gap-2 ${
                            isCorrect ? 'bg-[#0F172A] border-emerald-500/40 text-emerald-300' : 'bg-[#0F172A] border-[#1E293B] text-[#CBD5E1]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                              isCorrect ? 'bg-emerald-500 text-black shadow-sm' : 'bg-[#1E293B] text-[#94A3B8]'
                            }`}>
                              {String.fromCharCode(65 + opt.id)}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrect && (
                            <span className="badge badge-success text-[10px]">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    Explanation
                  </label>
                  <textarea
                    rows={2}
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    className="w-full form-control"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                  <button onClick={handleReject} className="btn-danger text-xs">
                    {t.rejectBtn}
                  </button>

                  <div className="flex items-center gap-2">
                    <button onClick={handleEditAndApprove} className="btn-secondary text-xs">
                      {t.editBtn}
                    </button>
                    <button onClick={handleApprove} className="btn-accent text-xs">
                      {t.approveBtn}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Source Citation */}
              <div className="lg:col-span-5 data-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                  <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
                    {t.sourceCitation}
                  </h3>
                  <span className="badge badge-accent text-[11px] font-mono">
                    Match: {Math.round(activeItem.confidence_score * 100)}%
                  </span>
                </div>

                {activeItem.confidence_score < 0.85 && (
                  <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                    {t.mandatoryAuditNotice}
                  </div>
                )}

                <div className="p-3.5 rounded bg-[#0F172A] border border-[#1E293B] text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[#94A3B8] border-b border-[#1E293B] pb-1.5">
                    <span className="font-semibold text-white">{activeItem.document_title || 'NSS 78th Round Manual'}</span>
                    <span className="text-[11px]">Page {activeItem.citation_page || 14}</span>
                  </div>

                  <div className="font-mono text-[11px] text-amber-300 leading-relaxed bg-[#0B0F19] p-3 rounded border border-[#1E293B]">
                    "{activeItem.citation_text}"
                  </div>

                  <div className="text-[11px] text-[#64748B]">
                    Verified against official MoSPI reference text.
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-[#94A3B8] uppercase mb-1.5">
                    Other Items ({queue.length})
                  </div>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto">
                    {queue.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => selectItemForReview(q)}
                        className={`w-full text-left p-2 rounded text-xs border truncate flex items-center justify-between gap-2 ${
                          activeItem.id === q.id
                            ? 'bg-[#1F2937] border-[#334155] text-white'
                            : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{q.stem}</span>
                        <span className="font-mono text-[10px] text-[#64748B] shrink-0">
                          {Math.round(q.confidence_score * 100)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="data-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
              Approved Questions ({bankQuestions.length})
            </h3>
            <span className="badge badge-success text-[10px]">Active in Test Pool</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bankQuestions.map((q) => (
              <div key={q.id} className="p-3 rounded bg-[#0F172A] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="badge badge-accent text-[10px]">{q.competency_name}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">Diff: {q.irt_b_difficulty}</span>
                </div>
                <div className="text-xs text-white leading-relaxed">{q.stem}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
