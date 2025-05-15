use anchor_lang::prelude::*;

declare_id!("2x3q1vagcURyJb9Y7nbXYFieUVnREKrfRVKmSmM6HQyv");

#[program]
pub mod crypto_flow_blitz {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
