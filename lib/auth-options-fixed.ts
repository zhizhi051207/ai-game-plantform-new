import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync, hashSync } from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize: No credentials provided");
          return null;
        }

        try {
          console.log("Authorize: Looking for user with email:", credentials.email);
          // 查找用户
          const user = await getUserByEmail(credentials.email);

          // 如果用户不存在，创建新用户
          if (!user) {
            console.log("Authorize: User not found, creating new user");
            const hashedPassword = hashSync(credentials.password, 10);
            const newUser = await createUser({
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
            });
            console.log("Authorize: New user created:", newUser.id, newUser.email);
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            };
          }

          // 验证密码
          if (!user.password) {
            console.log("Authorize: User has no password");
            return null; // 用户没有密码（可能是OAuth用户）
          }

          const isPasswordValid = compareSync(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            console.log("Authorize: Invalid password");
            return null;
          }

          console.log("Authorize: User authenticated:", user.id, user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "demo-secret",
  debug: true, // 始终启用调试模式以便排查问题
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  // 生产环境关键配置
  trustHost: true, // Vercel部署必需
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      console.log("Session callback - token:", token?.sub, "session user:", session?.user?.email);
      if (session?.user) {
        session.user.id = token.sub;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      console.log("JWT callback - token:", token?.sub, "user:", user?.email);
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
};