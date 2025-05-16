import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { getProgram, getOrganizationPDA, getDepartmentPDA, getPaymentPDA, getNotificationPDA } from './config';

// Re-export PDA functions for backward compatibility
export { getOrganizationPDA, getDepartmentPDA, getPaymentPDA, getNotificationPDA };

// Initialize organization
export const initializeOrganization = async () => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const organizationPDA = await getOrganizationPDA(wallet.publicKey);
    
    const tx = await program.methods
      .initialize()
      .accounts({
        organization: organizationPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    console.log('Organization initialized. Transaction signature:', tx);
    return { success: true, signature: tx, organizationPDA };
  } catch (error) {
    console.error('Error initializing organization:', error);
    return { success: false, error: error.message };
  }
};

// Set budget
export const setBudget = async (amount) => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const organizationPDA = await getOrganizationPDA(wallet.publicKey);
    
    // Convert amount to BN (BigNumber) as required by Anchor
    const bnAmount = new anchor.BN(amount);
    
    const tx = await program.methods
      .setBudget(bnAmount)
      .accounts({
        organization: organizationPDA,
        authority: wallet.publicKey
      })
      .rpc();
    
    console.log('Budget set. Transaction signature:', tx);
    return { success: true, signature: tx, amount: amount };
  } catch (error) {
    console.error('Error setting budget:', error);
    
    // Check if the error is about the transaction already being processed
    if (error.message && error.message.includes('already been processed')) {
      // This is actually a success case - the budget was already set
      return { 
        success: true, 
        signature: 'already-processed', 
        amount: amount,
        note: 'Budget was already set with this amount'
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Create department
export const createDepartment = async (name, budgetAllocation) => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const organizationPDA = await getOrganizationPDA(wallet.publicKey);
    const departmentPDA = await getDepartmentPDA(organizationPDA, name);
    
    // Convert budget to BN
    const bnBudget = new anchor.BN(budgetAllocation);
    
    const tx = await program.methods
      .createDepartment(name, bnBudget)
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    console.log('Department created. Transaction signature:', tx);
    return { success: true, signature: tx, departmentPDA };
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, error: error.message };
  }
};

// Schedule payment
export const schedulePayment = async (departmentPDA, amount, recipient, memo, executionDate, paymentId) => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const organizationPDA = await getOrganizationPDA(wallet.publicKey);
    const paymentPDA = await getPaymentPDA(departmentPDA, paymentId);
    
    // Validate and convert inputs to appropriate types
    const recipientPubkey = new PublicKey(recipient);
    const bnAmount = new anchor.BN(amount);
    const bnExecutionDate = new anchor.BN(executionDate);
    const bnPaymentId = new anchor.BN(paymentId);
    
    const tx = await program.methods
      .schedulePayment(
        bnAmount,
        recipientPubkey,
        memo,
        bnExecutionDate,
        bnPaymentId
      )
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        payment: paymentPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    console.log('Payment scheduled. Transaction signature:', tx);
    return { success: true, signature: tx, paymentPDA };
  } catch (error) {
    console.error('Error scheduling payment:', error);
    return { success: false, error: error.message };
  }
};

// Execute payment
export const executePayment = async (departmentPDA, paymentPDA) => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const organizationPDA = await getOrganizationPDA(wallet.publicKey);
    const notificationPDA = await getNotificationPDA(paymentPDA);
    
    const tx = await program.methods
      .executePayment()
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        payment: paymentPDA,
        notification: notificationPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    console.log('Payment executed. Transaction signature:', tx);
    return { success: true, signature: tx, notificationPDA };
  } catch (error) {
    console.error('Error executing payment:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationPDA) => {
  try {
    const program = getProgram();
    const wallet = program.provider.wallet;
    
    const tx = await program.methods
      .markNotificationRead()
      .accounts({
        notification: notificationPDA,
        authority: wallet.publicKey,
      })
      .rpc();
    
    console.log('Notification marked as read. Transaction signature:', tx);
    return { success: true, signature: tx };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get organization data
export const getOrganizationData = async (organizationPDA) => {
  try {
    const program = getProgram();
    const organizationAccount = await program.account.organization.fetch(organizationPDA);
    return organizationAccount;
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return null;
  }
};

// Get department data
export const getDepartmentData = async (departmentPDA) => {
  try {
    const program = getProgram();
    const departmentAccount = await program.account.department.fetch(departmentPDA);
    return departmentAccount;
  } catch (error) {
    console.error('Error fetching department data:', error);
    return null;
  }
};

// Get payment data
export const getPaymentData = async (paymentPDA) => {
  try {
    const program = getProgram();
    const paymentAccount = await program.account.payment.fetch(paymentPDA);
    return paymentAccount;
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return null;
  }
};

// Get notification data
export const getNotificationData = async (notificationPDA) => {
  try {
    const program = getProgram();
    const notificationAccount = await program.account.notification.fetch(notificationPDA);
    return notificationAccount;
  } catch (error) {
    console.error('Error fetching notification data:', error);
    return null;
  }
}; 