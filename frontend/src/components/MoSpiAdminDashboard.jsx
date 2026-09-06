import React, { useState, useEffect } from 'react';
import { translations } from '../i18n';
import { API_BASE } from '../config';

export default function MoSpiAdminDashboard({ lang }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [dashboardData, setDashboardData] = useState(null);
  const [filterState, setFilterState] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/institutional`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dashboardData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'MoSPI_Training_Report_2026.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const states = dashboardData?.state_readiness_heatmap || [];
  const filteredStates = filterState === 'ALL' ? states : states.filter((s) => s.status === filterState);
  const kpis = dashboardData?.executive_roi_kpis || {};
  const cadreMatrix = dashboardData?.cadre_competency_matrix || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hero-soft p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{t.adminTitle}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">{t.adminSubtitle}</p>
        </div>

        <button onClick={handleExport} className="btn-secondary text-xs">
          {t.exportReportBtn}
        </button>
      </div>

      {/* KPI Stats: High-Contrast Flat Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.nationalReadiness}</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{kpis.diagnostic_completion_rate_pct || 83.7}%</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{kpis.total_registered_officers?.toLocaleString() || '44,500'} Officers Tested</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.trainingSavings}</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{kpis.projected_cost_savings_inr || '₹4.82 Cr'}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Vs static training sessions</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">{t.authoringEfficiency}</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{kpis.authoring_time_saved_pct || 68.5}%</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Via question generation</div>
        </div>

        <div className="data-card p-4">
          <div className="text-xs text-[#94A3B8] uppercase">Average Score Gain</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">+{kpis.avg_skill_gain_points || 16.4} pts</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Post-course improvement</div>
        </div>
      </div>

      {/* State-Wise Statistics: High Contrast Table / Cards */}
      <div className="data-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
          <div>
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
              {t.stateHeatmapTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded border border-[#1E293B] text-xs">
            {['ALL', 'OPTIMAL', 'NEEDS_FOCUS'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                  filterState === st ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#94A3B8]'
                }`}
              >
                {st === 'ALL' ? 'All States' : st === 'OPTIMAL' ? 'High Readiness' : 'Needs Focus'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredStates.map((state) => {
            const isOptimal = state.readiness_score >= 80;
            return (
              <div key={state.state_code} className="p-3 rounded bg-[#0F172A] border border-[#1E293B] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-white">{state.state_name}</h4>
                    <span className="text-[10px] text-[#64748B] font-mono">{state.state_code}</span>
                  </div>
                  <span className={`badge ${isOptimal ? 'badge-success' : 'badge-accent'} text-[10px]`}>
                    {state.readiness_score} / 100
                  </span>
                </div>

                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isOptimal ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${state.readiness_score}%` }}
                  ></div>
                </div>

                <div className="pt-1.5 border-t border-[#1E293B] flex justify-between text-[10px] text-[#94A3B8] font-mono">
                  <span>Officers: {state.active_officers.toLocaleString()}</span>
                  <span>Gap: -{state.avg_gap} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cadre Matrix */}
      <div className="data-card p-5 space-y-3">
        <div className="pb-2 border-b border-[#1E293B]">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase">
            {t.cadreMatrixTitle}
          </h3>
        </div>

        <div className="space-y-3">
          {cadreMatrix.map((cadreItem) => (
            <div key={cadreItem.cadre} className="p-3.5 rounded bg-[#0F172A] border border-[#1E293B] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs text-white">{cadreItem.cadre}</div>
                <div className="text-[11px] text-[#64748B] font-mono">
                  Total Strength: {cadreItem.total_officers.toLocaleString()} • Tested: {cadreItem.diagnostics_taken.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {Object.entries(cadreItem.competencies || {}).map(([cName, metrics]) => (
                  <div key={cName} className="p-2 rounded bg-[#0B0F19] border border-[#1E293B] text-xs space-y-1">
                    <div className="text-[#CBD5E1] text-[11px] truncate">{cName}</div>
                    <div className="flex justify-between text-[11px] text-[#94A3B8] font-mono">
                      <span>Score: <strong className="text-white">{metrics.current}</strong></span>
                      <span>Tgt: {metrics.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
