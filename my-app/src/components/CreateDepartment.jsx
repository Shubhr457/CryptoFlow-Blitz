import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createDepartment } from '../solana/api';

export const CreateDepartment = () => {
  const { publicKey } = useWallet();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateDepartment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!name.trim()) {
      alert('Please enter a department name');
      return;
    }

    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      alert('Please enter a valid budget allocation');
      return;
    }

    setLoading(true);
    try {
      const response = await createDepartment(name, Number(budget));
      setResult(response);
      if (response.success) {
        setName('');
        setBudget('');
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Department</h2>
      <div className="form-group">
        <label>Department Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter department name"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Budget Allocation:</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter budget allocation"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleCreateDepartment} 
        disabled={loading || !publicKey || !name || !budget}
      >
        {loading ? 'Creating Department...' : 'Create Department'}
      </button>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Department created successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 