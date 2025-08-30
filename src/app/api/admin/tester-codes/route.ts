import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Check if user is admin (you may want to adjust this based on your admin criteria)
async function isAdmin(userId: string): Promise<boolean> {
  const db = adminDb();
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Hardcoded admin emails
  const adminEmails = ['lamtomoki@gmail.com', 'truedrju@gmail.com'];
  
  // Check if user has admin flag or is in the admin emails list
  return userData?.isAdmin === true || adminEmails.includes(userData?.email);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = adminDb();
    const codesSnapshot = await db
      .collection('testerCodes')
      .orderBy('createdAt', 'desc')
      .get();

    const codes = codesSnapshot.docs.map(doc => ({
      ...doc.data(),
      code: doc.id,
    }));

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('Error fetching tester codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tester codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { code, description, maxRedemptions, accessDurationDays } = await request.json();

    if (!code || !description) {
      return NextResponse.json(
        { error: 'Code and description are required' },
        { status: 400 }
      );
    }

    const db = adminDb();
    
    // Check if code already exists
    const existingCode = await db
      .collection('testerCodes')
      .doc(code.toUpperCase())
      .get();
    
    if (existingCode.exists) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const codeData = {
      description,
      isActive: true,
      maxRedemptions: maxRedemptions || 100,
      currentRedemptions: 0,
      validFrom: now,
      validUntil: null, // No expiry by default
      accessDurationDays: accessDurationDays || 30,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
      redemptions: [],
    };

    await db
      .collection('testerCodes')
      .doc(code.toUpperCase())
      .set(codeData);

    return NextResponse.json({
      success: true,
      code: code.toUpperCase(),
    });
  } catch (error) {
    console.error('Error creating tester code:', error);
    return NextResponse.json(
      { error: 'Failed to create tester code' },
      { status: 500 }
    );
  }
}