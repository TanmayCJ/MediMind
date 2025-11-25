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
    const { message, conversationHistory } = await req.json();
    console.log('Chat request received:', { message });

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

    // Retrieve relevant context using RAG
    const { context, sources } = await retrieveContext(
      message,
      user.id,
      supabaseClient,
      GEMINI_API_KEY
    );

    console.log(`✅ Retrieved ${sources.length} relevant sources`);

    // Build conversation history context
    const historyContext = conversationHistory
      ?.slice(-5)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || '';

    // Prepare prompt for Gemini
    const systemPrompt = `You are an expert medical AI assistant helping patients understand their medical reports and diagnoses.

CAPABILITIES:
- Answer questions about medical reports, test results, and diagnoses
- Explain medical terminology in simple language
- Provide insights based on available medical records
- Offer general health information and guidance

GUIDELINES:
- Be empathetic, clear, and professional
- Use simple language when explaining medical terms
- Always cite specific reports when referencing medical information
- If information is not in the provided context, say so clearly
- Never provide definitive diagnoses - only explain existing findings
- Encourage consulting with healthcare professionals for medical decisions
- Be concise but comprehensive in responses

IMPORTANT:
- You are NOT replacing a doctor - you're helping patients understand their existing reports
- Always maintain patient confidentiality and professionalism
- If a question is outside your scope, politely redirect to healthcare professionals`;

    const userPrompt = `${historyContext ? `\n\nPREVIOUS CONVERSATION:\n${historyContext}\n` : ''}

AVAILABLE MEDICAL CONTEXT:
${context || 'No medical records available in the system yet. Please inform the user to upload medical reports first.'}

USER QUESTION:
${message}

Provide a helpful, accurate response based on the available medical context. If referencing specific information, mention which report it comes from. Keep your response conversational and easy to understand.`;

    console.log('🤖 Calling Gemini 2.5 Flash...');

    // Call Gemini API
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          systemInstruction: {
            parts: [{
              text: "You are a helpful medical AI assistant. Respond conversationally and cite sources when referencing specific medical information."
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
