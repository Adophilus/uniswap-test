import {
  AllowanceProvider,
  AllowanceTransfer,
  MaxAllowanceTransferAmount,
  PERMIT2_ADDRESS,
  type PermitSingle,
} from "@uniswap/permit2-sdk";
import type { Wallet } from "./wallet";
import { Contract } from "ethers";
import { signTypedData } from "@uniswap/conedison/provider/index.js";

export type Permit = {
  permit: PermitSingle;
  signature: string;
};

const toDeadline = (expiration: number): number => {
  return Math.floor((Date.now() + expiration) / 1000);
};

const createPermitSingle = (
  spender: string,
  token: string,
  nonce: number,
): PermitSingle => ({
  details: {
    token,
    amount: MaxAllowanceTransferAmount,
    expiration: toDeadline(1000 * 60 * 60 * 24 * 30),
    nonce,
  },
  spender,
  sigDeadline: toDeadline(1000 * 60 * 60 * 30),
});

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

  const signature = await signTypedData(
    wallet.signer as any,
    domain,
    types,
    values,
  );

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

export const signPermit = async (
  wallet: Wallet,
  spender: string,
  token: string,
) => {
  const allowanceProvider = new AllowanceProvider(
    wallet.provider,
    PERMIT2_ADDRESS,
  );
  const account = await wallet.signer.getAddress();
  const {
    // amount: permitAmount,
    // expiration,
    nonce,
  } = await allowanceProvider.getAllowanceData(token, account, spender);

  const permitSingle = createPermitSingle(spender, token, nonce);
  const network = await wallet.provider.getNetwork();

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permitSingle,
    PERMIT2_ADDRESS,
    network.chainId,
  );

  return {
    signature: (await signTypedData(
      wallet.signer as any,
      domain,
      types,
      values,
    )) as string,
    permit: permitSingle,
  };
};

const PERMIT_ABI = [
  "function permit(address owner, tuple(tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender,uint256 sigDeadline) permitSingle, bytes calldata signature)",
];

export const permit = async (wallet: Wallet, permit: Permit) => {
  const account = await wallet.signer.getAddress();

  const permitContract = new Contract(
    PERMIT2_ADDRESS,
    PERMIT_ABI,
    wallet.signer,
  );

  return permitContract.permit(account, permit.permit, permit.signature);
};
