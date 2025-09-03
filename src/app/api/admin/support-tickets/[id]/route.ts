import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { UpdateTicketRequest } from "@/types/support";

const ADMIN_EMAILS = ["lamtomoki@gmail.com", "truedrju@gmail.com"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(session.user.email!);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const db = adminDb();
    const { id } = await params;
    const ticketDoc = await db
      .collection("supportTickets")
      .doc(id)
      .get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketDoc.id,
        ...ticketDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch support ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(session.user.email!);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body: UpdateTicketRequest = await request.json();
    const db = adminDb();
    const { id } = await params;
    const ticketRef = db.collection("supportTickets").doc(id);
    
    // Check if ticket exists
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Update status if provided
    if (body.status) {
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = body.status;
      
      // Set resolvedAt timestamp if status is resolved or closed
      if (body.status === "resolved" || body.status === "closed") {
        updateData.resolvedAt = FieldValue.serverTimestamp();
      }
    }

    // Update assignedTo if provided
    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo;
    }

    // Add response if provided
    if (body.response) {
      const responseData = {
        id: db.collection("_").doc().id, // Generate unique ID
        message: body.response.message,
        authorId: body.response.authorId || session.user.id,
        authorEmail: body.response.authorEmail || session.user.email,
        authorName: body.response.authorName || session.user.name,
        isAdmin: body.response.isAdmin !== undefined ? body.response.isAdmin : true,
        createdAt: FieldValue.serverTimestamp(),
      };

      updateData.responses = FieldValue.arrayUnion(responseData);
    }

    // Update the ticket
    await ticketRef.update(updateData);

    // Fetch updated ticket
    const updatedDoc = await ticketRef.get();

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: "Ticket updated successfully",
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update support ticket" },
      { status: 500 }
    );
  }
}