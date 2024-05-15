import { useEffect, useState } from "react";
import lib from "../lib";

type Wallet = Awaited<ReturnType<typeof lib.wallet.getWallet>>;

export const useGetWallet = () => {
	const [wallet, setWallet] = useState<Wallet | null>(null);

	const getWallet = async () => {
		setWallet(await lib.wallet.getWallet());
	};

	return {
		connect: () => getWallet(),
		wallet,
	};
};
