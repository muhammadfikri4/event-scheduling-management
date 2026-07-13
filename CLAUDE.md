# Event Scheduling Management - AI Agent Knowledge

## Project Overview

Sistem penjadwalan lomba/kompetisi untuk mengatur jadwal pertandingan tim-tim peserta pada berbagai jenis lomba di slot waktu tertentu. Terinspirasi dari penjadwalan lomba rescue/emergency response (Road Crash, Under Water, High Angle, Confined Space, Fire Fighting).

## Tech Stack

- **Framework**: Next.js 16 (App Router) - FE & BE dalam satu project
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma 7 + `@prisma/adapter-pg`
- **ORM**: Prisma 7 (menggunakan `prisma-client` generator, BUKAN `prisma-client-js`)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Utils**: date-fns
- **Auth**: JWT session via `jose` library, cookie-based

## Architecture

### Database Models (Prisma)

```
User              - User login (username, password/bcrypt hash, name)
Team              - Master data tim peserta (name, color)
CompetitionType   - Master data jenis lomba (name, code, color)
TimeSlot          - Master data slot waktu (startTime, endTime, order)
Schedule          - Jadwal: mapping team + competitionType + timeSlot + eventDate + status
```

Key constraints:
- `Schedule` has unique constraint on `[competitionTypeId, timeSlotId, eventDate]` - satu slot waktu per lomba per tanggal hanya bisa diisi 1 tim
- `Schedule.status` values: `pending`, `standby`, `playing`, `completed`

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (no sidebar)
│   ├── login/page.tsx                      # Login page (public)
│   ├── (authenticated)/                    # Route group (protected with sidebar)
│   │   ├── layout.tsx                      # Layout with sidebar
│   │   ├── page.tsx                        # Dashboard (3 view modes)
│   │   ├── teams/page.tsx                  # CRUD tim
│   │   ├── competition-types/page.tsx      # CRUD jenis lomba
│   │   ├── time-slots/page.tsx             # CRUD slot waktu
│   │   └── schedules/page.tsx              # Buat jadwal
│   └── api/
│       ├── auth/
│       │   ├── login/                      # POST (username/password)
│       │   ├── logout/                     # POST (clear session)
│       │   └── me/                         # GET (check session)
│       ├── teams/                          # GET, POST
│       │   └── [id]/                       # PUT, DELETE
│       ├── competition-types/              # GET, POST
│       │   └── [id]/                       # PUT, DELETE
│       ├── time-slots/                     # GET, POST
│       │   └── [id]/                       # PUT, DELETE
│       └── schedules/                      # GET (?eventDate=), POST
│           └── [id]/                       # PUT, DELETE
├── components/
│   └── sidebar.tsx                         # Navigation + logout button
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   └── auth.ts                             # Session create/verify/delete (JWT + cookie)
├── proxy.ts                                # Route protection (Next.js 16 proxy, replaces middleware)
└── generated/prisma/                       # Prisma generated (DO NOT EDIT)
```

### Authentication

- **Login dari database**: User model di PostgreSQL, password di-hash dengan `bcryptjs`
- **Session**: JWT token (HS256, `jose`) di httpOnly cookie `session`, expires 24 jam, payload berisi `userId`, `username`, `name`
- **Proxy**: Semua routes kecuali `/login` dan `/api/auth/login` dilindungi (`src/proxy.ts`)
- **Seed users**: `admin` / `admin123` dan `operator` / `operator123` (via `pnpm seed`)
- **`.env`**: Hanya perlu `AUTH_SECRET` untuk JWT signing (tidak ada credentials di env lagi)

### Prisma 7 Setup (PENTING)

Prisma 7 menggunakan `prisma-client` generator (bukan `prisma-client-js`) yang memerlukan:

1. **Driver Adapter**: Harus menggunakan `@prisma/adapter-pg` untuk PostgreSQL
2. **Client Instantiation**: `new PrismaClient({ adapter })` - tidak bisa tanpa adapter
3. **Import path**: `import { PrismaClient } from "@/generated/prisma/client"` (ada `/client` di akhir)
4. **Seed script**: Menggunakan `pg` langsung (bukan Prisma client) karena masalah ESM/CJS compatibility saat running dari CLI
5. **Config**: `prisma.config.ts` di root, datasource URL di `.env`

### Database

- PostgreSQL database `event_scheduling` di localhost:5432
- Connection string di `.env` (`DATABASE_URL`)
- Seed data: `prisma/seed.js` (JavaScript, menggunakan `pg` client langsung)

## Pages & Features

### Dashboard (`/`)
- **Grid View**: Tabel seperti referensi image - baris=waktu, kolom=jenis lomba, cell=nama tim
- **Day View**: Timeline vertikal per hari
- **Week View**: Google Calendar-like mingguan
- Navigasi tanggal (prev/next, hari ini)
- Modal detail jadwal on click
- Legend status dengan warna

### Buat Jadwal (`/schedules`)
- Form untuk assign tim ke lomba + slot waktu + tanggal
- Grid view mirip dashboard tapi dengan dropdown status & delete button
- Ubah status langsung dari grid

### Master Data (`/teams`, `/competition-types`, `/time-slots`)
- Inline form (show/hide)
- CRUD operations dengan warna picker

## Common Commands

```bash
pnpm dev             # Start dev server
pnpm build           # Production build
pnpm seed            # Seed database (node prisma/seed.js)
pnpm prisma migrate dev --name <name>  # Create migration
pnpm prisma generate # Regenerate Prisma client
pnpm prisma db push  # Push schema tanpa migration
```

**Package manager**: pnpm (BUKAN npm/yarn)

## Development Notes

- Semua pages adalah Client Components (`"use client"`) karena menggunakan state & effects
- API routes menggunakan Next.js Route Handlers (App Router)
- Sidebar navigation menggunakan `usePathname()` untuk active state
- Bahasa UI: **Bahasa Indonesia**
- `date-fns` locale `id` digunakan untuk format tanggal Indonesia
