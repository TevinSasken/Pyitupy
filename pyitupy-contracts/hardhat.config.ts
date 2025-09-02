import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19", // Match LoanEscrowManager.sol
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    zg: {
      url: process.env.ZG_RPC_URL || "https://rpc-testnet.0g.ai",
      chainId: 16600,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
    },
    hardhatMainnet: {
      chainId: 1,
    },
    hardhatOp: {
      chainId: 10,
    },
  },
};

task("deploy:zg", "Deploys LoanEscrowManager to 0G Newton testnet").setAction(
  async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", await deployer.getAddress());

    const tokenAddr = process.env.USDT_TOKEN_ADDRESS;
    if (!tokenAddr) {
      throw new Error("Please set USDT_TOKEN_ADDRESS in .env");
    }

    const LoanEscrowManager = await hre.ethers.getContractFactory("LoanEscrowManager");
    const contract = await LoanEscrowManager.deploy(tokenAddr);

    console.log("Transaction hash:", contract.deployTransaction.hash);
    await contract.deployed();

    console.log("LoanEscrowManager deployed to:", await contract.getAddress());
  }
);

export default config;