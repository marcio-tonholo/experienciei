-- ============================================================
-- LOCAL-ONLY seed data — populates the local Supabase stack with
-- realistic fake data for manual testing. NEVER run this against
-- a cloud/production project (it inserts directly into auth.users).
--
-- Applied automatically by `supabase db reset` (if supabase/seed.sql
-- exists) after migrations, or manually via:
--   docker exec -i supabase_db_experenciei-app psql -U postgres < supabase/seed.sql
--
-- All seeded accounts share the password: senha123
-- ============================================================

begin;

-- ------------------------------------------------------------
-- auth.users + auth.identities
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated','admin@experenciei.local',      crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000001','authenticated','authenticated','beatriz.nogueira@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000002','authenticated','authenticated','rafael.andrade@experenciei.local',   crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000003','authenticated','authenticated','henrique.salles@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000004','authenticated','authenticated','camila.duarte@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000005','authenticated','authenticated','lucas.ferreira@experenciei.local',   crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000006','authenticated','authenticated','marcelo.prado@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000007','authenticated','authenticated','andre.ribeiro@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000008','authenticated','authenticated','juliana.freitas@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000009','authenticated','authenticated','renata.barros@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000010','authenticated','authenticated','vitor.nunes@experenciei.local',      crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000011','authenticated','authenticated','paulo.vieira@experenciei.local',     crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000012','authenticated','authenticated','fernanda.rocha@experenciei.local',   crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001','authenticated','authenticated','ana.lima@experenciei.local',     crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000002','authenticated','authenticated','bruno.costa@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000003','authenticated','authenticated','carla.mendes@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000004','authenticated','authenticated','diego.souza@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000005','authenticated','authenticated','elisa.ramos@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000006','authenticated','authenticated','felipe.torres@experenciei.local',crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000007','authenticated','authenticated','gabriela.nunes@experenciei.local',crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000008','authenticated','authenticated','hugo.martins@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000009','authenticated','authenticated','igor.barros@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000010','authenticated','authenticated','julia.prado@experenciei.local',    crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000011','authenticated','authenticated','karina.silva@experenciei.local',   crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000012','authenticated','authenticated','leonardo.dias@experenciei.local',  crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000013','authenticated','authenticated','mariana.castro@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000014','authenticated','authenticated','nicolas.farias@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000015','authenticated','authenticated','olivia.teixeira@experenciei.local',crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000016','authenticated','authenticated','pedro.henrique@experenciei.local', crypt('senha123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
from auth.users u
where u.email like '%@experenciei.local'
on conflict do nothing;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
insert into profiles (id, papel, categoria, nome, cidade, status, motivo_rejeicao) values
  ('10000000-0000-0000-0000-000000000001', 'admin', 'medico',    'Admin Experenciei',   'São Paulo',      'ativo',    null),

  ('20000000-0000-0000-0000-000000000001', 'mentor', 'medico',   'Dra. Beatriz Nogueira','São Paulo',      'ativo',    null),
  ('20000000-0000-0000-0000-000000000002', 'mentor', 'medico',   'Dr. Rafael Andrade',   'Rio de Janeiro', 'ativo',    null),
  ('20000000-0000-0000-0000-000000000003', 'mentor', 'medico',   'Dr. Henrique Salles',  'Belo Horizonte', 'ativo',    null),
  ('20000000-0000-0000-0000-000000000004', 'mentor', 'medico',   'Dra. Camila Duarte',   'Curitiba',       'ativo',    null),
  ('20000000-0000-0000-0000-000000000005', 'mentor', 'medico',   'Dr. Lucas Ferreira',   'Salvador',       'pendente', null),
  ('20000000-0000-0000-0000-000000000006', 'mentor', 'medico',   'Dr. Marcelo Prado',    'Recife',         'rejeitado','CRM não confere com o documento enviado.'),
  ('20000000-0000-0000-0000-000000000007', 'mentor', 'medico',   'Dr. André Ribeiro',    'São Paulo',      'ativo',    null),
  ('20000000-0000-0000-0000-000000000008', 'mentor', 'medico',   'Dra. Juliana Freitas', 'Rio de Janeiro', 'ativo',    null),
  ('20000000-0000-0000-0000-000000000009', 'mentor', 'medico',   'Dra. Renata Barros',   'Salvador',       'ativo',    null),
  ('20000000-0000-0000-0000-000000000010', 'mentor', 'medico',   'Dr. Vitor Nunes',      'Recife',         'ativo',    null),
  ('20000000-0000-0000-0000-000000000011', 'mentor', 'medico',   'Dr. Paulo Vieira',     'Belo Horizonte', 'pendente', null),
  ('20000000-0000-0000-0000-000000000012', 'mentor', 'medico',   'Dra. Fernanda Rocha',  'Fortaleza',      'rejeitado','Currículo incompleto.'),

  ('30000000-0000-0000-0000-000000000001', 'aluno', 'estudante', 'Ana Beatriz Lima',   'São Paulo',      'ativo',    null),
  ('30000000-0000-0000-0000-000000000002', 'aluno', 'medico',    'Bruno Costa',        'São Paulo',      'ativo',    null),
  ('30000000-0000-0000-0000-000000000003', 'aluno', 'medico',    'Carla Mendes',       'Rio de Janeiro', 'ativo',    null),
  ('30000000-0000-0000-0000-000000000004', 'aluno', 'estudante', 'Diego Souza',        'Belo Horizonte', 'ativo',    null),
  ('30000000-0000-0000-0000-000000000005', 'aluno', 'medico',    'Elisa Ramos',        'Curitiba',       'ativo',    null),
  ('30000000-0000-0000-0000-000000000006', 'aluno', 'estudante', 'Felipe Torres',      'Porto Alegre',   'pendente', null),
  ('30000000-0000-0000-0000-000000000007', 'aluno', 'estudante', 'Gabriela Nunes',     'Brasília',       'rejeitado','Documento de identidade ilegível.'),
  ('30000000-0000-0000-0000-000000000008', 'aluno', 'medico',    'Hugo Martins',       'São Paulo',      'inativo',  null),

  ('30000000-0000-0000-0000-000000000009', 'aluno', 'estudante', 'Igor Barros',        'Fortaleza',      'ativo',    null),
  ('30000000-0000-0000-0000-000000000010', 'aluno', 'medico',    'Julia Prado',        'Manaus',         'ativo',    null),
  ('30000000-0000-0000-0000-000000000011', 'aluno', 'medico',    'Karina Silva',       'Goiânia',        'ativo',    null),
  ('30000000-0000-0000-0000-000000000012', 'aluno', 'estudante', 'Leonardo Dias',      'Florianópolis',  'ativo',    null),
  ('30000000-0000-0000-0000-000000000013', 'aluno', 'medico',    'Mariana Castro',     'Natal',          'ativo',    null),
  ('30000000-0000-0000-0000-000000000014', 'aluno', 'estudante', 'Nicolas Farias',     'Vitória',        'pendente', null),
  ('30000000-0000-0000-0000-000000000015', 'aluno', 'estudante', 'Olivia Teixeira',    'João Pessoa',    'rejeitado','CRM inválido.'),
  ('30000000-0000-0000-0000-000000000016', 'aluno', 'medico',    'Pedro Henrique',     'Campo Grande',   'inativo',  null)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- mentor_profiles
-- ------------------------------------------------------------
insert into mentor_profiles (id, crm, uf, especialidade, subespecialidades, anos_experiencia, mini_curriculo, ambientes) values
  ('20000000-0000-0000-0000-000000000001', '123456', 'SP', 'Cirurgia Cardiovascular', array['Cirurgia de Revascularização','Cirurgia Valvar'], 14, 'Cirurgiã cardiovascular com atuação em hospitais de referência em São Paulo.', array['Hospital Sírio-Libanês','Hospital Albert Einstein']),
  ('20000000-0000-0000-0000-000000000002', '234567', 'RJ', 'Ortopedia',               array['Joelho','Quadril'],                                 11, 'Ortopedista especializado em cirurgia de quadril e joelho.',                    array['Hospital Copa Star']),
  ('20000000-0000-0000-0000-000000000003', '345678', 'MG', 'Neurocirurgia',           array['Coluna','Neuro-oncologia'],                         18, 'Neurocirurgião com foco em cirurgia de coluna minimamente invasiva.',           array['Hospital Mater Dei']),
  ('20000000-0000-0000-0000-000000000004', '456789', 'PR', 'Cirurgia Geral',          array['Videolaparoscopia'],                                9,  'Cirurgiã geral, referência em cirurgia minimamente invasiva.',                  array['Hospital Vita']),
  ('20000000-0000-0000-0000-000000000005', '567890', 'BA', 'Ginecologia e Obstetrícia', array['Cirurgia Minimamente Invasiva'],                  7,  'Ginecologista em fase de cadastro na plataforma.',                              array['Hospital Aliança']),
  ('20000000-0000-0000-0000-000000000006', '678901', 'PE', 'Urologia',                array['Uro-oncologia'],                                    12, 'Urologista — cadastro rejeitado para fins de teste.',                          array['Hospital Real Português']),
  ('20000000-0000-0000-0000-000000000007', '111222', 'SP', 'Cirurgia Cardiovascular', array['Cirurgia Vascular'],                                10, 'Cirurgião cardiovascular com foco em aneurismas.',                              array['Hospital Sírio-Libanês']),
  ('20000000-0000-0000-0000-000000000008', '222333', 'RJ', 'Ortopedia',               array['Trauma Ortopédico'],                                 8, 'Ortopedista com atuação em trauma e reconstrução articular.',                   array['Hospital Copa Star']),
  ('20000000-0000-0000-0000-000000000009', '333444', 'BA', 'Ginecologia e Obstetrícia', array['Endometriose','Cirurgia Minimamente Invasiva'],   13, 'Ginecologista referência em cirurgia videolaparoscópica.',                      array['Hospital Aliança']),
  ('20000000-0000-0000-0000-000000000010', '444555', 'PE', 'Urologia',                array['Uro-oncologia','Endourologia'],                     15, 'Urologista com foco em cirurgia oncológica minimamente invasiva.',              array['Hospital Real Português']),
  ('20000000-0000-0000-0000-000000000011', '555666', 'MG', 'Neurocirurgia',           array['Coluna'],                                            6, 'Neurocirurgião em fase de cadastro na plataforma.',                             array['Hospital Mater Dei']),
  ('20000000-0000-0000-0000-000000000012', '666777', 'CE', 'Cirurgia Geral',          array['Videolaparoscopia'],                                 5, 'Cirurgiã geral — cadastro rejeitado para fins de teste.',                       array['Hospital Fortaleza'])
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- student_profiles
-- ------------------------------------------------------------
insert into student_profiles (id, crm, especialidade, ano_formacao, nivel, objetivos) values
  ('30000000-0000-0000-0000-000000000001', null,     null,                       null, 'estudante',   array['Aprender técnicas cirúrgicas','Networking']),
  ('30000000-0000-0000-0000-000000000002', '789012', 'Cirurgia Cardiovascular',  2023, 'residente',   array['Especialização em cardiologia']),
  ('30000000-0000-0000-0000-000000000003', '890123', 'Ortopedia',                2019, 'especialista',array['Atualização em novas técnicas']),
  ('30000000-0000-0000-0000-000000000004', null,     null,                       null, 'estudante',   array['Vivenciar cirurgias de perto']),
  ('30000000-0000-0000-0000-000000000005', '901234', 'Cirurgia Geral',           2022, 'residente',   array['Aprimorar prática cirúrgica']),
  ('30000000-0000-0000-0000-000000000006', null,     null,                       null, 'estudante',   array['Explorar especialidades']),
  ('30000000-0000-0000-0000-000000000007', null,     null,                       null, 'estudante',   array['Aprender técnicas cirúrgicas']),
  ('30000000-0000-0000-0000-000000000008', '012345', 'Neurocirurgia',            2021, 'residente',   array['Networking com mentores']),

  ('30000000-0000-0000-0000-000000000009', null,     null,                       null, 'estudante',   array['Aprender técnicas cirúrgicas']),
  ('30000000-0000-0000-0000-000000000010', '123098', 'Cirurgia Cardiovascular',  2024, 'residente',   array['Especialização em cardiologia']),
  ('30000000-0000-0000-0000-000000000011', '234109', 'Ginecologia e Obstetrícia',2018, 'especialista',array['Atualização em novas técnicas']),
  ('30000000-0000-0000-0000-000000000012', null,     null,                       null, 'estudante',   array['Vivenciar cirurgias de perto']),
  ('30000000-0000-0000-0000-000000000013', '345210', 'Urologia',                 2023, 'residente',   array['Aprimorar prática cirúrgica']),
  ('30000000-0000-0000-0000-000000000014', null,     null,                       null, 'estudante',   array['Explorar especialidades']),
  ('30000000-0000-0000-0000-000000000015', null,     null,                       null, 'estudante',   array['Aprender técnicas cirúrgicas']),
  ('30000000-0000-0000-0000-000000000016', '456321', 'Ortopedia',                2020, 'residente',   array['Networking com mentores'])
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- offerings
-- ------------------------------------------------------------
insert into offerings (id, mentor_id, procedure_id, titulo, descricao, max_vagas, preco, inicio, fim, cidade, latitude, longitude, status) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', (select id from procedures where nome = 'Revascularização Miocárdica'), 'Revascularização Miocárdica na prática', 'Acompanhe uma cirurgia de revascularização do início ao fim.', 3, 850.00, now() + interval '5 days',  now() + interval '5 days 3 hours',  'São Paulo',      -23.5505, -46.6333, 'publicado'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', (select id from procedures where nome = 'Troca de Valva Aórtica'),      'Troca de Valva Aórtica — rascunho',      'Ainda em preparação.',                                          2, 900.00, now() + interval '20 days', now() + interval '20 days 3 hours', 'São Paulo',      -23.5613, -46.6565, 'rascunho'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', (select id from procedures where nome = 'Troca de Valva Mitral'),       'Troca de Valva Mitral',                  'Mentoria concluída — turma de valva mitral.',                  2, 780.00, now() - interval '10 days', now() - interval '10 days' + interval '3 hours', 'São Paulo', -23.5489, -46.6388, 'encerrado'),

  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', (select id from procedures where nome = 'Artroscopia de Joelho'),        'Artroscopia de Joelho passo a passo',    'Vivencie uma artroscopia de joelho completa.',                 4, 450.00, now() + interval '3 days',  now() + interval '3 days 2 hours',  'Rio de Janeiro', -22.9068, -43.1729, 'publicado'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', (select id from procedures where nome = 'Artroplastia Total de Quadril'), 'Artroplastia Total de Quadril',         'Turma reduzida para acompanhamento próximo.',                  2, 950.00, now() + interval '12 days', now() + interval '12 days 3 hours', 'Rio de Janeiro', -22.9110, -43.2094, 'publicado'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', (select id from procedures where nome = 'Osteossíntese de Fêmur'),       'Osteossíntese de Fêmur',                'Mentoria já encerrada.',                                       3, 600.00, now() - interval '15 days', now() - interval '15 days' + interval '2 hours', 'Rio de Janeiro', -22.9035, -43.2096, 'encerrado'),

  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', (select id from procedures where nome = 'Microdiscectomia Lombar'), 'Microdiscectomia Lombar minimamente invasiva', 'Técnica minimamente invasiva de coluna.',                1, 700.00,  now() + interval '7 days',  now() + interval '7 days 2 hours',  'Belo Horizonte', -19.9167, -43.9345, 'publicado'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', (select id from procedures where nome = 'Craniotomia'),              'Craniotomia — sessão encerrada',               'Mentoria avançada de neurocirurgia.',                     1, 1200.00, now() - interval '20 days', now() - interval '20 days' + interval '4 hours', 'Belo Horizonte', -19.9245, -43.9352, 'encerrado'),

  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', (select id from procedures where nome = 'Colecistectomia Laparoscópica'), 'Colecistectomia Laparoscópica', 'Turma ampla para colecistectomia por vídeo.',    5, 350.00, now() + interval '4 days',  now() + interval '4 days 2 hours',  'Curitiba', -25.4284, -49.2733, 'publicado'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', (select id from procedures where nome = 'Herniorrafia Inguinal'),          'Herniorrafia Inguinal',         'Procedimento básico, ideal para iniciantes.',     3, 300.00, now() + interval '9 days',  now() + interval '9 days 2 hours',  'Curitiba', -25.4372, -49.2697, 'publicado'),
  ('40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', (select id from procedures where nome = 'Apendicectomia Laparoscópica'),   'Apendicectomia Laparoscópica',  'Mentoria já encerrada.',                          2, 320.00, now() - interval '8 days',  now() - interval '8 days' + interval '2 hours', 'Curitiba', -25.4200, -49.2650, 'encerrado'),

  ('40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000007', (select id from procedures where nome = 'Correção de Aneurisma Aórtico'), 'Correção de Aneurisma Aórtico ao vivo', 'Acompanhe uma correção de aneurisma aórtico.', 2, 880.00, now() + interval '6 days',  now() + interval '6 days 3 hours',  'São Paulo', -23.5558, -46.6396, 'publicado'),
  ('40000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000007', (select id from procedures where nome = 'Revascularização Miocárdica'),    'Revascularização Miocárdica — turma extra', 'Mentoria já encerrada.',                   2, 850.00, now() - interval '12 days', now() - interval '12 days' + interval '3 hours', 'São Paulo', -23.5700, -46.6400, 'encerrado'),

  ('40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000008', (select id from procedures where nome = 'Artroplastia Total de Joelho'),   'Artroplastia Total de Joelho',          'Turma para acompanhamento de artroplastia de joelho.', 3, 920.00, now() + interval '8 days',  now() + interval '8 days 3 hours',  'Rio de Janeiro', -22.9200, -43.2300, 'publicado'),
  ('40000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000008', (select id from procedures where nome = 'Artroscopia de Joelho'),          'Artroscopia de Joelho — rascunho',      'Ainda em preparação.',                                 4, 430.00, now() + interval '25 days', now() + interval '25 days 2 hours', 'Rio de Janeiro', -22.9300, -43.2100, 'rascunho'),
  ('40000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000008', (select id from procedures where nome = 'Artroplastia Total de Quadril'), 'Artroplastia Total de Quadril — turma extra', 'Mentoria já encerrada.',                          2, 970.00, now() - interval '6 days',  now() - interval '6 days' + interval '3 hours', 'Rio de Janeiro', -22.9150, -43.2000, 'encerrado'),

  ('40000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000009', (select id from procedures where nome = 'Histerectomia Total Laparoscópica'), 'Histerectomia Total Laparoscópica', 'Acompanhe uma histerectomia por vídeo.',          3, 600.00, now() + interval '10 days', now() + interval '10 days 3 hours', 'Salvador', -12.9714, -38.5014, 'publicado'),
  ('40000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000009', (select id from procedures where nome = 'Miomectomia Laparoscópica'),          'Miomectomia Laparoscópica',         'Turma reduzida para acompanhamento próximo.',    2, 650.00, now() + interval '14 days', now() + interval '14 days 2 hours', 'Salvador', -12.9800, -38.4900, 'publicado'),
  ('40000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000009', (select id from procedures where nome = 'Histerectomia Total Laparoscópica'), 'Histerectomia — turma encerrada',   'Mentoria já encerrada.',                          2, 600.00, now() - interval '4 days',  now() - interval '4 days' + interval '3 hours', 'Salvador', -12.9750, -38.5100, 'encerrado'),

  ('40000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000010', (select id from procedures where nome = 'Nefrectomia Parcial'),                'Nefrectomia Parcial',               'Acompanhe uma nefrectomia parcial minimamente invasiva.', 2, 780.00, now() + interval '11 days', now() + interval '11 days 3 hours', 'Recife', -8.0476, -34.8770, 'publicado'),
  ('40000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000010', (select id from procedures where nome = 'Prostatectomia Radical Laparoscópica'), 'Prostatectomia Radical Laparoscópica', 'Turma para acompanhamento cirúrgico oncológico.', 2, 900.00, now() + interval '16 days', now() + interval '16 days 3 hours', 'Recife', -8.0550, -34.8850, 'publicado'),
  ('40000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000010', (select id from procedures where nome = 'Nefrectomia Parcial'),                'Nefrectomia Parcial — turma encerrada', 'Mentoria já encerrada.',                       2, 780.00, now() - interval '9 days',  now() - interval '9 days' + interval '3 hours', 'Recife', -8.0500, -34.8700, 'encerrado')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
insert into bookings (id, aluno_id, mentor_id, offering_id, mensagem, status) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Tenho muito interesse em cardiologia.', 'pendente'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Sou residente de cirurgia cardiovascular.', 'confirmado'),

  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', 'Gostaria de acompanhar a técnica.', 'confirmado'),

  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009', 'Primeira vez acompanhando uma cirurgia.', 'pendente'),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009', 'Já atuo na área.', 'rejeitado'),

  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'Participei da turma de valva mitral.', 'concluido'),
  ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'Ótima experiência.', 'concluido'),

  ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', 'Aprendi bastante sobre fixação óssea.', 'concluido'),
  ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000011', 'Excelente mentoria.', 'concluido'),

  ('50000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', 'Quero migrar para neurocirurgia.', 'concluido'),

  ('50000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000007', 'Tenho interesse em cirurgia de coluna.', 'pendente'),
  ('50000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', 'Cancelei por conflito de agenda.', 'cancelado'),

  ('50000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000012', 'Tenho muito interesse em cirurgia vascular.', 'pendente'),
  ('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000012', 'Sou residente de cardiologia.', 'confirmado'),

  ('50000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000017', 'Gostaria de acompanhar a técnica.', 'pendente'),
  ('50000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000018', 'Tenho interesse em ginecologia cirúrgica.', 'confirmado'),

  ('50000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000020', 'Primeira vez acompanhando urologia.', 'pendente'),
  ('50000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000021', 'Já atuo na área.', 'confirmado'),

  ('50000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000014', 'Quero acompanhar a artroplastia.', 'pendente'),
  ('50000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000014', 'Não tenho experiência prévia ainda.', 'rejeitado'),

  ('50000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000013', 'Participei da turma de revascularização.', 'concluido'),
  ('50000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000016', 'Ótima experiência com artroplastia.', 'concluido'),
  ('50000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000019', 'Aprendi bastante sobre histerectomia.', 'concluido'),
  ('50000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000022', 'Excelente mentoria de urologia.', 'concluido')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- messages (chat)
-- ------------------------------------------------------------
insert into messages (id, offering_id, booking_id, sender_id, conteudo) values
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Olá, doutora! Preciso levar algum equipamento próprio?'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Olá! Não é necessário, apenas jaleco. Nos vemos lá.'),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', null,                                    '30000000-0000-0000-0000-000000000004', 'Ainda há vagas para essa turma?'),

  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Qual o horário exato de chegada?'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Chegue 30 minutos antes, às 7h30.'),

  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000010', 'Doutor, preciso providenciar algo específico?'),
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000007', 'Apenas jaleco e crachá do hospital.'),
  ('60000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000017', null,                                    '30000000-0000-0000-0000-000000000011', 'Essa mentoria já tem confirmação de data final?'),
  ('60000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000001', 'Qual a duração média do procedimento?'),
  ('60000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000010', 'Cerca de 2 horas, mas pode variar.')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- payments (Stripe Checkout — simulated as already paid locally)
-- ------------------------------------------------------------
insert into payments (booking_id, aluno_id, mentor_id, offering_id, valor_bruto, stripe_session_id, stripe_payment_intent, metodo_pagamento, status, repasse_status, repasse_em) values
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', 450.00,  'cs_test_seed_0003', 'pi_test_seed_0003', 'card', 'pago', 'pendente',  null),

  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 780.00,  'cs_test_seed_0006', 'pi_test_seed_0006', 'card', 'pago', 'repassado', now() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 780.00,  'cs_test_seed_0007', 'pi_test_seed_0007', 'card', 'pago', 'pendente',  null),

  ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', 600.00,  'cs_test_seed_0008', 'pi_test_seed_0008', 'card', 'pago', 'repassado', now() - interval '3 days'),
  ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000011', 320.00,  'cs_test_seed_0009', 'pi_test_seed_0009', 'card', 'pago', 'repassado', now() - interval '2 days'),

  ('50000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', 1200.00, 'cs_test_seed_0010', 'pi_test_seed_0010', 'card', 'pago', 'pendente',  null),

  ('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000012', 880.00,  'cs_test_seed_0014', 'pi_test_seed_0014', 'card', 'pago', 'pendente',  null),
  ('50000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000018', 650.00,  'cs_test_seed_0016', 'pi_test_seed_0016', 'card', 'pago', 'pendente',  null),
  ('50000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000021', 900.00,  'cs_test_seed_0018', 'pi_test_seed_0018', 'card', 'pago', 'pendente',  null),

  ('50000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000013', 850.00,  'cs_test_seed_0021', 'pi_test_seed_0021', 'card', 'pago', 'repassado', now() - interval '4 days'),
  ('50000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000016', 970.00,  'cs_test_seed_0022', 'pi_test_seed_0022', 'card', 'pago', 'pendente',  null),
  ('50000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000019', 600.00,  'cs_test_seed_0023', 'pi_test_seed_0023', 'card', 'pago', 'repassado', now() - interval '2 days'),
  ('50000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000022', 780.00,  'cs_test_seed_0024', 'pi_test_seed_0024', 'card', 'pago', 'repassado', now() - interval '1 days')
on conflict (booking_id) do nothing;

-- ------------------------------------------------------------
-- avaliacoes (mutual reviews — drives ranking + certificate/repasse gates)
-- ------------------------------------------------------------
insert into avaliacoes (booking_id, autor_id, avaliado_id, direcao, nota, comentario) values
  -- booking 6 (Ana / Beatriz): both sides rated -> certificate unlocked, repasse released
  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'aluno_para_mentor', 5, 'Mentoria excelente, aprendi muito!'),
  ('50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'mentor_para_aluno', 5, 'Aluna muito engajada e pontual.'),

  -- booking 7 (Bruno / Beatriz): only aluno rated -> certificate unlocked for Bruno, repasse still pending (mentor hasn't rated)
  ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'aluno_para_mentor', 4, 'Muito boa, só achei a turma um pouco cheia.'),

  -- booking 8 (Carla / Rafael): both sides rated
  ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'aluno_para_mentor', 5, 'Excelente didática.'),
  ('50000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'mentor_para_aluno', 4, 'Ótima participação.'),

  -- booking 9 (Elisa / Camila): both sides rated
  ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 'aluno_para_mentor', 5, 'Recomendo muito!'),
  ('50000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'mentor_para_aluno', 5, 'Excelente aluna.'),

  -- booking 10 (Carla / Henrique): only mentor rated -> Carla's certificate still locked ("Avalie para liberar"), repasse pending
  ('50000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'mentor_para_aluno', 4, 'Boa postura em campo cirúrgico.'),

  -- booking 21 (Elisa / André): both sides rated
  ('50000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000007', 'aluno_para_mentor', 5, 'Show, aprendi muito sobre correção de aneurismas.'),
  ('50000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', 'mentor_para_aluno', 5, 'Aluna atenta e muito interessada.'),

  -- booking 22 (Igor / Juliana): only aluno rated -> repasse still pending (mentor hasn't rated)
  ('50000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', 'aluno_para_mentor', 4, 'Ótima didática, recomendo.'),

  -- booking 23 (Julia / Renata): both sides rated
  ('50000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', 'aluno_para_mentor', 5, 'Excelente mentoria de ginecologia cirúrgica.'),
  ('50000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000010', 'mentor_para_aluno', 4, 'Ótima participação em campo.'),

  -- booking 24 (Karina / Vitor): both sides rated
  ('50000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000010', 'aluno_para_mentor', 5, 'Recomendo muito essa mentoria de urologia.'),
  ('50000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000011', 'mentor_para_aluno', 5, 'Excelente aluna, muito preparada.')
on conflict (booking_id, autor_id) do nothing;

commit;
