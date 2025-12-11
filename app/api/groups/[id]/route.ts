import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const groupId = params.id

    // Verify user is admin of the group
    const groupCheck = await sql`
      SELECT g.created_by FROM groups g
      WHERE g.id = ${groupId}
    `

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (groupCheck[0].created_by !== user.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Delete group (cascade will handle related records)
    await sql`DELETE FROM groups WHERE id = ${groupId}`

    return NextResponse.json({ message: "Group deleted" })
  } catch (error) {
    console.error("Delete group error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const group = await sql`
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = ${params.id} AND gm.user_id = ${user.userId}
    `

    if (group.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json({ group: group[0] })
  } catch (error) {
    console.error("Get group error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
