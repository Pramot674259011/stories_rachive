require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: { chainId: 1337 },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: deployerKey && /^0x[0-9a-fA-F]{64}$/.test(deployerKey) ? [deployerKey] : [],
    },
  },
};
