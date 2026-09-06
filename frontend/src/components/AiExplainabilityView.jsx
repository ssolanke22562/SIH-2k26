import React, { useState } from 'react';
import { Brain, Sparkles, Sliders, Calculator, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import RadarChart from './RadarChart';
import { translations, competencyTranslations } from '../i18n';

export default function AiExplainabilityView({ lang }) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  // Interactive Live Simulator State
  const [simTheta, setSimTheta] = useState(0.2); // Current ability
  const [simDifficulty, setSimDifficulty] = useState(1.2); // Item difficulty (b)
  const [simDiscrimination, setSimDiscrimination] = useState(1.5); // Item discrimination (a)
  const [simResponseTime, setSimResponseTime] = useState(28); // Response time (s)
  const [simOutcome, setSimOutcome] = useState('INCORRECT'); // Outcome

  // Calculate 2PL IRT Probability: P(Y=1) = 1 / (1 + exp(-a * (theta - b)))
  const exponent = -simDiscrimination * (simTheta - simDifficulty);
  const probCorrect = 1 / (1 + Math.exp(exponent));
  const fisherInfo = Math.pow(simDiscrimination, 2) * probCorrect * (1 - probCorrect);

  // Dynamic Decision Logic based on inputs
  const computeDecision = () => {
    if (simOutcome === 'CORRECT') {
      if (simResponseTime <= 15) {
        return {
          action: isHi ? "कठिनाई स्तर बढ़ाएं (+1 स्तर)" : "Increase Difficulty (+1 Level)",
          difficultyShift: "+0.45",
          decisionType: "DIFFICULTY_ESCALATION",
          badgeColor: "badge-success",
          rationale: isHi
            ? "तेजी से सही उत्तर (15 सेकंड से कम) उच्च अवधारणात्मक स्पष्टता और उच्च क्षमता (θ) दर्शाता है। फिशर सूचना अधिकतम करने के लिए उच्च कठिनाई का प्रश्न चुना जाएगा।"
            : "Rapid correct response (< 15s) indicates high latent ability and conceptual fluency. Engine escalates item difficulty to maximize Fisher Information at higher θ band."
        };
      } else {
        return {
          action: isHi ? "वर्तमान कठिनाई स्तर बनाए रखें" : "Maintain Current Difficulty Tier",
          difficultyShift: "+0.10",
          decisionType: "PRECISION_REFINEMENT",
          badgeColor: "badge-accent",
          rationale: isHi
            ? "उत्तर सही है किंतु प्रतिक्रिया समय अधिक है (28s), जो दर्शाता है कि अधिकारी विचार कर रहा था। स्थिरता जांचने हेतु समान कठिनाई का प्रश्न दिया जाएगा।"
            : "Correct answer with prolonged response latency indicates deliberation. Engine maintains current difficulty tier to verify consistency."
        };
      }
    } else {
      if (simResponseTime >= 25) {
        return {
          action: isHi ? "कठिनाई को स्तर 4 से घटाकर स्तर 2 पर लाएं" : "Step Down Difficulty: Level 4 → Level 2",
          difficultyShift: "-0.55",
          decisionType: "REMEDIATION_TRIGGER",
          badgeColor: "badge-danger",
          rationale: isHi
            ? "गलत उत्तर तथा उच्च विलंबता (25 सेकंड से अधिक) मूलभूत अवधारणात्मक अंतर का संकेत देती है। माप त्रुटि (SE) कम करने के लिए आधारभूत प्रश्न दिया जाएगा और iGOT उपचारात्मक मॉड्यूल सक्रिय होगा।"
            : "Incorrect answer combined with prolonged latency (> 25s) signals a foundational misconception. Engine steps down difficulty and tags the sub-competency for iGOT remediation."
        };
      } else {
        return {
          action: isHi ? "कठिनाई में मामूली कमी (-0.2 स्तर)" : "Marginal Difficulty Adjustment (-0.2 Level)",
          difficultyShift: "-0.25",
          decisionType: "DIFFICULTY_DEESCALATION",
          badgeColor: "badge-warning",
          rationale: isHi
            ? "तेजी से दिया गया गलत उत्तर असावधानी या भ्रामक विकल्प (Distractor) के चयन का संकेत दे सकता है। मामूली समायोजन लागू किया गया।"
            : "Fast incorrect response suggests distractor trap or careless misreading. Minor de-escalation applied."
        };
      }
    }
  };

  const decision = computeDecision();

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="hero-soft p-6 lg:p-8 border border-[#1E293B]">
        <div className="max-w-4xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent text-xs">
              {isHi ? "पारदर्शी एवं व्याख्या योग्य AI" : "Explainable AI & Psychometric Engine"}
            </span>
            <span className="badge badge-default text-xs">
              {isHi ? "2PL IRT + फिशर सूचना मॉडल" : "2-Parameter Logistic IRT + Fisher Information"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {isHi
              ? "AI शिक्षार्थी प्रोफ़ाइल और निर्णय इंजन की पारदर्शी कार्यप्रणाली"
              : "AI Learner Profile & Transparent Decision Logic"}
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {isHi
              ? "यह मंच ब्लैक-बॉक्स एआई के बजाय गणितीय रूप से सत्यापित 2-पैरामीटर लॉजिस्टिक (2PL) आइटम रिस्पांस थ्योरी और वास्तविक समय टेलीमेट्री का उपयोग करता है। नीचे दिए गए लाइव सिम्युलेटर से AI निर्णय प्रक्रिया का प्रत्यक्ष परीक्षण करें।"
              : "The platform replaces unexplainable black-box models with mathematically grounded 2-Parameter Logistic (2PL) Item Response Theory and deterministic cognitive telemetry. Test the live simulator below to see how inputs dictate AI decisions in real-time."}
          </p>
        </div>
      </div>

      {/* 1. Live Interactive Decision Simulator */}
      <div className="data-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {isHi ? "लाइव इंटरैक्टिव सिम्युलेटर" : "Live Interactive AI Decision Simulator"}
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              {isHi ? "पैरामीटर बदलें और वास्तविक समय AI निर्णय देखें" : "Manipulate Telemetry Parameters & Observe AI Decision Output"}
            </h3>
          </div>
          <span className="badge badge-default text-xs font-mono">Real-Time Execution</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Controls */}
          <div className="lg:col-span-6 space-y-4 bg-[#0F172A] p-5 rounded-lg border border-[#1E293B]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{isHi ? "01. इनपुट टेलीमेट्री पैरामीटर" : "01. Input Telemetry & IRT Parameters"}</span>
            </h4>

            {/* Answer Outcome Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#94A3B8] flex justify-between">
                <span>{isHi ? "प्रतिक्रिया परिणाम (Accuracy):" : "Item Response Accuracy:"}</span>
                <span className={`font-bold ${simOutcome === 'CORRECT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simOutcome === 'CORRECT' ? (isHi ? "सही उत्तर (1.0)" : "Correct (1.0)") : (isHi ? "गलत उत्तर (0.0)" : "Incorrect (0.0)")}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimOutcome('CORRECT')}
                  className={`py-2 rounded text-xs font-semibold border transition-all ${
                    simOutcome === 'CORRECT'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  ✓ {isHi ? "सही उत्तर" : "Correct Response"}
                </button>
                <button
                  onClick={() => setSimOutcome('INCORRECT')}
                  className={`py-2 rounded text-xs font-semibold border transition-all ${
                    simOutcome === 'INCORRECT'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  ✗ {isHi ? "गलत उत्तर" : "Incorrect Response"}
                </button>
              </div>
            </div>

            {/* Response Time Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">{isHi ? "प्रतिक्रिया समय (Latency):" : "Response Latency (Seconds):"}</span>
                <span className="font-mono font-bold text-amber-400">{simResponseTime}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={simResponseTime}
                onChange={(e) => setSimResponseTime(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#1E293B] rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>5s (Fast / Intuitive)</span>
                <span>25s (Benchmark)</span>
                <span>60s (Hesitant)</span>
              </div>
            </div>

            {/* Learner Ability Slider (theta) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">{isHi ? "शिक्षार्थी की वर्तमान क्षमता (θ):" : "Current Latent Ability (θ):"}</span>
                <span className="font-mono font-bold text-white">{simTheta > 0 ? `+${simTheta.toFixed(2)}` : simTheta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={simTheta}
                onChange={(e) => setSimTheta(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#1E293B] rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>-3.0 (Novice)</span>
                <span>0.0 (Average)</span>
                <span>+3.0 (Master)</span>
              </div>
            </div>

            {/* Item Difficulty Slider (b) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">{isHi ? "प्रश्न की कठिनाई (b):" : "Item Difficulty Parameter (b):"}</span>
                <span className="font-mono font-bold text-indigo-400">{simDifficulty > 0 ? `+${simDifficulty.toFixed(2)}` : simDifficulty.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={simDifficulty}
                onChange={(e) => setSimDifficulty(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-[#1E293B] rounded-lg h-2"
              />
            </div>
          </div>

          {/* Right: AI Analysis & Decision Output */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            {/* Mathematical Telemetry */}
            <div className="bg-[#0F172A] p-5 rounded-lg border border-[#1E293B] space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>{isHi ? "02. गणितीय 2PL IRT गणना" : "02. Mathematical 2PL IRT Calculations"}</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293B]">
                  <span className="text-[10px] text-[#94A3B8]">{isHi ? "सफलता की संभावना P(Y=1):" : "Expected Prob P(Y=1):"}</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">{(probCorrect * 100).toFixed(1)}%</div>
                </div>

                <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293B]">
                  <span className="text-[10px] text-[#94A3B8]">{isHi ? "फिशर सूचना I(θ):" : "Fisher Info I(θ):"}</span>
                  <div className="text-lg font-bold font-mono text-indigo-400">{fisherInfo.toFixed(3)}</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293B] text-[11px] font-mono text-gray-300">
                Formula: P(Y=1|θ) = 1 / [1 + exp(-{simDiscrimination} × ({simTheta.toFixed(1)} - {simDifficulty.toFixed(1)}))]
              </div>
            </div>

            {/* Decision & Rationale Card */}
            <div className="bg-[#0F172A] p-5 rounded-lg border-2 border-amber-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {isHi ? "03. स्वचालित AI निर्णय" : "03. Real-Time AI Decision Output"}
                </span>
                <span className={`badge ${decision.badgeColor} text-[10px] font-mono`}>
                  {decision.decisionType}
                </span>
              </div>

              <div className="p-3 rounded bg-[#0B0F19] border border-[#1E293B]">
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{decision.action}</span>
                  <span className="font-mono text-amber-400 text-xs font-bold">{decision.difficultyShift}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isHi ? "निर्णय का स्पष्ट कारण (Rationale):" : "Explainable Rationale:"}</span>
                <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
                  {decision.rationale}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured AI Decision Engine Architecture Diagram */}
      <div className="data-card p-6 space-y-6">
        <div className="border-b border-[#1E293B] pb-4">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {isHi ? "AI निर्णय संरचना" : "Transparent Decision Architecture"}
          </span>
          <h3 className="text-base font-bold text-white mt-1">
            {isHi ? "डेटा इनपुट से प्रशिक्षण अनुशंसा तक का चरणबद्ध प्रवाह" : "Step-by-Step Decision Hierarchy"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="text-amber-400 font-bold font-mono">01. INPUT STREAM</div>
            <ul className="space-y-1 text-[#94A3B8]">
              <li>• Binary Accuracy ($Y_i$)</li>
              <li>• Response Latency ($T_i$)</li>
              <li>• Historical Attempts ($N$)</li>
              <li>• Topic Competency Vector ($C_m$)</li>
              <li>• Item Calibrations ($a_i, b_i$)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="text-indigo-400 font-bold font-mono">02. IRT MLE UPDATE</div>
            <p className="text-[#94A3B8] leading-relaxed">
              Calculates log-likelihood gradient:
              <br />
              <span className="font-mono text-xs text-white">Δθ = [Σ aᵢ(Yᵢ - Pᵢ)] / [Σ aᵢ² Pᵢ(1 - Pᵢ)]</span>
              <br />
              Updates ability θ bounded within [-3.0, +3.0].
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="text-emerald-400 font-bold font-mono">03. DECISION ENGINE</div>
            <p className="text-[#94A3B8] leading-relaxed">
              If deficit $\Delta C_m \ge 15$ pts:
              <br />
              → Step down difficulty.
              <br />
              → Query Vector DB for matched iGOT syllabus chunks.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="text-white font-bold font-mono">04. EXPLAINABLE RATIONALE</div>
            <p className="text-[#94A3B8] leading-relaxed">
              Generates verifiable plain-text reasoning linked directly to official MoSPI survey manual page and chapter references.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
