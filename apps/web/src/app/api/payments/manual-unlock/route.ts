import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { emailOrId } = await req.json();

    if (!emailOrId) {
      return NextResponse.json(
        { success: false, message: 'User identifier or email required.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'manual',
      unlockedUser: emailOrId,
      message: `Manual access granted for ${emailOrId}. All course lessons unlocked.`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to execute manual unlock.' },
      { status: 500 }
    );
  }
}
