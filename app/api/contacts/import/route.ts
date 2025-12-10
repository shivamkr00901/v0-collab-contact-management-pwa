import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const groupId = formData.get("groupId") as string

    if (!file || !groupId) {
      return NextResponse.json({ error: "File and groupId required" }, { status: 400 })
    }

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${groupId} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const content = await file.text()
    const imported = []

    if (file.name.endsWith(".csv")) {
      const lines = content.split("\n").slice(1) // Skip header
      for (const line of lines) {
        if (!line.trim()) continue
        const [name, phone, email, notes] = line.split(",").map((v) => v.replace(/^"|"$/g, ""))

        const result = await sql`
          INSERT INTO contacts (group_id, name, phone_number, email, notes, added_by)
          VALUES (${groupId}, ${name}, ${phone || null}, ${email || null}, ${notes || null}, ${user.userId})
          RETURNING *
        `
        imported.push(result[0])
      }
    } else if (file.name.endsWith(".json")) {
      const data = JSON.parse(content)
      for (const contact of data.contacts) {
        const result = await sql`
          INSERT INTO contacts (group_id, name, phone_number, email, notes, added_by)
          VALUES (${groupId}, ${contact.name}, ${contact.phone_number || null}, ${contact.email || null}, ${contact.notes || null}, ${user.userId})
          RETURNING *
        `
        imported.push(result[0])
      }
    }

    return NextResponse.json({ imported, count: imported.length }, { status: 201 })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
