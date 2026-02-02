"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Code2, Copy, Check } from "lucide-react";

interface GameEditClientProps {
  gameId: string;
  title: string;
  prompt: string;
  htmlContent: string;
}

export default function GameEditClient({ gameId, title, prompt, htmlContent }: GameEditClientProps) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [html, setHtml] = useState(htmlContent);
  const [loading, setLoading] = useState<"ai" | "html" | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEdit = async (mode: "ai" | "html") => {
    setError("");
    if (mode === "ai" && !instruction.trim()) {
      setError("Please enter edit instructions");
      return;
    }
    if (mode === "html" && !html.trim()) {
      setError("Please enter full HTML source");
      return;
    }

    setLoading(mode);
    try {
      const response = await fetch("/api/generate/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          mode,
          instruction: mode === "ai" ? instruction : undefined,
          htmlContent: mode === "html" ? html : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to edit game");
      }
      router.push(`/game/${data.gameId}`);
    } catch (err: any) {
      setError(err?.message || "Failed to edit game");
    } finally {
      setLoading(null);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy HTML");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit: {title}</h1>
        <p className="text-muted-foreground">Edit this game based on the current version and save as a new version (the original game remains unchanged).</p>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Edit Instructions
            </CardTitle>
            <CardDescription>Describe the changes you want, e.g. add levels, tweak colors, add sound effects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter edit instructions..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[160px]"
              disabled={loading === "ai"}
            />
            <div className="text-xs text-muted-foreground">Original prompt: {prompt}</div>
            <Button className="w-full" onClick={() => handleEdit("ai")} disabled={loading !== null}>
              {loading === "ai" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "ai" ? "Generating new version..." : "Generate with AI"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Direct HTML Editing
              </CardTitle>
              <CardDescription>Edit the source directly and save as a new version.</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopyHtml}
              disabled={!html.trim()}
              aria-label="Copy HTML"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste or edit HTML source..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[320px] font-mono text-xs"
              disabled={loading === "html"}
            />
            <Button className="w-full" variant="outline" onClick={() => handleEdit("html")} disabled={loading !== null}>
              {loading === "html" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "html" ? "Saving new version..." : "Save as new version"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
