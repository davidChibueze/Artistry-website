import { type NextRequest, NextResponse } from 'next/server';
import { getMediaGallery } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'Photo';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '12', 10);

  try {
    const data = await getMediaGallery({ type, page, limit }, 0);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
