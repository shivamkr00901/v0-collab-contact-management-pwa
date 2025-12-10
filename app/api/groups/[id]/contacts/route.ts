import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${params.id} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const contacts = await sql`
      SELECT c.*, u.name as added_by_name FROM contacts c
      LEFT JOIN users u ON c.added_by = u.id
      WHERE c.group_id = ${params.id}
      ORDER BY c.name ASC
    `

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${params.id} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, phone_number, email, notes } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO contacts (group_id, name, phone_number, email, notes, added_by)
      VALUES (${params.id}, ${name}, ${phone_number || null}, ${email || null}, ${notes || null}, ${user.userId})
      RETURNING *
    `

    return NextResponse.json({ contact: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Create contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
