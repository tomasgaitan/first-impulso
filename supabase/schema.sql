-- ============================================================
-- First Impulso — Schema SQL para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tabla: clients
-- ------------------------------------------------------------
create table clients (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  dni         text not null unique,
  phone       text not null,
  join_date   date,
  birth_date  date not null,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: personal_plans
-- ------------------------------------------------------------
create table personal_plans (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references clients(id) on delete cascade,
  days_per_week int not null check (days_per_week between 1 and 7),
  objective     text not null,
  price         numeric(10,2) not null,
  start_date    date not null,
  end_date      date not null,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  created_at    timestamptz not null default now()
);

-- Solo un plan activo por cliente
create unique index personal_plans_one_active_per_client
  on personal_plans(client_id)
  where status = 'active';

-- ------------------------------------------------------------
-- Tabla: payments
-- ------------------------------------------------------------
create table payments (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references clients(id) on delete cascade,
  plan_type        text not null check (plan_type in ('monthly', 'personal')),
  personal_plan_id uuid references personal_plans(id) on delete set null,
  month            int not null check (month between 1 and 12),
  year             int not null check (year >= 2020),
  amount           numeric(10,2) not null,
  payment_method   text not null check (payment_method in ('cash', 'transfer')),
  paid_at          timestamptz not null default now(),
  notes            text
);

-- ------------------------------------------------------------
-- Tabla: settings (fila única)
-- ------------------------------------------------------------
create table settings (
  id            uuid primary key default uuid_generate_v4(),
  monthly_price numeric(10,2) not null default 0,
  updated_at    timestamptz not null default now()
);

-- Insertar fila inicial de configuración
insert into settings (monthly_price) values (0);

-- ------------------------------------------------------------
-- Row Level Security
-- Solo el usuario autenticado puede operar
-- ------------------------------------------------------------
alter table clients enable row level security;
alter table personal_plans enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create policy "authenticated_all" on clients for all to authenticated using (true) with check (true);
create policy "authenticated_all" on personal_plans for all to authenticated using (true) with check (true);
create policy "authenticated_all" on payments for all to authenticated using (true) with check (true);
create policy "authenticated_all" on settings for all to authenticated using (true) with check (true);
