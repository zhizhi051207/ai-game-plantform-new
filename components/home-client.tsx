"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gamepad2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Game {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  htmlContent: string;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  user?: {
    name: string | null;
    email: string | null;
  };
}

interface HomeClientProps {
  session: Session | null;
  initialPublicGames: Game[];
  initialUserGames: Game[];
}

export default function HomeClient({ session, initialPublicGames, initialUserGames }: HomeClientProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<string | null>(null);
  const [publicGames, setPublicGames] = useState<Game[]>(initialPublicGames);
  const [userGames, setUserGames] = useState<Game[]>(initialUserGames);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedGame(data.gameId);
        // 刷新用户游戏列表
        if (session?.user?.email) {
          const userGamesResponse = await fetch("/api/games?type=user");
          if (userGamesResponse.ok) {
            const { games } = await userGamesResponse.json();
            setUserGames(games);
          }
        }
        // 刷新公共游戏列表
        const publicGamesResponse = await fetch("/api/games?type=public&limit=6");
        if (publicGamesResponse.ok) {
          const { games } = await publicGamesResponse.json();
          setPublicGames(games);
        }
      } else {
        alert("Failed to generate game: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating game");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "just now";
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Generate Mini Games with <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe a game idea in one sentence, and our AI will create a playable HTML game for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your Game
            </CardTitle>
            <CardDescription>
              Enter a prompt like "a snake game where you eat apples" or "a puzzle with rotating blocks"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your game idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {session ? (
                  <span>Logged in as {session.user?.email}</span>
                ) : (
                  <span>
                    <Link href="/api/auth/signin" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to save your games
                  </span>
                )}
              </div>
              <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Generating..." : "Generate Game"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Public Games
            </CardTitle>
            <CardDescription>Recently created games by the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {publicGames.length > 0 ? (
                publicGames.slice(0, 3).map((game) => (
                  <div key={game.id} className="p-3 border rounded-lg hover:bg-accent/50">
                    <div className="font-medium">{game.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.description || "AI-generated game"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      By {game.user?.name || "Anonymous"} • {formatDate(game.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 border rounded-lg text-center text-muted-foreground">
                  No public games yet. Be the first to create one!
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/games">View All Public Games</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Games</CardTitle>
            <CardDescription>
              {session
                ? "Manage your created games"
                : "Sign in to create and manage your games"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-3">
                {userGames.length > 0 ? (
                  userGames.slice(0, 3).map((game) => (
                    <div key={game.id} className="p-3 border rounded-lg hover:bg-accent/50">
                      <div className="font-medium">{game.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {game.description || "AI-generated game"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {formatDate(game.createdAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">You haven't created any games yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Sign in to start creating games</p>
                <Button asChild>
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
              </div>
            )}
            {session && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/my-games">Manage All Games</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {generatedGame && (
        <Card className="mt-8 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Game Generated!</CardTitle>
            <CardDescription>
              Your game is ready to play. You can view it in your games list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href={`/game/${generatedGame}`}>Play Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/my-games">View All My Games</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}