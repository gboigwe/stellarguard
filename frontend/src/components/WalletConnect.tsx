"use client";

import React from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { formatAddress } from "@/lib/formatters";
import { CopyButton } from "@/components/CopyButton";
import { SecureExternalLink } from "@/components/SecureExternalLink";

export const WalletConnect = () => {
  const { address, isConnecting, connect, disconnect, isFreighterInstalled, error } = useFreighter();

  if (!isFreighterInstalled) {
    return (
      <SecureExternalLink
        href="https://www.freighter.app/"
        className="btn-primary text-sm"
        aria-label="Install Freighter wallet browser extension"
      >
        Install Freighter
      </SecureExternalLink>
    );
  }

  if (isConnecting) {
    return (
      <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed" aria-label="Connecting to wallet, please wait">
        Connecting...
      </button>
    );
  }

  if (address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-stellar-blue">
          {formatAddress(address)}
        </div>
        <CopyButton
          value={address}
          label="wallet address"
          className="text-[11px]"
        />
        <button 
          onClick={disconnect}
          className="text-xs text-gray-500 hover:text-white transition-colors"
          aria-label="Disconnect wallet from StellarGuard"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
      className="flex flex-col items-end space-y-1"
    >
      <div 
        className="sr-only"
      >
        {address ? `Wallet connected: ${formatAddress(address)}` : 'Wallet not connected'}
      </div>
      <button 
        onClick={connect}
        className="btn-primary text-sm"
        aria-label="Connect your Freighter wallet to StellarGuard"
      >
        Connect Wallet
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
};
