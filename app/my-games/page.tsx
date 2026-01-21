import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserGames } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, User, Calendar, Eye, Trash2, Copy } from "lucide-react";
import Link from "next/link";

export default async function MyGamesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Games</h1>
          <p className="text-muted-foreground">
            Manage and play your AI-generated games. Sign in to view your games.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to view and manage your games.
            </p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const games = await getUserGames(session.user.id || session.user.email);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Games</h1>
        <p className="text-muted-foreground">
          Manage and play your AI-generated games.
        </p>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any games yet. Generate your first game!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/">Generate a Game</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/games">View Public Games</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game: any) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{game.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {game.description || "AI-generated game"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{game.isPublic ? "Public" : "Private"}</span>
                  </div>
                </div>
              </CardContent>
              <CardContent className="border-t pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button className="w-full" asChild>
                    <Link href={`/game/${game.id}`}>Play</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/?prompt=${encodeURIComponent(game.prompt)}`}>
                      <Copy className="h-4 w-4 mr-2" />
                      Similar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}