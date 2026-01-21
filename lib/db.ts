// 极简内存存储实现 - 用于快速构建
export interface GameInput {
  title: string
  description?: string
  prompt: string
  htmlContent: string
  isPublic: boolean
  userId: string
}

export interface UserInput {
  email: string
  name?: string
  password?: string
  image?: string
}

interface GameRecord {
  id: string
  title: string
  description: string | null
  prompt: string
  htmlContent: string
  isPublic: boolean
  userId: string
  createdAt: Date
  user?: {
    name: string | null
    email: string | null
  }
}

interface UserRecord {
  id: string
  email: string
  name: string | null
  password: string | null
  image: string | null
  createdAt: Date
}

// 内存存储
const games = new Map<string, GameRecord>();
const users = new Map<string, UserRecord>();

// 生成ID
function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 游戏操作
export async function createGame(data: GameInput): Promise<GameRecord> {
  const id = generateId();
  const createdAt = new Date();
  const user = await getUserById(data.userId);
  
  const game: GameRecord = {
    id,
    title: data.title,
    description: data.description || null,
    prompt: data.prompt,
    htmlContent: data.htmlContent,
    isPublic: data.isPublic,
    userId: data.userId,
    createdAt,
    user: user ? {
      name: user.name,
      email: user.email,
    } : undefined
  };
  
  games.set(id, game);
  return game;
}

export async function getGame(id: string): Promise<GameRecord | null> {
  const game = games.get(id);
  if (!game) return null;
  
  const user = await getUserById(game.userId);
  return {
    ...game,
    user: user ? {
      name: user.name,
      email: user.email,
    } : undefined
  };
}

export async function getPublicGames(limit = 20): Promise<GameRecord[]> {
  const allGames = Array.from(games.values())
    .filter(game => game.isPublic)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
  
  // 添加用户信息
  return Promise.all(allGames.map(async (game) => {
    const user = await getUserById(game.userId);
    return {
      ...game,
      user: user ? {
        name: user.name,
        email: user.email,
      } : undefined
    };
  }));
}

export async function getUserGames(userId: string): Promise<GameRecord[]> {
  const userGames = Array.from(games.values())
    .filter(game => game.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  const user = await getUserById(userId);
  const userInfo = user ? {
    name: user.name,
    email: user.email,
  } : undefined;
  
  return userGames.map(game => ({
    ...game,
    user: userInfo
  }));
}

export async function getAllGames(): Promise<GameRecord[]> {
  const allGames = Array.from(games.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return Promise.all(allGames.map(async (game) => {
    const user = await getUserById(game.userId);
    return {
      ...game,
      user: user ? {
        name: user.name,
        email: user.email,
      } : undefined
    };
  }));
}

// 用户操作
export async function createUser(data: UserInput): Promise<UserRecord> {
  const id = generateId();
  const createdAt = new Date();
  
  // 检查用户是否已存在
  const existingUser = Array.from(users.values()).find(u => u.email === data.email);
  if (existingUser) {
    return existingUser;
  }
  
  const user: UserRecord = {
    id,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    password: data.password || null,
    image: data.image || null,
    createdAt
  };
  
  users.set(id, user);
  return user;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const user = Array.from(users.values()).find(u => u.email === email);
  return user || null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return users.get(id) || null;
}

export async function updateUser(id: string, data: Partial<UserInput>): Promise<UserRecord | null> {
  const user = await getUserById(id);
  if (!user) return null;
  
  const updatedUser = {
    ...user,
    ...(data.email !== undefined && { email: data.email }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.password !== undefined && { password: data.password }),
    ...(data.image !== undefined && { image: data.image }),
  };
  
  users.set(id, updatedUser);
  return updatedUser;
}

// 空的演示数据函数（已禁用）
export async function seedDemoData() {
  console.log('Seed demo data disabled for fast builds');
}