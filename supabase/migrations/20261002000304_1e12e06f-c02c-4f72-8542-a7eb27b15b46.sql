revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.create_sale(jsonb, text, numeric) from public, anon;
revoke execute on function public.adjust_stock(uuid, numeric, text, text) from public, anon;