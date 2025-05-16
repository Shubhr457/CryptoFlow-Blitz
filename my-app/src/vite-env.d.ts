/// <reference types="vite/client" />

// Declare problem modules to fix TypeScript errors
declare module '@toruslabs/solana-embed' {
  const TorusClass: any;
  export default TorusClass;
}

declare module '@particle-network/auth' {
  export const rpcUrl: any;
}

declare module '@walletconnect/core' {
  export const Core: any;
  export const Store: any;
  export const VERIFY_SERVER: any;
}

declare module 'bn.js' {
  class BN {
    constructor(value: string | number | BN, base?: number | string);
    // Add other BN methods as needed
  }
  export = BN;
}

declare module 'bignumber.js' {
  class BigNumber {
    constructor(value: string | number | BigNumber);
    // Add other BigNumber methods as needed
  }
  export = BigNumber;
} 