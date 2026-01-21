// In-memory store for games (for demo purposes)
// In production, replace with database

export interface Game {
  id: string;
  title: string;
  description: string;
  prompt: string;
  htmlContent: string;
  isPublic: boolean;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: Date;
}

const games = new Map<string, Game>();

export function createGame(
  prompt: string,
  htmlContent: string,
  userId: string,
  userName?: string,
  userEmail?: string
): Game {
  const id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const game: Game = {
    id,
    title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
    description: `AI-generated game from prompt: ${prompt}`,
    prompt,
    htmlContent,
    isPublic: true, // default public for demo
    userId,
    userName,
    userEmail,
    createdAt: new Date(),
  };
  games.set(id, game);
  return game;
}

export function getGame(id: string): Game | undefined {
  return games.get(id);
}

export function getPublicGames(limit = 20): Game[] {
  return Array.from(games.values())
    .filter(game => game.isPublic)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function getUserGames(userId: string): Game[] {
  return Array.from(games.values())
    .filter(game => game.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getAllGames(): Game[] {
  return Array.from(games.values());
}

// Seed with some demo games
createGame(
  "Snake game where you eat apples and grow longer",
  `<html>
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
  "demo_user_1",
  "Alex",
  "alex@example.com"
);

createGame(
  "Space invaders with flying saucers",
  `<html>
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
  "demo_user_2",
  "Taylor",
  "taylor@example.com"
);