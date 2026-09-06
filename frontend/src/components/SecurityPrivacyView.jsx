import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, AlertTriangle, Key, Database, RefreshCw } from 'lucide-react';
import { translations } from '../i18n';

export default function SecurityPrivacyView({ lang }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';
  const [filterType, setFilterType] = useState('ALL');

  const securityMatrix = [
    {
      domain: isHi ? "भूमिका-आधारित अभिगम नियंत्रण (RBAC)" : "Role-Based Access Control (RBAC)",
      status: "IMPLEMENTED",
      details: isHi
        ? "4 विशिष्ट भूमिकाएं (सांख्यिकी अधिकारी, प्रशिक्षण समन्वयक, SME समीक्षक, MoSPI HQ प्रशासक) पृथक एंडपॉइंट्स और डेटा स्लाइसिंग के साथ।"
        : "4 distinct roles (Statistical Officer, Training Coordinator, SME Reviewer, MoSPI DG Admin) with isolated endpoint authorization and scoped query constraints.",
      tech: "FastAPI Dependency Injection + Scoped Role Verification",
      meityRef: "MeitY Cyber Security Guidelines (Clause 4.2)"
    },
    {
      domain: isHi ? "अपरिवर्तनीय ऑडिट और निर्णय खाता (Audit Ledger)" : "Immutable Review & Decision Audit Ledger",
      status: "IMPLEMENTED",
      details: isHi
        ? "विषय विशेषज्ञों (SME) द्वारा लिए गए प्रत्येक अनुमोदन/अस्वीकृति और AI निर्णय को टाइमस्टैम्प और SHA-256 समतुल्य हस्ताक्षर के साथ रिकॉर्ड किया जाता है।"
        : "Every SME question approval/rejection, theta estimation update, and recommendation event is appended to an immutable database ledger with operator timestamps.",
      tech: "Relational Ledger Schema + Operator Traceability",
      meityRef: "CERT-In Audit Logging Framework"
    },
    {
      domain: isHi ? "संप्रभु AI एवं एयर-गैप्ड मोड (Sovereign AI)" : "Sovereign AI & On-Premises Air-Gapped Mode",
      status: "IMPLEMENTED",
      details: isHi
        ? "संवेदनशील जनगणना एवं आर्थिक सर्वेक्षण नियमावलियों का विश्लेषण स्थानीय रूप से किया जा सकता है, बिना किसी तीसरे पक्ष के क्लाउड पर डेटा भेजे।"
        : "Dual deployment architecture allows 100% on-premises offline local LLM / vector retrieval execution to prevent sensitive statistical draft leakage.",
      tech: "Local SentenceTransformers / Offline IRT Engine",
      meityRef: "Digital Personal Data Protection (DPDP) Act 2023"
    },
    {
      domain: isHi ? "API इनपुट सत्यापन एवं स्वच्छता" : "Pydantic Input Validation & Sanitization",
      status: "IMPLEMENTED",
      details: isHi
        ? "सभी इनपुट पेलोड को प्रकार, आकार और वर्ण सीमाओं के साथ सख्ती से सत्यापित किया जाता है ताकि SQLi और XSS हमलों को रोका जा सके।"
        : "Strict Pydantic v2 schemas reject malformed JSON, enforce bounded response latencies, and strip malicious HTML/scripts.",
      tech: "Pydantic v2 Strict Typing + FastAPI Request Validation",
      meityRef: "OWASP Top 10 API Security (API3:2023)"
    },
    {
      domain: isHi ? "प्रॉम्प्ट इंजेक्शन और आउटपुट सत्यापन" : "Prompt Injection Defense & Hallucination Guardrails",
      status: "IMPLEMENTED",
      details: isHi
        ? "RAG पाइपलाइन केवल सत्यापित संदर्भ नियमावली के आधार पर उत्तर देती है। यदि मिलान 80% से कम हो तो SME समीक्षा अनिवार्य होती है।"
        : "Citation verification thresholding enforces mandatory SME manual verification whenever semantic similarity drops below 0.80, preventing unchecked AI hallucinations.",
      tech: "Semantic Similarity Bounds + Mandatory SME Queue",
      meityRef: "Responsible AI in Government Framework"
    },
    {
      domain: isHi ? "जन परिचय / सिंगल साइन-ऑन (Jan Parichay SSO)" : "Jan Parichay National SSO Integration",
      status: "PLANNED",
      details: isHi
        ? "राष्ट्रीय ई-गवर्नेंस सिंगल साइन-ऑन (SAML 2.0 / OAuth 2.0 Jan Parichay) का उत्पादन स्तर पर एकीकरण।"
        : "Integration with India's central government Jan Parichay authentication gateway for single sign-on across statistical cadres.",
      tech: "SAML 2.0 / OpenID Connect (NIC Gateway)",
      meityRef: "National Single Sign-On Architecture"
    },
    {
      domain: isHi ? "हार्डवेयर सुरक्षा मॉड्यूल (HSM) टोकनीकरण" : "Hardware Security Module (HSM) Tokenization",
      status: "PLANNED",
      details: isHi
        ? "डेटाबेस में संग्रहीत अधिकारी व्यक्तिगत पहचान (PII) का हार्डवेयर स्तर पर AES-256 GCM एन्क्रिप्शन।"
        : "FIPS 140-2 Level 3 compliant encryption at rest for employee identifiers and district-level performance scores.",
      tech: "KMS Envelope Encryption / HSM",
      meityRef: "MeitY Encryption Standard Draft"
    },
    {
      domain: isHi ? "वितरित दर-सीमितता (Distributed Rate Limiting)" : "Distributed Token Bucket Rate Limiting",
      status: "PLANNED",
      details: isHi
        ? "राष्ट्रीय स्तर पर DDoS सुरक्षा हेतु रेडिस-आधारित वितरित दर-सीमितता।"
        : "Redis-backed rate limiting per IP and bearer token to throttle automated brute-force attempts on diagnostic assessment endpoints.",
      tech: "Redis Token Bucket + Envoy API Gateway",
      meityRef: "CERT-In DDoS Resilience Guidelines"
    }
  ];

  const filteredItems = securityMatrix.filter(item => {
    if (filterType === 'ALL') return true;
    return item.status === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="hero-soft p-6 lg:p-8 border border-[#1E293B]">
        <div className="max-w-4xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent text-xs">
              {isHi ? "सुरक्षा, गोपनीयता एवं अनुपालन" : "Security, Privacy & Governance"}
            </span>
            <span className="badge badge-default text-xs">
              {isHi ? "MeitY और DPDP 2023 अनुपालन मैट्रिक्स" : "MeitY & DPDP Act 2023 Compliance Matrix"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {isHi
              ? "डेटा सुरक्षा, संप्रभु AI और पारदर्शी अनुपालन व्यवस्था"
              : "Sovereign AI Security, Privacy Protections & Compliance Matrix"}
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {isHi
              ? "हम वास्तविक रूप से लागू की गई सुरक्षा क्षमताओं और उत्पादन स्तरीय आगामी उन्नयन में स्पष्ट भेद बनाए रखते हैं, जिससे सरकारी मूल्यांकनकर्ताओं को पूर्ण पारदर्शिता प्राप्त होती है।"
              : "We explicitly distinguish between features currently IMPLEMENTED in the live prototype and capabilities PLANNED FOR PRODUCTION HARDENING to maintain absolute evaluative integrity."}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
            filterType === 'ALL'
              ? 'bg-[#1E293B] border-amber-500 text-white'
              : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:text-white'
          }`}
        >
          {isHi ? "सभी सुरक्षा नियंत्रण (8)" : "All Controls (8)"}
        </button>
        <button
          onClick={() => setFilterType('IMPLEMENTED')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
            filterType === 'IMPLEMENTED'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
              : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:text-white'
          }`}
        >
          ✓ {isHi ? "वर्तमान में कार्यान्वित (5)" : "Currently Implemented (5)"}
        </button>
        <button
          onClick={() => setFilterType('PLANNED')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
            filterType === 'PLANNED'
              ? 'bg-amber-950/40 border-amber-500 text-amber-300'
              : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:text-white'
          }`}
        >
          ⏱ {isHi ? "योजनाबद्ध / उत्पादन सुदृढ़ीकरण (3)" : "Planned / Production Hardening (3)"}
        </button>
      </div>

      {/* Security Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item, idx) => {
          const isImpl = item.status === 'IMPLEMENTED';
          return (
            <div
              key={idx}
              className={`data-card p-5 space-y-3 border-t-2 ${
                isImpl ? 'border-t-emerald-500' : 'border-t-amber-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {isImpl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <span>{item.domain}</span>
                </span>
                <span className={`badge ${isImpl ? 'badge-success' : 'badge-accent'} text-[10px]`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {item.details}
              </p>

              <div className="pt-2 border-t border-[#1E293B] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">{isHi ? "कार्यान्वयन तंत्र:" : "Mechanism:"}</span>
                  <span className="font-mono text-gray-300">{item.tech}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">{isHi ? "नियामक संदर्भ:" : "Compliance Basis:"}</span>
                  <span className="text-amber-400 font-medium">{item.meityRef}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
