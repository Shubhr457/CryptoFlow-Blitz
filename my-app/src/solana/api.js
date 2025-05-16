import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { getProgram } from './config';

export const getOrganizationPDA = async (authority) => {
  const [organizationPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('organization'),
      authority.toBuffer()
    ],
    getProgram().programId
  );
  return organizationPDA;
};

export const getDepartmentPDA = async (organization, name) => {
  const [departmentPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('department'),
      organization.toBuffer(),
      Buffer.from(name)
    ],
    getProgram().programId
  );
  return departmentPDA;
};

export const getPaymentPDA = async (department, paymentId) => {
  const [paymentPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      department.toBuffer(),
      new anchor.BN(paymentId).toArrayLike(Buffer, 'le', 8)
    ],
    getProgram().programId
  );
  return paymentPDA;
};

export const getNotificationPDA = async (payment) => {
  const [notificationPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('notification'),
      payment.toBuffer()
    ],
    getProgram().programId
  );
  return notificationPDA;
};

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
    return { success: true, signature: tx };
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
    
    const tx = await program.methods
      .setBudget(new anchor.BN(amount))
      .accounts({
        organization: organizationPDA,
        authority: wallet.publicKey
      })
      .rpc();
    
    console.log('Budget set. Transaction signature:', tx);
    return { success: true, signature: tx };
  } catch (error) {
    console.error('Error setting budget:', error);
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
    
    const tx = await program.methods
      .createDepartment(name, new anchor.BN(budgetAllocation))
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
    
    const tx = await program.methods
      .schedulePayment(
        new anchor.BN(amount),
        new PublicKey(recipient),
        memo,
        new anchor.BN(executionDate),
        new anchor.BN(paymentId)
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
        authority: wallet.publicKey
      })
      .rpc();
    
    console.log('Notification marked as read. Transaction signature:', tx);
    return { success: true, signature: tx };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
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