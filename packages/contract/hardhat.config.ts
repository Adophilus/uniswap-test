import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY as string;
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";

const etherscanApiKey = process.env.ETHERSCAN_API_KEY as string;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks:
    process.env.NODE_ENV === "production"
      ? {}
      : {
        sepolia: {
          url: sepoliaRpcUrl,
          accounts: [sepoliaPrivateKey],
        },
      },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  typechain: {
    target: "ethers-v5",
  },
};

export default config;
