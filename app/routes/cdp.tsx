"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { useState, FormEvent } from "react";

export const Route = createFileRoute('/cdp')({
  component: CDPChat,
});

function CDPChat() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/cdp",
    maxSteps: 5,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your query..."
          className="flex-1 p-2 border rounded"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
