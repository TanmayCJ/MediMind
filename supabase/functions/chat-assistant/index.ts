import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embeddings using Gemini API
async function generateGeminiEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text }] }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

// Retrieve relevant context using RAG
async function retrieveContext(
  query: string,
  userId: string,
  supabaseClient: any,
  geminiApiKey: string
): Promise<{ context: string; sources: any[] }> {
  // Generate embedding for the query
  const queryEmbedding = await generateGeminiEmbedding(query, geminiApiKey);

  // Search for similar chunks across all user's reports
  const { data: chunks, error } = await supabaseClient.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 10,
  });

  if (error) {
    console.error('Error searching chunks:', error);
    return { context: '', sources: [] };
  }

  if (!chunks || chunks.length === 0) {
    return { context: '', sources: [] };
  }

  // Get report details
  const reportIds = [...new Set(chunks.map((c: any) => c.report_id))];
  const { data: reports } = await supabaseClient
    .from('reports')
    .select('id, patient_name, report_type, file_name, uploaded_at')
    .in('id', reportIds);

  const reportMap = new Map(reports?.map((r: any) => [r.id, r]) || []);

  // Build sources array
  const sources = chunks.slice(0, 5).map((chunk: any) => {
    const report = reportMap.get(chunk.report_id);
    return {
      report_id: chunk.report_id,
      patient_name: report?.patient_name || 'Unknown',
      report_type: report?.report_type || 'unknown',
      file_name: report?.file_name,
      relevance: chunk.similarity,
      uploaded_at: report?.uploaded_at,
    };
  });

  // Combine chunks into context
  const context = chunks
    .slice(0, 10)
    .map((chunk: any, idx: number) => {
      const report = reportMap.get(chunk.report_id);
      return `[Document ${idx + 1}: ${report?.patient_name || 'Unknown'} - ${report?.report_type || 'Report'} (${new Date(report?.uploaded_at).toLocaleDateString()})]\n${chunk.content}`;
    })
    .join('\n\n---\n\n');

  return { context, sources };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, reportId, reportContext } = await req.json();
    console.log('Chat request received:', { message, reportId, hasContext: !!reportContext });

    // Get Supabase client with user context
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('🔍 Retrieving relevant medical context...');

    // Build current report context first
    let currentReportContext = '';
    let currentReportChunks = '';
    
    if (reportId && reportContext) {
      console.log(`📄 Fetching report ${reportId} from database...`);
      
      // Get report chunks from report_chunks table (created by process-document function)
      const { data: reportChunks, error: chunksError } = await supabaseClient
        .from('report_chunks')
        .select('content, chunk_index')
        .eq('report_id', reportId)
        .order('chunk_index', { ascending: true });

      if (chunksError) {
        console.error('❌ Error fetching report chunks:', chunksError);
      } else if (reportChunks && reportChunks.length > 0) {
        currentReportChunks = reportChunks.map((c: any) => c.content).join('\n\n');
        console.log(`✅ Retrieved ${reportChunks.length} chunks from report_chunks table`);
      } else {
        console.log('⚠️ No chunks found in report_chunks table');
        
        // Try downloading the file directly from storage as fallback
        const { data: reportData } = await supabaseClient
          .from('reports')
          .select('file_url, file_name')
          .eq('id', reportId)
          .single();
          
        if (reportData?.file_url) {
          console.log('📥 Attempting to download file from storage...');
          const filePath = reportData.file_url.split('/').slice(-2).join('/');
          
          const { data: fileData, error: downloadError } = await supabaseClient
            .storage
            .from('medical-reports')
            .download(filePath);
            
          if (!downloadError && fileData) {
            currentReportChunks = await fileData.text();
            console.log(`✅ Downloaded file content (${currentReportChunks.length} characters)`);
          }
        }
      }

      currentReportContext = `\n\n=== CURRENT REPORT BEING VIEWED ===
Patient: ${reportContext.patient_name}
Report Type: ${reportContext.report_type}

${reportContext.summary ? `AI ANALYSIS SUMMARY:
Key Findings: ${reportContext.summary.key_findings?.join(', ') || 'Processing...'}
Recommendations: ${reportContext.summary.recommendations?.join(', ') || 'Processing...'}
Full Summary: ${reportContext.summary.full_summary || 'Processing...'}

` : ''}FULL REPORT CONTENT:
${currentReportChunks || 'ERROR: Report content not available. The report may still be processing.'}

=== END OF CURRENT REPORT ===

IMPORTANT: The user is viewing THIS specific report. Answer all questions based on the content above.`;
    }

    // Retrieve relevant context using RAG from other reports
    const { context, sources } = await retrieveContext(
      message,
      user.id,
      supabaseClient,
      GEMINI_API_KEY
    );

    console.log(`✅ Retrieved ${sources.length} relevant sources from other reports`);

    // Build conversation history context
    const historyContext = conversationHistory
      ?.slice(-5)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || '';

    // Prepare prompt for Gemini
    const systemPrompt = `You are a friendly medical AI assistant in the MediMind app. You help patients understand their reports, answer health questions, and navigate the platform.

RESPONSE STYLE:
- Be conversational and warm, not robotic
- Keep answers concise - match the user's energy
- If they ask for "gist" or "simple summary", give 2-3 short paragraphs MAX
- Use simple language, avoid medical jargon unless explaining it
- Be direct and natural

YOUR ABILITIES:
1. Explain medical reports and findings in plain English
2. Answer general health/medical questions using your knowledge
3. Guide users through the MediMind platform features
4. Reference specific reports when discussing uploaded documents

RULES:
- You're NOT a doctor - you help understand existing reports
- Always suggest consulting healthcare professionals for medical decisions
- If info isn't in the context, say so clearly and briefly
- Cite sources when referencing specific medical data`;

    const userPrompt = `${historyContext ? `Previous chat:\n${historyContext}\n\n` : ''}${currentReportContext}

${context ? `Other available reports:\n${context}\n\n` : ''}User: ${message}

Respond naturally and concisely. If they want a "gist" or "summary", keep it brief (2-3 short paragraphs). Match their tone.`;

    console.log('🤖 Calling Gemini 2.5 Flash...');

    // Call Gemini API - using same model as summary generation for consistency
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{
              text: "You are a friendly, conversational medical AI assistant. Be concise and natural. When asked for a gist or summary, keep it brief and casual - 2-3 short paragraphs max. Don't over-explain. Match the user's tone."
            }]
          }
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API Error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

    console.log('✅ Response generated successfully');

    return new Response(
      JSON.stringify({
        response: responseText,
        sources: sources.length > 0 ? sources : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in chat-assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
