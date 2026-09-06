import React from 'react';
import { translations, competencyTranslations } from '../i18n';

export default function RadarChart({ competencies = [], size = 300, lang = 'en' }) {
  if (!competencies || competencies.length === 0) return null;

  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const center = size / 2;
  const radius = size * 0.36;
  const total = competencies.length;
  const angleStep = (Math.PI * 2) / total;

  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const levels = [25, 50, 75, 100];

  const assessedPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(c.assessed_score || 50, i);
      return `${x},${y}`;
    })
    .join(' ');

  const targetPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(c.target_score || 80, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Rings */}
        {levels.map((lvl) => {
          const r = (lvl / 100) * radius;
          return (
            <circle
              key={lvl}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#1E293B"
              strokeDasharray={lvl === 100 ? 'none' : '3 3'}
              strokeWidth="1"
            />
          );
        })}

        {/* Radial Axis Lines */}
        {competencies.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#1E293B"
              strokeWidth="1"
            />
          );
        })}

        {/* Target Benchmark Polygon */}
        <polygon
          points={targetPoints}
          fill="none"
          stroke="#64748B"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Assessed Score Polygon */}
        <polygon
          points={assessedPoints}
          fill="rgba(245, 158, 11, 0.15)"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Data points */}
        {competencies.map((c, i) => {
          const assessedCoord = getCoordinates(c.assessed_score || 50, i);
          const targetCoord = getCoordinates(c.target_score || 80, i);
          return (
            <g key={i}>
              <circle cx={targetCoord.x} cy={targetCoord.y} r="3" fill="#64748B" />
              <circle cx={assessedCoord.x} cy={assessedCoord.y} r="4" fill="#F59E0B" />
            </g>
          );
        })}

        {/* Axis Labels (Translated into Hindi when active) */}
        {competencies.map((c, i) => {
          const angle = indexToAngle(i, total);
          const labelDist = radius + 22;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle);

          // Get translated short name
          let compName = c.name;
          if (c.id && competencyTranslations[c.id]) {
            compName = isHi ? competencyTranslations[c.id].hi : competencyTranslations[c.id].en;
          } else if (c.code) {
            const matchKey = Object.keys(competencyTranslations).find(k => c.code.toLowerCase().includes(k.replace('comp_', '')));
            if (matchKey && isHi) {
              compName = competencyTranslations[matchKey].hi;
            }
          }
          const shortName = isHi ? compName.split(' ')[0] : compName.split('&')[0].trim();

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={x < center - 10 ? 'end' : x > center + 10 ? 'start' : 'middle'}
              dominantBaseline="central"
              fill="#94A3B8"
              fontSize="10"
              fontWeight="500"
            >
              {shortName}
            </text>
          );
        })}
      </svg>

      {/* Legend with full i18n support */}
      <div className="flex items-center gap-5 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-[#94A3B8]">{t.yourScoreLegend}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 border-b-2 border-dashed border-gray-400 inline-block"></span>
          <span className="text-[#94A3B8]">{t.roleTargetLegend}</span>
        </div>
      </div>
    </div>
  );
}

function indexToAngle(index, total) {
  return (index * (Math.PI * 2)) / total - Math.PI / 2;
}
