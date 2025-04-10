"use client";

import { Button } from "@/components/ui/button";
import { useMintNftTool } from "@/hooks/useMintNft";
import { useSendNativeCoinTool } from "@/hooks/useSendNativeCoin";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, RotateCcw } from "lucide-react";
import { lazy, Suspense, type FormEvent, useEffect, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import {
  financeDashboardTool,
  generateQuizTool,
  graspAcademyNFTTool,
  mintNftTool,
  quizGeneratorUITool,
  sendNativeCoinTool,
  showDashboardTool,
  swapTool,
  yuzuBuddiesMinterTool,
} from "../mastra/tools";
import {
  GraspAcademyNFTTool,
  LeaderboardToolUI,
  QuizGeneratorTool,
  YuzuBuddiesMinterTool,
} from "@/components/ui-tools";

// Lazy load components
const FinanceDashboardTool = lazy(() => import("@/components/ui-tools/FinanceDashboardTool"));
const SwapTool = lazy(() => import("@/components/ui-tools/SwapTool"));

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
const FeatureCard = memo(() => {
  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold">Available Features</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">Here's what you can do:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Swap tokens on Sailfish</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Choose between 4 options and mint for free on Ed3</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Mint exclusive token on Grasp Academy</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Create quiz on DailyWiser</span>
            </li>
            {/* <li className="flex items-center gap-2">
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
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";

// Message Part Renderer Component
const MessagePartRenderer = memo(({ part, index }: { part: Part, index: number }) => {
  if (part.type === "text") {
    return (
      <div key={index} className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{part.text || ""}</ReactMarkdown>
      </div>
    );
  }

  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === financeDashboardTool.id) {
    if (part.toolInvocation.state === "result") {
      return (
        <Suspense fallback={<p className="text-muted-foreground italic">Loading finance dashboard...</p>}>
          <FinanceDashboardTool key={index} />
        </Suspense>
      );
    }

    return (
      <p key={index} className="text-muted-foreground italic">
        Loading finance dashboard...
      </p>
    );
  }

  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === swapTool.id) {
    if (part.toolInvocation.state === "result") {
      return (
        <Suspense fallback={<p className="text-muted-foreground italic">Loading token swap interface...</p>}>
          <SwapTool key={index} />
        </Suspense>
      );
    }

    return (
      <p key={index} className="text-muted-foreground italic">
        Loading token swap interface...
      </p>
    );
  }

  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === graspAcademyNFTTool.id) {
    if (part.toolInvocation.state === "result") {
      return (
        <Suspense fallback={<p className="text-muted-foreground italic">Loading Grasp Academy NFT interface...</p>}>
          <GraspAcademyNFTTool key={index} />
        </Suspense>
      );
    }

    return (
      <p key={index} className="text-muted-foreground italic">
        Loading Grasp Academy NFT interface...
      </p>
    );
  }

  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === yuzuBuddiesMinterTool.id) {
    if (part.toolInvocation.state === "result") {
      return (
        <Suspense fallback={<p className="text-muted-foreground italic">Loading Yuzu Buddies minter interface...</p>}>
          <YuzuBuddiesMinterTool key={index} />
        </Suspense>
      );
    }

    return (
      <p key={index} className="text-muted-foreground italic">
        Loading Yuzu Buddies minter interface...
      </p>
    );
  }

  if (part.type === "tool-invocation" && part.toolInvocation?.toolName === quizGeneratorUITool.id) {
    if (part.toolInvocation.state === "result") {
      return (
        <Suspense fallback={<p className="text-muted-foreground italic">Loading Quiz Generator interface...</p>}>
          <QuizGeneratorTool key={index} />
        </Suspense>
      );
    }

    return (
      <p key={index} className="text-muted-foreground italic">
        Loading Quiz Generator interface...
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
});

MessagePartRenderer.displayName = "MessagePartRenderer";

// Message Bubble Component
const MessageBubble = memo(({ message }: { message: any }) => {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const hasParts = isAssistant && Array.isArray(message.parts);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${isUser
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
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

function ChatContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, address } = useAccount();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  
  // Keep hooks at the top level, but we can conditionally use their results
  const { handleMintNft } = useMintNftTool();
  const { handleSendNativeCoin } = useSendNativeCoinTool();

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
            if (isConnected && address) {
              await handleMintNft(
                { to: address },
                (confirmationResult: string) => {
                  append({
                    content: confirmationResult,
                    role: 'data'
                  });
                }
              );
            }
            break;

          case sendNativeCoinTool.id:
            if (isConnected && address) {
              await handleSendNativeCoin(
                toolCall.args,
                (confirmationResult: string) => {
                  append({
                    content: confirmationResult,
                    role: 'data'
                  });
                }
              );
            }
            break;

          case financeDashboardTool.id:
            // Add logic to handle financeDashboardTool
            break;

          case swapTool.id:
            // Add logic to handle swapTool
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
