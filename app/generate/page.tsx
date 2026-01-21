import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getPublicGames, getUserGames } from "@/lib/db";
import HomeClient from "@/components/home-client";

export default async function GeneratePage() {
  const session = await getServerSession(authOptions);
  const publicGames = await getPublicGames(6);
  const userGames = session?.user?.email
    ? await getUserGames(session.user.id || session.user.email)
    : [];

  return (
    <HomeClient
      session={session}
      initialPublicGames={publicGames}
      initialUserGames={userGames}
    />
  );
}
