import * as ethers from "ethers"

class MetamaskNotInstalledError extends Error { }

export type Wallet = {
  provider: ethers.providers.Provider
  signer: ethers.Signer
}

export const getWallet = async (): Promise<Wallet> => {
  const inBrowserProvider = (window as any).ethereum

  if (!inBrowserProvider) {
    alert("Please install metamask first!")
    throw new MetamaskNotInstalledError()
  }

  const provider = new ethers.providers.Web3Provider(inBrowserProvider)

  await provider.send("eth_requestAccounts", []);

  return {
    provider,
    signer: provider.getSigner()
  }
}
