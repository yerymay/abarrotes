<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Project rules

- Stack is TanStack Start + Lovable Cloud (not Next.js/Prisma from the uploaded docs) — platform constraint.
- Sales and stock changes go through SECURITY DEFINER SQL functions (create_sale, adjust_stock) — keeps stock decrement atomic and server-validated.
- Roles live in user_roles (admin/cajero); first signup becomes admin via trigger — avoids privilege escalation.
- Signed-in pages live under src/routes/_authenticated/ and read data with the browser client under RLS.
