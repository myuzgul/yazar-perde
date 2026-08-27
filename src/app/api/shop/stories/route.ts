import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const stories = await prisma.storyBanner.findMany({
      where: { isActive: true, bannerType: 'STORY' },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: stories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}