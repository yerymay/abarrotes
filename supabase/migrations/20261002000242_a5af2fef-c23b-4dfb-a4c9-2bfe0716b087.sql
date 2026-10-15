create type public.app_role as enum ('admin', 'cajero');

create table public.profiles (
  id uuid primary key,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "roles read own or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'cajero');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "cat read" on public.categories for select to authenticated using (true);
create policy "cat admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  barcode text unique,
  category_id uuid references public.categories(id) on delete set null,
  unit text not null default 'und',
  price numeric(10,2) not null default 0,
  cost numeric(10,2) not null default 0,
  stock numeric(10,2) not null default 0,
  min_stock numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "prod read" on public.products for select to authenticated using (true);
create policy "prod admin write" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  number bigserial,
  user_id uuid not null,
  subtotal numeric(10,2) not null,
  igv numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null,
  cash_received numeric(10,2),
  change_given numeric(10,2),
  created_at timestamptz not null default now()
);
grant select on public.sales to authenticated;
grant all on public.sales to service_role;
alter table public.sales enable row level security;
create policy "sales read" on public.sales for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);
grant select on public.sale_items to authenticated;
grant all on public.sale_items to service_role;
alter table public.sale_items enable row level security;
create policy "items read" on public.sale_items for select to authenticated
  using (exists (select 1 from public.sales s where s.id = sale_id and (s.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null,
  type text not null,
  quantity numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.stock_movements to authenticated;
grant all on public.stock_movements to service_role;
alter table public.stock_movements enable row level security;
create policy "mov read admin" on public.stock_movements for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.create_sale(_items jsonb, _payment_method text, _cash_received numeric)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  _sale_id uuid; _total numeric := 0; _it jsonb; _p record; _qty numeric;
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  if jsonb_array_length(_items) = 0 then raise exception 'Carrito vacío'; end if;
  insert into public.sales (user_id, subtotal, igv, total, payment_method)
    values (auth.uid(), 0, 0, 0, _payment_method) returning id into _sale_id;
  for _it in select * from jsonb_array_elements(_items) loop
    _qty := (_it->>'quantity')::numeric;
    if _qty <= 0 then raise exception 'Cantidad inválida'; end if;
    select * into _p from public.products where id = (_it->>'product_id')::uuid and active for update;
    if not found then raise exception 'Producto no encontrado'; end if;
    if _p.stock < _qty then raise exception 'Stock insuficiente: %', _p.name; end if;
    update public.products set stock = stock - _qty where id = _p.id;
    insert into public.sale_items (sale_id, product_id, name, quantity, unit_price, line_total)
      values (_sale_id, _p.id, _p.name, _qty, _p.price, round(_p.price * _qty, 2));
    insert into public.stock_movements (product_id, user_id, type, quantity, note)
      values (_p.id, auth.uid(), 'venta', -_qty, 'Venta');
    _total := _total + round(_p.price * _qty, 2);
  end loop;
  if _payment_method = 'efectivo' and coalesce(_cash_received,0) < _total then
    raise exception 'Efectivo insuficiente';
  end if;
  update public.sales set total = _total,
    subtotal = round(_total / 1.18, 2),
    igv = _total - round(_total / 1.18, 2),
    cash_received = case when _payment_method = 'efectivo' then _cash_received end,
    change_given = case when _payment_method = 'efectivo' then _cash_received - _total end
  where id = _sale_id;
  return _sale_id;
end $$;
grant execute on function public.create_sale(jsonb, text, numeric) to authenticated;

create or replace function public.adjust_stock(_product_id uuid, _quantity numeric, _type text, _note text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Solo administradores'; end if;
  update public.products set stock = stock + _quantity where id = _product_id;
  insert into public.stock_movements (product_id, user_id, type, quantity, note)
    values (_product_id, auth.uid(), _type, _quantity, _note);
end $$;
grant execute on function public.adjust_stock(uuid, numeric, text, text) to authenticated;

insert into public.categories (name) values ('Abarrotes'),('Bebidas'),('Lácteos'),('Limpieza'),('Snacks');
insert into public.products (name, barcode, category_id, unit, price, cost, stock, min_stock)
select v.name, v.barcode, c.id, v.unit, v.price, v.cost, v.stock, v.min_stock
from (values
 ('Arroz Costeño 1kg','7750243001010','Abarrotes','und',4.80,3.90,40,10),
 ('Azúcar rubia 1kg','7750243001027','Abarrotes','und',4.20,3.40,35,10),
 ('Aceite Primor 1L','7751271001015','Abarrotes','und',10.50,8.70,20,5),
 ('Fideos Don Vittorio 500g','7750885001011','Abarrotes','und',3.20,2.50,50,12),
 ('Inca Kola 500ml','7750182001012','Bebidas','und',2.50,1.80,60,24),
 ('Coca-Cola 1.5L','7750182001029','Bebidas','und',6.50,5.00,24,8),
 ('Agua San Luis 625ml','7750182001036','Bebidas','und',1.50,0.90,48,12),
 ('Leche Gloria tarro','7751271002012','Lácteos','und',4.30,3.60,4,12),
 ('Yogurt Gloria 1L','7751271002029','Lácteos','und',7.50,6.00,10,4),
 ('Detergente Bolívar 500g','7750243002017','Limpieza','und',6.90,5.40,15,5),
 ('Lejía Clorox 1L','7750243002024','Limpieza','und',3.80,2.90,3,6),
 ('Papas Lay''s 42g','7750885002018','Snacks','und',2.00,1.40,30,10),
 ('Galleta Soda Field','7750885002025','Snacks','und',0.80,0.50,80,20)
) as v(name, barcode, cat, unit, price, cost, stock, min_stock)
join public.categories c on c.name = v.cat;