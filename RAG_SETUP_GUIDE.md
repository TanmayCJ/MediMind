# 🚀 RAG + Medical Model Setup Guide

## Overview

This guide will help you set up the full **RAG (Retrieval-Augmented Generation) + Medical Model** pipeline using **100% free tools**:
- ✅ **Gemini API** for embeddings + summarization (Free tier: 60 req/min)
- ✅ **HuggingFace** for medical domain insights (Free tier: 30k tokens/month)
- ✅ **Supabase** for vector storage (Free tier: 500MB)

---

## 📋 Prerequisites

1. ✅ **Supabase Account** - [Sign up](https://supabase.com)
2. ✅ **Google AI Studio API Key** - [Get it here](https://aistudio.google.com/apikey)
3. ✅ **HuggingFace Account** (Optional but recommended) - [Sign up](https://huggingface.co/join)

---

## 🔧 Step 1: Get Your API Keys

### Gemini API Key (Required)
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Get API Key"**
3. Copy your API key
4. **Free Tier**: 60 requests/minute, 1500 requests/day

### HuggingFace API Token (Optional but Recommended)
1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Name it "MedMind AI"
4. Select **"Read"** permission
5. Copy your token
6. **Free Tier**: 30,000 tokens/month

---

## 🗄️ Step 2: Set Up Supabase Secrets

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `HUGGINGFACE_API_KEY` | Your HuggingFace token | ⚠️ Optional |

4. Click **"Save"**

### Option B: Using Supabase CLI

```bash
# Set Gemini API key (REQUIRED)
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Set HuggingFace API key (OPTIONAL)
npx supabase secrets set HUGGINGFACE_API_KEY=your_huggingface_token_here
```

---

## 📊 Step 3: Deploy Updated Edge Functions

Deploy the updated functions with RAG support:

```bash
# Deploy process-document (for chunking & embeddings)
npx supabase functions deploy process-document

# Deploy generate-summary-new (for AI analysis with RAG)
npx supabase functions deploy generate-summary-new
```

Verify deployment:
```bash
npx supabase functions list
```

You should see:
- ✅ `process-document` - Status: Active
- ✅ `generate-summary-new` - Status: Active

---

## 🧪 Step 4: Test the Pipeline

### Test 1: Verify Gemini API
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-summary-new \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reportId": "test-report-id"}'
```

**Expected Result**: Should return AI summary (even without RAG, Gemini works)

### Test 2: Verify RAG Pipeline
1. Start your development server: `npm run dev`
2. Sign in to your account
3. Upload a test medical report
4. Watch the console for these logs:
   ```
   ✅ Document processed: { rag_enabled: true, chunks_processed: 5 }
   🚀 RAG ENABLED: Using Gemini vector embeddings
   ✅ Retrieved context length: 1234
   ```

### Test 3: Verify HuggingFace Integration
Check your browser console after uploading a report:
```
🤖 Calling HuggingFace BiomedNLP model for medical insights...
✅ Medical insights obtained from HuggingFace model
```

---

## 🎯 What Each Component Does

### 1. **process-document** Function
- **Purpose**: Chunks uploaded reports and generates embeddings
- **Input**: `reportId`
- **Process**:
  1. Downloads report from Supabase Storage
  2. Splits text into chunks (1000 chars, 200 char overlap)
  3. Generates embeddings using Gemini `text-embedding-004`
  4. Stores in `report_chunks` table with pgvector
- **Output**: `{ rag_enabled: true, chunks_processed: N }`

### 2. **generate-summary-new** Function
- **Purpose**: Generates AI summary with RAG + Medical Model
- **Input**: `reportId`
- **Process**:
  1. Downloads report content
  2. **RAG**: Searches similar chunks using vector similarity
  3. **HuggingFace**: Gets medical domain insights
  4. **Gemini**: Generates summary with all context
- **Output**: Structured summary with findings + reasoning + recommendations

### 3. **Frontend UI**
- **Upload**: Calls both `process-document` AND `generate-summary-new`
- **Summary Viewer**: Shows 3 tabs:
  - Key Findings
  - **Chain-of-Thought Reasoning** (NEW!)
  - Recommendations

---

## 🔍 Troubleshooting

### Issue: "RAG DISABLED: No Gemini API key"
**Solution**: Set `GEMINI_API_KEY` in Supabase secrets (see Step 2)

### Issue: "HuggingFace DISABLED: No API key"
**Solution**: This is optional! App works without it. To enable:
1. Get token from HuggingFace
2. Set `HUGGINGFACE_API_KEY` in Supabase secrets

### Issue: "Error inserting chunk"
**Solution**: Check if `report_chunks` table exists:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM report_chunks LIMIT 1;
```

If table doesn't exist, run the migration:
```bash
npx supabase db push
```

### Issue: "search_similar_chunks does not exist"
**Solution**: Run the vector storage migration:
```sql
-- Create the RPC function for similarity search
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_report_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  report_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    report_chunks.id,
    report_chunks.report_id,
    report_chunks.content,
    1 - (report_chunks.embedding <=> query_embedding) as similarity
  FROM report_chunks
  WHERE (filter_report_id IS NULL OR report_chunks.report_id = filter_report_id)
    AND 1 - (report_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY report_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 📈 Free Tier Limits

| Service | Free Tier Limit | What Happens When Exceeded |
|---------|----------------|---------------------------|
| **Gemini API** | 60 req/min, 1500/day | Rate limited for 60 seconds |
| **HuggingFace** | 30k tokens/month | App continues without medical insights |
| **Supabase DB** | 500MB storage | Need to upgrade plan |
| **Supabase Functions** | 500k invocations/month | Very unlikely to hit |

---

## 🎓 Optional: Train Custom Medical Model

Want even better results? Train your own model on medical data!

### Using Google Colab (Free GPU)

1. **Get a medical dataset**:
   - [MIMIC-III](https://physionet.org/content/mimiciii/) - ICU patient records
   - [PubMed Central](https://www.ncbi.nlm.nih.gov/pmc/) - Medical literature
   - [IU X-Ray](https://openi.nlm.nih.gov/) - Radiology reports

2. **Create a Colab notebook**:
   ```python
   !pip install transformers datasets accelerate
   
   from transformers import AutoModelForSequenceClassification, AutoTokenizer
   
   # Load pre-trained medical model
   model_name = "microsoft/BiomedNLP-PubMedBERT-base"
   model = AutoModelForSequenceClassification.from_pretrained(model_name)
   tokenizer = AutoTokenizer.from_pretrained(model_name)
   
   # Fine-tune on your medical dataset
   # ... (training code)
   
   # Push to HuggingFace Hub
   model.push_to_hub("your-username/medical-report-analyzer")
   ```

3. **Update the function** to use your model:
   ```typescript
   // In generate-summary/index.ts
   const response = await fetch(
     "https://api-inference.huggingface.co/models/your-username/medical-report-analyzer",
     // ... rest of code
   );
   ```

---

## ✅ Success Checklist

- [ ] Gemini API key set in Supabase secrets
- [ ] HuggingFace API key set (optional)
- [ ] Both edge functions deployed successfully
- [ ] Uploaded test report and saw RAG logs
- [ ] Summary shows in 3 tabs (Findings, Reasoning, Recommendations)
- [ ] "View Original File" button works
- [ ] History page shows all past reports

---

## 🎉 What You've Built

You now have a **production-ready medical AI assistant** with:
✅ **RAG** - Retrieves context from similar past reports
✅ **Chain-of-Thought** - Shows AI's reasoning process
✅ **Medical Model** - Domain-specific insights from BiomedNLP
✅ **100% Free** - Using only free-tier services
✅ **Scalable** - Ready for real-world use

**Cost: $0/month** 💰

---

## 📚 Next Steps

1. **Add more medical models**: Try `allenai/biomed_roberta_base` or `dmis-lab/biobert-base-cased-v1.1`
2. **Fine-tune on your data**: Create a custom model for your specialty
3. **Improve prompts**: Customize the AI instructions for specific report types
4. **Add analytics**: Track which insights are most helpful
5. **Deploy to production**: Use Vercel/Netlify for hosting

---

## 🆘 Need Help?

- **GitHub Issues**: [Open an issue](https://github.com/TanmayCJ/med-mind-ai-core/issues)
- **Supabase Discord**: [Join here](https://discord.supabase.com)
- **Google AI Forum**: [Ask questions](https://developers.googleblog.com/google-ai/)

---

**Built with ❤️ using 100% free tools**
