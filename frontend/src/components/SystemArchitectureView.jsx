import React, { useState } from 'react';
import { 
  Layers, Server, Database, Cpu, ShieldCheck, ArrowRight, 
  ExternalLink, CheckCircle2, Code2, Terminal, Network, Zap 
} from 'lucide-react';
import { translations } from '../i18n';

export default function SystemArchitectureView({ lang }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';
  const [selectedLayer, setSelectedLayer] = useState('AI_LAYER');

  const architectureLayers = [
    {
      id: 'CLIENT_LAYER',
      title: isHi ? "1. क्लाइंट एवं यूजर इंटरैक्शन लेयर" : "1. Client & Role-Based UI Layer",
      badge: "React 18 + Vite + Tailwind",
      desc: isHi 
        ? "सांख्यिकी अधिकारियों, समन्वयकों, विषय विशेषज्ञों (SME) और MoSPI मुख्यालय हेतु उत्तरदायी 4-भूमिका वेब इंटरफ़ेस।"
        : "Responsive role-tailored dashboards for Statistical Officers (JSO/SSO), Training Coordinators, SME Reviewers, and MoSPI DG Admin.",
      components: [
        "Statistical Officer CAT Diagnostic & Retest UI",
        "SME 3-Pane Question & Citation Verification Workspace",
        "Coordinator Training Assignment & Cadre Heatmaps",
        "MoSPI National Training Readiness Dashboard"
      ],
      tech: ["React 18", "Vite 5", "TailwindCSS (WCAG 2.1 AA)", "Inter Typography", "Lucide Icons", "Pure SVG Dynamic Radars"]
    },
    {
      id: 'API_LAYER',
      title: isHi ? "2. माइक्रो-सर्विसेज एवं API गेटवे" : "2. API Gateway & Microservice Layer",
      badge: "FastAPI + Python 3.11",
      desc: isHi
        ? "अतुल्यकालिक अनुरोधों, टोकन सत्यापन, दर-सीमितता और ऑडिट लॉगिंग का प्रबंधन करने वाली उच्च प्रदर्शन API।"
        : "High-throughput asynchronous REST API managing assessment sessions, IRT ability estimations, and course mappings.",
      components: [
        "/api/v1/diagnostic (Session initialization, Next-item CAT, Submit item MLE)",
        "/api/v1/sme (Document ingestion, Citation matching, Verification ledger)",
        "/api/v1/recommendations (iGOT Karmayogi dynamic course ranker)",
        "/api/v1/analytics (State readiness, Cadre matrix, Training ROI analytics)"
      ],
      tech: ["FastAPI 0.110+", "Python 3.11", "Uvicorn ASGI", "Pydantic v2 Schema Validation", "CORS Middleware"]
    },
    {
      id: 'AI_LAYER',
      title: isHi ? "3. AI / ML एवं साइकोमेट्रिक इंटेलिजेंस लेयर" : "3. AI/ML & Psychometric Engine Layer",
      badge: "2PL IRT + Grounded RAG",
      desc: isHi
        ? "2-पैरामीटर लॉजिस्टिक IRT इंजन, फिशर सूचना आधारित अनुकूली प्रश्न चयन, और MoSPI नियमावली से RAG-आधारित प्रश्न निर्माण।"
        : "Core mathematical psychometric engine and grounded RAG vector extraction pipeline for test authoring.",
      components: [
        "2PL Item Response Theory Engine with Newton-Raphson MLE theta update",
        "Fisher Information I(theta) Item Selector for optimal CAT precision",
        "MoSPI Reference Manual Vector Chunker & Semantic Citation Matcher",
        "Multi-factor Deficit Course Ranker (Gap severity + Cadre priority)"
      ],
      tech: ["2-Parameter Logistic (2PL) IRT", "Fisher Information Maximizer", "SentenceTransformers / Semantic Embeddings", "RAG Grounded Citations"]
    },
    {
      id: 'DATA_LAYER',
      title: isHi ? "4. डेटा एवं ऑडिट सुरक्षा लेयर" : "4. Persistence, Cache & Governance Layer",
      badge: "SQLite / PostgreSQL + Audit Ledger",
      desc: isHi
        ? "अपरिवर्तनीय ऑडिट लॉग, संवर्ग लक्ष्य परिभाषाएं, और संवेदनशील सांख्यिकी डेटा हेतु MeitY-अनुपालक सुरक्षा।"
        : "Relational persistence storing session state, question banks, officer telemetry, and immutable SME review audit logs.",
      components: [
        "Questions & Calibrated Metadata Table (a, b, expected_time)",
        "Assessment Sessions & Real-Time Item Telemetry Ledger",
        "Competency Benchmarks & Role Target Matrices",
        "SME Review Decision & Citation Provenance Store"
      ],
      tech: ["SQLite (Zero-Config Dev) / PostgreSQL (Prod)", "JSON Schema Validation", "Foreign Key Referential Integrity", "SHA-256 Audit Hashing"]
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="hero-soft p-6 lg:p-8 border border-[#1E293B]">
        <div className="max-w-4xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent text-xs">
              {isHi ? "सिस्टम आर्किटेक्चर" : "Technical System Architecture"}
            </span>
            <span className="badge badge-default text-xs">
              {isHi ? "राष्ट्रीय स्तर पर परिनियोजन योग्य" : "Production-Ready Government Scale"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {isHi
              ? "MoSPI AI अनुकूली शिक्षण एवं मूल्यांकन मंच की वास्तुकला"
              : "End-to-End System Pipeline & Technology Stack"}
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {isHi
              ? "यह मंच मॉड्युलर माइक्रो-सर्विस आर्किटेक्चर पर आधारित है, जो 50,000+ सांख्यिकी अधिकारियों के समवर्ती उपयोग, कम बैंडविड्थ पर कार्यक्षमता और पूर्ण डेटा संप्रभुता सुनिश्चित करता है।"
              : "Built on an asynchronous microservice architecture designed for 50,000+ statistical officers across CSO, NSSO, and State DES with strict data sovereignty and iGOT Karmayogi interoperability."}
          </p>
        </div>
      </div>

      {/* Interactive Visual Pipeline Flow */}
      <div className="data-card p-6 space-y-6">
        <div className="border-b border-[#1E293B] pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {isHi ? "एंड-टू-एंड डेटा प्रवाह" : "End-to-End Execution Flow"}
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              {isHi ? "शिक्षार्थी इनपुट से राष्ट्रीय विश्लेषिकी तक" : "From Learner Response to National Intelligence"}
            </h3>
          </div>
          <span className="badge badge-default text-xs">Click layers to inspect</span>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {architectureLayers.map((layer) => {
            const isSelected = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`p-4 rounded-lg text-left transition-all border space-y-2 ${
                  isSelected
                    ? 'bg-[#1E293B] border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#0F172A] border-[#1E293B] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {layer.title.split('.')[0]}
                  </span>
                  <span className="badge badge-default text-[10px] truncate max-w-[120px]">{layer.badge.split('+')[0]}</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-200 line-clamp-1">{layer.title.split('.')[1]}</h4>
                <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-normal">{layer.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Details Panel */}
        {(() => {
          const current = architectureLayers.find(l => l.id === selectedLayer) || architectureLayers[2];
          return (
            <div className="bg-[#0F172A] p-6 rounded-lg border border-[#1E293B] space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">{current.title}</h4>
                </div>
                <span className="badge badge-accent text-xs font-mono">{current.badge}</span>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">{current.desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Microservice Components */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    {isHi ? "मुख्य मॉड्यूल और एंडपॉइंट्स" : "Key Microservices & Modules"}
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {current.components.map((comp, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#0B0F19] p-2 rounded border border-[#1E293B]">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies Used */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    {isHi ? "वास्तविक टेक्नोलॉजी स्टैक" : "Verified Actual Tech Stack"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {current.tech.map((t, idx) => (
                      <span key={idx} className="p-2 rounded bg-[#0B0F19] border border-[#1E293B] text-xs font-mono text-emerald-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Complete Technology Inventory Table */}
      <div className="data-card p-6 space-y-4">
        <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {isHi ? "सत्यापित प्रौद्योगिकी तालिका" : "Production Technology Inventory & Role Assignment"}
          </h3>
          <span className="text-xs text-[#94A3B8]">Strictly Verified Dependencies</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0F172A] text-[#94A3B8] border-b border-[#1E293B]">
              <tr>
                <th className="p-3">Component Tier</th>
                <th className="p-3">Technology / Library</th>
                <th className="p-3">Purpose in Platform</th>
                <th className="p-3">Sovereignty / MeitY Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              <tr className="hover:bg-[#0F172A]">
                <td className="p-3 font-semibold text-white">Frontend Web Client</td>
                <td className="p-3 font-mono text-amber-400">React 18 + Vite + TailwindCSS</td>
                <td className="p-3 text-gray-300">Fast, accessible, client-rendered UI with full English/Hindi localization</td>
                <td className="p-3"><span className="badge badge-success text-[10px]">Open-Source / Zero Telemetry Leak</span></td>
              </tr>
              <tr className="hover:bg-[#0F172A]">
                <td className="p-3 font-semibold text-white">Backend Microservices</td>
                <td className="p-3 font-mono text-emerald-400">FastAPI + Python 3.11 + Uvicorn</td>
                <td className="p-3 text-gray-300">Asynchronous API for 2PL IRT CAT, SME review queue, and analytics</td>
                <td className="p-3"><span className="badge badge-success text-[10px]">On-Premises / Air-Gapped Ready</span></td>
              </tr>
              <tr className="hover:bg-[#0F172A]">
                <td className="p-3 font-semibold text-white">Psychometric CAT Engine</td>
                <td className="p-3 font-mono text-indigo-400">2-Parameter Logistic (2PL) IRT</td>
                <td className="p-3 text-gray-300">Maximum Likelihood Estimation of latent skill (θ) and Fisher Information item selection</td>
                <td className="p-3"><span className="badge badge-success text-[10px]">Mathematical / Deterministic</span></td>
              </tr>
              <tr className="hover:bg-[#0F172A]">
                <td className="p-3 font-semibold text-white">RAG Citation Engine</td>
                <td className="p-3 font-mono text-amber-400">SentenceTransformers + Vector Retrieval</td>
                <td className="p-3 text-gray-300">Extracts assessment items grounded in official MoSPI survey manuals</td>
                <td className="p-3"><span className="badge badge-success text-[10px]">Sovereign Local Inference Mode</span></td>
              </tr>
              <tr className="hover:bg-[#0F172A]">
                <td className="p-3 font-semibold text-white">Data Persistence</td>
                <td className="p-3 font-mono text-white">SQLite (Dev) / PostgreSQL (Enterprise)</td>
                <td className="p-3 text-gray-300">ACID relational storage for items, sessions, telemetry, and audit logs</td>
                <td className="p-3"><span className="badge badge-success text-[10px]">MeitY Empaneled Data Centers</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
