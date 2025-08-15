import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Newsletter, Subscriber, requireAuth, emailService } from '../../../lib/newsletterBackend';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();
    const newsletters = await Newsletter.find().sort({ date: -1 });
    return NextResponse.json(newsletters);
  } catch (err) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers);
    if (!auth.ok) return NextResponse.json({ message: auth.error.message }, { status: auth.error.status });

    await connectDB();
    const body = await req.json();
    const { title, description, content, author, imageUrl } = body;
    if (!title) return NextResponse.json({ message: 'Title is required' }, { status: 400 });

    const created = await Newsletter.create({ title, description, content, author, imageUrl });

    ;(async () => {
      try {
        const subscribers = await Subscriber.find({ status: 'active' }, { email: 1, unsubscribeToken: 1, name: 1 });
        if (subscribers.length > 0) {
          await emailService.sendNewsletter(created, subscribers);
        }
      } catch (e: any) {
        console.error('Email send error:', e.message);
      }
    })();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
