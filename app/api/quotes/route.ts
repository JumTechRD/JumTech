import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware"
import { parsePublicQuoteSubmission, submitPublicQuote } from "@/lib/public-quote-submission"

// GET all quote requests (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const quotes = await prisma.quoteRequest.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(quotes, { status: 200 })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
  }
}

// POST create quote request (public)
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = parsePublicQuoteSubmission(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.message }, { status: 400 })
    }

    const result = await submitPublicQuote(body)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating quote request:", error)
    return NextResponse.json(
      { error: "Failed to create quote request" },
      { status: 500 },
    )
  }
}
