create table public.tool_rate_limits (
  ip text not null,
  day date not null,
  count int not null default 0,
  primary key (ip, day)
);
alter table public.tool_rate_limits enable row level security; -- no policy: service-role only

create function public.tool_consume(p_ip text, p_cap int default 5)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  insert into public.tool_rate_limits (ip, day, count) values (p_ip, current_date, 1)
    on conflict (ip, day) do update set count = public.tool_rate_limits.count + 1
    returning count into v_count;
  return v_count <= p_cap;
end; $$;
revoke all on function public.tool_consume(text, int) from public, anon, authenticated;
grant execute on function public.tool_consume(text, int) to service_role;
