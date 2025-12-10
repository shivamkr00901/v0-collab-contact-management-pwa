import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const password_hash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, name) VALUES (${email}, ${password_hash}, ${name})
      RETURNING id, email, name
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const user = result[0]
    const token = await createToken({ userId: user.id, email: user.email })
    await setAuthCookie(token)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
