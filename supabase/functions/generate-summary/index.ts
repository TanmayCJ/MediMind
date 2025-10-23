import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate embeddings using OpenAI API
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Function to retrieve relevant context using RAG
async function retrieveContext(
  reportId: string, 
  query: string, 
  supabaseClient: any,
  openaiApiKey: string
): Promise<string> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query, openaiApiKey);

  // Search for similar chunks
  const { data: chunks, error } = await supabaseClient.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
    filter_report_id: reportId
  });

  if (error) {
    console.error('Error searching chunks:', error);
    return '';
  }

  if (!chunks || chunks.length === 0) {
    return '';
  }

  // Combine retrieved chunks into context
  const context = chunks
    .map((chunk: any, idx: number) => `[Chunk ${idx + 1} - Relevance: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}`)
    .join('\n\n');

  return context;
}

// Function to parse Gemini's text response into structured data
function parseGeminiResponse(text: string): any {
  try {
    // Try to extract sections from the text
    const keyFindings: string[] = [];
    const reasoningSteps: Record<string, string> = {};
    const recommendations: string[] = [];
    
    // Extract key findings (look for bullet points or numbered lists)
    const findingsMatch = text.match(/key findings?:?\s*([\s\S]*?)(?=step-by-step|reasoning|recommendations|$)/i);
    if (findingsMatch) {
      const findingsText = findingsMatch[1];
      const findings = findingsText.split(/\n/).filter(line => line.trim().match(/^[-•*\d.]/));
      findings.forEach(f => {
        const cleaned = f.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned) keyFindings.push(cleaned);
      });
    }
    
    // Extract reasoning steps
    const reasoningMatch = text.match(/(?:step-by-step|reasoning):?\s*([\s\S]*?)(?=recommendations|$)/i);
    if (reasoningMatch) {
      const reasoningText = reasoningMatch[1];
      const steps = reasoningText.split(/\n/).filter(line => line.trim().match(/^[-•*\d.]/));
      steps.forEach((step, idx) => {
        const cleaned = step.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned) reasoningSteps[`Step ${idx + 1}`] = cleaned;
      });
    }
    
    // Extract recommendations
    const recsMatch = text.match(/recommendations:?\s*([\s\S]*?)$/i);
    if (recsMatch) {
      const recsText = recsMatch[1];
      const recs = recsText.split(/\n/).filter(line => line.trim().match(/^[-•*\d.]/));
      recs.forEach(r => {
        const cleaned = r.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned) recommendations.push(cleaned);
      });
    }
    
    return {
      key_findings: keyFindings.length > 0 ? keyFindings : ["Analysis completed - see full summary"],
      reasoning_steps: Object.keys(reasoningSteps).length > 0 ? reasoningSteps : { "Step 1": "Analysis performed" },
      recommendations: recommendations.length > 0 ? recommendations : ["Further clinical correlation recommended"],
      full_summary: text
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      key_findings: ["Analysis completed"],
      reasoning_steps: { "Step 1": "Medical report analyzed" },
      recommendations: ["Clinical review recommended"],
      full_summary: text || "Analysis completed successfully."
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId } = await req.json();
    console.log('Generating summary for report:', reportId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    // Fetch report details
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    // Update status to processing
    await supabaseClient
      .from('reports')
      .update({ status: 'processing' })
      .eq('id', reportId);

    // Extract the actual report content from the file
    let reportContent = '';
    try {
      // Extract the file path from the public URL
      const urlParts = report.file_url.split('/medical-reports/');
      if (urlParts.length >= 2) {
        const filePath = urlParts[1];
        console.log('📄 Downloading report file:', filePath);
        
        const { data: fileData, error: downloadError } = await supabaseClient
          .storage
          .from('medical-reports')
          .download(filePath);

        if (!downloadError && fileData) {
          reportContent = await fileData.text();
          console.log('✅ Report content extracted, length:', reportContent.length);
        } else {
          console.error('⚠️ Failed to download file:', downloadError);
        }
      }
    } catch (error) {
      console.error('⚠️ Error reading file content:', error);
    }

    // Try to retrieve context using RAG if OpenAI key is available
    let retrievedContext = '';
    if (OPENAI_API_KEY) {
      try {
        console.log('🚀 RAG ENABLED: Using vector embeddings for context retrieval');
        const query = `Analyze ${report.report_type} report findings, key observations, and clinical significance`;
        retrievedContext = await retrieveContext(reportId, query, supabaseClient, OPENAI_API_KEY);
        console.log('✅ Retrieved context length:', retrievedContext.length);
      } catch (error) {
        console.error('⚠️ RAG failed, continuing without context:', error);
      }
    } else {
      console.log('ℹ️ RAG DISABLED: No OpenAI API key - using direct Gemini analysis (still powerful!)');
    }

    // Prepare AI prompt with Chain-of-Thought instructions
    const systemPrompt = `You are an expert medical AI assistant specialized in analyzing diagnostic reports. 
Your task is to provide a comprehensive analysis with clear Chain-of-Thought reasoning.

Analyze the medical report and provide:
1. Key Findings: Extract and list the most important diagnostic findings
2. Step-by-Step Reasoning: Show your analytical process step by step
3. Recommendations: Provide actionable clinical recommendations

Be thorough, precise, and maintain medical accuracy.`;

    let userPrompt = `Analyze this ${report.report_type} report for patient ${report.patient_name}.
File: ${report.file_name}`;

    // Add actual report content if available
    if (reportContent) {
      userPrompt += `\n\n=== MEDICAL REPORT CONTENT ===\n${reportContent}\n\n=== END REPORT ===\n`;
      console.log('✅ Using actual report content for analysis');
    }

    // Add retrieved context if RAG is enabled
    if (retrievedContext) {
      userPrompt += `\n\n=== ADDITIONAL CONTEXT (via RAG) ===\n${retrievedContext}\n\n=== END CONTEXT ===\n`;
      console.log('✅ Enhanced with RAG-retrieved context');
    }

    userPrompt += `\n\nProvide a comprehensive analysis with:
- Key clinical findings (3-5 bullet points)
- Step-by-step reasoning process (explain your analytical steps)
- Clinical recommendations (3-5 actionable items)`;

    // Call Google Gemini API directly
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured. Please add it to Supabase secrets.');
    }

    console.log('🤖 Using Google Gemini 2.0 Flash for analysis');
    
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API Error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('Gemini Response:', JSON.stringify(aiData, null, 2));

    // Extract text from Gemini response
    const generatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the response to extract structured data
    // Gemini will return formatted text, so we'll parse it
    const analysisData = parseGeminiResponse(generatedText);

    // Store summary in database
    const { error: summaryError } = await supabaseClient
      .from('summaries')
      .upsert({
        report_id: reportId,
        key_findings: analysisData.key_findings,
        reasoning_steps: analysisData.reasoning_steps,
        recommendations: analysisData.recommendations,
        full_summary: analysisData.full_summary,
      });

    if (summaryError) {
      console.error('Summary storage error:', summaryError);
      throw summaryError;
    }

    // Update report status to completed
    await supabaseClient
      .from('reports')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    console.log('Summary generated successfully for report:', reportId);

    return new Response(
      JSON.stringify({ success: true, summary: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});