import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { setBudget } from '../solana/api';

export const SetBudget = () => {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSetBudget = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await setBudget(Number(amount));
      setResult(response);
      if (response.success) {
        setAmount('');
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Set Organization Budget</h2>
      <div className="form-group">
        <label>Budget Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter budget amount"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleSetBudget} 
        disabled={loading || !publicKey || !amount}
      >
        {loading ? 'Setting Budget...' : 'Set Budget'}
      </button>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Budget set successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 