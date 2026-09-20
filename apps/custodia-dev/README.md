# 🛠️ Custodia de Herramientas - Zona Franca Barranquilla

Sistema PWA para control de entrada/salida de herramientas y equipos de contratistas.

## Tech Stack
- **Next.js 15** + React 19 + TypeScript + Tailwind CSS
- **Prisma 6.3** + PostgreSQL 16
- **Auth.js v5** + Keycloak (realm: zfb)
- **Cloudflare R2** (storage)
- **Gotenberg** (PDF generation)
- **PWA** + Dexie (offline support)

## Quick Start

### 1. Setup Database
```bash
docker-compose up -d postgres gotenberg
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Setup Prisma
```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Git Workflow
```bash
git init
git add .
git commit -m "Fase 1b: Estructura base de custodia-herramientas"
git remote add origin https://github.com/enusa71/app-custodia-herramientas.git
git push -u origin main
git tag fase-1b
git push origin fase-1b
```

## Project Structure
```
app-custodia-herramientas/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities, business logic
│   └── types/        # TypeScript types
├── prisma/           # Database schema & migrations
├── docker/           # Docker build files
├── deploy/           # Production deployment configs
└── storage/          # Local file storage (development)
```

## Documentation
See [CLAUDE.md](./CLAUDE.md) for detailed project information.
