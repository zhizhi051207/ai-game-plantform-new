import { PrismaClient } from "@prisma/client";

// Prisma client singleton
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface GameInput {
  title: string;
  description?: string;
  prompt: string;
  htmlContent: string;
  isPublic: boolean;
  userId: string;
}

export interface UserInput {
  email: string;
  name?: string;
  password?: string;
  image?: string;
}

// Helper: resolve userId (may be email)
async function resolveUserId(userIdOrEmail: string): Promise<string | null> {
  if (userIdOrEmail.includes("@")) {
    const user = await prisma.user.findUnique({
      where: { email: userIdOrEmail },
      select: { id: true },
    });
    if (user) return user.id;

    const created = await prisma.user.create({
      data: {
        email: userIdOrEmail,
        name: userIdOrEmail.split("@")[0],
      },
      select: { id: true },
    });
    return created.id;
  }

  // treat as user id
  const existing = await prisma.user.findUnique({
    where: { id: userIdOrEmail },
    select: { id: true },
  });
  if (existing) return existing.id;
  return null;
}

// 游戏操作
export async function createGame(data: GameInput) {
  const userId = await resolveUserId(data.userId);
  if (!userId) throw new Error("User not found for game creation");

  return prisma.game.create({
    data: {
      title: data.title,
      description: data.description || null,
      prompt: data.prompt,
      htmlContent: data.htmlContent,
      isPublic: data.isPublic,
      userId,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getGame(id: string) {
  return prisma.game.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getPublicGames(limit = 20) {
  return prisma.game.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getPublicGamesPage(limit = 20, offset = 0) {
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.game.count({ where: { isPublic: true } }),
  ]);

  return { games, total };
}

export async function getUserGames(userIdOrEmail: string) {
  const userId = await resolveUserId(userIdOrEmail);
  if (!userId) return [];

  return prisma.game.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getAllGames() {
  return prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

// 用户操作
export async function createUser(data: UserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) return existingUser;

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name || data.email.split("@")[0],
      password: data.password || null,
      image: data.image || null,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUser(id: string, data: Partial<UserInput>) {
  return prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      image: data.image,
    },
  });
}

// 空的演示数据函数（已禁用）
export async function seedDemoData() {
  console.log("Seed demo data disabled for production database");
}
