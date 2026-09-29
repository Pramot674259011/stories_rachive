import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const fake = !url || !key || url.includes("xxxx") || key.startsWith("your-");
if (fake && typeof window !== "undefined") console.warn("ยังไม่ได้ตั้งค่า Supabase ใน .env.local (ยังเป็นค่าตัวอย่างหรือว่างอยู่)");
export const supabaseReady = !fake;
export const supabase = fake ? null : createClient(url, key);
