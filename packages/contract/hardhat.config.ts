import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";

const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY as string
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: [sepoliaPrivateKey]
    }
  }
};

export default config;
