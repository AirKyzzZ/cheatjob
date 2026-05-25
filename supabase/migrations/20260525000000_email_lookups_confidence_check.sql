-- Align email_lookups.confidence with candidatures.manager_email_confidence so
-- the audit table can't store a value the user-facing column can't. The column
-- is nullable (no value when the finder returns 'unavailable') — the constraint
-- only validates non-null inserts.

alter table public.email_lookups
  add constraint email_lookups_confidence_check
  check (confidence is null or confidence in ('high','medium','low','not_found','manual'));
