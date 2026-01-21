import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
    });

    // 返回成功响应（不包含密码）
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account", details: error.message },
      { status: 500 }
    );
  }
}