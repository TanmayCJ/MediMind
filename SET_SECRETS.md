# Setting Supabase Secrets

## Required API Keys

Your edge functions need these API keys to work:

### 1. GEMINI_API_KEY (Required)
- Get from: https://aistudio.google.com/apikey
- Used for: AI summaries + RAG embeddings (FREE!)

### 2. HUGGINGFACE_API_KEY (Optional but recommended)
- Get from: https://huggingface.co/settings/tokens
- Used for: Medical domain insights from BiomedNLP model (FREE tier: 30k tokens/month)

## How to Set Secrets

### Option A: Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/dxbkxoihwihjxptplbyn/settings/functions
2. Scroll to **"Edge Function Secrets"** section
3. Click **"Add new secret"** button
4. Enter:
   - Name: `GEMINI_API_KEY`
   - Value: [Your Gemini API key]
5. Click **"Save"**
6. (Optional) Repeat for `HUGGINGFACE_API_KEY`

### Option B: Supabase CLI

If Supabase CLI is installed, run:

```powershell
# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here

# (Optional) Set HuggingFace API key
supabase secrets set HUGGINGFACE_API_KEY=your-huggingface-token-here
```

## After Setting Secrets

The edge functions will automatically use these secrets. No need to redeploy!

Just try uploading a report again and it should work.

## Verification

After setting the secrets, you can verify they're set by:
1. Going to Supabase Dashboard > Settings > Edge Functions
2. You should see your secrets listed (values hidden for security)

---

**Note:** Secrets are stored securely in Supabase and are only accessible by your edge functions. They're never exposed to the frontend.
