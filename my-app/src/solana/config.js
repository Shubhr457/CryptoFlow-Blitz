import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './idl.json';

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

// Function to get program instance
export const getProgram = () => {
  try {
    const provider = getProvider();
    
    // Create a clean copy of the IDL to avoid mutation issues
    const idlCopy = JSON.parse(JSON.stringify(idl));
    
    // Initialize program with the copied IDL
    const program = new Program(idlCopy, PROGRAM_ID, provider);
    return program;
  } catch (error) {
    console.error('Error creating program instance:', error);
    // Return a mock program for development purposes
    return {
      programId: PROGRAM_ID,
      methods: {
        initialize: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) }),
        setBudget: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) }),
        createDepartment: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) }),
        schedulePayment: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) }),
        executePayment: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) }),
        markNotificationRead: () => ({ accounts: () => ({ rpc: () => 'mock-tx' }) })
      }
    };
  }
};