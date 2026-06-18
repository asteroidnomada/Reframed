-- Refund line items: a refund is recorded as its own billing-history row
-- (kind='refund') carrying a negative amount_cents deduction, rather than
-- flipping the original purchase to "refunded".

-- Allow the new 'refund' kind
alter table public.purchases drop constraint if exists purchases_kind_check;
alter table public.purchases add constraint purchases_kind_check
  check (kind = any (array['credits'::text, 'subscription'::text, 'refund'::text]));

-- Permit a negative amount for refund rows only; purchases stay non-negative
alter table public.purchases drop constraint if exists purchases_amount_cents_check;
alter table public.purchases add constraint purchases_amount_cents_check
  check (amount_cents >= 0 or kind = 'refund');
