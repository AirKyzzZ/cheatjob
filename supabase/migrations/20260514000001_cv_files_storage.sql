insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-files', 'cv-files', false, 5242880,
  array['application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "cv_files_own_read" on storage.objects
  for select using (
    bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "cv_files_own_insert" on storage.objects
  for insert with check (
    bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "cv_files_own_update" on storage.objects
  for update using (
    bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "cv_files_own_delete" on storage.objects
  for delete using (
    bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]
  );
