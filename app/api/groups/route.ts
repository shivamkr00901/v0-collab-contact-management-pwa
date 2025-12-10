import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const groups = await sql`
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${user.userId}
      ORDER BY g.updated_at DESC
    `

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Get groups error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO groups (name, description, created_by)
      VALUES (${name}, ${description || null}, ${user.userId})
      RETURNING *
    `

    const group = result[0]

    await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${group.id}, ${user.userId}, 'admin')
    `

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error("Create group error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
