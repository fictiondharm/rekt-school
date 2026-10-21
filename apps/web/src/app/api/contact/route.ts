import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Stores a support message from the contact page.
 *
 * The message is written to `contact_messages` with the service role key and
 * emailed to support through the Supabase database webhook configured on that
 * table, so nothing is silently lost when the database is unreachable.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'That email address does not look right.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('contact_messages').insert({
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
      status: 'new',
    });

    if (error) {
      console.warn('[contact] insert failed:', error.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Could not save that right now. Please email us directly.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error. Please email us directly.' },
      { status: 500 }
    );
  }
}
