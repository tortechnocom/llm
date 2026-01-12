import { ethers } from "hardhat";

async function main() {
    console.log("Deploying LLM Platform contracts...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Platform Token
    console.log("\n1. Deploying LLMPlatformToken...");
    const LLMPlatformToken = await ethers.getContractFactory("LLMPlatformToken");
    const token = await LLMPlatformToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ LLMPlatformToken deployed to:", tokenAddress);

    // Deploy Revenue Sharing
    console.log("\n2. Deploying RevenueSharing...");
    const treasury = deployer.address; // Use deployer as initial treasury
    const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
    const revenueSharing = await RevenueSharing.deploy(tokenAddress, treasury);
    await revenueSharing.waitForDeployment();
    const revenueSharingAddress = await revenueSharing.getAddress();
    console.log("✅ RevenueSharing deployed to:", revenueSharingAddress);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 Deployment Summary");
    console.log("=".repeat(60));
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    console.log("\nContracts:");
    console.log("  LLMPlatformToken:", tokenAddress);
    console.log("  RevenueSharing:", revenueSharingAddress);
    console.log("\nConfiguration:");
    console.log("  Treasury:", treasury);
    console.log("  Platform Fee:", await revenueSharing.platformFeePercent(), "basis points (10%)");
    console.log("  Initial Supply:", ethers.formatEther(await token.totalSupply()), "LLMP");
    console.log("=".repeat(60));

    // Save deployment addresses
    const fs = require("fs");
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            LLMPlatformToken: tokenAddress,
            RevenueSharing: revenueSharingAddress,
        },
    };

    fs.writeFileSync(
        "./deployments.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n💾 Deployment info saved to deployments.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
