"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Code2 } from "lucide-react";

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

  const handleEdit = async (mode: "ai" | "html") => {
    setError("");
    if (mode === "ai" && !instruction.trim()) {
      setError("请输入修改指令");
      return;
    }
    if (mode === "html" && !html.trim()) {
      setError("请输入完整的HTML源码");
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit: {title}</h1>
        <p className="text-muted-foreground">基于已有游戏进行二次编辑，保存为新版本（不会覆盖原游戏）。</p>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 修改指令
            </CardTitle>
            <CardDescription>描述你想要的改动，例如：增加关卡、调整配色、加入音效</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="输入修改指令..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[160px]"
              disabled={loading === "ai"}
            />
            <div className="text-xs text-muted-foreground">原始提示词：{prompt}</div>
            <Button className="w-full" onClick={() => handleEdit("ai")} disabled={loading !== null}>
              {loading === "ai" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "ai" ? "正在生成新版本..." : "用AI生成新版本"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              直接编辑HTML
            </CardTitle>
            <CardDescription>你可以直接修改源码，保存为新版本</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="粘贴或编辑HTML源码..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[320px] font-mono text-xs"
              disabled={loading === "html"}
            />
            <Button className="w-full" variant="outline" onClick={() => handleEdit("html")} disabled={loading !== null}>
              {loading === "html" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "html" ? "正在保存新版本..." : "保存为新版本"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
