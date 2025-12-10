import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { groupId, format } = await request.json()

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${groupId} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const groups = await sql`SELECT * FROM groups WHERE id = ${groupId}`
    const contacts = await sql`
      SELECT name, phone_number, email, notes FROM contacts WHERE group_id = ${groupId} ORDER BY name
    `

    if (groups.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const group = groups[0]

    if (format === "csv") {
      let csv = "Name,Phone,Email,Notes\n"
      contacts.forEach((contact: any) => {
        csv += `"${contact.name}","${contact.phone_number || ""}","${contact.email || ""}","${(contact.notes || "").replace(/"/g, '""')}"\n`
      })

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="contacts-${group.name}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      const json = {
        group: {
          name: group.name,
          description: group.description,
        },
        contacts,
        exportedAt: new Date().toISOString(),
      }

      return new NextResponse(JSON.stringify(json, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="contacts-${group.name}-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
