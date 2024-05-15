import hooks from "@demo/frontend/hooks";
import "./styles.less";
import { useState, type FormEvent, type FunctionComponent } from "react";
import lib from "@demo/frontend/lib";
import type { Wallet } from "@demo/frontend/types";
import { ethers } from "ethers";

const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS;
const DAI_TOKEN_ADDRESS = import.meta.env.VITE_DAI_CONTRACT_ADDRESS;
const SPENDER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const TokenForm: FunctionComponent<{
	setTokenAddress: (ta: string) => void;
}> = ({ setTokenAddress }) => {
	return (
		<form className="form faucet-form" onSubmit={(e) => e.preventDefault()}>
			<div>
				<select
					onChange={(e) =>
						setTokenAddress(e.currentTarget.selectedOptions[0].value)
					}
				>
					<option value={USDT_TOKEN_ADDRESS}>USDT</option>
					<option value={DAI_TOKEN_ADDRESS}>DAI</option>
				</select>
			</div>
		</form>
	);
};

const FaucetForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
}> = ({ wallet, tokenAddress }) => {
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		lib.contract.faucet(wallet, tokenAddress).catch((err) => {
			alert(`Transaction reverted. Reason = ${err.reason}`);
		});
	};

	return (
		<form className="form faucet-form" onSubmit={onSubmit}>
			<div>
				<button type="submit">Faucet</button>
			</div>
		</form>
	);
};

const PermitForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
}> = ({ wallet, tokenAddress }) => {
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const tx = await lib.permit2.authorize(wallet, tokenAddress);
		console.log(await tx.wait());
	};

	return (
		<form className="form permit-form" onSubmit={onSubmit}>
			<div>
				<button type="submit">Permit</button>
			</div>
		</form>
	);
};

const TransferForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
}> = ({ wallet, tokenAddress }) => {
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// const tx = await lib.permit2.handlePermit(
		// 	wallet,
		// 	tokenAddress,
		// 	SPENDER_ADDRESS,
		// );
		// console.log(await tx.wait());

		const rawAmount =
			e.currentTarget.querySelector<HTMLInputElement>("input")!.value;
		const amount = parseInt(rawAmount ?? "0");
		const recipient = import.meta.env.VITE_CONTRACT_ADDRESS;

		await lib.contract.transferTo(wallet, tokenAddress, recipient, "", amount);
	};

	return (
		<form className="form transfer-form" onSubmit={onSubmit}>
			<div>
				<input type="number" placeholder="Amount" />
			</div>
			<div>
				<button type="submit">Transfer</button>
			</div>
		</form>
	);
};

export default function() {
	const [tokenAddress, setTokenAddress] = useState(USDT_TOKEN_ADDRESS);
	const { connect, wallet } = hooks.wallet.useGetWallet();

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		connect();
	};

	if (!wallet)
		return (
			<main>
				<form className="form connect-form" onSubmit={onSubmit}>
					<div>
						<button type="submit">Connect Wallet</button>
					</div>
				</form>
			</main>
		);

	return (
		<main>
			<TokenForm setTokenAddress={setTokenAddress} />
			<FaucetForm wallet={wallet} tokenAddress={tokenAddress} />
			<PermitForm wallet={wallet} tokenAddress={tokenAddress} />
			<TransferForm wallet={wallet} tokenAddress={tokenAddress} />
		</main>
	);
}
