import hooks from "@demo/frontend/hooks";
import "./styles.less";
import { useState, type FormEvent, type FunctionComponent } from "react";
import lib from "@demo/frontend/lib";
import type { Permit, Wallet } from "@demo/frontend/types";
import { BigNumber, utils } from "ethers";

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
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		lib.contract
			.faucet(wallet, tokenAddress)
			.catch((err) => {
				alert(`Transaction reverted. Reason = ${err.reason}`);
			})
			.finally(() => setLoading(false));
	};

	return (
		<form className="form faucet-form" onSubmit={onSubmit}>
			<div>
				<button disabled={loading} className="form-input" type="submit">
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
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		(async () => {
			const tx = await lib.permit2.approve(wallet, tokenAddress);
			await tx.wait();
		})()
			.catch((err) => {
				alert(`Transaction reverted. Reason = ${err.reason}`);
			})
			.finally(() => setLoading(false));
	};

	return (
		<form className="form approve-form" onSubmit={onSubmit}>
			<div>
				<button disabled={loading} className="form-input" type="submit">
					Approve
				</button>
			</div>
		</form>
	);
};

const SignatureForm: FunctionComponent<{
	wallet: Wallet;
	tokenAddress: string;
	setPermit: (p: Permit) => void;
}> = ({ wallet, tokenAddress, setPermit }) => {
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		lib.permit2
			.signPermit(wallet, SPENDER_ADDRESS, tokenAddress)
			.then((permit) => setPermit(permit))
			.finally(() => setLoading(false));
	};

	return (
		<form className="form signature-form" onSubmit={onSubmit}>
			<div>
				<button className="form-input" disabled={loading} type="submit">
					Sign
				</button>
			</div>
		</form>
	);
};

const PermitForm: FunctionComponent<{
	wallet: Wallet;
	permit: Permit;
}> = ({ wallet, permit }) => {
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		lib.permit2.permit(wallet, permit).finally(() => setLoading(false));
	};

	return (
		<form className="form permit-form" onSubmit={onSubmit}>
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
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();

		const rawAmount =
			e.currentTarget.querySelector<HTMLInputElement>("input")!.value ?? "0";

		console.log(tokenAddress);
		let decimals = tokenAddress === USDT_TOKEN_ADDRESS ? 6 : 18;
		let amount = BigNumber.from(rawAmount).mul(
			BigNumber.from(10).pow(decimals),
		);
		const recipient = SPENDER_ADDRESS;

		lib.contract
			.transferTo(wallet, tokenAddress, recipient, amount)
			.finally(() => setLoading(false))
			.catch((err) => {
				console.log(err);
				alert(`Transaction reverted. Reason = ${err.reason}`);
			});
	};

	return (
		<form className="form permit-form" onSubmit={onSubmit}>
			<div>
				<input type="number" className="form-input" placeholder="Amount" />
			</div>
			<div>
				<button disabled={loading} className="form-input" type="submit">
					Transfer
				</button>
			</div>
		</form>
	);
};

const CACHED_PERMIT_KEY = "permit";

const fetchCachedPermit = () => {
	const cachedPermit = window.localStorage.getItem(CACHED_PERMIT_KEY);
	if (!cachedPermit) return;

	let maybePermit: Permit | undefined;

	try {
		maybePermit = JSON.parse(cachedPermit) as Permit;
	} finally {
		return maybePermit;
	}
};

const cachePermit = (permit: Permit) =>
	window.localStorage.setItem(CACHED_PERMIT_KEY, JSON.stringify(permit));

export default function() {
	const [tokenAddress, setTokenAddress] = useState(USDT_TOKEN_ADDRESS);
	const [permit, _setPermit] = useState<Permit | undefined>(
		fetchCachedPermit() ?? undefined,
	);
	const { connect, wallet } = hooks.wallet.useGetWallet();

	const setPermit = (permit: Permit) => {
		cachePermit(permit);
		_setPermit(permit);
	};

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
			<SignatureForm
				wallet={wallet}
				tokenAddress={tokenAddress}
				setPermit={setPermit}
			/>
			<div className="section">
				<div>
					<header>This section can be executed by another wallet</header>
				</div>
				{permit ? (
					<>
						<PermitForm wallet={wallet} permit={permit} />
					</>
				) : null}
				<TransferForm wallet={wallet} tokenAddress={tokenAddress} />
			</div>
		</main>
	);
}
