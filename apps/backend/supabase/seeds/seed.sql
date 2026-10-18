insert into public.brands
  (id, name)
values
  ('439d0a44-0bba-4b2c-8bc7-84e2e4bb39ba', 'Duotone'),
  ('cc23e6c8-ce7c-4207-a713-0e6aacd9dfad', 'Gaastra'),
  ('a4402584-6e5c-4769-bc71-7a3ccc1d45ba', 'North Kiteboarding');

insert into public.sails
    (id, size, alias, brand_id)
values
    ('3022c1d5-ba19-4576-9937-651515e1d04f', 9, null, '439d0a44-0bba-4b2c-8bc7-84e2e4bb39ba'),
    ('fca4f095-2569-4319-b43a-4ca8d97d120d', 11, null, '439d0a44-0bba-4b2c-8bc7-84e2e4bb39ba'),
    ('a5281f72-5aaa-461f-8be8-c43a4cc29ae2', 15, 'Tanker', '439d0a44-0bba-4b2c-8bc7-84e2e4bb39ba');

insert into public.spots
    (id, name)
values
    ('668a6acc-b6fd-406d-8a61-74f4a98b4eab', 'Laboe'),
    ('08a91ec5-d5ee-42c3-8729-3a19771084d4', 'Kloster');

insert into public.sessions
    (id, name, date, rating, notes, spot_id, sail_id)
values
    ('422d4bd6-0494-4430-8d4f-ce905e24de3a', '50km Fun', '2026-10-05', 9, null, '08a91ec5-d5ee-42c3-8729-3a19771084d4', 'fca4f095-2569-4319-b43a-4ca8d97d120d'),
    ('09410713-bdaf-4cc6-b4f3-3ac67a4735bd', 'Supi Session', '2026-10-09', 10, 'A bunch of toeside', '668a6acc-b6fd-406d-8a61-74f4a98b4eab', 'fca4f095-2569-4319-b43a-4ca8d97d120d');
