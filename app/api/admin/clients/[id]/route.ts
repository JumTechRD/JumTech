import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware"
import { normalizeClientInput, serializeClient, type ClientRecord } from "@/lib/admin-clients"
import { validateEmail } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ id: string }>
}

async function findClient(id: string) {
  const [client] = await prisma.$queryRaw<ClientRecord[]>`
    SELECT * FROM "Client"
    WHERE "id" = ${id}
    LIMIT 1
  `
  return client || null
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const client = await findClient(id)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ client: serializeClient(client as ClientRecord) }, { status: 200 })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return updateClient(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return updateClient(request, context)
}

async function updateClient(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const existing = await findClient(id)
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const client = normalizeClientInput(body)

    if (!client.name || !client.email || !client.phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 })
    }

    if (!validateEmail(client.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const duplicate = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "Client"
      WHERE "id" <> ${id}
        AND (
          "email" = ${client.email}
          ${client.identification ? Prisma.sql`OR "identification" = ${client.identification}` : Prisma.empty}
        )
      LIMIT 1
    `

    if (duplicate.length > 0) {
      return NextResponse.json({ error: "A client with this email or identification already exists" }, { status: 409 })
    }

    const [updatedClient] = await prisma.$queryRaw<ClientRecord[]>`
      UPDATE "Client"
      SET
        "name" = ${client.name},
        "email" = ${client.email},
        "phone" = ${client.phone},
        "companyName" = ${client.companyName},
        "identification" = ${client.identification},
        "address" = ${client.address},
        "notes" = ${client.notes},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
      RETURNING *
    `

    return NextResponse.json({ client: serializeClient(updatedClient) }, { status: 200 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A client with this email or identification already exists" }, { status: 409 })
    }

    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const existing = await findClient(id)
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const deleted = await prisma.$queryRaw<ClientRecord[]>`
      DELETE FROM "Client"
      WHERE "id" = ${id}
      RETURNING *
    `

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
