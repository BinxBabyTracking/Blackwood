-- A private bucket for Admin-made artwork (the narration bucket only takes audio).
-- Served by /art/gen/<id>-<version>.webp through the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('art', 'art', false, 20971520, array['image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
