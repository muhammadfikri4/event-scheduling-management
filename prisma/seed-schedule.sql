-- =============================================
-- IMERC 2026 — Seed Data (FINAL)
-- Menggunakan subquery agar tidak tergantung ID
-- =============================================

-- 1. TEAMS
INSERT INTO "Team" (id, name, color, "createdAt", "updatedAt") VALUES
  ('team_01','Team 1','#EF4444',NOW(),NOW()),('team_02','Team 2','#F97316',NOW(),NOW()),
  ('team_03','Team 3','#F59E0B',NOW(),NOW()),('team_04','Team 4','#84CC16',NOW(),NOW()),
  ('team_05','Team 5','#22C55E',NOW(),NOW()),('team_06','Team 6','#14B8A6',NOW(),NOW()),
  ('team_07','Team 7','#06B6D4',NOW(),NOW()),('team_08','Team 8','#3B82F6',NOW(),NOW()),
  ('team_09','Team 9','#6366F1',NOW(),NOW()),('team_10','Team 10','#8B5CF6',NOW(),NOW()),
  ('team_11','Team 11','#A855F7',NOW(),NOW()),('team_12','Team 12','#D946EF',NOW(),NOW()),
  ('team_13','Team 13','#EC4899',NOW(),NOW()),('team_14','Team 14','#F43F5E',NOW(),NOW()),
  ('team_15','Team 15','#78716C',NOW(),NOW()),('team_16','Team 16','#0EA5E9',NOW(),NOW()),
  ('team_17','Team 17','#10B981',NOW(),NOW()),('team_18','Team 18','#D97706',NOW(),NOW()),
  ('team_19','Team 19','#E11D48',NOW(),NOW()),('team_20','Team 20','#7C3AED',NOW(),NOW()),
  ('team_21','Team 21','#0891B2',NOW(),NOW()),('team_22','Team 22','#059669',NOW(),NOW()),
  ('team_23','Team 23','#DC2626',NOW(),NOW()),('team_24','Team 24','#CA8A04',NOW(),NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. COMPETITION TYPES
INSERT INTO "CompetitionType" (id, name, code, color, "createdAt", "updatedAt") VALUES
  ('ct_rcr','Road Crash Rescue','RCR','#DC2626',NOW(),NOW()),
  ('ct_uw','Under Water Rescue','UWRR','#2563EB',NOW(),NOW()),
  ('ct_vr','Vertical Rescue','VR','#16A34A',NOW(),NOW()),
  ('ct_cs','Confined Space Rescue','CSR','#9333EA',NOW(),NOW()),
  ('ct_fire','Structural Fire Fighting','SFF','#EA580C',NOW(),NOW()),
  ('ct_isl1','Individual Skill Line 1','ISL1','#0D9488',NOW(),NOW()),
  ('ct_isl2','Individual Skill Line 2','ISL2','#7C3AED',NOW(),NOW()),
  ('ct_fcc','Fire Combat Challenge','FCC','#B91C1C',NOW(),NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. TIME SLOTS (upsert — update ID jika sudah ada)
INSERT INTO "TimeSlot" (id,"startTime","endTime","order","createdAt","updatedAt") VALUES
  ('ts_0630_0645','06:30','06:45',1,NOW(),NOW()),
  ('ts_0650_0730','06:50','07:30',2,NOW(),NOW()),
  ('ts_0715_0730','07:15','07:30',3,NOW(),NOW()),
  ('ts_0730_0745','07:30','07:45',4,NOW(),NOW()),
  ('ts_0735_0815','07:35','08:15',5,NOW(),NOW()),
  ('ts_0745_0800','07:45','08:00',6,NOW(),NOW()),
  ('ts_0800_0815','08:00','08:15',7,NOW(),NOW()),
  ('ts_0805_0845','08:05','08:45',8,NOW(),NOW()),
  ('ts_0815_0830','08:15','08:30',9,NOW(),NOW()),
  ('ts_0820_0900','08:20','09:00',10,NOW(),NOW()),
  ('ts_0830_0845','08:30','08:45',11,NOW(),NOW()),
  ('ts_0845_0900','08:45','09:00',12,NOW(),NOW()),
  ('ts_0850_0930','08:50','09:30',13,NOW(),NOW()),
  ('ts_0900_0915','09:00','09:15',14,NOW(),NOW()),
  ('ts_0905_0945','09:05','09:45',15,NOW(),NOW()),
  ('ts_0915_0930','09:15','09:30',16,NOW(),NOW()),
  ('ts_0930_0945','09:30','09:45',17,NOW(),NOW()),
  ('ts_0935_1015','09:35','10:15',18,NOW(),NOW()),
  ('ts_0945_1000','09:45','10:00',19,NOW(),NOW()),
  ('ts_0950_1030','09:50','10:30',20,NOW(),NOW()),
  ('ts_1000_1015','10:00','10:15',21,NOW(),NOW()),
  ('ts_1015_1030','10:15','10:30',22,NOW(),NOW()),
  ('ts_1020_1100','10:20','11:00',23,NOW(),NOW()),
  ('ts_1030_1045','10:30','10:45',24,NOW(),NOW()),
  ('ts_1035_1115','10:35','11:15',25,NOW(),NOW()),
  ('ts_1045_1100','10:45','11:00',26,NOW(),NOW()),
  ('ts_1100_1115','11:00','11:15',27,NOW(),NOW()),
  ('ts_1105_1145','11:05','11:45',28,NOW(),NOW()),
  ('ts_1115_1130','11:15','11:30',29,NOW(),NOW()),
  ('ts_1120_1200','11:20','12:00',30,NOW(),NOW()),
  ('ts_1130_1145','11:30','11:45',31,NOW(),NOW()),
  ('ts_1145_1200','11:45','12:00',32,NOW(),NOW()),
  ('ts_1200_1215','12:00','12:15',33,NOW(),NOW()),
  ('ts_1205_1230','12:05','12:30',34,NOW(),NOW()),
  ('ts_1215_1230','12:15','12:30',35,NOW(),NOW()),
  ('ts_1230_1245','12:30','12:45',36,NOW(),NOW()),
  ('ts_1245_1300','12:45','13:00',37,NOW(),NOW()),
  ('ts_1300_1315','13:00','13:15',38,NOW(),NOW()),
  ('ts_1305_1345','13:05','13:45',39,NOW(),NOW()),
  ('ts_1315_1330','13:15','13:30',40,NOW(),NOW()),
  ('ts_1330_1345','13:30','13:45',41,NOW(),NOW()),
  ('ts_1345_1400','13:45','14:00',42,NOW(),NOW()),
  ('ts_1350_1430','13:50','14:30',43,NOW(),NOW()),
  ('ts_1435_1515','14:35','15:15',44,NOW(),NOW()),
  ('ts_1520_1600','15:20','16:00',45,NOW(),NOW()),
  ('ts_1605_1645','16:05','16:45',46,NOW(),NOW()),
  ('ts_1650_1730','16:50','17:30',47,NOW(),NOW())
ON CONFLICT ("startTime","endTime") DO UPDATE SET id = EXCLUDED.id, "order" = EXCLUDED."order";

-- =============================================
-- Helper function: find timeSlot ID by start/end
-- =============================================
CREATE OR REPLACE FUNCTION ts(s TEXT, e TEXT) RETURNS TEXT AS $$
  SELECT id FROM "TimeSlot" WHERE "startTime" = s AND "endTime" = e LIMIT 1;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION tm(n TEXT) RETURNS TEXT AS $$
  SELECT id FROM "Team" WHERE name = n LIMIT 1;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION ct(c TEXT) RETURNS TEXT AS $$
  SELECT id FROM "CompetitionType" WHERE code = c LIMIT 1;
$$ LANGUAGE sql;

-- Clear existing schedules for these dates
DELETE FROM "Schedule" WHERE "eventDate" IN ('2026-08-07','2026-08-08','2026-08-09');
DELETE FROM "Note" WHERE "eventDate" IN ('2026-08-06','2026-08-07','2026-08-08','2026-08-09');

-- =============================================
-- JUM'AT, 07 AGUSTUS 2026
-- =============================================
INSERT INTO "Schedule" (id,"teamId","competitionTypeId","timeSlotId","eventDate",status,"createdAt","updatedAt") VALUES
-- 08:05-08:45
(gen_random_uuid(),tm('Team 1'),ct('RCR'),ts('08:05','08:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('UWRR'),ts('08:05','08:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('VR'),ts('08:05','08:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('CSR'),ts('08:05','08:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 5'),ct('SFF'),ts('08:05','08:45'),'2026-08-07','pending',NOW(),NOW()),
-- 08:50-09:30
(gen_random_uuid(),tm('Team 6'),ct('RCR'),ts('08:50','09:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('UWRR'),ts('08:50','09:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('VR'),ts('08:50','09:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('CSR'),ts('08:50','09:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('SFF'),ts('08:50','09:30'),'2026-08-07','pending',NOW(),NOW()),
-- 09:35-10:15
(gen_random_uuid(),tm('Team 11'),ct('RCR'),ts('09:35','10:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('UWRR'),ts('09:35','10:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('VR'),ts('09:35','10:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('CSR'),ts('09:35','10:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('SFF'),ts('09:35','10:15'),'2026-08-07','pending',NOW(),NOW()),
-- 10:20-11:00
(gen_random_uuid(),tm('Team 16'),ct('RCR'),ts('10:20','11:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('UWRR'),ts('10:20','11:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('VR'),ts('10:20','11:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('CSR'),ts('10:20','11:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('SFF'),ts('10:20','11:00'),'2026-08-07','pending',NOW(),NOW()),
-- 11:05-11:45
(gen_random_uuid(),tm('Team 21'),ct('RCR'),ts('11:05','11:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('UWRR'),ts('11:05','11:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('VR'),ts('11:05','11:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('CSR'),ts('11:05','11:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 1'),ct('SFF'),ts('11:05','11:45'),'2026-08-07','pending',NOW(),NOW()),
-- 13:05-13:45
(gen_random_uuid(),tm('Team 2'),ct('RCR'),ts('13:05','13:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('UWRR'),ts('13:05','13:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('VR'),ts('13:05','13:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 5'),ct('CSR'),ts('13:05','13:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('SFF'),ts('13:05','13:45'),'2026-08-07','pending',NOW(),NOW()),
-- 13:50-14:30
(gen_random_uuid(),tm('Team 7'),ct('RCR'),ts('13:50','14:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('UWRR'),ts('13:50','14:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('VR'),ts('13:50','14:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('CSR'),ts('13:50','14:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('SFF'),ts('13:50','14:30'),'2026-08-07','pending',NOW(),NOW()),
-- 14:35-15:15
(gen_random_uuid(),tm('Team 12'),ct('RCR'),ts('14:35','15:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('UWRR'),ts('14:35','15:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('VR'),ts('14:35','15:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('CSR'),ts('14:35','15:15'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('SFF'),ts('14:35','15:15'),'2026-08-07','pending',NOW(),NOW()),
-- 15:20-16:00
(gen_random_uuid(),tm('Team 17'),ct('RCR'),ts('15:20','16:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('UWRR'),ts('15:20','16:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('VR'),ts('15:20','16:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('CSR'),ts('15:20','16:00'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('SFF'),ts('15:20','16:00'),'2026-08-07','pending',NOW(),NOW()),
-- 16:05-16:45
(gen_random_uuid(),tm('Team 22'),ct('RCR'),ts('16:05','16:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('UWRR'),ts('16:05','16:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('VR'),ts('16:05','16:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 1'),ct('CSR'),ts('16:05','16:45'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('SFF'),ts('16:05','16:45'),'2026-08-07','pending',NOW(),NOW()),
-- 16:50-17:30
(gen_random_uuid(),tm('Team 3'),ct('RCR'),ts('16:50','17:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('UWRR'),ts('16:50','17:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 5'),ct('VR'),ts('16:50','17:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('CSR'),ts('16:50','17:30'),'2026-08-07','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('SFF'),ts('16:50','17:30'),'2026-08-07','pending',NOW(),NOW());

-- =============================================
-- SABTU, 08 AGUSTUS 2026
-- =============================================
INSERT INTO "Schedule" (id,"teamId","competitionTypeId","timeSlotId","eventDate",status,"createdAt","updatedAt") VALUES
-- 06:50-07:30
(gen_random_uuid(),tm('Team 8'),ct('RCR'),ts('06:50','07:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('UWRR'),ts('06:50','07:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('VR'),ts('06:50','07:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('CSR'),ts('06:50','07:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('SFF'),ts('06:50','07:30'),'2026-08-08','pending',NOW(),NOW()),
-- 07:35-08:15
(gen_random_uuid(),tm('Team 13'),ct('RCR'),ts('07:35','08:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('UWRR'),ts('07:35','08:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('VR'),ts('07:35','08:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('CSR'),ts('07:35','08:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('SFF'),ts('07:35','08:15'),'2026-08-08','pending',NOW(),NOW()),
-- 08:20-09:00
(gen_random_uuid(),tm('Team 18'),ct('RCR'),ts('08:20','09:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('UWRR'),ts('08:20','09:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('VR'),ts('08:20','09:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('CSR'),ts('08:20','09:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('SFF'),ts('08:20','09:00'),'2026-08-08','pending',NOW(),NOW()),
-- 09:05-09:45
(gen_random_uuid(),tm('Team 23'),ct('RCR'),ts('09:05','09:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('UWRR'),ts('09:05','09:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 1'),ct('VR'),ts('09:05','09:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('CSR'),ts('09:05','09:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('SFF'),ts('09:05','09:45'),'2026-08-08','pending',NOW(),NOW()),
-- 09:50-10:30
(gen_random_uuid(),tm('Team 4'),ct('RCR'),ts('09:50','10:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 5'),ct('UWRR'),ts('09:50','10:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('VR'),ts('09:50','10:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('CSR'),ts('09:50','10:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('SFF'),ts('09:50','10:30'),'2026-08-08','pending',NOW(),NOW()),
-- 10:35-11:15
(gen_random_uuid(),tm('Team 9'),ct('RCR'),ts('10:35','11:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('UWRR'),ts('10:35','11:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('VR'),ts('10:35','11:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('CSR'),ts('10:35','11:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('SFF'),ts('10:35','11:15'),'2026-08-08','pending',NOW(),NOW()),
-- 11:20-12:00
(gen_random_uuid(),tm('Team 14'),ct('RCR'),ts('11:20','12:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('UWRR'),ts('11:20','12:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('VR'),ts('11:20','12:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('CSR'),ts('11:20','12:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('SFF'),ts('11:20','12:00'),'2026-08-08','pending',NOW(),NOW()),
-- 12:05-12:30
(gen_random_uuid(),tm('Team 19'),ct('RCR'),ts('12:05','12:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('UWRR'),ts('12:05','12:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('VR'),ts('12:05','12:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('CSR'),ts('12:05','12:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('SFF'),ts('12:05','12:30'),'2026-08-08','pending',NOW(),NOW()),
-- 13:05-13:45
(gen_random_uuid(),tm('Team 24'),ct('RCR'),ts('13:05','13:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 1'),ct('UWRR'),ts('13:05','13:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('VR'),ts('13:05','13:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('CSR'),ts('13:05','13:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('SFF'),ts('13:05','13:45'),'2026-08-08','pending',NOW(),NOW()),
-- 13:50-14:30
(gen_random_uuid(),tm('Team 5'),ct('RCR'),ts('13:50','14:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('UWRR'),ts('13:50','14:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('VR'),ts('13:50','14:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('CSR'),ts('13:50','14:30'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('SFF'),ts('13:50','14:30'),'2026-08-08','pending',NOW(),NOW()),
-- 14:35-15:15
(gen_random_uuid(),tm('Team 10'),ct('RCR'),ts('14:35','15:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('UWRR'),ts('14:35','15:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('VR'),ts('14:35','15:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('CSR'),ts('14:35','15:15'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('SFF'),ts('14:35','15:15'),'2026-08-08','pending',NOW(),NOW()),
-- 15:20-16:00
(gen_random_uuid(),tm('Team 15'),ct('RCR'),ts('15:20','16:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('UWRR'),ts('15:20','16:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('VR'),ts('15:20','16:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('CSR'),ts('15:20','16:00'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('SFF'),ts('15:20','16:00'),'2026-08-08','pending',NOW(),NOW()),
-- 16:05-16:45
(gen_random_uuid(),tm('Team 20'),ct('RCR'),ts('16:05','16:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('UWRR'),ts('16:05','16:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('VR'),ts('16:05','16:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('CSR'),ts('16:05','16:45'),'2026-08-08','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('SFF'),ts('16:05','16:45'),'2026-08-08','pending',NOW(),NOW());

-- =============================================
-- MINGGU, 09 AGUSTUS 2026
-- =============================================
INSERT INTO "Schedule" (id,"teamId","competitionTypeId","timeSlotId","eventDate",status,"createdAt","updatedAt") VALUES
-- ISL1 + ISL2
(gen_random_uuid(),tm('Team 1'),ct('ISL1'),ts('06:30','06:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('ISL2'),ts('06:30','06:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('ISL1'),ts('07:15','07:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('ISL2'),ts('07:15','07:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('ISL1'),ts('07:30','07:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('ISL2'),ts('07:30','07:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('ISL1'),ts('07:45','08:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('ISL2'),ts('07:45','08:00'),'2026-08-09','pending',NOW(),NOW()),
-- ISL1 + ISL2 + FCC mulai
(gen_random_uuid(),tm('Team 5'),ct('ISL1'),ts('08:00','08:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('ISL2'),ts('08:00','08:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 1'),ct('FCC'),ts('08:00','08:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('ISL1'),ts('08:15','08:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('ISL2'),ts('08:15','08:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 13'),ct('FCC'),ts('08:15','08:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('ISL1'),ts('08:30','08:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('ISL2'),ts('08:30','08:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 2'),ct('FCC'),ts('08:30','08:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('ISL1'),ts('08:45','09:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('ISL2'),ts('08:45','09:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 14'),ct('FCC'),ts('08:45','09:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('ISL1'),ts('09:00','09:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('ISL2'),ts('09:00','09:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 3'),ct('FCC'),ts('09:00','09:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('ISL1'),ts('09:15','09:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('ISL2'),ts('09:15','09:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 15'),ct('FCC'),ts('09:15','09:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('ISL1'),ts('09:30','09:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('ISL2'),ts('09:30','09:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 4'),ct('FCC'),ts('09:30','09:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('ISL1'),ts('09:45','10:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('ISL2'),ts('09:45','10:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 16'),ct('FCC'),ts('09:45','10:00'),'2026-08-09','pending',NOW(),NOW()),
-- FCC solo
(gen_random_uuid(),tm('Team 5'),ct('FCC'),ts('10:00','10:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 17'),ct('FCC'),ts('10:15','10:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 6'),ct('FCC'),ts('10:30','10:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 18'),ct('FCC'),ts('10:45','11:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 7'),ct('FCC'),ts('11:00','11:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 19'),ct('FCC'),ts('11:15','11:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 8'),ct('FCC'),ts('11:30','11:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 20'),ct('FCC'),ts('11:45','12:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 9'),ct('FCC'),ts('12:00','12:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 21'),ct('FCC'),ts('12:15','12:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 10'),ct('FCC'),ts('12:30','12:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 22'),ct('FCC'),ts('12:45','13:00'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 11'),ct('FCC'),ts('13:00','13:15'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 23'),ct('FCC'),ts('13:15','13:30'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 12'),ct('FCC'),ts('13:30','13:45'),'2026-08-09','pending',NOW(),NOW()),
(gen_random_uuid(),tm('Team 24'),ct('FCC'),ts('13:45','14:00'),'2026-08-09','pending',NOW(),NOW());

-- =============================================
-- NOTES
-- =============================================
INSERT INTO "Note" (id,"eventDate",time,title,content,"createdAt","updatedAt") VALUES
(gen_random_uuid(),'2026-08-06','06:30','Workshop IMT','Workshop Incident Management Training — 06:30-16:00',NOW(),NOW()),
(gen_random_uuid(),'2026-08-06','06:30','Equipment Staging & Familiarization','06:30-16:00',NOW(),NOW()),
(gen_random_uuid(),'2026-08-06','16:00','Opening Ceremony','16:00-18:30',NOW(),NOW()),
(gen_random_uuid(),'2026-08-07','06:00','Alcohol Breathalyzer Test','All Teams — 06:00-06:30',NOW(),NOW()),
(gen_random_uuid(),'2026-08-07','06:30','Morning Exercise','06:30-06:45',NOW(),NOW()),
(gen_random_uuid(),'2026-08-07','07:00','Theory Test','All Teams — 07:00-08:00',NOW(),NOW()),
(gen_random_uuid(),'2026-08-07','11:45','Jumatan / Pray Break','11:45-13:00',NOW(),NOW()),
(gen_random_uuid(),'2026-08-07','17:30','Clear Area & Closing','17:30-17:45',NOW(),NOW()),
(gen_random_uuid(),'2026-08-08','06:30','Morning Exercise','06:30-06:45',NOW(),NOW()),
(gen_random_uuid(),'2026-08-08','12:30','Pray & Lunch Break','12:30-13:00',NOW(),NOW()),
(gen_random_uuid(),'2026-08-09','06:00','Morning Exercise','06:00-06:15',NOW(),NOW());

-- UPDATE ADMIN
UPDATE "User" SET role = 'super_admin' WHERE username = 'admin';

-- Cleanup helper functions
DROP FUNCTION IF EXISTS ts(TEXT, TEXT);
DROP FUNCTION IF EXISTS tm(TEXT);
DROP FUNCTION IF EXISTS ct(TEXT);
