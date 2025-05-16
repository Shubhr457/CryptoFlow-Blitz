# CryptoFlow-Blitz

## Overview
CryptoFlow-Blitz is a decentralized financial management system built on the Solana blockchain. It enables organizations to manage budgets, create departments, schedule and execute cryptocurrency payments in a transparent and efficient manner.

## Features
- **Organization Management**: Create and manage organizations with total budget allocation
- **Department Structure**: Divide budgets among different departments
- **Payment Scheduling**: Schedule future payments with execution dates
- **Payment Execution**: Automatically execute payments when they become due
- **Notification System**: Get notified when payments are executed
- **Budget Tracking**: Track budget allocation and usage across departments

## Project Structure

### Smart Contract (Anchor Program)
- Located in `programs/crypto-flow-blitz/src/lib.rs`
- Implements the core business logic for budget management and payment processing
- Uses Solana's Program Derived Addresses (PDAs) for account management

### Frontend Application
- React-based web application in the `my-app` directory
- Connects to Solana blockchain using Solana Web3.js and Anchor libraries
- Provides user interface for managing organizations, departments, and payments

## Technical Stack

### Backend
- **Solana Blockchain**: High-performance blockchain platform
- **Anchor Framework**: Framework for Solana program development
- **Rust**: Programming language for smart contract development

### Frontend
- **React**: JavaScript library for building user interfaces
- **Solana Web3.js**: JavaScript API for interacting with Solana
- **Anchor Client**: JavaScript client for interacting with Anchor programs

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Rust and Cargo
- Solana CLI tools
- Anchor Framework

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/CryptoFlow-Blitz.git
   cd CryptoFlow-Blitz
   ```

2. Install dependencies
   ```bash
   npm install
   cd my-app
   npm install
   ```

3. Build the Anchor program
   ```bash
   anchor build
   ```

4. Deploy the program to Solana devnet
   ```bash
   anchor deploy
   ```

5. Start the frontend application
   ```bash
   cd my-app
   npm run dev
   ```

## Usage

1. **Connect Wallet**: Connect your Solana wallet (Phantom, Solflare, etc.)
2. **Initialize Organization**: Create a new organization with a budget
3. **Create Departments**: Set up departments with budget allocations
4. **Schedule Payments**: Schedule payments to be executed at specific dates
5. **Execute Payments**: Payments will be executed automatically when due
6. **View Notifications**: Check notifications for payment executions

## Development Workflow

### Smart Contract Development
1. Modify the Rust code in `programs/crypto-flow-blitz/src/lib.rs`
2. Build and test the program
   ```bash
   anchor build
   anchor test
   ```
3. Deploy to devnet for testing
   ```bash
   anchor deploy --provider.cluster devnet
   ```

### Frontend Development
1. Modify React components in `my-app/src`
2. Run the development server
   ```bash
   cd my-app
   npm run dev
   ```
3. Test with a connected wallet on devnet

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
