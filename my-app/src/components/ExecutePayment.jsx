import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { executePayment, getOrganizationPDA, getDepartmentPDA, getPaymentPDA } from '../solana/api';
import { PublicKey } from '@solana/web3.js';

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
        // Get organization PDA - this will now use mock data if there's an error
        const organizationPDA = await getOrganizationPDA(publicKey);
        
        // Initialize mock payments array
        const mockPayments = [];
        
        // Try to create Engineering department payment
        try {
          const engineeringDeptPDA = await getDepartmentPDA(organizationPDA, 'Engineering');
          const engineeringPaymentPDA = await getPaymentPDA(engineeringDeptPDA, 1);
          
          mockPayments.push({ 
            id: 1, 
            department: 'Engineering',
            departmentPDA: engineeringDeptPDA,
            amount: 1000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: engineeringPaymentPDA
          });
        } catch (e) { console.warn('Error creating Engineering payment:', e); }
        
        // Try to create Marketing department payment
        try {
          const marketingDeptPDA = await getDepartmentPDA(organizationPDA, 'Marketing');
          const marketingPaymentPDA = await getPaymentPDA(marketingDeptPDA, 2);
          
          mockPayments.push({ 
            id: 2, 
            department: 'Marketing',
            departmentPDA: marketingDeptPDA,
            amount: 2000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: marketingPaymentPDA
          });
        } catch (e) { console.warn('Error creating Marketing payment:', e); }
        
        // Only set payments if we have at least one
        if (mockPayments.length > 0) {
          setPayments(mockPayments);
        } else {
          // Fallback to hardcoded mock data if all payment creation fails
          setPayments([
            { 
              id: 1, 
              department: 'Engineering',
              departmentPDA: new PublicKey('3x4q2vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyw'),
              amount: 1000,
              recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
              executionDate: new Date().toLocaleDateString(),
              paymentPDA: new PublicKey('4x5q3vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyx')
            },
            { 
              id: 2, 
              department: 'Marketing',
              departmentPDA: new PublicKey('3x4q2vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyw'),
              amount: 2000,
              recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
              executionDate: new Date().toLocaleDateString(),
              paymentPDA: new PublicKey('4x5q3vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyx')
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Fallback to hardcoded mock data if all fails
        setPayments([
          { 
            id: 1, 
            department: 'Engineering',
            departmentPDA: new PublicKey('3x4q2vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyw'),
            amount: 1000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: new PublicKey('4x5q3vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyx')
          },
          { 
            id: 2, 
            department: 'Marketing',
            departmentPDA: new PublicKey('3x4q2vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyw'),
            amount: 2000,
            recipient: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPjJegjYs7',
            executionDate: new Date().toLocaleDateString(),
            paymentPDA: new PublicKey('4x5q3vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyx')
          }
        ]);
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