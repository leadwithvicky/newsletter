import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Newsletter, requireAuth } from '../../../../lib/newsletterBackend';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const n = await Newsletter.findById(id);
    if (!n) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(n);
  } catch {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(req.headers);
    if (!auth.ok) {
      const message = auth.error?.message || 'Unauthorized';
      const status = auth.error?.status || 401;
      return NextResponse.json({ message }, { status });
    }

    await connectDB();
    const body = await req.json();
    const { title, description, content, author, imageUrl, date } = body;
    const { id } = await params;
    const updated = await Newsletter.findByIdAndUpdate(
      id,
      { title, description, content, author, imageUrl, date },
      { new: true }
    );
    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(req.headers);
    if (!auth.ok) {
      const message = auth.error?.message || 'Unauthorized';
      const status = auth.error?.status || 401;
      return NextResponse.json({ message }, { status });
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Newsletter.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
