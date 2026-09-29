-- Run in Supabase > SQL Editor. (Artworks live in public/art; ownership lives on-chain.)
create table if not exists cart_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  artwork_id int not null,
  primary key (user_id, artwork_id)
);
create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  tx_hash text unique not null,
  wallet text not null,
  artwork_ids int[] not null,
  total_eth numeric not null,
  created_at timestamptz default now()
);
alter table cart_items enable row level security;
alter table orders enable row level security;
create policy "own cart select" on cart_items for select using (auth.uid() = user_id);
create policy "own cart insert" on cart_items for insert with check (auth.uid() = user_id);
create policy "own cart delete" on cart_items for delete using (auth.uid() = user_id);
create policy "own orders select" on orders for select using (auth.uid() = user_id);
