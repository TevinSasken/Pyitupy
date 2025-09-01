// scripts/deploy.js
import "dotenv/config";
import hre from "hardhat";

async function main() {
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

  console.log("LoanEscrowManager deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
