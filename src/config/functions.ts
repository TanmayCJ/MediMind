// Supabase Edge Function Names Configuration
// Change these if you need to use different function versions

export const EDGE_FUNCTIONS = {
  PROCESS_DOCUMENT: 'process-document',
  GENERATE_SUMMARY: 'generate-summary',
  CHAT_ASSISTANT: 'chat-assistant',
} as const;
