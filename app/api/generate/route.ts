import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createGame } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";


// 初始化OpenAI客户端，连接到OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "X-Title": "AI Game Generator",
  },
});

export async function POST(request: NextRequest) {
  try {
    // 获取用户会话（要求认证）
    const session = await getServerSession(authOptions);
    console.log("=== GENERATE API SESSION DEBUG ===");
    console.log("Full session data:", JSON.stringify(session, null, 2));
    console.log("Session exists:", !!session);
    console.log("Session user:", session?.user);
    console.log("Session user email:", session?.user?.email);
    console.log("Session user id:", session?.user?.id);
    
    if (!session?.user?.email) {
      console.log("ERROR: No session or email found - returning 401");
      return NextResponse.json(
        { 
          error: "Authentication required",
          debug: {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasEmail: !!session?.user?.email
          }
        },
        { status: 401 }
      );
    }
    console.log("SUCCESS: User authenticated:", session.user.email, "User ID:", session.user.id);

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 检查API密钥
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OpenRouter API key is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }



    const normalizeHtml = (content: string) => {
      let result = content.trim();
      if (result.startsWith("```")) {
        result = result
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```\s*$/, "")
          .trim();
      }
      return result;
    };

    const isHtmlComplete = (content: string) => {
      const lower = content.toLowerCase();
      return lower.includes("</html>") || lower.includes("</body>");
    };

    const createCompletion = (model: string, provider?: { order: string[] }) =>
      openai.chat.completions.create({
        model,
        provider,
        messages: [
          {
            role: "system",
            content: `You are a game developer AI that creates polished, self-contained HTML5 games. Generate a complete HTML file with embedded CSS and JavaScript that implements the described game. Prefer Tailwind CSS via CDN and DaisyUI for UI components. Use GSAP for animations; if you choose a React-based UI, you may use Framer Motion (include React/ReactDOM + Framer Motion UMD). External dependencies are allowed ONLY for Tailwind CDN, DaisyUI CSS, GSAP, and optionally React/Framer Motion. REQUIREMENTS:\n- Visual quality: modern UI, pleasing color palette, soft shadows, rounded corners, gradients, and subtle animations.\n- Layout: a centered game container with header/title, instruction panel, status/score HUD, and a clear play area.\n- Typography: choose a clean font stack and consistent spacing.\n- Feedback: hover/pressed states, game-over/win banner or toast.\n- Responsiveness: mobile-friendly, full width on small screens, scalable canvas or responsive grid.\n- Performance: lightweight, avoid heavy computations.\nRespond with ONLY the HTML code, no explanations.`,
          },
          {
            role: "user",
            content: `Create a polished game: ${prompt}. The HTML file should include:
1. A canvas or DOM elements for the game
2. Tailwind CSS classes and DaisyUI components for styling
3. Embedded JavaScript for game logic
4. Clear instructions on how to play
5. A score/time/status display
6. Responsive design that works on desktop and mobile
7. Game states (start, playing, game over) with visual feedback
8. Animations using GSAP (or Framer Motion if you use React)
9. Sound effects if possible using Web Audio (no external assets)
Keep everything self-contained except the allowed CDNs (Tailwind, DaisyUI, GSAP, optional React/Framer Motion).`,
          },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      } as any);

    const extractContent = (completion: any) =>
      completion?.choices?.[0]?.message?.content || "";

    const tryGenerate = async () => {
      console.log("Calling OpenAI GPT-5.1-Codex-Mini with prompt:", prompt.substring(0, 100));
      let completion = await createCompletion("openai/gpt-5.1-codex-mini", { order: ["openai"] });
      let htmlContent = extractContent(completion);

      if (!htmlContent) {
        console.warn("Primary model returned empty content, retrying once...");
        completion = await createCompletion("openai/gpt-5.1-codex-mini", { order: ["openai"] });
        htmlContent = extractContent(completion);
      }

      if (!htmlContent) {
        console.warn("Primary model still empty, falling back to Gemini 3 Flash Preview");
        completion = await createCompletion("google/gemini-3-flash-preview", { order: ["google-ai-studio"] });
        htmlContent = extractContent(completion);
      }

      if (!htmlContent) {
        console.error("No content generated by AI. Completion payload:", JSON.stringify(completion));
        throw new Error("No content generated by AI");
      }

      return htmlContent;
    };

    let htmlContent = await tryGenerate();

    htmlContent = normalizeHtml(htmlContent);

    if (!isHtmlComplete(htmlContent)) {
      console.warn("Generated HTML incomplete, retrying once...");
      const retryCompletion = await createCompletion("google/gemini-3-flash-preview", { order: ["google-ai-studio"] });
      let retryContent = retryCompletion.choices[0].message.content || "";
      retryContent = normalizeHtml(retryContent);
      if (isHtmlComplete(retryContent)) {
        htmlContent = retryContent;
      }
    }

    console.log("Game generated successfully, length:", htmlContent.length);

    // 创建游戏记录到数据库
    const game = await createGame({
      title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
      description: `AI-generated game from prompt: ${prompt}`,
      prompt,
      htmlContent,
      isPublic: true,
      userId: session.user.email, // 使用邮箱确保存在用户记录
    });

    return NextResponse.json({
      success: true,
      gameId: game.id,
      title: game.title,
      htmlContent: game.htmlContent,
      message: "Game generated successfully!",
    });
  } catch (error: any) {
    console.error("Game generation error:", error);

    // 提供更详细的错误信息
    let errorMessage = "Failed to generate game";
    if (error.code === 403) {
      errorMessage = "The selected model is not available in your region or there is an issue with your OpenRouter account.";
    } else if (error.message?.includes("API key")) {
      errorMessage = "Invalid OpenRouter API key. Please check your configuration.";
    } else if (error.message?.includes("model")) {
      errorMessage = "Model configuration error. Please check if OpenAI GPT-5.1-Codex-Mini (openai/gpt-5.1-codex-mini) is available on OpenRouter.";
    }


    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || String(error),
        code: error.code,
      },
      { status: 500 }
    );
  }
}