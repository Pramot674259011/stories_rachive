const hre = require("hardhat");
const { loadWorks } = require("../lib/loadWorks");
async function main() {
  const works = loadWorks();
  const c = await hre.ethers.deployContract("ArtGallery");
  await c.waitForDeployment();
  await (await c.list(works.map((w) => hre.ethers.parseEther(w.price_eth)))).wait();
  console.log(`Listed ${works.length} works.`);
  console.log("ArtGallery deployed to:", await c.getAddress());
  console.log("Put this address in NEXT_PUBLIC_CONTRACT_ADDRESS");
}
main().catch((e) => { console.error(e); process.exit(1); });
