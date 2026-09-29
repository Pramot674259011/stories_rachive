import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

const ABI = ["event Acquired(uint256 indexed id, address indexed buyer, uint256 price)"];

export async function POST(req) {
  try {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { txHash } = await req.json();
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com");
    const receipt = await provider.waitForTransaction(txHash, 1, 60000);
    const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.toLowerCase();
    if (!receipt || receipt.status !== 1 || receipt.to?.toLowerCase() !== contract)
      return NextResponse.json({ error: "Transaction not valid" }, { status: 400 });

    const iface = new ethers.Interface(ABI);
    const events = receipt.logs
      .filter((l) => l.address.toLowerCase() === contract)
      .map((l) => iface.parseLog(l))
      .filter(Boolean);
    if (!events.length) return NextResponse.json({ error: "No acquisitions found" }, { status: 400 });

    const wallet = events[0].args.buyer;
    const ids = events.map((e) => Number(e.args.id));
    const total = events.reduce((a, e) => a + e.args.price, 0n);

    await admin.from("orders").upsert({ user_id: u.user.id, tx_hash: txHash, wallet, artwork_ids: ids, total_eth: ethers.formatEther(total) }, { onConflict: "tx_hash" });
    await admin.from("cart_items").delete().eq("user_id", u.user.id).in("artwork_id", ids);
    return NextResponse.json({ ok: true, ids });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
