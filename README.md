# Ethan Vale — Art Gallery (ดูงานศิลปะก่อน ซื้อด้วย blockchain)

Next.js + Solidity (Sepolia) + Supabase (Google login + DB). ทำงานได้ทันทีแม้ยังไม่ตั้ง Supabase (โหมดเดโม: ล็อกอินแบบ guest, ตะกร้าเก็บในเบราว์เซอร์)

## เปลี่ยนรูป (ง่ายที่สุด)
1. ใส่ไฟล์รูป (.jpg .png .webp) ลงโฟลเดอร์ `public/art/` ตั้งชื่อเรียงลำดับ เช่น `01-sunset.jpg`, `02-forest.jpg` (ลบรูปตัวอย่างออกจากเว็บโดยแค่ใส่รูปของคุณ)
2. (ไม่บังคับ) เขียนชื่อ/คำอธิบาย/ราคาใน `public/art/info.json`:
   `{ "01-sunset.jpg": { "title": "พระอาทิตย์ตก", "place": "ศิลปิน · 2569", "note": "คำอธิบาย", "price": 0.005, "tall": false } }`
   ไม่เขียนก็ได้ ระบบใช้ชื่อไฟล์เป็นชื่อผลงาน ราคาเริ่มต้น 0.003 ETH
3. ย่อรูปให้กว้างไม่เกิน ~1600px เพื่อให้โหลดเร็ว
4. ถ้า contract deploy แล้ว รัน `npm run list-new` เพื่อลงทะเบียนรูปใหม่บนเชน (เพิ่มได้เฉพาะต่อท้าย: ตั้งชื่อรูปใหม่ให้เรียงอยู่หลังรูปเดิม อย่าลบ/เปลี่ยนชื่อรูปที่ลงเชนแล้ว เพราะ id = ลำดับไฟล์)
5. push ขึ้น GitHub → Vercel deploy ใหม่เอง

## ติดตั้ง
1. `npm install`
2. `cp .env.example .env.local` แล้วกรอกค่า (ใส่เฉพาะที่ต้องใช้)
3. ดูเว็บเดโมได้เลย: `npm run dev` → http://localhost:3000
4. Contract: ใส่ `DEPLOYER_PRIVATE_KEY` (กระเป๋าทดสอบ) → `npm run deploy:sepolia` → นำ address ไปใส่ `NEXT_PUBLIC_CONTRACT_ADDRESS` → restart dev
5. Google login + DB (ทำเมื่อพร้อม): Supabase รัน `supabase/schema.sql`, เปิด Google provider, ตั้ง redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, ใส่ `http://localhost:3000` และ URL Vercel ใน URL Configuration แล้วกรอก 3 ค่า Supabase ใน `.env.local`
6. Deploy: Vercel → ใส่ env ทั้งหมด (ยกเว้น `DEPLOYER_PRIVATE_KEY`)

## การซื้อทำงานอย่างไร
Keep in collection → Settle → กระเป๋าเรียก `acquire(ids)` จ่าย ETH ตรงยอด → สถานะ "ถูกซื้อแล้ว" อ่านจาก blockchain โดยตรง (ความจริงอยู่บนเชน) → ถ้าตั้ง Supabase แล้ว `/api/verify` ตรวจธุรกรรมซ้ำและบันทึกออร์เดอร์ลง DB

## เครดิต
สเปกดีไซน์และรูปตัวอย่างมาจากใบงาน/บรีฟที่ได้รับ (ระบุแหล่งที่มาในคู่มือส่งอาจารย์ด้วย111)
# stories_rachive
