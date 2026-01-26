import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getGame } from "@/lib/db";
import GameDetailClient from "@/components/game-detail-client";

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
    <GameDetailClient
      game={{
        ...game,
        createdAt: game.createdAt.toISOString(),
      }}
      isOwner={isOwner}
      htmlValid={htmlValid}
    />
  );
}
