import { ethers } from "hardhat";

async function main() {
  const saveEther = await ethers.deployContract("SaveEther");

  await saveEther.waitForDeployment();

  console.log(`SaveEther contract deployed to ${saveEther.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat run scripts/deploy.ts --network sepolia
//  npx hardhat verify --network sepolia 0x37A1b93FFa8b43FF4A4e9DaBB50244a4Cf785A77

// npx hardhat test
