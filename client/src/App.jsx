import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import DatasetExplorer from './components/DatasetExplorer/DatasetExplorer.jsx';
import LiveDetection from './components/LiveDetection/LiveDetection.jsx';

const TABS = [
  { id: 'explorer', label: 'Dataset Explorer', icon: '🗂️' },
  { id: 'detect',   label: 'Live Detection',   icon: '🔍' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} tabs={TABS} onTabChange={setActiveTab} />
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        {activeTab === 'explorer' ? <DatasetExplorer /> : <LiveDetection />}
      </main>
    </div>
  );
}
