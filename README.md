<div align="center">

# 🏥 MediMind AI

### AI-Powered Medical Report Analysis with RAG & Vector Embeddings

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**An intelligent medical report summarization system leveraging Machine Learning through vector embeddings, RAG (Retrieval-Augmented Generation), and medical-domain pre-trained models.**

🌐 **[Live Demo](https://medimind-alpha.web.app)** | 📚 [Documentation](#-documentation) | 🚀 [Getting Started](#-getting-started)

---

</div>

## 📋 Overview

**MediMind AI** transforms complex medical diagnostic reports into actionable insights using cutting-edge Machine Learning techniques. This production-ready system leverages **pre-trained transformer neural networks** for text vectorization, semantic search, and intelligent summarization.

### � Live Application

**🔗 Access the platform:** [https://medimind-alpha.web.app](https://medimind-alpha.web.app)

- ✅ **24/7 Availability** - Hosted on Firebase with global CDN
- ✅ **HTTPS Secured** - Automatic SSL certificates
- ✅ **Real-time Processing** - Instant AI analysis
- ✅ **Mobile Responsive** - Works on all devices

### �🎯 Key Capabilities

- 📄 **Upload & Process**: Medical reports (radiology, pathology, MRI, CT scans, lab reports)
- 🧠 **RAG Pipeline**: Vector embeddings + semantic similarity search
- 🤖 **Medical AI**: Domain-specific insights from BiomedNLP-PubMedBERT
- 🔍 **Chain-of-Thought**: Transparent, step-by-step AI reasoning
- 📊 **Structured Output**: Key findings, clinical reasoning, recommendations
- 📑 **Professional PDFs**: Medical-grade report generation
- 🔐 **HIPAA-Ready**: Secure authentication and encrypted storage
- 💾 **History Tracking**: Complete audit trail of all analyses

---

## 🧬 Machine Learning Architecture

### The Core ML Concept: **Vectorization IS the Machine Learning**

**What is Vectorization?**
Vectorization is the process of converting text into high-dimensional numerical vectors (arrays of numbers) using **neural networks**. These vectors capture the semantic meaning of text, enabling computers to understand context, similarity, and relationships between documents.

**Why This IS Machine Learning:**
- Uses **transformer neural networks** (same architecture as ChatGPT, BERT)
- Trained on billions of documents to learn language patterns
- Maps similar concepts to nearby points in vector space
- Enables semantic search (meaning-based, not keyword-based)

### 🎯 Three Pre-Trained ML Models Used

#### 1. **Google Gemini text-embedding-004** (Vectorization Engine)

**What it does:**
- Converts medical text → 768-dimensional vectors
- Pre-trained transformer neural network by Google
- Captures semantic meaning in mathematical form

**Example:**
```
Input Text: "Patient shows signs of pneumonia with bilateral infiltrates"
Output Vector: [0.234, -0.456, 0.789, ..., 0.123]  (768 numbers)
             ↓
   These numbers represent the "meaning" of the text in vector space
```

**How it works:**
```typescript
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  // Calls Google's pre-trained transformer model
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
    { body: { content: { parts: [{ text }] } } }
  );
  
  // Returns 768-dimensional vector
  return response.embedding.values; // [0.23, -0.45, ..., 0.12]
}
```

#### 2. **Microsoft BiomedNLP-PubMedBERT** (Medical Domain Expert)

**What it does:**
- Pre-trained BERT model on **15 million PubMed medical abstracts**
- Understands medical terminology, diseases, treatments
- Provides domain-specific insights

**Training Data:**
- 15M+ biomedical research papers
- Medical vocabulary, clinical concepts, drug interactions
- Disease relationships and treatment patterns

**How it works:**
```typescript
async function getMedicalInsights(text: string): Promise<any> {
  // Calls HuggingFace's hosted BiomedNLP model
  const response = await fetch(
    'https://api-inference.huggingface.co/models/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract',
    { body: { inputs: text } }
  );
  return response.json(); // Medical domain insights
}
```

#### 3. **Google Gemini 2.0 Flash** (Text Generation)

**What it does:**
- Large Language Model (LLM) for summary generation
- Combines RAG context + medical insights into coherent text
- Generates structured findings and recommendations

---

## � The Complete RAG Pipeline

### Step 1: Document Processing & Vectorization

When a medical report is uploaded:

```typescript
// 1. CHUNK the document into smaller pieces
const chunks = chunkText(reportText, {
  chunkSize: 1000,     // 1000 characters per chunk
  overlap: 200          // 200 character overlap for context
});

// 2. VECTORIZE each chunk using ML model
for (const chunk of chunks) {
  const embedding = await generateGeminiEmbedding(chunk.content);
  // embedding = [0.23, -0.45, 0.89, ..., 0.12] (768 dimensions)
  
  // 3. STORE vector in database with pgvector extension
  await supabase.from('report_chunks').insert({
    report_id: reportId,
    content: chunk.content,
    embedding: embedding,  // ← Vector stored here!
    chunk_index: chunk.index
  });
}
```

**What happens in the database:**

```sql
-- PostgreSQL with pgvector extension
CREATE TABLE report_chunks (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  content TEXT,
  embedding vector(768),  -- ← Stores 768-dimensional ML vectors
  chunk_index INTEGER,
  created_at TIMESTAMPTZ
);

-- Vector similarity search index (IVFFlat algorithm)
CREATE INDEX ON report_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Step 2: Retrieval-Augmented Generation (RAG)

When generating a summary:

```typescript
// 1. VECTORIZE the search query using same ML model
const queryEmbedding = await generateGeminiEmbedding(
  "What are the key medical findings?"
);
// queryEmbedding = [0.12, 0.34, ..., 0.56] (768 dimensions)

// 2. SEMANTIC SEARCH: Find similar chunks using vector math
const { data: similarChunks } = await supabase.rpc('search_similar_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,  // 70% similarity required
  match_count: 5         // Return top 5 most similar chunks
});

// This SQL function computes COSINE SIMILARITY between vectors:
// similarity = 1 - (query_vector <=> chunk_vector)
// Chunks with similar meanings have high similarity scores
```

**Vector Similarity Math:**
```
Query Vector:    [0.5, 0.3, -0.2, ...]
Chunk 1 Vector:  [0.4, 0.3, -0.1, ...]  → Similarity: 0.92 ✅ (Very similar)
Chunk 2 Vector:  [-0.5, 0.1, 0.8, ...] → Similarity: 0.31 ❌ (Not similar)
```

### Step 3: Medical Insights Enhancement

```typescript
// 3. GET MEDICAL INSIGHTS from domain-specific model
const medicalInsights = await getMedicalInsights(reportText);
// Uses BiomedNLP-PubMedBERT trained on 15M medical papers
```

### Step 4: Augmented AI Generation

```typescript
// 4. COMBINE all context into enriched prompt
const prompt = `
You are a medical AI assistant analyzing diagnostic reports.

RETRIEVED CONTEXT (from vector similarity search):
${similarChunks.map(c => `[Similarity: ${c.similarity}] ${c.content}`).join('\n\n')}

MEDICAL DOMAIN INSIGHTS (from BiomedNLP model):
${JSON.stringify(medicalInsights, null, 2)}

ORIGINAL REPORT:
${reportText}

Provide a structured medical summary with:
1. Key Findings
2. Step-by-Step Reasoning
3. Clinical Recommendations
`;

// 5. GENERATE final summary using Gemini 2.0
const summary = await gemini.generateContent(prompt);
```

---

## 📊 Why This Approach IS Machine Learning

### Traditional ML (Training Required)
```
Collect data → Label data → Train model → Validate → Deploy
         ↓
   Requires: GPUs, weeks of training, labeled datasets
```

### Our Approach (Transfer Learning / Inference)
```
Use pre-trained models → Fine-tune with prompts → Inference
         ↓
   Requires: API keys, no training needed!
```

### What Makes This ML:

1. **Neural Networks**: Using transformer architectures (BERT, GPT-style models)
2. **Embeddings**: Converting text to vectors using learned representations
3. **Semantic Understanding**: Models learned from billions of documents
4. **Transfer Learning**: Applying Google/Microsoft's trained models to medical domain
5. **Vector Similarity**: Mathematical operations in high-dimensional space

### The ML Pipeline Visualized

```
📄 Medical Report: "Patient has pneumonia with bilateral lung infiltrates"
           ↓
[Gemini Embedding Model] ← Pre-trained by Google on billions of texts
           ↓
    [0.23, -0.45, 0.89, 0.12, ..., 0.67]  (768 dimensions)
           ↓
💾 PostgreSQL + pgvector (stores ML vectors)
           ↓
🔍 When generating summary:
    Query: "What are the findings?"
    Query Vector: [0.21, -0.43, 0.91, ...]
           ↓
    Cosine Similarity Search (vector math):
    similarity(query_vec, chunk_vec) > 0.7
           ↓
📊 Retrieved Context + Medical Insights
           ↓
🤖 Gemini 2.0 Flash (LLM combines everything)
           ↓
📋 Structured Medical Summary with reasoning
```

---

## 🛠️ Tech Stack



## 📋 Overview## 🚀 Quick Start



---

## 🛠️ Tech Stack

### Machine Learning & AI
- **[Google Gemini text-embedding-004](https://ai.google.dev/)** - 768-dimensional transformer embeddings
- **[Microsoft BiomedNLP-PubMedBERT](https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract)** - Medical domain BERT model
- **[Google Gemini 2.0 Flash](https://ai.google.dev/)** - Large Language Model for generation
- **[PostgreSQL pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search extension

### Frontend
- **[React 18](https://reactjs.org/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and HMR
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Backend
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security
  - Authentication & authorization
  - File storage with S3-compatible API
  - Edge Functions (Deno runtime)
  - Real-time subscriptions
  - Vector database with pgvector

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript Strict Mode** - Enhanced type safety

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **RAG Pipeline**: Retrieves relevant context from vector database
- **Medical Insights**: BiomedNLP model trained on 15M medical papers
- **Chain-of-Thought**: Transparent step-by-step reasoning
- **Structured Output**: Key findings, reasoning, recommendations, full summary

### 📄 Report Management
- **Multi-Format Support**: PDF and text files
- **Secure Storage**: Encrypted Supabase storage
- **Document Chunking**: Intelligent text splitting with overlap
- **Vector Search**: Semantic similarity search for relevant context
- **Complete History**: Track all analyzed reports

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive design with shadcn/ui
- **Real-time Updates**: Live status tracking during analysis
- **Dark Mode**: Professional clinical environment theme
- **Mobile Responsive**: Access from any device
- **Intuitive Navigation**: Clean dashboard layout

### 🔐 Security & Privacy
- **Supabase Auth**: Email/password authentication
- **Row Level Security**: Database-level access control
- **Encrypted Storage**: Files encrypted at rest
- **Session Management**: Secure JWT token handling
- **HIPAA-Ready Architecture**: Privacy-first design

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** or **Bun** installed
- A **Supabase account** ([Sign up free](https://supabase.com))
- A **Google AI API key** ([Get one here](https://aistudio.google.com/apikey))
- *Optional*: **HuggingFace API token** ([Get one here](https://huggingface.co/settings/tokens))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanmayCJ/med-mind-ai-core.git
   cd med-mind-ai-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run the complete database setup
   # Open Supabase SQL Editor and run: supabase/COMPLETE_SETUP.sql
   ```

5. **Deploy Edge Functions**

   ```bash
   # Deploy process-document function (document chunking + vectorization)
   supabase functions deploy process-document
   
   # Deploy generate-summary function (RAG + AI generation)
   supabase functions deploy generate-summary
   
   # Set API key secrets
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   supabase secrets set HUGGINGFACE_API_KEY=your_hf_token  # Optional
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:8080](http://localhost:8080)

### Build for Production

```bash
npm run build
npm run preview
```

### 🚀 Deploy to Firebase Hosting

**MediMind AI is deployed on Firebase Hosting for 24/7 availability with global CDN.**

#### Prerequisites
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### Initial Setup

1. **Initialize Firebase in your project:**
   ```bash
   firebase init hosting
   ```

2. **Configuration Files Created:**

   `.firebaserc` - Links your project to Firebase:
   ```json
   {
     "projects": {
       "default": "gen-lang-client-0593072998"
     }
   }
   ```

   `firebase.json` - Hosting configuration:
   ```json
   {
     "hosting": {
       "site": "medimind-alpha",
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

#### Deploy Process

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting

# 3. Access your live site
# https://medimind-alpha.web.app
```

#### Custom Site Setup (Optional)

Create a custom Firebase hosting site with a better URL:

```bash
# Create a new hosting site
firebase hosting:sites:create medimind-alpha

# Update firebase.json to use the new site
# Add "site": "medimind-alpha" to the hosting config

# Deploy to the custom site
firebase deploy --only hosting
```

#### Firebase Hosting Features

✅ **Global CDN** - Fast loading worldwide  
✅ **Auto SSL** - HTTPS certificates included  
✅ **Zero Downtime** - Rolling deployments  
✅ **Instant Rollback** - Revert to previous versions  
✅ **Custom Domains** - Connect your own domain  
✅ **Atomic Deployments** - All-or-nothing updates

#### Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy with custom message
firebase deploy -m "Updated PDF generation"

# Preview changes before deploying
firebase hosting:channel:deploy preview

# Check deployment history
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION TARGET_SITE_ID
```

#### Update Supabase Site URL

**Important:** After deploying, update your Supabase project settings:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://medimind-alpha.web.app`
3. Add **Redirect URLs**:
   - `https://medimind-alpha.web.app/**`
   - `https://medimind-alpha.web.app/auth/callback`
   - `https://medimind-alpha.web.app/dashboard`

This ensures email verification links point to your production URL, not localhost.

#### Continuous Deployment

For automated deployments, set up GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: gen-lang-client-0593072998
```

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (React + TypeScript)                  │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Upload    │  │  Dashboard  │  │    Summary Viewer       │  │
│  │  Report    │  │             │  │  [4 Tabs: Findings,     │  │
│  │            │  │             │  │   Reasoning, Recs,      │  │
│  │            │  │             │  │   Full Summary]         │  │
│  └────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Supabase Client
┌────────────────────────────┴────────────────────────────────────┐
│                       Supabase Backend                           │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   PostgreSQL    │  │   Storage    │  │  Edge Functions   │  │
│  │   + pgvector    │  │  (Reports)   │  │  (Deno Runtime)   │  │
│  │                 │  │              │  │                   │  │
│  │  • reports      │  │  medical-    │  │  • process-       │  │
│  │  • summaries    │  │   reports/   │  │    document       │  │
│  │  • report_chunks│  │              │  │  • generate-      │  │
│  │    [vectors]    │  │              │  │    summary        │  │
│  └─────────────────┘  └──────────────┘  └───────┬───────────┘  │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                         ┌──────────────────────────┴──────┐
                         │      External AI APIs           │
                         │  ┌──────────────────────────┐   │
                         │  │ Google Gemini API        │   │
                         │  │  • text-embedding-004    │   │
                         │  │  • gemini-2.0-flash-exp  │   │
                         │  └──────────────────────────┘   │
                         │  ┌──────────────────────────┐   │
                         │  │ HuggingFace API          │   │
                         │  │  • BiomedNLP-PubMedBERT  │   │
                         │  └──────────────────────────┘   │
                         └─────────────────────────────────┘
```

### Data Flow: Upload → Processing → Vectorization

```
1. User uploads medical report (PDF/TXT)
          ↓
2. File stored in Supabase Storage
          ↓
3. Metadata saved in `reports` table
          ↓
4. process-document Edge Function triggered
          ↓
5. Document chunked (1000 chars, 200 overlap)
          ↓
6. Each chunk vectorized using Gemini embeddings
   Text → [0.23, -0.45, ..., 0.12] (768 dimensions)
          ↓
7. Vectors stored in `report_chunks` table with pgvector
          ↓
8. Report status updated to "processing"
```

### Data Flow: Summary Generation with RAG

```
1. User clicks "Generate Summary" or auto-triggered
          ↓
2. generate-summary Edge Function called
          ↓
3. Query vectorized: "What are the key findings?"
   Query → [0.12, 0.34, ..., 0.56] (768 dimensions)
          ↓
4. Vector similarity search in report_chunks
   Finds top 5 most similar chunks (cosine similarity > 0.7)
          ↓
5. Retrieved context chunks combined
          ↓
6. [Optional] Medical insights from BiomedNLP model
          ↓
7. Augmented prompt created:
   - Retrieved context (RAG)
   - Medical insights
   - Original report
          ↓
8. Sent to Gemini 2.0 Flash for generation
          ↓
9. Response parsed into structured format:
   - key_findings: string[]
   - reasoning_steps: Record<string, string>
   - recommendations: string[]
   - full_summary: string
          ↓
10. Summary stored in `summaries` table
          ↓
11. Client UI updates with results (4 tabs)
```

### Database Schema

```sql
-- Enable pgvector extension for ML vector storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  patient_name TEXT NOT NULL,
  report_type report_type,
  file_url TEXT NOT NULL,
  status report_status DEFAULT 'uploaded',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summaries table (AI-generated analysis)
CREATE TABLE summaries (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id) UNIQUE,
  key_findings TEXT[],
  reasoning_steps JSONB,
  recommendations TEXT[],
  full_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report chunks table (vector embeddings for RAG)
CREATE TABLE report_chunks (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  chunk_index INTEGER,
  content TEXT,
  embedding vector(768),  -- ← ML vectors stored here!
  metadata JSONB,
  created_at TIMESTAMPTZ,
  UNIQUE(report_id, chunk_index)
);

-- Vector similarity search function
CREATE FUNCTION search_similar_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
) RETURNS TABLE (...) AS $$
  -- Uses cosine similarity: 1 - (vec1 <=> vec2)
  -- Returns chunks with similarity > threshold
$$;

-- Vector index for fast similarity search
CREATE INDEX ON report_chunks 
USING ivfflat (embedding vector_cosine_ops);
```

---

## 📁 Project Structure

```
med-mind-ai-core/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Main layout wrapper
│   │   │   └── Sidebar.tsx            # Navigation sidebar
│   │   ├── providers/
│   │   │   └── LenisProvider.tsx      # Smooth scroll provider
│   │   └── ui/                        # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── tabs.tsx
│   │       └── ... (40+ components)
│   ├── config/
│   │   └── functions.ts               # Supabase function URLs
│   ├── hooks/
│   │   ├── use-mobile.tsx             # Responsive hook
│   │   └── use-toast.ts               # Toast notifications
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client setup
│   │       └── types.ts               # Database types
│   ├── lib/
│   │   ├── auth.tsx                   # Auth utilities
│   │   └── utils.ts                   # Helper functions
│   ├── pages/
│   │   ├── Auth.tsx                   # Login/Signup page
│   │   ├── Dashboard.tsx              # Main dashboard
│   │   ├── UploadReport.tsx           # Report upload interface
│   │   ├── SummaryViewer.tsx          # AI analysis viewer (4 tabs)
│   │   ├── History.tsx                # Past reports
│   │   └── Settings.tsx               # User settings
│   ├── App.tsx                        # Root component
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── supabase/
│   ├── functions/
│   │   ├── process-document/
│   │   │   └── index.ts               # Chunking + vectorization
│   │   └── generate-summary/
│   │       └── index.ts               # RAG + AI generation
│   ├── migrations/                    # Database migrations
│   └── COMPLETE_SETUP.sql             # Full database setup script
├── public/                            # Static assets
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── tailwind.config.ts                 # Tailwind config
├── vite.config.ts                     # Vite config
└── README.md                          # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### Supabase Secrets (Edge Functions)

Set these in your Supabase project:

```bash
# Required: Google Gemini API key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key

# Optional: HuggingFace API token (for BiomedNLP)
supabase secrets set HUGGINGFACE_API_KEY=your_hf_token
```

| Secret | Description | Required | Free Tier |
|--------|-------------|----------|-----------|
| `GEMINI_API_KEY` | Google AI API key for embeddings + generation | ✅ Yes | ✅ Yes |
| `HUGGINGFACE_API_KEY` | HuggingFace token for BiomedNLP model | ⚠️ Optional | ✅ Yes |

### Get API Keys

1. **Gemini API Key** (FREE):
   - Visit [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Click "Create API Key"
   - Copy the key

2. **HuggingFace Token** (FREE, Optional):
   - Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Select "Read" access
   - Copy the token

---

## 📚 Documentation

- **[RAG Setup Guide](./RAG_SETUP_GUIDE.md)** - Detailed RAG implementation guide
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What was built and why
- **[Complete Database Setup](./supabase/COMPLETE_SETUP.sql)** - SQL schema with comments

---### Prerequisites

- Node.js 18+ or Bun

### 🎯 Why MediMind AI?- Supabase account

- OpenAI API key

- **⚡ Save Time**: Analyze lengthy medical reports in seconds- Lovable AI API key

- **🎓 Enhanced Understanding**: Get clear, structured summaries of complex findings

- **🔍 Actionable Insights**: Receive prioritized recommendations based on clinical significance### Installation

- **🔒 Privacy-First**: Secure, HIPAA-compliant data handling with Supabase

- **📊 Historical Tracking**: Maintain a complete audit trail of all analyzed reports```sh

# Clone the repository

---git clone <YOUR_GIT_URL>



## ✨ Features# Navigate to project

cd med-mind-ai-core

### 🤖 AI-Powered Analysis

- **Smart Document Processing**: Automatically extracts and analyzes medical report content# Install dependencies

- **Google Gemini 2.0 Integration**: State-of-the-art language model for medical text understandingnpm install

- **Structured Output**: Organized key findings and clinical recommendations

- **Real-time Processing**: Get results within seconds of upload# Run development server

npm run dev

### 📄 Report Management```

- **Multi-Format Support**: Upload PDF and text files

- **Secure Storage**: Files stored securely in Supabase StorageVisit `http://localhost:8080`

- **Download Original Files**: Access uploaded reports anytime

- **Complete History**: Track all previously analyzed reports## Project info

- **Patient Information**: Associate reports with patient demographics

**URL**: https://lovable.dev/projects/c99efa47-ebc3-49a2-b702-9ac5c8aab646

### 🎨 User Experience

- **Modern UI**: Beautiful, responsive interface built with shadcn/ui## How can I edit this code?

- **Real-time Updates**: Live status tracking during analysis

- **Dark Mode Ready**: Professional design optimized for clinical environmentsThere are several ways of editing your application.

- **Mobile Responsive**: Access from any device

- **Intuitive Navigation**: Clean dashboard layout for quick access**Use Lovable**



### 🔐 Security & AuthenticationSimply visit the [Lovable Project](https://lovable.dev/projects/c99efa47-ebc3-49a2-b702-9ac5c8aab646) and start prompting.

- **Supabase Auth**: Secure email/password authentication

- **Role-Based Access**: Support for doctors, radiologists, and administratorsChanges made via Lovable will be committed automatically to this repo.

- **Protected Routes**: Automatic authentication checks on all sensitive pages

- **Session Management**: Persistent login sessions with secure token handling**Use your preferred IDE**



---If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.



## 🎬 DemoThe only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)



### Upload & AnalyzeFollow these steps:

```

1. Sign up or log in to your account```sh

2. Navigate to "Upload Report"# Step 1: Clone the repository using the project's Git URL.

3. Enter patient informationgit clone <YOUR_GIT_URL>

4. Upload medical report (PDF/TXT)

5. Click "Analyze Report"# Step 2: Navigate to the project directory.

6. View AI-generated summary with key findings and recommendationscd <YOUR_PROJECT_NAME>

```

# Step 3: Install the necessary dependencies.

### Dashboard Featuresnpm i

- **Quick Stats**: Overview of total reports analyzed

- **Recent Reports**: Quick access to latest analyses# Step 4: Start the development server with auto-reloading and an instant preview.

- **Search & Filter**: Find specific reports by patient or datenpm run dev

- **Export Data**: Download analysis results for records```



---**Edit a file directly in GitHub**



## 🛠️ Tech Stack- Navigate to the desired file(s).

- Click the "Edit" button (pencil icon) at the top right of the file view.

### Frontend- Make your changes and commit the changes.

- **[React 18](https://reactjs.org/)** - Modern UI library

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development**Use GitHub Codespaces**

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool

- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework- Navigate to the main page of your repository.

- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components- Click on the "Code" button (green button) near the top right.

- **[React Router](https://reactrouter.com/)** - Client-side routing- Select the "Codespaces" tab.

- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching- Click on "New codespace" to launch a new Codespace environment.

- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations- Edit files directly within the Codespace and commit and push your changes once you're done.

- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

## What technologies are used for this project?

### Backend

- **[Supabase](https://supabase.com/)** - Backend as a ServiceThis project is built with:

  - PostgreSQL database

  - Authentication & authorization- Vite

  - File storage- TypeScript

  - Edge Functions (Deno runtime)- React

- **[Google Gemini 2.0 Flash](https://ai.google.dev/)** - AI language model- shadcn-ui

- **Deno** - Secure runtime for edge functions- Tailwind CSS



### Development Tools## How can I deploy this project?

- **ESLint** - Code linting

- **PostCSS** - CSS processingSimply open [Lovable](https://lovable.dev/projects/c99efa47-ebc3-49a2-b702-9ac5c8aab646) and click on Share -> Publish.

- **TypeScript Strict Mode** - Enhanced type safety

## Can I connect a custom domain to my Lovable project?

---

Yes, you can!

## 🚀 Getting Started

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

### Prerequisites

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

Before you begin, ensure you have:
- **Node.js 18+** or **Bun** installed
- A **Supabase account** ([Sign up free](https://supabase.com))
- A **Google AI API key** ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanmayCJ/med-mind-ai-core.git
   cd med-mind-ai-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   Run the database migration:
   ```bash
   # Install Supabase CLI
   npx supabase init
   
   # Link to your project
   npx supabase link --project-ref your-project-ref
   
   # Push migrations
   npx supabase db push
   ```

5. **Deploy Edge Functions**

   ```bash
   # Deploy the generate-summary function
   npx supabase functions deploy generate-summary-new
   
   # Set the Gemini API key secret
   npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

6. **Configure Supabase Storage**

   In your Supabase dashboard:
   - Navigate to **Storage**
   - Create a bucket named `medical-reports`
   - Set bucket to **Private** (requires authentication)
   - Enable **File size limit**: 50MB

7. **Start the development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:8080](http://localhost:8080)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Upload    │  │   Dashboard  │  │  Summary Viewer  │   │
│  │   Report    │  │              │  │                  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    Supabase Client
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL   │  │   Storage    │  │  Edge Functions  │  │
│  │   Database   │  │  (Reports)   │  │  (Deno Runtime)  │  │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘  │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                         ┌───────┴────────┐
                                         │  Gemini 2.0    │
                                         │  Flash API     │
                                         └────────────────┘
```

### Data Flow

1. **User uploads report** → Stored in Supabase Storage
2. **Metadata saved** → PostgreSQL `medical_reports` table
3. **Edge function triggered** → Downloads file from storage
4. **Content extraction** → Reads file text content
5. **AI analysis** → Sends to Gemini API with structured prompt
6. **Parse response** → Extracts findings and recommendations
7. **Update database** → Saves AI summary
8. **Client update** → Real-time UI refresh with results

### Database Schema

```sql
-- Medical Reports Table
CREATE TABLE medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  patient_name TEXT NOT NULL,
  report_type TEXT,
  file_url TEXT NOT NULL,
  ai_summary JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT DEFAULT 'doctor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📁 Project Structure

```
med-mind-ai-core/
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Layout components (Sidebar, Dashboard)
│   │   ├── providers/      # Context providers
│   │   └── ui/            # shadcn/ui components
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Third-party integrations
│   │   └── supabase/      # Supabase client & types
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   ├── Auth.tsx      # Authentication page
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── UploadReport.tsx
│   │   ├── SummaryViewer.tsx
│   │   └── History.tsx
│   └── main.tsx          # Application entry point
├── supabase/
│   ├── functions/         # Edge functions
│   │   └── generate-summary/
│   │       └── index.ts   # AI analysis function
│   └── migrations/        # Database migrations
├── public/               # Static assets
└── package.json         # Dependencies
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ Yes |

### Supabase Secrets

Set these in your Supabase project:

```bash
npx supabase secrets set GEMINI_API_KEY=your_api_key_here
```

| Secret | Description | Required |
|--------|-------------|----------|
| `GEMINI_API_KEY` | Google AI API key for Gemini | ✅ Yes |

---

---

## 🧪 Testing

### Sample Medical Report

Use this Brain MRI report to test the system:

```
BRAIN MRI REPORT

Patient Name: John Doe
Patient ID: MR-2025-001
DOB: 01/15/1980
Exam Date: October 23, 2025
Ordering Physician: Dr. Sarah Johnson

CLINICAL INDICATION:
Patient presents with persistent headaches and episodes of dizziness over the past 3 months.
No history of trauma. Family history of neurological disorders.

TECHNIQUE:
MRI brain was performed without and with intravenous gadolinium contrast.
Multiplanar, multisequence imaging was obtained including:
- T1-weighted axial, sagittal, and coronal sequences
- T2-weighted axial and coronal sequences
- FLAIR sequences
- Diffusion-weighted imaging (DWI)
- Post-contrast T1-weighted sequences in multiple planes

FINDINGS:

Brain Parenchyma:
- A well-circumscribed mass measuring approximately 2.3 x 2.1 x 1.8 cm is identified
  in the right frontal lobe, centered at the gray-white matter junction
- The lesion demonstrates heterogeneous T1 and T2 signal characteristics
- Moderate perilesional vasogenic edema is present, extending into the surrounding
  white matter
- Mild mass effect on the frontal horn of the right lateral ventricle
- No significant midline shift (< 2mm)
- Enhancement pattern shows irregular rim enhancement with central necrosis

Ventricles and CSF Spaces:
- Lateral, third, and fourth ventricles are normal in size and configuration
- No evidence of hydrocephalus
- Basilar cisterns are patent

Extra-axial Spaces:
- No extra-axial fluid collections
- No abnormal meningeal enhancement

Vascular Structures:
- Circle of Willis demonstrates normal flow voids
- No evidence of aneurysm or vascular malformation
- Major dural venous sinuses are patent

Skull Base and Calvarium:
- Bone marrow signal is within normal limits
- No destructive osseous lesions
- Paranasal sinuses and mastoid air cells are clear

IMPRESSION:

1. RIGHT FRONTAL LOBE MASS (2.3 cm):
   - Imaging characteristics suggest high-grade glioma (WHO Grade III-IV)
   - Features concerning for glioblastoma multiforme including:
     * Irregular rim enhancement
     * Central necrosis
     * Perilesional edema
     * Gray-white matter junction location

2. MASS EFFECT:
   - Mild local mass effect on right lateral ventricle
   - No significant midline shift at this time
   - Close monitoring required for potential progression

3. NO ACUTE HEMORRHAGE OR INFARCTION

RECOMMENDATIONS:
1. Urgent neurosurgical consultation for biopsy and/or resection
2. Consider advanced imaging including MR spectroscopy and perfusion imaging
3. Multidisciplinary tumor board review
4. Baseline neurocognitive assessment
5. Short-interval follow-up MRI (2-4 weeks) if surgery delayed

CRITICAL FINDING:
This report was called to Dr. Sarah Johnson on 10/23/2025 at 14:30 hours.

Reported by: Dr. Michael Chen, MD
Board Certified Radiologist
Subspecialty: Neuroradiology
```

### Testing Checklist

- [ ] **Authentication**
  - [ ] Sign up with new email/password
  - [ ] Log in with existing credentials
  - [ ] Session persists after page refresh
  - [ ] Logout works correctly

- [ ] **Report Upload**
  - [ ] PDF file uploads successfully
  - [ ] Text file uploads successfully
  - [ ] Patient information is captured
  - [ ] Report appears in database
  - [ ] File is stored in Supabase Storage

- [ ] **Document Processing** (Edge Function)
  - [ ] Document is chunked correctly
  - [ ] Chunks are stored in report_chunks table
  - [ ] Embeddings are generated (768 dimensions)
  - [ ] Vectors are stored in database
  - [ ] Check Supabase logs for "RAG ENABLED" message

- [ ] **Summary Generation** (RAG Pipeline)
  - [ ] Summary generation completes without errors
  - [ ] Vector similarity search retrieves context
  - [ ] Medical insights from BiomedNLP (if API key set)
  - [ ] Structured output is generated
  - [ ] Summary is saved to database
  - [ ] Check logs for "Retrieved context length"

- [ ] **Summary Viewer UI**
  - [ ] Key Findings tab displays correctly
  - [ ] Reasoning tab shows step-by-step analysis
  - [ ] Recommendations tab displays suggestions
  - [ ] Full Summary tab shows complete text
  - [ ] All tabs are navigable
  - [ ] "View Original File" downloads report

- [ ] **RAG Functionality**
  - [ ] Upload 2 similar reports
  - [ ] Second summary should reference first report context
  - [ ] Check console logs for similarity scores
  - [ ] Verify context retrieval from vector search

- [ ] **History & Dashboard**
  - [ ] All reports appear in history
  - [ ] Dashboard stats are accurate
  - [ ] Search/filter works
  - [ ] Report status updates correctly

### Expected Console Output (RAG Working)

When RAG is working correctly, you should see:

```
🚀 RAG ENABLED: Using Gemini embeddings for semantic search
✅ Retrieved context from vector database
📊 Retrieved context length: 1234 characters
💡 Found 3 similar chunks with similarity > 0.7
🧬 Medical insights retrieved from BiomedNLP
✨ Summary generated successfully
```

### Troubleshooting

**Vector Dimension Errors:**
```
ERROR: expected 1536 dimensions, not 768
```
Solution: Run the SQL fix to update vector dimensions:
```sql
ALTER TABLE report_chunks DROP COLUMN embedding;
ALTER TABLE report_chunks ADD COLUMN embedding vector(768);
```

**No Context Retrieved:**
```
⚠️ No similar chunks found
```
Solution: Ensure process-document ran successfully and chunks exist in database

**API Key Errors:**
```
Gemini API error: 401 - Unauthorized
```
Solution: Verify API keys are set in Supabase secrets:
```bash
supabase secrets set GEMINI_API_KEY=your_key
```

---

## 💰 Cost Analysis

### Total Monthly Cost: **$0 (100% Free!)**

| Service | Usage | Free Tier | Cost |
|---------|-------|-----------|------|
| **Google Gemini API** | Embeddings + Generation | 1,500 requests/day | $0 |
| **HuggingFace Inference** | BiomedNLP model | 30,000 requests/month | $0 |
| **Supabase** | Database + Storage + Auth | 500MB DB, 1GB storage | $0 |
| **Supabase Edge Functions** | 2 functions | 500,000 invocations/month | $0 |
| **Total** | - | - | **$0/month** |

### Scaling Costs (When You Exceed Free Tier)

- **Gemini API**: Pay-as-you-go after free tier
  - Embeddings: ~$0.00001 per 1K characters
  - Generation: ~$0.00005 per 1K characters
- **Supabase Pro**: $25/month (8GB DB, 100GB storage, 2M edge function invocations)

---

## 🎨 Customization

### Theming

Edit `tailwind.config.ts` to customize colors:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Add custom medical theme colors
        clinical: {
          blue: "#0066CC",
          green: "#00A36C",
          red: "#CC0000",
        }
      }
    }
  }
}
```

### AI Prompts

Customize prompts in `supabase/functions/generate-summary/index.ts`:

```typescript
const prompt = `
You are a medical AI assistant specialized in ${reportType}.

Context from previous similar reports (RAG):
${retrievedContext}

Medical domain insights:
${medicalInsights}

Analyze the following report and provide:
1. Key clinical findings
2. Step-by-step diagnostic reasoning
3. Evidence-based recommendations

Report:
${reportText}
`;
```

### Chunk Size & Overlap

Adjust chunking parameters in `process-document/index.ts`:

```typescript
const chunks = chunkText(reportText, {
  chunkSize: 1500,    // Increase for longer chunks
  overlap: 300        // Increase for more context
});
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-ml-feature
   ```
3. **Make your changes**
4. **Test thoroughly** (use the testing checklist)
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: Add BioGPT integration for medical NER"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-ml-feature
   ```
7. **Open a Pull Request**

### Contribution Ideas

- 🧠 **ML Enhancements**
  - Add more medical domain models (BioBERT, ClinicalBERT)
  - Implement fine-tuning pipeline for custom medical data
  - Add entity extraction (diseases, medications, procedures)
  
- 📊 **Features**
  - PDF text extraction improvements (handle scanned images)
  - Batch processing for multiple reports
  - Comparative analysis between reports
  - Export to HL7 FHIR format
  
- 🎨 **UI/UX**
  - Medical terminology tooltips
  - Interactive anatomy visualizations
  - Voice-to-text for clinical notes
  
- 🔬 **Analytics**
  - Trend analysis across patient history
  - Anomaly detection in lab values
  - Treatment outcome predictions

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful variable names
- Add JSDoc comments for functions
- Include unit tests for new features

---

## 🔒 Security & Privacy

### HIPAA Compliance Considerations

This application is designed with privacy-first principles:

- ✅ **Encrypted Storage**: All files encrypted at rest in Supabase
- ✅ **Row Level Security**: Database-level access control
- ✅ **Secure Authentication**: JWT-based session management
- ✅ **Audit Trails**: All database operations are logged
- ✅ **Private Buckets**: Files require authentication to access
- ⚠️ **Third-Party APIs**: Data sent to Google/HuggingFace APIs
- ⚠️ **No BAA**: Free tiers don't include Business Associate Agreements

### Production Deployment Checklist

- [ ] Enable SSL/TLS for all connections
- [ ] Set up VPN for database access
- [ ] Implement audit logging
- [ ] Configure backup policies
- [ ] Set up monitoring and alerts
- [ ] Review and sign BAAs with all vendors
- [ ] Conduct security audit
- [ ] Implement data retention policies
- [ ] Set up disaster recovery plan
- [ ] Train staff on HIPAA compliance

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

✅ Commercial use  
✅ Modification  
✅ Distribution  
✅ Private use  
❌ Liability  
❌ Warranty  

---

## 🙏 Acknowledgments

- **[Google AI](https://ai.google.dev/)** - Gemini embedding and generation models
- **[Microsoft Research](https://www.microsoft.com/en-us/research/)** - BiomedNLP-PubMedBERT model
- **[HuggingFace](https://huggingface.co/)** - Free inference API for medical models
- **[Supabase](https://supabase.com/)** - Excellent open-source backend platform
- **[pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search for PostgreSQL
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible React components
- **[Lovable AI](https://lovable.dev/)** - Initial project scaffolding
- **Medical AI Research Community** - For advancing healthcare AI

---

## 📧 Contact & Support

**Developer:** Tanmay C J  
**Institution:** REVA University, Bangalore, India  
**GitHub:** [@TanmayCJ](https://github.com/TanmayCJ)  
**Email:** tannycjain@gmail.com  
**Project:** [Med-Mind AI Core](https://github.com/TanmayCJ/med-mind-ai-core)

### Support Channels

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/TanmayCJ/med-mind-ai-core/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/TanmayCJ/med-mind-ai-core/discussions)
- 📚 **Documentation**: [Project Wiki](https://github.com/TanmayCJ/med-mind-ai-core/wiki)
- 💬 **Community**: [Discord Server](#) (Coming soon!)

---

## 🚨 Disclaimer

**IMPORTANT MEDICAL DISCLAIMER**

This application is designed for **educational and research purposes only**. It is **NOT** intended for use in clinical decision-making or as a substitute for professional medical advice, diagnosis, or treatment.

### Legal Notices

- ❌ **Not FDA Approved**: This software is not approved by any regulatory agency
- ❌ **Not Diagnostic**: Do not use for diagnosing medical conditions
- ❌ **Not Treatment Advice**: Do not use for treatment recommendations
- ✅ **Research Only**: Suitable for academic research and learning
- ✅ **Always Consult Professionals**: Seek advice from qualified healthcare providers

### AI Limitations

- AI models can make mistakes or "hallucinate" information
- Medical context requires human expertise and clinical judgment
- Vector embeddings may retrieve irrelevant context
- Pre-trained models may have biases from training data
- Always verify AI outputs with medical literature and experts

### User Responsibilities

By using this application, you acknowledge that:

1. You understand the AI limitations and will not rely solely on AI outputs
2. You will verify all AI-generated content with qualified medical professionals
3. You will not use this for clinical decision-making without expert oversight
4. You accept full responsibility for any consequences of using this tool
5. You will comply with all applicable laws and regulations

---

## 🌟 Star History

If this project helped you understand ML/AI in healthcare, please consider giving it a star! ⭐

<div align="center">

**Built with ❤️ for advancing AI in healthcare**

---

### Quick Links

[🏠 Home](#-medimind-ai) • [🧬 ML Architecture](#-machine-learning-architecture) • [🚀 Get Started](#-getting-started) • [📚 Docs](#-documentation) • [🤝 Contribute](#-contributing)

---

**© 2025 Tanmay C J • REVA University • Bangalore, India**

</div>
