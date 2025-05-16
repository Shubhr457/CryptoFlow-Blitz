import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  const { wallet, publicKey } = useWallet();

  return (
    <div className="wallet-button-container">
      <WalletMultiButton />
      {publicKey && (
        <div className="wallet-info">
          <p>Connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</p>
        </div>
      )}
    </div>
  );
}; 