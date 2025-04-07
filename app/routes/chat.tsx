"use client";

import ShowDashboardTool from "@/components/ui-tools/ShowDashboardTool";
import FinanceDashboardTool from "@/components/ui-tools/FinanceDashboardTool";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/db/schema";
import { useMintNftTool } from "@/hooks/useMintNft";
import { useSendNativeCoinTool } from "@/hooks/useSendNativeCoin";
import { useTRPC } from "@/trpc/react";
import { useChat } from "@ai-sdk/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, RotateCcw } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import {
  mintNftTool,
  sendNativeCoinTool,
  showDashboardTool,
  financeDashboardTool
} from "../mastra/tools";

type Part = {
  type: "tool-invocation" | "text";
  toolInvocation?: {
    state: "call" | "result";
    step: number;
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result?: {
      status: string;
    };
  };
  text?: string;
};

export const Route = createFileRoute('/chat')({
  component: ChatContent,
});

// Feature Card Component
const FeatureCard = () => {
  const trpc = useTRPC();
  const campaignQuery = useSuspenseQuery(trpc.task.getCampaignStatus.queryOptions());
  const campaign = campaignQuery.data as Campaign | undefined;
  const progress = campaign ? (Number(campaign.currentAmount) / Number(campaign.totalAmount)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">🎉 Try to Earn Giveaway</h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">Join our community and earn CRO tokens! Complete tasks to receive rewards.</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Campaign Progress</span>
                <span className="font-medium">{campaign?.currentAmount} / {campaign?.totalAmount} CRO</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold">Available Features</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">Here's what you can do:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Mint free tokens for testing</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Send native coin</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Check wallet balance</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Show dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Message Part Renderer Component
const MessagePartRenderer = ({ part, index }: { part: Part, index: number }) => {
  if (part.type === "text") {
    return (
      <div key={index} className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{part.text || ""}</ReactMarkdown>
      </div>
    );
  }
  
  // if (part.type === "tool-invocation" && part.toolInvocation?.toolName === showDashboardTool.id) {
  //   if (part.toolInvocation.state === "result") {
  //     return <ShowDashboardTool key={index} />;
  //   }
    
  //   return (
  //     <p key={index} className="text-muted-foreground italic">
  //       Loading dashboard...
  //     </p>
  //   );
  // }
  
  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === financeDashboardTool.id) {
    if (part.toolInvocation.state === "result") {
      return <FinanceDashboardTool key={index} />;
    }
    
    return (
      <p key={index} className="text-muted-foreground italic">
        Loading finance dashboard...
      </p>
    );
  }
  
  // Only show loading for tool invocations in "call" state
  if (part.type === "tool-invocation" && part.toolInvocation?.state === "call") {
    return (
      <p key={index} className="text-muted-foreground italic">
        Loading...
      </p>
    );
  }
  
  // For any other unhandled part types, return null
  return null;
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: any }) => {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const hasParts = isAssistant && Array.isArray(message.parts);
  
  // Check if this is just a dashboard tool message
  const isOnlyDashboard = isAssistant && message.parts?.some(
    (part: any) => 
      part.type === "tool-invocation" &&
      (part.toolInvocation?.toolName === showDashboardTool.id || 
       part.toolInvocation?.toolName === financeDashboardTool.id)
  );
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${
          isUser 
            ? "bg-primary/20 text-foreground rounded-2xl rounded-tr-none"
            : "bg-secondary text-foreground rounded-2xl rounded-tl-none"
        } p-4`}
      >
        {hasParts ? (
          // Render each part for assistant messages
          message.parts.map((part: Part, index: number) => (
            <MessagePartRenderer key={index} part={part} index={index} />
          ))
        ) : (
          // Fallback for user messages or simple assistant messages
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        
        {/* Show claim points card for assistant messages that aren't just dashboard */}
        {/* {isAssistant && !isOnlyDashboard && <ClaimPointsCard points={500} />} */}
      </div>
    </div>
  );
};

function ChatContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, address } = useAccount();
  const { handleMintNft } = useMintNftTool();
  const { handleSendNativeCoin } = useSendNativeCoinTool();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Handle iOS viewport issues with keyboard
  useEffect(() => {
    // Set initial viewport height
    setViewportHeight(window.innerHeight);
    
    const handleResize = () => {
      // Update viewport height when window resizes
      setViewportHeight(window.innerHeight);
    };
    
    // Handle focus and blur events on the textarea to manage iOS keyboard
    const handleFocus = () => {
      // On iOS, add a short timeout to allow the keyboard to appear
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
      }, 50);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Get the textarea element
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    addToolResult, 
    append 
  } = useChat({
    api: "/api/chat",
    maxSteps: 1,
    async onToolCall({ toolCall }) {
      try {
        switch (toolCall.toolName) {
          case mintNftTool.id:
            await handleMintNft(
              { to: address },
              (confirmationResult) => {
                append({
                  content: confirmationResult,
                  role: 'data'
                });
              }
            );
            break;

          case sendNativeCoinTool.id:
            console.log("toolCall.args", toolCall.args);
            await handleSendNativeCoin(
              toolCall.args,
              (confirmationResult: string) => {
                append({
                  content: confirmationResult,
                  role: 'data'
                });
              }
            );
            break;

          case financeDashboardTool.id:
            console.log("toolCall.args", toolCall.args);
            // Add logic to handle financeDashboardTool
            break;

          default:
            console.error(`Unknown tool call: ${toolCall.toolName}`);
            break;
        }
      } catch (error) {
        console.error("Tool call error:", error);
        addToolResult({
          toolCallId: toolCall.toolCallId,
          result: JSON.stringify({
            error: "Error processing tool call",
            message: error instanceof Error ? error.message : String(error)
          })
        });
      }
    },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  // Render the main content based on connection status and messages
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="space-y-6">
          <div className="bg-destructive/10 text-destructive rounded-2xl p-6 text-center">
            <p className="font-medium">Please connect your wallet to continue</p>
          </div>
          <FeatureCard />
        </div>
      );
    }
    
    if (messages.length === 0) {
      return <FeatureCard />;
    }
    
    return (
      <>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </>
    );
  };

  return (
    <div 
      className="flex flex-col bg-background" 
      style={{ 
        height: viewportHeight ? `${viewportHeight - 64}px` : 'calc(100vh - 64px)',
        maxHeight: '100vh'
      }}
    >
      {/* Messages area - fills available space but with minimum height */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-safe">
          {renderContent()}
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-border bg-background pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={onSubmit} className="relative">
            <div className="relative flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e)}
                placeholder={isConnected ? "Ask anything" : "Connect wallet to start chatting"}
                className="min-h-[44px] max-h-[200px] resize-none w-full bg-background rounded-xl border border-border p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-primary/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                disabled={!isConnected || isSubmitting}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90"
                disabled={!isConnected || !input.trim() || isSubmitting}
              >
                {isLoading ? (
                  <RotateCcw className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
