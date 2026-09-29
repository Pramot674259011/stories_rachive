"use client";
import { useApp } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const { user, signIn, demo } = useApp();
  const router = useRouter();
  useEffect(() => { if (user) router.replace("/gallery"); }, [user, router]);
  return (
    <main className="page center">
      <h2 className="big">Enter the archive</h2>
      <p className="dim">One tap. No password.</p>
      <button className="pill" onClick={signIn}>{demo ? "Continue as guest" : "Continue with Google"}</button>
      {demo && <p className="dim small" style={{ maxWidth: 420 }}>Demo mode: Supabase is not configured yet, so sign-in is local to this browser. Add the Supabase keys in .env.local to turn on Google sign-in.</p>}
    </main>
  );
}
