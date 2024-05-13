import { BrowserProvider, type Eip1193Provider } from "ethers"
class MetamaskNotInstalledError extends Error { }

export const getWallet = async () => {
  const inBrowserProvider = (window as any).ethereum

  if (!inBrowserProvider) {
    alert("Please install metamask first!")
    throw new MetamaskNotInstalledError()
  }

  let signer = null;

  let provider;
  provider = new BrowserProvider(inBrowserProvider)
  signer = await provider.getSigner();

  return {
    rawProvider: inBrowserProvider as Eip1193Provider,
    provider,
    signer
  }
}
