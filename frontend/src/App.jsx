import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LearnerPortal from './components/LearnerPortal';
import CoordinatorConsole from './components/CoordinatorConsole';
import SmeReviewUI from './components/SmeReviewUI';
import MoSpiAdminDashboard from './components/MoSpiAdminDashboard';
import { API_BASE } from './config';

export default function App() {
  const [activeRole, setActiveRole] = useState('LEARNER');
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

  useEffect(() => {
    if (users && users.length > 0) {
      const match = users.find((u) => u.role === activeRole);
      if (match) {
        setActiveUser(match);
      }
    }
  }, [activeRole, users]);

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
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        lang={lang}
        setLang={setLang}
        activeUser={activeUser}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8">
        {activeRole === 'LEARNER' && (
          <LearnerPortal lang={lang} activeUser={activeUser} />
        )}

        {activeRole === 'COORDINATOR' && (
          <CoordinatorConsole lang={lang} activeUser={activeUser} />
        )}

        {activeRole === 'SME_REVIEWER' && (
          <SmeReviewUI lang={lang} activeUser={activeUser} />
        )}

        {activeRole === 'MOSPI_ADMIN' && (
          <MoSpiAdminDashboard lang={lang} />
        )}
      </main>
    </div>
  );
}
