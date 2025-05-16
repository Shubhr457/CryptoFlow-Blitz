import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getOrganizationPDA, getDepartmentPDA, schedulePayment, getDepartmentData } from '../solana/api';
import { PublicKey } from '@solana/web3.js';

export const SchedulePayment = () => {
  const { publicKey } = useWallet();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch departments when wallet is connected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!publicKey) return;
      
      setLoadingDepartments(true);
      try {
        const organizationPDA = await getOrganizationPDA(publicKey);
        
        // For demonstration, we're creating mock department data
        // In a real app, you would query all departments from the blockchain
        const mockDepartments = [
          { name: 'Engineering', pda: await getDepartmentPDA(organizationPDA, 'Engineering') },
          { name: 'Marketing', pda: await getDepartmentPDA(organizationPDA, 'Marketing') },
          { name: 'Finance', pda: await getDepartmentPDA(organizationPDA, 'Finance') }
        ];
        
        setDepartments(mockDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [publicKey]);

  const handleSchedulePayment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!selectedDepartment) {
      alert('Please select a department');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    let recipientPubkey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch (error) {
      alert('Please enter a valid recipient address');
      return;
    }

    if (!memo.trim()) {
      alert('Please enter a memo');
      return;
    }

    if (!executionDate) {
      alert('Please select an execution date');
      return;
    }

    if (!paymentId || isNaN(paymentId) || Number(paymentId) <= 0) {
      alert('Please enter a valid payment ID');
      return;
    }

    const executionTimestamp = Math.floor(new Date(executionDate).getTime() / 1000);

    setLoading(true);
    try {
      const departmentPDA = departments.find(d => d.name === selectedDepartment).pda;
      const response = await schedulePayment(
        departmentPDA, 
        Number(amount), 
        recipientPubkey, 
        memo, 
        executionTimestamp, 
        Number(paymentId)
      );
      
      setResult(response);
      if (response.success) {
        setAmount('');
        setRecipient('');
        setMemo('');
        setExecutionDate('');
        setPaymentId('');
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Schedule Payment</h2>
      <div className="form-group">
        <label>Department:</label>
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          disabled={loading || loadingDepartments}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.name} value={dept.name}>{dept.name}</option>
          ))}
        </select>
        {loadingDepartments && <p className="loading">Loading departments...</p>}
      </div>
      <div className="form-group">
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Recipient:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient wallet address"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Memo:</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Enter payment memo"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Execution Date:</label>
        <input
          type="date"
          value={executionDate}
          onChange={(e) => setExecutionDate(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Payment ID:</label>
        <input
          type="number"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          placeholder="Enter unique payment ID"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleSchedulePayment} 
        disabled={loading || !publicKey || !selectedDepartment || !amount || !recipient || !memo || !executionDate || !paymentId}
      >
        {loading ? 'Scheduling Payment...' : 'Schedule Payment'}
      </button>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Payment scheduled successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 