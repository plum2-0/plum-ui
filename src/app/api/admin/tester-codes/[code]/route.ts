import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const db = adminDb();
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Adjust this based on your admin criteria
  return userData?.isAdmin === true || userData?.email?.includes('@plum.com');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
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

    const { isActive } = await request.json();
    const codeId = params.code;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    const db = adminDb();
    const codeRef = db.collection('testerCodes').doc(codeId);
    const codeDoc = await codeRef.get();

    if (!codeDoc.exists) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    await codeRef.update({
      isActive,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      code: codeId,
      isActive,
    });
  } catch (error) {
    console.error('Error updating tester code:', error);
    return NextResponse.json(
      { error: 'Failed to update tester code' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
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

    const codeId = params.code;
    const db = adminDb();
    
    const codeRef = db.collection('testerCodes').doc(codeId);
    const codeDoc = await codeRef.get();

    if (!codeDoc.exists) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    await codeRef.delete();

    return NextResponse.json({
      success: true,
      code: codeId,
    });
  } catch (error) {
    console.error('Error deleting tester code:', error);
    return NextResponse.json(
      { error: 'Failed to delete tester code' },
      { status: 500 }
    );
  }
}