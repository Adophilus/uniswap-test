import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY as string
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"

const etherscanApiKey = process.env.ETHERSCAN_API_KEY as string

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: [sepoliaPrivateKey]
    }
  },
  etherscan: {
    apiKey: etherscanApiKey
  },
};

export default config;
