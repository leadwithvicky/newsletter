import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('image');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const origName = (file as File).name || 'upload';
    const ext = path.extname(origName) || '.bin';
    const base = path.basename(origName, ext);
    const filename = `${base.replace(/[^a-z0-9-_]/gi, '_')}-${Date.now()}${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    await fs.writeFile(fullPath, buffer);

    // Next.js serves files under /public at the root: /uploads/...
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: 'Upload failed', error: err.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Upload failed', error: 'Unknown error' }, { status: 500 });
  }
}
