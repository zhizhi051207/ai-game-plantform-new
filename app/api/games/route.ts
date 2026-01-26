import { NextRequest, NextResponse } from "next/server";
import { getPublicGames, getPublicGamesPage, getUserGames } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "public";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (type === "public") {
      const offset = parseInt(searchParams.get("offset") || "0");
      const { games, total } = await getPublicGamesPage(limit, offset);
      return NextResponse.json({ success: true, games, total });
    } else if (type === "user") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      const games = await getUserGames(session.user.id || session.user.email);
      return NextResponse.json({ success: true, games });
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}