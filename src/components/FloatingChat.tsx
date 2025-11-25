import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, X, MessageSquare, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingChatProps {
  reportId?: string;
  reportContext?: {
    patient_name: string;
    report_type: string;
    summary?: any;
  };
}

export default function FloatingChat({ reportId, reportContext }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with context-aware welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: reportContext
          ? `Hello! I'm your AI medical assistant. I can see you're viewing the ${reportContext.report_type} for ${reportContext.patient_name}. I can help you understand the findings, explain medical terms, or answer any questions about this report. I can also guide you through the platform. What would you like to know?`
          : "Hello! I'm your AI medical assistant. I can help you understand medical reports, explain diagnoses, guide you through the platform, and answer health-related questions. How can I assist you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, reportContext]);

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
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          message: userMessage.content,
          conversationHistory: messages.slice(-5),
          reportId: reportId,
          reportContext: reportContext,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
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
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-110 transition-all duration-300"
            >
              <Bot className="h-7 w-7 md:h-8 md:w-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : undefined
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto w-full md:w-[420px] md:max-h-[600px] h-[100dvh] md:h-[600px] z-50"
          >
            <Card className="backdrop-blur-xl bg-card/95 border-primary/30 shadow-2xl overflow-hidden flex flex-col h-full">
              {/* Header */}
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Assistant</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {reportContext ? `Analyzing: ${reportContext.report_type}` : "Here to help"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 h-[calc(100dvh-180px)] md:max-h-[420px]">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mt-1">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}

                        <div className={`max-w-[85%] ${message.role === "user" ? "order-1" : "order-2"}`}>
                          <div
                            className={`p-3 rounded-2xl text-sm ${
                              message.role === "user"
                                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                                : "bg-muted/50 border border-border"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {message.role === "user" && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mt-1">
                            <User className="h-4 w-4 text-accent" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 justify-start"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted/50 border p-3 rounded-2xl">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input */}
                  <div className="p-3 border-t bg-background/50">
                    <div className="flex gap-2">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="min-h-[45px] max-h-[100px] resize-none text-sm"
                        disabled={loading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        size="icon"
                        className="h-[45px] w-[45px] bg-gradient-to-br from-primary to-primary/80"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
