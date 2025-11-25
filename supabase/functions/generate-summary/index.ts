import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate embeddings using Gemini API 
async function generateGeminiEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{
            text: text
          }]
        }
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.embedding.values; // Returns array of 768 dimensions
}

// Function to get medical insights from HuggingFace BiomedNLP model
async function getMedicalInsights(text: string, apiKey: string): Promise<any> {
  try {
    // Using microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract (free inference)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text.slice(0, 512), 
        }),
      }
    );

    if (!response.ok) {
      console.log('⚠️ HuggingFace API returned:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('⚠️ HuggingFace request failed:', error);
    return null;
  }
}

// Function to retrieve relevant context using RAG with Gemini embeddings
async function retrieveContext(
  reportId: string, 
  query: string, 
  supabaseClient: any,
  geminiApiKey: string
): Promise<{ context: string; sources: any[] }> {
  // Generate embedding for the query using Gemini
  const queryEmbedding = await generateGeminiEmbedding(query, geminiApiKey);

  // Search for similar chunks
  const { data: chunks, error } = await supabaseClient.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
    filter_report_id: reportId
  });

  if (error) {
    console.error('Error searching chunks:', error);
    return { context: '', sources: [] };
  }

  if (!chunks || chunks.length === 0) {
    return { context: '', sources: [] };
  }

  // Get report details for source citations
  const reportIds = [...new Set(chunks.map((c: any) => c.report_id))];
  const { data: sourceReports } = await supabaseClient
    .from('reports')
    .select('id, patient_name, report_type, file_name')
    .in('id', reportIds);

  const reportMap = new Map(sourceReports?.map((r: any) => [r.id, r]) || []);

  // Build sources array with metadata
  const sources = chunks.map((chunk: any, idx: number) => {
    const report = reportMap.get(chunk.report_id);
    return {
      type: chunk.report_id === reportId ? 'current_report' : 'similar_report',
      report_id: chunk.report_id,
      patient_name: report?.patient_name || 'Unknown',
      report_type: report?.report_type || 'unknown',
      file_name: report?.file_name || 'Unknown',
      relevance: chunk.similarity,
      snippet: chunk.content.substring(0, 200) + '...',
      chunk_index: chunk.chunk_index
    };
  });

  // Combine retrieved chunks into context with source labels
  const context = chunks
    .map((chunk: any, idx: number) => {
      const report = reportMap.get(chunk.report_id);
      const sourceLabel = chunk.report_id === reportId 
        ? 'Current Report' 
        : `Similar Case: ${report?.patient_name || 'Unknown'} (${report?.report_type || 'unknown'})`;
      return `[Source ${idx + 1}: ${sourceLabel} - Relevance: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}`;
    })
    .join('\n\n');

  return { context, sources };
}

// Function to parse Gemini's text response into structured data
function parseGeminiResponse(text: string): any {
  try {
    // Try to extract sections from the text
    const keyFindings: string[] = [];
    const reasoningSteps: Record<string, string> = {};
    const recommendations: string[] = [];
    
    // Extract key findings (look for bullet points or numbered lists)
    const findingsMatch = text.match(/key findings?:?\s*([\s\S]*?)(?=chain-of-thought|step-by-step|reasoning|recommendations|$)/i);
    if (findingsMatch) {
      const findingsText = findingsMatch[1];
      const findings = findingsText.split(/\n/).filter(line => line.trim().match(/^[-•*\d.]/));
      findings.forEach(f => {
        const cleaned = f.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned) keyFindings.push(cleaned);
      });
    }
    
    // Extract reasoning steps - improved to handle **Step X:** format
    const reasoningMatch = text.match(/(?:chain-of-thought|step-by-step|reasoning).*?analysis?:?\s*([\s\S]*?)(?=clinical recommendations|recommendations|complete summary|$)/i);
    if (reasoningMatch) {
      const reasoningText = reasoningMatch[1];
      // Try to match **Step X: Title** followed by content
      const stepMatches = Array.from(reasoningText.matchAll(/\*\*Step\s+(\d+):\s*([^*\n]+?)\*\*\s*([\s\S]*?)(?=\*\*Step|\*\*CLINICAL|\*\*COMPLETE|$)/gi));
      if (stepMatches.length > 0) {
        stepMatches.forEach(match => {
          const stepNum = match[1];
          const stepTitle = match[2].trim();
          const stepContent = match[3].trim();
          reasoningSteps[`Step ${stepNum}`] = stepContent || stepTitle;
        });
      } else {
        // Fallback: look for lines starting with Step
        const stepLines = reasoningText.split(/\n/).filter(line => line.trim().match(/^(?:step\s*\d+|\d+\.)/i));
        stepLines.forEach((line, idx) => {
          const cleaned = line.replace(/^(?:step\s*\d+[.:]?|\d+\.?)\s*/i, '').trim();
          if (cleaned.length > 10) reasoningSteps[`Step ${idx + 1}`] = cleaned;
        });
      }
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

    // Support multiple Gemini API keys for quota rotation
    const GEMINI_API_KEYS = [
      Deno.env.get('GEMINI_API_KEY'),
      Deno.env.get('GEMINI_API_KEY_2'),
      Deno.env.get('GEMINI_API_KEY_3'),
    ].filter(key => key); // Remove undefined keys
    
    if (GEMINI_API_KEYS.length === 0) {
      console.error('❌ No GEMINI_API_KEY found in environment variables');
      throw new Error('GEMINI_API_KEY not configured. Please add it to Supabase secrets.');
    }
    
    const GEMINI_API_KEY = GEMINI_API_KEYS[Math.floor(Math.random() * GEMINI_API_KEYS.length)];
    console.log(`✅ Using Gemini API key (${GEMINI_API_KEY.substring(0, 10)}...)`);
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    
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

    // Try to retrieve context using RAG if Gemini key is available
    let retrievedContext = '';
    let ragSources: any[] = [];
    if (GEMINI_API_KEY) {
      try {
        console.log('🚀 RAG ENABLED: Using Gemini vector embeddings for context retrieval');
        const query = `Analyze ${report.report_type} report findings, key observations, and clinical significance`;
        const ragResult = await retrieveContext(reportId, query, supabaseClient, GEMINI_API_KEY);
        retrievedContext = ragResult.context;
        ragSources = ragResult.sources;
        console.log('✅ Retrieved context length:', retrievedContext.length);
        console.log('✅ Found', ragSources.length, 'source references');
      } catch (error) {
        console.error('⚠️ RAG failed, continuing without context:', error);
      }
    } else {
      console.log('ℹ️ RAG DISABLED: No Gemini API key for embeddings - using direct analysis');
    }

    // Get medical insights from HuggingFace model if API key is available
    let medicalInsights: any = null;
    if (HUGGINGFACE_API_KEY && reportContent) {
      try {
        console.log('🤖 Calling HuggingFace BiomedNLP model for medical insights...');
        medicalInsights = await getMedicalInsights(reportContent, HUGGINGFACE_API_KEY);
        if (medicalInsights) {
          console.log('✅ Medical insights obtained from HuggingFace model');
        }
      } catch (error) {
        console.error('⚠️ HuggingFace analysis failed:', error);
      }
    } else if (!HUGGINGFACE_API_KEY) {
      console.log('ℹ️ HuggingFace DISABLED: No API key - using only Gemini (still excellent!)');
    }

    // Prepare AI prompt with Chain-of-Thought instructions
    const systemPrompt = `You are an expert medical AI assistant specialized in analyzing diagnostic reports with professional precision.

FORMATTING REQUIREMENTS:
- Write in clear, professional medical language
- Use complete sentences with proper grammar
- Be specific and concise
- Avoid unnecessary jargon, but maintain medical accuracy
- Each finding should be a complete, standalone statement
- Each reasoning step should clearly explain the thought process
- Each recommendation should be actionable and specific

ANALYSIS STRUCTURE:
1. Key Clinical Findings: 3-5 critical observations from the report
2. Chain-of-Thought Analysis: Step-by-step reasoning showing how you arrived at conclusions
3. Clinical Recommendations: 3-5 actionable next steps with rationale
4. Complete Summary: Comprehensive narrative synthesis

Your analysis will be displayed in a modern medical intelligence platform with professional formatting.`;

    let userPrompt = `Analyze this ${report.report_type} report for patient ${report.patient_name}.
File: ${report.file_name}`;

    // Add actual report content if available
    if (reportContent) {
      userPrompt += `\n\n=== MEDICAL REPORT CONTENT ===\n${reportContent}\n\n=== END REPORT ===\n`;
      console.log('✅ Using actual report content for analysis');
    }

    // Add retrieved context if RAG is enabled
    if (retrievedContext) {
      userPrompt += `\n\n=== SIMILAR CASES FROM DATABASE (RAG) ===\n${retrievedContext}\n\n=== END CONTEXT ===\n`;
      console.log('✅ Enhanced with RAG-retrieved context');
    }

    // Add HuggingFace medical model insights if available
    if (medicalInsights) {
      userPrompt += `\n\n=== MEDICAL NLP INSIGHTS (BiomedNLP Model) ===\n${JSON.stringify(medicalInsights, null, 2)}\n\n=== END INSIGHTS ===\n`;
      console.log('✅ Enhanced with HuggingFace medical model insights');
    }

    userPrompt += `\n\nIMPORTANT CITATION REQUIREMENTS:
- For each finding and recommendation, cite established medical sources
- Use format: (Ref: Journal/Guideline name or medical standard)
- Examples: (Ref: ACR Guidelines), (Ref: Radiology journal standard), (Ref: WHO criteria)
- Reference established medical literature, clinical guidelines, or diagnostic standards
- Do NOT cite the patient's report as a source - cite the medical knowledge/standards instead

Provide your analysis in the following format:

**KEY CLINICAL FINDINGS:**
- [Finding 1: Complete, specific observation with measurements/details] (Ref: Medical source)
- [Finding 2: Clear statement about another significant finding] (Ref: Medical source)
- [Finding 3-5: Additional critical findings with medical citations]

**CHAIN-OF-THOUGHT ANALYSIS:**
**Step 1: Initial Assessment**
[Your reasoning about what you first observe]

**Step 2: Differential Diagnosis**
[Your reasoning about possible diagnoses]

**Step 3: Clinical Correlation**
[Your reasoning about correlating findings]

**Step 4: Risk Assessment**
[Your reasoning about severity and urgency]

Step 1: Clinical Data Review
[Explain what information you gathered from the report and how it relates to the patient's presentation. Cite sources.]

Step 2: Diagnostic Interpretation
[Describe how you interpreted the findings, what they indicate, and why]

Step 3: Differential Considerations
[Discuss what conditions were considered and why certain diagnoses are more likely]

Step 4: Synthesis and Conclusion
[Explain how all findings come together to form the overall clinical picture]

**CLINICAL RECOMMENDATIONS:**
- [Recommendation 1: Specific action with clear rationale]
- [Recommendation 2: Another actionable step with medical justification]
- [Recommendation 3-5: Additional recommendations as appropriate]

**COMPLETE MEDICAL ANALYSIS:**
[Write a comprehensive 2-3 paragraph narrative summary that synthesizes all findings, reasoning, and recommendations into a cohesive clinical report. This should read like a professional medical consultation note.]

Remember: Be specific, professional, and clinically accurate. Each statement should provide value to the healthcare provider reviewing this analysis.`;

    // Call Google Gemini API directly (API key already fetched earlier)
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured. Please add it to Supabase secrets.');
    }

    console.log('🤖 Using Google Gemini 2.5 Flash for analysis');
    
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 16384,  // Increased to handle Gemini 2.5's thinking tokens
        },
        systemInstruction: {
          parts: [{
            text: "Respond directly without extended thinking. Provide structured medical analysis immediately."
          }]
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

    // Prepare source citations
    const allSources = [
      {
        type: 'current_report',
        report_id: reportId,
        patient_name: report.patient_name,
        report_type: report.report_type,
        file_name: report.file_name,
        relevance: 1.0
      },
      ...ragSources
    ];

    // Store summary in database with sources
    const { error: summaryError } = await supabaseClient
      .from('summaries')
      .upsert({
        report_id: reportId,
        key_findings: analysisData.key_findings,
        reasoning_steps: analysisData.reasoning_steps,
        recommendations: analysisData.recommendations,
        full_summary: analysisData.full_summary,
        sources: allSources,
        rag_context_used: ragSources.map((s: any) => s.report_id),
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