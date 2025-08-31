import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { CreateTicketRequest, TicketStatus } from "@/types/support";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateTicketRequest = await request.json();
    
    // Validate required fields
    if (!body.subject?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["bug", "feature_request", "account", "billing", "other"];
    
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Create the support ticket
    const ticketData = {
      subject: body.subject.trim(),
      description: body.description.trim(),
      category: body.category,
      status: "open" as TicketStatus,
      userId: body.userId || session.user.id,
      userEmail: body.userEmail || session.user.email,
      brandId: body.brandId || null,
      responses: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const db = adminDb();
    const docRef = await db
      .collection("supportTickets")
      .add(ticketData);

    return NextResponse.json({
      success: true,
      ticketId: docRef.id,
      message: "Support ticket created successfully",
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}