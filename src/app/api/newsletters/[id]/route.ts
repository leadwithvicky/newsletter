import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Newsletter, requireAuth } from '../../../../lib/newsletterBackend';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const n = await Newsletter.findById(params.id);
    if (!n) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(n);
  } catch (err) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req.headers);
    if (!auth.ok) return NextResponse.json({ message: auth.error.message }, { status: auth.error.status });

    await connectDB();
    const body = await req.json();
    const { title, description, content, author, imageUrl, date } = body;
    const updated = await Newsletter.findByIdAndUpdate(
      params.id,
      { title, description, content, author, imageUrl, date },
      { new: true }
    );
    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req.headers);
    if (!auth.ok) return NextResponse.json({ message: auth.error.message }, { status: auth.error.status });

    await connectDB();
    const deleted = await Newsletter.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
