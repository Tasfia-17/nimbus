# API Keys Setup Guide

## Required API Keys

### 1. Together AI API Key (REQUIRED)
**What it's for:** LLM inference for agent intelligence

**How to get it:**
1. Go to https://api.together.xyz/
2. Sign up for an account (free tier available)
3. Navigate to "API Keys" section in dashboard
4. Click "Create new API key"
5. Copy the key (starts with something like `abc123...`)

**Cost:** Free tier includes credits, then pay-as-you-go
**Priority:** HIGH - Core functionality


### 2. Kestra API (REQUIRED)
**What it's for:** Workflow orchestration engine

**How to get it:**
There are two options:

#### Option A: Self-Hosted (Recommended for development)
```bash
# Using Docker
docker run --pull=always --rm -it -p 8080:8080 kestra/kestra:latest server local
```
Then:
- KESTRA_API_URL=`http://localhost:8080`
- KESTRA_API_KEY=`` (leave empty for local)

#### Option B: Kestra Cloud
1. Go to https://cloud.kestra.io/
2. Sign up for an account
3. Create a new workspace
4. Go to Settings → API Keys
5. Generate new API key
6. Copy your instance URL (e.g., `https://your-workspace.kestra.io`)

**Cost:** Free for local, Cloud has free tier
**Priority:** HIGH - Core functionality


### 3. GitHub Personal Access Token (OPTIONAL)
**What it's for:** GitHub integration tools (create issues, PRs, etc.)

**How to get it:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Agent Platform")
4. Select scopes:
   - `repo` (full control of repositories)
   - `read:org` (read org data)
   - `write:discussion` (write discussions)
5. Click "Generate token"
6. Copy the token immediately (starts with `ghp_...`)

**Cost:** Free
**Priority:** MEDIUM - Only needed for GitHub tools


### 4. Cline API Key (OPTIONAL)
**What it's for:** Code generation and analysis

**Note:** Cline is primarily a CLI tool. If you're using it via CLI:
- CLINE_API_KEY can be left empty
- We'll execute it via shell commands

If Cline has an API service, provide those details.

**Priority:** LOW - Optional feature


### 5. NextAuth Secret (AUTO-GENERATED)
**What it's for:** Authentication security

**How to generate:**
```bash
openssl rand -base64 32
```

Or use this online: https://generate-secret.vercel.app/32

**Priority:** MEDIUM - Needed if adding authentication


## Quick Start Configuration

### Minimal Setup (to get started):
```env
DATABASE_URL="your_existing_postgres_url"
TOGETHER_API_KEY="your_together_ai_key"
KESTRA_API_URL="http://localhost:8080"
KESTRA_API_KEY=""
```

### Full Production Setup:
```env
DATABASE_URL="your_postgres_url"
KESTRA_API_URL="https://your-workspace.kestra.io"
KESTRA_API_KEY="your_kestra_key"
TOGETHER_API_KEY="your_together_ai_key"
GITHUB_TOKEN="ghp_your_github_token"
CLINE_API_KEY=""
NEXTAUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Testing Your Keys

Once you've added your keys, test them with:

```bash
# Test Together AI
curl -X POST https://api.together.xyz/v1/models \
  -H "Authorization: Bearer $TOGETHER_API_KEY"

# Test Kestra (if using cloud)
curl $KESTRA_API_URL/api/v1/flows \
  -H "Authorization: Bearer $KESTRA_API_KEY"
```

## Cost Estimates

- **Together AI:** ~$0.60 per 1M tokens (Llama 3.1 405B)
- **Kestra:** Free for self-hosted, Cloud starts at $0
- **GitHub:** Free
- **Database (Vercel Postgres):** Free tier available

## Next Steps

1. Start with Together AI + local Kestra (easiest to get running)
2. Add GitHub token if you want GitHub integration
3. Upgrade to Kestra Cloud when ready for production

---

**Need Help?** Check the main README or documentation for troubleshooting.
