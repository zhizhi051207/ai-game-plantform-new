"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Gamepad2, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameIframe from "@/components/game-iframe";

interface GameUser {
  name: string | null;
  email: string | null;
}

interface GameClient {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  htmlContent: string;
  isPublic: boolean;
  createdAt: string;
  user?: GameUser | null;
}

interface GameDetailClientProps {
  game: GameClient;
  isOwner: boolean;
  htmlValid: boolean;
}

export default function GameDetailClient({
  game,
  isOwner,
  htmlValid,
}: GameDetailClientProps) {
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);
  const isWide = (contentSize?.width || 0) > 900;

  const createdDate = useMemo(() => new Date(game.createdAt), [game.createdAt]);

  const gameDetailsCard = (
    <Card>
      <CardHeader>
        <CardTitle>Game Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Original Prompt</h3>
          <p className="text-sm bg-muted p-3 rounded">{game.prompt}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Generated On</h3>
          <p className="text-sm">{createdDate.toLocaleString()}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Visibility</h3>
          <p className="text-sm">
            {game.isPublic
              ? "Public (visible to everyone)"
              : "Private (only you can see)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const actionsCard = (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isOwner && (
          <Button className="w-full" asChild>
            <Link href={`/game/${game.id}/edit`}>Edit This Game</Link>
          </Button>
        )}
        <Button className="w-full" asChild>
          <a
            href={`data:text/html;charset=utf-8,${encodeURIComponent(
              game.htmlContent
            )}`}
            download={`${game.title.replace(/\s+/g, "_")}.html`}
          >
            Download HTML
          </a>
        </Button>
        <Button className="w-full" variant="outline" asChild>
          <Link href="/generate">Create Similar Game</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Public Games
          </Link>
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{game.title}</h1>
            <p className="text-muted-foreground">{game.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {game.isPublic && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Public
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {game.user?.name || game.user?.email || "Anonymous"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {createdDate.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" />
            AI Generated
          </div>
        </div>
      </div>

      {isWide && <div className="mb-6">{gameDetailsCard}</div>}

      <div className={isWide ? "space-y-6" : "grid md:grid-cols-3 gap-8"}>
        <Card className={isWide ? "" : "md:col-span-2"}>
          <CardHeader>
            <CardTitle>Play Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto">
              {htmlValid ? (
                <div
                  style={{
                    width: contentSize?.width ? `${contentSize.width}px` : "100%",
                    minHeight: contentSize?.height
                      ? `${contentSize.height}px`
                      : undefined,
                  }}
                >
                  <GameIframe
                    html={game.htmlContent}
                    title={game.title}
                    minHeight={360}
                    onSizeChange={setContentSize}
                  />
                </div>
              ) : (
                <div className="p-6 text-sm text-destructive">
                  当前版本的HTML不完整，无法渲染游戏。请点击右侧“Edit This Game”重新生成。
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                The game runs in an iframe with sandboxed security. If you encounter
                issues, try refreshing.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!isWide && gameDetailsCard}
          {actionsCard}
        </div>
      </div>
    </div>
  );
}
