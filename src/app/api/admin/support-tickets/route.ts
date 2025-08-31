import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { SupportTicket } from "@/types/support";

const ADMIN_EMAILS = ["lamtomoki@gmail.com", "truedrju@gmail.com"];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(session.user.email!) || session.user.isAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    // Build query
    const db = adminDb();
    let query = db.collection("supportTickets");
    
    if (status) {
      query = query.where("status", "==", status);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    // Order by creation date (newest first)
    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();
    
    const tickets: SupportTicket[] = [];
    snapshot.forEach((doc) => {
      tickets.push({
        id: doc.id,
        ...doc.data(),
      } as SupportTicket);
    });

    return NextResponse.json({
      success: true,
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}