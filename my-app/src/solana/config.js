import { Connection, clusterApiUrl, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';

// Program ID from your Solana program
export const PROGRAM_ID = new PublicKey('2x3q1vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyv');

// Set network to devnet
export const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done"
export const opts = {
  preflightCommitment: 'processed',
};

// Function to get provider
export const getProvider = () => {
  if (!window.solana) {
    throw new Error('Wallet not connected');
  }
  
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new AnchorProvider(
    connection, 
    window.solana, 
    opts.preflightCommitment
  );
  return provider;
};

// Function to get program instance without using complex IDL parsing
export const getProgram = () => {
  const provider = getProvider();
  
  // Create a minimalist IDL with only the necessary information
  // This avoids the complex type checking that's causing issues
  const minimalistIdl = {
    version: '0.1.0',
    name: 'crypto_flow_blitz',
    instructions: [
      {
        name: 'initialize',
        accounts: [
          { name: 'organization', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: []
      },
      {
        name: 'setBudget',
        accounts: [
          { name: 'organization', isMut: true, isSigner: false },
          { name: 'authority', isMut: false, isSigner: true }
        ],
        args: [
          { name: 'amount', type: 'u64' }
        ]
      },
      {
        name: 'createDepartment',
        accounts: [
          { name: 'organization', isMut: false, isSigner: false },
          { name: 'department', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: [
          { name: 'name', type: 'string' },
          { name: 'budgetAllocation', type: 'u64' }
        ]
      },
      {
        name: 'schedulePayment',
        accounts: [
          { name: 'organization', isMut: false, isSigner: false },
          { name: 'department', isMut: true, isSigner: false },
          { name: 'payment', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: [
          { name: 'amount', type: 'u64' },
          { name: 'recipient', type: 'publicKey' },
          { name: 'memo', type: 'string' },
          { name: 'executionDate', type: 'i64' },
          { name: 'paymentId', type: 'u64' }
        ]
      },
      {
        name: 'executePayment',
        accounts: [
          { name: 'organization', isMut: false, isSigner: false },
          { name: 'department', isMut: true, isSigner: false },
          { name: 'payment', isMut: true, isSigner: false },
          { name: 'notification', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: []
      },
      {
        name: 'markNotificationRead',
        accounts: [
          { name: 'notification', isMut: true, isSigner: false },
          { name: 'authority', isMut: false, isSigner: true }
        ],
        args: []
      }
    ]
  };

  return new Program(minimalistIdl, PROGRAM_ID, provider);
};

// Helper functions for PDA derivation
export const getOrganizationPDA = async (authority) => {
  const [organizationPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('organization'),
      authority.toBuffer()
    ],
    PROGRAM_ID
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
    PROGRAM_ID
  );
  return departmentPDA;
};

export const getPaymentPDA = async (department, paymentId) => {
  const [paymentPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      department.toBuffer(),
      new BN(paymentId).toArrayLike(Buffer, 'le', 8)
    ],
    PROGRAM_ID
  );
  return paymentPDA;
};

export const getNotificationPDA = async (payment) => {
  const [notificationPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('notification'),
      payment.toBuffer()
    ],
    PROGRAM_ID
  );
  return notificationPDA;
};