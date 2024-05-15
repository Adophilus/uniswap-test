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
					className="form-input"
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
				<button className="form-input" type="submit">
					Faucet
				</button>
			</div>
		</form>
	);
};

const ApproveForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
}> = ({ wallet, tokenAddress }) => {
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const tx = await lib.permit2.approve(wallet, tokenAddress);
		console.log(await tx.wait());
	};

	return (
		<form className="form approve-form" onSubmit={onSubmit}>
			<div>
				<button className="form-input" type="submit">
					Approve
				</button>
			</div>
		</form>
	);
};

const PermitForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
}> = ({ wallet, tokenAddress }) => {
	const [loading, setLoading] = useState(false);
	const [signature, setSignature] = useState<string>();

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		lib.permit2
			.permit(wallet, SPENDER_ADDRESS, tokenAddress)
			.then(({ signature }) => setSignature(signature))
			.finally(() => setLoading(false));
	};

	return (
		<form className="form approve-form" onSubmit={onSubmit}>
			<div>{signature}</div>
			<div>
				<button className="form-input" disabled={loading} type="submit">
					Permit
				</button>
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

		const rawAmount =
			e.currentTarget.querySelector<HTMLInputElement>("input")!.value;

		let decimals = tokenAddress === USDT_TOKEN_ADDRESS ? 6 : 18;
		let amount = parseInt(rawAmount ?? "0") * 10 ** decimals;
		const recipient = SPENDER_ADDRESS;

		await lib.contract.transferTo(wallet, tokenAddress, recipient, "", amount);
	};

	return (
		<form className="form permit-form" onSubmit={onSubmit}>
			<div>
				<input type="number" className="form-input" placeholder="Amount" />
			</div>
			<div>
				<button className="form-input" type="submit">
					Transfer
				</button>
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
						<button className="form-input" type="submit">
							Connect Wallet
						</button>
					</div>
				</form>
			</main>
		);

	return (
		<main>
			<TokenForm setTokenAddress={setTokenAddress} />
			<FaucetForm wallet={wallet} tokenAddress={tokenAddress} />
			<ApproveForm wallet={wallet} tokenAddress={tokenAddress} />
			<PermitForm wallet={wallet} tokenAddress={tokenAddress} />
			<TransferForm wallet={wallet} tokenAddress={tokenAddress} />
		</main>
	);
}
