import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getGame } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Globe, Calendar, User } from "lucide-react";
import Link from "next/link";
import GameIframe from "@/components/game-iframe";
import GameActionsClient from "@/components/game-actions-client";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  const game = await getGame(id);

  if (!game) {
    notFound();
  }

  const isOwner =
    (session?.user?.id && game.userId === session.user.id) ||
    game.user?.email === session?.user?.email;


  const isHtmlComplete = (content: string) => {
    const lower = content.toLowerCase();
    return lower.includes("</html>") || lower.includes("</body>");
  };
  const htmlValid = isHtmlComplete(game.htmlContent);


  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Public Games
          </Link>
        </Button>
        <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {game.user?.name || game.user?.email || "Anonymous"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(game.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" />
            AI Generated
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Play Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {htmlValid ? (
                <GameIframe
                  html={game.htmlContent}
                  title={game.title}
                  minHeight={360}
                />
              ) : (
                <div className="p-6 text-sm text-destructive">
                  当前版本的HTML不完整，无法渲染游戏。请点击右侧“Edit This Game”重新生成。
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                The game runs in an iframe with sandboxed security. If you encounter issues, try refreshing.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
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
                <p className="text-sm">{new Date(game.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visibility</h3>
                <p className="text-sm">{game.isPublic ? "Public (visible to everyone)" : "Private (only you can see)"}</p>
              </div>
            </CardContent>
          </Card>

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
                <a href={`data:text/html;charset=utf-8,${encodeURIComponent(game.htmlContent)}`} download={`${game.title.replace(/\s+/g, '_')}.html`}>
                  Download HTML
                </a>
              </Button>
              {isOwner && (
                <GameActionsClient gameId={game.id} isPublic={game.isPublic} />
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Create Similar Game</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}