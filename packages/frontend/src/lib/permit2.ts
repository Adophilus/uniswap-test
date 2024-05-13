import { AllowanceTransfer, MaxAllowanceTransferAmount, PERMIT2_ADDRESS, type PermitSingle } from '@uniswap/permit2-sdk'
import type { Signer } from 'ethers'


function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

export const getAllowance = async (signer: Signer, spender: string, token: string) => {
  const permitSingle: PermitSingle = {
    details: {
      token,
      amount: MaxAllowanceTransferAmount,
      expiration: toDeadline(1000 * 60 * 60 * 24 * 30),
      nonce: Date.now(),
    },
    spender,
    sigDeadline: toDeadline(1000 * 60 * 60 * 30),
  }

  const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, 11155111)

  const signature = await signer.signTypedData(domain as any, types, values)

  return signature
}
