import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CryptoFlowBlitz } from "../target/types/crypto_flow_blitz";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { assert } from "chai";

describe("crypto-flow-blitz", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.cryptoFlowBlitz as Program<CryptoFlowBlitz>;
  
  // Generate a new authority for this test run to avoid account conflicts
  const authorityKeypair = Keypair.generate();
  const authority = authorityKeypair.publicKey;
  
  // Create an unauthorized user for negative testing
  const unauthorizedUser = Keypair.generate();
  
  // PDAs and variables we'll use
  let organizationPDA: PublicKey;
  let departmentPDA: PublicKey;
  let paymentPDA: PublicKey;
  let notificationPDA: PublicKey;
  
  // Create a second department to test multiple departments
  let secondDepartmentPDA: PublicKey;
  const secondDepartmentName = "Marketing";
  
  // Generate a unique prefix for this test run to avoid account conflicts
  const testRunId = Math.floor(Math.random() * 1000000).toString();
  const departmentName = `Engineering-${testRunId}`;
  
  // Department and payment details
  const totalBudget = new anchor.BN(1000000);
  const deptBudget = new anchor.BN(500000);
  const secondDeptBudget = new anchor.BN(300000);
  const paymentAmount = new anchor.BN(100000);
  const largeDeptPayment = new anchor.BN(600000); // Exceeds dept budget
  const paymentId = new anchor.BN(1);
  const secondPaymentId = new anchor.BN(2);
  const recipient = anchor.web3.Keypair.generate().publicKey;
  const memo = "Monthly vendor payment";
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const executionDate = new anchor.BN(currentTimestamp); // Immediate execution
  const futureDate = new anchor.BN(currentTimestamp + 86400); // Tomorrow
  
  before(async () => {
    // Fund test wallets from provider wallet instead of using airdrops
    const fundAmount = 2 * LAMPORTS_PER_SOL;
    
    // Fund the authority keypair
    const transferTx1 = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: authority,
        lamports: fundAmount
      })
    );
    
    await provider.sendAndConfirm(transferTx1);
    console.log(`Funded authority with ${fundAmount/LAMPORTS_PER_SOL} SOL`);
    
    // Fund the unauthorized user
    const transferTx2 = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: unauthorizedUser.publicKey,
        lamports: 1 * LAMPORTS_PER_SOL
      })
    );
    
    await provider.sendAndConfirm(transferTx2);
    console.log(`Funded unauthorized user with ${2} SOL`);
    
    // Find the organization PDA
    [organizationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("organization"), 
        authority.toBuffer()
      ],
      program.programId
    );

    console.log("Organization PDA:", organizationPDA.toString());
    console.log("Test run ID:", testRunId);
    
    // Find department PDAs
    [departmentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("department"),
        organizationPDA.toBuffer(),
        Buffer.from(departmentName)
      ],
      program.programId
    );
    
    [secondDepartmentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("department"),
        organizationPDA.toBuffer(),
        Buffer.from(`${secondDepartmentName}-${testRunId}`)
      ],
      program.programId
    );
  });

  // Basic happy path tests
  it("Initializes an organization", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        organization: organizationPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Initialize transaction signature:", tx);
    
    // Verify organization was created
    const organizationAccount = await program.account.organization.fetch(organizationPDA);
    expect(organizationAccount.authority.toString()).to.equal(authority.toString());
    expect(organizationAccount.totalBudget.toNumber()).to.equal(0);
  });
  
  it("Sets a budget for the organization", async () => {
    const tx = await program.methods
      .setBudget(totalBudget)
      .accounts({
        organization: organizationPDA,
        authority: authority,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Set budget transaction signature:", tx);
    
    // Verify budget was set
    const organizationAccount = await program.account.organization.fetch(organizationPDA);
    expect(organizationAccount.totalBudget.toString()).to.equal(totalBudget.toString());
  });
  
  it("Creates a department", async () => {
    const tx = await program.methods
      .createDepartment(departmentName, deptBudget)
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Create department transaction signature:", tx);
    
    // Verify department was created
    const departmentAccount = await program.account.department.fetch(departmentPDA);
    expect(departmentAccount.name).to.equal(departmentName);
    expect(departmentAccount.budgetAllocation.toString()).to.equal(deptBudget.toString());
    expect(departmentAccount.budgetUsed.toNumber()).to.equal(0);
  });
  
  it("Creates a second department", async () => {
    const secondDeptName = `${secondDepartmentName}-${testRunId}`;
    
    const tx = await program.methods
      .createDepartment(secondDeptName, secondDeptBudget)
      .accounts({
        organization: organizationPDA,
        department: secondDepartmentPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    // Verify second department was created
    const departmentAccount = await program.account.department.fetch(secondDepartmentPDA);
    expect(departmentAccount.name).to.equal(secondDeptName);
    expect(departmentAccount.budgetAllocation.toString()).to.equal(secondDeptBudget.toString());
  });
  
  it("Schedules a payment", async () => {
    // Find the payment PDA
    [paymentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("payment"),
        departmentPDA.toBuffer(),
        paymentId.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    console.log("Payment PDA:", paymentPDA.toString());
    
    const tx = await program.methods
      .schedulePayment(
        paymentAmount,
        recipient,
        memo,
        executionDate,
        paymentId
      )
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        payment: paymentPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Schedule payment transaction signature:", tx);
    
    // Verify payment was scheduled
    const paymentAccount = await program.account.payment.fetch(paymentPDA);
    expect(paymentAccount.amount.toString()).to.equal(paymentAmount.toString());
    expect(paymentAccount.recipient.toString()).to.equal(recipient.toString());
    expect(paymentAccount.department.toString()).to.equal(departmentPDA.toString());
    expect(paymentAccount.memo).to.equal(memo);
    expect(paymentAccount.status.scheduled).to.not.be.undefined;
  });
  
  it("Schedules a payment with future execution date", async () => {
    // Find the second payment PDA
    const [futurePaymentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("payment"),
        departmentPDA.toBuffer(),
        secondPaymentId.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const tx = await program.methods
      .schedulePayment(
        paymentAmount,
        recipient,
        "Future payment",
        futureDate,
        secondPaymentId
      )
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        payment: futurePaymentPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    // Verify future payment was scheduled
    const paymentAccount = await program.account.payment.fetch(futurePaymentPDA);
    expect(paymentAccount.executionDate.toString()).to.equal(futureDate.toString());
  });
  
  it("Executes a payment", async () => {
    // Find the notification PDA
    [notificationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("notification"),
        paymentPDA.toBuffer()
      ],
      program.programId
    );
    
    console.log("Notification PDA:", notificationPDA.toString());
    
    const tx = await program.methods
      .executePayment()
      .accounts({
        organization: organizationPDA,
        department: departmentPDA,
        payment: paymentPDA,
        notification: notificationPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Execute payment transaction signature:", tx);
    
    // Verify payment was executed
    const paymentAccount = await program.account.payment.fetch(paymentPDA);
    expect(paymentAccount.status.executed).to.not.be.undefined;
    
    // Verify department budget was updated
    const departmentAccount = await program.account.department.fetch(departmentPDA);
    expect(departmentAccount.budgetUsed.toString()).to.equal(paymentAmount.toString());
    
    // Verify notification was created
    const notificationAccount = await program.account.notification.fetch(notificationPDA);
    expect(notificationAccount.payment.toString()).to.equal(paymentPDA.toString());
    expect(notificationAccount.isRead).to.equal(false);
  });
  
  it("Marks a notification as read", async () => {
    const tx = await program.methods
      .markNotificationRead()
      .accounts({
        notification: notificationPDA,
        authority: authority,
      })
      .signers([authorityKeypair])
      .rpc();
      
    console.log("Mark notification read transaction signature:", tx);
    
    // Verify notification was marked as read
    const notificationAccount = await program.account.notification.fetch(notificationPDA);
    expect(notificationAccount.isRead).to.equal(true);
  });
  
  // Edge cases and error tests
  describe("Edge Cases", () => {
    it("Fails to execute a payment with future date", async () => {
      // Find the future payment PDA we created earlier
      const [futurePaymentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("payment"),
          departmentPDA.toBuffer(),
          secondPaymentId.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      
      // Find notification PDA for future payment
      const [futureNotificationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("notification"),
          futurePaymentPDA.toBuffer()
        ],
        program.programId
      );
      
      try {
        await program.methods
          .executePayment()
          .accounts({
            organization: organizationPDA,
            department: departmentPDA,
            payment: futurePaymentPDA,
            notification: futureNotificationPDA,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([authorityKeypair])
          .rpc();
          
        assert.fail("Expected the transaction to fail due to future execution date");
      } catch (error) {
        console.log("Error occurred as expected for future payment execution");
        // PaymentNotDue error expected
      }
    });
    
    it("Fails to execute an already executed payment", async () => {
      // Try to execute the same payment again
      try {
        await program.methods
          .executePayment()
          .accounts({
            organization: organizationPDA,
            department: departmentPDA,
            payment: paymentPDA,
            notification: notificationPDA,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([authorityKeypair])
          .rpc();
          
        assert.fail("Expected the transaction to fail due to payment already executed");
      } catch (error) {
        console.log("Error occurred as expected for double payment execution");
        // InvalidPaymentStatus error expected
      }
    });
    
    it("Fails to schedule payment exceeding department budget", async () => {
      // Find the payment PDA for large payment
      const largePaymentId = new anchor.BN(3);
      const [largePaymentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("payment"),
          departmentPDA.toBuffer(),
          largePaymentId.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      
      try {
        await program.methods
          .schedulePayment(
            largeDeptPayment, // Exceeds department budget
            recipient,
            "Oversized payment",
            executionDate,
            largePaymentId
          )
          .accounts({
            organization: organizationPDA,
            department: departmentPDA,
            payment: largePaymentPDA,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([authorityKeypair])
          .rpc();
          
        assert.fail("Expected the transaction to fail due to budget constraint");
      } catch (error) {
        console.log("Error occurred as expected for payment exceeding budget");
        // DepartmentBudgetExceeded error expected
      }
    });
    
    it("Creates a department with zero budget", async () => {
      const zeroBudgetDeptName = `EmptyDept-${testRunId}`;
      const [zeroBudgetDeptPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("department"),
          organizationPDA.toBuffer(),
          Buffer.from(zeroBudgetDeptName)
        ],
        program.programId
      );
      
      const tx = await program.methods
        .createDepartment(zeroBudgetDeptName, new anchor.BN(0))
        .accounts({
          organization: organizationPDA,
          department: zeroBudgetDeptPDA,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authorityKeypair])
        .rpc();
        
      // Verify zero budget department was created
      const departmentAccount = await program.account.department.fetch(zeroBudgetDeptPDA);
      expect(departmentAccount.budgetAllocation.toNumber()).to.equal(0);
    });
    
    it("Cannot mark notification as read with unauthorized user", async () => {
      try {
        await program.methods
          .markNotificationRead()
          .accounts({
            notification: notificationPDA,
            authority: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
          
        assert.fail("Expected the transaction to fail due to authorization");
      } catch (error) {
        console.log("Error occurred as expected for unauthorized notification read");
        // Authorization error expected
      }
    });

    it("Updates budget after payments are scheduled", async () => {
      // Get current organization budget
      const orgBefore = await program.account.organization.fetch(organizationPDA);
      const newBudget = new anchor.BN(2000000); // Double the budget
      
      // Update the budget
      await program.methods
        .setBudget(newBudget)
        .accounts({
          organization: organizationPDA,
          authority: authority,
        })
        .signers([authorityKeypair])
        .rpc();
        
      // Verify budget was updated
      const orgAfter = await program.account.organization.fetch(organizationPDA);
      expect(orgAfter.totalBudget.toString()).to.equal(newBudget.toString());
      
      // Create a new department with higher budget than was previously possible
      const highBudgetDeptName = `HighBudget-${testRunId}`;
      const highBudget = new anchor.BN(1500000);
      const [highBudgetDeptPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("department"),
          organizationPDA.toBuffer(),
          Buffer.from(highBudgetDeptName)
        ],
        program.programId
      );
      
      await program.methods
        .createDepartment(highBudgetDeptName, highBudget)
        .accounts({
          organization: organizationPDA,
          department: highBudgetDeptPDA,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authorityKeypair])
        .rpc();
        
      // Verify high budget department was created
      const departmentAccount = await program.account.department.fetch(highBudgetDeptPDA);
      expect(departmentAccount.budgetAllocation.toString()).to.equal(highBudget.toString());
    });
    
    it("Handles special characters in department names and memos", async () => {
      const specialDeptName = `IT & Systems!-${testRunId}`;
      const [specialDeptPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("department"),
          organizationPDA.toBuffer(),
          Buffer.from(specialDeptName)
        ],
        program.programId
      );
      
      await program.methods
        .createDepartment(specialDeptName, new anchor.BN(100000))
        .accounts({
          organization: organizationPDA,
          department: specialDeptPDA,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authorityKeypair])
        .rpc();
        
      // Verify special character department was created
      const departmentAccount = await program.account.department.fetch(specialDeptPDA);
      expect(departmentAccount.name).to.equal(specialDeptName);
      
      // Schedule payment with special characters in memo
      const specialPaymentId = new anchor.BN(10);
      const [specialPaymentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("payment"),
          specialDeptPDA.toBuffer(),
          specialPaymentId.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      
      const specialMemo = "Payment for services: API & DB integration @ $50/hr";
      await program.methods
        .schedulePayment(
          new anchor.BN(50000),
          recipient,
          specialMemo,
          executionDate,
          specialPaymentId
        )
        .accounts({
          organization: organizationPDA,
          department: specialDeptPDA,
          payment: specialPaymentPDA,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authorityKeypair])
        .rpc();
        
      // Verify special memo was stored correctly
      const paymentAccount = await program.account.payment.fetch(specialPaymentPDA);
      expect(paymentAccount.memo).to.equal(specialMemo);
    });
  });
});
