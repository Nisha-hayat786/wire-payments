import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WirePaymentGateway...");

  const WirePaymentGateway = await ethers.getContractFactory("WirePaymentGateway");
  const contractURI = "https://wirepayments.io/metadata.json"; // Placeholder branding URI
  const gateway = await WirePaymentGateway.deploy(contractURI);

  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  
  console.log("--------------------------------------------------");
  console.log(`WirePaymentGateway deployed to: ${address}`);
  console.log("--------------------------------------------------");
  console.log("Update your apps/web/lib/wagmi.ts with this address.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
