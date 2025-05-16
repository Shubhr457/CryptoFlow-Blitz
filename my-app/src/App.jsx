import { useState } from 'react';
import { SolanaWalletProvider } from './solana/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { InitializeOrganization } from './components/InitializeOrganization';
import { SetBudget } from './components/SetBudget';
import { CreateDepartment } from './components/CreateDepartment';
import { SchedulePayment } from './components/SchedulePayment';
import { ExecutePayment } from './components/ExecutePayment';
import { Notifications } from './components/Notifications';
import './App.css';
import './solana/solana.css';

function App() {
  const [activeTab, setActiveTab] = useState('initialize');

  const renderContent = () => {
    switch (activeTab) {
      case 'initialize':
        return <InitializeOrganization />;
      case 'budget':
        return <SetBudget />;
      case 'departments':
        return <CreateDepartment />;
      case 'schedule':
        return <SchedulePayment />;
      case 'execute':
        return <ExecutePayment />;
      case 'notifications':
        return <Notifications />;
      default:
        return <InitializeOrganization />;
    }
  };

  return (
    <SolanaWalletProvider>
      <div className="container">
        <header>
          <h1>CryptoFlow Blitz</h1>
          <p className="subtitle">Budget Management System on Solana</p>
          <div className="wallet-section">
            <WalletButton />
          </div>
        </header>

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'initialize' ? 'active' : ''}`} 
            onClick={() => setActiveTab('initialize')}
          >
            Initialize
          </button>
          <button 
            className={`tab-button ${activeTab === 'budget' ? 'active' : ''}`} 
            onClick={() => setActiveTab('budget')}
          >
            Set Budget
          </button>
          <button 
            className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} 
            onClick={() => setActiveTab('schedule')}
          >
            Schedule Payment
          </button>
          <button 
            className={`tab-button ${activeTab === 'execute' ? 'active' : ''}`} 
            onClick={() => setActiveTab('execute')}
          >
            Execute Payment
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`} 
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        <main>
          {renderContent()}
        </main>

        <footer>
          <p>&copy; 2023 CryptoFlow Blitz. All rights reserved.</p>
        </footer>
      </div>
    </SolanaWalletProvider>
  );
}

export default App;
