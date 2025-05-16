import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { executePayment, getOrganizationPDA, getDepartmentPDA, getPaymentPDA } from '../solana/api';

export const ExecutePayment = () => {
  const { publicKey } = useWallet();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch scheduled payments when wallet is connected
  useEffect(() => {
    const fetchPayments = async () => {
      if (!publicKey) return;
      
      setLoadingPayments(true);
      try {
        const organizationPDA = await getOrganizationPDA(publicKey);
        
        // For demonstration, we're creating mock payment data
        // In a real app, you would query all payments from the blockchain
        const engineeringDeptPDA = await getDepartmentPDA(organizationPDA, 'Engineering');
        const marketingDeptPDA = await getDepartmentPDA(organizationPDA, 'Marketing');
        
        const mockPayments = [
          { 
            id: 1, 
            department: 'Engineering',
            departmentPDA: engineeringDeptPDA,
            amount: 1000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: await getPaymentPDA(engineeringDeptPDA, 1)
          },
          { 
            id: 2, 
            department: 'Marketing',
            departmentPDA: marketingDeptPDA,
            amount: 2000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: await getPaymentPDA(marketingDeptPDA, 2)
          }
        ];
        
        setPayments(mockPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [publicKey]);

  const handleExecutePayment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!selectedPayment) {
      alert('Please select a payment to execute');
      return;
    }

    setLoading(true);
    try {
      const payment = payments.find(p => p.id === selectedPayment);
      const response = await executePayment(payment.departmentPDA, payment.paymentPDA);
      
      setResult(response);
      if (response.success) {
        // Remove the executed payment from the list
        setPayments(payments.filter(p => p.id !== selectedPayment));
        setSelectedPayment(null);
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Execute Payment</h2>
      <div className="form-group">
        <label>Select Payment:</label>
        {loadingPayments ? (
          <p className="loading">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No scheduled payments found.</p>
        ) : (
          <div className="payment-list">
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className={`payment-item ${selectedPayment === payment.id ? 'selected' : ''}`}
                onClick={() => setSelectedPayment(payment.id)}
              >
                <p><strong>ID:</strong> {payment.id}</p>
                <p><strong>Department:</strong> {payment.department}</p>
                <p><strong>Amount:</strong> {payment.amount}</p>
                <p><strong>Recipient:</strong> {payment.recipient.slice(0, 8)}...</p>
                <p><strong>Date:</strong> {payment.executionDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={handleExecutePayment} 
        disabled={loading || !publicKey || !selectedPayment || loadingPayments || payments.length === 0}
      >
        {loading ? 'Executing Payment...' : 'Execute Payment'}
      </button>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Payment executed successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 