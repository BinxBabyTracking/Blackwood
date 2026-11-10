-- Making 3D models with Meshy's API from Admin. A running Meshy task is kept on the model's
-- art_images row until it finishes; each stored GLB records where it came from and the credits used.
-- The Meshy key is the MESHY_API_KEY server setting, or until then site_settings.meshy_api_key.
alter table public.art_images add column if not exists meshy_task text;
alter table public.art_images add column if not exists meshy_started_at timestamptz;
alter table public.art_models add column if not exists source text not null default 'upload';
alter table public.art_models add column if not exists credits integer not null default 0;
