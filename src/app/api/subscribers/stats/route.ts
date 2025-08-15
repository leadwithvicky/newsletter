import { NextResponse } from 'next/server';
import { connectDB, Subscriber } from '../../../../lib/newsletterBackend';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();
    const total = await Subscriber.countDocuments();
    const active = await Subscriber.countDocuments({ status: 'active' });
    const unsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });
    const pending = await Subscriber.countDocuments({ status: 'pending' });
    return NextResponse.json({ total, active, unsubscribed, pending });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
