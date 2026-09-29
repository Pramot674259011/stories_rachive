"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { supabase, supabaseReady } from "@/lib/supabase";
import { CONTRACT, ABI, RPC } from "@/lib/chain";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const LS_CART = "gallery_cart", LS_USER = "gallery_demo_user";

export default function Providers({ works, children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [sold, setSold] = useState({}); // id -> buyer wallet (read from the blockchain)
  const useDb = supabaseReady && user && !user.demo;

  // auth: Supabase Google when configured, otherwise a local demo visitor
  useEffect(() => {
    if (supabaseReady) {
      supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
      return () => sub.subscription.unsubscribe();
    }
    try { setUser(JSON.parse(localStorage.getItem(LS_USER))); } catch (e) {}
    setReady(true);
  }, []);

  // cart: database when signed in with Google, otherwise localStorage
  useEffect(() => {
    if (!user) { setCart([]); return; }
    if (useDb) supabase.from("cart_items").select("artwork_id").then(({ data }) => setCart((data || []).map((r) => r.artwork_id)));
    else { try { setCart(JSON.parse(localStorage.getItem(LS_CART)) || []); } catch (e) { setCart([]); } }
  }, [user]); // eslint-disable-line

  const saveLocal = (next) => { if (!useDb) localStorage.setItem(LS_CART, JSON.stringify(next)); };
  const add = async (id) => {
    if (!user) return false;
    const next = [...new Set([...cart, id])]; setCart(next); saveLocal(next);
    if (useDb) await supabase.from("cart_items").upsert({ user_id: user.id, artwork_id: id });
    return true;
  };
  const clear = async (ids) => {
    const next = cart.filter((x) => !ids.includes(x)); setCart(next); saveLocal(next);
    if (useDb) await supabase.from("cart_items").delete().in("artwork_id", ids);
  };
  const remove = (id) => clear([id]);

  const signIn = async () => {
    if (supabaseReady) return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/gallery" } });
    const u = { id: "demo", email: "Demo visitor", demo: true };
    localStorage.setItem(LS_USER, JSON.stringify(u)); setUser(u);
  };
  const signOut = async () => {
    if (supabaseReady) await supabase.auth.signOut();
    else { localStorage.removeItem(LS_USER); setUser(null); }
  };

  // which works are already acquired: the blockchain is the source of truth
  const loadSold = useCallback(async () => {
    if (!CONTRACT) return;
    try {
      const c = new ethers.Contract(CONTRACT, ABI, new ethers.JsonRpcProvider(RPC));
      const res = await Promise.all(works.map((w) => c.works(w.id).catch(() => null)));
      const s = {};
      res.forEach((r, i) => { if (r && r.buyer !== ethers.ZeroAddress) s[works[i].id] = r.buyer; });
      setSold(s);
    } catch (e) {}
  }, [works]);
  useEffect(() => { loadSold(); }, [loadSold]);

  return (
    <Ctx.Provider value={{ works, user, ready, cart, add, remove, clear, signIn, signOut, sold, reloadSold: loadSold, demo: !supabaseReady, useDb }}>
      {children}
    </Ctx.Provider>
  );
}
