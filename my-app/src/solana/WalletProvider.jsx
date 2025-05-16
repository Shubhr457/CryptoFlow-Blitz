import React, { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Create a custom PhantomAdapter that doesn't rely on class extension
const createPhantomAdapter = () => {
  // Basic adapter structure that matches what the wallet adapter expects
  return {
    name: 'Phantom',
    url: 'https://phantom.app/',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM1MzRCQjEiLz4KPHBhdGggZD0iTTEwNi41MDIgNDcuMzc0Mkw4OC4wNjgxIDY0LjkzODVDODUuMTQ2MiA2Ny42OTI0IDgwLjkxNDMgNjguNzIwNiA3Ni45NTU4IDY3LjU2NDVMNTcuMzU3NSA2Mi4yOTk1QzU0LjI0OTkgNjEuNDQxOSA1MC45MjgxIDYyLjQzNzggNDguOTUyNSA2NC45MzM0TDI3LjE0NjkgOTIuNjA0NkMyMy4xNjY5IDk3Ljc0ODUgMjcuNTY5NCAxMDUuMDI3IDM0LjI4NzIgMTAzLjc3MUw1My44ODU1IDk5LjY1OTRDNTYuOTkzMSA5OC45NzU5IDYwLjMxNDkgOTkuODY0NSA2Mi4yOTA1IDEwMi4yNjdMNzQuNjkxNyAxMTcuNjM5Qzc4LjY3MTcgMTIyLjY4OSA4Ny40NzY1IDEyMC42MzMgODguNTk1OCAxMTQuMzU3TDEwNi4xNCA1Mi4zNDM4QzEwNy4wNTkgNDcuMTYyNyAxMDYuNTAyIDQ3LjM3NDIgMTA2LjUwMiA0Ny4zNzQyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTg0LjI3MjUgMTkuOTg5NEw2NC42NzQyIDI0LjEwMTFDNjEuNTY2NiAyNC43ODQ2IDU4LjI0NDggMjMuODk2IDU2LjI2OTIgMjEuNDkzNUw0My44Njc5IDYuMTIxNDJDMzkuODg4IDEuMDcxNDcgMzEuMDgzMiAzLjEyNzg5IDI5Ljk2MzggOS40MDQxOUwxMi40MTk2IDcxLjQxNzdDMTEuNTAwNiA3Ni41OTg4IDEyLjA1NzYgNzYuMzg3MyAxMi4wNTc2IDc2LjM4NzNMMzAuNDkxNyA1OC44MjNDMzMuNDEzNiA1Ni4wNjkxIDM3LjY0NTUgNTUuMDQwOSA0MS42MDQgNTYuMTk3TDYxLjIwMjMgNjEuNDYyQzY0LjMwOTkgNjIuMzE5NiA2Ny42MzE3IDYxLjMyMzcgNjkuNjA3MyA1OC44MjgxTDkxLjQxMjkgMzEuMTU2OUM5NS4zOTI5IDI2LjAxMyA5MC45OTA0IDE4LjczNDQgODQuMjcyNSAxOS45ODk0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    readyState: 'Installed',
    publicKey: null,
    connecting: false,
    connected: false,
    autoConnect: false,
    connectedAt: null,
    disconnecting: false,
    supportedTransactionVersions: null,
    
    // Methods
    connect: async () => {
      try {
        if (!window.solana) {
          window.open('https://phantom.app/', '_blank');
          throw new Error('Phantom not installed');
        }
        
        await window.solana.connect();
        return window.solana;
      } catch (error) {
        console.error('Error connecting to Phantom wallet:', error);
        throw error;
      }
    },
    disconnect: async () => {
      try {
        if (window.solana) {
          await window.solana.disconnect();
        }
      } catch (error) {
        console.error('Error disconnecting from Phantom wallet:', error);
        throw error;
      }
    },
    signTransaction: async (transaction) => {
      if (!window.solana) throw new Error('Wallet not connected');
      return await window.solana.signTransaction(transaction);
    },
    signAllTransactions: async (transactions) => {
      if (!window.solana) throw new Error('Wallet not connected');
      return await window.solana.signAllTransactions(transactions);
    },
    signMessage: async (message) => {
      if (!window.solana) throw new Error('Wallet not connected');
      return await window.solana.signMessage(message);
    }
  };
};

export const SolanaWalletProvider = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Create a custom wallet adapter that doesn't rely on class extension
  const [wallets, setWallets] = useState([]);
  
  useEffect(() => {
    try {
      // Create a custom Phantom adapter
      const phantomAdapter = createPhantomAdapter();
      setWallets([phantomAdapter]);
    } catch (error) {
      console.error("Error initializing wallet adapters:", error);
      setWallets([]);
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 