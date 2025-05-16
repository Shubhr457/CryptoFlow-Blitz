import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { initializeOrganization } from '../solana/api';

export const InitializeOrganization = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInitialize = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const response = await initializeOrganization();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Initialize Organization</h2>
      <button 
        onClick={handleInitialize} 
        disabled={loading || !publicKey}
      >
        {loading ? 'Initializing...' : 'Initialize'}
      </button>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Organization initialized successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 