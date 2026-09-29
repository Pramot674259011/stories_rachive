import { ethers } from "ethers";
export const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const LOCAL = process.env.NEXT_PUBLIC_CHAIN === "local";
export const RPC = LOCAL ? "http://127.0.0.1:8545" : process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";
export const ABI = [
  "function acquire(uint256[] ids) payable",
  "function works(uint256) view returns (uint256 price, address buyer)",
  "event Acquired(uint256 indexed id, address indexed buyer, uint256 price)",
];
const CHAIN_ID = LOCAL ? "0x539" : "0xaa36a7";
export async function getContract() {
  if (!window.ethereum) throw new Error("Please install MetaMask (or another wallet) to continue.");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID }] });
  } catch (e) {
    throw new Error(LOCAL ? "Please switch your wallet to Localhost 8545." : "Please switch your wallet to the Sepolia test network.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT, ABI, signer);
}
