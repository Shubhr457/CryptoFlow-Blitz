use anchor_lang::prelude::*;

declare_id!("2x3q1vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyv");

#[program]
pub mod crypto_flow_blitz {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        organization.authority = ctx.accounts.authority.key();
        organization.total_budget = 0;
        organization.bump = ctx.bumps.organization;
        
        msg!("Organization budget system initialized!");
        Ok(())
    }

    pub fn set_budget(ctx: Context<SetBudget>, amount: u64) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        organization.total_budget = amount;
        
        msg!("Total budget set to: {}", amount);
        Ok(())
    }

    pub fn create_department(ctx: Context<CreateDepartment>, name: String, budget_allocation: u64) -> Result<()> {
        require!(budget_allocation <= ctx.accounts.organization.total_budget, BudgetError::InsufficientBudget);
        
        let department = &mut ctx.accounts.department;
        department.name = name;
        department.budget_allocation = budget_allocation;
        department.budget_used = 0;
        department.authority = ctx.accounts.organization.key();
        department.bump = ctx.bumps.department;
        
        msg!("Department '{}' created with budget: {}", department.name, budget_allocation);
        Ok(())
    }

    pub fn schedule_payment(
        ctx: Context<SchedulePayment>, 
        amount: u64, 
        recipient: Pubkey,
        memo: String,
        execution_date: i64,
        payment_id: u64,
    ) -> Result<()> {
        let department = &ctx.accounts.department;
        require!(department.budget_used + amount <= department.budget_allocation, BudgetError::DepartmentBudgetExceeded);
        
        let payment = &mut ctx.accounts.payment;
        payment.amount = amount;
        payment.recipient = recipient;
        payment.department = department.key();
        payment.memo = memo;
        payment.execution_date = execution_date;
        payment.status = PaymentStatus::Scheduled;
        payment.payment_id = payment_id;
        payment.bump = ctx.bumps.payment;
        
        msg!("Payment of {} scheduled to {}", amount, recipient);
        Ok(())
    }

    pub fn execute_payment(ctx: Context<ExecutePayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let department = &mut ctx.accounts.department;
        
        require!(payment.status == PaymentStatus::Scheduled, BudgetError::InvalidPaymentStatus);
        require!(Clock::get()?.unix_timestamp >= payment.execution_date, BudgetError::PaymentNotDue);
        
        // In a real implementation, this would transfer funds to the recipient
        // For now, we just mark it as executed and update the department budget
        payment.status = PaymentStatus::Executed;
        department.budget_used += payment.amount;
        
        msg!("Payment of {} executed to {}", payment.amount, payment.recipient);
        
        // Create a notification
        let notification = &mut ctx.accounts.notification;
        notification.payment = payment.key();
        notification.message = format!("Payment of {} to {} was executed successfully", payment.amount, payment.recipient);
        notification.timestamp = Clock::get()?.unix_timestamp;
        notification.is_read = false;
        notification.bump = ctx.bumps.notification;
        
        Ok(())
    }

    pub fn mark_notification_read(ctx: Context<MarkNotificationRead>) -> Result<()> {
        let notification = &mut ctx.accounts.notification;
        notification.is_read = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Organization::SPACE,
        seeds = [b"organization", authority.key().as_ref()],
        bump
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetBudget<'info> {
    #[account(
        mut,
        seeds = [b"organization", authority.key().as_ref()],
        bump = organization.bump,
        has_one = authority
    )]
    pub organization: Account<'info, Organization>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, budget_allocation: u64)]
pub struct CreateDepartment<'info> {
    #[account(
        seeds = [b"organization", authority.key().as_ref()],
        bump = organization.bump,
        has_one = authority
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Department::SPACE,
        seeds = [b"department", organization.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub department: Account<'info, Department>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, recipient: Pubkey, memo: String, execution_date: i64, payment_id: u64)]
pub struct SchedulePayment<'info> {
    #[account(
        seeds = [b"organization", authority.key().as_ref()],
        bump = organization.bump,
        has_one = authority
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        seeds = [b"department", organization.key().as_ref(), department.name.as_bytes()],
        bump = department.bump
    )]
    pub department: Account<'info, Department>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Payment::SPACE,
        seeds = [b"payment", department.key().as_ref(), &payment_id.to_le_bytes()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecutePayment<'info> {
    #[account(
        seeds = [b"organization", authority.key().as_ref()],
        bump = organization.bump,
        has_one = authority
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        seeds = [b"department", organization.key().as_ref(), department.name.as_bytes()],
        bump = department.bump
    )]
    pub department: Account<'info, Department>,
    
    #[account(
        mut,
        seeds = [b"payment", department.key().as_ref(), &payment.payment_id.to_le_bytes()],
        bump = payment.bump
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Notification::SPACE,
        seeds = [b"notification", payment.key().as_ref()],
        bump
    )]
    pub notification: Account<'info, Notification>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkNotificationRead<'info> {
    #[account(
        mut,
        seeds = [b"notification", notification.payment.as_ref()],
        bump = notification.bump
    )]
    pub notification: Account<'info, Notification>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Organization {
    pub authority: Pubkey,     // 32
    pub total_budget: u64,     // 8
    pub bump: u8,              // 1
}

impl Organization {
    pub const SPACE: usize = 32 + 8 + 1;
}

#[account]
pub struct Department {
    pub name: String,          // 4 + max_size
    pub budget_allocation: u64, // 8
    pub budget_used: u64,      // 8
    pub authority: Pubkey,     // 32
    pub bump: u8,              // 1
}

impl Department {
    pub const SPACE: usize = 4 + 50 + 8 + 8 + 32 + 1;
}

#[account]
pub struct Payment {
    pub amount: u64,           // 8
    pub recipient: Pubkey,     // 32
    pub department: Pubkey,    // 32
    pub memo: String,          // 4 + max_size
    pub execution_date: i64,   // 8
    pub status: PaymentStatus, // 1
    pub payment_id: u64,       // 8
    pub bump: u8,              // 1
}

impl Payment {
    pub const SPACE: usize = 8 + 32 + 32 + 4 + 100 + 8 + 1 + 8 + 1;
}

#[account]
pub struct Notification {
    pub payment: Pubkey,       // 32
    pub message: String,       // 4 + max_size
    pub timestamp: i64,        // 8
    pub is_read: bool,         // 1
    pub bump: u8,              // 1
}

impl Notification {
    pub const SPACE: usize = 32 + 4 + 200 + 8 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum PaymentStatus {
    Scheduled,
    Executed,
    Failed,
}

#[error_code]
pub enum BudgetError {
    #[msg("Insufficient budget for this operation")]
    InsufficientBudget,
    #[msg("Department budget would be exceeded")]
    DepartmentBudgetExceeded,
    #[msg("Payment is not in a valid status for this operation")]
    InvalidPaymentStatus,
    #[msg("Payment execution date has not been reached")]
    PaymentNotDue,
}
