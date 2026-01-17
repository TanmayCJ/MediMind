<div align="center">

<img src="./docs/media/MediMind-Logo.jpg" alt="MediMind AI Logo" width="300" style="border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>

<br/>

# MediMind AI

<h3 style="color: #3ECF8E;">🧠 Diagnostic Intelligence Powered by AI</h3>

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Intelligent medical diagnostic assistant powered by Google Gemini 2.5 Flash with RAG (Retrieval-Augmented Generation), 768-dimensional vector embeddings, Chain-of-Thought reasoning, and DICOM-compliant PDF reports.**

🌐 **[Live Demo](https://medimind-alpha.web.app)** | 📚 [Documentation](#documentation) | 🚀 [Quick Start](#installation-guide)

</div>

---

## 🎬 Demo Video & Documentation

<div align="center">

### See MediMind AI in Action

[![MediMind AI Demo](https://img.youtube.com/vi/FgMcWgBl7xU/maxresdefault.jpg)](https://youtu.be/FgMcWgBl7xU)

**[▶️ Watch on YouTube](https://youtu.be/FgMcWgBl7xU)**

*Complete workflow demonstration: report upload, AI analysis, floating chat assistant, and DICOM PDF generation.*

### 📄 Project Documentation

**[📊 MediMind Presentation](https://github.com/TanmayCJ/MediMind/raw/main/docs/reports/MediMind-Presentation.pptx)** (13.2 MB) - Project presentation slides

> **Note**: All files are stored with Git LFS. Click the links above to download.

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Machine Learning Architecture](#machine-learning-architecture)
- [System Architecture & Design](#system-architecture--design)
- [Installation Guide](#installation-guide)
- [User Guide](#user-guide)
- [Code Documentation](#code-documentation)
- [Project Reports & Documentation](#project-reports--documentation)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

**MediMind AI** is a production-ready medical report analysis platform that transforms complex diagnostic reports into actionable clinical insights using advanced Machine Learning techniques.

### Live Application

**🔗 [https://medimind-alpha.web.app](https://medimind-alpha.web.app)**

- ✅ 24/7 availability with Firebase CDN
- ✅ HTTPS secured with SSL certificates
- ✅ Real-time AI processing
- ✅ Mobile-responsive design

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 📄 **Multi-Format Upload** | PDF, TXT, DOCX medical reports |
| 🧠 **RAG Pipeline** | 768-dimensional vector embeddings with semantic search |
| 🤖 **Gemini 2.5 Flash** | 16K token output, Chain-of-Thought reasoning |
| 💬 **Floating AI Chat** | Context-aware assistant on every report page |
| 🏥 **DICOM PDFs** | Medical-grade reports with official formatting |
| 📊 **Structured Analysis** | Key findings, reasoning steps, recommendations |
| 🔐 **Secure & Private** | Supabase Auth, encrypted storage, HIPAA-ready |
| 💾 **History Tracking** | 2000+ reports with complete audit trail |

---

## Features

### AI-Powered Analysis
- **RAG (Retrieval-Augmented Generation)**: Retrieves relevant context from 768-dimensional vector database
- **Medical Domain Intelligence**: BiomedNLP-PubMedBERT trained on 15M medical papers
- **Chain-of-Thought Reasoning**: Transparent 4-stage diagnostic process
- **Floating AI Assistant**: Real-time chat with report context awareness
- **Multi-Turn Conversations**: Maintains dialogue history for natural interaction

### Report Management
- **Multi-Format Support**: PDF, TXT, DOCX files
- **Document Chunking**: Intelligent text splitting (1000 chars, 200 overlap)
- **Vector Search**: 768-dimensional semantic similarity matching
- **DICOM PDF Export**: Download official medical reports with:
  - Patient demographics (DICOM tags 0010,xxxx)
  - Study information (DICOM tags 0008,xxxx)
  - Clinical findings and interpretations
  - AI disclaimers and verification timestamps

### User Experience
- **Mobile Responsive**: Hamburger menu, sliding sidebar, adaptive layouts
- **Floating Chat**: Full-screen on mobile (<1024px), 420px card on desktop
- **Real-Time Updates**: Live processing status
- **Dark Mode**: Clinical-grade professional theme

---

## Machine Learning Architecture

### Vectorization: The Core ML Concept

**Vectorization** converts text into numerical vectors using neural networks, enabling semantic understanding and similarity search.

#### Pre-Trained Models

**1. Google Gemini text-embedding-004** (Vectorization)
- Converts text → 768-dimensional vectors
- Pre-trained transformer (Google's neural network)
- Captures semantic meaning mathematically

```typescript
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
    { body: { content: { parts: [{ text }] } } }
  );
  return response.embedding.values; // [0.23, -0.45, ..., 0.12] (768 dims)
}
```

**2. Microsoft BiomedNLP-PubMedBERT** (Medical Expert)
- Pre-trained on 15M PubMed medical abstracts
- Understands medical terminology and clinical concepts
- Provides domain-specific insights

**3. Google Gemini 2.5 Flash** (Generation)
- 16,384 token output capacity
- Chain-of-Thought reasoning
- Combines RAG context with report content
- Powers chat assistant

### RAG Pipeline

```
1. Document Upload → Supabase Storage
2. Text Chunking → 1000 chars with 200 overlap
3. Vectorization → Gemini embedding API (768 dims)
4. Vector Storage → PostgreSQL + pgvector extension
5. Query Processing → User asks question
6. Similarity Search → Cosine distance in vector space
7. Context Retrieval → Top 5 similar chunks (>0.7 similarity)
8. Augmented Generation → Gemini 2.5 + retrieved context
9. Structured Output → JSON with findings, reasoning, recommendations
```

### Vector Math

```
Query: "What are the key findings?"
Query Vector: [0.12, 0.34, -0.56, ...]  (768 dims)

Chunk 1: "Patient has pneumonia..."
Chunk 1 Vector: [0.11, 0.35, -0.54, ...]
Cosine Similarity: 0.95 ✅ (Retrieved)

Chunk 2: "Billing information..."
Chunk 2 Vector: [-0.82, 0.05, 0.71, ...]
Cosine Similarity: 0.23 ❌ (Ignored)
```

---

## System Architecture & Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              Client (React + TypeScript)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Upload   │  │Dashboard │  │ Summary Viewer   │  │
│  │ Report   │  │          │  │ + Floating Chat  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ Supabase Client SDK
┌───────────────────────┴─────────────────────────────┐
│              Supabase Backend (BaaS)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │PostgreSQL│  │ Storage  │  │ Edge Functions   │  │
│  │+pgvector │  │(Reports) │  │ (Deno Runtime)   │  │
│  │          │  │          │  │ • process-doc    │  │
│  │• reports │  │medical-  │  │ • generate-sum   │  │
│  │• chunks  │  │reports/  │  │ • chat-assistant │  │
│  │  [768]   │  │          │  │                  │  │
│  └──────────┘  └──────────┘  └────────┬─────────┘  │
└─────────────────────────────────────────┼───────────┘
                                          │
                    ┌─────────────────────┴──────┐
                    │   External AI APIs          │
                    │  • Gemini 2.5 Flash         │
                    │  • text-embedding-004       │
                    │  • BiomedNLP-PubMedBERT     │
                    └─────────────────────────────┘
```

### Database Schema

```sql
-- Enable pgvector for ML vectors
CREATE EXTENSION vector;

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  patient_name TEXT NOT NULL,
  report_type TEXT,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report chunks (768-dimensional vectors)
CREATE TABLE report_chunks (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  chunk_index INTEGER,
  content TEXT,
  embedding vector(768),  -- ML vectors stored here
  created_at TIMESTAMPTZ,
  UNIQUE(report_id, chunk_index)
);

-- Vector similarity search index (IVFFlat algorithm)
CREATE INDEX ON report_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Summaries table
CREATE TABLE summaries (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id) UNIQUE,
  key_findings TEXT[],
  reasoning_steps JSONB,
  recommendations TEXT[],
  full_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Component Structure

```
src/
├── components/
│   ├── FloatingChat.tsx          # AI chatbot (287 lines)
│   ├── layout/
│   │   ├── DashboardLayout.tsx   # Main wrapper with hamburger
│   │   └── Sidebar.tsx           # Mobile responsive nav
│   └── ui/                       # 40+ shadcn components
├── pages/
│   ├── Auth.tsx                  # Login/Signup
│   ├── Dashboard.tsx             # Home with stats
│   ├── UploadReport.tsx          # File upload interface
│   ├── SummaryViewer.tsx         # 4 tabs + DICOM PDF export
│   ├── History.tsx               # Past reports
│   └── Settings.tsx              # User preferences
├── integrations/supabase/
│   ├── client.ts                 # Supabase SDK setup
│   └── types.ts                  # Database TypeScript types
└── lib/
    ├── auth.tsx                  # Auth utilities
    └── utils.ts                  # Helper functions
```

### Data Flow Diagram

**Upload → Process → Vectorize:**
```
User uploads report.pdf
  ↓
Supabase Storage (encrypted)
  ↓
Metadata saved in reports table
  ↓
process-document Edge Function triggered
  ↓
PDF extracted → Text chunked (1000/200)
  ↓
Each chunk → Gemini embedding API
  ↓
768-dim vectors stored in report_chunks
  ↓
Status: "ready" for analysis
```

**Generate Summary with RAG:**
```
User clicks "Generate Summary"
  ↓
generate-summary Edge Function
  ↓
Query embedding: "key findings?"
  ↓
Vector search: report_chunks (cosine similarity)
  ↓
Retrieve top 5 chunks (>0.7 similarity)
  ↓
Augmented prompt:
  - Retrieved context (RAG)
  - Medical insights (BiomedNLP)
  - Original report
  ↓
Gemini 2.5 Flash generates structured JSON
  ↓
Summary saved → UI updates (4 tabs)
```

### Wireframes

**Desktop View:**
```
┌────────────────────────────────────────────────┐
│  [MediMind AI]              [@User ▼]  [⚙]   │
├──────────┬─────────────────────────────────────┤
│          │  Dashboard                          │
│  📊 Dash │  ┌────────┐ ┌────────┐ ┌────────┐ │
│  📤 Upload│  │Reports │ │Analyzed│ │Pending │ │
│  📜 History│ │  156   │ │  142   │ │   14   │ │
│  ⚙ Settings│└────────┘ └────────┘ └────────┘ │
│          │                                     │
│          │  Recent Reports                     │
│          │  ┌─────────────────────────────┐   │
│          │  │ Brain MRI - John Doe        │   │
│          │  │ ✓ Analyzed • 2h ago         │   │
│          │  └─────────────────────────────┘   │
└──────────┴─────────────────────────────────────┘
                               [💬 Chat Bot]  ← Floating
```

**Mobile View (<1024px):**
```
┌────────────────────────────┐
│ [☰] MediMind    [@] [⚙]  │
├────────────────────────────┤
│ Dashboard                  │
│ ┌──────┐ ┌──────┐         │
│ │ 156  │ │ 142  │         │
│ │Reports│ │Done │         │
│ └──────┘ └──────┘         │
│                            │
│ Recent Reports             │
│ ┌────────────────────────┐ │
│ │Brain MRI - John Doe   │ │
│ └────────────────────────┘ │
│                            │
└────────────────────────────┘
        [💬 Full-screen chat when clicked]
```

---

## Installation Guide

### Prerequisites

- **Node.js 18+** or **Bun** ([Download](https://nodejs.org/))
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Google Gemini API Key** ([Get free key](https://aistudio.google.com/apikey))
- **Firebase Account** (for hosting) ([Sign up](https://firebase.google.com))

### Step 1: Clone Repository

```bash
git clone https://github.com/TanmayCJ/MediMind.git
cd MediMind
```

### Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 3: Environment Setup

Create `.env` file in root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### Step 4: Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Copy your project URL and anon key

2. **Run SQL Setup**
   ```bash
   # Open Supabase SQL Editor
   # Copy and execute: supabase/COMPLETE_SETUP.sql
   ```

   Or use CLI:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. **Create Storage Bucket**
   - Navigate to Storage in Supabase Dashboard
   - Create bucket: `medical-reports`
   - Set to **Private** (authentication required)
   - Enable 50MB file size limit

### Step 5: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy process-document
supabase functions deploy generate-summary
supabase functions deploy chat-assistant

# Set API secrets
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set HUGGINGFACE_API_KEY=your_hf_token  # Optional
```

### Step 6: Firebase Hosting Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# Select: dist as public directory
# Configure as SPA: Yes
# Automatic builds: No

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Step 7: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **Vector dimension error** | Run: `ALTER TABLE report_chunks DROP COLUMN embedding; ALTER TABLE report_chunks ADD COLUMN embedding vector(768);` |
| **No chunks found** | Ensure process-document function ran successfully |
| **Gemini API 401** | Verify API key in Supabase secrets |
| **Storage upload fails** | Check bucket permissions and RLS policies |

---

## User Guide

### 1. Authentication

**Sign Up:**
1. Visit [https://medimind-alpha.web.app](https://medimind-alpha.web.app)
2. Click "Sign Up"
3. Enter email and password (min 6 characters)
4. Verify email (check inbox/spam)

**Login:**
- Use registered email/password
- Session persists for 7 days

### 2. Upload Medical Report

1. Navigate to **Upload Report** from sidebar
2. Fill in patient information:
   - **Patient Name** (required)
   - **Report Type** (MRI, CT, Lab, etc.)
3. Click **Choose File** → Select PDF/TXT/DOCX
4. Click **Upload Report**
5. Wait for processing (automatic vectorization)

### 3. View Analysis

1. Go to **Dashboard** or **History**
2. Click on any processed report
3. View 4 tabs:
   - **Key Findings**: Bullet points of critical observations
   - **Reasoning**: Step-by-step diagnostic logic
   - **Recommendations**: Clinical action items
   - **Full Summary**: Complete analysis

### 4. Use AI Chat Assistant

**On Desktop:**
- Click floating **Bot icon** (bottom-right)
- Chat window opens (420px width)
- Ask questions about current report

**On Mobile:**
- Tap **Bot icon**
- Full-screen chat interface
- Swipe down or tap X to close

**Example Questions:**
- "What are the most critical findings?"
- "Explain the diagnosis in simple terms"
- "What follow-up tests are recommended?"

### 5. Download DICOM PDF

1. Open any analyzed report
2. Click **Download PDF** button
3. Receives DICOM-compliant report with:
   - Patient demographics
   - DICOM tags (0008,xxxx and 0010,xxxx)
   - Clinical findings
   - AI disclaimers

### 6. Manage Reports

**History Page:**
- View all past reports
- Search by patient name
- Filter by report type
- Sort by date

**Delete Reports:**
- Open report → Click **Delete**
- Confirms deletion (irreversible)

---

## Code Documentation

### Key Components

#### FloatingChat Component
**File:** `src/components/FloatingChat.tsx` (287 lines)

```typescript
/**
 * Context-aware AI chatbot with RAG integration
 * - Appears on SummaryViewer page
 * - Full-screen on mobile (<1024px)
 * - 420px floating card on desktop
 * - Maintains conversation history (last 5 messages)
 */
export function FloatingChat({ reportId, reportContext }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const handleSend = async (userMessage: string) => {
    // Invoke chat-assistant Edge Function
    const { data } = await supabase.functions.invoke('chat-assistant', {
      body: {
        message: userMessage,
        reportId,
        reportContext,
        conversationHistory: messages.slice(-5)
      }
    });
    
    setMessages([...messages, { role: 'user', content: userMessage }, data.response]);
  };
  
  // Responsive UI: full-screen mobile, floating desktop
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className={cn(
          "fixed z-50",
          "lg:bottom-6 lg:right-6 lg:w-[420px] lg:h-[600px]",
          "max-lg:inset-0 max-lg:w-full max-lg:h-[100dvh]"
        )}>
          {/* Chat UI */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

#### SummaryViewer Component
**File:** `src/pages/SummaryViewer.tsx` (1338 lines)

```typescript
/**
 * Displays AI analysis with 4 tabs and DICOM PDF export
 * - Key Findings: Numbered list
 * - Reasoning: Step-by-step logic
 * - Recommendations: Action items
 * - Full Summary: Complete text
 */
export function SummaryViewer() {
  const { reportId } = useParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  
  // DICOM PDF generation
  const handleDownloadPDF = async () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const margin = 25; // DICOM standard
    
    // Add DICOM header
    doc.setFontSize(14);
    doc.text('MEDICAL DIAGNOSTIC REPORT', margin, margin);
    
    // Patient demographics with DICOM tags
    doc.text(`Patient Name (0010,0010): ${report.patient_name}`, margin, yPos);
    doc.text(`Study Date (0008,0020): ${studyDate}`, margin, yPos + 5);
    doc.text(`Modality (0008,0060): ${report.report_type}`, margin, yPos + 10);
    
    // Clinical findings, reasoning, recommendations
    // ... (structured DICOM sections)
    
    // AI disclaimer
    doc.setFontSize(8);
    doc.text('AI-Assisted Analysis - Requires Professional Review', margin, yPos);
    
    doc.save(`DICOM_Report_${patient}_${date}.pdf`);
  };
  
  return (
    <Tabs defaultValue="findings">
      <TabsList>
        <TabsTrigger value="findings">Key Findings</TabsTrigger>
        <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="summary">Full Summary</TabsTrigger>
      </TabsList>
      {/* Tab content */}
    </Tabs>
  );
}
```

#### Supabase Edge Functions

**process-document** (Chunking + Vectorization)
```typescript
/**
 * Chunks medical reports and generates 768-dim embeddings
 * Triggered: Automatically after file upload
 * Runtime: Deno
 */
serve(async (req) => {
  const { reportId } = await req.json();
  
  // 1. Download file from Supabase Storage
  const { data: fileData } = await supabase.storage
    .from('medical-reports')
    .download(fileUrl);
  
  // 2. Extract text content
  const reportText = await extractText(fileData);
  
  // 3. Chunk text (1000 chars, 200 overlap)
  const chunks = chunkText(reportText, {
    chunkSize: 1000,
    overlap: 200
  });
  
  // 4. Generate embeddings for each chunk
  for (const chunk of chunks) {
    const embedding = await generateGeminiEmbedding(chunk.content);
    
    // 5. Store in database
    await supabase.from('report_chunks').insert({
      report_id: reportId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embedding  // 768-dimensional vector
    });
  }
  
  return new Response(JSON.stringify({ success: true }));
});
```

**chat-assistant** (RAG-powered Chat)
```typescript
/**
 * Conversational AI with report context
 * Invoked: From FloatingChat component
 */
serve(async (req) => {
  const { message, reportId, conversationHistory } = await req.json();
  
  // 1. Vectorize user query
  const queryEmbedding = await generateGeminiEmbedding(message);
  
  // 2. Vector similarity search
  const { data: similarChunks } = await supabase.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5
  });
  
  // 3. Build augmented prompt
  const prompt = `
    Context from report: ${similarChunks.map(c => c.content).join('\n')}
    
    Conversation history: ${conversationHistory}
    
    User question: ${message}
    
    Provide a helpful, concise response.
  `;
  
  // 4. Generate response
  const response = await gemini.generateContent(prompt);
  
  return new Response(JSON.stringify({
    response: { role: 'assistant', content: response.text }
  }));
});
```

### Code Quality Standards

- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Enforced code style
- **Component Structure**: Single Responsibility Principle
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Comments**: JSDoc for all exported functions
- **State Management**: React hooks + TanStack Query for caching

---

## Project Reports & Documentation

This section contains official project documentation, design documents, and reports. Add your Word documents, PDFs, and other project files here.

### 📁 Documentation Repository Structure

```
docs/
├── design/
│   ├── architecture-diagram.pdf
│   ├── database-schema.pdf
│   ├── wireframes.pdf
│   └── ui-mockups.png
├── reports/
│   ├── project-proposal.docx
│   ├── implementation-report.docx
│   ├── testing-report.docx
│   └── final-presentation.pptx
├── requirements/
│   ├── functional-requirements.docx
│   ├── non-functional-requirements.docx
│   └── use-cases.docx
├── api-docs/
│   ├── supabase-functions.md
│   ├── gemini-api-integration.md
│   └── vector-search-implementation.md
└── guides/
    ├── deployment-guide.pdf
    ├── maintenance-guide.docx
    └── troubleshooting.md
```

### 📄 Available Reports

> **Note**: Files are stored with Git LFS. Click the links below to download.

- **[📄 MediMind Final Report](https://github.com/TanmayCJ/MediMind/raw/main/docs/reports/MediMind-Final-Report.docx)** - Complete project documentation (1 MB)
- **[📊 MediMind Presentation](https://github.com/TanmayCJ/MediMind/raw/main/docs/reports/MediMind-Presentation.pptx)** - Project presentation slides (13.2 MB)

**How to Access:**
1. Click the links above for direct download
2. Or navigate to `docs/reports/` folder in the repository
3. Click on any file and press the "Download" button

### How to Add More Documentation

**Method 1: Direct Upload to Repository**

1. Create `docs/` folder in project root:
   ```bash
   mkdir docs
   cd docs
   mkdir design reports requirements api-docs guides
   ```

2. Add your files:
   ```bash
   # Copy your Word documents
   cp ~/Desktop/project-report.docx docs/reports/
   cp ~/Desktop/architecture.pdf docs/design/
   
   # Commit to repository
   git add docs/
   git commit -m "Add project documentation"
   git push origin main
   ```

**Method 2: Link External Documentation**

Create `docs/README.md`:

```markdown
# MediMind AI Documentation

## Design Documents
- [Architecture Diagram](https://drive.google.com/file/d/xxx)
- [Database Schema](https://drive.google.com/file/d/xxx)
- [Wireframes](https://www.figma.com/file/xxx)

## Project Reports
- [Proposal](https://docs.google.com/document/d/xxx)
- [Implementation Report](https://docs.google.com/document/d/xxx)
- [Final Presentation](https://docs.google.com/presentation/d/xxx)

## API Documentation
- [Supabase Edge Functions](./api-docs/supabase-functions.md)
- [Vector Search Implementation](./api-docs/vector-search.md)
```

**Method 3: Use GitHub Wiki**

1. Go to your GitHub repository
2. Click "Wiki" tab
3. Create pages for each document type
4. Upload files or embed content

### Available Documentation

- **[RAG Setup Guide](./RAG_SETUP_GUIDE.md)** - Detailed RAG implementation
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical decisions
- **[Complete Database Setup](./supabase/COMPLETE_SETUP.sql)** - SQL schema

### Adding Your Documents

To add your Word documents or reports to this repository:

1. **Create docs folder** (if not exists):
   ```bash
   mkdir -p docs/{design,reports,requirements}
   ```

2. **Copy your files**:
   ```bash
   cp path/to/your/document.docx docs/reports/
   ```

3. **Update documentation index** in `docs/README.md`

4. **Commit changes**:
   ```bash
   git add docs/
   git commit -m "Add [document name]"
   git push origin main
   ```

---

## Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching & caching

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL + pgvector
  - Authentication
  - Storage (S3-compatible)
  - Edge Functions (Deno)
- **Google Gemini 2.5 Flash** - LLM generation
- **Google text-embedding-004** - 768-dim embeddings
- **Microsoft BiomedNLP** - Medical domain intelligence

### Deployment
- **Firebase Hosting** - Global CDN
- **GitHub** - Version control
- **Supabase Cloud** - Database + functions

---

## Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

**Backend (Supabase Secrets):**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set HUGGINGFACE_API_KEY=hf_...  # Optional
```

### API Keys

| Service | Key | Cost | Link |
|---------|-----|------|------|
| Gemini API | `GEMINI_API_KEY` | Free (1500 req/day) | [Get Key](https://aistudio.google.com/apikey) |
| HuggingFace | `HUGGINGFACE_API_KEY` | Free (30K req/month) | [Get Token](https://huggingface.co/settings/tokens) |

---

## Deployment

### Production Deployment (Firebase)

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Live at: https://medimind-alpha.web.app
```

### Update Supabase URL Configuration

After deploying:
1. Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL: `https://medimind-alpha.web.app`
3. Add Redirect URLs:
   - `https://medimind-alpha.web.app/**`
   - `https://medimind-alpha.web.app/dashboard`

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
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
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes with clear commit messages
4. Test thoroughly
5. Push: `git push origin feature/new-feature`
6. Open Pull Request

### Code Standards

- TypeScript strict mode
- ESLint compliance
- JSDoc comments for all exports
- Unit tests for utilities
- E2E tests for critical flows

---

## License

MIT License - see [LICENSE](./LICENSE) file.

---

## Contact

**Developer:** Tanmay C J  
**Institution:** REVA University, Bangalore, India  
**GitHub:** [@TanmayCJ](https://github.com/TanmayCJ)  
**Email:** tannycjain@gmail.com  
**Project:** [MediMind AI](https://github.com/TanmayCJ/MediMind)

### Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/TanmayCJ/MediMind/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/TanmayCJ/MediMind/discussions)
- 📚 **Documentation**: [Project Wiki](https://github.com/TanmayCJ/MediMind/wiki)

---

## Disclaimer

**IMPORTANT MEDICAL DISCLAIMER**

This application is for **educational and research purposes only**. Not intended as a substitute for professional medical advice.

AI models can make errors. Vector embeddings may retrieve irrelevant context. Always verify outputs with medical literature and experts.

---

<div align="center">


[🏠 Home](#-medimind-ai) • [🧬 ML Architecture](#machine-learning-architecture) • [🚀 Install](#installation-guide) • [📚 User Guide](#user-guide)

**© 2025 Tanmay C J • REVA University • Bangalore, India**

</div>
