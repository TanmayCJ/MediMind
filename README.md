<div align="center"># Med-Mind AI Core - Medical Report Summarizer



# 🏥 MediMind AI## 🏥 Overview



### AI-Powered Medical Report Analysis for CliniciansAn intelligent medical report summarization system using **RAG (Retrieval-Augmented Generation)** and **Chain-of-Thought reasoning** to analyze diagnostic reports (radiology, pathology, MRI).



[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)### Key Features

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)- 📄 Upload medical reports (PDF/text)

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)- 🧠 RAG-powered context retrieval with vector embeddings

[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)- 🤖 AI summarization with step-by-step reasoning

[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)- 📊 Structured output: key findings, reasoning steps, recommendations

- 🔐 Secure authentication and data privacy

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Contributing](#-contributing)

## 📚 Documentation

---

- **[ML Setup Guide](./ML_SETUP_GUIDE.md)** - Complete ML/AI architecture and setup

</div>- **[Supabase Deployment](./SUPABASE_DEPLOYMENT.md)** - Database and edge function deployment



## 📋 Overview## 🚀 Quick Start



**MediMind AI** is an intelligent medical report analysis platform that leverages advanced AI technology to help clinicians quickly understand complex diagnostic reports. Upload radiology, pathology, or MRI reports and receive instant, actionable insights powered by Google's Gemini 2.0 Flash AI.### Prerequisites

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

## 🎨 Customization

### Theming

The application uses TailwindCSS with custom theme configuration. Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      // Add your custom colors
    }
  }
}
```

### AI Prompts

Customize the AI analysis prompts in `supabase/functions/generate-summary/index.ts`:

```typescript
const prompt = `You are a medical AI assistant...`;
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can log in successfully
- [ ] File upload works for PDF and TXT files
- [ ] AI analysis completes without errors
- [ ] Summary displays key findings correctly
- [ ] "View Original File" downloads the report
- [ ] History page shows all past reports
- [ ] User can log out successfully

### Sample Test Report

Use this sample Brain MRI report for testing:

```
BRAIN MRI REPORT
Patient: Test User
DOB: 01/15/1980
Exam Date: October 23, 2025

FINDINGS:
Brain Parenchyma:
- 2.3 cm well-circumscribed mass in the right frontal lobe
- Perilesional vasogenic edema
- No midline shift

IMPRESSION:
1. Right frontal lobe mass measuring 2.3 cm with surrounding edema
2. Recommend neurosurgical consultation
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Lovable AI](https://lovable.dev/)** - Initial project scaffolding
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Supabase](https://supabase.com/)** - Excellent backend infrastructure
- **[Google AI](https://ai.google.dev/)** - Powerful Gemini language model

---

## 📧 Contact

**Tanmay C J**
- GitHub: [@TanmayCJ](https://github.com/TanmayCJ)
- Email: tannycjain@gmail.com
- Institution: REVA University, Bangalore, India

---

## 🚨 Disclaimer

This application is intended for **educational and research purposes only**. It is **not a substitute for professional medical advice, diagnosis, or treatment**. Always seek the advice of qualified health providers with any questions regarding medical conditions.

---

<div align="center">

**Built with ❤️ for the medical community**

[⬆ Back to Top](#-medimind-ai)

</div>
