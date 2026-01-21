// 完整的内存存储实现
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

export async function createGame(data: GameInput): Promise<GameRecord> {
  const id = generateId();
  const game: GameRecord = {
    id,
    title: data.title,
    description: data.description || null,
    prompt: data.prompt,
    htmlContent: data.htmlContent,
    isPublic: data.isPublic,
    userId: data.userId,
    createdAt: new Date(),
    user: {
      name: data.userId.split('@')[0] || 'Anonymous',
      email: data.userId,
    },
  };
  games.set(id, game);
  return game;
}

export async function getGame(id: string): Promise<GameRecord | null> {
  return games.get(id) || null;
}

export async function getPublicGames(limit = 20): Promise<GameRecord[]> {
  return Array.from(games.values())
    .filter(game => game.isPublic)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getUserGames(userId: string): Promise<GameRecord[]> {
  return Array.from(games.values())
    .filter(game => game.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllGames(): Promise<GameRecord[]> {
  return Array.from(games.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createUser(data: UserInput): Promise<UserRecord> {
  const id = generateId();
  const user: UserRecord = {
    id,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    password: data.password || null,
    image: data.image || null,
    createdAt: new Date(),
  };
  users.set(id, user);
  users.set(data.email, user); // 也通过email索引
  return user;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  // 首先尝试通过email查找
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return users.get(id) || null;
}

export async function updateUser(id: string, data: Partial<UserInput>): Promise<UserRecord | null> {
  const user = users.get(id);
  if (!user) return null;
  
  const updatedUser = { ...user, ...data };
  users.set(id, updatedUser);
  return updatedUser;
}

// 初始化演示数据
export async function seedDemoData() {
  // 创建演示用户
  const demoUser1 = await createUser({
    email: 'alex@example.com',
    name: 'Alex',
    password: '$2a$10$YourHashedPasswordHere',
  });

  const demoUser2 = await createUser({
    email: 'taylor@example.com',
    name: 'Taylor',
    password: '$2a$10$YourHashedPasswordHere',
  });

  // 检查是否已有演示游戏
  if (games.size === 0) {
    await createGame({
      title: 'Snake Evolution',
      description: 'A snake that grows when eating colorful dots',
      prompt: 'Snake game where you eat apples and grow longer',
      htmlContent: `<html>
        <head>
          <title>Snake Game</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
            canvas { border: 2px solid #333; background: #000; }
          </style>
        </head>
        <body>
          <canvas id="gameCanvas" width="400" height="400"></canvas>
          <script>
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            let snake = [{x: 200, y: 200}];
            let food = {x: 100, y: 100};
            let dx = 20, dy = 0;
            let score = 0;

            function draw() {
              ctx.fillStyle = 'black';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = 'lime';
              snake.forEach(segment => {
                ctx.fillRect(segment.x, segment.y, 18, 18);
              });
              ctx.fillStyle = 'red';
              ctx.fillRect(food.x, food.y, 18, 18);
              ctx.fillStyle = 'white';
              ctx.font = '16px Arial';
              ctx.fillText('Score: ' + score, 10, 20);
            }

            function move() {
              const head = {x: snake[0].x + dx, y: snake[0].y + dy};
              if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                reset();
                return;
              }
              snake.unshift(head);
              if (head.x === food.x && head.y === food.y) {
                score++;
                food = {x: Math.floor(Math.random() * 20) * 20, y: Math.floor(Math.random() * 20) * 20};
              } else {
                snake.pop();
              }
            }

            function reset() {
              snake = [{x: 200, y: 200}];
              dx = 20; dy = 0;
              score = 0;
            }

            document.addEventListener('keydown', e => {
              if (e.key === 'ArrowUp' && dy !== 20) { dx = 0; dy = -20; }
              if (e.key === 'ArrowDown' && dy !== -20) { dx = 0; dy = 20; }
              if (e.key === 'ArrowLeft' && dx !== 20) { dx = -20; dy = 0; }
              if (e.key === 'ArrowRight' && dx !== -20) { dx = 20; dy = 0; }
            });

            setInterval(() => {
              move();
              draw();
            }, 100);
          </script>
        </body>
      </html>`,
      isPublic: true,
      userId: demoUser1.id,
    });

    await createGame({
      title: 'Space Invaders Lite',
      description: 'Defend Earth from alien spaceships',
      prompt: 'Space invaders with flying saucers',
      htmlContent: `<html>
        <head>
          <title>Space Invaders Lite</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a2a; }
            canvas { border: 1px solid #fff; }
          </style>
        </head>
        <body>
          <canvas id="gameCanvas" width="600" height="400"></canvas>
          <script>
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            let player = { x: canvas.width/2 - 25, y: canvas.height - 50, width: 50, height: 20 };
            let bullets = [];
            let enemies = [];
            let score = 0;

            for (let i = 0; i < 5; i++) {
              for (let j = 0; j < 3; j++) {
                enemies.push({ x: 100 + i * 80, y: 50 + j * 60, width: 30, height: 30, alive: true });
              }
            }

            function draw() {
              ctx.fillStyle = '#0a0a2a';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#0af';
              ctx.fillRect(player.x, player.y, player.width, player.height);
              ctx.fillStyle = '#ff0';
              bullets.forEach(b => {
                ctx.fillRect(b.x, b.y, 5, 15);
              });
              ctx.fillStyle = '#f00';
              enemies.forEach(e => {
                if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
              });
              ctx.fillStyle = 'white';
              ctx.font = '20px Arial';
              ctx.fillText('Score: ' + score, 10, 30);
            }

            function update() {
              bullets.forEach(b => b.y -= 10);
              bullets = bullets.filter(b => b.y > 0);
              bullets.forEach(b => {
                enemies.forEach(e => {
                  if (e.alive && b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
                    e.alive = false;
                    score += 10;
                  }
                });
              });
            }

            document.addEventListener('keydown', e => {
              if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 20;
              if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) player.x += 20;
              if (e.key === ' ') {
                bullets.push({ x: player.x + player.width/2 - 2.5, y: player.y - 15 });
              }
            });

            function gameLoop() {
              update();
              draw();
              requestAnimationFrame(gameLoop);
            }
            gameLoop();
          </script>
        </body>
      </html>`,
      isPublic: true,
      userId: demoUser2.id,
    });
  }
}

// 初始化演示数据
// seedDemoData(); // Disabled for faster build