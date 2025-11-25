import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles, FileText, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: any[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI medical assistant. I can help you understand your medical reports, answer questions about diagnoses, and provide insights based on your uploaded documents. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call the chat edge function
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          message: userMessage.content,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Brain className="h-7 w-7 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                AI Medical Assistant
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4" />
                Ask me anything about your medical reports
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <Card className="flex-1 backdrop-blur-xl bg-card/40 border-primary/20 shadow-2xl overflow-hidden flex flex-col mb-4">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <motion.div
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Bot className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}

                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "order-1"
                        : "order-2"
                    }`}
                  >
                    <motion.div
                      className={`p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-gradient-to-br from-card/80 to-card/60 border border-primary/20 shadow-md"
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Sources referenced:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-primary/10 hover:bg-primary/20 transition-all"
                              >
                                {source.patient_name} - {source.report_type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                    
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <motion.div
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shadow-md"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <User className="h-5 w-5 text-accent" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-card/80 border border-primary/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Analyzing your question...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-card/40 border-primary/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your medical reports, diagnoses, or request clarification..."
                  className="min-h-[60px] max-h-[200px] resize-none bg-background/50 border-primary/20 focus:border-primary/40"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="h-auto px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Press Enter to send, Shift+Enter for new line
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
