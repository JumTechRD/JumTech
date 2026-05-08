import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware"
import { normalizeClientInput, serializeClient, type ClientRecord } from "@/lib/admin-clients"
import { validateEmail } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const clients = await prisma.$queryRaw<ClientRecord[]>`
      SELECT * FROM "Client"
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({ clients: clients.map(serializeClient) }, { status: 200 })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
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
      WHERE "email" = ${client.email}
      ${client.identification ? Prisma.sql`OR "identification" = ${client.identification}` : Prisma.empty}
      LIMIT 1
    `

    if (duplicate.length > 0) {
      return NextResponse.json({ error: "A client with this email or identification already exists" }, { status: 409 })
    }

    const [createdClient] = await prisma.$queryRaw<ClientRecord[]>`
      INSERT INTO "Client" (
        "id", "name", "email", "phone", "companyName", "identification", "address", "notes", "createdAt", "updatedAt"
      )
      VALUES (
        ${crypto.randomUUID()}, ${client.name}, ${client.email}, ${client.phone},
        ${client.companyName}, ${client.identification}, ${client.address}, ${client.notes}, ${new Date()}, ${new Date()}
      )
      RETURNING *
    `

    return NextResponse.json({ client: serializeClient(createdClient) }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A client with this email or identification already exists" }, { status: 409 })
    }

    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
