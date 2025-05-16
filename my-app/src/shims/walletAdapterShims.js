// This file contains shim implementations for problematic wallet adapter dependencies

// Shim for @toruslabs/solana-embed
const TorusClass = {
  init: () => Promise.resolve({}),
  login: () => Promise.resolve({})
};

export default TorusClass; 