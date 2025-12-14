# 🚀 Quick Start Guide

## Start the Platform in 3 Steps

### Step 1: Make the script executable
```bash
cd /home/rifa/Desktop/agent-platform
chmod +x scripts/start-platform.sh
```

### Step 2: Start all services
```bash
./scripts/start-platform.sh
```

This automatically:
- ✅ Starts Kestra in Docker (port 8080)
- ✅ Waits for Kestra to be ready
- ✅ Installs dependencies if needed
- ✅ Generates Prisma client
- ✅ Starts Next.js dev server (port 3000)

### Step 3: Open the platform
- **Dashboard**: http://localhost:3000/dashboard
- **Create Agent**: http://localhost:3000/agents/new
- **Kestra UI**: http://localhost:8080

## Alternative: Manual Start

If you prefer step-by-step control:

```bash
# Terminal 1: Start Kestra
docker run -d --name kestra --rm -p 8080:8080 kestra/kestra:latest server local

# Wait 30 seconds for Kestra to start, then...

# Terminal 2: Start Next.js
cd /home/rifa/Desktop/agent-platform
npm run dev
```

## Verify Everything Works

### 1. Check Kestra
```bash
curl http://localhost:8080/api/v1/flows
```
Should return: `[]` (empty array of flows)

### 2. Check Database
```bash
npx prisma studio
```
Opens Prisma Studio at http://localhost:5555

### 3. Check API
```bash
curl http://localhost:3000/api/agents
```
Should return: `{"agents":[]}`

## Create Your First Agent via API

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hello World Agent",
    "description": "My first agent",
    "instructions": "You are a helpful assistant that greets users.",
    "model": "meta-llama/llama-3.1-405b-instruct",
    "triggers": [],
    "tools": []
  }'
```

## Next Steps

### Build the UI (Priority Order)

1. **Dashboard** (`/src/app/dashboard/page.tsx`)
   - Copy design from Retool screenshots
   - Show agent stats and list
   - Add create button

2. **Agent Config** (`/src/app/agents/new/page.tsx`)
   - Multi-step form
   - Trigger selector
   - Tool selector
   - Configuration assistant sidebar

3. **Live Monitor** (`/components/agents/LiveMonitor.tsx`)
   - Real-time log streaming
   - Visual workflow diagram
   - Progress tracking

### UI Component Libraries to Use

```bash
# Shadcn UI (recommended)
npx shadcn-ui@latest init

# Or Headless UI + Heroicons
npm install @headlessui/react @heroicons/react
```

## Environment Variables Summary

All configured in `.env.local`:

| Variable | Value | Status |
|----------|-------|--------|
| DATABASE_URL | Vercel Postgres | ✅ Configured |
| OPENROUTER_API_KEY | sk-or-v1-... | ✅ Configured |
| SAMBANOVA_API_KEY | ccde74e0-... | ✅ Configured |
| GITHUB_TOKEN | github_pat_... | ✅ Configured |
| KESTRA_API_URL | http://localhost:8080 | ✅ Configured |

## Troubleshooting

### Port 8080 already in use
```bash
docker rm -f kestra
# Then restart with the script
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
# Or kill the process using port 3000
```

### Prisma client errors
```bash
npx prisma generate
```

### Database not in sync
```bash
DATABASE_URL="your_url" npx prisma db push
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/llm.ts` | LLM integration (OpenRouter/SambaNova) |
| `lib/kestra.ts` | Workflow orchestration |
| `lib/tools/executor.ts` | Tool execution engine |
| `lib/db.ts` | Database client with helpers |
| `prisma/schema.prisma` | Database schema |
| `src/app/api/agents/route.ts` | Agent CRUD API |

## What Works Right Now

✅ **Backend**: Fully functional
- Create agents via API
- LLM integration ready
- Kestra workflow generation
- Tool execution system
- Database operations

❌ **Frontend**: Needs implementation
- Dashboard UI (placeholder)
- Agent configuration UI (placeholder)
- Live monitoring (not built)

## Development Tips

1. **Use Prisma Studio** for database inspection:
   ```bash
   npx prisma studio
   ```

2. **Test LLM directly**:
   ```typescript
   import { LLMClient } from './lib/llm';
   const client = new LLMClient('openrouter');
   const response = await client.chat([
     { role: 'user', content: 'Hello!' }
   ]);
   ```

3. **Test Kestra**:
   Visit http://localhost:8080 and explore the UI

4. **Hot reload**: Next.js will auto-reload on file changes

## Ready to Build!

Your backend is production-ready. Focus on building the Retool-style UI components using the screenshots as reference. The API is waiting for your beautiful frontend! 🎨
