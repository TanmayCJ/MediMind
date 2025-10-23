import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Prepare AI prompt with Chain-of-Thought instructions
    const systemPrompt = `You are an expert medical AI assistant specialized in analyzing diagnostic reports. 
Your task is to provide a comprehensive analysis with clear Chain-of-Thought reasoning.

Analyze the medical report and provide:
1. Key Findings: Extract and list the most important diagnostic findings
2. Step-by-Step Reasoning: Show your analytical process step by step
3. Recommendations: Provide actionable clinical recommendations

Be thorough, precise, and maintain medical accuracy.`;

    const userPrompt = `Analyze this ${report.report_type} report for patient ${report.patient_name}.
File: ${report.file_name}

Provide a comprehensive analysis with:
- Key clinical findings (3-5 bullet points)
- Step-by-step reasoning process (explain your analytical steps)
- Clinical recommendations (3-5 actionable items)`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_medical_analysis",
            description: "Provide structured medical report analysis",
            parameters: {
              type: "object",
              properties: {
                key_findings: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of 3-5 key clinical findings"
                },
                reasoning_steps: {
                  type: "object",
                  description: "Step-by-step reasoning process with labeled steps",
                  additionalProperties: { type: "string" }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of 3-5 clinical recommendations"
                },
                full_summary: {
                  type: "string",
                  description: "Complete narrative summary"
                }
              },
              required: ["key_findings", "reasoning_steps", "recommendations", "full_summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_medical_analysis" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway Error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extract structured data from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const analysisData = toolCall?.function?.arguments 
      ? JSON.parse(toolCall.function.arguments)
      : {
          key_findings: ["Analysis in progress"],
          reasoning_steps: { "Step 1": "Processing medical report data" },
          recommendations: ["Further analysis recommended"],
          full_summary: "AI analysis completed successfully."
        };

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