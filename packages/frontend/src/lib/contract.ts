import type { Wallet } from "./wallet";
import type { Demo } from "@demo/contract/typechain-types";
import { Contract, type BigNumberish, type ContractTransaction } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function transferToOther(address token, uint160 amount, address recipient)",
];

export const transferTo = async (
  wallet: Wallet,
  token: string,
  recipient: string,
  amount: BigNumberish,
) => {
  const contract = new Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    wallet.signer,
  ) as unknown as Demo;
  return contract.transferToOther(token, amount, recipient);
};

const USDT_ABI = ["function _mint(address receiver,uint256 amount)"];
const DAI_ABI = ["function faucet()"];

export const faucet = async (wallet: Wallet, tokenAddress: string) => {
  let address: string;
  let abi: string[];

  let token =
    tokenAddress === import.meta.env.VITE_DAI_CONTRACT_ADDRESS
      ? ("DAI" as const)
      : ("USDT" as const);

  switch (token) {
    case "DAI": {
      address = import.meta.env.VITE_DAI_CONTRACT_ADDRESS;
      abi = DAI_ABI;
      break;
    }
    case "USDT": {
      address = import.meta.env.VITE_USDT_CONTRACT_ADDRESS;
      abi = USDT_ABI;
      break;
    }
  }

  const contract = new Contract(address, abi, wallet.signer);
  let tx: ContractTransaction;

  switch (token) {
    case "DAI": {
      tx = await contract.faucet();
      break;
    }
    case "USDT": {
      const address = await wallet.signer.getAddress();
      const amount = 100 * 10 ** 6;
      tx = await contract._mint(address, amount);
      break;
    }
  }

  return tx;
};
