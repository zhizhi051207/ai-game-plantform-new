import { notFound, redirect } from "next/navigation";
import { getGame } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import GameEditClient from "@/components/game-edit-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GameEditPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;
  const game = await getGame(id);
  if (!game) {
    notFound();
  }

  const isOwner =
    (session.user.id && game.userId === session.user.id) ||
    game.user?.email === session.user.email;

  if (!isOwner) {
    notFound();
  }

  return (
    <GameEditClient
      gameId={game.id}
      title={game.title}
      prompt={game.prompt}
      htmlContent={game.htmlContent}
    />
  );
}
