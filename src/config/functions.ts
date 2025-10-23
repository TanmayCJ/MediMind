// Supabase Edge Function Names Configuration
// Change these if you need to use different function versions

export const EDGE_FUNCTIONS = {
  PROCESS_DOCUMENT: 'process-document',
  GENERATE_SUMMARY: 'generate-summary-new', // This is the ONLY function that exists
} as const;
