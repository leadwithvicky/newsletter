import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

let jwtLib: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  jwtLib = require('jsonwebtoken');
} catch (_) {
  jwtLib = null;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    if (!jwtLib) return NextResponse.json({ message: 'JWT library not available' }, { status: 500 });
    const token = jwtLib.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    return NextResponse.json({ token });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
