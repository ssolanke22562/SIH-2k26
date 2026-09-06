import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingHome from './components/LandingHome';
import JudgeModeDemo from './components/JudgeModeDemo';
import LearnerPortal from './components/LearnerPortal';
import AiExplainabilityView from './components/AiExplainabilityView';
import CoordinatorConsole from './components/CoordinatorConsole';
import SmeReviewUI from './components/SmeReviewUI';
import MoSpiAdminDashboard from './components/MoSpiAdminDashboard';
import SystemArchitectureView from './components/SystemArchitectureView';
import SecurityPrivacyView from './components/SecurityPrivacyView';
import ScaleImpactView from './components/ScaleImpactView';
import { API_BASE } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [lang, setLang] = useState('en');
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState({
    id: 'usr_learner_1',
    official_id: 'MOSPI-JSO-2024-881',
    full_name: 'Sarthak Solanke',
    role: 'LEARNER',
    cadre: 'Junior Statistical Officer',
    state_code: 'MH',
    division_id: 'DIV_WEST_MUMBAI'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] pb-16">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        activeUser={activeUser}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8">
        {activeTab === 'OVERVIEW' && (
          <LandingHome
            lang={lang}
            onStartDemo={() => setActiveTab('JUDGE_MODE')}
            onExploreArchitecture={() => setActiveTab('ARCHITECTURE')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'JUDGE_MODE' && (
          <JudgeModeDemo
            lang={lang}
            onExploreArchitecture={() => setActiveTab('ARCHITECTURE')}
            onExploreAi={() => setActiveTab('AI_INSIGHTS')}
          />
        )}

        {activeTab === 'LEARNER' && (
          <LearnerPortal lang={lang} activeUser={activeUser} />
        )}

        {activeTab === 'AI_INSIGHTS' && (
          <AiExplainabilityView lang={lang} />
        )}

        {activeTab === 'COORDINATOR' && (
          <CoordinatorConsole lang={lang} activeUser={activeUser} />
        )}

        {activeTab === 'SME_REVIEWER' && (
          <SmeReviewUI lang={lang} activeUser={activeUser} />
        )}

        {activeTab === 'MOSPI_ADMIN' && (
          <MoSpiAdminDashboard lang={lang} />
        )}

        {activeTab === 'ARCHITECTURE' && (
          <SystemArchitectureView lang={lang} />
        )}

        {activeTab === 'SECURITY' && (
          <SecurityPrivacyView lang={lang} />
        )}

        {activeTab === 'SCALE' && (
          <ScaleImpactView lang={lang} />
        )}
      </main>
    </div>
  );
}
