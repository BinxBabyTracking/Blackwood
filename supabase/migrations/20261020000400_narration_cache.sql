-- Private cache for generated evidence narration (ElevenLabs). Only the
-- server, using the secret key, reads or writes it; no client policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('narration', 'narration', false, 5242880, array['audio/mpeg'])
on conflict (id) do nothing;
