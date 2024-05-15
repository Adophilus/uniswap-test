import {
  AllowanceProvider,
  AllowanceTransfer,
  MaxAllowanceTransferAmount,
  PERMIT2_ADDRESS,
  type PermitSingle,
} from "@uniswap/permit2-sdk";
import type { Wallet } from "./wallet";
import { Contract } from "ethers";
import { signTypedData } from "@uniswap/conedison/provider/index";

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}

export const getAllowance = async (
  wallet: Wallet,
  spender: string,
  token: string,
) => {
  const permitSingle: PermitSingle = {
    details: {
      token,
      amount: MaxAllowanceTransferAmount,
      expiration: toDeadline(1000 * 60 * 60 * 24 * 30),
      nonce: Date.now(),
    },
    spender,
    sigDeadline: toDeadline(1000 * 60 * 60 * 30),
  };

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permitSingle,
    PERMIT2_ADDRESS,
    11155111,
  );

  const signature = await signTypedData(domain, types, values);

  return signature;
};

export const approve = async (wallet: Wallet, token: string) => {
  const permit2ContractAbi = ["function approve(address spender,uint amount)"];
  const permit2Contract = new Contract(
    token,
    permit2ContractAbi,
    wallet.signer,
  );
  return await permit2Contract.approve(
    PERMIT2_ADDRESS,
    MaxAllowanceTransferAmount,
  );
};

export const permit = async (
  wallet: Wallet,
  spender: string,
  token: string,
) => {
  const allowanceProvider = new AllowanceProvider(
    wallet.provider,
    PERMIT2_ADDRESS,
  );
  const account = await wallet.signer.getAddress();
  /**
   * Get the current allowance amount, expiration, and nonce using the AllowanceProvider.
   * This is the same data that would be used to create a PermitSingle object.
   * You can check permitAmount or expiration on this data to determine whether you need to create a new permit.
   */
  const {
    // amount: permitAmount,
    // expiration,
    nonce,
  } = await allowanceProvider.getAllowanceData(token, account, spender);

  /**
   * Create a PermitSingle object with the maximum allowance amount, and a deadline 30 days in the future.
   */
  const permitSingle: PermitSingle = {
    details: {
      token,
      amount: MaxAllowanceTransferAmount,
      expiration: toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30),
      nonce,
    },
    spender,
    sigDeadline: toDeadline(/* 30 mins= */ 1000 * 60 * 60 * 30),
  };

  const network = await wallet.provider.getNetwork();

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permitSingle,
    PERMIT2_ADDRESS,
    network.chainId,
  );

  const signature: string = await signTypedData(
    wallet.signer,
    domain,
    types,
    values,
  );

  const permitAbi = [
    "function permit(address owner, tuple(tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender,uint256 sigDeadline) permitSingle, bytes calldata signature)",
    "function transferFrom(address from, address to, uint160 amount, address token)",
  ];

  const permitContract = new Contract(
    PERMIT2_ADDRESS,
    permitAbi,
    wallet.signer,
  );

  return {
    tx: await permitContract.permit(account, permitSingle, signature),
    signature,
  };
};
