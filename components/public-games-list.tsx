"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, User, Calendar } from "lucide-react";
import GameIframe from "@/components/game-iframe";

interface PublicGamesListProps {
  initialGames: any[];
  total: number;
  pageSize: number;
}

export default function PublicGamesList({
  initialGames,
  total,
  pageSize,
}: PublicGamesListProps) {
  const [games, setGames] = useState(initialGames);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(initialGames.length);
  const canLoadMore = loaded < total;

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/games?type=public&limit=${pageSize}&offset=${loaded}`
      );
      const data = await res.json();
      if (data?.games) {
        setGames((prev) => [...prev, ...data.games]);
        setLoaded((prev) => prev + data.games.length);
      }
    } finally {
      setLoading(false);
    }
  };

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No public games yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a game!</p>
          <Button asChild>
            <Link href="/">Create a Game</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game: any) => (
          <Card key={game.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-1">{game.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {game.description || "AI-generated game"}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex-grow pb-28">
              <div className="absolute bottom-4 left-4">
                <div className="w-48 h-28 overflow-hidden rounded-md border bg-background shadow-sm">
                  <GameIframe
                    html={game.htmlContent}
                    title={`${game.title} preview`}
                    fixedWidth={520}
                    fixedHeight={320}
                    scale={0.3}
                    className="pointer-events-none"
                  />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground space-y-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span>{game.user?.name || game.user?.email || "Anonymous"}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/game/${game.id}`}>Play Game</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {canLoadMore && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
