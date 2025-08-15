import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Subscriber } from '../../../../../lib/newsletterBackend';
export const runtime = 'nodejs';

// GET for email links -> mark unsubscribed and return HTML (unchanged)
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    await connectDB();
    const subscriber = await Subscriber.findOne({ unsubscribeToken: params.token });
    if (!subscriber) {
      return new NextResponse('<h1>Invalid unsubscribe link</h1>', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }
    subscriber.status = 'unsubscribed';
    await subscriber.save();
    return new NextResponse('<h1>Successfully unsubscribed</h1>', { headers: { 'Content-Type': 'text/html' } });
  } catch (error: any) {
    return new NextResponse('<h1>Server error</h1>', { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}

// POST mark unsubscribed (unchanged)
export async function POST(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    await connectDB();
    const subscriber = await Subscriber.findOne({ unsubscribeToken: params.token });
    if (!subscriber) return NextResponse.json({ message: 'Invalid unsubscribe link' }, { status: 404 });
    subscriber.status = 'unsubscribed';
    await subscriber.save();
    return NextResponse.json({ message: 'Successfully unsubscribed' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// DELETE remove from DB (unchanged)
export async function DELETE(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    await connectDB();
    const deleted = await Subscriber.findOneAndDelete({ unsubscribeToken: params.token });
    if (!deleted) return NextResponse.json({ message: 'Invalid unsubscribe link' }, { status: 404 });
    return NextResponse.json({ message: 'You have been unsubscribed and removed from our mailing list.' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
