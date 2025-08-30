import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const db = adminDb();
    
    // Check if code exists and is valid
    const codeDoc = await db
      .collection('testerCodes')
      .doc(code.toUpperCase())
      .get();
    
    if (!codeDoc.exists) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
    
    const codeData = codeDoc.data();
    const now = Timestamp.now();
    
    // Validate code constraints
    if (!codeData.isActive) {
      return NextResponse.json({ error: 'Code is inactive' }, { status: 400 });
    }

    if (codeData.maxRedemptions !== -1 && 
        codeData.currentRedemptions >= codeData.maxRedemptions) {
      return NextResponse.json({ error: 'Code has reached maximum redemptions' }, { status: 400 });
    }

    if (codeData.validUntil && codeData.validUntil.toMillis() < now.toMillis()) {
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
    }

    if (codeData.validFrom && codeData.validFrom.toMillis() > now.toMillis()) {
      return NextResponse.json({ error: 'Code is not yet valid' }, { status: 400 });
    }
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + codeData.accessDurationDays * 24 * 60 * 60 * 1000);
    const expiryTimestamp = Timestamp.fromDate(expiryDate);
    
    // Start transaction to update both user and code
    const batch = db.batch();
    
    // Update user
    const userRef = db.collection('users').doc(session.user.id);
    batch.update(userRef, {
      hasTesterAccess: true,
      testerCode: code.toUpperCase(),
      testerAccessExpiry: expiryTimestamp,
      updatedAt: Timestamp.now()
    });
    
    // Update code usage
    const codeRef = db.collection('testerCodes').doc(code.toUpperCase());
    batch.update(codeRef, {
      currentRedemptions: FieldValue.increment(1),
      redemptions: FieldValue.arrayUnion({
        userId: session.user.id,
        userEmail: session.user.email,
        redeemedAt: Timestamp.now()
      }),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      success: true,
      expiryDate: expiryDate.toISOString(),
      accessDurationDays: codeData.accessDurationDays
    });
  } catch (error) {
    console.error('Error validating tester code:', error);
    return NextResponse.json(
      { error: 'Failed to validate tester code' },
      { status: 500 }
    );
  }
}