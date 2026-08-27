import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });

    const stories = await prisma.storyBanner.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: stories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });

    const { title, imageUrl, targetUrl, sortOrder, isActive } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ success: false, error: 'Başlık ve görsel zorunludur' }, { status: 400 });
    }

    const story = await prisma.storyBanner.create({
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl || '/',
        bannerType: 'STORY',
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: story });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });

    const { id, title, imageUrl, targetUrl, sortOrder, isActive } = await req.json();

    if (!id || !title || !imageUrl) {
      return NextResponse.json({ success: false, error: 'Eksik veri' }, { status: 400 });
    }

    const story = await prisma.storyBanner.update({
      where: { id },
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl || '/',
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: story });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID gerekli' }, { status: 400 });

    await prisma.storyBanner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Hikaye silindi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}