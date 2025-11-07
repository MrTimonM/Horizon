const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);
  console.log("================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("================================================\n");

  // Deploy UserRegistry
  console.log("📦 Deploying UserRegistry...");
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("✅ UserRegistry deployed to:", userRegistryAddress);

  // Deploy NodeRegistry
  console.log("\n📦 Deploying NodeRegistry...");
  const NodeRegistry = await hre.ethers.getContractFactory("NodeRegistry");
  const nodeRegistry = await NodeRegistry.deploy();
  await nodeRegistry.waitForDeployment();
  const nodeRegistryAddress = await nodeRegistry.getAddress();
  console.log("✅ NodeRegistry deployed to:", nodeRegistryAddress);

  // Deploy EscrowPayment
  console.log("\n📦 Deploying EscrowPayment...");
  const EscrowPayment = await hre.ethers.getContractFactory("EscrowPayment");
  const escrowPayment = await EscrowPayment.deploy(nodeRegistryAddress);
  await escrowPayment.waitForDeployment();
  const escrowPaymentAddress = await escrowPayment.getAddress();
  console.log("✅ EscrowPayment deployed to:", escrowPaymentAddress);

  console.log("\n================================================");
  console.log("🎉 Deployment Summary");
  console.log("================================================");
  console.log("Network:", hre.network.name);
  console.log("UserRegistry:", userRegistryAddress);
  console.log("NodeRegistry:", nodeRegistryAddress);
  console.log("EscrowPayment:", escrowPaymentAddress);
  console.log("Deployer:", deployer.address);
  console.log("================================================\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      UserRegistry: userRegistryAddress,
      NodeRegistry: nodeRegistryAddress,
      EscrowPayment: escrowPaymentAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Update .env file with contract addresses
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update or add contract addresses
    if (envContent.includes("USER_REGISTRY_ADDRESS=")) {
      envContent = envContent.replace(
        /USER_REGISTRY_ADDRESS=.*/,
        `USER_REGISTRY_ADDRESS=${userRegistryAddress}`
      );
    } else {
      envContent += `\nUSER_REGISTRY_ADDRESS=${userRegistryAddress}`;
    }

    if (envContent.includes("NODE_REGISTRY_ADDRESS=")) {
      envContent = envContent.replace(
        /NODE_REGISTRY_ADDRESS=.*/,
        `NODE_REGISTRY_ADDRESS=${nodeRegistryAddress}`
      );
    } else {
      envContent += `\nNODE_REGISTRY_ADDRESS=${nodeRegistryAddress}`;
    }

    if (envContent.includes("ESCROW_PAYMENT_ADDRESS=")) {
      envContent = envContent.replace(
        /ESCROW_PAYMENT_ADDRESS=.*/,
        `ESCROW_PAYMENT_ADDRESS=${escrowPaymentAddress}`
      );
    } else {
      envContent += `\nESCROW_PAYMENT_ADDRESS=${escrowPaymentAddress}`;
    }

    // Update frontend env vars
    if (envContent.includes("REACT_APP_USER_REGISTRY_ADDRESS=")) {
      envContent = envContent.replace(
        /REACT_APP_USER_REGISTRY_ADDRESS=.*/,
        `REACT_APP_USER_REGISTRY_ADDRESS=${userRegistryAddress}`
      );
    } else {
      envContent += `\nREACT_APP_USER_REGISTRY_ADDRESS=${userRegistryAddress}`;
    }

    if (envContent.includes("REACT_APP_NODE_REGISTRY_ADDRESS=")) {
      envContent = envContent.replace(
        /REACT_APP_NODE_REGISTRY_ADDRESS=.*/,
        `REACT_APP_NODE_REGISTRY_ADDRESS=${nodeRegistryAddress}`
      );
    } else {
      envContent += `\nREACT_APP_NODE_REGISTRY_ADDRESS=${nodeRegistryAddress}`;
    }

    if (envContent.includes("REACT_APP_ESCROW_PAYMENT_ADDRESS=")) {
      envContent = envContent.replace(
        /REACT_APP_ESCROW_PAYMENT_ADDRESS=.*/,
        `REACT_APP_ESCROW_PAYMENT_ADDRESS=${escrowPaymentAddress}`
      );
    } else {
      envContent += `\nREACT_APP_ESCROW_PAYMENT_ADDRESS=${escrowPaymentAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env file with contract addresses\n");
  }

  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await userRegistry.deploymentTransaction().wait(5);
    await nodeRegistry.deploymentTransaction().wait(5);
    await escrowPayment.deploymentTransaction().wait(5);

    // Verify contracts on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("\n🔍 Verifying contracts on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: userRegistryAddress,
          constructorArguments: [],
        });
        console.log("✅ UserRegistry verified");
      } catch (error) {
        console.log("⚠️  UserRegistry verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: nodeRegistryAddress,
          constructorArguments: [],
        });
        console.log("✅ NodeRegistry verified");
      } catch (error) {
        console.log("⚠️  NodeRegistry verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: escrowPaymentAddress,
          constructorArguments: [nodeRegistryAddress],
        });
        console.log("✅ EscrowPayment verified");
      } catch (error) {
        console.log("⚠️  EscrowPayment verification failed:", error.message);
      }
    }
  }

  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
