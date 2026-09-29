// After adding images to public/art: run `npm run list-new` to list only the new ones on-chain.
const hre = require("hardhat");
const { loadWorks } = require("../lib/loadWorks");
async function main() {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS first");
  const c = await hre.ethers.getContractAt("ArtGallery", addr);
  const listed = Number(await c.count());
  const fresh = loadWorks().slice(listed);
  if (!fresh.length) return console.log("Nothing new to list (" + listed + " already on-chain).");
  await (await c.list(fresh.map((w) => hre.ethers.parseEther(w.price_eth)))).wait();
  console.log("Listed " + fresh.length + " new works.");
}
main().catch((e) => { console.error(e); process.exit(1); });
