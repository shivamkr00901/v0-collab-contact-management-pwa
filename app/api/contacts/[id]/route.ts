import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { name, phone_number, email, notes } = await request.json()

    const contact = await sql`SELECT group_id FROM contacts WHERE id = ${params.id}`

    if (contact.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${contact[0].group_id} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const result = await sql`
      UPDATE contacts
      SET name = ${name}, phone_number = ${phone_number || null}, email = ${email || null}, notes = ${notes || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    return NextResponse.json({ contact: result[0] })
  } catch (error) {
    console.error("Update contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const contact = await sql`SELECT group_id FROM contacts WHERE id = ${params.id}`

    if (contact.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const member = await sql`
      SELECT id FROM group_members WHERE group_id = ${contact[0].group_id} AND user_id = ${user.userId}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`DELETE FROM contacts WHERE id = ${params.id}`

    return NextResponse.json({ message: "Contact deleted" })
  } catch (error) {
    console.error("Delete contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
