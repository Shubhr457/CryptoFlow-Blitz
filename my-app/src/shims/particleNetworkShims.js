// This file contains shim implementations for Particle Network dependencies

// Shim for @particle-network/auth
export const rpcUrl = "";

// Add any other exports needed
export const ParticleNetwork = {
  connect: () => Promise.resolve({}),
  disconnect: () => Promise.resolve({})
}; 